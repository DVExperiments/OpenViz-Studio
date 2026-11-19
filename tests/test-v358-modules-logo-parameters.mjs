// V3.58: more editor modules, organisation logo on slides, what-if parameters.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {normalizeParameter,formatParameter,parameterRefs,parameterValues,substituteParameters,recomputeParameterCalculations,applyParameters,chartParameters,parameterUsage,renameParameterRefs,datasetUsesParameters} from '../src/parameters.js';
import {addCalculatedField} from '../src/data.js';
import {slideLogoPlacement,SLIDE_LOGO_POSITIONS} from '../src/brand.js';
import {livePayload} from '../src/live-publish.js';
import {buildChart} from '../src/charts.js';

// ---- modules ----
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const mods=readdirSync(new URL('../src/editor/',import.meta.url));
for(const m of ['story-ui','slides-ui','storage-ui','publish-ui','catalogue-ui','data-edit-ui','style-library-ui','dashboard-ui','help-ui','map-inspector','export-ui','parameters-ui']){assert.ok(mods.includes(`${m}.js`),m);assert.ok(app.includes(`./editor/${m}.js`),`app.js imports ${m}`);}
assert.ok(app.length<420000,`app.js is ${Math.round(app.length/1024)} KB`);

// ---- parameters ----
const g=normalizeParameter({name:' Growth rate ',value:80,min:0,max:50,step:0.5,format:'percent'});
assert.equal(g.name,'Growth rate');assert.equal(g.value,50,'value clamped to range');assert.ok(g.id.startsWith('param-'));
assert.deepEqual(normalizeParameter({name:'x',min:10,max:2,value:5}).min,2,'min/max swapped');
assert.throws(()=>normalizeParameter({name:''}),/name/);assert.throws(()=>normalizeParameter({name:'a{b}'}),/cannot contain/);
assert.equal(formatParameter({...g,value:12.5}),'12.5%');assert.equal(formatParameter({name:'p',value:1200,step:1,format:'currency'}),'$1,200');
assert.deepEqual(parameterRefs('[Sales]*(1+{Growth rate}/100)+{ Price }'),['Growth rate','Price']);
assert.equal(substituteParameters('[A]*{G}',{G:-3}),'[A]*(0-3)');
assert.throws(()=>substituteParameters('[A]*{Nope}',{}),/Unknown parameter: \{Nope\}/);
const rows=[{Region:'N',Sales:100},{Region:'S',Sales:200}];
const p1=addCalculatedField(rows,'Projected','[Sales]*(1+{G}/100)',{G:10});assert.equal(Math.round(p1[1].Projected),220);
assert.throws(()=>addCalculatedField(rows,'Bad','{x}'),/Unknown parameter/,'a missing parameter is an error, not a silent zero');
// dependent calculations are recomputed in order; independent earlier ones are left alone
const calcs=[{name:'Double',expression:'[Sales]*2'},{name:'Projected',expression:'[Sales]*(1+{G}/100)'},{name:'Gap',expression:'[Projected]-[Sales]'}];
let derived=rows;for(const c of calcs)derived=addCalculatedField(derived,c.name,c.expression,{G:10});derived[0].Double=999;
const re=recomputeParameterCalculations(derived,calcs,{G:50});assert.equal(re[0].Projected,150);assert.equal(re[0].Gap,50);assert.equal(re[0].Double,999,'calculations before the first parameter use are not touched');
const project={parameters:[{...g,id:'g1',value:10}],datasets:[{id:'d1',name:'Sales',rows:derived,calculations:calcs.map(c=>({...c,expression:c.expression.replace('{G}','{Growth rate}')}))},{id:'d2',name:'Other',rows:[{a:1}],calculations:[]}],
 charts:[{id:'c1',title:'Projection',type:'bar',datasetId:'d1',x:'Region',y:'Projected',refLineMode:'parameter',refLineParam:'g1'},{id:'c2',title:'Plain',type:'bar',datasetId:'d2',x:'a',y:'a'}],dashboards:[{id:'db',name:'Dash',chartIds:['c1','c2']}]};
project.parameters[0].value=25;const changed=applyParameters(project);
assert.deepEqual(changed.datasets,['Sales']);assert.equal(project.datasets[0].rows[1].Projected,250);assert.equal(project.charts[0].refLineValue,25);assert.equal(project.charts[0].refLineParamName,'Growth rate');
assert.ok(datasetUsesParameters(project.datasets[0]));assert.ok(!datasetUsesParameters(project.datasets[1]));
assert.deepEqual(chartParameters(project,project.charts[0]).map(p=>p.id),['g1']);assert.deepEqual(chartParameters(project,project.charts[1]),[]);
const usage=parameterUsage(project,project.parameters[0]);assert.deepEqual(usage.calcs,['Sales → Projected']);assert.deepEqual(usage.charts,['Projection']);
assert.equal(renameParameterRefs(project,'Growth rate','Uplift'),1);assert.match(project.datasets[0].calculations[1].expression,/\{Uplift\}/);project.parameters[0].name='Uplift';
// parameter reference line is drawn with the parameter's name
const svg=buildChart(project.datasets[0].rows,project.charts[0],'bar',{width:800,height:450});assert.match(svg,/Growth rate: 25\.0%/);
// live publication: parameters and raw columns travel with the payload
const {payload}=livePayload(project,{kind:'dashboard',assetId:'db'});
assert.deepEqual(payload.parameters.map(p=>p.name),['Uplift']);assert.equal(payload.datasets.d1.parameters,true);
assert.equal(payload.datasets.d1.calculations.length,3);assert.ok(!('Projected' in payload.datasets.d1.rows[0]),'derived columns are rebuilt by the reader, not shipped');assert.ok('Sales' in payload.datasets.d1.rows[0]);
assert.equal(payload.datasets.d2.parameters,undefined);
const none=livePayload({...project,parameters:[]},{kind:'chart',assetId:'c2'}).payload;assert.deepEqual(none.parameters,[]);

// ---- logo on slides ----
const logo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const branded={brand:{logo:{dataUri:logo,aspect:4}},slideLogo:{position:'top-right',size:8}};
const L=slideLogoPlacement(branded,{});assert.ok(L);assert.equal(L.h,8);assert.equal(L.w,18);assert.ok(Math.abs(L.x+L.w-(100-3))<0.01,'right margin');assert.ok(L.y>0&&L.y<10);
const bl=slideLogoPlacement({...branded,slideLogo:{position:'bottom-left',size:10}},{});assert.equal(bl.x,3);assert.ok(Math.abs(bl.y+bl.h-(100-3*16/9))<0.01);
assert.equal(slideLogoPlacement(branded,{hideLogo:true}),null,'per-slide opt-out');
assert.equal(slideLogoPlacement({...branded,slideLogo:{position:'off'}},{}),null);
assert.equal(slideLogoPlacement({slideLogo:{position:'top-right'}},{}),null,'no logo in the theme');
assert.equal(slideLogoPlacement({...branded,slideLogo:{position:'middle'}},{}),null,'unknown position ignored');
const wide=slideLogoPlacement({brand:{logo:{dataUri:logo,aspect:12}},slideLogo:{position:'top-left',size:20}},{});assert.equal(wide.w,40,'very wide logos are capped at 40% of the slide width');
assert.equal(SLIDE_LOGO_POSITIONS.length,5);

console.log('V3.58 modules, slide logos and what-if parameters: all checks passed');
