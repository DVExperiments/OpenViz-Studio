// V3.57: per-family value-label rules, editor modules, and opt-in scheduled refresh on the Team Server.
import assert from 'node:assert/strict';
import http from 'node:http';
import os from 'node:os';import path from 'node:path';import {mkdtempSync,rmSync,readFileSync,readdirSync} from 'node:fs';
import {labelRulesFor,labelPicker,labelPlacer,LABEL_FAMILIES} from '../src/labels.js';
import {buildChart} from '../src/charts.js';
import {createTeamServer} from '../server/openviz-server.mjs';
import {isPrivateAddress,fetchPublicText,refreshDataset} from '../server/scheduled-refresh.mjs';
import {refreshOnlySince,mergeServerRefresh} from '../src/team.js';

// ---- label rules ----
assert.deepEqual(labelRulesFor('line').map(r=>r[0]),['all','last','first-last','extremes','max']);
assert.ok(labelRulesFor('bar').some(r=>r[0]==='top3'));assert.equal(labelRulesFor('treemap'),null,'families without label rules get no rule picker');
assert.equal(LABEL_FAMILIES.hbar,'category');
const vals=[5,9,1,7,3];const pick=rule=>vals.map((_,i)=>labelPicker({labelRule:rule},vals)(i)).map(Number).join('');
assert.equal(pick('all'),'11111');assert.equal(pick('last'),'00001');assert.equal(pick('first-last'),'10001');
assert.equal(pick('extremes'),'01100');assert.equal(pick('max'),'01000');
assert.equal(pick('top3'),'11010');assert.equal(pick('bottom3'),'10101');
const place=labelPlacer({});assert.equal(place(100,100,'12,000',11,'middle'),true);assert.equal(place(102,101,'13,000',11,'middle'),false,'overlapping label is skipped');assert.equal(place(300,100,'14,000',11,'middle'),true);
const free=labelPlacer({labelAvoidOverlap:false});assert.equal(free(1,1,'x',11,'start'),true);assert.equal(free(1,1,'x',11,'start'),true);
const rows=Array.from({length:12},(_,i)=>({Month:`M${i+1}`,Sales:100+i*10+(i===5?80:0)}));
const count=svg=>(svg.match(/data-viz-part="value-label"|class="value-label"/g)||[]).length;
const cfg={x:'Month',y:'Sales',showLabels:true,title:'t'};
const allBar=buildChart(rows,{...cfg},'bar',{width:900,height:500}),topBar=buildChart(rows,{...cfg,labelRule:'top3'},'bar',{width:900,height:500});
assert.ok(count(allBar)>=10,`bar labels: ${count(allBar)}`);assert.equal(count(topBar),3,'top 3 rule keeps three bar labels');
const lastLine=buildChart(rows,{...cfg,labelRule:'last'},'line',{width:900,height:500});assert.equal(count(lastLine),1,'last-value rule on a line');
const crowd=Array.from({length:60},(_,i)=>({Day:`D${i}`,V:1000+i}));
const crowded=buildChart(crowd,{x:'Day',y:'V',showLabels:true},'line',{width:500,height:300}),uncapped=buildChart(crowd,{x:'Day',y:'V',showLabels:true,labelAvoidOverlap:false},'line',{width:500,height:300});
assert.ok(count(crowded)<count(uncapped),'collision avoidance drops overlapping labels');

// ---- editor modules: app.js imports them; no module reassigns app state directly ----
const appSrc=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const mods=readdirSync(new URL('../src/editor/',import.meta.url)).filter(f=>f.endsWith('.js'));
for(const m of ['team-ui.js','live-data-ui.js','brand-ui.js','chart-panels.js','map-library-ui.js','snapshot-export-ui.js']){assert.ok(mods.includes(m),m);assert.ok(appSrc.includes(`./editor/${m}`),`app.js imports ${m}`);}
assert.ok(appSrc.includes('bindEditorContext('));

// ---- SSRF guard ----
for(const ip of ['127.0.0.1','10.1.2.3','192.168.0.5','172.20.0.1','169.254.169.254','100.64.0.1','::1','fe80::1','fd00::1','::ffff:127.0.0.1','0.0.0.0'])assert.equal(isPrivateAddress(ip),true,ip);
for(const ip of ['8.8.8.8','142.250.72.14','2606:4700::1111'])assert.equal(isPrivateAddress(ip),false,ip);

