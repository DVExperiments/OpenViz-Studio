// V3.55 live data connections: a dataset can be linked to a CSV/TSV/JSON URL or a Google Sheet.
// Fetching happens in the browser, directly from the source (no OpenViz server). The source must
// allow browser access (CORS); Google Sheets "Publish to web"/"Anyone with the link" CSV, GitHub raw
// files and most open-data portals do. Nothing is fetched unless the person connects or refreshes.
export const LIVE_INTERVALS=[[0,'Manual refresh only'],[1,'Every minute while open'],[5,'Every 5 minutes while open'],[15,'Every 15 minutes while open'],[60,'Every hour while open']];
export const LIVE_MAX_BYTES=20*1024*1024;
// Rewrites common "share" links into direct data links. Returns {url, note} or throws.
export function resolveSourceUrl(input){
 let raw=String(input||'').trim();if(!raw)throw new Error('Paste a link to a CSV, JSON or Google Sheet.');
 if(!/^[a-z]+:\/\//i.test(raw))raw='https://'+raw;
 let u;try{u=new URL(raw);}catch{throw new Error('That is not a valid web address.');}
 const local=['localhost','127.0.0.1','[::1]'].includes(u.hostname);
 if(u.protocol!=='https:'&&!(u.protocol==='http:'&&local))throw new Error('Use a secure https:// link.');
 if(u.username||u.password)throw new Error('Links containing passwords are not supported.');
 const host=u.hostname.toLowerCase();
 if(host==='docs.google.com'&&u.pathname.startsWith('/spreadsheets/')){
  const gid=(u.hash.match(/gid=(\d+)/)||u.search.match(/gid=(\d+)/)||[])[1];
  const pub=u.pathname.match(/^\/spreadsheets\/d\/e\/([A-Za-z0-9_-]+)/);
  if(pub)return {url:`https://docs.google.com/spreadsheets/d/e/${pub[1]}/pub?output=csv${gid?`&gid=${gid}`:''}`,kind:'Google Sheet (published)',note:'Published-to-web sheet; updates appear a few minutes after edits.'};
  const id=u.pathname.match(/^\/spreadsheets\/d\/([A-Za-z0-9_-]+)/);
  if(id)return {url:`https://docs.google.com/spreadsheets/d/${id[1]}/gviz/tq?tqx=out:csv${gid?`&gid=${gid}`:''}`,kind:'Google Sheet',note:'The sheet must be shared as “Anyone with the link can view”.'};
 }
 if(host==='github.com'){const m=u.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/(.+)$/);if(m)return {url:`https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}`,kind:'GitHub file',note:'Converted to the raw file link.'};}
 if(host.endsWith('dropbox.com')){u.searchParams.set('dl','1');return {url:u.toString(),kind:'Dropbox file',note:'Converted to a direct download link.'};}
 return {url:u.toString(),kind:'Web link',note:''};
}
export function guessFormat(url,contentType,text){
 const ct=String(contentType||'').toLowerCase(),path=(()=>{try{return new URL(url).pathname.toLowerCase();}catch{return '';}})(),head=String(text||'').trimStart().slice(0,1);
 if(ct.includes('json')||path.endsWith('.json')||head==='['||head==='{')return 'json';
 if(ct.includes('tab-separated')||path.endsWith('.tsv'))return 'tsv';
 if(ct.includes('html')&&/<html|<!doctype/i.test(String(text).slice(0,500)))return 'html';
 return 'csv';
}
// Fetches a source with a timeout and size cap. Returns {text, format, name, url, fetchedAt}.
export async function fetchLiveSource(input,{signal,timeoutMs=20000,fetchImpl=globalThis.fetch}={}){
 const resolved=resolveSourceUrl(input),controller=new AbortController(),timer=setTimeout(()=>controller.abort(new Error('timeout')),timeoutMs);
 if(signal)signal.addEventListener('abort',()=>controller.abort(signal.reason),{once:true});
 let response;try{response=await fetchImpl(resolved.url,{signal:controller.signal,credentials:'omit',cache:'no-store',redirect:'follow',referrerPolicy:'no-referrer'});}
 catch(e){clearTimeout(timer);if(controller.signal.aborted&&!signal?.aborted)throw new Error('The source did not respond within 20 seconds.');throw new Error('The browser could not read this link. The server may not allow access from other websites (CORS), or you may be offline. For Google Sheets use File → Share → Publish to web → CSV; for GitHub use the raw file link.');}
 clearTimeout(timer);
 if(!response.ok)throw new Error(response.status===401||response.status===403?'Access denied (HTTP '+response.status+'). Make the file public or published.':'The source returned HTTP '+response.status+'.');
 const declared=Number(response.headers.get('content-length'));if(declared>LIVE_MAX_BYTES)throw new Error('The source is larger than 20 MB.');
 const text=await response.text();if(text.length>LIVE_MAX_BYTES)throw new Error('The source is larger than 20 MB.');
 const format=guessFormat(resolved.url,response.headers.get('content-type'),text);
 if(format==='html')throw new Error('This link returns a web page, not data. Use a direct CSV/JSON link (for Google Sheets: Publish to web → CSV).');
 const base=(()=>{try{const p=new URL(resolved.url).pathname.split('/').filter(Boolean).pop()||'live-data';return decodeURIComponent(p).replace(/\.(csv|tsv|json)$/i,'').slice(0,60)||'live-data';}catch{return 'live-data';}})();
 return {text,format,name:resolved.kind.startsWith('Google')?'Google Sheet':base,url:resolved.url,kind:resolved.kind,note:resolved.note,fetchedAt:new Date().toISOString()};
}
export function liveDue(source,now=Date.now()){const minutes=Number(source?.interval)||0;if(!minutes)return false;const last=Date.parse(source.lastFetched||'')||0;return now-last>=minutes*60000;}
export function sameSchema(oldRows,newRows){const fields=rows=>new Set((rows||[]).slice(0,500).flatMap(r=>Object.keys(r||{})));const a=fields(oldRows),b=fields(newRows);return [...a].every(k=>b.has(k));}
export function describeSource(source){if(!source)return '';const when=source.lastFetched?new Date(source.lastFetched).toLocaleString():'never';const every=LIVE_INTERVALS.find(([m])=>m===Number(source.interval))?.[1]||'Manual refresh only';return `${source.kind||'Live link'} · last refreshed ${when} · ${every}${source.serverRefresh?' · also refreshed by the team server':''}${source.lastError?` · last attempt failed: ${source.lastError}`:''}`;}
