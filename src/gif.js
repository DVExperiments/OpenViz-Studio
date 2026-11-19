/** Standalone GIF89a encoder: browser-only, fixed RGB332 palette and LZW. */
const bytes16=n=>[n&255,(n>>8)&255];
function lzw(indexes){const clear=256,end=257,output=[];let width=9,next=258,dictionary=new Map(),bits=0,bitCount=0;
 function write(code){bits|=code<<bitCount;bitCount+=width;while(bitCount>=8){output.push(bits&255);bits>>>=8;bitCount-=8;}}
 function reset(){dictionary=new Map();width=9;next=258;}
 write(clear);let prefix=indexes[0]??0;
 for(let i=1;i<indexes.length;i++){const c=indexes[i],key=prefix+','+c;
  if(dictionary.has(key)){prefix=dictionary.get(key);continue;}
  write(prefix);
  if(next<4096){dictionary.set(key,next++);if(next===(1<<width)+1&&width<12)width++;}
  else{write(clear);reset();}
  prefix=c;
 }
 write(prefix);write(end);if(bitCount>0)output.push(bits&255);
 const blocks=[];for(let i=0;i<output.length;i+=255)blocks.push(Math.min(255,output.length-i),...output.slice(i,i+255));blocks.push(0);return [8,...blocks];
}
/**
 * V2.10 adaptive, single-palette GIF encoder.
 * One palette is calculated from samples across the WHOLE animation. Every frame
 * is encoded as a complete opaque image with GIF disposal 1 (retain), avoiding
 * per-frame palette shimmer, transparent disposal artifacts and browser flashes.
 * No network dependencies or image-upload services.
 */
