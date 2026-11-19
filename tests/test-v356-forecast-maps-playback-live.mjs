// V3.56: forecasts with prediction intervals, k-means clustering, tile/hexbin/locator maps,
// playback for the newer families, live publications and the team client helpers.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {tQuantile,regressionForecast,kmeans} from '../src/stats.js';
import {buildChart,chartWarnings,DEFAULT_CHART,projectionModel} from '../src/charts.js';
import {PRO_TYPES,proTimeModel,tileModel,TILE_LAYOUTS} from '../src/pro-charts.js';
import {chartExample} from '../src/catalogue.js';
import {MAP_STARTERS,mapStarter} from '../src/map-library.js';
import {livePayload,liveHtml,liveFilterCandidates} from '../src/live-publish.js';
import {normalizeServerUrl,teamFetch,projectForUpload,safeProjectId} from '../src/team.js';

// ---- statistics ----
assert.ok(Math.abs(tQuantile(.975,10)-2.228)<.002);assert.ok(Math.abs(tQuantile(.95,5)-2.015)<.002);assert.ok(Math.abs(tQuantile(.975,1000)-1.962)<.003);
{const ys=[10,12,14,16,18,20,22,24];const f=regressionForecast(ys,{periods:2,level:95});assert.ok(Math.abs(f.values[0].y-26)<1e-9);assert.equal(f.values[0].lower,f.values[0].upper,'perfect fit has zero-width interval');
 const noisy=ys.map((v,i)=>v+(i%2?1.5:-1.5)),g=regressionForecast(noisy,{periods:3,level:80}),g95=regressionForecast(noisy,{periods:3,level:95});
 assert.ok(g.values.every(v=>v.lower<v.y&&v.y<v.upper));assert.ok(g95.values[0].upper-g95.values[0].lower>g.values[0].upper-g.values[0].lower,'95% wider than 80%');assert.ok(g.values[2].upper-g.values[2].lower>g.values[0].upper-g.values[0].lower,'uncertainty grows with horizon');
 const seasonal=Array.from({length:24},(_,i)=>50+i+(i%4===0?8:0)),s=regressionForecast(seasonal,{periods:4,season:4,level:80});assert.equal(s.season,4);assert.ok(s.r2>.99);assert.ok(Math.abs(s.values[0].y-(50+24+8))<1e-6,'seasonal peak reproduced');
 assert.equal(regressionForecast([1,2,3,4,5],{season:12}).season,0,'season ignored without two full cycles');assert.equal(regressionForecast([1,2],{}),null);}
{const pts=[];for(let i=0;i<60;i++){const c=i%3;pts.push({x:[0,10,20][c]+Math.sin(i)*1.5,y:[0,10,0][c]+Math.cos(i*1.3)*1.5});}
 const a=kmeans(pts,'auto'),b=kmeans(pts,'auto');assert.equal(a.k,3);assert.deepEqual(a.labels,b.labels,'seeded and repeatable');assert.ok(a.silhouette>.7);assert.equal(kmeans(pts,4).k,4);assert.equal(kmeans(pts.slice(0,3),3),null);
 const svg=buildChart(pts.map(p=>({X:p.x,Y:p.y})),{...DEFAULT_CHART,type:'scatter',x:'X',y:'Y',clusterK:'auto'},'scatter');assert.ok(svg.includes('data-viz-part="clusters"')&&svg.includes('Cluster 3 · n=20')&&svg.includes('not evidence of real categories'));
 const bub=buildChart(pts.map((p,i)=>({X:p.x,Y:p.y,S:1+i%5})),{...DEFAULT_CHART,type:'bubble',x:'X',y:'Y',bubbleSizeField:'S',clusterK:3},'bubble');assert.ok(bub.includes('data-viz-part="clusters"'));}
{const rows=Array.from({length:12},(_,i)=>({M:String(i+1),V:100+i*5+(i%2?4:-4)}));const svg=buildChart(rows,{...DEFAULT_CHART,type:'line',x:'M',y:'V',projectPeriods:4,projectInterval:90},'line');assert.ok(svg.includes('data-viz-part="forecast-interval"')&&svg.includes('90% prediction interval'));
 const m=projectionModel('line',rows.map(r=>({x:r.M,y:r.V})),{projectPeriods:2});assert.equal(m.level,80,'80% interval by default');assert.ok(!buildChart(rows,{...DEFAULT_CHART,type:'line',x:'M',y:'V',projectPeriods:3,projectInterval:0},'line').includes('forecast-interval'));}

