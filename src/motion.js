/** Local-first keyframed chart animation. Source SVG is never modified on disk. */
import {NATURAL_EFFECTS,applyNaturalMarks,chartTypeFromSvg} from './natural-motion.js';
export const DEFAULT_MOTION=Object.freeze({effect:'auto',intro:850,hold:700,outro:450,delay:0,easing:'ease-out',fps:12});
export const MOTION_EFFECTS=['auto','grow','grow-stagger','fade','stagger','rise','none',...NATURAL_EFFECTS.filter(x=>!['grow','grow-stagger','fade'].includes(x))];
export function normalizeMotion(input={}){
 const m={...DEFAULT_MOTION,...(input&&typeof input==='object'?input:{})};
 m.effect=MOTION_EFFECTS.includes(m.effect)?m.effect:'stagger';
 m.easing=['linear','ease-in','ease-out','ease-in-out'].includes(m.easing)?m.easing:'ease-out';
 for(const [key,min,max] of [['intro',0,5000],['hold',0,8000],['outro',0,5000],['delay',0,3000]])m[key]=Math.min(max,Math.max(min,Number.isFinite(Number(m[key]))?Math.round(Number(m[key])):DEFAULT_MOTION[key]));
 m.fps=Math.min(20,Math.max(4,Math.round(Number(m.fps)||12)));
 return m;
}
export function motionDuration(m){m=normalizeMotion(m);return Math.max(200,m.delay+m.intro+m.hold+m.outro);}
function ease(t,kind){t=Math.min(1,Math.max(0,t));if(kind==='ease-in')return t*t;if(kind==='ease-out')return 1-(1-t)*(1-t);if(kind==='ease-in-out')return t*t*(3-2*t);return t;}
/** Geometry-aware bar reveal shared by Story Studio and the single-chart timeline.
 * Each bar is resized from its zero/baseline edge, NEVER translated across axes.
 * The original SVG geometry can be restored for repeated scrubbing, with no
 * change to chart data, layout, or non-mark components.
 */
export function growMark(el,amount,{preview=false}={}){
 const axis=el.getAttribute('data-viz-grow-axis');
 if(!['x','y'].includes(axis)||el.localName!=='rect')return false;
 const start=axis==='x'?'x':'y',size=axis==='x'?'width':'height';
 const originalPos='data-motion-original-'+start,originalSize='data-motion-original-'+size;
 if(preview){if(!el.hasAttribute(originalPos))el.setAttribute(originalPos,el.getAttribute(start)||'0');
  if(!el.hasAttribute(originalSize))el.setAttribute(originalSize,el.getAttribute(size)||'0');}
 const pos=Number(el.getAttribute(preview?originalPos:start));
 const length=Number(el.getAttribute(preview?originalSize:size));
 if(!Number.isFinite(pos)||!Number.isFinite(length))return false;
 const t=Math.max(0,Math.min(1,Number(amount)||0)),next=length*t;
 const origin=el.getAttribute('data-viz-grow-origin');
 const reverse=origin==='bottom'||origin==='right';
 el.setAttribute(start,String(pos+(reverse?length-next:0)));
 el.setAttribute(size,String(Math.max(0,next)));
 return true;
}
export function restoreGrowMark(el){for(const attr of ['x','y','width','height']){
 const key='data-motion-original-'+attr;if(el.hasAttribute(key))el.setAttribute(attr,el.getAttribute(key));
 }}
/** At every instant, marks are visible in hold and fade out in outro. */
export function markOpacity(time,m,index,total){m=normalizeMotion(m);const t=Math.min(motionDuration(m),Math.max(0,time));if(t<m.delay)return 0;
 const local=t-m.delay;
 const isStagger=['stagger','grow-stagger'].includes(m.effect);
 const start=isStagger?m.intro*.68*(index/Math.max(1,total-1)):0;
 const span=isStagger?m.intro*.32:m.intro;
 const intro=span?ease((local-start)/Math.max(1,span),m.easing):1;
 const outStart=m.intro+m.hold;
 const outro=local<=outStart?1:m.outro?1-ease((local-outStart)/m.outro,m.easing):0;
 return m.effect==='none'?1:Math.max(0,Math.min(1,intro*outro));
}
export function setMotionFrame(svg,time,m){m=normalizeMotion(m);
 const marks=[...svg.querySelectorAll('[data-viz-part="point"],[data-viz-part="series"]')];
 const natural=!['fade','none','rise'].includes(m.effect);
 const common={...m,effect:'fade'};
 const amount=markOpacity(time,common,0,1);
 if(natural){applyNaturalMarks(svg,marks,chartTypeFromSvg(svg),m.effect==='stagger'?'sequential':m.effect,amount,{prefix:'motion'});return svg;}
 marks.forEach((el,index)=>{
  const reveal=m.effect==='stagger'?markOpacity(time,{...m,effect:'stagger'},index,marks.length):amount;
  const base=Number(el.getAttribute('opacity')??'1');el.setAttribute('opacity',String(Math.max(0,Math.min(1,base*(m.effect==='none'?1:reveal)))));
  if(m.effect==='rise')el.setAttribute('transform',`${el.getAttribute('transform')||''} translate(0 ${(1-reveal)*16})`.trim());
 });
 return svg;
}
export function animatedSvgAt(svgText,time,m){const dom=new DOMParser().parseFromString(svgText,'image/svg+xml');if(dom.querySelector('parsererror'))throw Error('Invalid SVG chart');const svg=dom.documentElement;setMotionFrame(svg,time,m);return new XMLSerializer().serializeToString(svg);}
export async function svgFrameToCanvas(svgText,ctx,width,height){const blob=new Blob([svgText],{type:'image/svg+xml'}),url=URL.createObjectURL(blob);try{const img=new Image();await new Promise((res,rej)=>{img.onload=res;img.onerror=()=>rej(Error('Could not render SVG frame'));img.src=url;});ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);}finally{URL.revokeObjectURL(url);}}
export function frameTimes(m){m=normalizeMotion(m);const duration=motionDuration(m),count=Math.min(120,Math.max(2,Math.ceil(duration*m.fps/1000)+1));return Array.from({length:count},(_,i)=>i*duration/(count-1));}
