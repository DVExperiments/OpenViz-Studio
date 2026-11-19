// V3.56 builds "Live" publications: a payload (charts + only the columns they need) plus the
// bundled runtime (src/dist/openviz-live.js) inlined into one self-contained HTML file.
import {chartFieldNames} from './field-bindings.js';
import {brandHtmlHeader,brandHtmlFooter,brandHtmlCss} from './brand.js';
import {chartParameters,datasetUsesParameters} from './parameters.js';
import {chartIsRtl} from './charts.js';
export const LIVE_ROW_LIMIT=50000;
const LIVE_KINDS=new Set(['chart','dashboard']);
export function liveSupported(kind){return LIVE_KINDS.has(kind);}
// Category fields shared by the charts, suitable as reader filters.
export function liveFilterCandidates(project,kind,assetId){const charts=liveCharts(project,kind,assetId),counts=new Map();
 for(const c of charts){const d=project.datasets.find(x=>x.id===c.datasetId);if(!d?.rows?.length)continue;for(const f of Object.keys(d.rows[0])){const values=new Set();let numeric=true;for(const r of d.rows.slice(0,5000)){const v=r[f];if(v===null||v===undefined||String(v).trim()==='')continue;values.add(String(v));if(!Number.isFinite(Number(v)))numeric=false;if(values.size>200)break;}const yearLike=numeric&&[...values].every(v=>Number.isInteger(Number(v))&&Number(v)>=1000&&Number(v)<=3000),periodName=/year|month|quarter|period|week|season|grade|level|wave/i.test(f);if(values.size>=2&&values.size<=200&&(!numeric||(values.size<=40&&(yearLike||periodName))))counts.set(f,(counts.get(f)||0)+1);}}
 return [...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([f])=>f).slice(0,40);}
function liveCharts(project,kind,assetId){if(kind==='chart')return project.charts.filter(c=>c.id===assetId);const dash=project.dashboards.find(d=>d.id===assetId);return (dash?.chartIds||[]).map(id=>project.charts.find(c=>c.id===id)).filter(Boolean);}
export function livePayload(project,{kind,assetId,filters=[],keepLive=true,generatedAt=new Date().toISOString()}={}){
 if(!liveSupported(kind))throw new Error('Live publishing supports charts and dashboards.');
 const charts=liveCharts(project,kind,assetId);if(!charts.length)throw new Error(kind==='dashboard'?'Add a chart to the dashboard before publishing.':'Select a chart first.');
 const datasets={},chosenFilters=[...new Set(filters)].slice(0,6),warnings=[];
 const clean=charts.map(c=>{const d=project.datasets.find(x=>x.id===c.datasetId);if(!d)throw new Error(`Chart “${c.title}” is missing its dataset.`);
  const drill=c.drillLevel2?[c.x,c.drillLevel2,c.drillLevel3].filter((f,i,a)=>typeof f==='string'&&f&&a.indexOf(f)===i):[];
  const needed=new Set([...chartFieldNames(c),...drill,...chosenFilters,c.proTimeField,c.timeField].filter(Boolean));
  const entry=datasets[d.id]||(datasets[d.id]={fields:new Set(),rows:d.rows,calculations:d.calculations||[],live:keepLive&&d.liveSource?{url:d.liveSource.url,interval:Number(d.liveSource.interval)||0,kind:d.liveSource.kind}:null});needed.forEach(f=>entry.fields.add(f));
  const out={...structuredClone(c),drillFields:drill.length?drill:undefined};if(kind==='dashboard'){out.brand=null;}delete out.annotations?.selected;return out;});
 const outSets={};for(const [id,e] of Object.entries(datasets)){const fields=[...e.fields].filter(f=>e.rows.length&&Object.prototype.hasOwnProperty.call(e.rows[0],f));if(e.rows.length>LIVE_ROW_LIMIT)warnings.push(`A dataset has ${e.rows.length.toLocaleString()} rows; only the first ${LIVE_ROW_LIMIT.toLocaleString()} are embedded.`);const calcNames=new Set((e.calculations||[]).map(c=>c.name));
  const usesParams=datasetUsesParameters({calculations:e.calculations}),derive=(e.live||usesParams)&&e.calculations?.length;
  outSets[id]={rows:e.rows.slice(0,LIVE_ROW_LIMIT).map(r=>Object.fromEntries(fields.map(f=>[f,r[f]]))),calculations:derive?e.calculations:[],fields:fields.filter(f=>!calcNames.has(f)),live:e.live,...(usesParams?{parameters:true}:{})};
  // Live refresh and what-if parameters re-derive calculated fields in the reader's browser, so the raw
  // columns those expressions use are kept (and the derived columns are left out; they are rebuilt).
  if(derive){const raw=Object.keys(e.rows[0]||{}).filter(f=>!calcNames.has(f));outSets[id].rows=e.rows.slice(0,LIVE_ROW_LIMIT).map(r=>Object.fromEntries(raw.map(f=>[f,r[f]])));}}
 const paramIds=new Set(charts.flatMap(c=>chartParameters(project,c).map(p=>p.id))),parameters=(project.parameters||[]).filter(p=>paramIds.has(p.id)).map(({id,name,value,min,max,step,format})=>({id,name,value,min,max,step,format}));
 const title=kind==='dashboard'?(project.dashboards.find(d=>d.id===assetId)?.name||'Dashboard'):charts[0].title;
 return {payload:{version:1,kind,title,charts:clean,datasets:outSets,filters:chosenFilters,parameters,generatedAt,brandHtml:kind==='dashboard'&&project.brand?{header:brandHtmlHeader(project.brand),footer:brandHtmlFooter(project.brand)}:null},warnings};
}
const LS=String.fromCharCode(0x2028),PS=String.fromCharCode(0x2029);
const jsonForScript=v=>JSON.stringify(v).replace(/</g,'\\u003c').split(LS).join('\\u2028').split(PS).join('\\u2029');
export function liveHtml(payload,runtimeSource,{title}={}){
 if(typeof runtimeSource!=='string'||!runtimeSource.includes('OpenVizLive'))throw new Error('The live runtime is not loaded. Reload OpenViz and try again.');
 const css=`body{margin:0;padding:clamp(10px,3vw,24px);background:#f3f5f7}`;
 return `<!doctype html><html lang="en"${(payload.charts||[]).some(c=>chartIsRtl(c))?' dir="rtl"':''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${String(title||payload.title||'OpenViz').replace(/[<>&"]/g,'')}</title><meta name="generator" content="OpenViz Studio live publication"><style>${css}${brandHtmlCss}</style><style id="ovl-css"></style></head><body><main id="ov-live"></main><script type="application/json" id="ov-payload">${jsonForScript(payload)}</script><script>${runtimeSource.replace(/<\/script/gi,'<\\/script')}</script><script>(function(){var p=JSON.parse(document.getElementById('ov-payload').textContent);document.getElementById('ovl-css').textContent=OpenVizLive.liveRuntimeCss;try{OpenVizLive.mountLive(document.getElementById('ov-live'),p);}catch(e){document.getElementById('ov-live').textContent='This publication could not start: '+e.message;}})();</script></body></html>`;
}
