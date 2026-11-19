// V3.60: ticker, countdown, quiz, poll, profile cards, tree; boundary library; globe; marker styles;
// right-to-left text; written descriptions; table images, flags and sticky columns; newsroom styles.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {CHARTS,buildChart,chartWarnings,describeChart,chartIsRtl,chartPreset,applyChartPreset,DEFAULT_CHART} from '../src/charts.js';
import {CATALOGUE,chartExample} from '../src/catalogue.js';
import {EXTRA_TYPES,parseWhen,countdownParts,treeModel} from '../src/pro-charts-v360.js';
import {PRO_TYPES} from '../src/pro-charts.js';
import {markerSVG,markerStyle,validMarkerImage,niceDotValue,dotDensitySVG,DOT_BUDGET,MARKER_ICONS} from '../src/map-markers.js';
import {MAP_PROJECTIONS,mapProjection,globeRing,globeOutline,globeGraticule} from '../src/map-projection.js';
import {BOUNDARY_SETS} from '../src/boundaries/index.js';
import {MAP_RESOURCES,ensureBoundarySet,boundarySetLoaded,resourceGeoJSON,searchMapResources} from '../src/map-library.js';
import {normalizeBoundaryAsset} from '../src/regional-map.js';
import {flagFor} from '../src/race-assets.js';
import {editorialTableMarkup} from '../src/editorial-table.js';
import {BUILTIN_STYLES} from '../src/themes.js';
import {installInteractiveWidgets,installFullscreenButton} from '../src/interactive-widgets.js';
const {JSDOM}=await import(process.env.OPENVIZ_DOM_MODULE||'jsdom');

// ---- registry ----
assert.equal(Object.keys(CHARTS).length,79);
assert.equal(PRO_TYPES.size,31);
for(const t of ['number-ticker','countdown','quiz','poll','profile-cards','tree','geo-spike','geo-dots','geo-globe']){
 assert.ok(CHARTS[t],t);assert.ok(CATALOGUE.some(c=>c.id===t&&c.status==='available'),t+' in catalogue');}

// ---- every new template renders its example without NaN and warns when unmapped ----
for(const t of EXTRA_TYPES){const ex=chartExample(t);const cfg={...DEFAULT_CHART,...ex,type:t};
 for(const [w,h] of [[900,560],[360,640]]){const svg=buildChart(ex.rows,cfg,t,{width:w,height:h});assert.ok(svg.startsWith('<svg')&&!/NaN|undefined/.test(svg),`${t} ${w}`);}
 assert.ok(chartWarnings(ex.rows,{...cfg,x:'missing',y:'missing'},t).length>0,t+' unmapped warning');}

// ---- countdown dates ----
assert.ok(Number.isFinite(parseWhen('2026-12-24')));assert.ok(Number.isFinite(parseWhen('2026-12-24T18:00')));assert.ok(!Number.isFinite(parseWhen('next week')));
const parts=Object.fromEntries(countdownParts(Date.UTC(2026,0,2,3,4,5)-Date.UTC(2026,0,1)).parts);assert.deepEqual(parts,{days:1,hours:3,minutes:4,seconds:5});assert.equal(countdownParts(-5000).sign,-1);assert.equal(countdownParts(36e5*30,'d').parts.length,1);

// ---- tree: one root, cycles and orphans disclosed ----
const tm=treeModel([{Name:'CEO',Parent:''},{Name:'CFO',Parent:'CEO'},{Name:'CTO',Parent:'CEO'},{Name:'Dev',Parent:'CTO'},{Name:'A',Parent:'B'},{Name:'B',Parent:'A'}],{x:'Name',endField:'Parent'});
assert.equal(tm.roots[0].label,'CEO');assert.equal(tm.roots[0].children.length,2);assert.ok(tm.warnings.length>0,'cycle reported');

