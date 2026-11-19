import {animatedSvgAt,frameTimes,motionDuration,normalizeMotion,svgFrameToCanvas} from './motion.js';
import {makeGifAsync} from './gif.js';

export async function exportMotionGif(source,motion,{width=640,height=360,onProgress=()=>{},smoothLoop=true,loopFadeMs=600}={}){
 const m=normalizeMotion(motion),times=frameTimes(m),total=motionDuration(m),canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Canvas unavailable');
 const first=document.createElement('canvas');first.width=width;first.height=height;
 if(smoothLoop)await svgFrameToCanvas(animatedSvgAt(source,0,m),first.getContext('2d'),width,height);
 const frames=[];const fade=Math.min(loopFadeMs,total*.24);
 for(let i=0;i<times.length;i++){
  await svgFrameToCanvas(animatedSvgAt(source,times[i],m),ctx,width,height);
  if(smoothLoop&&fade&&times[i]>total-fade){const x=(times[i]-(total-fade))/fade,p=x*x*(3-2*x);
   ctx.save();ctx.globalAlpha=p;ctx.drawImage(first,0,0);ctx.restore();}
  frames.push(new Uint8Array(ctx.getImageData(0,0,width,height).data));onProgress(.72*(i+1)/times.length);
  if(i%4===0)await new Promise(resolve=>setTimeout(resolve,0));
 }
 return makeGifAsync(frames,width,height,total/Math.max(1,times.length-1),{onProgress:p=>onProgress(.72+.28*p)});
}
export function preferredVideoType(){if(!globalThis.MediaRecorder)return null;for(const type of ['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'])if(MediaRecorder.isTypeSupported(type))return type;return null;}
export async function exportMotionVideo(source,motion,{width=960,height=540,onProgress=()=>{}}={}){
 const mime=preferredVideoType();if(!mime)throw Error('This browser cannot record video. Use GIF instead.');
 const m=normalizeMotion(motion),duration=motionDuration(m),canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');const stream=canvas.captureStream(0),track=stream.getVideoTracks()[0];const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2500000});const chunks=[];
 const finished=new Promise((resolve,reject)=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onerror=e=>reject(e.error||Error('Video recording failed'));recorder.onstop=()=>resolve(new Blob(chunks,{type:mime}));});
 try{
  // Real-time capture avoids a video whose timestamps are faster than its frames.
  const started=performance.now();recorder.start();let previous=-1;
  while(true){const elapsed=Math.min(duration,performance.now()-started),frame=Math.floor(elapsed*m.fps/1000);
   if(frame!==previous||elapsed===duration){await svgFrameToCanvas(animatedSvgAt(source,elapsed,m),ctx,width,height);track.requestFrame?.();previous=frame;onProgress(elapsed/duration);}
   if(elapsed>=duration)break;
   await new Promise(r=>setTimeout(r,Math.max(8,Math.min(50,1000/m.fps/2))));
  }
  await new Promise(r=>setTimeout(r,90));recorder.stop();const blob=await finished;if(blob.size<100)throw Error('Video recorder produced an empty file');return {blob,extension:mime.includes('mp4')?'mp4':'webm',mime};
 }finally{stream.getTracks().forEach(t=>t.stop());if(recorder.state!=='inactive')recorder.stop();}
}
