// Generates exact chart SVG fixtures for visual QA; no browser dependencies.
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {buildChart,DEFAULT_CHART} from '../src/charts.js';
import {chartExample} from '../src/catalogue.js';
const dir=process.argv[2]||'quality-fixtures';mkdirSync(dir,{recursive:true});
for(const type of ['bar','hbar','stacked-bar','multi-line','likert','interval-plot','calendar-heatmap','assumption-lens','geo-choropleth']){const ex=chartExample(type),cfg={...DEFAULT_CHART,...ex,type,title:'A substantially longer descriptive chart heading with enough words to challenge a narrow publishing canvas',subtitle:'Illustrative data · labels, legends and source details',showSubtitle:true,showLegend:true,sourceNote:'OpenViz quality fixtures'};for(const width of [360,960])writeFileSync(join(dir,type+'-'+width+'.svg'),buildChart(ex.rows,cfg,type,{width,height:600}));}
console.log('Wrote 18 quality fixtures to '+dir);