// ---- quiz and poll behaviour in an interactive page ----
{const ex=chartExample('quiz');const svg=buildChart(ex.rows,{...DEFAULT_CHART,...ex,type:'quiz'},'quiz');
 const dom=new JSDOM(`<!doctype html><body>${svg}</body>`,{pretendToBeVisual:true});const doc=dom.window.document;
 installInteractiveWidgets(doc.body);const q=doc.querySelector('[data-ov-question]');const wrong=q.querySelector('[data-ov-option]:not([data-ov-correct="1"])')||q.querySelector('[data-ov-option]');
 wrong.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}));assert.equal(q.getAttribute('data-ov-answered'),'true');
 assert.match(doc.querySelector('[data-ov-score]').textContent,/Score: [01] \//);
 const before=doc.querySelector('[data-ov-score]').textContent;q.querySelector('[data-ov-option]').dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}));
 assert.equal(doc.querySelector('[data-ov-score]').textContent,before,'answered questions are locked');dom.window.close();}
{const ex=chartExample('poll');const svg=buildChart(ex.rows,{...DEFAULT_CHART,...ex,type:'poll'},'poll');assert.ok(!/fetch|XMLHttpRequest|sendBeacon/.test(svg),'polls send nothing');
 const dom=new JSDOM(`<!doctype html><body>${svg}</body>`,{pretendToBeVisual:true});const doc=dom.window.document;
 dom.window.matchMedia=()=>({matches:true});installInteractiveWidgets(doc.body);const poll=doc.querySelector('[data-ov-poll]');
 if(poll.getAttribute('data-ov-revealed')!=='true'){const c=doc.querySelector('[data-ov-choice]');c.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));assert.equal(poll.getAttribute('data-ov-revealed'),'true');assert.equal(c.getAttribute('aria-disabled'),'true');}
 dom.window.close();}
// fullscreen button only where fullscreen is allowed
{const dom=new JSDOM('<!doctype html><body></body>');const doc=dom.window.document;installFullscreenButton(doc);assert.equal(doc.getElementById('ov-fullscreen'),null);
 Object.defineProperty(doc,'fullscreenEnabled',{value:true});installFullscreenButton(doc);assert.ok(doc.getElementById('ov-fullscreen'));installFullscreenButton(doc);assert.equal(doc.querySelectorAll('#ov-fullscreen').length,1);dom.window.close();}

// ---- presets ----
for(const t of ['geo-spike','geo-dots','geo-globe']){const p=chartPreset(t);assert.ok(p);const c=applyChartPreset({type:t});assert.equal(c.type,p.type);
 const ex=chartExample(t);const svg=buildChart(ex.rows,{...DEFAULT_CHART,...ex,type:t},t);assert.ok(svg.startsWith('<svg')&&!/NaN/.test(svg),t);}

// ---- markers ----
assert.equal(markerStyle({geoMarkerStyle:'spike'}),'spike');assert.equal(markerStyle({geoMarkerStyle:'bogus'}),'circle');
assert.match(markerSVG({geoMarkerStyle:'circle'},{x:10,y:20,r:5,value:1,fill:'#000'}),/cx="10.000" cy="20.000" r="5.0000"/);
assert.match(markerSVG({geoMarkerStyle:'spike'},{x:10,y:20,r:5,value:1,top:1,fill:'#000',plotH:300}),/<path/);
assert.ok(Object.keys(MARKER_ICONS).length>=12);
assert.ok(validMarkerImage('data:image/png;base64,iVBORw0KGgo='));assert.ok(!validMarkerImage('javascript:alert(1)'));assert.ok(!validMarkerImage('https://example.com/a.png'));
assert.equal(niceDotValue([1000,500],50),20);
const square={type:'Polygon',coordinates:[[[0,0],[10,0],[10,10],[0,10],[0,0]]]};
const budget={left:100};const dd=dotDensitySVG({},{geometry:square,proj:([x,y])=>[x*10,y*10],value:500,dotValue:10,fill:'#000',key:'sq',budget});
assert.equal(dd.drawn,50);assert.equal(budget.left<=100,true);
const again=dotDensitySVG({},{geometry:square,proj:([x,y])=>[x*10,y*10],value:500,dotValue:10,fill:'#000',key:'sq',budget:{left:100}});assert.equal(again.svg,dd.svg,'dot placement is stable between renders');
const capped=dotDensitySVG({},{geometry:square,proj:([x,y])=>[x*10,y*10],value:5000,dotValue:1,fill:'#000',key:'sq',budget:{left:30}});assert.ok(capped.drawn<=30&&capped.capped);
assert.ok(DOT_BUDGET<=20000);

// ---- globe ----
assert.ok(MAP_PROJECTIONS.globe);
const gp=mapProjection([-180,-90,180,90],{left:0,top:0,pw:400,ph:400},{geoProjection:'globe',globeLon:0,globeLat:0});
assert.equal(gp.kind,'globe');assert.deepEqual(globeOutline(gp),{cx:200,cy:200,r:gp.globe.r});
assert.deepEqual(gp([0,0]).map(Math.round),[200,200],'centre of view lands in the middle');
assert.ok(gp.contains([10,10])&&!gp.contains([180,0]),'far side hidden');
assert.ok(globeGraticule(gp).length>0);
// a shape entirely on the far side of the globe is clipped away; one in view is kept
const far=globeRing([[170,0],[175,0],[175,5],[170,5],[170,0]],gp),near=globeRing([[0,0],[5,0],[5,5],[0,5],[0,0]],gp);
assert.ok(!far||far.length===0);assert.ok(near&&near.length>0);

