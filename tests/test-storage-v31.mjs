/** V3.1: optimistic concurrency + legacy storage contract in an asynchronous
 * IndexedDB test double. This is not a real-origin browser verification.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const tables=new Map([['projects',new Map()]]);
const legacy={id:'legacy-v1',name:'Imported older project',updatedAt:'2026-10-01T00:00:00.000Z',datasets:[],charts:[],slides:[],versions:[]};
tables.get('projects').set(legacy.id,structuredClone(legacy));
const connection={objectStoreNames:{contains:name=>tables.has(name)},createObjectStore(name){tables.set(name,new Map());return {createIndex(){}};},close(){},transaction(names){
 const tx={_pending:0,_finished:false,_aborted:false,oncomplete:null,onabort:null,onerror:null};
 function finish(){setTimeout(()=>{if(tx._finished||tx._pending)return;tx._finished=true;if(tx._aborted)tx.onabort?.();else tx.oncomplete?.();},4);}
 tx.abort=()=>{tx._aborted=true;finish();};
 function req(fn){const rq={result:undefined,error:null,onsuccess:null,onerror:null};tx._pending++;setTimeout(()=>{
  if(!tx._aborted){try{rq.result=fn();rq.onsuccess?.({target:rq});}catch(e){rq.error=e;rq.onerror?.({target:rq});tx._aborted=true;}}
  tx._pending--;finish();
 },1);return rq;}
 tx.objectStore=name=>{const table=tables.get(name);assert(table,`store ${name}`);
  return {get:id=>req(()=>structuredClone(table.get(id))),put:v=>req(()=>{table.set(v.id,structuredClone(v));return v.id;}),delete:id=>req(()=>table.delete(id)),getAll:()=>req(()=>[...table.values()].map(v=>structuredClone(v))),index:field=>({getAll:value=>req(()=>[...table.values()].filter(v=>v[field]===value).map(v=>structuredClone(v))),getAllKeys:value=>req(()=>[...table.values()].filter(v=>v[field]===value).map(v=>v.id))})};
 };return tx;
}};
globalThis.window={};globalThis.indexedDB={open(){const r={result:connection,onupgradeneeded:null,onsuccess:null,onerror:null};setTimeout(()=>{r.onupgradeneeded?.();r.onsuccess?.();},1);return r;}};
window.indexedDB=indexedDB;
globalThis.localStorage={m:new Map(),getItem(k){return this.m.get(k)||null;},setItem(k,v){this.m.set(k,v);}};
Object.defineProperty(globalThis.navigator,'storage',{configurable:true,value:{estimate:async()=>({usage:1024,quota:99999999}),persisted:async()=>false}});
const source=readFileSync(new URL('../src/storage.js',import.meta.url),'utf8');
const m=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
assert.equal((await m.getProject('legacy-v1')).name,legacy.name);
assert.equal((await m.getProject('legacy-v1'))._storageRevision,undefined);
assert(tables.has('recovery'),'database migration preserved recovery schema');
const first={...legacy,name:'Tab 1 draft',_storageRevision:'revision-A'};
await m.saveProjectIfCurrent(first,null);
assert.equal((await m.getProject('legacy-v1'))._storageRevision,'revision-A');
const next={...first,name:'Tab 1 saved',_storageRevision:'revision-B'};
await m.saveProjectIfCurrent(next,'revision-A');
let conflict;
try{await m.saveProjectIfCurrent({...first,name:'Stale Tab 2',_storageRevision:'revision-C'},'revision-A');}catch(e){conflict=e;}
assert.equal(conflict?.code,'STORAGE_CONFLICT');
assert.equal((await m.getProject('legacy-v1')).name,'Tab 1 saved','newer project remains intact');
// A project that has been deleted by another tab must also refuse a stale write.
await m.deleteProject('legacy-v1');
let deletedConflict;
try{await m.saveProjectIfCurrent(next,'revision-B');}catch(e){deletedConflict=e;}
assert.equal(deletedConflict?.code,'STORAGE_CONFLICT','cannot resurrect deleted version with a stale revision');
await m.saveProjectIfCurrent({...next,id:'safe-copy',_storageRevision:'revision-X'},null);
assert.equal((await m.getProject('safe-copy')).name,'Tab 1 saved');
await m.createCheckpoint({...next,id:'safe-copy'},'Before changes');
assert.equal((await m.listCheckpoints('safe-copy')).length,1);
assert((await m.testLocalStorage()).ok);
await m.deleteProject('safe-copy');
assert.equal(await m.getProject('safe-copy'),null);
assert.equal((await m.listCheckpoints('safe-copy')).length,0);
console.log('PASS: v1 migration, guarded saves, stale-write rejection, deleted-project protection, safe copy, checkpoint cleanup, diagnostics');
