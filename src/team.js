// V3.56 client for the optional OpenViz Team Server (server/openviz-server.mjs).
// Nothing here runs unless a person configures a server URL and access token.
export function normalizeServerUrl(input){let raw=String(input||'').trim().replace(/\/+$/,'');if(!raw)throw new Error('Enter the Team Server address.');if(!/^https?:\/\//i.test(raw))raw='https://'+raw;let u;try{u=new URL(raw);}catch{throw new Error('That is not a valid server address.');}const local=['localhost','127.0.0.1','[::1]'].includes(u.hostname)||/^(10|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(u.hostname)||u.hostname.endsWith('.local');if(u.protocol!=='https:'&&!local)throw new Error('Use https:// for servers outside your local network.');if(u.username||u.password)throw new Error('Do not put passwords in the address; use the access token field.');return u.origin+u.pathname.replace(/\/app\/?$/,'').replace(/\/+$/,'');}
export class TeamError extends Error{constructor(message,status,data){super(message);this.status=status;this.data=data;}}
export async function teamFetch(cfg,path,{method='GET',body,fetchImpl=globalThis.fetch,timeoutMs=30000}={}){
 if(!cfg?.url||!cfg?.token)throw new TeamError('Connect a Team Server first (File → Team server).',0);
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),timeoutMs);let res;
 try{res=await fetchImpl(cfg.url+path,{method,headers:{Authorization:'Bearer '+cfg.token,...(body!==undefined?{'Content-Type':'application/json'}:{})},body:body!==undefined?JSON.stringify(body):undefined,signal:ctrl.signal,cache:'no-store'});}
 catch{clearTimeout(timer);throw new TeamError('Could not reach the Team Server. Check the address and that it is running.',0);}
 clearTimeout(timer);let data=null;try{data=await res.json();}catch{}
 if(!res.ok)throw new TeamError(res.status===401?'The access token was not accepted.':res.status===413?'The project is too large for the server (32 MB).':res.status===409?'Someone else saved a newer version.':data?.error||`Server error (HTTP ${res.status}).`,res.status,data);
 return data;}
export function projectForUpload(project){const copy=structuredClone(project);delete copy.team;delete copy._storageRevision;return copy;}
export function safeProjectId(id){const s=String(id||'').replace(/[^A-Za-z0-9_-]/g,'-').slice(0,64);return s.length>=6?s:('project-'+s+Math.random().toString(36).slice(2,8)).slice(0,64);}
// V3.57: revisions saved by the server's scheduled live-data refresh only replace live dataset rows,
// so they can be merged into local edits instead of raising a conflict.
export const SCHEDULED_REFRESH_BY='Scheduled refresh';
export function refreshOnlySince(remote,baseRevision){return !!remote&&Number(remote.revision)>Number(baseRevision)&&Number(remote.lastHumanRevision??remote.revision)<=Number(baseRevision);}
// Copies refreshed rows and status from the server copy into the local project. Returns the merged dataset names.
export function mergeServerRefresh(local,remoteProject){const merged=[];
 for(const rd of remoteProject?.datasets||[]){if(!rd?.liveSource?.serverRefresh)continue;const ld=(local.datasets||[]).find(d=>d.id===rd.id);if(!ld?.liveSource)continue;
  if(rd.liveSource.lastFetched&&ld.liveSource.lastFetched&&Date.parse(ld.liveSource.lastFetched)>=Date.parse(rd.liveSource.lastFetched))continue;
  const changed=JSON.stringify(rd.rawRows)!==JSON.stringify(ld.rawRows);
  if(changed){Object.assign(ld,{rawRows:structuredClone(rd.rawRows),rows:structuredClone(rd.rows),columns:[...(rd.columns||[])],columnTypes:structuredClone(rd.columnTypes||{}),edits:structuredClone(rd.edits||[]),updatedAt:rd.updatedAt,log:structuredClone(rd.log||ld.log||[])});merged.push(ld.name);}
  ld.liveSource={...ld.liveSource,lastFetched:rd.liveSource.lastFetched,lastError:rd.liveSource.lastError||''};}
 return merged;}