// A local data source standing in for a published sheet.
let csv='Region,Sales\nNorth,10\nSouth,20\n';let hits=0;
const source=http.createServer((req,res)=>{hits++;if(req.url==='/redirect'){res.writeHead(302,{Location:'/data.csv'});return res.end();}if(req.url==='/page'){res.writeHead(200,{'Content-Type':'text/html'});return res.end('<!doctype html><html></html>');}res.writeHead(200,{'Content-Type':'text/csv'});res.end(csv);});
await new Promise(r=>source.listen(0,'127.0.0.1',r));const src=`http://127.0.0.1:${source.address().port}`;
await assert.rejects(fetchPublicText(src+'/data.csv'),/https/,'plain http refused by default');
await assert.rejects(fetchPublicText('https://127.0.0.1:1/data.csv'),/private or local/,'loopback refused by default');
await assert.rejects(fetchPublicText('https://localhost:1/data.csv'),/private or local/,'names resolving to loopback refused');
assert.match((await fetchPublicText(src+'/redirect',{allowPrivate:true})).text,/North/,'redirects followed');
const ds={id:'d1',name:'Live',rawRows:[{Region:'North',Sales:10},{Region:'South',Sales:20}],rows:[],calculations:[{name:'Double',expression:'[Sales]*2'}],liveSource:{url:src+'/data.csv',serverRefresh:true,interval:5}};
assert.equal(await refreshDataset(ds,{allowPrivate:true}),'unchanged');
csv='Region,Sales\nNorth,15\nSouth,20\nEast,5\n';assert.equal(await refreshDataset(ds,{allowPrivate:true}),'updated');assert.equal(ds.rawRows.length,3);assert.equal(ds.rows[0].Double,30,'calculations re-derived');
const page={...structuredClone(ds),liveSource:{url:src+'/page',serverRefresh:true}};assert.equal(await refreshDataset(page,{allowPrivate:true}),'error');assert.match(page.liveSource.lastError,/web page/);