// ---- boundary library ----
assert.ok(BOUNDARY_SETS.length>=250);assert.equal(MAP_RESOURCES.length,184+BOUNDARY_SETS.length);
assert.equal(new Set(BOUNDARY_SETS.map(s=>s.id)).size,BOUNDARY_SETS.length);
assert.ok(!BOUNDARY_SETS.some(s=>s.iso3==='ATA'));assert.ok(!BOUNDARY_SETS.some(s=>/ys$|ss$/.test(s.name)),'plural names are spelled correctly');
for(const s of BOUNDARY_SETS)assert.ok(existsSync(new URL('../src/boundaries/'+s.file,import.meta.url)),s.file);
assert.equal(BOUNDARY_SETS.filter(s=>s.kind==='county').length>=50,true);
const fra=BOUNDARY_SETS.find(s=>s.iso3==='DEU'&&s.kind==='subdivision');assert.ok(fra);
assert.throws(()=>resourceGeoJSON(fra.id),/Load this boundary set first/);
await ensureBoundarySet(fra.id,async url=>({ok:true,json:async()=>JSON.parse(readFileSync(new URL(url)))}));assert.ok(boundarySetLoaded(fra.id));
const g=resourceGeoJSON(fra.id);assert.equal(g.features.length,fra.count);assert.ok(g.features.some(f=>f.properties.region_id==='DE-BY'),'ISO 3166-2 ids');
assert.ok(normalizeBoundaryAsset(g,{name:fra.name}));
assert.ok(searchMapResources('California').some(r=>r.kind==='county'));

// ---- right-to-left ----
assert.equal(chartIsRtl({title:'المبيعات حسب المنطقة'}),true);assert.equal(chartIsRtl({title:'Sales'}),false);assert.equal(chartIsRtl({title:'Sales',textDirection:'rtl'}),true);assert.equal(chartIsRtl({title:'מכירות',textDirection:'ltr'}),false);
const rows=[{Region:'شمال',Sales:10},{Region:'جنوب',Sales:20}];
const rtl=buildChart(rows,{...DEFAULT_CHART,type:'bar',x:'Region',y:'Sales',title:'المبيعات'},'bar');assert.match(rtl,/data-rtl/);assert.match(rtl,/unicode-bidi:plaintext/);
assert.doesNotMatch(buildChart(rows,{...DEFAULT_CHART,type:'bar',x:'Region',y:'Sales',title:'Sales'},'bar'),/data-rtl/);

// ---- written descriptions ----
const d=describeChart([{M:'Jan',V:10},{M:'Feb',V:30},{M:'Mar',V:20}],{...DEFAULT_CHART,type:'bar',x:'M',y:'V'});
assert.ok(typeof d==='string'&&/Feb/.test(d)&&/30/.test(d),d);
assert.ok(describeChart([],{...DEFAULT_CHART,type:'bar'})!==undefined);

// ---- table images, flags, sticky columns ----
assert.ok(flagFor('FR'));assert.equal(flagFor('FRA').code,'FR');assert.equal(flagFor('France').code,'FR');assert.equal(flagFor('NOR').code,'NO');assert.ok(!flagFor('Narnia'));
const t=editorialTableMarkup([{Country:'France',Pic:'javascript:alert(1)',Pop:68},{Country:'DEU',Pic:'https://example.com/a.png',Pop:84}],{type:'editorial-table',parallelFields:['Country','Pic','Pop'],tableColumnStyles:[{field:'Country',display:'flag'},{field:'Pic',display:'image'},{field:'Pop',sticky:true}]});
assert.ok(!/(src|href)="javascript/i.test(t),'unsafe image URLs never become a source');assert.ok(t.includes('src="https://example.com/a.png"'));
assert.match(t,/ov-et-sticky/);assert.ok(t.indexOf('data-table-value="68"')<t.indexOf('France'),'sticky columns come first');

// France and Norway join by their ISO3 codes on world maps
{const svg=buildChart([{C:'FRA',V:5},{C:'NOR',V:3}],{...DEFAULT_CHART,type:'geo-choropleth',x:'C',y:'V'},'geo-choropleth');assert.match(svg,/<title>France: 5/);assert.match(svg,/<title>Norway: 3/);}

// ---- newsroom styles ----
assert.equal(BUILTIN_STYLES.length,16);
for(const n of ['Financial paper','Weekly briefing','Wire service','Public broadcaster','Data desk serif','Tabloid bold','Statistics office','Night desk'])assert.ok(BUILTIN_STYLES.some(s=>s.name===n),n);
console.log('PASS v3.60 templates, boundary library, globe, markers, RTL, descriptions, table extras, newsroom styles');
