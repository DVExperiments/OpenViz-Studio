import {installStoryMapReader,storyMapRuntime,storyMapCss} from './story-map-reader.js';
import {wrapText} from './chart-quality.js';
import {normalizeSceneState,sceneSource} from './story-state.js';
import {stateTransitionCheck,stateTransitionSvg} from './story-transition.js';
/** OpenViz Story Studio V2.9 — deterministic, local-first multi-scene compositor.
 * All scene changes live in the project, never in chart datasets or renderers.
 * Frame rendering uses the same SVG for browser preview, GIF, video and standalone HTML.
 */
import {svgFrameToCanvas} from './motion.js';
import {NATURAL_EFFECTS,applyNaturalMarks,chartTypeFromSvg} from './natural-motion.js';
import {makeGifAsync} from './gif.js';

export const TRACKS=Object.freeze({marks:'Data marks',title:'Chart titles',axes:'Axes & grid',labels:'Value labels',annotations:'Annotations',point:'Selected data point'});
export const TRANSITIONS=['crossfade','slide','wipe','zoom','cut','state'];
export const MARK_EFFECTS=['auto','grow','grow-stagger','fade','custom','none',...NATURAL_EFFECTS.filter(x=>!['grow','grow-stagger','fade'].includes(x))];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const clean=(s,n=180)=>String(s??'').slice(0,n);
export const DEFAULT_KEYS=Object.freeze({
 marks:[{at:0,opacity:0,dx:0,dy:18,scale:0.96},{at:1,opacity:1,dx:0,dy:0,scale:1}],
 title:[{at:0,opacity:0,dx:0,dy:-14,scale:1},{at:.32,opacity:1,dx:0,dy:0,scale:1}],
 axes:[{at:0,opacity:1,dx:0,dy:0,scale:1},{at:1,opacity:1,dx:0,dy:0,scale:1}],
 labels:[{at:0,opacity:0,dx:0,dy:0,scale:1},{at:.8,opacity:1,dx:0,dy:0,scale:1}],
 annotations:[{at:0,opacity:0,dx:0,dy:8,scale:1},{at:.5,opacity:1,dx:0,dy:0,scale:1}],
 point:[{at:0,opacity:1,dx:0,dy:0,scale:1},{at:.5,opacity:1,dx:0,dy:0,scale:1.2},{at:1,opacity:1,dx:0,dy:0,scale:1}]
});
export function freshScene(chartId,id='scene-'+Math.random().toString(36).slice(2)){
 return {id,chartId,chapterTitle:'',chapterText:'',chapterDescription:'',caption:'',duration:5400,animationMs:2600,transition:'crossfade',transitionMs:650,markEffect:'auto',markOrder:'forward',markStagger:.63,focusKey:'',spotlightDim:0.45,tracks:structuredClone(DEFAULT_KEYS)};
}
export function freshStory(chartId,id='story-'+Math.random().toString(36).slice(2)){
 return {id,name:'Untitled visual story',delivery:'player',introduction:'',scrollTransitions:false,width:960,height:540,background:'#ffffff',scenes:chartId?[freshScene(chartId)]:[]};
}
export function normalizeKeys(keys){const out={};for(const track of Object.keys(TRACKS)){
 const raw=Array.isArray(keys?.[track])?keys[track]:DEFAULT_KEYS[track];
 out[track]=raw.slice(0,24).map(k=>({at:clamp(k.at,0,1),opacity:clamp(k.opacity,0,1),dx:clamp(k.dx,-600,600),dy:clamp(k.dy,-600,600),scale:clamp(k.scale===undefined?1:k.scale,.1,4),easing:['linear','ease-in','ease-out','ease-in-out'].includes(k.easing)?k.easing:'ease-in-out'})).sort((a,b)=>a.at-b.at);
 if(!out[track].length)out[track]=[{at:0,opacity:1,dx:0,dy:0,scale:1,easing:'linear'}];
 }return out;
}
export function normalizeScene(input){const s=input||{};return {chapterTitle:clean(s.chapterTitle,120),chapterText:clean(s.chapterText,4000),chapterDescription:clean(s.chapterDescription,1000),state:normalizeSceneState(s.state),id:clean(s.id,100)||'scene',chartId:clean(s.chartId,100),caption:clean(s.caption,320),duration:clamp(s.duration??5400,600,20000),animationMs:clamp(s.animationMs??Math.min(2500,(s.duration??5400)*.62),200,Math.max(200,s.duration??5400)),transition:TRANSITIONS.includes(s.transition)?s.transition:'crossfade',transitionMs:clamp(s.transitionMs??550,0,2200),markEffect:MARK_EFFECTS.includes(s.markEffect)?s.markEffect:'auto',markOrder:s.markOrder==='reverse'?'reverse':'forward',markStagger:clamp(s.markStagger??.63,0,.9),focusKey:clean(s.focusKey,180),spotlightDim:clamp(s.spotlightDim??.45,0,1),tracks:normalizeKeys(s.tracks)};}
export function normalizeStory(input){const s=input||{};return {delivery:s.delivery==='scroll'?'scroll':'player',introduction:clean(s.introduction,2000),scrollTransitions:s.scrollTransitions===true,id:clean(s.id,100)||'story',name:clean(s.name,90)||'Visual story',width:960,height:540,background:/^#[0-9a-f]{6}$/i.test(s.background||'')?s.background:'#ffffff',scenes:(Array.isArray(s.scenes)?s.scenes:[]).slice(0,24).map(normalizeScene)};}
export function storyLayout(story){const scenes=normalizeStory(story).scenes;let t=0;const result=[];for(let i=0;i<scenes.length;i++){
 const s=scenes[i],previous=scenes[i-1];const overlap=i&&s.transition!=='cut'?Math.min(s.transitionMs,previous.duration*.4,s.duration*.4):0;
 t=Math.max(0,t-overlap);result.push({scene:s,index:i,start:t,end:t+s.duration,overlap});t+=s.duration;
 }return {scenes:result,duration:Math.max(0,t)};
}
export function sceneAtTime(story,ms){const layout=storyLayout(story);return layout.scenes.filter(s=>ms>=s.start&&ms<=s.end);}
const ease=(t,mode)=>{t=clamp(t,0,1);if(mode==='ease-in')return t*t;if(mode==='ease-out')return 1-(1-t)*(1-t);if(mode==='ease-in-out')return t*t*(3-2*t);return t;};
export function tween(keys,at){const k=[...keys].sort((a,b)=>a.at-b.at);if(at<=k[0].at)return k[0];if(at>=k.at(-1).at)return k.at(-1);for(let i=1;i<k.length;i++){
 const a=k[i-1],b=k[i];if(at<=b.at){const x=ease((at-a.at)/Math.max(.00001,b.at-a.at),b.easing);const v={at};for(const prop of ['opacity','dx','dy','scale'])v[prop]=(a[prop]??(prop==='scale'?1:0))*(1-x)+(b[prop]??(prop==='scale'?1:0))*x;return v;}
 }return k.at(-1);
}
const selectors={marks:'[data-viz-part="point"], [data-viz-part="series"]',title:'[data-viz-part="title"], [data-viz-part="subtitle"], [data-viz-part="figure"]',axes:'[data-viz-part="x-axis"], [data-viz-part="y-axis"], [data-viz-part="grid"], [data-viz-part="axis-title"]',labels:'[data-viz-part="labels"], [data-viz-part="value-label"]',annotations:'[data-viz-part="annotation"]'};
function applyTracks(source,scene,local){const doc=new DOMParser().parseFromString(source,'image/svg+xml');if(doc.querySelector('parsererror'))throw Error('Invalid chart SVG in storyboard');const root=doc.documentElement;
 const progress=clamp(local/(scene.animationMs||Math.min(2500,scene.duration*.62)),0,1);
 const marks=[...root.querySelectorAll(selectors.marks)];
 const effect=scene.markEffect||'auto';
 for(const [name,selector] of Object.entries(selectors)){
  const p=tween(scene.tracks[name],progress);
  const items=name==='marks'?marks:[...root.querySelectorAll(selector)];
  // Natural motion is semantic and shape-aware; only Custom moves marks freely.
  if(name==='marks'&& !['custom','none','fade'].includes(effect)){
   applyNaturalMarks(root,marks,chartTypeFromSvg(root),effect,p.opacity,{prefix:scene.id,order:scene.markOrder,stagger:scene.markStagger});
   continue;
  }
  for(const item of items){
   const base=Number(item.getAttribute('opacity')??'1');
   item.setAttribute('opacity',String(clamp(base*(name==='marks'&&effect==='none'?1:p.opacity),0,1)));
   const allowsTransform=name!=='marks'||effect==='custom';
   if(allowsTransform&&(p.dx||p.dy||Math.abs(p.scale-1)>.0001)){
    const original=item.getAttribute('transform')||'';
    item.setAttribute('transform',`translate(${p.dx.toFixed(2)} ${p.dy.toFixed(2)}) translate(480 270) scale(${p.scale.toFixed(4)}) translate(-480 -270) ${original}`);
   }
  }
 }
 if(scene.focusKey){
  // Explicitly chosen point; other marks are subdued only during the middle of
  // the scene. Base mark opacity and data values are retained in the source SVG.
  const ramp=Math.min(1,Math.max(0,(progress-.2)/.18),Math.max(0,(1-progress)/.15));
  const point=tween(scene.tracks.point,progress);
  for(const el of root.querySelectorAll('[data-viz-key]')){
   const selected=el.getAttribute('data-viz-key')===scene.focusKey;
   const existing=Number(el.getAttribute('opacity')||1);
   const factor=selected?point.opacity:1-ramp*(1-scene.spotlightDim);
   el.setAttribute('opacity',String(clamp(existing*factor,0,1)));
   if(selected&&(point.dx||point.dy||Math.abs(point.scale-1)>.0001)){
    const original=el.getAttribute('transform')||'';
    // Keep scaling centred on visible geometry, not SVG origin (0,0).
    const geom=el.matches('rect,circle,ellipse')?el:el.querySelector('rect,circle,ellipse');
    const cx=geom?Number(geom.getAttribute('cx')??(Number(geom.getAttribute('x')||0)+Number(geom.getAttribute('width')||0)/2)):480;
    const cy=geom?Number(geom.getAttribute('cy')??(Number(geom.getAttribute('y')||0)+Number(geom.getAttribute('height')||0)/2)):270;
    el.setAttribute('transform',`${original} translate(${point.dx.toFixed(2)} ${point.dy.toFixed(2)}) translate(${cx} ${cy}) scale(${point.scale.toFixed(4)}) translate(${-cx} ${-cy})`.trim());
   }
  }
 }
 root.setAttribute('x','0');root.setAttribute('y','0');root.setAttribute('width','960');root.setAttribute('height','540');root.setAttribute('viewBox','0 0 960 540');
 return new XMLSerializer().serializeToString(root);
}
const xml=s=>clean(s,1000).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
function caption(scene,weight){if(!scene.caption)return '';const lines=wrapText(scene.caption,832,19,3);
 const h=48+Math.max(0,lines.length-1)*23,top=540-h-18;
 return `<g opacity="${weight.toFixed(4)}"><title>${xml(scene.caption)}</title><rect x="38" y="${top}" width="884" height="${h}" rx="10" fill="#142331" fill-opacity=".88"/>${lines.map((s,i)=>`<text x="64" y="${top+29+i*23}" font-family="Arial,sans-serif" font-size="19" fill="#fff">${xml(s)}</text>`).join('')}</g>`;
}
function layerSvg(entry,activeTime,source,transition){const scene=entry.scene,local=activeTime-entry.start;
 const visuals=scene.transition==='state'?source:applyTracks(source,scene,local);let opacity=1,dx=0,scale=1,clip='';
 if(transition?.outgoing){const p=transition.progress,type=transition.type;if(type==='crossfade'||type==='zoom')opacity=1-p;if(type==='slide')dx=-960*p;if(type==='wipe')opacity=1;if(type==='zoom')scale=1+.07*p;}
 if(transition?.incoming){const p=transition.progress,type=transition.type;if(type==='crossfade'||type==='zoom')opacity=p;if(type==='slide')dx=960*(1-p);if(type==='wipe')clip=`<clipPath id="${xml(scene.id)}-wipe"><rect x="0" y="0" width="${(960*p).toFixed(2)}" height="540"/></clipPath>`;if(type==='zoom')scale=.9+.1*p;}
 const wrap=clip?`clip-path="url(#${xml(scene.id)}-wipe)"`:'';
 return `${clip}<g data-story-scene="${xml(scene.id)}" ${wrap} opacity="${opacity.toFixed(4)}" transform="translate(${dx.toFixed(2)} 0) translate(480 270) scale(${scale.toFixed(4)}) translate(-480 -270)">${visuals}</g>${transition?'':caption(scene,opacity)}`;
}
/** Render SVG at an absolute story time. Source dictionary is chartId=>clean source SVG. */
export function storySvgAt(story,sourceByChart,at){const s=normalizeStory(story),layout=storyLayout(s),ms=clamp(at,0,layout.duration);let active=layout.scenes.filter(item=>ms>=item.start&&ms<=item.end);
 if(!active.length&&layout.scenes.length)active=[layout.scenes.at(-1)];
 const incoming=active.length>1?active.at(-1):null;let transition=null;if(incoming){const overlap=Math.max(1,incoming.overlap),progress=clamp((ms-incoming.start)/overlap,0,1);transition={type:incoming.scene.transition,progress};}
 let stateLayer='';if(incoming&&transition.type==='state'){const outgoing=active[0],a=sceneSource(sourceByChart,outgoing.scene,outgoing.index),b=sceneSource(sourceByChart,incoming.scene,incoming.index),check=a&&b?stateTransitionCheck(a,b,outgoing.scene,incoming.scene):{ok:false};if(check.ok)stateLayer=stateTransitionSvg(a,b,transition.progress);else transition={...transition,type:'crossfade',fallback:true};}
 const groups=stateLayer||active.map((entry,i)=>{const source=sceneSource(sourceByChart,entry.scene,entry.index);if(!source)return `<text x="480" y="270" fill="#b33" text-anchor="middle" font-size="22">Missing source chart</text>`;return layerSvg(entry,ms,source,transition?{...transition,outgoing:i===0,incoming:i>0}:null);}).join('');const transitionCaptions=transition&&active.length>1?caption(active[0].scene,Math.max(0,1-transition.progress*2))+caption(incoming.scene,Math.max(0,transition.progress*2-1)):'';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" ${transition?.fallback?'data-story-transition-fallback="crossfade"':''} aria-label="${xml(s.name)}"><rect width="960" height="540" fill="${s.background}"/>${groups}${transitionCaptions}</svg>`;
}
export function storyFrameTimes(story,fps=12,max=150){const layout=storyLayout(story),duration=layout.duration;if(!duration)return [0];const important=new Set([0,duration]);for(const entry of layout.scenes){important.add(entry.start);important.add(Math.min(entry.end,entry.start+Math.max(entry.overlap,entry.scene.transition==='state'?0:entry.scene.animationMs)));if(entry.overlap)important.add(entry.start+entry.overlap);}
 if(important.size>max)throw Error('The frame budget cannot retain every scene boundary. Reduce the number of scenes.');const wanted=Math.min(max,Math.max(important.size,Math.ceil(duration*fps/1000)+1)),remaining=wanted-important.size;for(let i=1;i<=remaining;i++)important.add(i*duration/(remaining+1));return [...important].sort((a,b)=>a-b);}
/** GIF export: stable, fully rendered frames and a deliberately seamless last-to-first loop.
 * The loop is an export behaviour; storyboard keyframes and original SVG never change.
 */
export function gifExportEstimate(story,{fps=18,maxFrames=180,fadeMs=600}={}){
 const duration=storyLayout(story).duration;
 const count=storyFrameTimes(story,fps,maxFrames).length;
 return {duration,frames:count,effectiveFps:duration?count*1000/duration:fps,loopFadeMs:Math.min(fadeMs,duration*.22)};
}
export async function storyGif(story,sources,{onProgress=()=>{},onStage=()=>{},width=560,height=315,fps=18,maxFrames=180,smoothLoop=true,loopFadeMs=650,signal,rasterize}={}){
 const abort=()=>{if(signal?.aborted)throw new DOMException('Export cancelled','AbortError');};
 const config=gifExportEstimate(story,{fps,maxFrames,fadeMs:loopFadeMs}),times=storyFrameTimes(story,fps,maxFrames);
 if(rasterize&&smoothLoop)throw Error('Raster fixture export requires smoothLoop=false.');
 const canvas=rasterize?null:document.createElement('canvas');if(canvas){canvas.width=width;canvas.height=height;}
 const ctx=canvas?.getContext('2d',{willReadFrequently:true});if(!ctx&&!rasterize)throw Error('Canvas unavailable');
 const first=rasterize?null:document.createElement('canvas');if(first){first.width=width;first.height=height;}const firstCtx=first?.getContext('2d');
 if(smoothLoop){abort();await svgFrameToCanvas(storySvgAt(story,sources,0),firstCtx,width,height);}
 const frames=[];onStage('Rendering fully composited frames');
 for(let i=0;i<times.length;i++){
  abort();const svg=storySvgAt(story,sources,times[i]);const rgba=rasterize?await rasterize(svg,width,height,i):null;if(!rasterize)await svgFrameToCanvas(svg,ctx,width,height);
  if(smoothLoop&&config.loopFadeMs>0&&times[i]>config.duration-config.loopFadeMs){
   let p=Math.max(0,Math.min(1,(times[i]-(config.duration-config.loopFadeMs))/config.loopFadeMs));
   p=p*p*(3-2*p);ctx.save();ctx.globalAlpha=p;ctx.drawImage(first,0,0);ctx.restore();
  }
  if(rgba&&rgba.length!==width*height*4)throw Error('Invalid story raster dimensions');frames.push(rgba?new Uint8Array(rgba):new Uint8Array(ctx.getImageData(0,0,width,height).data));
  onProgress((i+1)/times.length*.72);if(i%4===0)await new Promise(r=>setTimeout(r,0));
 }
 abort();onStage('Building one consistent colour palette');await new Promise(r=>setTimeout(r,0));
 if(config.duration<=0)throw Error('Add a scene before exporting a story GIF.');const hold=Math.min(config.duration/Math.max(1,times.length),1000/fps),factor=(config.duration-hold)/config.duration,rawDelays=times.map((t,i)=>i===times.length-1?hold:(times[i+1]-t)*factor),delays=rawDelays.map(d=>Math.max(20,d)),extra=delays.reduce((a,b)=>a+b,0)-config.duration,capacity=delays.reduce((a,b)=>a+b-20,0);if(extra>capacity+.001)throw Error('Too many GIF frames for this duration. Reduce the frame rate.');if(extra>0&&capacity>0)for(let i=0;i<delays.length;i++)delays[i]-=extra*(delays[i]-20)/capacity;const gif=await makeGifAsync(frames,width,height,100,{signal,delays,onProgress:p=>onProgress(.72+.28*p)});
 onProgress(1);return gif;
}
export function storyVideoType(){if(!globalThis.MediaRecorder)return null;for(const t of ['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'])if(MediaRecorder.isTypeSupported(t))return t;return null;}
export async function storyVideo(story,sources,{onProgress=()=>{},width=960,height=540,fps=24,signal}={}){const mime=storyVideoType();if(!mime)throw Error('Your browser cannot record video; use GIF or HTML.');const duration=storyLayout(story).duration;if(signal?.aborted)throw new DOMException('Export cancelled','AbortError');if(duration>90000)throw Error('Video storyboard exceeds the 90 second recording limit');const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');const stream=canvas.captureStream(0);const track=stream.getVideoTracks()[0];const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5000000});const parts=[];
 const finished=new Promise((resolve,reject)=>{recorder.ondataavailable=e=>{if(e.data.size)parts.push(e.data);};recorder.onerror=e=>reject(e.error||Error('Video recording failed'));recorder.onstop=()=>resolve(new Blob(parts,{type:mime}));});
 try{recorder.start();const start=performance.now();let prev=-1;while(true){if(signal?.aborted)throw new DOMException('Export cancelled','AbortError');const ms=Math.min(duration,performance.now()-start),index=Math.floor(ms/(1000/Math.max(10,Math.min(30,fps))));if(index!==prev||ms===duration){await svgFrameToCanvas(storySvgAt(story,sources,ms),ctx,width,height);track.requestFrame?.();prev=index;onProgress(ms/duration);}if(ms>=duration)break;await new Promise(r=>setTimeout(r,30));}await new Promise(r=>setTimeout(r,90));recorder.stop();const blob=await finished;if(blob.size<100)throw Error('Video recording produced no frames');return {blob,extension:mime.includes('mp4')?'mp4':'webm'};
 }finally{stream.getTracks().forEach(t=>t.stop());if(recorder.state!=='inactive')recorder.stop();}
}
export function standaloneStoryHtml(story,sources){const s=normalizeStory(story),times=storyFrameTimes(s,12,180),duration=storyLayout(s).duration,frames=[];let bytes=0;for(const t of times){const frame=storySvgAt(s,sources,t);bytes+=frame.length;if(bytes>24*1024*1024)throw Error('Story HTML exceeds the 24 MiB frame budget. Reduce scenes or embedded images.');frames.push(frame);}const sceneViews=s.scenes.map((sc,i)=>storySceneSvg(s,sources,i));bytes+=sceneViews.reduce((n,v)=>n+v.length,0);if(bytes>24*1024*1024)throw Error('Story HTML exceeds the 24 MiB frame budget. Reduce scenes or embedded images.');const sceneLabels=s.scenes.map((sc,i)=>sc.chapterTitle||'Scene '+(i+1));const sceneTimes=storyLayout(s).scenes.map(e=>Math.min(e.end,e.start+Math.max(e.overlap,e.scene.transition==='state'?0:e.scene.animationMs))),sceneStarts=storyLayout(s).scenes.map(e=>e.start),firstVisible=storySvgAt(s,sources,sceneTimes[0]||0),payload=JSON.stringify({name:s.name,duration,frames,times,sceneTimes,sceneStarts,sceneViews,sceneLabels}).replace(/[<>&\u2028\u2029]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));if(new TextEncoder().encode(firstVisible+payload).length>24*1024*1024)throw Error('Story HTML exceeds the 24 MiB frame budget. Reduce scenes or embedded images.');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${xml(s.name)}</title><style>body{font:14px system-ui,Arial;background:#182738;color:#f2f5f7;margin:0;padding:20px}.wrap{max-width:1100px;margin:auto}.frame{background:white;border-radius:8px;overflow:hidden}.frame svg{display:block;width:100%;height:auto}.controls{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:15px}input{flex:1;min-width:160px}button{border:0;border-radius:5px;padding:9px 14px;background:#008d85;color:#fff;cursor:pointer}small{color:#b9cbd4}${storyMapCss}</style></head><body><main class="wrap"><h1>${xml(s.name)}</h1><div class="frame" id="stage" aria-label="Data story">${firstVisible}</div><div class="controls"><button id="play" aria-pressed="false">Play</button><button id="previous">Previous scene</button><button id="next">Next scene</button><button id="restart">Restart</button><input id="seek" aria-label="Seek timeline" type="range" min="0" max="${duration}" value="0"><output id="clock" role="status">0.0 s</output></div><p><small>Saved scene views with live source values at export time. Transitions are visual effects, not additional observations. Playback starts paused; use scene buttons or the timeline with reduced motion.</small></p></main><script>${storyPlayerRuntime}
${storyMapRuntime}
(${installStoryPlayer.toString()})(${payload},document);</script></body></html>`;
}
export function installStoryPlayer(story,doc){const win=doc.defaultView,stage=doc.getElementById('stage'),seek=doc.getElementById('seek'),playButton=doc.getElementById('play'),media=win.matchMedia?.('(prefers-reduced-motion: reduce)');let at=0,raf=0,playing=false,begin=0;const reader=installStoryMapReader(stage,{pause:stop});
 function draw(t){at=Math.max(0,Math.min(story.duration,Number(t)||0));let index=0,best=Number.MAX_VALUE;story.times.forEach((value,i)=>{const d=Math.abs(value-at);if(d<best){best=d;index=i;}});stage.innerHTML=story.frames[index]||'';const scene=Math.max(0,story.sceneStarts.findLastIndex(t=>t<=at+1));reader.update(story.sceneViews?.[scene]||'',scene,story.sceneLabels?.[scene]);seek.value=at;doc.getElementById('clock').textContent=(at/1000).toFixed(1)+' s';}
 function stop(){win.cancelAnimationFrame?.(raf);raf=0;playing=false;playButton.textContent='Play';playButton.setAttribute('aria-pressed','false');}
 function play(){reader.close();if(playing){stop();return;}if(media?.matches){doc.getElementById('clock').textContent='Reduced motion: use scene buttons or the timeline.';return;}if(at>=story.duration)draw(0);playing=true;begin=win.performance.now()-at;playButton.textContent='Pause';playButton.setAttribute('aria-pressed','true');function tick(now){if(!playing)return;draw(now-begin);if(at<story.duration)raf=win.requestAnimationFrame(tick);else stop();}raf=win.requestAnimationFrame(tick);}
 function scene(direction){reader.close();stop();const choices=story.sceneTimes,index=Math.max(0,story.sceneStarts.findLastIndex(t=>t<=at+1));draw(choices[index+direction]??(direction>0?story.duration:0));}
 playButton.onclick=play;doc.getElementById('restart').onclick=()=>{reader.close();stop();draw(0);};doc.getElementById('previous').onclick=()=>scene(-1);doc.getElementById('next').onclick=()=>scene(1);seek.oninput=()=>{reader.close();stop();draw(+seek.value);};media?.addEventListener?.('change',()=>{if(media.matches)stop();});doc.addEventListener('visibilitychange',()=>{if(doc.hidden)stop();});draw(media?.matches?story.sceneTimes[0]||0:0);
}
const storyPlayerRuntime='';

/** Complete final view of a single chapter, without overlapping neighbours. */
export function storySceneSvg(story,sources,index){const s=normalizeStory(story),scene=s.scenes[index];if(!scene)return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540"></svg>`;const source=sceneSource(sources,scene,index);if(!source)throw Error('Chapter '+(index+1)+' is missing its source view.');return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" aria-label="${xml(scene.chapterDescription||scene.chapterTitle||s.name)}"><rect width="960" height="540" fill="${s.background}"/>${layerSvg({scene,start:0},scene.duration,source,null)}</svg>`;}
