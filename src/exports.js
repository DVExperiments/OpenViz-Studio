import {comboSeries} from './pro-charts.js';
import {editorialTableHtml} from './editorial-table.js';
import {validateRouteSettings} from './route-map.js';
import {validateMapClassification} from './map-classification.js';
import {validateMapFrame} from './map-projection.js';
import {validateMapAuthoring} from './map-authoring.js';
import {boundaryAsset} from './regional-map.js';
import {TIME_TYPES,timePlayerMarkup,timeRuntimeScript} from './time-controls.js';
import {raceCss} from './race.js';
import {raceInteractiveHtml} from './race.js';
import {publicationChart,responsiveChartCss} from './responsive-chart.js';
import {readableDataMarkup,readableDataCss} from './readable-data.js';
import {interactionScript,interactionCss} from './chart-interactions.js';
import {makeResearchInteractiveHtml} from './research-charts.js';
import {EXPANDED_TYPES} from './expanded-charts.js';
import {buildChart,chartData,escapeHtml,chartIsRtl} from './charts.js';
import {slideLogoPlacement} from './brand.js';
export function download(name,blob){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);}
export function exportSvg(svg,name='openviz-chart.svg'){download(name,new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));}
export function svgExportDimensions(svg,width,height){const match=String(svg).match(/<svg\b[^>]*\bviewBox="([^"]+)"/i),box=match?.[1].trim().split(/[\s,]+/).map(Number);if(box?.length===4&&box.every(Number.isFinite)&&box[2]>0&&box[3]>0&&Number.isFinite(width)&&width>0)return {width,height:width*box[3]/box[2]};return {width,height};}
export async function svgToPng(svg,width,height,scale=2){({width,height}=svgExportDimensions(svg,width,height));const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob);try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('SVG could not be rasterised'));img.src=url;});const canvas=document.createElement('canvas');canvas.width=width*scale;canvas.height=height*scale;const context=canvas.getContext('2d');context.scale(scale,scale);context.drawImage(img,0,0,width,height);return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG generation failed')),'image/png'));}finally{URL.revokeObjectURL(url);}}
export function exportHtml(svg,title='OpenViz visualisation'){const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>body{margin:0;background:transparent;display:grid;place-items:center;min-height:100vh}svg{width:100%;height:auto;max-width:100%;display:block}</style></head><body>${svg}</body></html>`;download('openviz-embed.html',new Blob([html],{type:'text/html;charset=utf-8'}));}
/** V2.7 self-contained accessible HTML: no network calls or remote scripts.
 * Category filtering pre-renders the SVG from actual filtered rows, keeping the
 * authoritative chart engine and its aggregation semantics unchanged.
 */
function baseInteractiveHtml(rows,chart){if(chart.timeEnabled&&TIME_TYPES.has(chart.type))return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(chart.title||'Time snapshots')}</title><style>body{margin:16px;font:14px system-ui;color:#172e3e;background:#edf2f5}${raceCss}${responsiveChartCss}</style></head><body><main>${timePlayerMarkup(rows,chart,publicationChart)}</main><script>${timeRuntimeScript}</script></body></html>`;if(['bar-race','line-race'].includes(chart.type))return raceInteractiveHtml(rows,chart,publicationChart);const research=makeResearchInteractiveHtml(rows,chart,publicationChart);if(research)return research;
 const title=escapeHtml(chart.title||'OpenViz visualisation');
 const sourceRows=Array.isArray(rows)?rows:[];
 const filterTypes=new Set([...EXPANDED_TYPES,'bar','hbar','dot','stacked-bar','heatmap','treemap','geo-choropleth','geo-symbol']);
 const x=chart.x,unique=x&&filterTypes.has(chart.type)?[...new Set(sourceRows.map(r=>r[x]).filter(v=>v!==null&&v!==undefined&&v!==''))]:[];
 const filterable=unique.length>=2&&unique.length<=15&&sourceRows.length<=30000&&!(['geo-choropleth','geo-symbol'].includes(chart.type)&&chart.geoCustom);
 const filterValues=filterable?unique:[];
 const fullSvg=publicationChart(sourceRows,chart);if(['geo-choropleth','geo-symbol'].includes(chart.type)&&chart.geoCustom&&new TextEncoder().encode(fullSvg).length>24*1024*1024)throw Error('Regional HTML exceeds 24 MiB. Reduce geometry or label length.');
 const frames=filterValues.map((value,i)=>({key:`cat${i}`,name:String(value),svg:publicationChart(sourceRows.filter(r=>r[x]===value),chart)}));
 const options=frames.map(f=>`<option value="${f.key}">${escapeHtml(f.name)}</option>`).join('');
 // A script is only a static application module: user-provided values are placed
 // exclusively in escaped SVG / HTML text nodes, never interpolated into JS.
 const script=`
 (function(){
  const stage=document.getElementById('frame'),selector=document.getElementById('focus'),speed=document.getElementById('speed'),tip=document.getElementById('tip');
  function bind(){
   stage.querySelectorAll('[data-viz-part="point"],[data-viz-part="series"]').forEach((mark,index)=>{mark.classList.add('motion-mark');mark.style.setProperty('--order',String(Math.min(index,28)));});
   const svg=stage.querySelector('svg');if(svg){svg.setAttribute('role','group');}
  }
  function play(){if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;stage.classList.remove('animate');stage.offsetHeight;stage.style.setProperty('--duration',speed.value+'ms');stage.classList.add('animate');}
  function refresh(){tip.hidden=true;const selected=selector?.value||'all';const node=selected==='all'?document.getElementById('frame-all'):document.getElementById('frame-'+selected);if(!node)return;stage.replaceChildren(node.content.cloneNode(true));bind();play();}
  if(selector)selector.addEventListener('change',refresh);speed.addEventListener('change',play);document.getElementById('replay').addEventListener('click',play);
  stage.addEventListener('pointermove',event=>{const mark=event.target.closest('[data-viz-part="point"],[data-viz-part="series"]');const title=mark?.querySelector('title')||mark?.closest('g')?.querySelector('title');if(!title?.textContent){tip.hidden=true;return;}tip.textContent=title.textContent;tip.hidden=false;tip.style.left=Math.min(innerWidth-240,event.clientX+14)+'px';tip.style.top=Math.max(4,event.clientY-46)+'px';});
  stage.addEventListener('pointerleave',()=>tip.hidden=true);stage.addEventListener('focusout',()=>tip.hidden=true);
  refresh();
 })();`;
 const css=`:root{color-scheme:light;font-family:system-ui,Arial,sans-serif}body{margin:0;padding:18px;background:#eef2f5;color:#182838}.container{max-width:1200px;margin:auto}.controls{display:flex;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:12px;font-size:13px}.controls select,.controls button{padding:9px 11px;border:1px solid #acbdc9;border-radius:6px;background:white;color:#1a3443;cursor:pointer}.controls button{background:#157f7a;color:white;border:0}.controls label{display:flex;align-items:center;gap:6px}.frame{background:transparent;min-width:0}.frame svg{display:block;width:100%;height:auto;max-width:100%}.note{font-size:12px;color:#596f7b;margin-top:8px}.motion-mark{transform-box:fill-box}.animate .motion-mark{animation:reveal var(--duration,800ms) ease-out backwards;animation-delay:calc(var(--order,0)*22ms)}@keyframes reveal{from{opacity:0}to{opacity:1}}#tip{position:fixed;z-index:10;max-width:220px;background:#1b2d3b;color:white;border-radius:5px;padding:8px 10px;box-shadow:0 4px 16px #0005;font-size:12px;pointer-events:none;white-space:normal}@media(prefers-reduced-motion:reduce){.animate .motion-mark{animation:none!important}}`;
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css}</style></head><body><main class="container"><div class="controls" aria-label="Chart interactions">${filterable?`<label>Filter ${escapeHtml(x)} <select id="focus" aria-label="Filter chart categories"><option value="all">All categories</option>${options}</select></label>`:''}<label>Animation <select id="speed" aria-label="Animation duration"><option value="500">Fast</option><option value="800" selected>Normal</option><option value="1600">Slow</option></select></label><button id="replay" type="button">Replay animation</button></div><div class="frame" id="frame" aria-live="polite"></div><p class="note">${filterable?'Changing the filter recalculates the visualisation and may rescale axes. Compare totals with care.':'Hover over data marks for available details. Filtering requires a supported categorical chart with 2–15 distinct categories.'} Animated effects are disabled when reduced motion is preferred. Self-contained; no external services.</p><template id="frame-all">${fullSvg}</template>${frames.map(f=>`<template id="frame-${f.key}">${f.svg}</template>`).join('')}<div id="tip" role="status" hidden></div></main><script>${script}</script></body></html>`;
}
export function enhanceChartHtml(html,rows,chart,interactive=true){return html.replace('</head>',`<style>${readableDataCss}${interactionCss}${responsiveChartCss}</style></head>`).replace('</main>',readableDataMarkup(rows,chart,interactive)+'</main>').replace('</body>',`${interactive?'<script>'+interactionScript+'</script>':''}</body>`);}
export function makeInteractiveHtml(rows,chart){const html=chart.type==='editorial-table'?editorialTableHtml(rows,chart,true):enhanceChartHtml(baseInteractiveHtml(rows,chart),rows,chart);return pageDirection(html,chartIsRtl(chart));}
// V3.60: right-to-left charts publish as right-to-left pages (tables, captions and controls follow).
export function pageDirection(html,rtl){return rtl?String(html).replace(/<html lang="([^"]*)"(?![^>]*dir=)/,'<html lang="$1" dir="rtl"'):html;}
export function exportInteractiveHtml(rows,chart){const html=makeInteractiveHtml(rows,chart);download(`${slug(chart.title)}-interactive.html`,new Blob([html],{type:'text/html;charset=utf-8'}));}
export async function exportProject(project){if(!window.JSZip)throw new Error('ZIP export library missing');const zip=new JSZip();zip.file('manifest.json',JSON.stringify({format:'openviz-studio',version:1,exportedAt:new Date().toISOString(),project},null,2));zip.file('README.txt','OpenViz Studio project archive. Open from File > Open project in OpenViz Studio. Contains dataset values; keep private if sensitive.');const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:4}});download(`${slug(project.name)}.openviz`,blob);}
/** V3.0: reject structurally dangerous, oversized, or malformed portable documents
 * before promoting them into the active project. No transformations are applied:
 * imported chart styles and data retain their original representation.
 */
export function validatePortableProject(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid project document.');
 const allowedShape=[['datasets',120],['charts',1000],['dashboards',150],['slides',300],['stories',200],['versions',5000]];
 for(const [key,max] of allowedShape){const item=value[key];if(item!==undefined&&(!Array.isArray(item)||item.length>max))throw new Error(`Project has too many or invalid ${key}.`);}
 if(!Array.isArray(value.datasets)||!Array.isArray(value.charts)||!Array.isArray(value.slides)||!Array.isArray(value.versions))throw new Error('Missing core project collections.');
 if(typeof value.id!=='string'||!value.id||value.id.length>180||typeof value.name!=='string'||value.name.length>300)throw new Error('Invalid project identity.');
 let totalRows=0;
 for(const ds of value.datasets){
  if(!ds||typeof ds!=='object'||typeof ds.id!=='string'||!Array.isArray(ds.rows)||ds.rows.length>100000)throw new Error('Invalid or oversized dataset.');
  totalRows+=ds.rows.length;if(totalRows>250000)throw new Error('Project contains too many rows for this browser edition.');
  for(const row of ds.rows){if(!row||typeof row!=='object'||Array.isArray(row))throw new Error('Dataset contains an invalid observation.');
   const keys=Object.keys(row);if(keys.length>250)throw new Error('Dataset has too many columns.');
   if(keys.some(key=>['__proto__','constructor','prototype'].includes(key)||key.length>300))throw new Error('Dataset contains a reserved or oversized field name.');
  }
 }
 for(const c of value.charts){if(!c||typeof c!=='object'||typeof c.id!=='string')throw new Error('Invalid chart entry.');validateRouteSettings(c);validateMapClassification(c);validateMapAuthoring(c);validateMapFrame(c);if(c.geoCustom!==null&&c.geoCustom!==undefined)boundaryAsset(c.geoCustom);}
 for(const s of value.slides)if(!s||typeof s!=='object'||!Array.isArray(s.objects)||s.objects.length>400)throw new Error('Slide has invalid or excessive objects.');
 return true;
}
export async function importProjectFile(file){if(file.size>30*1024*1024)throw new Error('Project archive exceeds 30 MB safety limit.');let value;if(file.name.toLowerCase().endsWith('.openviz')){const zip=await JSZip.loadAsync(file),manifest=zip.file('manifest.json');if(!manifest)throw new Error('Not an OpenViz project archive.');if((manifest._data?.uncompressedSize||0)>65*1024*1024)throw new Error('Project data exceeds safe expanded-size limits.');value=JSON.parse(await manifest.async('string'));if(value.format!=='openviz-studio'||value.version!==1)throw new Error('Project file version is not supported.');value=value.project;}else value=JSON.parse(await file.text());if(!value||!Array.isArray(value.datasets)||!Array.isArray(value.charts)||!Array.isArray(value.slides)||!Array.isArray(value.versions)||!value.datasets.every(d=>Array.isArray(d.rows))||!value.slides.every(s=>Array.isArray(s.objects)))throw new Error('Invalid OpenViz project file.');validatePortableProject(value);return value;}
/** Slide-specific SVG composition. Tight content bounds exclude the source canvas's oversized empty padding.
 * The output SVG uses identical geometry for the editor preview and SVG-backed PPTX export.
 */
export function slideChartGraphic(rows,chart,obj={}){
 const wantsCrop=obj.cropToContent!==false;
 const working={...chart,showTitle:!!obj.showChartTitle,showSubtitle:!!obj.showChartSubtitle,padding:25,transparent:!obj.showChartBackground};
 const raw=buildChart(rows,working,chart.type,{width:960,height:540});
 if(!wantsCrop||typeof document==='undefined')return {svg:raw,ratio:960/540,cropped:false};
 const holder=document.createElement('div');holder.style.cssText='position:fixed;left:-10000px;top:-10000px;width:960px;height:540px;opacity:0;pointer-events:none;visibility:hidden;z-index:-1';
 holder.innerHTML=raw;
 document.body.appendChild(holder);
 let result={svg:raw,ratio:960/540,cropped:false};
 try{
  const root=holder.querySelector('svg');if(!root)return result;
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const el of Array.from(root.children)){
   const tag=el.tagName.toLowerCase();if(['title','desc','defs','style','clippath'].includes(tag)||el.getAttribute('data-viz-part')==='background')continue;
   if(typeof el.getBBox!=='function')continue;
   let b;try{b=el.getBBox();}catch{continue;}
   if(!b||!Number.isFinite(b.x+b.y+b.width+b.height))continue;
   const t=el.getCTM?.();
   const pts=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]];
   for(const [x,y] of pts){const px=t?t.a*x+t.c*y+t.e:x,py=t?t.b*x+t.d*y+t.f:y;minX=Math.min(px,minX);minY=Math.min(py,minY);maxX=Math.max(px,maxX);maxY=Math.max(py,maxY);}
  }
  if(!Number.isFinite(minX)||maxX-minX<24||maxY-minY<24)return result;
  const gap=10,x=Math.floor(minX-gap),y=Math.floor(minY-gap),w=Math.ceil(maxX-minX+gap*2),h=Math.ceil(maxY-minY+gap*2);
  const bg=root.querySelector('[data-viz-part="background"]');
  if(bg){if(obj.showChartBackground){bg.setAttribute('x',x);bg.setAttribute('y',y);bg.setAttribute('width',w);bg.setAttribute('height',h);}else bg.remove();}
  root.setAttribute('viewBox',`${x} ${y} ${w} ${h}`);root.setAttribute('width',String(w));root.setAttribute('height',String(h));
  result={svg:root.outerHTML,ratio:w/h,cropped:true};
 }finally{holder.remove();}
 return result;
}
export function slug(name){return String(name||'openviz').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'openviz';}
function needsFaithfulVectorExport(chart){
 // Native PowerPoint charts cannot faithfully preserve all custom SVG geometry and styling yet.
 const nonDefault=['marginTop','marginRight','marginBottom','marginLeft','yMin','yMax'].some(k=>chart[k]!==null&&chart[k]!==undefined&&chart[k]!=='');
 const custom=chart.valueFormat&&chart.valueFormat!=='compact'||chart.legendPosition&&chart.legendPosition!=='top-right'||chart.gridDash&&chart.gridDash!=='dashed'||chart.titleAlign&&chart.titleAlign!=='left'||chart.titleColor||chart.xLabelRotation||chart.barWidthRatio&&chart.barWidthRatio!==0.68||chart.axisLineWidth&&chart.axisLineWidth!==1||chart.gridWidth&&chart.gridWidth!==1||chart.showXAxis===false||chart.showYAxis===false;
 return nonDefault||!!custom||Object.values(chart.valueLabelOffsets||{}).some(p=>p&&((Number(p.x)||0)!==0||(Number(p.y)||0)!==0))||Object.values(chart.textOffsets||{}).some(p=>p&&((Number(p.x)||0)!==0||(Number(p.y)||0)!==0))||Object.keys(chart.pointColors||{}).length>0||(chart.annotations||[]).some(a=>!a.hidden)||chart.legendPosition==='custom';
}
/** Predicts whether PowerPoint receives a genuinely editable native chart or an SVG.
 * Keep this shared with the inspector so the UI reports the same decision as the exporter.
 */
export function pptxChartMode(chart,obj,data){
 const nativeTypes=['bar','line','area','hbar','donut','stacked-bar','pie','combo'];
 const eligible=nativeTypes.includes(chart.type)&&Array.isArray(data)&&data.length>0&&data.length<=35&&(chart.type!=='stacked-bar'||!!chart.seriesField);
 if(obj.pptxMode==='vector')return 'vector';
 // A conscious user preference can choose fully editable data over pixel-perfect styling.
 if(obj.pptxMode==='editable')return eligible?'native':'vector';
 return eligible&&obj.cropToContent===false&&!needsFaithfulVectorExport(chart)?'native':'vector';
}
function stackedSeries(rows,chart){
 const groups=new Map(),categories=[],series=[];
 if(!chart.seriesField)return [];
 for(const row of rows){const x=String(row[chart.x]??'Unknown'),group=String(row[chart.seriesField]??'Unknown'),v=Number(row[chart.y]);
  if(chart.aggregation!=='count'&&(row[chart.y]==null||String(row[chart.y]).trim()===''||!Number.isFinite(v)))continue;if(!categories.includes(x))categories.push(x);if(!series.includes(group))series.push(group);
  const key=JSON.stringify([x,group]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(v);
 }
 if(!categories.length||categories.length>32||series.length>16||!series.length)return [];
 function agg(vals){if(!vals.length)return 0;const sum=vals.reduce((a,b)=>a+b,0);switch(chart.aggregation){case 'average':return sum/vals.length;case 'count':return vals.length;case 'min':return Math.min(...vals);case 'max':return Math.max(...vals);default:return sum;}}
 const out=series.map(group=>({name:group,labels:categories,values:categories.map(x=>agg(groups.get(JSON.stringify([x,group]))||[]))}));
 return out.some(s=>s.values.some(v=>v<0))?[]:out;
}
function svgDataUrl(svg){return 'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg)));}
/** Editable PowerPoint text and geometry, native charts for supported visualisations. */
export async function exportPptx(project,slides,datasetForChart){if(!window.PptxGenJS)throw new Error('PowerPoint exporter could not load.');const p=new PptxGenJS();p.layout='LAYOUT_WIDE';p.author='OpenViz Studio';p.subject='Editable visualisations and presentations';p.title=project.name;p.company='OpenViz Studio';p.lang='en-NZ';
 const pw=13.333,ph=7.5;
 for(const slideSpec of slides){const slide=p.addSlide();slide.background={color:/^#[0-9a-f]{6}$/i.test(slideSpec.background||'')?slideSpec.background.slice(1):'FFFFFF'};for(const obj of slideSpec.objects){if(obj.hidden)continue;const x=Number(obj.x||0)/100*pw,y=Number(obj.y||0)/100*ph,w=Math.max(.1,Number(obj.w||1)/100*pw),h=Math.max(.1,Number(obj.h||1)/100*ph);
  if(obj.type==='text'){slide.addText(obj.text||'',{x,y,w,h,fontFace:fontFace(obj.font),fontSize:Math.max(8,Number(obj.fontSize)||28),bold:!!obj.bold,italic:!!obj.italic,underline:!!obj.underline,align:['left','center','right'].includes(obj.align)?obj.align:'left',valign:['top','mid','bottom'].includes(obj.valign)?obj.valign:(obj.valign==='middle'?'mid':'top'),charSpacing:Math.max(-1,Math.min(8,Number(obj.letterSpacing)||0))*.75,color:(obj.color||'#1c2c3e').replace('#',''),margin:0,lineSpacingMultiple:Math.min(3,Math.max(.8,Number(obj.lineHeight)||1.16)),breakLine:false});continue;}
  if(obj.type==='rect'){const kind=obj.shapeKind==='ellipse'?p.ShapeType.ellipse:obj.shapeKind==='roundRect'?p.ShapeType.roundRect:p.ShapeType.rect;
   const opacity=Math.max(0,Math.min(100,Number(obj.opacity ?? 100)));const stroke=Math.max(0,Number(obj.borderWidth)||0);
   slide.addShape(kind,{x,y,w,h,rectRadius:obj.shapeKind==='roundRect'?Math.max(0,Number(obj.radius)||16)/96:0,
    fill:{color:(obj.color||'#e9f5f3').replace('#',''),transparency:obj.fillEnabled===false?100:100-opacity},
    line:{color:(obj.strokeColor||obj.color||'#e9f5f3').replace('#',''),transparency:stroke?100-opacity:100,width:stroke*.75}});continue;}
  if(obj.type==='chart'){const chart=project.charts.find(c=>c.id===obj.chartId);if(!chart)continue;const ds=datasetForChart(chart);if(!ds)continue;const data=chartData(ds.rows,chart,chart.type);if(!data.length)continue;
   const pptType={bar:p.ChartType.bar,line:p.ChartType.line,area:p.ChartType.area,hbar:p.ChartType.bar,donut:p.ChartType.doughnut,'stacked-bar':p.ChartType.bar,pie:p.ChartType.pie,combo:p.ChartType.bar}[chart.type];
   if(chart.type==='combo'&&pptxChartMode(chart,obj,data)==='native'){try{const cs=comboSeries(ds.rows,chart),pal=(Array.isArray(chart.palette)&&chart.palette.length>=2?chart.palette:[chart.color||'#0d9488',chart.secondary||'#f2aa64']).map(c=>c.replace('#',''));const font=fontFace(chart.font),txt=(chart.textColor||'#1c2c3e').replace('#','');slide.addChart([{type:p.ChartType.bar,data:[{name:chart.y||'Columns',labels:cs.labels,values:cs.columns}],options:{chartColors:[pal[0]],barGrouping:'clustered',barGapWidthPct:60}},{type:p.ChartType.line,data:[{name:chart.endField||'Line',labels:cs.labels,values:cs.line}],options:{chartColors:[pal[1]],lineSize:2.5,lineDataSymbol:'circle',lineDataSymbolSize:6,...(cs.dual?{secondaryValAxis:true,secondaryCatAxis:true}:{})}}],{x,y,w,h,showLegend:true,legendPos:'t',legendFontFace:font,legendColor:txt,showTitle:!!obj.showChartTitle,title:obj.showChartTitle?(chart.title||''):'',showBlankAs:'gap',...(cs.dual?{valAxes:[{showValAxisTitle:true,valAxisTitle:chart.y||'',valAxisLabelFontFace:font,valAxisLabelColor:txt,valGridLine:chart.showGrid?{color:'DFE6EC',size:.7}:{style:'none'}},{showValAxisTitle:true,valAxisTitle:chart.endField||'',valAxisLabelFontFace:font,valAxisLabelColor:pal[1],valGridLine:{style:'none'}}],catAxes:[{catAxisLabelFontFace:font,catAxisLabelColor:txt},{catAxisHidden:true}]}:{catAxisLabelFontFace:font,valAxisLabelFontFace:font})});continue;}catch(e){console.warn('Native combo fallback',e);}}
   // Native PowerPoint charts are editable. Charts with per-point colour overrides use SVG fallback to preserve exact colours; the native chart exporter does not yet support point-level formatting.
   if(pptType&&pptxChartMode(chart,obj,data)==='native'){
    const chartSeries=chart.type==='stacked-bar'?stackedSeries(ds.rows,chart):[{name:chart.y||'Values',labels:data.map(d=>String(d.x)),values:data.map(d=>d.y)}];
    if(chartSeries.length)try{slide.addChart(pptType,chartSeries,{x,y,w,h,showTitle:!!obj.showChartTitle,title:obj.showChartTitle?(chart.title||''):'',showLegend:!!chart.showLegend,showValue:!!chart.showLabels,showCatName:false,showPercent:false,showMarker:chart.type==='line',catAxisLabelFontSize:11,valAxisLabelFontSize:11,chartColors:(chartSeries.length===1&&!['pie','donut'].includes(chart.type)?[chart.color||(Array.isArray(chart.palette)&&chart.palette[0])||'#0d9488']:(Array.isArray(chart.palette)&&chart.palette.length>=2?chart.palette:[chart.color||'#0d9488',chart.secondary||'#f2aa64','#6d83b5','#bf7f9d','#66ab94','#b99b62'])).map(c=>String(c).replace('#','')),showValue:false,showLeaderLines:false,showBorder:false,showLine:false,showCatName:false,showShadow:false,showLegendKey:false,showChartArea:false,showPlotArea:false,showSerName:false,showValue:false,showMarker:chart.type==='line',showValAxis:!['donut','pie'].includes(chart.type),showCatAxis:!['donut','pie'].includes(chart.type),showPercent:chart.type==='pie',dataLabelPosition:chart.type==='pie'?'bestFit':undefined,showValue:!!chart.showLabels,showTitle:!!obj.showChartTitle,showGridLines:!!chart.showGrid,catAxisLabelColor:(chart.textColor||'#1c2c3e').replace('#',''),valAxisLabelColor:(chart.textColor||'#1c2c3e').replace('#',''),invertedColors:['FFFFFF'],holeSize:55,catAxisLabelRotate:0,showValAxisTitle:false,showCatAxisTitle:false,showBlankAs:'gap',showMultiLvlLabels:false,invertedColors:false,showLine:false,showBorder:false,showMarker:chart.type==='line',valGridLine:chart.showGrid?{color:'DFE6EC',width:.7}:{color:'FFFFFF',transparency:100},catAxisLabelFontFace:fontFace(chart.font),valAxisLabelFontFace:fontFace(chart.font),...(chart.type==='bar'||chart.type==='hbar'||chart.type==='area'?{valAxisMinVal:0}:{}),barDir:chart.type==='hbar'?'bar':'col',barGrouping:chart.type==='stacked-bar'?'stacked':'clustered',showLegend:!!chart.showLegend,...(chart.type==='pie'?{showLegend:true,legendPos:'r',legendFontFace:fontFace(chart.font)}:{})});continue;}catch(e){console.warn('Native chart fallback',e);}
   }
   const svg=slideChartGraphic(ds.rows,chart,obj).svg;slide.addImage({data:svgDataUrl(svg),x,y,w,h});
  }
 }
 const logo=slideLogoPlacement(project,slideSpec);if(logo)slide.addImage({data:await rasterLogo(logo.dataUri),x:logo.x/100*pw,y:logo.y/100*ph,w:logo.w/100*pw,h:logo.h/100*ph,altText:'Logo'});
 }
 const blob=await p.write({outputType:'blob'});download(`${slug(project.name)}.pptx`,blob);
}
// PowerPoint reliably shows PNG and JPEG; other logo formats are rasterised at 4x for crisp output.
const rasterCache=new Map();
export async function rasterLogo(dataUri,{type='image/png',background=null}={}){if(!background&&/^data:image\/(png|jpeg);/.test(dataUri)&&type==='image/png')return dataUri;const key=dataUri.length+':'+dataUri.slice(-64)+type+background;if(rasterCache.has(key))return rasterCache.get(key);
 const img=new Image();await new Promise((ok,fail)=>{img.onload=ok;img.onerror=()=>fail(new Error('The logo image could not be read.'));img.src=dataUri;});
 const w=Math.max(16,Math.min(2400,(img.naturalWidth||400)*(img.naturalWidth<600?4:1))),h=Math.max(16,Math.round(w*((img.naturalHeight||100)/(img.naturalWidth||400))));const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const g=canvas.getContext('2d');if(background){g.fillStyle=background;g.fillRect(0,0,w,h);}g.drawImage(img,0,0,w,h);
 const out=canvas.toDataURL(type,.94);rasterCache.set(key,out);return out;}
function fontFace(v){const first=String(v||'Arial').split(',')[0].trim().replace(/^['\"]|['\"]$/g,'');if(first==='sans-serif')return 'Arial';if(first==='serif')return 'Georgia';if(first==='monospace')return 'Courier New';return /^[A-Za-z0-9 _-]{1,64}$/.test(first)?first:'Arial';}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
