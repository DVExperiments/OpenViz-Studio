/** OpenViz local storage. Version 2 introduces independent recovery checkpoints.
 * Documents retain their v1 format, so older .openviz archives still load.
 */
const DB_NAME='openviz-studio-v1',STORE='projects',RECOVERY='recovery',META='projectMeta';
// V3.59: a small summary record per project (revision, name, counts) so autosave and the project list
// never have to read whole projects back. Older projects without a summary fall back to the full record.
function metaFor(p){return {id:p.id,rev:p._storageRevision||null,name:p.name,updatedAt:p.updatedAt,charts:p.charts?.length||0,datasets:p.datasets?.length||0};}
const RECOVERY_LIMIT=5, RECOVERY_MAX_BYTES=8*1024*1024;
let dbPromise;
function db(){
 if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
  if(!('indexedDB' in window)){reject(new Error('IndexedDB unavailable'));return;}
  const request=indexedDB.open(DB_NAME,3);
  request.onupgradeneeded=()=>{
   const conn=request.result;
   if(!conn.objectStoreNames.contains(STORE))conn.createObjectStore(STORE,{keyPath:'id'});
   if(!conn.objectStoreNames.contains(META))conn.createObjectStore(META,{keyPath:'id'});
   if(!conn.objectStoreNames.contains(RECOVERY)){
    const checkpoints=conn.createObjectStore(RECOVERY,{keyPath:'id'});
    checkpoints.createIndex('projectId','projectId',{unique:false});
   }
  };
  request.onsuccess=()=>{request.result.onversionchange=()=>{request.result.close();dbPromise=null;};resolve(request.result);};
  // An outdated copy of OpenViz (for example from a browser cache) meeting a database already upgraded by a newer copy.
  request.onerror=()=>{dbPromise=null;const e=request.error;reject(e?.name==='VersionError'?Object.assign(new Error('OpenViz was updated. Reload this page (Ctrl+Shift+R / Cmd+Shift+R) to use the new version with your saved projects.'),{code:'STORAGE_VERSION'}):e);};
  request.onblocked=()=>{dbPromise=null;reject(new Error('Close other outdated OpenViz tabs and retry.'));};
 });
 return dbPromise;
}
function completeTransaction(transaction){return new Promise((resolve,reject)=>{transaction.oncomplete=()=>resolve();transaction.onerror=()=>reject(transaction.error||new Error('Database transaction failed'));transaction.onabort=()=>reject(transaction.error||new Error('Database transaction aborted'));});}
export async function saveProject(project){const conn=await db(),tx=conn.transaction([STORE,META],'readwrite');const complete=completeTransaction(tx);tx.objectStore(STORE).put(structuredClone(project));tx.objectStore(META).put(metaFor(project));await complete;}
/**
 * Optimistic concurrency guard for edits made in two browser tabs.
 * The compare and write happen inside one IndexedDB readwrite transaction.
 * Missing revisions in older projects are treated as null and migrated on save.
 * This does not lock the UI or require a server.
 */
export async function saveProjectIfCurrent(project,expectedRevision=null){
 const conn=await db(),tx=conn.transaction([STORE,META],'readwrite');
 const done=completeTransaction(tx),store=tx.objectStore(STORE),metaStore=tx.objectStore(META);
 const expected=expectedRevision||null;
 let conflict=false,readError=null;
 const write=actual=>{if(actual!==expected){conflict=true;tx.abort();return;}try{store.put(structuredClone(project));metaStore.put(metaFor(project));}catch(error){readError=error;tx.abort();}};
 // Read the small summary; only projects saved before V3.59 need the full record read once.
 const getMeta=metaStore.get(project.id);
 getMeta.onsuccess=()=>{if(getMeta.result){write(getMeta.result.rev||null);return;}
  const get=store.get(project.id);
  get.onsuccess=()=>{const current=get.result;write(current?current._storageRevision||null:null);};
  get.onerror=()=>{readError=get.error;tx.abort();};};
 getMeta.onerror=()=>{readError=getMeta.error;tx.abort();};
 try{await done;}catch(error){
  if(conflict){const e=new Error('This project was saved from another tab. Review the conflict before saving.');e.code='STORAGE_CONFLICT';throw e;}
  throw readError||error;
 }
 if(conflict){const e=new Error('This project was changed in another tab.');e.code='STORAGE_CONFLICT';throw e;}
}
// Revision of the last committed save (written in the same transaction as the project itself).
export async function getProjectRevision(id){const conn=await db();return new Promise((resolve,reject)=>{const tx=conn.transaction([META,STORE],'readonly'),rq=tx.objectStore(META).get(id);rq.onsuccess=()=>{if(rq.result){resolve(rq.result.rev||null);return;}const full=tx.objectStore(STORE).get(id);full.onsuccess=()=>resolve(full.result?full.result._storageRevision||null:undefined);full.onerror=()=>reject(full.error);};rq.onerror=()=>reject(rq.error);});}
export async function getProject(id){const conn=await db();return new Promise((resolve,reject)=>{const tx=conn.transaction(STORE,'readonly'),rq=tx.objectStore(STORE).get(id);rq.onsuccess=()=>resolve(rq.result||null);rq.onerror=()=>reject(rq.error);});}
export async function listProjects(){const conn=await db();
 const [metas,keys]=await new Promise((resolve,reject)=>{const tx=conn.transaction([STORE,META],'readonly'),m=tx.objectStore(META).getAll(),k=tx.objectStore(STORE).getAllKeys();tx.oncomplete=()=>resolve([m.result||[],k.result||[]]);tx.onerror=()=>reject(tx.error);});
 const known=new Set(metas.map(m=>m.id)),missing=keys.filter(k=>!known.has(k)),out=metas.filter(m=>keys.includes(m.id));
 // Older projects: read once and backfill their summary.
 if(missing.length){const legacy=await Promise.all(missing.map(getProject));const tx=conn.transaction(META,'readwrite');for(const p of legacy)if(p){const m=metaFor(p);out.push(m);tx.objectStore(META).put(m);}await completeTransaction(tx).catch(()=>{});}
 return out.map(({id,name,updatedAt,charts,datasets})=>({id,name,updatedAt,charts,datasets})).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));}
