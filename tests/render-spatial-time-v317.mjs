import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {DEFAULT_CHART,buildChart} from '../src/charts.js';
import {timeExample} from '../src/time-examples.js';
import {makeInteractiveHtml} from '../src/exports.js';
const dir=process.argv[2]||'spatial-time-fixtures';mkdirSync(dir,{recursive:true});
const types=['scatter','bubble','geo-choropleth','geo-symbol'],charts=[];
for(const type of types){const ex=timeExample(type),c={...DEFAULT_CHART,...ex.settings,id:type,datasetId:'time-data'};charts.push(c);writeFileSync(join(dir,type+'.html'),makeInteractiveHtml(ex.rows,c));for(const width of [360,960])for(const dark of [false,true])for(let timeIndex=0;timeIndex<3;timeIndex++){const cfg={...c,timeIndex,background:dark?'#17252f':'#ffffff',textColor:dark?'#e6eef4':'#1c2c3e',gridColor:dark?'#3a5264':'#e0e6ec',geoOcean:dark?'#223746':'#eff6f9'};writeFileSync(join(dir,`${type}-${width}-${dark?'dark':'light'}-${timeIndex}.svg`),buildChart(ex.rows,cfg,undefined,{width}));}}
const rows=timeExample('scatter').rows;writeFileSync(join(dir,'time-examples.json'),JSON.stringify({id:'spatial-time-examples',name:'Spatial time controls · illustrative examples',datasets:[{id:'time-data',name:'Illustrative country values and approximate locations',rows,rawRows:structuredClone(rows),calculations:[],log:[]}],charts,dashboards:[{id:'spatial-time-dashboard',name:'Spatial time examples',mode:'grid',columns:2,chartIds:types,items:[]}],slides:[],stories:[],versions:[]},null,2));
console.log('Wrote 48 SVG fixtures, four standalone interactive HTML files and portable project');
