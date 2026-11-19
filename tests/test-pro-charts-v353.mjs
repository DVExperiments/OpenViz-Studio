// V3.53: 24 new chart families, reference/trend lines and round manual ticks.
import assert from 'node:assert/strict';
import {buildChart,chartWarnings,chartData,DEFAULT_CHART,CHARTS,linearFit} from '../src/charts.js';
import {PRO_TYPES,PRO_META,PRO_OPTIONS,proData,proFieldSpecs,niceScale,orderKeys} from '../src/pro-charts.js';
import {CATALOGUE,chartExample} from '../src/catalogue.js';
import {fieldSpecs,mappingIssues,proposeMappings,usesAggregation} from '../src/data-contracts.js';

assert.equal(PRO_TYPES.size,31);
assert.equal(CATALOGUE.length,79);
assert.equal(CATALOGUE.filter(c=>c.status!=='available').length,0,'candlestick is no longer planned');
for(const type of PRO_TYPES){
 assert.ok(CHARTS[type],`${type} registered in CHARTS`);
 const ex=chartExample(type);assert.ok(ex&&ex.rows.length,`${type} has an example`);
 const cfg={...DEFAULT_CHART,...ex,type};
 assert.deepEqual(mappingIssues(cfg,{rows:ex.rows}),[],`${type} example satisfies its field contract`);
 const svg=buildChart(ex.rows,cfg,type,{width:760,height:460});
 assert.ok(svg.startsWith('<svg'),type);assert.ok(svg.includes('data-viz-part="point"'),`${type} draws inspectable marks`);
 assert.ok(!/NaN|undefined|Infinity/.test(svg),`${type} has no invalid numbers or undefined text`);
 assert.ok(chartData(ex.rows,cfg,type).length>0,`${type} reports data`);
 assert.ok(Array.isArray(chartWarnings(ex.rows,cfg,type)));
 // Narrow/mobile and dark rendering must not throw.
 buildChart(ex.rows,{...cfg,background:'#111827',textColor:'#f3f4f6'},type,{width:360,height:300});
 // Every option value renders.
 for(const o of PRO_OPTIONS[type]||[]){const values=o.kind==='select'?o.options.map(v=>v[0]):o.kind==='check'?[true,false]:[o.def===''?'':o.min??o.def,o.max??o.def];for(const v of values)assert.ok(buildChart(ex.rows,{...cfg,[o.key]:v},type).startsWith('<svg'),`${type} ${o.key}=${v}`);}
 // Empty and unmapped data produce a disclosed empty state rather than a crash.
 assert.ok(buildChart([],cfg,type).includes('No compatible data'));
 assert.ok(chartWarnings(ex.rows,{...cfg,x:'missing',y:'missing'},type).length>0);
}
// Proposals find fields for the new contracts from column names.
const proposal=proposeMappings({type:'candlestick'},{id:'d',rows:chartExample('candlestick').rows});
assert.equal(proposal.draft.lowerField,'Low');assert.equal(proposal.draft.upperField,'High');
assert.ok(usesAggregation('pie')&&!usesAggregation('beeswarm')&&!usesAggregation('candlestick'));

