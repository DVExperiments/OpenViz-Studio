import {editorialTableHtml} from './editorial-table.js';
import {scrollStoryHtml} from './story-scroll.js';
import {buildStorySources} from './story-state.js';
import {publicationChart,responsiveChartCss} from './responsive-chart.js';
/* V3.5 Publishing Studio: self-contained exports and explicit, hosted-URL embeds.
 * No uploads, accounts, third-party scripts or runtime API requests.
 */
import {readableDataMarkup,readableDataCss} from './readable-data.js';
import {buildChart,escapeHtml} from './charts.js';
import {makeInteractiveHtml,enhanceChartHtml,pageDirection} from './exports.js';
import {makeDashboardInteractiveHtml} from './dashboard-interactive.js';
import {standaloneStoryHtml,storySvgAt,storyLayout} from './story.js';
import {chartIsRtl} from './charts.js';

export const PUBLISH_PRESETS=Object.freeze({
 responsive:{label:'Fits any screen (recommended)',ratio:'16 / 9',height:540,description:'Flexible width for websites and blogs'},
 article:{label:'Narrow, for an article',ratio:'4 / 3',height:520,description:'Readable figures in articles and reports'},
 presentation:{label:'Wide, for a presentation',ratio:'16 / 9',height:720,description:'Large frame for slides and full-width publishing'},
 portrait:{label:'Tall, for phones',ratio:'3 / 4',height:680,description:'Narrow column for mobile-first pages'}
});
export const PUBLISH_DEVICES=Object.freeze({desktop:{width:1080,height:620},tablet:{width:700,height:600},phone:{width:375,height:660}});
const safeText=s=>escapeHtml(String(s??''));
export function safePublishUrl(value){
 try {const url=new URL(String(value||'').trim());if(url.username||url.password||url.hash) return null;
  if(url.protocol==='https:')return url.href;
  if(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname))return url.href;
  return null;
 }catch{return null;}
}
export function embedCode(url,title,preset='responsive',{narrative=false}={}){
 const safe=safePublishUrl(url);if(!safe)throw Error('Enter the HTTPS URL where you uploaded your exported HTML file. Localhost HTTP is supported for testing only.');
 const p=PUBLISH_PRESETS[preset]||PUBLISH_PRESETS.responsive;
 // Encode attributes. No script/event handlers are generated.
 return `<iframe src="${safeText(safe)}" title="${safeText(title||'OpenViz visualisation')}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" style="width:100%;max-width:100%;${narrative?'height:85vh;min-height:600px;max-height:960px;':'aspect-ratio:'+p.ratio+';min-height:'+Math.min(p.height,320)+'px;'}border:0;display:block" allowfullscreen></iframe>`;
}
export function publicationAssets(project){
 return {
  chart:(project.charts||[]).map(c=>({id:c.id,title:c.title||'Untitled chart'})),
  dashboard:(project.dashboards||[]).map(d=>({id:d.id,title:d.name||'Dashboard'})),
  story:(project.stories||[]).map(s=>({id:s.id,title:s.name||'Visual story'}))
 };
}
function frameShell(title,svg,showTitle){
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safeText(title)}</title><style>body{font:15px system-ui,Arial,sans-serif;background:#eef2f4;color:#1c2c3e;margin:0;padding:16px}main{max-width:1200px;margin:0 auto}h1{font-size:clamp(17px,2.1vw,26px);margin:6px 0 16px}svg{display:block;width:100%;height:auto;max-width:100%}.figure{min-width:0;overflow:hidden} @media(max-width:520px){body{padding:8px}h1{margin:7px 0 12px}}</style></head><body><main>${showTitle?`<h1>${safeText(title)}</h1>`:''}<div class="figure">${svg}</div></main></body></html>`;
}
function injectResponsiveStyle(html,{preset='responsive',showTitle=true,kind='chart',title='',freeCanvas=false}){
 const p=PUBLISH_PRESETS[preset]||PUBLISH_PRESETS.responsive;
 // Preserve source chart / dashboard SVG geometry and the interactive script.
 // The wrapper only modifies page-level layout. A free-positioned dashboard keeps
 // its own scrollable wide canvas rather than silently moving chart elements.
 const css=`<style id="openviz-publisher-css">html{box-sizing:border-box}*,*::before,*::after{box-sizing:inherit}body{max-width:100%;overflow-x:hidden}body>.container,body>.wrap,body>main{max-width:${preset==='article'?'920px':preset==='portrait'?'720px':'1280px'};width:100%;margin-left:auto;margin-right:auto;box-sizing:border-box}svg{max-width:100%;height:auto}img{max-width:100%} .scroller{max-width:100%;overflow-x:auto} @media(max-width:640px){body{padding:12px!important}.container,.wrap{padding:0;max-width:100%}.controls{gap:8px;max-width:100%}button,select{max-width:100%}${kind==='dashboard'&&!freeCanvas&&preset!=='presentation'?'.grid:not([style]){grid-template-columns:minmax(0,1fr)!important}':''}} </style>`;
 let result=String(html||'');
 const metadata=`<meta name="generator" content="OpenViz Studio 3.52"><meta name="description" content="${safeText(title)} — local-first data visualisation">`;
 if(result.includes('</head>'))result=result.replace('</head>',css+metadata+'</head>');
 else if(/<main\b/i.test(result))result=result.replace(/<html\b[^>]*>/i,match=>match+'<head>'+css+metadata).replace(/<main\b/i,'</head><body><main').replace(/<\/html>/i,'</body></html>');
 else result=result.replace(/<body\b/i,`<head>${css}${metadata}</head><body`);
 if(!showTitle){result=result.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i,'');}
 else if(!/<h1\b/i.test(result)){result=result.replace(/<main\b[^>]*>/i,match=>match+`<h1 class="openviz-published-title">${safeText(title)}</h1>`);}
 return result;
}
function makeStaticDashboardHtml(dash,cards,showTitle){
 const free=dash.mode==='free';const safeNumber=(n,fallback)=>Number.isFinite(Number(n))?Number(n):fallback;
 const articles=cards.map(({chart,rows,item})=>{
  const positions=free?`style="left:${safeNumber(item.x,0)}%;top:${safeNumber(item.y,0)}px;width:${Math.min(100,Math.max(10,safeNumber(item.w,46)))}%;height:${Math.max(80,safeNumber(item.h,295))}px"`:'';
  const svg=publicationChart(rows,{...chart,showTitle:false,showSubtitle:false},chart.type,{width:720,height:460});
  return `<article ${positions}><h2>${safeText(chart.title)}</h2>${svg}</article>`;
 }).join('');
 const css=`body{font:14px system-ui,Arial;background:#eef2f5;color:#1e3444;margin:0;padding:20px}main{max-width:1280px;margin:auto}h1{font-size:24px;margin:0 0 20px}h2{font-size:15px;margin:0 0 10px}article{box-sizing:border-box;padding:12px;border:1px solid #d7e0e7;background:#fff;overflow:hidden;min-width:0}article svg{display:block;width:100%;height:auto;max-height:100%}.grid{${free?`position:relative;min-width:780px;height:${Math.max(300,safeNumber(dash.canvasHeight,900))}px`:'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:16px'}}.scroller{overflow:auto;max-width:100%}${free?'article{position:absolute;display:flex;flex-direction:column}article svg{height:100%}':''}@media(max-width:650px){body{padding:10px}}`;
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safeText(dash.name)}</title><style>${css}${readableDataCss}${responsiveChartCss}</style></head><body><main>${showTitle?`<h1>${safeText(dash.name)}</h1>`:''}<div class="scroller"><div class="grid">${articles}</div></div>${cards.map(({rows,chart})=>readableDataMarkup(rows,chart,false)).join('')}</main></body></html>`;
}
/** Generates the exact self-contained file that can be previewed and published.
 * Data is rendered locally. This does NOT upload anything to the internet.
 */
export function createPublication(project,opts){
 const {kind='chart',assetId,preset='responsive',interactive=true,showTitle=true}=opts||{};
 const assets=publicationAssets(project),asset=assets[kind]?.find(x=>x.id===assetId);
 if(!asset)throw Error('Select an existing chart, dashboard or story first.');
 let html,narrative=false;
 if(kind==='chart'){
  const c=project.charts.find(x=>x.id===assetId),ds=project.datasets.find(x=>x.id===c.datasetId);
  if(!ds)throw Error('The selected chart is missing its dataset.');
  html=pageDirection(c.type==='editorial-table'?editorialTableHtml(ds.rows,c,interactive):interactive?makeInteractiveHtml(ds.rows,c):enhanceChartHtml(frameShell(asset.title,publicationChart(ds.rows,c),showTitle),ds.rows,c,false),chartIsRtl(c));
 }else if(kind==='dashboard'){
  const dash=project.dashboards.find(d=>d.id===assetId);
  const cards=(dash.chartIds||[]).map(id=>{const c=project.charts.find(x=>x.id===id),ds=c&&project.datasets.find(d=>d.id===c.datasetId);return c&&ds?{chart:c,rows:ds.rows,item:dash.items?.find(it=>it.chartId===id)||{}}:null;}).filter(Boolean);
  if(!cards.length)throw Error('Add a chart to the dashboard before publishing.');
  html=pageDirection(interactive?makeDashboardInteractiveHtml(dash,cards,dash.sharedFilterField||''):makeStaticDashboardHtml(dash,cards,showTitle),cards.some(x=>chartIsRtl(x.chart)));
 }else if(kind==='story'){
  const st=project.stories.find(s=>s.id===assetId);if(!st.scenes?.length)throw Error('Add a scene to the story before publishing.');
  const built=buildStorySources(project,st),sources=built.sources;if(built.errors.length)throw Error('Scene '+(built.errors[0].index+1)+': '+built.errors[0].message);
  narrative=st.delivery==='scroll';html=narrative?scrollStoryHtml(st,sources,{interactive}):interactive?standaloneStoryHtml(st,sources):frameShell(st.name,storySvgAt(st,sources,storyLayout(st).duration),showTitle);
 }else throw Error('Unknown publication type.');
 return {html:injectResponsiveStyle(html,{preset,showTitle,kind,title:asset.title,freeCanvas:kind==='dashboard'&&project.dashboards.find(d=>d.id===assetId)?.mode==='free'}),title:asset.title,kind,preset,interactive,narrative,filename:(asset.title||'openviz').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50)+'-publish.html'};
}
export function publishingReadme(pub,hostedUrl=''){
 const url=safePublishUrl(hostedUrl),code=url?embedCode(url,pub.title,pub.preset,{narrative:pub.narrative}):'(Add your HTTPS hosting URL in OpenViz Publishing Studio to generate the embed code.)';
 return `OpenViz Studio 3.52 — Publishing Kit\n\nTITLE: ${pub.title}\nTYPE: ${pub.kind}\nMODE: ${pub.interactive?'Interactive':'Static'}\nPRESET: ${pub.preset}\n\n1. Open index.html locally to check the result.\n2. Upload index.html to your own website, static host or web server.\n3. Copy the exact HTTPS URL of the hosted index.html into OpenViz Publishing Studio.\n4. Copy the generated iframe snippet into your website's HTML/embed component.\n\nEMBED CODE\n${code}\n\nPRIVACY AND SECURITY\n- This file contains the rendered visualisation and possibly pre-rendered category variants.\n- Charts and tooltips may reveal spreadsheet data. Inspect before publishing.\n- No user account, analytics library or third-party API is required.\n- OpenViz does not upload files for you and does not provide a hosted URL.\n- A locally opened file:// URL is not a public iframe source.\n- Some website builders restrict iframe embeds; check your platform's documentation.\n- Responsive dashboards reflow; free-canvas dashboards preserve position and scroll on narrow screens.\n`;
}
