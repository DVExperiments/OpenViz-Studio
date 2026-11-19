import {validateRouteSettings} from './route-map.js';
import {validateMapClassification} from './map-classification.js';
import {validateMapFrame} from './map-projection.js';
import {validateMapAuthoring,MAP_AUTHOR_KEYS} from './map-authoring.js';
import {isRegional,boundaryIndex} from './regional-map.js';
import {buildChart,DEFAULT_CHART} from './charts.js';
import {escapeText as E,wrapText} from './chart-quality.js';
import {FIELD_BINDING_KEYS} from './field-bindings.js';
import {TIME_TYPES,timeModel} from './time-controls.js';
import {raceModel} from './race.js';

// Data bindings, calculations, image stores and period indexes stay outside the
// view snapshot. A period is stored by label so data reordering cannot retarget it.
const excluded=new Set([...FIELD_BINDING_KEYS,'geoCustom','geoBoundaryKey','geoBoundaryLabel','geoJoinMode','type','width','height','aggregation','parallelFields','geoTooltipFields','raceIndex','timeIndex','raceAssets','raceCaptions','textOffsets','valueLabelOffsets','nodePositions','likertOrder','pointColors']);
export const VIEW_KEYS=Object.keys(DEFAULT_CHART).filter(k=>!excluded.has(k)&&['string','number','boolean'].includes(typeof DEFAULT_CHART[k])||!excluded.has(k)&&DEFAULT_CHART[k]===null);
export function normalizeSceneState(raw){
 if(raw===null||raw===undefined)return null;
 const state={version:1,settings:{},period:null,filter:null};
 if(typeof raw!=='object'||raw.version!==1)return {...state,error:'Unsupported saved scene view. Capture a new view or use the linked chart.'};
 if(raw.error)return {...state,error:String(raw.error).slice(0,240)};
 for(const key of VIEW_KEYS){if(!Object.hasOwn(raw.settings||{},key))continue;const v=raw.settings[key],base=DEFAULT_CHART[key];
  if(v===null&&base===null)state.settings[key]=null;
  else if(typeof v==='number'&&Number.isFinite(v)&&(typeof base==='number'||base===null))state.settings[key]=v;
  else if(typeof v==='boolean'&&typeof base==='boolean')state.settings[key]=v;
  else if(typeof v==='string'&&(typeof base==='string'||base===null)){if(key!=='geoColorMode'&&/color|background|secondary|geoOcean/i.test(key)&&!/^#[\da-f]{6}$/i.test(v))continue;state.settings[key]=v.slice(0,1000);}
 }
 try{validateRouteSettings(raw.settings||{});validateMapClassification(raw.settings||{});if(Object.hasOwn(raw.settings||{},'geoClassBreaks'))state.settings.geoClassBreaks=[...raw.settings.geoClassBreaks];validateMapFrame(raw.settings||{});if(Object.hasOwn(raw.settings||{},'geoExtent'))state.settings.geoExtent=raw.settings.geoExtent===null?null:[...raw.settings.geoExtent];const authored=validateMapAuthoring(raw.settings||{});for(const key of MAP_AUTHOR_KEYS)if(Object.hasOwn(raw.settings||{},key))state.settings[key]=authored[key];}catch(e){return {...state,error:e.message};}
 if(raw.settings?.pointColors&&typeof raw.settings.pointColors==='object')state.settings.pointColors=Object.fromEntries(Object.entries(raw.settings.pointColors).slice(0,400).filter(([k,v])=>k.length<=400&&/^#[\da-f]{6}$/i.test(v)));
 if(raw.period!==null&&raw.period!==undefined){if(!['race','time'].includes(raw.period.kind)||typeof raw.period.label!=='string'||raw.period.label.length>1000)return {...state,error:'Invalid saved period.'};state.period={kind:raw.period.kind,label:raw.period.label};}
 if(raw.filter!==null&&raw.filter!==undefined){if(!['x','seriesField','timeEntityField'].includes(raw.filter.role)||!Array.isArray(raw.filter.values)||raw.filter.values.length>100||raw.filter.values.some(v=>typeof v!=='string'||v.length>1000))return {...state,error:'Invalid saved scene filter.'};state.filter={role:raw.filter.role,values:[...new Set(raw.filter.values)]};}
 return state;
}
export function captureSceneState(rows,chart){
 const settings=Object.fromEntries(VIEW_KEYS.filter(k=>Object.hasOwn(chart,k)).map(k=>[k,structuredClone(chart[k])]));validateMapClassification(chart);settings.geoClassBreaks=[...(chart.geoClassBreaks||[])];validateMapFrame(chart);if(chart.geoExtent)settings.geoExtent=[...chart.geoExtent];Object.assign(settings,validateMapAuthoring(chart));settings.pointColors=structuredClone(chart.pointColors||{});
 const state={version:1,settings,period:null,filter:null};
 if(['bar-race','line-race'].includes(chart.type)){const m=raceModel(rows,chart);if(m.errors.length)throw Error(m.errors[0]);const f=m.frames[Math.max(0,Math.min(m.frames.length-1,Math.floor(Number(chart.raceIndex)||0)))];if(f)state.period={kind:'race',label:f.period};}
 else if(chart.timeEnabled&&TIME_TYPES.has(chart.type)){const m=timeModel(rows,chart);if(m.errors.length)throw Error(m.errors[0]);const f=m.frames[Math.max(0,Math.min(m.frames.length-1,Math.floor(Number(chart.timeIndex)||0)))];if(f)state.period={kind:'time',label:f.period};}
 return normalizeSceneState(state);
}
export const sceneSourceKey=index=>'scene:'+index;
export function sceneSource(sources,scene,index){return Object.hasOwn(sources,sceneSourceKey(index))?sources[sceneSourceKey(index)]:Object.hasOwn(sources,scene.chartId)?sources[scene.chartId]:null;}
export function resolveSceneView(project,scene){
 const base=project.charts.find(c=>c.id===scene.chartId),dataset=base&&project.datasets.find(d=>d.id===base.datasetId),state=normalizeSceneState(scene.state);
 if(isRegional(base)){try{const boundaries=boundaryIndex(base);if(boundaries.errors.length)return {error:boundaries.errors[0]};}catch(e){return {error:e.message};}}if(!base||!dataset)return {error:'Missing source chart or dataset.'};if(state?.error)return {error:state.error};
 const chart={...structuredClone(base),...(state?.settings||{})};if(chart.yMin!==null&&chart.yMin!==undefined&&chart.yMax!==null&&chart.yMax!==undefined&&Number(chart.yMax)<=Number(chart.yMin))return {error:'The saved maximum must be greater than the minimum.'};let rows=dataset.rows;
 if(state?.filter){const field=chart[state.filter.role];if(!field||!rows.some(r=>Object.hasOwn(r,field)))return {error:'The saved filter field is no longer available. Clear the filter or capture a new view.'};const allowed=new Set(state.filter.values);rows=rows.filter(r=>allowed.has(String(r[field]??'')));if(!rows.length)return {error:'No rows match the saved scene filter. Edit or clear it.'};}
 if(state?.period){const {kind,label}=state.period;let m,index;
  if(kind==='race'&&['bar-race','line-race'].includes(chart.type)){m=raceModel(rows,chart);index=m.frames.findIndex(f=>f.period===label);chart.raceIndex=index;}
  else if(kind==='time'&&chart.timeEnabled&&TIME_TYPES.has(chart.type)){m=timeModel(rows,chart);index=m.frames.findIndex(f=>f.period===label);chart.timeIndex=index;}
  else return {error:'Saved period is incompatible with the linked chart. Capture a new view or use the linked chart.'};
  if(m.errors.length&&rows.length)return {error:m.errors[0]};if(index<0)return {error:'Saved period “'+label+'” is unavailable or has no rows after the scene filter. Choose another period or clear the filter.'};if(m.errors.length)return {error:m.errors[0]};
 }
 return {chart,rows,state,base,dataset,error:''};
}
export function buildStorySources(project,story,render=buildChart){
 const sources=Object.create(null),errors=[],captionSpace=Math.max(0,...(story?.scenes||[]).slice(0,24).map(sc=>{if(!sc.caption)return 0;const lines=wrapText(String(sc.caption).slice(0,320),832,19,3).length;return 48+(lines-1)*23+72;}));
 for(const [index,scene] of (story?.scenes||[]).slice(0,24).entries()){const view=resolveSceneView(project,scene);if(view.error){errors.push({index,message:view.error});sources[sceneSourceKey(index)]=`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><rect width="960" height="540" fill="#fff"/><text x="40" y="100" fill="#a33" font-size="18">Scene ${index+1}: ${E(view.error)}</text></svg>`;}else{const chart={...view.chart};if(captionSpace)chart.marginBottom=Math.max(captionSpace,Number(chart.marginBottom)||0);sources[sceneSourceKey(index)]=render(view.rows,chart,chart.type,{width:960,height:540});}}
 return {sources,errors};
}
