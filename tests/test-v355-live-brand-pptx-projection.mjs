// V3.55: live data links, organisation themes on tables/dashboards/slides/flows, native PPTX pie/combo, line projections.
import assert from 'node:assert/strict';
import {resolveSourceUrl,fetchLiveSource,guessFormat,liveDue,sameSchema,describeSource} from '../src/live-data.js';
import {brandExample,applyBrand,brandSlideTokens,brandHtmlHeader,brandHtmlFooter} from '../src/brand.js';
import {editorialTableMarkup,editorialTableSvg,editorialTableExample} from '../src/editorial-table.js';
import {makeDashboardInteractiveHtml} from '../src/dashboard-interactive.js';
import {buildChart,DEFAULT_CHART,projectionModel} from '../src/charts.js';
import {chartExample} from '../src/catalogue.js';
import {comboSeries} from '../src/pro-charts.js';
import {pptxChartMode} from '../src/exports.js';

// ---- live links ----
assert.match(resolveSourceUrl('https://docs.google.com/spreadsheets/d/AbC_123/edit#gid=42').url,/\/spreadsheets\/d\/AbC_123\/gviz\/tq\?tqx=out:csv&gid=42$/);
assert.match(resolveSourceUrl('https://docs.google.com/spreadsheets/d/e/2PACX-xyz/pubhtml').url,/\/d\/e\/2PACX-xyz\/pub\?output=csv$/);
assert.equal(resolveSourceUrl('https://github.com/org/repo/blob/main/data/x.csv').url,'https://raw.githubusercontent.com/org/repo/main/data/x.csv');
assert.match(resolveSourceUrl('https://www.dropbox.com/s/abc/file.csv?dl=0').url,/dl=1/);
assert.equal(resolveSourceUrl('example.org/data.csv').url,'https://example.org/data.csv');
assert.equal(resolveSourceUrl('http://localhost:8766/a.csv').url,'http://localhost:8766/a.csv');
for(const bad of ['','http://example.org/a.csv','javascript:alert(1)','https://user:pw@example.org/a.csv','ftp://x/y','not a url at all'])assert.throws(()=>resolveSourceUrl(bad),undefined,bad);
assert.equal(guessFormat('https://x/a.json','',''),'json');assert.equal(guessFormat('https://x/a','text/csv','a,b'),'csv');assert.equal(guessFormat('https://x/a','','[{"a":1}]'),'json');assert.equal(guessFormat('https://x/a','text/html','<!doctype html><html>'),'html');
const mock=(body,{status=200,type='text/csv',length}={})=>async()=>({ok:status>=200&&status<300,status,headers:{get:k=>k==='content-type'?type:k==='content-length'?(length??String(body.length)):null},text:async()=>body});
{const r=await fetchLiveSource('https://example.org/sales.csv',{fetchImpl:mock('a,b\n1,2')});assert.equal(r.format,'csv');assert.equal(r.name,'sales');assert.ok(r.fetchedAt);}
await assert.rejects(fetchLiveSource('https://example.org/page',{fetchImpl:mock('<!doctype html><html></html>',{type:'text/html'})}),/web page/);
await assert.rejects(fetchLiveSource('https://example.org/a.csv',{fetchImpl:mock('x',{status:403})}),/Access denied/);
await assert.rejects(fetchLiveSource('https://example.org/a.csv',{fetchImpl:mock('x',{status:500})}),/HTTP 500/);
await assert.rejects(fetchLiveSource('https://example.org/a.csv',{fetchImpl:mock('x',{length:String(30*1024*1024)})}),/20 MB/);
await assert.rejects(fetchLiveSource('https://example.org/a.csv',{fetchImpl:async()=>{throw new TypeError('Failed to fetch');}}),/CORS/);
await assert.rejects(fetchLiveSource('https://example.org/a.csv',{timeoutMs:20,fetchImpl:(u,o)=>new Promise((_,rej)=>o.signal.addEventListener('abort',()=>rej(new Error('aborted'))))}),/20 seconds/);
assert.equal(liveDue({interval:0,lastFetched:'2020-01-01'}),false);assert.equal(liveDue({interval:5,lastFetched:new Date(Date.now()-6*60000).toISOString()}),true);assert.equal(liveDue({interval:5,lastFetched:new Date().toISOString()}),false);
assert.equal(sameSchema([{a:1,b:2}],[{a:3,b:4,c:5}]),true);assert.equal(sameSchema([{a:1,b:2}],[{a:3}]),false);
assert.match(describeSource({kind:'Google Sheet',interval:5,lastFetched:new Date().toISOString()}),/Every 5 minutes/);

