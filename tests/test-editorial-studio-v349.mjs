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

await click('add-chart');await m.runAction('catalogue-demo-create',{dataset:{type:'editorial-table'},getAttribute(){return null}});await new Promise(r=>setTimeout(r,0));
assert.equal(m.chart().type,'editorial-table');assert.equal(m.chart().parallelFields.length,5);assert($('#liveChartSvg [data-editorial-table]'));assert(!$('#liveChartSvg > svg'));assert($('[data-table-column-option="visual"]'));assert(!$('[data-setting="yMin"]'));assert.equal(m.chart().tableColumnStyles[0].format,'currency');
const originalRows=JSON.stringify(m.dataset().rows),originalChart=JSON.stringify(m.chart());
$('#liveChartSvg [data-table-next]').click();assert($('#liveChartSvg [data-table-status]').textContent.includes('26–38'));
const search=$('#liveChartSvg [data-table-search]');search.value='Auckland';search.dispatchEvent(new window.Event('input',{bubbles:true}));assert($('#liveChartSvg [data-table-status]').textContent.includes('8 matching'));assert.equal(JSON.stringify(m.chart()),originalChart);
const label=$('[data-table-column-option="label"][data-table-column-index="1"]');change(label,'Sales (USD)');assert.equal(m.chart().tableColumnStyles[0].label,'Sales (USD)');assert($('#liveChartSvg thead').textContent.includes('Sales (USD)'));await click('undo');assert.equal(JSON.stringify(m.chart()),originalChart);
m.ui.studioTab='data';m.render();assert.equal(document.querySelectorAll('[data-parallel-field]').length,9);const note=$('[data-parallel-field="Note"]');note.checked=false;note.dispatchEvent(new window.Event('input',{bubbles:true}));assert(!m.chart().parallelFields.includes('Note'));assert.equal(m.chart().parallelFields.length,4);await click('undo');assert.equal(m.chart().parallelFields.length,5);
const earlier=$('[data-table-move="1"][data-table-direction="-1"]');earlier.click();assert.equal(m.chart().parallelFields[0],'Revenue');await click('undo');assert.equal(m.chart().parallelFields[0],'Region');
m.ui.studioTab='preview';m.render();m.updateChartSetting('tablePageSize','10',true);assert.equal($('#liveChartSvg tbody').rows.length,10);await click('undo');assert.equal($('#liveChartSvg tbody').rows.length,25);assert.equal(JSON.stringify(m.dataset().rows),originalRows);
await click('publish-open');assert($('#publishPreview').srcdoc.includes('data-editorial-table'));assert(!$('#publishPreview').srcdoc.includes('data-time-player'));await click('close-modal');
console.log('PASS V3.49 editorial template/editor controls, transient reader search/pages, column selection/order/format Undo, publishing and source safety');
await new Promise(r=>setTimeout(r,550));window.close();