function stopped(signal){if(signal?.aborted)throw new DOMException('Export cancelled','AbortError');}
function quantizePalette(frames,width,height,signal){
 const bins=new Map();const px=width*height;
 // Equal treatment of early and late scenes, sampling each frame uniformly.
 const stride=Math.max(2,Math.ceil(px/24000));
 for(let n=0;n<frames.length;n++){
  stopped(signal);const frame=frames[n];
  for(let i=(n%stride);i<px;i+=stride){const j=i*4,a=frame[j+3]/255,r=Math.round(frame[j]*a+255*(1-a)),g=Math.round(frame[j+1]*a+255*(1-a)),b=Math.round(frame[j+2]*a+255*(1-a));
   const key=(r>>3)<<10|(g>>3)<<5|(b>>3);const entry=bins.get(key);
   if(entry){entry.n++;entry.r+=r;entry.g+=g;entry.b+=b;}else bins.set(key,{r,g,b,n:1,qR:r>>3,qG:g>>3,qB:b>>3});
  }
 }
 if(!bins.size)throw Error('No GIF pixels available');
 const colors=[...bins.values()];
 function boxFor(items){let lo=[32,32,32],hi=[-1,-1,-1],weight=0;
  for(const it of items){weight+=it.n;const channels=[it.qR,it.qG,it.qB];for(let c=0;c<3;c++){lo[c]=Math.min(lo[c],channels[c]);hi[c]=Math.max(hi[c],channels[c]);}}
  const span=hi.map((v,i)=>v-lo[i]);return {items,weight,span};
 }
 let boxes=[boxFor(colors)];
 while(boxes.length<256){
  let idx=-1,largest=-1;
  for(let i=0;i<boxes.length;i++){const box=boxes[i];if(box.items.length<2)continue;
   const score=Math.max(box.span[0]*.9,box.span[1]*1.2,box.span[2]) * Math.sqrt(box.weight);
   if(score>largest){largest=score;idx=i;}
  }
  if(idx<0)break;const chosen=boxes[idx],axis=chosen.span[1]*1.2>=Math.max(chosen.span[0]*.9,chosen.span[2])?'qG':chosen.span[0]*.9>=chosen.span[2]?'qR':'qB';
  const sorted=chosen.items.sort((a,b)=>a[axis]-b[axis]);let running=0,split=1;
  for(let i=0;i<sorted.length-1;i++){running+=sorted[i].n;if(running>=chosen.weight/2){split=i+1;break;}}
  boxes.splice(idx,1,boxFor(sorted.slice(0,split)),boxFor(sorted.slice(split)));
 }
 const palette=boxes.map(box=>{let r=0,g=0,b=0;for(const c of box.items){r+=c.r;g+=c.g;b+=c.b;}return [Math.round(r/box.weight),Math.round(g/box.weight),Math.round(b/box.weight)];});
 while(palette.length<256)palette.push(palette[0]);return palette;
}
function encodeFrame(rgba,width,height,palette,lookup,signal){const indices=new Uint8Array(width*height);
 for(let i=0,k=0;i<rgba.length;i+=4,k++){
  if(k%140000===0)stopped(signal);const a=rgba[i+3]/255,r=Math.round(rgba[i]*a+255*(1-a)),g=Math.round(rgba[i+1]*a+255*(1-a)),b=Math.round(rgba[i+2]*a+255*(1-a));
  const key=(r>>3)<<10|(g>>3)<<5|(b>>3);let idx=lookup[key];
  if(idx<0){let score=1e20;for(let j=0;j<palette.length;j++){const c=palette[j],dr=r-c[0],dg=g-c[1],db=b-c[2];const d=3*dr*dr+6*dg*dg+2*db*db;if(d<score){score=d;idx=j;}}lookup[key]=idx;}
  indices[k]=idx;
 }return indices;
}
// Optional per-frame timing and finite playback; existing callers keep their defaults.
export function gifFrameDelays(count,delayMs=100,delays){if(delays&&(!Array.isArray(delays)||delays.length!==count))throw Error('GIF delay count does not match its frames');let total=0,previous=0;return Array.from({length:count},(_,i)=>{const ms=Number(delays?delays[i]:delayMs);if(!Number.isFinite(ms)||ms<=0)throw Error('GIF frame delays must be positive finite numbers');total+=Math.max(20,ms)/10;const rounded=Math.round(total),ticks=rounded-previous;previous=rounded;if(ticks>65535)throw Error('GIF frame delay exceeds the format limit');return Math.max(2,ticks);});}
function appendGifBytes(out,bytes){for(let i=0;i<bytes.length;i+=8192)out.push(...bytes.slice(i,i+8192));}
function gifComment(out,comment){if(!comment)return;const bytes=new TextEncoder().encode(String(comment).slice(0,4096));out.push(0x21,0xfe);for(let i=0;i<bytes.length;i+=255){const part=bytes.slice(i,i+255);out.push(part.length,...part);}out.push(0);}
export function makeGif(frames,width,height,delayMs=100,{signal,onProgress=()=>{},delays,loop=true,comment=''}={}){
 if(!frames.length)throw Error('No GIF frames');if(width>1000||height>1000||frames.length>220)throw Error('GIF exceeds browser-safe limits');
 for(const frame of frames)if(frame.length!==width*height*4)throw Error('Invalid GIF frame dimensions');
 const timing=gifFrameDelays(frames.length,delayMs,delays);stopped(signal);const palette=quantizePalette(frames,width,height,signal);
 const out=[...new TextEncoder().encode('GIF89a'),...bytes16(width),...bytes16(height),0xf7,0,0];
 for(const c of palette)out.push(...c);
 if(loop)out.push(0x21,0xff,11,...new TextEncoder().encode('NETSCAPE2.0'),3,1,0,0,0);
 gifComment(out,comment);const lookup=new Int16Array(32768);lookup.fill(-1);
 for(let f=0;f<frames.length;f++){
  stopped(signal);const indices=encodeFrame(frames[f],width,height,palette,lookup,signal);
  const delay=timing[f];
  // Packed field 4 => disposal method 1 (leave previous full frame in place).
  out.push(0x21,0xf9,4,4,...bytes16(delay),0,0,0x2c,0,0,0,0,...bytes16(width),...bytes16(height),0);appendGifBytes(out,lzw(indices));
  onProgress((f+1)/frames.length);
 }
 out.push(0x3b);return new Blob([new Uint8Array(out)],{type:'image/gif'});
}
/** Responsive encoder for long animations; gives the browser time to paint status/cancel. */
export async function makeGifAsync(frames,width,height,delayMs=100,{signal,onProgress=()=>{},delays,loop=true,comment=''}={}){
 if(!frames.length)throw Error('No GIF frames');if(width>1000||height>1000||frames.length>220)throw Error('GIF exceeds browser-safe limits');
 for(const frame of frames)if(frame.length!==width*height*4)throw Error('Invalid GIF frame dimensions');
 const timing=gifFrameDelays(frames.length,delayMs,delays);stopped(signal);
 const palette=quantizePalette(frames,width,height,signal);
 const out=[...new TextEncoder().encode('GIF89a'),...bytes16(width),...bytes16(height),0xf7,0,0];
 for(const rgb of palette)out.push(...rgb);
 if(loop)out.push(0x21,0xff,11,...new TextEncoder().encode('NETSCAPE2.0'),3,1,0,0,0);
 gifComment(out,comment);const lookup=new Int16Array(32768);lookup.fill(-1);
 for(let f=0;f<frames.length;f++){
  stopped(signal);
  const indices=encodeFrame(frames[f],width,height,palette,lookup,signal);
  out.push(0x21,0xf9,4,4,...bytes16(timing[f]),0,0,0x2c,0,0,0,0,...bytes16(width),...bytes16(height),0);appendGifBytes(out,lzw(indices));
  onProgress((f+1)/frames.length);
  if(f%3===0)await new Promise(resolve=>setTimeout(resolve,0));
 }
 stopped(signal);out.push(0x3b);
 return new Blob([new Uint8Array(out)],{type:'image/gif'});
}
