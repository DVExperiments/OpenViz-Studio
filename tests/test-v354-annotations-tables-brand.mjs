// V3.54: data-anchored highlights/callouts, table sparklines and organisation theme packages.
import assert from 'node:assert/strict';
import {buildChart,DEFAULT_CHART,highlightList,HIGHLIGHT_TYPES} from '../src/charts.js';
import {tableModel,editorialTableMarkup,editorialTableSvg,editorialTableExample,sparklineSvg} from '../src/editorial-table.js';
import {normalizeBrand,applyBrand,removeBrand,brandPackageJson,brandFooterHeight,brandExample,normalizeLogo} from '../src/brand.js';
import {chartExample} from '../src/catalogue.js';

// ---- highlights & callouts ----
const rows=[{Year:'2019',V:40},{Year:'2020',V:22},{Year:'2021',V:35},{Year:'2022',V:60},{Year:'2023',V:72}];
const hl=[{id:'a',kind:'category-band',from:'2020',to:'2021',label:'Pandemic'},{id:'b',kind:'value-band',from:50,to:80,label:'Target zone'},{id:'c',kind:'callout',target:'2023',text:'Record year'}];
for(const t of HIGHLIGHT_TYPES){const ex=t==='bubble'?{x:'Year',y:'V',bubbleSizeField:'V'}:{x:'Year',y:'V'};const svg=buildChart(rows,{...DEFAULT_CHART,...ex,type:t,highlights:hl},t);
 assert.equal((svg.match(/data-viz-part="highlight"/g)||[]).length,2,`${t} draws two bands`);assert.equal((svg.match(/data-viz-part="callout"/g)||[]).length,1,`${t} draws a callout`);assert.ok(!/NaN|undefined/.test(svg),t);
 assert.ok(svg.indexOf('data-viz-part="highlight"')<svg.indexOf('data-viz-part="point"'),`${t} bands sit behind marks`);}
{const svg=buildChart(rows,{...DEFAULT_CHART,type:'bar',x:'Year',y:'V',highlights:[{id:'x',kind:'category-band',from:'missing'},{id:'y',kind:'value-band'},{id:'z',kind:'callout',target:'nope'},{id:'h',kind:'value-band',from:1,to:2,hidden:true},{kind:'script'}]},'bar');assert.ok(!svg.includes('data-viz-part="highlight"')&&!svg.includes('data-viz-part="callout"'),'invalid or hidden highlights are skipped');}
{const svg=buildChart(rows,{...DEFAULT_CHART,type:'line',x:'Year',y:'V',highlights:[{id:'q',kind:'value-band',from:'<script>',to:50,label:'<b>x</b>'}]},'line');assert.ok(!svg.includes('<b>x</b>')&&svg.includes('&lt;b&gt;'),'labels are escaped');}
assert.equal(highlightList({highlights:Array.from({length:40},(_,i)=>({id:i,kind:'value-band',from:i}))}).length,24);
{const svg=buildChart(rows,{...DEFAULT_CHART,type:'scatter',x:'V',y:'V',highlights:[{id:'n',kind:'category-band',from:30,to:50},{id:'m',kind:'callout',target:'59'}]},'scatter');assert.ok(svg.includes('data-viz-part="highlight"')&&svg.includes('data-viz-part="callout"'),'numeric X ranges and nearest-point callouts on scatter');}

// ---- sparklines ----
const ex=editorialTableExample();
{const m=tableModel(ex.rows,ex);assert.ok(m.spark&&m.spark.fields.length===4);assert.equal(m.errors.length,0);
 const html=editorialTableMarkup(ex.rows,{...ex,title:'T'},true);assert.equal((html.match(/class="ov-et-sparksvg"/g)||[]).length,ex.rows.length+25,'visible page + template rows');assert.ok(html.includes('Q3: missing'),'missing quarter disclosed');
 const svg=editorialTableSvg(ex.rows,{...ex,title:'T'});assert.ok(svg.includes('Quarterly trend'));
 for(const [fields,re] of [[['Q1'],/two/],[['Q1','Note'],/numeric/],[['Q1','Nope'],/missing/]]){const mm=tableModel(ex.rows,{...ex,tableSparkFields:fields});assert.ok(mm.sparkIssues.some(e=>re.test(e)));assert.equal(mm.spark,null);assert.equal(mm.errors.length,0,'a sparkline problem never hides the table');}
 assert.equal(tableModel(ex.rows,{...ex,tableSparkFields:[]}).spark,null);
 const gap=sparklineSvg({a:1,b:null,c:3,d:4},{fields:['a','b','c','d'],style:'line',scale:'row',lo:0,hi:4},'#000');assert.equal((gap.match(/M/g)||[]).length,2,'missing value breaks the line');
 const bars=sparklineSvg({a:-1,b:2},{fields:['a','b'],style:'bars',scale:'shared',lo:-1,hi:2},'#000');assert.equal((bars.match(/<rect/g)||[]).length,2);}