// Waffle: largest-remainder rounding always yields exactly 100 squares.
{const rows=[{c:'A',v:1},{c:'B',v:1},{c:'C',v:1}];const svg=buildChart(rows,{...DEFAULT_CHART,type:'waffle',x:'c',y:'v'},'waffle');assert.equal((svg.match(/<rect x="[^"]+" y="[^"]+" width="[^"]+" height="[^"]+" rx="[^"]+" fill="#/g)||[]).length-3,100);}
// Pie: negative values excluded and disclosed.
{const rows=[{c:'A',v:5},{c:'B',v:-2}];assert.equal(proData(rows,{x:'c',y:'v',aggregation:'sum'},'pie').length,1);assert.ok(chartWarnings(rows,{...DEFAULT_CHART,type:'pie',x:'c',y:'v'},'pie').some(w=>/Negative/.test(w)));}
// Bump: ties share a rank (competition ranking) and missing periods leave gaps.
{const rows=[{p:'1',e:'A',v:10},{p:'1',e:'B',v:10},{p:'1',e:'C',v:5},{p:'2',e:'A',v:3},{p:'2',e:'C',v:9}];const svg=buildChart(rows,{...DEFAULT_CHART,type:'bump',x:'p',seriesField:'e',y:'v'},'bump');assert.ok(svg.includes('B: 1 #1 (10) · 2 –'));assert.ok(svg.includes('C: 1 #3 (5) · 2 #1 (9)'));}
// Parliament: one dot per rounded seat.
{const rows=[{p:'X',s:10.4},{p:'Y',s:7}];const svg=buildChart(rows,{...DEFAULT_CHART,type:'parliament',x:'p',y:'s'},'parliament');const dots=(svg.match(/<circle cx="[^"]+" cy="[^"]+" r="[^"]+" fill="#[0-9a-f]{6}"\/>/gi)||[]).length;assert.equal(dots-2,17);assert.ok(chartWarnings(rows,{...DEFAULT_CHART,type:'parliament',x:'p',y:'s'},'parliament').some(w=>/rounded/.test(w)));}
// Candlestick: rows whose low/high contradict open/close are excluded and disclosed.
{const rows=[{d:'2026-01-01',o:10,c:12,l:9,h:13},{d:'2026-01-02',o:12,c:11,l:12.5,h:13}];const cfg={...DEFAULT_CHART,type:'candlestick',x:'d',y:'o',endField:'c',lowerField:'l',upperField:'h'};assert.equal(chartData(rows,cfg,'candlestick').length,1);assert.ok(chartWarnings(rows,cfg,'candlestick').some(w=>/excluded/.test(w)));}
// Chord/arc: unweighted edges count rows; non-positive weights are excluded.
{const rows=[{a:'X',b:'Y',w:2},{a:'Y',b:'X',w:0},{a:'X',b:'Z',w:1}];const cfg={...DEFAULT_CHART,type:'chord',x:'a',seriesField:'b',y:'w'};assert.equal(chartData(rows,cfg,'chord').length,2);assert.ok(chartWarnings(rows,cfg,'chord').some(w=>/excluded/.test(w)));}
// Ordering helpers and scales.
assert.deepEqual(orderKeys(['10','2','1']),['1','2','10']);assert.deepEqual(orderKeys(['2026-03','2026-01']),['2026-01','2026-03']);assert.deepEqual(orderKeys(['b','a']),['b','a']);
assert.deepEqual(niceScale(0,87,5).ticks,[0,25,50,75,100]);

// Reference lines, trend lines and round manual ticks on core charts.
{const rows=[{Year:'2021',Revenue:60},{Year:'2022',Revenue:90},{Year:'2023',Revenue:120}];
 const svg=buildChart(rows,{...DEFAULT_CHART,yMin:0,yMax:150,refLineMode:'average'},'bar');
 assert.ok(svg.includes('data-viz-part="reference-line"')&&svg.includes('Average: 90'));
 const ticks=[...svg.matchAll(/data-viz-part="y-axis"><title>([^<]+)<\/title>/g)].map(m=>m[1]);assert.deepEqual(ticks,['0','50','100','150']);
 assert.ok(buildChart(rows,{...DEFAULT_CHART,refLineMode:'value',refLineValue:100,refLineLabel:'Target'},'hbar').includes('Target: 100'));
 assert.ok(!buildChart(rows,{...DEFAULT_CHART,refLineMode:'value',refLineValue:9999},'bar').includes('reference-line'),'out-of-range reference lines are not drawn');}
{const fit=linearFit([{x:1,y:2},{x:2,y:4},{x:3,y:6}]);assert.equal(fit.slope,2);assert.equal(fit.intercept,0);assert.equal(fit.r2,1);assert.equal(linearFit([{x:1,y:1},{x:2,y:2}]),null);
 const svg=buildChart([{a:1,b:2},{a:2,b:3.5},{a:3,b:3.9},{a:4,b:6}],{...DEFAULT_CHART,x:'a',y:'b',showTrendline:true},'scatter');assert.ok(/Linear trend · R² = 0\.\d\d/.test(svg));}
console.log('PASS V3.53 pro charts: 24 families render, contracts, data rules, reference/trend lines and nice ticks');
