// V3.53 consistent line-icon set for the application chrome.
// Earlier releases used Unicode glyphs (＋ ↥ ▥ ◐ …) as icons; they render differently on every
// platform and font. This module swaps those glyphs in the UI chrome for inline SVG icons.
// Chart artwork (anything inside an <svg>) and form controls are never touched.
const P = {
 plus:'<path d="M12 5v14M5 12h14"/>',
 'arrow-up-right':'<path d="M7 17 17 7M8 7h9v9"/>',
 alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
 check:'<path d="m5 12 5 5L20 7"/>',
 chart:'<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-9"/>',
 table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
 slides:'<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
 dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
 share:'<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="m16 6-4-4-4 4M12 2v13"/>',
 download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
 'arrow-down':'<path d="M12 5v14M19 12l-7 7-7-7"/>',
 'arrow-up':'<path d="M12 19V5M5 12l7-7 7 7"/>',
 play:'<path d="M7 4v16l13-8z"/>',
 undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
 redo:'<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
 refresh:'<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
 rotate:'<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/>',
 x:'<path d="M18 6 6 18M6 6l12 12"/>',
 theme:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/>',
 'chevron-down':'<path d="m6 9 6 6 6-6"/>',
 'chevron-right':'<path d="m9 6 6 6-6 6"/>',
 panel:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 'eye-off':'<path d="M3 3l18 18"/><path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17.4 17.4 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
 shape:'<rect x="4" y="4" width="16" height="16" rx="3"/>',
 diamond:'<path d="M12 2 22 12 12 22 2 12z"/>',
 compass:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
 code:'<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
 pencil:'<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
 more:'<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
 lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
 minus:'<path d="M5 12h14"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
 layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
 sparkle:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
};
export function icon(name,size=16,extra=''){
 const body=P[name]||P.info;
 return `<svg class="ovi" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ${extra}>${body}</svg>`;
}
const GLYPHS = {
 '＋':'plus','↗':'arrow-up-right','⚠':'alert','▥':'chart','▤':'table','▣':'slides','▦':'dashboard','↥':'share','↧':'download','↓':'arrow-down','↑':'arrow-up','▶':'play','↶':'undo','↷':'redo','↻':'refresh','↺':'rotate','✕':'x','◐':'theme','⌄':'chevron-down','›':'chevron-right','☰':'panel','☷':'list','◉':'eye','◌':'eye-off','◇':'diamond','◈':'compass','▭':'shape','▧':'image','◫':'code','✎':'pencil','⋯':'more','ⓘ':'info','🔒':'lock','⌕':'search',
};
const RE = new RegExp(`(${Object.keys(GLYPHS).map(g=>g.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})`,'u');
const SKIP = new Set(['SCRIPT','STYLE','TEXTAREA','INPUT','OPTION','SELECT','KBD','CODE','PRE','TITLE']);
function eligible(node){
 for(let el=node.parentElement;el;el=el.parentElement){
  if(SKIP.has(el.tagName)||el.namespaceURI==='http://www.w3.org/2000/svg'||el.isContentEditable||el.hasAttribute('data-no-icons'))return false;
  if(el.id==='app'||el.id==='modalLayer'||el.classList?.contains('floating-menu'))return true;
 }
 return true;
}
function swap(textNode){
 const text=textNode.nodeValue;if(!text||!RE.test(text)||!eligible(textNode))return;
 const parts=text.split(RE);if(parts.length<2)return;
 const frag=document.createDocumentFragment();
 for(const part of parts){if(!part)continue;const name=GLYPHS[part];if(name){const span=document.createElement('span');span.className='ovi-wrap';span.setAttribute('aria-hidden','true');span.dataset.glyph=part;span.innerHTML=icon(name);frag.appendChild(span);}else frag.appendChild(document.createTextNode(part));}
 textNode.replaceWith(frag);
}
function scan(root){
 if(!root)return;
 if(root.nodeType===3){swap(root);return;}
 if(root.nodeType!==1||root.namespaceURI==='http://www.w3.org/2000/svg')return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>RE.test(n.nodeValue||'')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP});
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(swap);
}
export function installIcons(){
 if(typeof document==='undefined'||typeof MutationObserver==='undefined')return;
 const roots=[document.getElementById('app'),document.getElementById('modalLayer'),document.getElementById('menuPopover'),document.getElementById('chartContextMenu'),document.getElementById('toast')].filter(Boolean);
 let pending=new Set(),scheduled=false;
 const flush=()=>{scheduled=false;const list=[...pending];pending=new Set();list.forEach(scan);};
 const obs=new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')pending.add(r.target);else r.addedNodes.forEach(n=>pending.add(n));}if(!scheduled){scheduled=true;queueMicrotask(flush);}});
 for(const root of roots){scan(root);obs.observe(root,{childList:true,subtree:true,characterData:true});}
}