// ---- organisation theme packages ----
{const b=brandExample();assert.equal(b.format,'openviz-theme');assert.equal(b.style.color,b.palette[0]);
 assert.throws(()=>normalizeBrand({format:'something-else'}));assert.throws(()=>normalizeBrand(null));assert.throws(()=>normalizeBrand({version:9}));
 const evil=normalizeBrand({name:'x<script>',palette:['#zzzzzz','red','#123456','javascript:alert(1)'],style:{font:'url(http://x)',color:'not-a-colour',background:'#ffffff',marginTop:5},byline:'a'.repeat(500),logo:{dataUri:'data:text/html;base64,PHNjcmlwdD4='}});
 assert.deepEqual(evil.palette,['#123456']);assert.equal(evil.style.font,undefined);assert.equal(evil.style.marginTop,undefined,'layout properties are not part of a brand');assert.equal(evil.logo,null,'non-image logos rejected');assert.equal(evil.byline.length,90);
 assert.equal(normalizeLogo({dataUri:'data:image/png;base64,'+'A'.repeat(500000)}),null,'oversized logos rejected');
 const ok=normalizeLogo({dataUri:'data:image/png;base64,iVBORw0KGgo=',aspect:99,height:500});assert.equal(ok.aspect,3);assert.equal(ok.height,60);
 const round=normalizeBrand(JSON.parse(brandPackageJson(b)));assert.equal(round.name,b.name);assert.deepEqual(round.palette,b.palette);
 // Applying never changes data mappings, titles, annotations or highlights.
 const ce=chartExample('multi-line'),chart={...DEFAULT_CHART,...ce,type:'multi-line',title:'Mine',annotations:[{id:'n'}],highlights:hl};const before=JSON.stringify({x:chart.x,y:chart.y,seriesField:chart.seriesField,title:chart.title,annotations:chart.annotations,highlights:chart.highlights});
 applyBrand(chart,b);assert.equal(JSON.stringify({x:chart.x,y:chart.y,seriesField:chart.seriesField,title:chart.title,annotations:chart.annotations,highlights:chart.highlights}),before);assert.equal(chart.sourceNote,b.defaultSource);assert.equal(chart.brandSeen,b.id);
 const keep={...DEFAULT_CHART,sourceNote:'My source'};applyBrand(keep,b);assert.equal(keep.sourceNote,'My source','existing source notes are kept');
 const svg=buildChart(ce.rows,chart,'multi-line');assert.ok(svg.includes('data-viz-part="brand-footer"')&&svg.includes('Harbour Analytics'));assert.ok(svg.includes(b.palette[1]),'series use the brand palette');assert.ok(svg.includes('Georgia, serif'),'custom font retained');
 assert.ok(brandFooterHeight(chart)>0);removeBrand(chart);assert.equal(brandFooterHeight(chart),0);assert.ok(!buildChart(ce.rows,chart,'multi-line').includes('brand-footer'));
 // Brand footer works for the newer families too.
 for(const t of ['pie','combo','kpi','editorial-table']){const e=chartExample(t);const c=applyBrand({...DEFAULT_CHART,...e,type:t},b);assert.ok(buildChart(e.rows,c,t).startsWith('<svg'),t);}
 // Unsafe fonts never reach the SVG.
 assert.ok(!buildChart(rows,{...DEFAULT_CHART,x:'Year',y:'V',font:'x");background:url(evil'},'bar').includes('evil'));}
console.log('PASS V3.54 highlights/callouts, table sparklines and organisation theme packages');