// ---- Team Server: opt-in scheduled refresh ----
const off=createTeamServer({dataDir:mkdtempSync(path.join(os.tmpdir(),'ovoff-')),tokens:{A:'token-a-0123456789'}});assert.equal(off.refresher,null,'off by default');
const dataDir=mkdtempSync(path.join(os.tmpdir(),'ovrefresh-'));let clock=Date.now();
const {server,refresher}=createTeamServer({dataDir,tokens:{Aroha:'token-aroha-0123456789'},scheduledRefresh:true,refreshAllowPrivate:true,refreshClock:()=>clock,autoStartRefresh:false,log:()=>{}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const api=(p,{method='GET',body}={})=>fetch(base+p,{method,headers:{Authorization:'Bearer token-aroha-0123456789',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined}).then(async r=>({status:r.status,json:await r.json()}));
try{
 assert.equal((await api('/api/me')).json.scheduledRefresh,true);
 csv='Region,Sales\nNorth,10\nSouth,20\n';
 const opted={id:'live1',name:'Sheet',rawRows:[{Region:'North',Sales:10},{Region:'South',Sales:20}],rows:[{Region:'North',Sales:10},{Region:'South',Sales:20}],columns:['Region','Sales'],calculations:[],log:[],liveSource:{url:src+'/data.csv',interval:5,serverRefresh:true,lastFetched:new Date().toISOString()}};
 const notOpted={...structuredClone(opted),id:'live2',name:'Browser only',liveSource:{...opted.liveSource,serverRefresh:false,lastFetched:'2000-01-01T00:00:00Z'}};
 const project={name:'Live team',charts:[{id:'c1',datasetId:'live1'}],datasets:[opted,notOpted],slides:[]};
 assert.equal((await api('/api/projects/live-proj-1',{method:'PUT',body:{project,baseRevision:0}})).json.revision,1);
 // Not yet due → nothing fetched by the scheduler.
 hits=0;await refresher.tick();assert.equal(hits,0,'not due yet and non-opted datasets are skipped');
 // Data unchanged → no new revision.
 assert.equal((await api('/api/projects/live-proj-1/refresh',{method:'POST'})).json.revision,undefined);assert.equal((await api('/api/projects/live-proj-1')).json.revision,1);
 // Source changes → new revision by "Scheduled refresh"; human revision unchanged.
 csv='Region,Sales\nNorth,11\nSouth,25\n';
 const r=await api('/api/projects/live-proj-1/refresh',{method:'POST'});assert.equal(r.json.revision,2);
 const got=(await api('/api/projects/live-proj-1')).json;assert.equal(got.updatedBy,'Scheduled refresh');assert.equal(got.lastHumanRevision,1);
 assert.equal(got.project.datasets[0].rawRows[1].Sales,25);assert.deepEqual(got.project.datasets[1].rawRows,notOpted.rawRows,'opt-in only');
 assert.ok((await api('/api/activity')).json.some(e=>e.type==='refresh'&&e.revision===2));
 assert.equal((await api('/api/projects')).json.length,1,'history files are not listed as projects');
 // Due datasets are picked up by the scheduler on their own.
 csv='Region,Sales\nNorth,12\nSouth,25\n';const later=structuredClone(got.project);later.datasets[0].liveSource.lastFetched='2000-01-01T00:00:00Z';
 // A human save based on the refresh revision is accepted and resets lastHumanRevision.
 assert.equal((await api('/api/projects/live-proj-1',{method:'PUT',body:{project:later,baseRevision:2}})).json.revision,3);
 hits=0;await refresher.tick();assert.equal(hits,0,'retried no sooner than its interval');clock+=6*60000;await refresher.tick();const ticked=(await api('/api/projects/live-proj-1')).json;assert.equal(ticked.revision,4);assert.equal(ticked.lastHumanRevision,3);assert.equal(ticked.project.datasets[0].rawRows[0].Sales,12);
 // Columns removed → recorded as an error, rows kept for review.
 csv='Region\nNorth\n';await api('/api/projects/live-proj-1/refresh',{method:'POST'});const schema=(await api('/api/projects/live-proj-1')).json;
 assert.match(schema.project.datasets[0].liveSource.lastError,/columns changed/);assert.equal(schema.project.datasets[0].rawRows[0].Sales,12);
 // A stale client save gets a 409 that says the newer revisions are refresh-only.
 const stale=await api('/api/projects/live-proj-1',{method:'PUT',body:{project:later,baseRevision:3}});assert.equal(stale.status,409);assert.equal(stale.json.lastHumanRevision,3);
 assert.equal(refreshOnlySince(stale.json,3),true);assert.equal(refreshOnlySince({revision:6,lastHumanRevision:6},3),false);assert.equal(refreshOnlySince({revision:3,lastHumanRevision:3},3),false);
 // Client merge keeps local edits and takes only refreshed rows.
 const local=structuredClone(later);local.name='Locally renamed';local.charts[0].title='Edited title';
 const names=mergeServerRefresh(local,schema.project);assert.deepEqual(names,['Sheet']);assert.equal(local.name,'Locally renamed');assert.equal(local.charts[0].title,'Edited title');assert.equal(local.datasets[0].rawRows[0].Sales,12);assert.match(local.datasets[0].liveSource.lastError,/columns/);
 assert.deepEqual(local.datasets[1].rawRows,notOpted.rawRows);
 assert.equal((await api('/api/projects/live-proj-1',{method:'PUT',body:{project:local,baseRevision:stale.json.revision}})).status,200,'merged save succeeds');
 // Refresh endpoint is unavailable when the feature is off.
 await new Promise(r=>off.server.listen(0,'127.0.0.1',r));const offRes=await fetch(`http://127.0.0.1:${off.server.address().port}/api/projects/live-proj-1/refresh`,{method:'POST',headers:{Authorization:'Bearer token-a-0123456789'}});assert.equal(offRes.status,409);off.server.close();
 console.log('V3.57 labels, modules and scheduled refresh: all checks passed');
}finally{server.close();source.close();rmSync(dataDir,{recursive:true,force:true});rmSync(off.dataDir,{recursive:true,force:true});}
