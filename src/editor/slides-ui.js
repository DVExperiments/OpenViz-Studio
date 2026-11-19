// Slides and presentation: selection, guides, alignment, layers, present mode and slide objects.
// Extracted from app.js by tools/extract-editor-module.mjs. Shared editor state and helpers come from `ctx`, bound in app.js.
import {ctx} from './context.js';
import {newId} from '../storage.js';
import {slideChartGraphic} from '../exports.js';
import {slideLogoPlacement,SLIDE_LOGO_POSITIONS,normalizeLogo} from '../brand.js';
// V1.8 slide selection and direct editing live in the editor only. Project data stores
// individual object positions, not selection outlines or transient snap guides.
export function slideSelection(){const ids=new Set(ctx.slide()?.objects.map(o=>o.id)||[]);return (ctx.ui.selectedObjectIds||[]).filter(id=>ids.has(id));}
function slideCohort(id){const s=ctx.slide(),o=s?.objects.find(x=>x.id===id);if(!o)return [];return o.groupId?s.objects.filter(x=>x.groupId===o.groupId).map(x=>x.id):[id];}
function refreshSlideCommandButtons(){const ids=slideSelection(),s=ctx.slide();document.querySelectorAll('.slide-toolbar [data-action="slide-group"]').forEach(b=>b.disabled=ids.length<2);document.querySelectorAll('.slide-toolbar [data-action="slide-ungroup"]').forEach(b=>b.disabled=!s?.objects?.some(o=>ids.includes(o.id)&&o.groupId));}
export function selectSlideObject(id,extend=false){
 const members=slideCohort(id),choices=slideSelection(),allChosen=members.every(x=>choices.includes(x));
 if(extend)ctx.ui.selectedObjectIds=allChosen?choices.filter(x=>!members.includes(x)):[...new Set([...choices,...members])];
 else if(!(choices.length>1&&choices.includes(id)))ctx.ui.selectedObjectIds=members;
 ctx.ui.selectedObjectId=ctx.ui.selectedObjectIds.includes(id)?id:(ctx.ui.selectedObjectIds.at(-1)||null);
 document.querySelectorAll('#slideCanvas [data-slide-object]').forEach(el=>{
  const active=ctx.ui.selectedObjectIds.includes(el.dataset.slideObject);el.classList.toggle('selected',active);
  el.querySelectorAll('.ov-slide-resize-handle').forEach(h=>h.remove());
  const object=ctx.slide()?.objects.find(o=>o.id===el.dataset.slideObject);
  if(active&&ctx.ui.selectedObjectIds.length===1&&!object?.locked){const handle=document.createElement('span');handle.className='ov-slide-resize-handle';handle.title='Resize object · Shift preserves proportion';handle.setAttribute('role','presentation');el.appendChild(handle);}
 });
 document.querySelectorAll('.ov-slide-layer-row').forEach(el=>el.classList.toggle('active',ctx.ui.selectedObjectIds.includes(el.dataset.layerRow)));
 refreshSlideCommandButtons();ctx.renderSlideInspector();
}
export function clearSlideSelection(){ctx.ui.selectedObjectIds=[];ctx.ui.selectedObjectId=null;document.querySelectorAll('#slideCanvas [data-slide-object]').forEach(el=>{el.classList.remove('selected');el.querySelectorAll('.ov-slide-resize-handle').forEach(h=>h.remove());});document.querySelectorAll('.ov-slide-layer-row').forEach(el=>el.classList.remove('active'));refreshSlideCommandButtons();ctx.renderSlideInspector();}
export function editSlideTextInline(el){
 if(ctx.ui.page!=='present'||!el?.classList.contains('text')||el.classList.contains('editing'))return;
 const obj=ctx.slide()?.objects.find(o=>o.id===el.dataset.slideObject);if(!obj||obj.locked)return;
 selectSlideObject(obj.id);
 const original=String(obj.text||'');const textarea=document.createElement('textarea');textarea.className='slide-inline-input';textarea.setAttribute('aria-label','Edit slide text');textarea.setAttribute('spellcheck','false');textarea.value=original;textarea.style.fontSize=getComputedStyle(el).fontSize;textarea.style.fontWeight=obj.bold?'700':'400';textarea.style.fontStyle=obj.italic?'italic':'normal';textarea.style.textDecoration=obj.underline?'underline':'none';textarea.style.textAlign=obj.align||'left';textarea.style.fontFamily=obj.font||'Arial, sans-serif';textarea.style.lineHeight=String(obj.lineHeight||1.16);textarea.style.color=obj.color||'#1c2c3e';
 el.classList.add('editing');el.textContent='';el.appendChild(textarea);ctx.ui.slideEditingId=obj.id;
 let finished=false;
 const finish=(accept)=>{
  if(finished)return;finished=true;const value=textarea.value.slice(0,5000);
  if(accept&&value!==original){ctx.trackChange();obj.text=value;ctx.markDirty();}
  ctx.ui.slideEditingId=null;el.classList.remove('editing');el.textContent=obj.text||'';ctx.renderSlideInspector();
 };
 textarea.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(false);}else if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();e.stopPropagation();finish(true);}});
 textarea.addEventListener('blur',()=>finish(true));
 textarea.addEventListener('pointerdown',e=>e.stopPropagation());textarea.addEventListener('click',e=>e.stopPropagation());
 textarea.focus();textarea.setSelectionRange(0,original.length);
}
export function clearSlideGuides(){document.querySelectorAll('#slideCanvas .ov-slide-guide').forEach(el=>el.remove());}
export function slideGuide(axis,at,label='Align'){
 const canvas=ctx.$('slideCanvas');if(!canvas||!ctx.ui.slideGuides)return;
 const el=document.createElement('div');el.className=`ov-slide-guide ${axis==='x'?'vertical':'horizontal'}`;
 if(axis==='x')el.style.left=`${at}%`;else el.style.top=`${at}%`;
 if(label){const tag=document.createElement('span');tag.textContent=label;el.appendChild(tag);}
 canvas.appendChild(el);
}
export function bestGuideSnap(axis,group,rest,desiredDelta,tolerance=1.45){
 const start=axis==='x'?'x':'y',extent=axis==='x'?'w':'h';
 const left=group[start]+desiredDelta,mid=left+group[extent]/2,right=left+group[extent];
 const anchors=[{value:50,label:'Slide centre'},{value:0,label:'Slide edge'},{value:100,label:'Slide edge'}];
 for(const o of rest)anchors.push({value:o[start],label:'Align start'},{value:o[start]+o[extent]/2,label:'Align centre'},{value:o[start]+o[extent],label:'Align end'});
 let best=null;
 for(const anchor of anchors)for(const edge of [{value:left},{value:mid},{value:right}]){
  const adjust=anchor.value-edge.value;if(Math.abs(adjust)>tolerance)continue;
  if(!best||Math.abs(adjust)<Math.abs(best.adjust))best={adjust,at:anchor.value,label:anchor.label};
 }
 // An equal-spacing target can be found between objects on both sides of the moving group.
 const neighbors=rest.slice().sort((a,b)=>a[start]-b[start]);
 const candidateGap=[];
 for(const l of neighbors)for(const r of neighbors){
  if(l===r||l[start]+l[extent]>r[start]+.01)continue;
  const newStart=(l[start]+l[extent]+r[start]-group[extent])/2;
  if(newStart<l[start]+l[extent]||newStart+group[extent]>r[start])continue;
  const adjust=newStart-left;if(Math.abs(adjust)<=tolerance)candidateGap.push({adjust,at:newStart+group[extent]/2,label:'Equal spacing'});
 }
 for(const candidate of candidateGap)if(!best||Math.abs(candidate.adjust)<Math.abs(best.adjust))best=candidate;
 return best;
}
export function alignSlideObjects(kind){
 const s=ctx.slide(),ids=slideSelection(),objects=s?.objects.filter(o=>ids.includes(o.id))||[];
 if(objects.length<2){ctx.showToast('Select two or more slide objects first.');return;}
 ctx.trackChange();const minX=Math.min(...objects.map(o=>o.x)),maxX=Math.max(...objects.map(o=>o.x+o.w)),minY=Math.min(...objects.map(o=>o.y)),maxY=Math.max(...objects.map(o=>o.y+o.h));
 for(const o of objects){
  if(kind==='left')o.x=minX;
  if(kind==='center')o.x=(minX+maxX-o.w)/2;
  if(kind==='right')o.x=maxX-o.w;
  if(kind==='top')o.y=minY;
  if(kind==='middle')o.y=(minY+maxY-o.h)/2;
  if(kind==='bottom')o.y=maxY-o.h;
  o.x=Math.round(o.x*10)/10;o.y=Math.round(o.y*10)/10;
 }
 ctx.markDirty();renderSlideStage();ctx.renderSlideInspector();
}
export function distributeSlideObjects(axis){
 const s=ctx.slide(),ids=slideSelection(),key=axis==='x'?'x':'y',size=axis==='x'?'w':'h',items=(s?.objects||[]).filter(o=>ids.includes(o.id)).sort((a,b)=>a[key]-b[key]);
 if(items.length<3){ctx.showToast('Select at least three objects to distribute.');return;}
 ctx.trackChange();const first=items[0][key],lastEdge=items.at(-1)[key]+items.at(-1)[size],sum=items.reduce((n,o)=>n+o[size],0),gap=(lastEdge-first-sum)/(items.length-1);
 let pos=first;for(const o of items){o[key]=Math.round(pos*10)/10;pos+=o[size]+gap;}
 ctx.markDirty();renderSlideStage();ctx.renderSlideInspector();
}

