// OpenViz Team Server — scheduled live-data refresh (optional, off by default).
//
// Live datasets normally refresh in the browser, only while a project is open. When the server is
// started with SCHEDULED_REFRESH=1, datasets in *shared* projects whose owner ticked "Also refresh
// on the team server" are refreshed here on their schedule, so hosted dashboards stay current when
// nobody has OpenViz open. Each change is saved as a normal project revision by "Scheduled refresh".
//
// Safety: only https:// sources; every resolved address is checked so the server can't be used to
// reach private, loopback or link-local networks (checked at connect time, so DNS rebinding is
// covered too); redirects are re-checked; 20 s timeout and 20 MB cap; no cookies or credentials.
import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns';
import net from 'node:net';
import {resolveSourceUrl,guessFormat,liveDue,sameSchema,LIVE_MAX_BYTES} from '../src/live-data.js';
import {parseDelimited,parseJSON,addCalculatedField,getFields} from '../src/data.js';
import {parameterValues} from '../src/parameters.js';

export const REFRESH_BY='Scheduled refresh';
const blocked=new net.BlockList();
for(const [a,p] of [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.168.0.0',16],['198.18.0.0',15],['224.0.0.0',3]])blocked.addSubnet(a,p,'ipv4');
for(const [a,p] of [['::',128],['::1',128],['fc00::',7],['fe80::',10],['ff00::',8],['64:ff9b::',96],['2001:db8::',32]])blocked.addSubnet(a,p,'ipv6');
export function isPrivateAddress(address){
 const family=net.isIP(address);if(!family)return true;
 const mapped=family===6&&address.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
 if(mapped)return blocked.check(mapped[1],'ipv4');
 return blocked.check(address,family===4?'ipv4':'ipv6');
}

// Fetches text from a public https URL. Returns {text, contentType, url}.
export function fetchPublicText(input,{allowPrivate=false,timeoutMs=20000,maxBytes=LIVE_MAX_BYTES,maxRedirects=5}={}){
 return new Promise((resolve,reject)=>{
  const deadline=setTimeout(()=>fail(new Error('The source did not respond within 20 seconds.')),timeoutMs);deadline.unref?.();
  let req=null,done=false;
  const fail=e=>{if(done)return;done=true;clearTimeout(deadline);req?.destroy();reject(e);};
  const ok=v=>{if(done)return;done=true;clearTimeout(deadline);resolve(v);};
  const lookup=(host,opts,cb)=>dns.lookup(host,{...opts,all:true},(err,list)=>{
   if(err)return cb(err);
   const addrs=(Array.isArray(list)?list:[{address:list,family:opts.family||4}]);
   if(!allowPrivate&&addrs.some(a=>isPrivateAddress(a.address)))return cb(new Error('This link points to a private or local network address, which the team server will not fetch.'));
   if(opts.all)return cb(null,addrs);cb(null,addrs[0].address,addrs[0].family);
  });
  const go=(raw,hops)=>{
   let u;try{u=new URL(raw);}catch{return fail(new Error('That is not a valid web address.'));}
   const secure=u.protocol==='https:';
   if(!secure&&!(allowPrivate&&u.protocol==='http:'))return fail(new Error('Scheduled refresh only fetches secure https:// links.'));
   if(u.username||u.password)return fail(new Error('Links containing passwords are not supported.'));
   if(!allowPrivate&&net.isIP(u.hostname.replace(/^\[|\]$/g,''))&&isPrivateAddress(u.hostname.replace(/^\[|\]$/g,'')))return fail(new Error('This link points to a private or local network address, which the team server will not fetch.'));
   req=(secure?https:http).get(u,{lookup,headers:{'User-Agent':'OpenViz-Team-Server scheduled-refresh','Accept':'text/csv,application/json,text/plain;q=0.9,*/*;q=0.5'}},res=>{
    const status=res.statusCode||0;
    if(status>=300&&status<400&&res.headers.location){res.resume();if(hops>=maxRedirects)return fail(new Error('The source redirected too many times.'));return go(new URL(res.headers.location,u).toString(),hops+1);}
    if(status<200||status>=300){res.resume();return fail(new Error(status===401||status===403?`Access denied (HTTP ${status}). Make the file public or published.`:`The source returned HTTP ${status}.`));}
    if(Number(res.headers['content-length'])>maxBytes){res.destroy();return fail(new Error('The source is larger than 20 MB.'));}
    let size=0;const chunks=[];
    res.on('data',c=>{size+=c.length;if(size>maxBytes){res.destroy();fail(new Error('The source is larger than 20 MB.'));}else chunks.push(c);});
    res.on('end',()=>ok({text:Buffer.concat(chunks).toString('utf8'),contentType:String(res.headers['content-type']||''),url:u.toString()}));
    res.on('error',fail);
   });
   req.on('error',e=>fail(e.message?.includes('private or local')?e:new Error(`The team server could not reach the source (${e.code||e.message}).`)));
  };
  go(input,0);
 });
}

export function parseFetched({text,contentType,url}){
 const format=guessFormat(url,contentType,text);
 if(format==='html')throw new Error('This link returns a web page, not data. Use a direct CSV/JSON link.');
 const rows=format==='json'?parseJSON(text):parseDelimited(text,format==='tsv'?'\t':',');
 if(!rows.length)throw new Error('The link returned no usable data rows.');
 return rows;
}

// Refreshes one dataset object in place. Returns 'updated' | 'unchanged' | 'error' | 'schema'.
export async function refreshDataset(d,{allowPrivate=false,now=new Date(),parameters=[]}={}){
 const src=d.liveSource,at=now.toISOString();
 try{
  const resolved=resolveSourceUrl(src.input||src.url);
  const rows=parseFetched(await fetchPublicText(resolved.url,{allowPrivate}));
  src.lastFetched=at;
  if(!sameSchema(d.rawRows||d.rows,rows)){const msg='columns changed — open Data and choose Refresh live data to review';const changed=src.lastError!==msg;src.lastError=msg;return changed?'schema':'unchanged';}
  if(JSON.stringify(rows)===JSON.stringify(d.rawRows||d.rows)){const had=!!src.lastError;src.lastError='';return had?'updated':'unchanged';}
  let derived=rows;for(const calc of d.calculations||[])derived=addCalculatedField(derived,calc.name,calc.expression,parameterValues(parameters));
  d.rawRows=rows;d.rows=derived;d.columns=getFields(derived);d.columnTypes={};d.edits=[];d.updatedAt=at;src.lastError='';
  d.log=d.log||[];d.log.push({time:at,summary:`Scheduled refresh on the team server; now ${rows.length} rows`});if(d.log.length>200)d.log.splice(0,d.log.length-200);
  return 'updated';
 }catch(e){const msg=String(e.message||e).slice(0,200);const changed=src.lastError!==msg;src.lastError=msg;src.lastFetched=at;return changed?'error':'unchanged';}
}

// Scheduler. `store` supplies list/read/save so this module never touches files directly.
export function createRefresher(store,{allowPrivate=false,tickMs=60000,log=()=>{},now=()=>Date.now()}={}){
 const attempts=new Map();let timer=null,running=false;
 const due=(key,src,force)=>{if(force)return true;if(!(Number(src.interval)>0))return false;const last=Math.max(attempts.get(key)||0,Date.parse(src.lastFetched||'')||0);return liveDue({...src,lastFetched:new Date(last).toISOString()},now());};
 async function refreshProject(id,{force=false}={}){
  const rec=await store.read(id);if(!rec?.project?.datasets)return {id,refreshed:[],skipped:true};
  const targets=rec.project.datasets.filter(d=>d?.liveSource?.serverRefresh===true&&due(`${id}:${d.id}`,d.liveSource,force));
  if(!targets.length)return {id,refreshed:[]};
  for(const d of targets)attempts.set(`${id}:${d.id}`,now());
  // Fetch outside the lock (slow network), then apply to the latest revision inside it.
  const fetched=new Map();
  for(const d of targets){const copy=structuredClone(d);const result=await refreshDataset(copy,{allowPrivate,parameters:rec.project.parameters});fetched.set(d.id,{copy,result});}
  if(![...fetched.values()].some(f=>f.result!=='unchanged'))return {id,refreshed:[...fetched].map(([did,f])=>({dataset:did,result:f.result}))};
  return store.save(id,latest=>{
   let changed=false;
   for(const [did,{copy,result}] of fetched){if(result==='unchanged')continue;const i=latest.project.datasets.findIndex(x=>x.id===did);if(i<0||!latest.project.datasets[i].liveSource?.serverRefresh)continue;
    // Keep the newest settings the team saved; take only the refreshed data and status.
    const cur=latest.project.datasets[i];latest.project.datasets[i]={...cur,rawRows:copy.rawRows,rows:copy.rows,columns:copy.columns,columnTypes:result==='updated'?copy.columnTypes:cur.columnTypes,edits:result==='updated'?copy.edits:cur.edits,updatedAt:copy.updatedAt,log:copy.log,liveSource:{...cur.liveSource,lastFetched:copy.liveSource.lastFetched,lastError:copy.liveSource.lastError}};changed=true;}
   return changed;
  }).then(saved=>({id,revision:saved?.revision,refreshed:[...fetched].map(([did,f])=>({dataset:did,result:f.result}))}));
 }
 async function tick(){if(running)return;running=true;try{for(const id of await store.list()){try{const r=await refreshProject(id);if(r.revision)log(`Scheduled refresh: ${id} → revision ${r.revision}`);}catch(e){log(`Scheduled refresh failed for ${id}: ${e.message}`);}}}finally{running=false;}}
 return {tick,refreshProject,start(){if(!timer){timer=setInterval(tick,tickMs);timer.unref?.();}return this;},stop(){clearInterval(timer);timer=null;}};
}