// ---- maps ----
assert.equal(TILE_LAYOUTS['us-states'].tiles.length,51);assert.equal(TILE_LAYOUTS['nz-regions'].tiles.length,16);
assert.equal(new Set(TILE_LAYOUTS['us-states'].tiles.map(t=>t[2]+','+t[3])).size,51,'no overlapping US tiles');
{const e=chartExample('tile-map');for(const shape of ['square','hex'])for(const cls of ['continuous','5']){const svg=buildChart(e.rows,{...DEFAULT_CHART,...e,type:'tile-map',tileShape:shape,tileClasses:cls},'tile-map');assert.equal((svg.match(/data-viz-part="point"/g)||[]).length,51);assert.ok(!/NaN|undefined/.test(svg));}
 const nz=tileModel([{R:'Manawatu-Wanganui',V:1},{R:"Hawke's Bay",V:2},{R:'Narnia',V:3}],{x:'R',y:'V',tileLayout:'nz-regions',aggregation:'sum'});assert.deepEqual(nz.unmatched,['Narnia']);assert.equal(nz.tiles.filter(t=>t.value!==undefined).length,2);
 const custom=tileModel([{N:'A',R:0,C:0,V:1},{N:'B',R:0,C:1,V:2},{N:'C',R:1.5,C:0,V:3}],{x:'N',y:'V',tileLayout:'custom',lowerField:'R',upperField:'C',aggregation:'sum'});assert.equal(custom.tiles.length,2,'non-integer grid positions are rejected');
 assert.ok(chartWarnings([{R:'Narnia',V:1}],{...DEFAULT_CHART,type:'tile-map',x:'R',y:'V',tileLayout:'nz-regions'},'tile-map').some(w=>/not found/.test(w)));}
assert.equal(MAP_STARTERS.length,10);
{const loc=mapStarter('nz-locator'),svg=buildChart(loc.rows,{...DEFAULT_CHART,...loc.settings},'geo-symbol');assert.ok(svg.includes('Our head office'));
 const hex=mapStarter('nz-hexbin'),hsvg=buildChart(hex.rows,{...DEFAULT_CHART,...hex.settings},'geo-heat');assert.ok(hsvg.includes('data-viz-hexbin-layer'));const counted=[...hsvg.matchAll(/<title>(\d+) points?/g)].reduce((a,m)=>a+Number(m[1]),0);assert.equal(counted,hex.rows.length,'every point lands in exactly one hexagon');
 assert.ok(chartWarnings(hex.rows,{...DEFAULT_CHART,...hex.settings},'geo-heat').some(w=>/equal ground areas/.test(w)));}

// ---- playback for newer families ----
assert.equal(PRO_TYPES.size,31);
for(const t of PRO_TYPES){if(['number-ticker','countdown','quiz','poll','profile-cards','tree'].includes(t)){assert.equal(proTimeModel([],{proTimeField:'Period'},t),null);continue;}const ex=chartExample(t),rows=['2024','2025'].flatMap((P,k)=>ex.rows.map(r=>({...r,Period:P,...(typeof r[ex.y]==='number'?{[ex.y]:r[ex.y]*(1+k)}:{})})));const cfg={...DEFAULT_CHART,...ex,type:t,proTimeField:'Period'};
 const m=proTimeModel(rows,cfg,t);assert.deepEqual(m.periods,['2024','2025'],t);for(const i of [0,1]){const svg=buildChart(rows,{...cfg,proTimeIndex:i},t);assert.ok(svg.includes('data-pro-time')&&!/NaN/.test(svg),t);}}
{const ex=chartExample('lollipop'),rows=[0,1].flatMap(k=>ex.rows.map(r=>({...r,Score:r.Score*(1+k),P:String(k)})));const ticks=i=>[...buildChart(rows,{...DEFAULT_CHART,...ex,type:'lollipop',proTimeField:'P',proTimeIndex:i},'lollipop').matchAll(/data-viz-part="x-axis">(.*?)<\/g>/g)][0][1];assert.equal(ticks(0),ticks(1),'axis fixed across frames');}
assert.equal(proTimeModel([{a:1,P:'x'}],{proTimeField:'P'},'pie'),null);

