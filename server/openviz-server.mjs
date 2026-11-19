#!/usr/bin/env node
// OpenViz Team Server (optional). Zero dependencies — Node.js 18 or later.
// Adds what a purely local app cannot: hosted links that can be updated in place, shared projects
// with conflict-safe sync, comments and an activity log. OpenViz keeps working without it.
//
//   node server/openviz-server.mjs            (from the OpenViz folder)
//
// Environment variables (all optional):
//   PORT=8787  HOST=127.0.0.1 (use 0.0.0.0 to share on your network)  DATA_DIR=./openviz-data
//   PUBLIC_URL=https://charts.example.org   (used in returned links; put a TLS proxy in front for public use)
//   OPENVIZ_TOKENS="Aroha:long-random-token,Sam:another-token"   (otherwise DATA_DIR/tokens.json)
//   SCHEDULED_REFRESH=1   (refresh opted-in live datasets of shared projects on their schedule; off by default)
import http from 'node:http';
import {promises as fs,existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRefresher,REFRESH_BY} from './scheduled-refresh.mjs';

export const SERVER_VERSION='1.0.0';
const ID_RE=/^[A-Za-z0-9_-]{6,64}$/,MAX_BODY=32*1024*1024,KEEP_VERSIONS=20;
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json','.md':'text/markdown; charset=utf-8','.txt':'text/plain; charset=utf-8','.ico':'image/x-icon'};