export function groupSlideSelection(){
 const ids=slideSelection(),items=ctx.slide()?.objects.filter(o=>ids.includes(o.id))||[];
 if(items.length<2){ctx.showToast('Select at least two objects to group.');return;}
 ctx.trackChange();const gid=newId('group');items.forEach(o=>o.groupId=gid);ctx.markDirty();renderSlideStage();ctx.renderSlideInspector();ctx.showToast('Grouped objects. Click either object to select the group.');
}
export function ungroupSlideSelection(){
 const ids=slideSelection(),groups=new Set(ctx.slide()?.objects.filter(o=>ids.includes(o.id)&&o.groupId).map(o=>o.groupId)||[]);
 if(!groups.size){ctx.showToast('Select a grouped object first.');return;}
 ctx.trackChange();ctx.slide().objects.forEach(o=>{if(groups.has(o.groupId))delete o.groupId;});ctx.markDirty();renderSlideStage();ctx.renderSlideInspector();ctx.showToast('Group separated into editable objects.');
}
export function slideLayerOperation(action,id){
 const s=ctx.slide(),o=s?.objects.find(o=>o.id===id);if(!o)return;
 if(action==='slide-layer-select'){selectSlideObject(id);renderSlideStage();return;}
 ctx.trackChange();if(action==='slide-layer-hide'){o.hidden=!o.hidden;if(o.hidden){ctx.ui.selectedObjectIds=ctx.ui.selectedObjectIds.filter(x=>x!==id);if(ctx.ui.selectedObjectId===id)ctx.ui.selectedObjectId=ctx.ui.selectedObjectIds.at(-1)||null;}}
 if(action==='slide-layer-lock')o.locked=!o.locked;
 const i=s.objects.indexOf(o),j=i+(action==='slide-layer-up'?1:action==='slide-layer-down'?-1:0);
 if(j>=0&&j<s.objects.length&&j!==i)[s.objects[i],s.objects[j]]=[s.objects[j],s.objects[i]];
 ctx.markDirty();renderPresent();ctx.renderSlideInspector();
}
function renderSlideLayers(s){return `<div class="ov-slide-layers"><div class="ov-slide-layers-title"><strong>Slide layers</strong><span>${s?.objects?.length||0}</span></div><p class="ov-layer-note">Front to back · Click to select</p>${(s?.objects||[]).slice().reverse().map(o=>{
 const label=o.type==='chart'?'▥ Chart':o.type==='text'?'T '+String(o.text||'Text').split('\n')[0].slice(0,21):'◇ '+({ellipse:'Ellipse',roundRect:'Rounded rectangle'}[o.shapeKind]||'Rectangle');
 return `<div class="ov-slide-layer-row ${slideSelection().includes(o.id)?'active':''}" data-layer-row="${ctx.E(o.id)}"><button class="ov-slide-layer-name" data-action="slide-layer-select" data-id="${ctx.E(o.id)}" title="Select ${ctx.E(label)}">${o.groupId?'▣ ':''}${ctx.E(label)}</button><button class="ov-slide-layer-icon" data-action="slide-layer-hide" data-id="${ctx.E(o.id)}" title="${o.hidden?'Show':'Hide'}">${o.hidden?'◌':'◉'}</button><button class="ov-slide-layer-icon" data-action="slide-layer-lock" data-id="${ctx.E(o.id)}" title="${o.locked?'Unlock':'Lock'}">${o.locked?'🔒':'♢'}</button><button class="ov-slide-layer-icon" data-action="slide-layer-up" data-id="${ctx.E(o.id)}" title="Bring forward">↑</button><button class="ov-slide-layer-icon" data-action="slide-layer-down" data-id="${ctx.E(o.id)}" title="Send backward">↓</button></div>`;
 }).join('')||'<div class="ov-layer-note">Insert a text box, shape or chart to create a layer.</div>'}</div>`;}
