import assert from 'node:assert/strict';
import {EXPANDED_META,EXPANDED_TYPES,SERIES_TYPES,EXPERIMENTAL_TYPES,seriesModel,evidenceModel,changeModel} from '../src/expanded-charts.js';
import {CHARTS,DEFAULT_CHART,buildChart,chartData,chartWarnings} from '../src/charts.js';
import {CATALOGUE,chartExample} from '../src/catalogue.js';
import {mappingIssues,proposeMappings,alternativeHint} from '../src/data-contracts.js';
import {createPublication} from '../src/publishing.js';
import {makeInteractiveHtml,pptxChartMode,importProjectFile} from '../src/exports.js';
import {chartCanSelect,markCategory} from '../src/dashboard-links.js';
import {compareSuitability} from '../src/advisor.js';
assert.equal(EXPANDED_TYPES.size,18);assert.equal(EXPERIMENTAL_TYPES.size,3);assert.equal(Object.keys(CHARTS).length,79);assert.equal(CATALOGUE.filter(t=>t.status==='available').length,79);
const rows=[{X:'A',Group:'North',V:10},{X:'A',Group:'North',V:20},{X:'A',Group:'South',V:5},{X:'B',Group:'North',V:-4},{X:'B',Group:'South',V:9},{X:'B',Group:'South',V:null},{X:'B',Group:'South',V:''}];
let c={...DEFAULT_CHART,type:'grouped-bar',x:'X',y:'V',seriesField:'Group'};
assert.equal(seriesModel(rows,c).cells.get('["A","North"]').value,30);
assert.equal(seriesModel(rows,{...c,aggregation:'average'}).cells.get('["A","North"]').value,15);
assert.equal(seriesModel(rows,{...c,aggregation:'count'}).cells.get('["B","South"]').value,3);
assert.equal(seriesModel(rows,{...c,aggregation:'min'}).cells.get('["A","North"]').value,10);
assert.equal(seriesModel(rows,c).skipped,2);
const positive=[{X:'A',Group:'N',V:20},{X:'A',Group:'S',V:30},{X:'B',Group:'N',V:0},{X:'B',Group:'S',V:0}];
const percent=buildChart(positive,{...c,type:'percent-bar',showLegend:true});assert(percent.includes('40.0%'));assert(percent.includes('60.0%'));assert(percent.includes('No total'));
assert(buildChart(rows,{...c,type:'percent-bar'}).includes('Negative values:'));assert(chartWarnings(rows,{...c,type:'percent-bar'}).some(w=>w.includes('nonnegative')));
const evidenceRows=[0,1,2,3,4].map(V=>({X:'A',V})).concat([{X:'A',V:null}]);const e=evidenceModel(evidenceRows,{...c,type:'evidence-lanes'}).groups[0];assert.deepEqual([e.low,e.q1,e.y,e.q3,e.high,e.n],[0,1,2,3,4,5]);
const changeRows=[{X:'A',Before:10,After:20},{X:'A',Before:20,After:30},{X:'A',Before:999,After:null},{X:'B',Before:0,After:5}];const change=changeModel(changeRows,{...c,y:'Before',endField:'After',aggregation:'average'});assert.deepEqual([change.groups[0].before,change.groups[0].after,change.groups[0].y,change.groups[0].n],[15,25,10,2]);assert.equal(change.skipped,1);
for(const type of ['grouped-bar','stacked-hbar','percent-bar','stacked-area']){const huge=buildChart([{X:'A',Group:'N',V:1.79e308},{X:'A',Group:'S',V:1.79e308}],{...c,type});assert(!/NaN|Infinity/.test(huge),type+' safe huge values');}
const overflows=buildChart([{X:'A',Group:'N',V:1e308},{X:'A',Group:'N',V:1e308}],c);assert(!/="(?:NaN|Infinity)/.test(overflows));assert(overflows.includes('safe display range'));
for(const type of EXPANDED_TYPES){
 const ex=chartExample(type),cfg={...DEFAULT_CHART,...ex,type,id:'c',datasetId:'ds',showLegend:true},before=JSON.stringify(ex.rows),ds={id:'ds',rows:ex.rows};
 assert.equal(mappingIssues(cfg,ds).length,0,type+' contract');assert(alternativeHint(cfg,ex.rows).length>10);assert.equal(mappingIssues(proposeMappings(cfg,{...ds,id:'other'}).draft,ds).length,0,type+' preserved switch');
 assert(compareSuitability(type,ex.rows,cfg).compatible,type+' comparison compatibility');
 const svg=buildChart(ex.rows,cfg);assert(svg.includes('data-viz-part="point"'),type+' marks');assert(!/NaN|Infinity/.test(svg),type+' finite');assert(svg.includes('data-viz-chart-type="'+type+'"'));assert.equal(pptxChartMode(cfg,{cropToContent:false},chartData(ex.rows,cfg)),'vector');
 const html=makeInteractiveHtml(ex.rows,cfg);assert(['bar-race','line-race'].includes(type)?html.includes('data-race-play'):html.includes('<select id='),type+' standalone controls');
 const project={id:'p',name:'Expansions',datasets:[{id:'ds',name:'Examples',rows:ex.rows}],charts:[cfg],dashboards:[{id:'d',name:'D',chartIds:['c'],mode:'grid'}],slides:[],versions:[],stories:[]};
 for(const kind of ['chart','dashboard'])for(const interactive of [false,true]){const pub=createPublication(project,{kind,assetId:kind==='chart'?'c':'d',interactive,preset:'responsive'});assert(pub.html.includes('<svg'),type+' '+kind+' export');assert(!/NaN|Infinity/.test(pub.html));}
 const imported=await importProjectFile({name:'project.json',size:5000,text:async()=>JSON.stringify(project)});assert.equal(imported.charts[0].type,type);
 assert.equal(chartCanSelect(cfg,cfg.x),!['calendar-heatmap','bar-race','line-race'].includes(type),type+' dashboard linkage');const key=(SERIES_TYPES.has(type)||type==='likert'||type==='interval-plot')?JSON.stringify([String(ex.rows[0][cfg.x]),type==='interval-plot'?0:String(ex.rows[0][cfg.seriesField])]):String(ex.rows[0][cfg.x]);if(!['calendar-heatmap','bar-race','line-race'].includes(type))assert.equal(markCategory(cfg,cfg.x,key,ex.rows),String(ex.rows[0][cfg.x]));
 assert.equal(JSON.stringify(ex.rows),before,type+' immutable source');
}
const sampled=Array.from({length:1000},(_,V)=>({X:'A',V}));assert(chartWarnings(sampled,{...c,type:'evidence-lanes'}).some(w=>w.includes('180')));assert.equal(evidenceModel(sampled,c).groups[0].n,1000);
const unsafe=buildChart([{X:'<img src=x onerror=alert(1)>',Group:'<script>x</script>',V:5}],{...c,showLegend:true});assert(!unsafe.includes('<script>'));assert(!unsafe.includes('<img src='));assert(unsafe.includes('&lt;'));
const large=Array.from({length:100000},(_,i)=>({X:i%40,Group:'G'+(i%7),V:i%100})),start=performance.now();const model=seriesModel(large,c);assert(model.cells.size<=280);assert.equal([...model.cells.values()].reduce((n,v)=>n+v.count,0),100000);console.log('100k-row series engine ms:',Math.round(performance.now()-start));
console.log('PASS 18 expanded templates: model arithmetic, missing/zero/negative data, quantiles/paired deltas, contracts, comparison, category linking, chart/dashboard HTML, vector fallback, persistence, escaping and 100k-row accounting');