// ---- live publications ----
{const rows=[];for(const Year of ['2024','2025'])for(const [Region,City] of [['North','Auckland'],['North','Whangārei'],['South','Dunedin']])rows.push({Year,Region,City,Product:City.length%2?'A':'B',Sales:100,Secret:'do-not-publish'});
 const project={datasets:[{id:'d1',rows,liveSource:{url:'https://example.org/s.csv',interval:5}}],charts:[{...DEFAULT_CHART,id:'c1',datasetId:'d1',type:'bar',x:'Region',y:'Sales',title:'A',drillLevel2:'City'},{...DEFAULT_CHART,id:'c2',datasetId:'d1',type:'pie',x:'Product',y:'Sales',title:'B'}],dashboards:[{id:'db',name:'Dash',chartIds:['c1','c2']}],brand:null};
 assert.ok(liveFilterCandidates(project,'dashboard','db').includes('Region'));
 const {payload}=livePayload(project,{kind:'dashboard',assetId:'db',filters:['Year']});assert.deepEqual(payload.charts[0].drillFields,['Region','City']);assert.ok(!('Secret' in payload.datasets.d1.rows[0]),'unused columns are not published');assert.equal(payload.datasets.d1.live.interval,5);
 assert.equal(livePayload(project,{kind:'dashboard',assetId:'db',keepLive:false}).payload.datasets.d1.live,null);
 assert.throws(()=>livePayload(project,{kind:'story',assetId:'x'}));
 const runtime=readFileSync(new URL('../src/dist/openviz-live.js',import.meta.url),'utf8');assert.ok(runtime.includes('OpenVizLive'));
 const html=liveHtml({...payload,title:'</script><script>alert(1)</script>'},runtime);assert.ok(!html.includes('</script><script>alert(1)'),'payload cannot break out of its script tag');assert.throws(()=>liveHtml(payload,'not a runtime'));}

// ---- team client ----
assert.equal(normalizeServerUrl('localhost:8787'),'https://localhost:8787');assert.equal(normalizeServerUrl('http://127.0.0.1:8787/app/'),'http://127.0.0.1:8787');assert.equal(normalizeServerUrl('http://192.168.1.20:8787'),'http://192.168.1.20:8787');
for(const bad of ['','http://charts.example.org','https://u:p@x.org'])assert.throws(()=>normalizeServerUrl(bad),undefined,bad);
await assert.rejects(teamFetch(null,'/api/me'),/Connect a Team Server/);
await assert.rejects(teamFetch({url:'https://x',token:'t'},'/api/me',{fetchImpl:async()=>({ok:false,status:409,json:async()=>({revision:3})})}),e=>e.status===409&&e.data.revision===3);
await assert.rejects(teamFetch({url:'https://x',token:'t'},'/api/me',{fetchImpl:async()=>{throw new TypeError('x');}}),/Could not reach/);
assert.equal((await teamFetch({url:'https://x',token:'t'},'/api/me',{fetchImpl:async(u,o)=>({ok:true,status:200,json:async()=>({auth:o.headers.Authorization})})})).auth,'Bearer t');
{const p=projectForUpload({id:'p',team:{id:'x'},_storageRevision:4,charts:[]});assert.ok(!('team' in p)&&!('_storageRevision' in p));assert.match(safeProjectId('project-abc/../x'),/^[A-Za-z0-9_-]{6,64}$/);}
console.log('PASS V3.56 forecasts, clustering, tile/hexbin/locator maps, playback, live publications and team client');
