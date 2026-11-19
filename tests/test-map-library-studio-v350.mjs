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

const lib=await import(new URL('src/map-library.js',root).href);
const initial=JSON.stringify(m.project);m.ui.page='home';m.render();assert($('[data-action="map-library-open"]'));await click('map-library-open');assert.equal(document.querySelectorAll('[data-action="map-starter-create"]').length,10);assert.equal(JSON.stringify(m.project),initial);
const q=$('#mapLibraryQuery');q.value='density';q.dispatchEvent(new window.Event('input',{bubbles:true}));assert.equal(document.querySelectorAll('[data-action="map-starter-create"]').length,2);assert.equal(document.activeElement,q);
await click('map-library-tab','boundaries');assert(document.querySelectorAll('[data-action="map-resource-details"]').length<=12);const query=$('#mapLibraryQuery');query.value='NZL';query.dispatchEvent(new window.Event('input',{bubbles:true}));assert.equal(document.querySelectorAll('[data-action="map-resource-details"]').length,2);const nz=lib.searchMapResources('NZL','outline')[0];await click('map-resource-details',nz.id);assert($('[data-action="map-resource-use"]').disabled);assert(document.querySelector('.modal-layer')||document.body.textContent.includes('placeholder'));assert.equal(JSON.stringify(m.project),initial);
await click('map-library-tab','sources');assert.equal(document.querySelectorAll('.map-library-source a').length,3);assert([...document.querySelectorAll('.map-library-source a')].every(a=>a.protocol==='https:'&&a.rel.includes('noopener')));assert(document.body.textContent.includes('150,000'));await click('close-modal');
m.ui.page='visualise';m.render();const baseProjects=JSON.stringify(m.project.datasets),baseCharts=JSON.stringify(m.project.charts);
for(const item of lib.MAP_STARTERS){await click('map-library-open');await click('map-starter-create',item.id);assert.equal(m.chart().type,item.type);assert($('#liveChartSvg svg'));assert.equal(m.chart().datasetId,m.dataset().id);if(item.id==='world-snapshots')assert($('#liveChartSvg [data-time-player]'));if(item.id==='custom-districts')assert(m.chart().subtitle.includes('Made-up'));await click('undo');assert.equal(JSON.stringify(m.project.datasets),baseProjects);assert.equal(JSON.stringify(m.project.charts),baseCharts);}
await click('map-library-open');await click('map-resource-create',nz.id);assert(m.chart().geoCustom);assert.equal(m.chart().geoBoundaryKey,'region_id');assert.equal(m.dataset().rows[0].Value,1);assert(m.chart().subtitle.includes('placeholder'));const beforeReview=JSON.stringify(m.chart()),beforeRows=JSON.stringify(m.dataset().rows);await click('map-library-open');await click('map-resource-details',nz.id);assert(!$('[data-action="map-resource-use"]').disabled);await click('map-resource-use',nz.id);assert($('#regionalManager'));assert.equal(JSON.stringify(m.chart()),beforeReview);assert.equal($('#regionalBoundaryKey').value,'region_id');await click('close-modal');assert.equal(JSON.stringify(m.chart()),beforeReview);
await click('map-library-open');await click('map-resource-use',nz.id);await click('regional-apply');assert.equal(m.chart().geoBoundaryKey,'region_id');assert.equal(JSON.stringify(m.dataset().rows),beforeRows);await click('undo');assert.equal(JSON.stringify(m.chart()),beforeReview);await click('undo');assert.equal(JSON.stringify(m.project.datasets),baseProjects);assert.equal(JSON.stringify(m.project.charts),baseCharts);
await click('map-library-open');await click('map-resource-create','world');assert.equal(m.chart().geoCustom,null);assert.equal(m.chart().x,'Name');assert.equal(m.dataset().rows.length,176);assert($('#liveChartSvg svg'));await click('publish-open');assert($('#publishPreview').srcdoc.includes('Natural Earth'));await click('close-modal');await click('undo');
// Home creation starts a new project only after choosing a design.
m.ui.page='home';m.render();const oldId=m.project.id;await click('map-library-open');assert.equal(m.project.id,oldId);await click('map-starter-create','nz-places');assert.notEqual(m.project.id,oldId);assert.equal(m.project.charts.length,1);assert.equal(m.chart().type,'geo-symbol');assert.equal(m.ui.page,'visualise');
console.log('PASS V3.50 home/editor map discovery, search/focus, source links, eight editable starters, resource staging/cancel/apply/Undo, global fallback, publication and nonmutating browsing');
await new Promise(r=>setTimeout(r,550));window.close();
