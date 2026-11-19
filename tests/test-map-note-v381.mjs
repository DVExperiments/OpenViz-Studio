import assert from 'node:assert/strict';
import {buildChart,DEFAULT_CHART} from '../src/charts.js';
import {chartExample} from '../src/catalogue.js';
import {createPublication} from '../src/publishing.js';
import {importProjectFile} from '../src/exports.js';
assert.equal(DEFAULT_CHART.geoShowBoundaryNote,false);
for(const type of ['geo-choropleth','geo-symbol','geo-heat']){
 const ex=chartExample(type),rows=structuredClone(ex.rows),c={...DEFAULT_CHART,...ex,id:'c',datasetId:'ds',type},before=JSON.stringify(rows);
 const hidden=buildChart(rows,c),shown=buildChart(rows,{...c,geoShowBoundaryNote:true});
 assert(!hidden.includes('Map boundaries: Natural Earth'));assert(shown.includes('Map boundaries: Natural Earth'));
 assert.equal(shown.replace(/<text[^>]*>Map boundaries: Natural Earth[^<]*<\/text>/,''),hidden,type+' geometry preserved');
 const legacy={...c};delete legacy.geoShowBoundaryNote;assert(!buildChart(rows,legacy).includes('Map boundaries: Natural Earth'));
 const project={id:'p',name:'Note test',datasets:[{id:'ds',name:'Map data',rows,rawRows:structuredClone(rows)}],charts:[c],slides:[],versions:[],dashboards:[],stories:[]};
 for(const interactive of [false,true])for(const visible of [false,true]){
  project.charts[0]={...c,geoShowBoundaryNote:visible};const out=createPublication(project,{kind:'chart',assetId:'c',interactive,preset:'responsive'});assert.equal(out.html.includes('Map boundaries: Natural Earth'),visible,type+' publication note visibility');
 }
 const portable=await importProjectFile({name:'project.json',size:1000,text:async()=>JSON.stringify(project)});assert.equal(portable.charts[0].geoShowBoundaryNote,true);
 assert.equal(JSON.stringify(rows),before,type+' source rows unchanged');
}
console.log('PASS all 3 maps: default/legacy hidden, toggle shown, unchanged geometry/data, static/interactive HTML, portable setting round-trip');