export function createTeamServer(options={}){
 const appRoot=options.appRoot||path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 const dataDir=path.resolve(options.dataDir||process.env.DATA_DIR||path.join(appRoot,'openviz-data'));
 for(const d of ['publications','projects','comments'])mkdirSync(path.join(dataDir,d),{recursive:true});
 const publicUrl=(options.publicUrl||process.env.PUBLIC_URL||'').replace(/\/$/,'');
 // ---- members & tokens ----
 const tokens=new Map();let generated=null;
 const parseTokens=s=>String(s||'').split(',').map(x=>x.trim()).filter(Boolean).forEach(pair=>{const i=pair.indexOf(':');if(i>0)tokens.set(pair.slice(i+1).trim(),pair.slice(0,i).trim().slice(0,60));});
 if(options.tokens)for(const [name,token] of Object.entries(options.tokens))tokens.set(token,name);
 else if(process.env.OPENVIZ_TOKENS)parseTokens(process.env.OPENVIZ_TOKENS);
 else{const file=path.join(dataDir,'tokens.json');if(existsSync(file)){for(const [name,token] of Object.entries(JSON.parse(readFileSync(file,'utf8'))))tokens.set(token,name);}else{const token=crypto.randomBytes(24).toString('base64url');writeFileSync(file,JSON.stringify({Admin:token},null,2),{mode:0o600});tokens.set(token,'Admin');generated=token;}}
 const memberFor=req=>{const h=String(req.headers.authorization||'');const m=h.match(/^Bearer\s+(.+)$/i);if(!m)return null;const given=Buffer.from(m[1].trim());for(const [token,name] of tokens){const b=Buffer.from(token);if(b.length===given.length&&crypto.timingSafeEqual(b,given))return name;}return null;};
 // ---- storage helpers (atomic writes) ----
 const file=(kind,id)=>{if(!ID_RE.test(id))throw httpError(400,'Invalid id');return path.join(dataDir,kind,id+'.json');};
 async function readJson(p,fallback=null){try{return JSON.parse(await fs.readFile(p,'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw e;}}
 async function writeJson(p,value){const tmp=p+'.'+crypto.randomBytes(4).toString('hex')+'.tmp';await fs.writeFile(tmp,JSON.stringify(value));await fs.rename(tmp,p);}
 const locks=new Map();async function locked(key,fn){const prev=locks.get(key)||Promise.resolve();let release;const next=new Promise(r=>release=r);locks.set(key,prev.then(()=>next));await prev;try{return await fn();}finally{release();if(locks.get(key)===next)locks.delete(key);}}
 async function activity(event){const p=path.join(dataDir,'activity.json');await locked('activity',async()=>{const list=await readJson(p,[]);list.push({...event,at:new Date().toISOString()});await writeJson(p,list.slice(-500));});}
 const newId=()=>crypto.randomBytes(9).toString('base64url');
 const linkFor=(req,id)=>`${publicUrl||`http://${req.headers.host}`}/p/${id}`;
 // ---- rate limiting ----
 const buckets=new Map();const allow=ip=>{const now=Date.now(),b=buckets.get(ip)||{tokens:600,at:now};b.tokens=Math.min(600,b.tokens+(now-b.at)/100);b.at=now;if(b.tokens<1){buckets.set(ip,b);return false;}b.tokens--;buckets.set(ip,b);return true;};
 function httpError(status,message){const e=new Error(message);e.status=status;return e;}
 async function body(req){let size=0;const chunks=[];for await(const c of req){size+=c.length;if(size>MAX_BODY)throw httpError(413,'Request too large (32 MB limit)');chunks.push(c);}const text=Buffer.concat(chunks).toString('utf8');if(!text)return {};try{return JSON.parse(text);}catch{throw httpError(400,'Body must be JSON');}}
 const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Allow-Methods':'GET, POST, PUT, PATCH, DELETE, OPTIONS','Access-Control-Max-Age':'600'};
 const send=(res,status,value,headers={})=>{const text=JSON.stringify(value);res.writeHead(status,{...cors,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});res.end(text);};
 const text=(v,max)=>typeof v==='string'?v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').slice(0,max):'';

 async function keepHistory(id,rec){await writeJson(path.join(dataDir,'projects',`${id}.r${rec.revision}.json`),rec);const old=rec.revision-KEEP_VERSIONS;if(old>0)await fs.unlink(path.join(dataDir,'projects',`${id}.r${old}.json`)).catch(()=>{});}
 // ---- optional scheduled live-data refresh (see scheduled-refresh.mjs) ----
 const refreshOn=options.scheduledRefresh??process.env.SCHEDULED_REFRESH==='1';
 const refresher=refreshOn?createRefresher({
  async list(){return (await fs.readdir(path.join(dataDir,'projects'))).filter(f=>f.endsWith('.json')&&!/\.r\d+\.json$/.test(f)).map(f=>f.slice(0,-5)).filter(x=>ID_RE.test(x));},
  read:id=>readJson(file('projects',id)),
  save:(id,mutate)=>{const p=file('projects',id);return locked(p,async()=>{const rec=await readJson(p);if(!rec)return null;const next=structuredClone(rec);if(!mutate(next))return null;
   const now=new Date().toISOString();Object.assign(next,{revision:rec.revision+1,lastHumanRevision:rec.lastHumanRevision??rec.revision,updatedAt:now,updatedBy:REFRESH_BY});await keepHistory(id,rec);await writeJson(p,next);await activity({type:'refresh',id,title:next.name,by:REFRESH_BY,revision:next.revision});return next;});}
 },{allowPrivate:options.refreshAllowPrivate??process.env.REFRESH_ALLOW_PRIVATE==='1',tickMs:options.refreshTickMs||60000,now:options.refreshClock,log:options.log||(m=>console.log(m))}):null;
 async function handleApi(req,res,parts,member){
  const [, , resource,id,sub,subId,action]=parts;const method=req.method;
  if(resource==='me'&&method==='GET')return send(res,200,{name:member,server:'OpenViz Team Server',version:SERVER_VERSION,scheduledRefresh:!!refresher});
  if(resource==='activity'&&method==='GET')return send(res,200,(await readJson(path.join(dataDir,'activity.json'),[])).slice(-100).reverse());
  if(resource==='publications'){
   if(!id&&method==='GET'){const out=[];for(const f of await fs.readdir(path.join(dataDir,'publications'))){if(!f.endsWith('.json'))continue;const p=await readJson(path.join(dataDir,'publications',f));if(p)out.push({id:p.id,title:p.title,kind:p.kind,url:linkFor(req,p.id),createdBy:p.createdBy,updatedBy:p.updatedBy,updatedAt:p.updatedAt,version:p.versions.length});}return send(res,200,out.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)));}
   if(!id&&method==='POST'){const b=await body(req);const html=String(b.html||'');if(!/^<!doctype html>/i.test(html.trim()))throw httpError(400,'Publications must be complete HTML documents');const pid=newId(),now=new Date().toISOString(),pub={id:pid,title:text(b.title,160)||'Untitled',kind:text(b.kind,20)||'chart',createdBy:member,createdAt:now,updatedBy:member,updatedAt:now,versions:[{n:1,at:now,by:member,html,note:text(b.note,200)}]};await writeJson(file('publications',pid),pub);await activity({type:'publish',id:pid,title:pub.title,by:member});return send(res,201,{id:pid,url:linkFor(req,pid),version:1});}
   if(id){const p=file('publications',id);
    if(method==='GET'&&!sub){const pub=await readJson(p);if(!pub)throw httpError(404,'Not found');return send(res,200,{...pub,versions:pub.versions.map(({html,...v})=>v),url:linkFor(req,id)});}
    if(method==='PUT'&&!sub)return locked(p,async()=>{const pub=await readJson(p);if(!pub)throw httpError(404,'Not found');const b=await body(req),html=String(b.html||'');if(!/^<!doctype html>/i.test(html.trim()))throw httpError(400,'Publications must be complete HTML documents');const n=pub.versions[pub.versions.length-1].n+1,now=new Date().toISOString();pub.versions.push({n,at:now,by:member,html,note:text(b.note,200)});pub.versions=pub.versions.slice(-KEEP_VERSIONS);pub.title=text(b.title,160)||pub.title;pub.updatedAt=now;pub.updatedBy=member;await writeJson(p,pub);await activity({type:'update',id,title:pub.title,by:member,version:n});return send(res,200,{id,url:linkFor(req,id),version:n});});
    if(method==='POST'&&sub==='restore')return locked(p,async()=>{const pub=await readJson(p);if(!pub)throw httpError(404,'Not found');const v=pub.versions.find(x=>x.n===Number(subId));if(!v)throw httpError(404,'Version not found');const n=pub.versions[pub.versions.length-1].n+1,now=new Date().toISOString();pub.versions.push({n,at:now,by:member,html:v.html,note:`Restored version ${v.n}`});pub.versions=pub.versions.slice(-KEEP_VERSIONS);pub.updatedAt=now;pub.updatedBy=member;await writeJson(p,pub);await activity({type:'restore',id,title:pub.title,by:member,version:n});return send(res,200,{id,url:linkFor(req,id),version:n});});
    if(method==='DELETE'&&!sub){const pub=await readJson(p);if(!pub)throw httpError(404,'Not found');await fs.unlink(p);await activity({type:'unpublish',id,title:pub.title,by:member});return send(res,200,{deleted:true});}
   }
  }
  if(resource==='projects'){
   if(!id&&method==='GET'){const out=[];for(const f of await fs.readdir(path.join(dataDir,'projects'))){if(!f.endsWith('.json')||/\.r\d+\.json$/.test(f))continue;const p=await readJson(path.join(dataDir,'projects',f));if(p)out.push({id:p.id,name:p.name,revision:p.revision,updatedAt:p.updatedAt,updatedBy:p.updatedBy,charts:p.project?.charts?.length||0});}return send(res,200,out.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)));}
   if(id&&!sub){const p=file('projects',id);
    if(method==='GET'){const rec=await readJson(p);if(!rec)throw httpError(404,'Not found');return send(res,200,{id,name:rec.name,revision:rec.revision,lastHumanRevision:rec.lastHumanRevision??rec.revision,updatedAt:rec.updatedAt,updatedBy:rec.updatedBy,project:rec.project});}
    if(method==='PUT')return locked(p,async()=>{const b=await body(req),rec=await readJson(p),project=b.project;
     if(!project||typeof project!=='object'||!Array.isArray(project.charts)||!Array.isArray(project.datasets))throw httpError(400,'Body must contain an OpenViz project');
     const current=rec?.revision||0,base=Number(b.baseRevision)||0;
     // Optimistic concurrency: a save must name the revision it was based on, unless the caller deliberately overwrites.
     if(rec&&base!==current&&b.force!==true)return send(res,409,{error:'conflict',revision:current,lastHumanRevision:rec.lastHumanRevision??current,updatedBy:rec.updatedBy,updatedAt:rec.updatedAt});
     const now=new Date().toISOString(),next={id,name:text(project.name,120)||'Untitled project',revision:current+1,lastHumanRevision:current+1,updatedAt:now,updatedBy:member,createdBy:rec?.createdBy||member,project};
     if(rec)await keepHistory(id,rec);
     await writeJson(p,next);await activity({type:rec?'sync':'share',id,title:next.name,by:member,revision:next.revision});return send(res,200,{id,revision:next.revision,updatedAt:now});});
    if(method==='DELETE'){const rec=await readJson(p);if(!rec)throw httpError(404,'Not found');await fs.unlink(p);await activity({type:'delete-project',id,title:rec.name,by:member});return send(res,200,{deleted:true});}
   }
   if(id&&sub==='refresh'&&method==='POST'){file('projects',id);if(!refresher)throw httpError(409,'Scheduled refresh is not enabled on this team server (start it with SCHEDULED_REFRESH=1).');const r=await refresher.refreshProject(id,{force:true});return send(res,200,r);}
   if(id&&sub==='comments'){file('projects',id);const p=path.join(dataDir,'comments',id+'.json');
    if(method==='GET')return send(res,200,await readJson(p,[]));
    if(method==='POST')return locked(p,async()=>{const b=await body(req),t=text(b.text,2000).trim();if(!t)throw httpError(400,'Comment text is required');const list=await readJson(p,[]),c={id:newId(),author:member,text:t,target:{type:text(b.target?.type,20)||'project',id:text(b.target?.id,80),label:text(b.target?.label,160)},parentId:ID_RE.test(String(b.parentId||''))?b.parentId:null,resolved:false,createdAt:new Date().toISOString()};list.push(c);await writeJson(p,list.slice(-2000));await activity({type:'comment',id,by:member,target:c.target.label||c.target.id});return send(res,201,c);});
    if(method==='PATCH'&&subId)return locked(p,async()=>{const b=await body(req),list=await readJson(p,[]),c=list.find(x=>x.id===subId);if(!c)throw httpError(404,'Comment not found');if(typeof b.resolved==='boolean'){c.resolved=b.resolved;c.resolvedBy=b.resolved?member:null;}if(typeof b.text==='string'&&c.author===member)c.text=text(b.text,2000);await writeJson(p,list);return send(res,200,c);});
   }
  }
  throw httpError(404,'Unknown API route');
 }

 async function serveStatic(req,res,rel){
  const target=path.resolve(appRoot,'.'+decodeURIComponent(rel));
  if(!target.startsWith(appRoot+path.sep)&&target!==appRoot)throw httpError(403,'Forbidden');
  if(target.startsWith(dataDir)||/[\\/]\.|[\\/](server|tests|tools|node_modules|openviz-data)[\\/]/.test('/'+path.relative(appRoot,target)+'/'))throw httpError(404,'Not found');
  let p=target;try{if((await fs.stat(p)).isDirectory())p=path.join(p,'index.html');}catch{throw httpError(404,'Not found');}
  const data=await fs.readFile(p).catch(()=>{throw httpError(404,'Not found');});
  res.writeHead(200,{'Content-Type':MIME[path.extname(p).toLowerCase()]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(data);
 }

 const server=http.createServer(async(req,res)=>{
  const ip=req.socket.remoteAddress||'?';
  try{
   if(!allow(ip))return send(res,429,{error:'Too many requests'});
   const url=new URL(req.url,'http://x'),parts=url.pathname.split('/');
   if(req.method==='OPTIONS'){res.writeHead(204,cors);return res.end();}
   if(url.pathname==='/api/health')return send(res,200,{ok:true,server:'OpenViz Team Server',version:SERVER_VERSION});
   if(parts[1]==='api'){const member=memberFor(req);if(!member)return send(res,401,{error:'A valid team access token is required'});return await handleApi(req,res,parts,member);}
   if(parts[1]==='p'&&req.method==='GET'){const id=parts[2],vn=parts[3]==='v'?Number(parts[4]):null;const pub=await readJson(file('publications',id));if(!pub)throw httpError(404,'This publication does not exist or was unpublished.');const v=vn?pub.versions.find(x=>x.n===vn):pub.versions[pub.versions.length-1];if(!v)throw httpError(404,'Version not found');
    // Published pages run in a sandboxed, unique origin: they cannot read the API, tokens or other pages.
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox allow-downloads; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: https:; font-src data: https:; connect-src https: http://localhost:* http://127.0.0.1:*; frame-ancestors *",'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-cache','X-OpenViz-Version':String(v.n)});return res.end(v.html);}
   if(url.pathname==='/'){res.writeHead(302,{Location:'/app/'});return res.end();}
   if(parts[1]==='app')return await serveStatic(req,res,'/'+parts.slice(2).join('/'));
   throw httpError(404,'Not found');
  }catch(e){const status=e.status||500;if(status===500)console.error(e);if(req.url.startsWith('/api/'))return send(res,status,{error:status===500?'Server error':e.message});res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8'});res.end(status===500?'Server error':e.message);}
 });
 if(refresher&&options.autoStartRefresh!==false){server.on('listening',()=>refresher.start());server.on('close',()=>refresher.stop());}
 return {server,dataDir,generatedToken:generated,members:()=>[...tokens.values()],refresher};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {server,dataDir,generatedToken,members}=createTeamServer();const port=Number(process.env.PORT)||8787,host=process.env.HOST||'127.0.0.1';
 server.listen(port,host,()=>{console.log(`OpenViz Team Server ${SERVER_VERSION} on http://${host}:${port}`);console.log(`  App:  http://${host}:${port}/app/`);console.log(`  Data: ${dataDir}`);console.log(`  Members: ${members().join(', ')}`);console.log(`  Scheduled live-data refresh: ${process.env.SCHEDULED_REFRESH==='1'?'on (opted-in datasets of shared projects)':'off (set SCHEDULED_REFRESH=1 to enable)'}`);if(generatedToken)console.log(`\n  First run — an Admin access token was created and saved in ${path.join(dataDir,'tokens.json')}:\n  ${generatedToken}\n  Add members by editing that file ({"Name":"token"}) and restarting.`);});
}