export async function deleteProject(id){const conn=await db(),tx=conn.transaction([STORE,RECOVERY,META],'readwrite');const complete=completeTransaction(tx);tx.objectStore(STORE).delete(id);tx.objectStore(META).delete(id);const recovery=tx.objectStore(RECOVERY),index=recovery.index('projectId'),rq=index.getAllKeys(id);rq.onsuccess=()=>{for(const key of rq.result)recovery.delete(key);};await complete;}
/** A checkpoint is never used as the active document until the user explicitly restores it. */
export async function listCheckpoints(projectId){const conn=await db();return new Promise((resolve,reject)=>{const tx=conn.transaction(RECOVERY,'readonly'),rq=tx.objectStore(RECOVERY).index('projectId').getAll(projectId);rq.onsuccess=()=>resolve((rq.result||[]).map(({id,projectId,time,label,byteSize})=>({id,projectId,time,label,byteSize})).sort((a,b)=>b.time.localeCompare(a.time)));rq.onerror=()=>reject(rq.error);});}
export async function getCheckpoint(id){const conn=await db();return new Promise((resolve,reject)=>{const tx=conn.transaction(RECOVERY,'readonly'),rq=tx.objectStore(RECOVERY).get(id);rq.onsuccess=()=>resolve(rq.result||null);rq.onerror=()=>reject(rq.error);});}
export async function createCheckpoint(project,label='Manual checkpoint'){
 if(!project?.id||!Array.isArray(project.datasets)||!Array.isArray(project.slides))throw new Error('No valid project to checkpoint.');
 const content=JSON.stringify(project),byteSize=new Blob([content]).size;
 if(byteSize>RECOVERY_MAX_BYTES)throw new Error('Project exceeds the 8 MB recovery limit. Download an .openviz backup instead.');
 const now=new Date().toISOString(),id=newId('checkpoint');
 const conn=await db(),tx=conn.transaction(RECOVERY,'readwrite'),complete=completeTransaction(tx);
 tx.objectStore(RECOVERY).put({id,projectId:project.id,time:now,label,byteSize,project:structuredClone(project)});
 await complete;
 // Do not let pruning failures invalidate an already saved checkpoint.
 const all=await listCheckpoints(project.id),old=all.slice(RECOVERY_LIMIT);
 if(old.length){const pruning=conn.transaction(RECOVERY,'readwrite'),done=completeTransaction(pruning);for(const item of old)pruning.objectStore(RECOVERY).delete(item.id);await done;}
 return {id,time:now,label,byteSize};
}
/** Real IndexedDB write/read/delete test on the origin where the app is running. */
export async function testLocalStorage(){
 const conn=await db(),id=newId('storage-test');
 let verified=false;
 const tx=conn.transaction(RECOVERY,'readwrite'),done=completeTransaction(tx),store=tx.objectStore(RECOVERY);
 store.put({id,projectId:'__diagnostic__',time:new Date().toISOString(),label:'test'});
 const rq=store.get(id);rq.onsuccess=()=>{verified=rq.result?.id===id;store.delete(id);};
 await done;
 if(!verified)throw new Error('Browser storage write/read verification failed.');
 let estimate=null,persisted=null;
 try{estimate=await navigator.storage?.estimate?.()||null;persisted=await navigator.storage?.persisted?.()??null;}catch{}
 return {ok:true,usage:estimate?.usage??null,quota:estimate?.quota??null,persisted};
}
export function preference(name,defaultValue){try{return JSON.parse(localStorage.getItem(`openviz-pref-${name}`))??defaultValue;}catch{return defaultValue;}}
export function setPreference(name,value){try{localStorage.setItem(`openviz-pref-${name}`,JSON.stringify(value));}catch{}}
export function newId(prefix='obj'){return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;}