export function renderPresent(){ctx.migrateSlideChartLayouts();const sl=ctx.slide();ctx.$('workspaceContent').innerHTML=`<div class="presentation"><aside class="slides-rail"><div class="inline-actions" style="justify-content:space-between;margin-bottom:12px"><strong>Slides</strong><button class="secondary-button button-small" data-action="add-slide" aria-label="Add slide" title="Add slide">＋</button></div>${ctx.project.slides.map((s,i)=>`<button class="slide-thumb ${s.id===sl?.id?'active':''}" data-select="slide" data-id="${ctx.E(s.id)}" title="Slide ${i+1}"><div class="slide-index">${i+1} · ${ctx.E(s.name)}</div><div class="slide-mini" style="background:${ctx.E(/^#[0-9a-f]{6}$/i.test(s.background||'')?s.background:'#ffffff')}"><strong style="color:${ctx.E(/^#[0-9a-f]{6}$/i.test(s.objects.find(o=>o.type==='text')?.color||'')?s.objects.find(o=>o.type==='text').color:'#1c2c3e')}">${ctx.E(s.objects.find(o=>o.type==='text')?.text?.slice(0,35)||'Blank slide')}</strong><div style="position:absolute;bottom:14%;left:11%;height:18%;width:70%;background:linear-gradient(90deg,#d4ece9,#8ccec5)"></div></div></button>`).join('')}<div class="ov-layer-separator"></div>${renderSlideLayers(sl)}</aside><section class="present-stage"><div class="slide-toolbar"><span class="pill">16:9 · Widescreen</span><span class="muted small">Double-click text to edit · Shift/Ctrl-click to select multiple · Alt bypasses snapping</span><span style="flex:1"></span><button class="secondary-button button-small" data-action="slide-group" ${slideSelection().length<2?'disabled':''}>Group selection</button><button class="secondary-button button-small" data-action="slide-ungroup" ${!sl?.objects?.some(o=>slideSelection().includes(o.id)&&o.groupId)?'disabled':''}>Ungroup</button><button class="secondary-button button-small" data-action="export-pdf-dialog">Export PDF</button><button class="secondary-button button-small" data-action="export-pptx">Export PPTX</button></div><div class="slide-stage"><div class="slide-canvas" id="slideCanvas" style="background:${ctx.E(/^#[0-9a-f]{6}$/i.test(sl?.background||'')?sl.background:'#ffffff')}">${slideObjectsHTML(sl)}</div></div><div class="slide-stage-hint"><span>Slide ${Math.max(1,ctx.project.slides.findIndex(s=>s.id===sl?.id)+1)} of ${ctx.project.slides.length}</span><span>Editable text & native shapes · Linked charts</span><span style="flex:1"></span><button class="subtle-button button-small" data-action="delete-slide">Delete slide</button></div></section></div>`;}
function slideLogoHTML(s){const L=slideLogoPlacement(ctx.project,s);return L?`<img class="slide-logo" src="${ctx.E(L.dataUri)}" alt="" aria-hidden="true" draggable="false" style="left:${L.x}%;top:${L.y}%;width:${L.w}%;height:${L.h}%">`:'';}
function slideObjectsHTML(s){return (s?.objects||[]).filter(o=>!o.hidden).map(o=>{
 const selected=slideSelection().includes(o.id),style=`left:${Number(o.x)||0}%;top:${Number(o.y)||0}%;width:${Math.max(1,Number(o.w)||1)}%;height:${Math.max(1,Number(o.h)||1)}%;`;
 const handle=selected&&slideSelection().length===1&&!o.locked?'<span class="ov-slide-resize-handle" title="Resize object · Shift preserves proportion" role="presentation"></span>':'';
 if(o.type==='chart'){const c=ctx.project.charts.find(x=>x.id===o.chartId),d=ctx.chartDataset(c);return `<div class="slide-object chart ${selected?'selected':''} ${o.locked?'ov-locked':''}" data-slide-object="${ctx.E(o.id)}" style="${style}">${c&&d?slideChartGraphic(d.rows,c,o).svg:'<p>Missing chart</p>'}${handle}</div>`;}
 if(o.type==='text')return `<div class="slide-object text ${selected?'selected':''} ${o.locked?'ov-locked':''}" tabindex="0" aria-label="Editable slide text; double-click to edit" data-slide-object="${ctx.E(o.id)}" style="${style}color:${/^#[0-9a-f]{6}$/i.test(o.color)?o.color:'#1c2c3e'};font-size:clamp(9px,${(o.fontSize||26)/7.5}cqw,60px);font-weight:${o.bold?700:400};font-style:${o.italic?'italic':'normal'};text-decoration:${o.underline?'underline':'none'};text-align:${o.align||'left'};justify-content:${({left:'flex-start',center:'center',right:'flex-end'})[o.align]||'flex-start'};align-items:${({top:'flex-start',middle:'center',bottom:'flex-end'})[o.valign]||'flex-start'};font-family:${ctx.E(o.font||'Arial, sans-serif')};line-height:${Math.max(.9,Math.min(2.5,Number(o.lineHeight)||1.16))};letter-spacing:${Math.max(-1,Math.min(8,Number(o.letterSpacing)||0))}px">${ctx.E(o.text)}${handle}</div>`;
 const kind=['rect','roundRect','ellipse'].includes(o.shapeKind)?o.shapeKind:'rect',borderColor=/^#[0-9a-f]{6}$/i.test(o.strokeColor)?o.strokeColor:'#ffffff';
 return `<div class="slide-object rect ov-shape-${kind} ${selected?'selected':''} ${o.locked?'ov-locked':''}" data-slide-object="${ctx.E(o.id)}" style="${style}background:${o.fillEnabled===false?'transparent':(/^#[0-9a-f]{6}$/i.test(o.color)?o.color:'#dff3f1')};border:${Math.max(0,Number(o.borderWidth)||0)}px solid ${borderColor};border-radius:${kind==='ellipse'?'50%':kind==='roundRect'?`${Math.max(0,Number(o.radius)||16)}px`:'0'};opacity:${Math.max(0.05,Math.min(1,(Number(o.opacity)||100)/100))}">${handle}</div>`;
 }).join('')+slideLogoHTML(s);}
