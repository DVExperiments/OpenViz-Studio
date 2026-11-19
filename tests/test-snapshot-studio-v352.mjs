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

await click('add-chart');await m.runAction('catalogue-demo-create',{dataset:{type:'small-multiples'},getAttribute(){return null}});await new Promise(r=>setTimeout(r,0));await click('time-example');assert($('[data-action="snapshot-export-open"]'));const before=JSON.stringify(m.chart()),rows=JSON.stringify(m.project.datasets);
await click('snapshot-export-open');assert($('#snapshotExportStartJob'));assert(!$('#snapshotExportStartJob').disabled);assert($('#snapshotExportEstimate').textContent.includes('4 observed snapshots'));assert.equal($('#snapshotExportFps').closest('label').classList.contains('hidden'),true);assert([...$('#snapshotExportEnd').options].some(v=>v.textContent==='2022'));change($('#snapshotExportStart'),'1');assert($('#snapshotExportEstimate').textContent.includes('3 observed snapshots'));change($('#snapshotExportEnd'),'1');assert($('#snapshotExportStartJob').disabled);change($('#snapshotExportEnd'),'3');assert(!$('#snapshotExportStartJob').disabled);assert.equal(JSON.stringify(m.chart()),before);assert.equal(JSON.stringify(m.project.datasets),rows);await click('snapshot-export-cancel');
await click('motion-open');assert($('#snapshotExportStartJob'));await click('close-modal');await click('export');assert($('#modalLayer [data-action="snapshot-export-open"]'));await click('close-modal');
// Execute GIF export through native app controls using a deterministic canvas/image substitute.
window.HTMLCanvasElement.prototype.getContext=function(){const canvas=this;return {fillRect(){},drawImage(){},getImageData(){const data=new Uint8ClampedArray(canvas.width*canvas.height*4);for(let i=0;i<data.length;i+=4){data[i]=30;data[i+1]=150;data[i+2]=140;data[i+3]=255;}return {data};}};};
Object.defineProperty(globalThis,'Image',{value:class{set src(v){this._src=v;if(v)queueMicrotask(()=>this.onload?.());}get src(){return this._src;}},configurable:true});let downloads=[];window.HTMLAnchorElement.prototype.click=function(){downloads.push(this.download);};
await click('snapshot-export-open');change($('#snapshotExportSize'),'480');await click('snapshot-export-start');assert($('#snapshotExportPhase').textContent.includes('complete'));assert.equal(downloads.length,1);assert(downloads[0].endsWith('-snapshots.gif'));assert(!$('#snapshotExportAgain').hidden);assert.equal(JSON.stringify(m.chart()),before);assert.equal(JSON.stringify(m.project.datasets),rows);await click('snapshot-export-again');assert.equal(downloads.length,2);await click('close-modal');
await click('snapshot-export-open');const job=m.runAction('snapshot-export-start',{dataset:{},getAttribute(){return null}});await m.runAction('snapshot-export-cancel',{dataset:{},getAttribute(){return null}});await job;assert($('#snapshotExportPhase').textContent.includes('cancelled'));assert.equal(downloads.length,2);assert.equal(JSON.stringify(m.chart()),before);assert.equal(JSON.stringify(m.project.datasets),rows);await click('close-modal');
console.log('PASS V3.52 editor/menu discovery, range estimates/validation, transient controls, actual GIF job/download-again/cancel, and source/saved-period preservation');await new Promise(r=>setTimeout(r,550));window.close();
