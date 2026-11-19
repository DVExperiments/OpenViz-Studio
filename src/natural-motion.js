/** OpenViz V2.11 — chart-semantic, local-only SVG motion.
 * Every technique is deterministic and applies to a freshly generated chart SVG.
 * Axes, grid, data values and user chart specifications are never changed.
 * Style-level motion is deliberately separate from Story Studio scene transitions.
 */
const clamp=x=>Math.max(0,Math.min(1,Number(x)||0));
const pair=(value,fallback)=>{const p=String(value||'').split(',').map(Number);return p.length===2&&p.every(Number.isFinite)?p:fallback;};
const TYPES={
 bar:[['grow','Grow from baseline'],['grow-stagger','Grow bars sequentially']],
 hbar:[['grow','Grow from zero line'],['grow-stagger','Grow bars sequentially']],
 histogram:[['grow','Grow frequency bins'],['grow-stagger','Reveal bins sequentially']],
 'stacked-bar':[['grow','Build stacked segments'],['grow-stagger','Build segments in order']],
 line:[['trace','Draw line left to right'],['trace-points','Trace line, then reveal points']],
 area:[['area-grow','Grow filled area from baseline'],['trace','Reveal area left to right']],
 scatter:[['pop','Grow points in place'],['sequential','Reveal points by X position']],
 dot:[['pop','Grow dots in place'],['sequential','Reveal dots in order']],
 bubble:[['pop','Grow bubbles from centres'],['sequential','Reveal bubbles one by one']],
 donut:[['sweep','Sweep around the ring'],['sequential','Reveal slices in order']],
 treemap:[['tiles','Reveal tiles by area/order'],['sequential','Reveal tiles one by one']],
 sunburst:[['rings','Reveal parent ring before children'],['sweep','Sweep around centre']],
 sankey:[['flow','Nodes first, then flowing links'],['sequential','Reveal links one by one']],
 network:[['connections','Build nodes, then connections'],['sequential','Reveal network relationships']],
 timeline:[['milestones','Reveal events chronologically'],['pop','Reveal milestones in place']],
 gantt:[['task-build','Extend tasks from their start dates'],['sequential','Reveal tasks sequentially']],
 parallel:[['trace','Trace across variables'],['sequential','Reveal observations']],
 'geo-choropleth':[['regions','Fill regions sequentially'],['fade','Fade regions in place']],
 'geo-route':[['fade','Fade connections in place'],['sequential','Reveal connections']],
 'geo-symbol':[['pop','Grow map symbols in place'],['sequential','Reveal map symbols']],
 'geo-heat':[['intensity','Build geographic intensity'],['fade','Fade density in place']],
 heatmap:[['cells','Reveal heatmap cells'],['sequential','Reveal rows/cells']],
 'box-plot':[['box-build','Build quartiles, then whiskers and outliers'],['sequential','Reveal box plots in order']],
 violin:[['violin-grow','Expand densities symmetrically'],['sequential','Reveal violin groups']],
 waterfall:[['step-build','Build cumulative steps in order'],['grow','Grow steps from previous total']],
 slope:[['trace','Trace before/after changes'],['sequential','Reveal groups']],
};
export const NATURAL_EFFECTS=Object.freeze([...new Set(Object.values(TYPES).flatMap(v=>v.map(e=>e[0])))]);
export const NATURAL_COMMON=Object.freeze([['auto','Automatic · recommended for this chart'],['fade','Fade in place'],['custom','Custom keyframe movement'],['none','No mark intro']]);
export function chartMotionOptions(type){const recommended=TYPES[type]?.[0]?.[1]||'Fade in place';const menu=[['auto','Automatic · '+recommended],...NATURAL_COMMON.slice(1),...(TYPES[type]||[['sequential','Reveal observations in order']])];return menu.filter((v,i,a)=>a.findIndex(u=>u[0]===v[0])===i);}
export function naturalDefault(type){return TYPES[type]?.[0]?.[0]||'fade';}
export function chartTypeFromSvg(root){return root.getAttribute('data-viz-chart-type')||'';}
export function resolvedNaturalEffect(type,effect){return effect==='auto'?naturalDefault(type):effect;}
function setOpacity(el,amount){const base=Number(el.getAttribute('opacity')??'1');el.setAttribute('opacity',String(clamp(base*clamp(amount))));}
function phase(reveal,index,count,spread=.63){return count<2?clamp(reveal):clamp((reveal-spread*index/(count-1))/(1-spread));}
function rectGrow(el,t){const axis=el.getAttribute('data-viz-grow-axis');if(!['x','y'].includes(axis))return false;const key=axis==='x'?'x':'y',len=axis==='x'?'width':'height';const start=Number(el.getAttribute(key)),length=Number(el.getAttribute(len));if(!Number.isFinite(start)||!Number.isFinite(length))return false;const next=length*clamp(t),reverse=['right','bottom'].includes(el.getAttribute('data-viz-grow-origin'));el.setAttribute(key,String(start+(reverse?length-next:0)));el.setAttribute(len,String(Math.max(0,next)));return true;}
function geometryCenter(el){const target=['circle','ellipse','rect'].includes(el.localName)?el:el.querySelector('circle,ellipse,rect');if(!target)return [480,270];if(target.localName==='circle'||target.localName==='ellipse')return [Number(target.getAttribute('cx')||0),Number(target.getAttribute('cy')||0)];return [Number(target.getAttribute('x')||0)+Number(target.getAttribute('width')||0)/2,Number(target.getAttribute('y')||0)+Number(target.getAttribute('height')||0)/2];}
function centredScale(el,t,axis='xy'){const [cx,cy]=geometryCenter(el),v=clamp(t),transform=el.getAttribute('transform')||'';const sx=axis==='y'?1:v,sy=axis==='x'?1:v;el.setAttribute('transform',`${transform} translate(${cx} ${cy}) scale(${sx} ${sy}) translate(${-cx} ${-cy})`.trim());}
function pathClip(root,el,t,key,{radial=false}={}){
 if(t>=.99999)return; if(t<=.00001){setOpacity(el,0);return;}
 const plot=String(root.getAttribute('data-viz-plot')||'').split(',').map(Number),valid=plot.length===4&&plot.every(Number.isFinite);
 const left=valid?plot[0]:30,right=valid?plot[2]:930,top=valid?plot[1]:0,bottom=valid?plot[3]:540;
 const dims=pair(root.getAttribute('data-viz-motion-center'),[(left+right)/2,(top+bottom)/2]);
 const id=`ov-nat-${key.replace(/[^a-zA-Z0-9_-]/g,'-')}`;
 // One clip path per frame per animation role. All marks sharing it move together.
 let clip=root.querySelector(`[id="${id}"]`);
 const ns='http://www.w3.org/2000/svg';
 if(!clip){let defs=root.querySelector('defs[data-viz-animation-defs]');if(!defs){defs=root.ownerDocument.createElementNS(ns,'defs');defs.setAttribute('data-viz-animation-defs','');root.insertBefore(defs,root.firstChild);}clip=root.ownerDocument.createElementNS(ns,'clipPath');clip.setAttribute('id',id);clip.setAttribute('clipPathUnits','userSpaceOnUse');defs.appendChild(clip);}
 while(clip.firstChild)clip.removeChild(clip.firstChild);
 const shape=root.ownerDocument.createElementNS(ns,radial?'path':'rect');
 if(radial){const [cx,cy]=dims,R=Math.hypot(Math.max(cx,960-cx),Math.max(cy,540-cy))*2.5;
  const steps=Math.max(1,Math.ceil(80*t));const pts=[];for(let j=0;j<=steps;j++){const a=-Math.PI/2+2*Math.PI*t*j/steps;pts.push(`${(cx+R*Math.cos(a)).toFixed(2)} ${(cy+R*Math.sin(a)).toFixed(2)}`);}shape.setAttribute('d',`M${cx} ${cy} L${pts.join(' L')} Z`);
 }else{shape.setAttribute('x',String(left-25));shape.setAttribute('y',String(Math.min(-30,top-50)));shape.setAttribute('width',String(Math.max(0,right-left+50)*clamp(t)));shape.setAttribute('height','650');}
 clip.appendChild(shape);el.setAttribute('clip-path',`url(#${id})`);
}
/** Alters only SVG elements carrying data-viz-part. Assumes a fresh SVG per frame.
 * Mode is user-selected or the chart-specific automatic default. All output
 * paths are shared by Story Studio and single-chart GIF/video/HTML rendering.
 */