export function renderSlideStage(){if(ctx.ui.page!=='present')return;const c=ctx.$('slideCanvas');if(c)c.innerHTML=slideObjectsHTML(ctx.slide());const layers=document.querySelector('.ov-slide-layers');if(layers)layers.outerHTML=renderSlideLayers(ctx.slide());refreshSlideCommandButtons();}
export function addSlide(){ctx.trackChange();const s={id:newId('slide'),name:`Slide ${ctx.project.slides.length+1}`,objects:[]};ctx.project.slides.push(s);ctx.ui.selectedSlideId=s.id;ctx.ui.selectedObjectId=null;ctx.ui.selectedObjectIds=[];ctx.ui.page='present';ctx.markDirty();ctx.render();}
export function addSlideObject(type,chartId=null){const s=ctx.slide();if(!s)return;ctx.trackChange();const o={id:ctx.uuid(),type,x:type==='rect'?26:13,y:type==='rect'?31:18,w:type==='rect'?25:74,h:type==='text'?18:type==='rect'?22:57};if(type==='chart'){if(!chartId){const first=ctx.chart();if(!first){ctx.showToast('Create a visualisation first.');return;}chartId=first.id;}o.chartId=chartId;o.cropToContent=true;o.tightLayoutV1=true;ctx.fitSlideChartToContent(o);}if(type==='text'){o.text='Add your heading';o.fontSize=32;o.color='#1c2c3e';o.bold=true;o.font='Arial, sans-serif';o.align='left';o.valign='top';o.lineHeight=1.16;}if(type==='rect'){o.color='#e4f2f0';o.shapeKind='rect';o.fillEnabled=true;o.strokeColor='#e4f2f0';o.borderWidth=0;o.opacity=100;o.radius=16;}s.objects.push(o);ctx.ui.selectedObjectId=o.id;ctx.ui.selectedObjectIds=[o.id];ctx.markDirty();ctx.render();}

