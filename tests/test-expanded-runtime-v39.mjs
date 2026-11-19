// DOM/XML and self-contained export runtime checks, not browser layout certification.
import assert from 'node:assert/strict';
import {EXPANDED_TYPES} from '../src/expanded-charts.js';
import {buildChart,DEFAULT_CHART} from '../src/charts.js';
import {chartExample} from '../src/catalogue.js';
import {makeInteractiveHtml} from '../src/exports.js';
const {JSDOM}=await import(process.env.OPENVIZ_DOM_MODULE||'jsdom');
const parse=new JSDOM('').window;
for(const type of EXPANDED_TYPES){
 const ex=chartExample(type),cfg={...DEFAULT_CHART,...ex,type,showLegend:true};
 for(const width of [360,768,1440]){
  const svg=buildChart(ex.rows,cfg,type,{width,height:540});const doc=new parse.DOMParser().parseFromString(svg,'image/svg+xml');assert(!doc.querySelector('parsererror'),type+' valid XML');
  for(const el of doc.querySelectorAll('rect,circle,line'))for(const attr of ['x','y','cx','cy','r','x1','x2','y1','y2','width','height'])if(el.hasAttribute(attr))assert(Number.isFinite(Number(el.getAttribute(attr))),type+' finite '+attr);
  if(type==='small-multiples'){const scales=[...doc.querySelectorAll('[data-viz-shared-scale]')].map(e=>e.getAttribute('data-viz-shared-scale'));assert.equal(scales.length,3);assert.equal(new Set(scales).size,1);}
 }
 const errors=[];const html=makeInteractiveHtml(ex.rows,cfg);const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:true});w.addEventListener('error',e=>errors.push(e.message));}});
 const d=dom.window.document,select=d.querySelector('select');assert(select,type+' selector');const full=(d.querySelector('#frame')||d.querySelector('[data-race-stage]')).innerHTML;if(['bar-race','line-race'].includes(type)){d.querySelector('[data-race-next]').click();assert.notEqual(d.querySelector('#frame')?.innerHTML||d.querySelector('[data-race-stage]').innerHTML,full);}else if(select.options.length>1){select.selectedIndex=(select.selectedIndex+1)%select.options.length;select.dispatchEvent(new dom.window.Event('change'));assert(d.querySelector('#frame svg'));assert.notEqual(d.querySelector('#frame').innerHTML,full,type+' changed frame');}assert.equal(errors.length,0,type+' script errors');dom.window.close();
}
const s={...DEFAULT_CHART,type:'multi-line',x:'Year',y:'Value',seriesField:'Series',showLegend:true};
const gap=[{Year:2021,Series:'A',Value:1},{Year:2024,Series:'A',Value:5},{Year:2021,Series:'B',Value:2},{Year:2022,Series:'B',Value:3},{Year:2024,Series:'B',Value:4}];
const doc=new parse.DOMParser().parseFromString(buildChart(gap,s),'image/svg+xml');const aPaths=[...doc.querySelectorAll('path[data-viz-part=series]')].filter(p=>p.querySelector('title')?.textContent==='A');assert.equal(aPaths.length,2);assert(aPaths.every(p=>!p.getAttribute('d').includes('L')));
const xs=[...doc.querySelectorAll('g[data-viz-part=point]')].filter(g=>g.querySelector('title')?.textContent.includes('/ B:')).map(g=>Number(g.querySelector('circle').getAttribute('cx')));assert(Math.abs((xs[1]-xs[0])/(xs[2]-xs[1])-.5)<1e-9,'numeric X spacing preserves unequal periods');
parse.close();console.log('PASS 18 expanded templates: SVG XML/numeric geometry at 360/768/1440, equal facet scales, actual standalone HTML category-filter scripts, missing-line gaps and continuous X spacing');
