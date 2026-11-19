import {isRegional,regionalSourceValue,regionalLinkable} from './regional-map.js';
import {SERIES_TYPES} from './expanded-charts.js';
/* OpenViz Studio V3.4 — deterministic, local-only category linking.
 * Never infer that similarly named but differently mapped numeric marks are related.
 * A chart may receive filtering even if it cannot originate a mark selection.
 */
import {geoCanonicalValue} from './geo.js';
const CLICKABLE=new Set(['pie','waffle','lollipop','funnel','bullet','range-plot','arrow-plot','parliament','wordcloud','circle-pack','bar','hbar','donut','line','area','dot','treemap','stacked-bar','heatmap','waterfall','slope','box','violin','geo-choropleth','geo-symbol']);
export function normalizeCategory(value){return String(value??'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
export function chartCanSelect(chart,field){return (!isRegional(chart)||regionalLinkable(chart)) && !(!isRegional(chart)&&chart?.timeEnabled&&chart?.type==='geo-symbol'&&chart?.timeEntityField&&chart.timeEntityField!==chart.x) && !!field && (CLICKABLE.has(chart?.type)||SERIES_TYPES.has(chart?.type)||['evidence-lanes','change-lens','likert','interval-plot','ecdf','assumption-lens'].includes(chart?.type)) && chart.x===field;}
export function markCategory(chart,field,rawKey,rows=[]){
 if(!chartCanSelect(chart,field)||rawKey==null)return null;
 let key=String(rawKey);if(isRegional(chart)){const value=regionalSourceValue(key,rows,chart);return value===null?null:String(value);}
 if(['stacked-bar','heatmap','likert','interval-plot'].includes(chart.type)||SERIES_TYPES.has(chart.type)){
  try{const pair=JSON.parse(key);if(!Array.isArray(pair)||pair.length<2)return null;key=String(pair[0]);}catch{return null;}
 }else if(chart.type==='treemap'&&key.includes(' / '))key=key.split(' / ')[0];
 else if(chart.type==='waterfall'&&key==='Final total')return null;
 if(chart.type==='geo-choropleth'||chart.type==='geo-symbol'&&chart.timeEnabled&&(!chart.timeEntityField||chart.timeEntityField===chart.x)&&!(chart.geoLatField&&chart.geoLonField)&&chart.geoLocationMode!=='coordinates'){
  const found=rows.find(r=>geoCanonicalValue(r[field])===key);
  return found?String(found[field]):null;
 }
 const found=rows.find(r=>normalizeCategory(r[field])===normalizeCategory(key));
 return found?String(found[field]):null;
}
export function matchesCategory(a,b,geographic=false){
 if(geographic){const x=geoCanonicalValue(a),y=geoCanonicalValue(b);if(x&&y)return x===y;}
 return normalizeCategory(a)===normalizeCategory(b);
}
export function matchingRows(rows,field,values){const wanted=new Set(values.map(normalizeCategory));return rows.filter(row=>wanted.has(normalizeCategory(row?.[field])));}
export function validSelection(values,possible){const allowed=new Set(possible.map(normalizeCategory));return [...new Set(values.map(String))].filter(v=>allowed.has(normalizeCategory(v)));}