// ---- themes everywhere ----
const b=brandExample();b.logo={dataUri:'data:image/png;base64,iVBORw0KGgo=',aspect:3,height:24,position:'right'};
{const ex=editorialTableExample(),c=applyBrand({...DEFAULT_CHART,...ex,type:'editorial-table'},b);const html=editorialTableMarkup(ex.rows,c);assert.ok(html.includes('ov-brand-foot')&&html.includes('Harbour Analytics')&&html.includes('--et-font:Georgia'));assert.ok(editorialTableSvg(ex.rows,c).includes('brand-footer'));
 assert.ok(!editorialTableMarkup(ex.rows,{...c,font:'x;background:url(evil)'}).includes('evil'),'unsafe table font rejected');}
{const cards=['bar','pie'].map(t=>{const e=chartExample(t);return {chart:applyBrand({...DEFAULT_CHART,...e,type:t,title:t,id:t},b),rows:e.rows,item:{}};});const html=makeDashboardInteractiveHtml({name:'Board',brand:b},cards,'');assert.ok(html.includes('class="ov-brand-head"')&&html.includes('class="ov-brand-foot"'));assert.equal((html.match(/data-viz-part="brand-footer"/g)||[]).length,0,'one dashboard footer instead of one per card');
 const plain=makeDashboardInteractiveHtml({name:'Board'},cards,'');assert.ok(!plain.includes('class="ov-brand-head"'));}
{const sk=chartExample('sankey');const svg=buildChart(sk.rows,applyBrand({...DEFAULT_CHART,...sk,type:'sankey'},b),'sankey');assert.ok(b.palette.slice(0,3).some(c=>svg.includes(c)),'flow diagrams use the theme palette');assert.ok(!buildChart(sk.rows,{...DEFAULT_CHART,...sk,type:'sankey'},'sankey').includes(b.palette[0]),'palette does not leak into unbranded charts');}
{const t=brandSlideTokens(b);assert.equal(t.accent,b.palette[0]);assert.equal(t.font,'Georgia, serif');assert.equal(brandHtmlHeader({}),'');assert.equal(brandHtmlFooter(null),'');assert.ok(!brandHtmlFooter({byline:'<script>'}).includes('<script>'));}

// ---- native PowerPoint eligibility and combo series ----
{const e=chartExample('combo'),cfg={...DEFAULT_CHART,...e,type:'combo'},cs=comboSeries(e.rows,cfg);assert.equal(cs.labels.length,12);assert.equal(cs.columns.length,12);assert.equal(cs.line.length,12);assert.equal(cs.dual,true);
 assert.equal(pptxChartMode(cfg,{pptxMode:'editable'},[{x:'a',y:1}]),'native');assert.equal(pptxChartMode({...cfg,type:'pie'},{pptxMode:'editable'},[{x:'a',y:1}]),'native');assert.equal(pptxChartMode({...cfg,type:'radar'},{pptxMode:'editable'},[{x:'a',y:1}]),'vector');
 const gap=comboSeries([{m:'Jan',a:1,b:2},{m:'Feb',a:3}],{x:'m',y:'a',endField:'b'});assert.deepEqual(gap.line,[2,null],'missing line values stay gaps');}

// ---- projection ----
{const rows=[2019,2020,2021,2022,2023,2024].map((Year,i)=>({Year:String(Year),Sales:50+i*10}));const pts=rows.map(r=>({x:r.Year,y:r.Sales}));
 const m=projectionModel('line',pts,{projectPeriods:3});assert.deepEqual(m.values.map(v=>v.label),['2025','2026','2027']);assert.deepEqual(m.values.map(v=>Math.round(v.y)),[110,120,130]);assert.equal(m.fit.r2,1);
 assert.deepEqual(projectionModel('line',[{x:'Q1',y:1},{x:'Q2',y:2},{x:'Q3',y:3}],{projectPeriods:2}).values.map(v=>v.label),['+1','+2']);
 assert.equal(projectionModel('line',pts.slice(0,2),{projectPeriods:2}),null);assert.equal(projectionModel('bar',pts,{projectPeriods:2}),null);assert.equal(projectionModel('line',pts,{projectPeriods:0}),null);
 assert.equal(projectionModel('line',pts,{projectPeriods:99}).n,24);assert.equal(projectionModel('line',pts,{projectPeriods:2,projectWindow:3}).window,3);
 const svg=buildChart(rows,{...DEFAULT_CHART,type:'line',x:'Year',y:'Sales',projectPeriods:2},'line');assert.ok(svg.includes('data-viz-part="projection"')&&(svg.includes('not a forecast')||svg.includes('prediction interval'))&&svg.includes('>2026<'));assert.ok(!/NaN/.test(svg));
 assert.ok(!buildChart(rows,{...DEFAULT_CHART,type:'line',x:'Year',y:'Sales'},'line').includes('projection'),'off by default');}
console.log('PASS V3.55 live links, themes everywhere, native PPTX pie/combo and projections');