// V3.58 organisation logo on slides: project-wide position and size, with a per-slide opt-out.
export function slideLogoControls(){const cfg=ctx.project.slideLogo||{},logo=normalizeLogo(ctx.project.brand?.logo),sl=ctx.slide(),pos=cfg.position||'off';
 if(!logo)return `<div class="inspector-group"><h4>Logo on slides</h4><p class="hint">Add a logo to your organisation theme (<button class="subtle-button button-small" data-action="brand-open">Format → Organisation theme</button>) to place it on every slide.</p></div>`;
 return `<div class="inspector-group slide-logo-settings"><h4>Logo on slides</h4>${ctx.field('Position on every slide',`<select data-slide-logo="position">${SLIDE_LOGO_POSITIONS.map(([v,l])=>`<option value="${v}" ${pos===v?'selected':''}>${l}</option>`).join('')}</select>`)}${pos!=='off'?`${ctx.field('Logo height (% of slide)',`<input type="number" data-slide-logo="size" min="3" max="20" step="0.5" value="${Number(cfg.size)||8}">`)}<label class="checkbox-field"><input type="checkbox" data-slide-logo="hide" ${sl?.hideLogo?'checked':''}>Hide the logo on this slide</label>`:''}<p class="hint">Uses the logo from your organisation theme. It appears in the editor and in PowerPoint, PDF and printable exports.</p></div>`;}
document.addEventListener('change',event=>{const el=event.target.closest?.('[data-slide-logo]');if(!el||!ctx.project)return;const key=el.dataset.slideLogo;ctx.trackChange();
 if(key==='hide'){const sl=ctx.slide();if(!sl)return;if(el.checked)sl.hideLogo=true;else delete sl.hideLogo;}
 else{const cfg={...(ctx.project.slideLogo||{})};if(key==='position')cfg.position=SLIDE_LOGO_POSITIONS.some(([v])=>v===el.value)?el.value:'off';if(key==='size')cfg.size=Math.max(3,Math.min(20,Number(el.value)||8));if(!cfg.size)cfg.size=8;ctx.project.slideLogo=cfg;}
 ctx.markDirty();renderSlideStage();ctx.renderInspector();});
