/** DOM-level integration checks. Install jsdom and set OPENVIZ_DOM_MODULE if needed.
 * This is not a browser layout, persistence or accessibility certification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const {JSDOM}=await import(process.env.OPENVIZ_DOM_MODULE||'jsdom');
const root=new URL('../',import.meta.url);
const dom=new JSDOM(readFileSync(new URL('index.html',root),'utf8'),{url:'https://openviz.test/',pretendToBeVisual:true});
const {window}=dom;
window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
window.HTMLElement.prototype.scrollIntoView=function(){};
for(const key of ['window','document','localStorage','DOMParser','HTMLElement','Element','SVGElement','Image','FileReader','XMLSerializer','getComputedStyle','requestAnimationFrame','cancelAnimationFrame'])Object.defineProperty(globalThis,key,{value:key==='window'?window:typeof window[key]==='function'&&['requestAnimationFrame','cancelAnimationFrame','getComputedStyle'].includes(key)?window[key].bind(window):window[key],configurable:true});
globalThis.innerWidth=window.innerWidth=1600;globalThis.matchMedia=window.matchMedia;
Object.defineProperty(globalThis,'navigator',{value:window.navigator,configurable:true});
globalThis.CSS={escape:s=>String(s)};
const storage=`const db=new Map();export const newId=(p='id')=>p+Math.random().toString(36).slice(2);export const preference=(k,d)=>d;export const setPreference=()=>{};export async function listProjects(){return [...db.values()].map(p=>({id:p.id,name:p.name,updatedAt:p.updatedAt,datasets:p.datasets?.length||0,charts:p.charts?.length||0}));}export async function saveProject(p){db.set(p.id,structuredClone(p));}export async function getProject(id){return structuredClone(db.get(id)||null);}export async function saveProjectIfCurrent(p){db.set(p.id,structuredClone(p));}export async function deleteProject(id){db.delete(id);}export async function listCheckpoints(){return [];}export async function createCheckpoint(){return null;}export async function getCheckpoint(){return null;}export async function testLocalStorage(){return {ok:true,usage:0,persisted:false};}`;
const data=code=>'data:text/javascript;base64,'+Buffer.from(code).toString('base64');
let app=readFileSync(new URL('src/app.js',root),'utf8').replace(/from '\.\/([^']+)'/g,(_,path)=>`from '${path==='storage.js'?data(storage):new URL('src/'+path,root).href}'`);
app+='\nexport {ui,render,renderInspector,runAction,chart,dataset,commitEditedCell,CHARTS,chartExample,DEFAULT_CHART,propertiesFor,columnLetter,project,updateChartSetting};';
const m=await import(data(app));await new Promise(r=>setTimeout(r,20));
const $=s=>document.querySelector(s);const click=async(action,id)=>{await m.runAction(action,{dataset:{id},getAttribute(){return null}});await new Promise(r=>setTimeout(r,0));};
const change=(el,value)=>{el.value=value;el.dispatchEvent(new window.Event('change',{bubbles:true}));};
m.ui.page='visualise';m.ui.studioChartId=m.ui.selectedChartId;m.render();

for(const type of ['stacked-area','small-multiples']){const datasets=JSON.stringify(m.project.datasets),charts=JSON.stringify(m.project.charts);await click('add-chart');await m.runAction('catalogue-demo-create',{dataset:{type},getAttribute(){return null}});await new Promise(r=>setTimeout(r,0));assert($('[data-action="time-example"]'));await click('time-example');const c=m.chart();assert.equal(c.type,type);assert.equal(c.timeEnabled,true);assert.equal(c.x,'Day');assert.equal(c.seriesField,'Team');assert.equal(c.timeField,'Period');assert(![...$('[data-setting="timeField"]').options].some(v=>['Day','Team'].includes(v.value)));const original=JSON.stringify(c),source=JSON.stringify(m.project.datasets),selector=type==='stacked-area'?'[data-stacked-area-time]':'[data-small-multiple-time]';assert($('#liveChartSvg '+selector));if(type==='small-multiples')assert.equal(document.querySelectorAll('#liveChartSvg [data-facet-panel]').length,3);$('#liveChartSvg [data-time-next]').click();assert($('#liveChartSvg [data-time-status]').textContent.includes('2021'));$('#liveChartSvg [data-time-next]').click();assert($('#liveChartSvg [data-time-status]').textContent.includes('2022'));assert.equal(document.querySelectorAll('#liveChartSvg '+(type==='stacked-area'?'[data-stack-cell]':'[data-line-cell]')).length,0);assert.equal(JSON.stringify(c),original);$('#liveChartSvg [data-time-capture]').click();assert.equal(m.chart().timeIndex,2);await click('undo');assert.equal(JSON.stringify(m.chart()),original);await click('publish-open');assert($('#publishPreview').srcdoc.includes('data-time-player'));assert($('#publishPreview').srcdoc.includes(type==='stacked-area'?'data-stacked-area-time':'data-small-multiple-time'));await click('close-modal');assert.equal(JSON.stringify(m.project.datasets),source);await click('undo');await click('undo');assert.equal(JSON.stringify(m.project.datasets),datasets);assert.equal(JSON.stringify(m.project.charts),charts);}
console.log('PASS V3.51 actual stacked-area/small-multiple time controls, separate roles, transient empty periods, capture/Undo, publishing and source immutability');await new Promise(r=>setTimeout(r,550));window.close();
