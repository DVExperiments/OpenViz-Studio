// V3.56 optional Team Server: hosted publications (update in place, versions), shared projects
// (optimistic concurrency), comments, activity, static app serving and security boundaries.
import assert from 'node:assert/strict';
import os from 'node:os';import path from 'node:path';import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {createTeamServer} from '../server/openviz-server.mjs';

const dataDir=mkdtempSync(path.join(os.tmpdir(),'ovteam-'));
const {server}=createTeamServer({dataDir,tokens:{Aroha:'token-aroha-0123456789',Sam:'token-sam-0123456789'}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const api=(p,{token='token-aroha-0123456789',method='GET',body}={})=>fetch(base+p,{method,headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
try{
 assert.equal((await (await fetch(base+'/api/health')).json()).ok,true);
 assert.equal((await api('/api/me',{token:null})).status,401);assert.equal((await api('/api/me',{token:'wrong-token-0123456789'})).status,401);
 assert.equal((await (await api('/api/me')).json()).name,'Aroha');
 // Publications: create, view, update in place (same URL), versions, restore, unpublish.
 const html1='<!doctype html><html><body><h1>v1</h1></body></html>';
 assert.equal((await api('/api/publications',{method:'POST',body:{title:'X',html:'not a document'}})).status,400);
 const created=await (await api('/api/publications',{method:'POST',body:{title:'Sales',kind:'chart',html:html1}})).json();assert.ok(created.url.endsWith('/p/'+created.id));
 const page=await fetch(base+'/p/'+created.id);assert.equal(page.status,200);assert.match(await page.text(),/v1/);const csp=page.headers.get('content-security-policy');assert.match(csp,/sandbox allow-scripts/);assert.ok(!/allow-same-origin/.test(csp),'published pages never share the API origin');
 const updated=await (await api('/api/publications/'+created.id,{method:'PUT',token:'token-sam-0123456789',body:{html:html1.replace('v1','v2')}})).json();assert.equal(updated.version,2);assert.equal(updated.url,created.url,'update keeps the same link');
 assert.match(await (await fetch(base+'/p/'+created.id)).text(),/v2/);assert.match(await (await fetch(base+'/p/'+created.id+'/v/1')).text(),/v1/);
 const meta=await (await api('/api/publications/'+created.id)).json();assert.equal(meta.versions.length,2);assert.equal(meta.updatedBy,'Sam');assert.ok(!('html' in meta.versions[0]),'version list omits HTML');
 assert.equal((await (await api(`/api/publications/${created.id}/restore/1`,{method:'POST'})).json()).version,3);assert.match(await (await fetch(base+'/p/'+created.id)).text(),/v1/);
 assert.equal((await (await api('/api/publications')).json()).length,1);
 // Shared projects with revision checks.
 const project={name:'Team project',charts:[{id:'c1'}],datasets:[{id:'d1',rows:[{a:1}]}],slides:[],versions:[]};
 const s1=await (await api('/api/projects/proj-123456',{method:'PUT',body:{project,baseRevision:0}})).json();assert.equal(s1.revision,1);
 const s2=await api('/api/projects/proj-123456',{method:'PUT',token:'token-sam-0123456789',body:{project:{...project,name:'Sam edit'},baseRevision:1}});assert.equal((await s2.json()).revision,2);
 const conflict=await api('/api/projects/proj-123456',{method:'PUT',body:{project:{...project,name:'Stale'},baseRevision:1}});assert.equal(conflict.status,409);const cj=await conflict.json();assert.equal(cj.revision,2);assert.equal(cj.updatedBy,'Sam');
 const forced=await (await api('/api/projects/proj-123456',{method:'PUT',body:{project:{...project,name:'Mine'},baseRevision:1,force:true}})).json();assert.equal(forced.revision,3);
 const loaded=await (await api('/api/projects/proj-123456')).json();assert.equal(loaded.project.name,'Mine');assert.equal(loaded.updatedBy,'Aroha');
 assert.ok(existsSync(path.join(dataDir,'projects','proj-123456.r2.json')),'previous revisions are kept');
 assert.equal((await api('/api/projects/proj-123456',{method:'PUT',body:{project:{nope:true},baseRevision:3}})).status,400);
 assert.equal((await (await api('/api/projects')).json())[0].name,'Mine');
 // Comments.
 const c=await (await api('/api/projects/proj-123456/comments',{method:'POST',body:{text:'Check the 2024 figure',target:{type:'chart',id:'c1',label:'Sales'}}})).json();assert.equal(c.author,'Aroha');
 assert.equal((await api('/api/projects/proj-123456/comments',{method:'POST',body:{text:'   '}})).status,400);
 const r=await (await api(`/api/projects/proj-123456/comments/${c.id}`,{method:'PATCH',token:'token-sam-0123456789',body:{resolved:true}})).json();assert.equal(r.resolved,true);assert.equal(r.resolvedBy,'Sam');
 const list=await (await api('/api/projects/proj-123456/comments')).json();assert.equal(list.length,1);
 const act=await (await api('/api/activity')).json();assert.ok(act.some(a=>a.type==='comment')&&act.some(a=>a.type==='update')&&act.some(a=>a.type==='sync'));
 // Static app serving and path safety.
 const app=await fetch(base+'/app/');assert.equal(app.status,200);assert.match(await app.text(),/OpenViz/);
 assert.equal((await fetch(base+'/app/src/charts.js')).status,200);
 for(const bad of ['/app/../package.json','/app/server/openviz-server.mjs','/app/%2e%2e/%2e%2e/etc/passwd','/app/tests/test-team-server-v356.mjs'])assert.notEqual((await fetch(base+bad)).status,200,bad);
 assert.equal((await api('/api/projects/../../etc')).status,404);assert.equal((await api('/api/projects/bad%20id!')).status,400);
 // Unpublish.
 assert.equal((await (await api('/api/publications/'+created.id,{method:'DELETE'})).json()).deleted,true);assert.equal((await fetch(base+'/p/'+created.id)).status,404);
 console.log('PASS V3.56 team server: hosted links with versions, shared projects with conflict detection, comments, activity and safe static serving');
}finally{server.close();rmSync(dataDir,{recursive:true,force:true});}