export function applyNaturalMarks(root,marks,type,requested,reveal,{prefix='scene',order='forward',stagger=.63}={}){
 const effect=resolvedNaturalEffect(type,requested);
 if(['custom','none','rise'].includes(effect))return false;
 const total=marks.length,amount=clamp(reveal);
 const sequential=['sequential','grow-stagger','tiles','cells','regions','milestones','task-build','step-build'].includes(effect);
 for(let i=0;i<total;i++){
  const el=marks[i],rank=order==='reverse'?total-1-i:i,local=sequential?phase(amount,rank,total,Math.max(0,Math.min(.9,Number(stagger)||0))):amount;
  // Time/relationship ordering is already preserved by source rendering.
  if(['grow','grow-stagger','step-build','task-build'].includes(effect)){
   const stackIndex=Number(el.getAttribute('data-viz-stack-index')),stackCount=Number(el.getAttribute('data-viz-stack-count'));
   const progress=type==='stacked-bar'&&Number.isFinite(stackIndex)&&Number.isFinite(stackCount)&&stackCount>0
    ?clamp(local*stackCount-stackIndex):local;
   const grows=rectGrow(el,progress);setOpacity(el,grows?1:progress);continue;
  }
  if(['trace','trace-points'].includes(effect)){
   if(el.localName==='circle'&&effect==='trace-points'){
    setOpacity(el,phase(amount,i,total,.7));continue;
   }
   pathClip(root,el,local,prefix+'-trace');continue;
  }
  if(effect==='area-grow'){
   if(el.localName==='path'&&el.getAttribute('data-viz-area-baseline')!==null){const base=Number(el.getAttribute('data-viz-area-baseline'));el.setAttribute('transform',`translate(0 ${base}) scale(1 ${local}) translate(0 ${-base})`);continue;}
   if(el.localName==='path'){pathClip(root,el,local,prefix+'-area-line');continue;}
   setOpacity(el,local);continue;
  }
  if(['sweep','rings'].includes(effect)){
   if(el.localName!=='path'){setOpacity(el,local);continue;}
   const isChild=el.getAttribute('data-viz-hierarchy-level')==='1';
   const levelProgress=effect==='rings'?(isChild?clamp((amount-.35)/.65):clamp(amount/.55)):amount;
   pathClip(root,el,levelProgress,prefix+'-radial-'+(isChild?'child':'root'),{radial:true});continue;
  }
  if(effect==='flow'){
   const isLink=el.localName==='path';const p=isLink?clamp((amount-.22)/.78):clamp(amount/.35);
   if(isLink)pathClip(root,el,p,prefix+'-flow');else setOpacity(el,p);
   continue;
  }
  if(effect==='connections'){
   const edge=el.localName==='line';const p=edge?clamp((amount-.35)/.65):clamp(amount/.45);
   if(edge){const x1=Number(el.getAttribute('x1')),x2=Number(el.getAttribute('x2')),y1=Number(el.getAttribute('y1')),y2=Number(el.getAttribute('y2'));el.setAttribute('x2',String(x1+(x2-x1)*p));el.setAttribute('y2',String(y1+(y2-y1)*p));}
   else centredScale(el,p);
   continue;
  }
  if(['pop','milestones'].includes(effect)){
   const pop=effect==='milestones'?local:amount;
   if(el.localName==='circle'){const r=Number(el.getAttribute('r')||0);el.setAttribute('r',String(r*pop));}
   else centredScale(el,pop);
   setOpacity(el,pop);continue;
  }
  if(effect==='violin-grow'){
   // Geometry anchored to each group's density centreline.
   const centre=Number(el.getAttribute('data-viz-center-x'));
   if(Number.isFinite(centre))el.setAttribute('transform',`translate(${centre} 0) scale(${local} 1) translate(${-centre} 0)`);
   else centredScale(el,local,'x');continue;
  }
  if(effect==='box-build'){
   const pieces=[...el.children].filter(c=>['rect','line','circle'].includes(c.localName));
   for(const child of pieces){const start=child.localName==='rect'?0:child.localName==='circle'?.74:.34;const end=child.localName==='rect'?.4:child.localName==='circle'?1:.82;setOpacity(child,clamp((local-start)/(end-start)));}
   continue;
  }
  if(effect==='intensity'){setOpacity(el,amount);continue;}
  // Tiles, cells, regions and conservative fallbacks: keep data geometry in place.
  setOpacity(el,local);
 }
 return true;
}
