import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {regionalExample,regionalAuthoredSettings} from '../src/regional-example.js';
import {DEFAULT_CHART,buildChart} from '../src/charts.js';
import {makeInteractiveHtml,validatePortableProject} from '../src/exports.js';
const dir=process.argv[2]||'canvas-fixtures';mkdirSync(dir,{recursive:true});const ex=regionalExample();
const charts=['geo-choropleth','geo-symbol'].map((type,i)=>{const author=regionalAuthoredSettings(i===1);return {...DEFAULT_CHART,...ex.settings,...author,type,id:'canvas-map-'+i,datasetId:'districts',title:i?'Repositioned map callouts':'Repositioned region names',geoLabelPositions:{...author.geoLabelPositions,A:{x:.19,y:.24,hidden:false}},geoAnnotations:author.geoAnnotations.map(n=>({...n,x:.70,y:.04}))};});
for(const c of charts)for(const width of [360,960])for(const dark of [false,true])writeFileSync(join(dir,`${c.type}-${width}-${dark?'dark':'light'}.svg`),buildChart(ex.rows,{...c,background:dark?'#17252f':'#ffffff',textColor:dark?'#e6eef4':'#1c2c3e',geoOcean:dark?'#223746':'#eff6f9'},undefined,{width,height:640}));
const project={id:'canvas-map-examples',name:'Map canvas positions · illustrative data',datasets:[{id:'districts',name:'Fictional districts',rows:ex.rows,rawRows:structuredClone(ex.rows),calculations:[],log:[]}],charts,dashboards:[],stories:[],slides:[],versions:[]};validatePortableProject(project);writeFileSync(join(dir,'canvas-maps.json'),JSON.stringify(project,null,2));writeFileSync(join(dir,'canvas-map.html'),makeInteractiveHtml(ex.rows,charts[0]));console.log('Wrote eight responsive SVGs, portable project and self-contained playback HTML');
