import {raceNumber} from './race.js';
import {escapeText as E,fitText,svgLines,wrapText} from './chart-quality.js';
import {raceAssetSet,raceAppearance,raceCategoryColour,raceFlagCredit} from './race-assets.js';

export const LINE_RACE_META={name:'Line chart race',category:'Animation & ranking',use:'Reveal multiple trajectories over ordered periods with a fixed signed scale and explicit gaps.',needs:'Long format: period, entity and numeric value. At most 15 displayed entities; duplicates use the selected aggregation.'};

// Pure shared geometry: the same state drives SVG, live playback and GIF/video.
export function lineRaceState(model,position,g){
 const last=Math.max(0,model.frames.length-1),p=Math.max(0,Math.min(last,Number(position)||0)),index=Math.floor(p),fraction=p-index;
 const coords=model.periods.map((v,i)=>model.order==='numeric'?Number(v):model.order==='date'?Date.parse(v):i),lo=coords[0]||0,span=(coords.at(-1)-lo)||1,x=i=>g.left+(coords[i]-lo)/span*g.width;
 const low=Math.min(0,model.min||0),high=Math.max(0,model.max||0),range=(high-low)||1,y=v=>g.top+g.height-(v-low)/range*g.height;
 const cells=model.frames.map(f=>new Map(f.values.map(v=>[v.name,v])));
 const peaks=model.names.map(name=>({name,peak:Math.max(...cells.map(f=>f.get(name)?.value??-Number.MAX_VALUE))})).sort((a,b)=>b.peak-a.peak||a.name.localeCompare(b.name,'en'));
 const names=peaks.slice(0,model.topN).map(v=>v.name),lines=[];
 for(const name of names){let path='',open=false,endpoint=null;const points=[];
  for(let i=0;i<=index;i++){const v=cells[i].get(name);if(!v){open=false;continue;}const xx=x(i),yy=y(v.value);path+=`${open?'L':'M'}${xx},${yy} `;open=true;points.push({x:xx,y:yy,index:i,value:v.value,assumed:v.assumed});if(i===index)endpoint={x:xx,y:yy,value:v.value,assumed:v.assumed};}
  if(fraction>0){const a=cells[index].get(name),b=cells[index+1]?.get(name);endpoint=null;if(a&&b){const value=a.value*(1-fraction)+b.value*fraction,xx=x(index)*(1-fraction)+x(index+1)*fraction,yy=y(value);path+=`L${xx},${yy} `;endpoint={x:xx,y:yy,value,assumed:a.assumed||b.assumed,transition:true};}}
  lines.push({name,path:path.trim(),points,endpoint});
 }
 // Keep endpoint labels apart; ordering is visual only and never changes values.
 const ends=lines.filter(l=>l.endpoint).sort((a,b)=>a.endpoint.y-b.endpoint.y||a.name.localeCompare(b.name,'en')),gap=Math.min(19,g.height/Math.max(1,ends.length));
 let previous=g.top-gap;for(const l of ends){l.endpoint.labelY=Math.max(l.endpoint.y,previous+gap);previous=l.endpoint.labelY;}
 const overflow=Math.max(0,(ends.at(-1)?.endpoint.labelY||0)-(g.top+g.height));if(overflow)for(const l of ends)l.endpoint.labelY-=overflow;
 for(let i=ends.length-2;i>=0;i--)ends[i].endpoint.labelY=Math.min(ends[i].endpoint.labelY,ends[i+1].endpoint.labelY-gap);
 return {lines,index,fraction,position:p,cursor:x(index)*(1-fraction)+x(Math.min(last,index+1))*fraction,period:fraction?`${model.periods[index]} → ${model.periods[index+1]} · ${Math.round(fraction*100)}%`:model.periods[index],caption:model.frames[index]?.caption||''};
}

export function renderLineRace(rows,s,b,model,format){
 const {left,right,top,bottom,T,G,font}=b,text=(x,y,v,attrs='',size=11)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${T}" font-family="${font}" ${attrs}>${E(v)}</text>`;
 if(b.ph<160)return text(left,top+25,fitText('Increase canvas height to show line race.',b.pw,12));
 if(model.errors.length||!model.frames.length)return text(left,top+25,fitText(model.errors[0]||'Choose period, entity and numeric value columns.',b.pw,12));
 const reserve=Math.min(175,b.pw*.32),g={left:left+28,top:top+62+(model.captionCount?40:0),width:Math.max(40,b.pw-reserve-36),height:Math.max(40,b.ph-98-(model.captionCount?40:0))},state=lineRaceState(model,s.raceIndex,g),low=Math.min(0,model.min||0),high=Math.max(0,model.max),range=(high-low)||1,assets=raceAssetSet(s),appearance=raceAppearance(s),size=Math.min(24,appearance.size),lineW=Math.max(1,Math.min(8,Number(s.lineWidth)||3));
 let out=(raceFlagCredit(s,model.names)?`<metadata>${E(raceFlagCredit(s,model.names))}</metadata>`:'')+`<g data-line-race-scene="" data-left="${g.left}" data-top="${g.top}" data-width="${g.width}" data-height="${g.height}" data-label-width="${Math.max(20,reserve-12)}" data-values="${appearance.values}">`+text(left,top+17,fitText(state.period,b.pw,20),'data-line-period="" font-weight="700"',20)+text(left,top+37,`Top ${model.topN} by peak · ${model.method} · fixed scale · gaps retained`,'',10);
 if(model.captionCount)out+=svgLines(state.caption,left,top+57,b.pw,12,2,`data-line-caption="" data-width="${b.pw}" fill="${T}" font-family="${font}"`);
 for(let i=0;i<=4;i++){const value=low+range*i/4,yy=g.top+g.height-g.height*i/4;if(s.showGrid)out+=`<line x1="${g.left}" x2="${g.left+g.width}" y1="${yy}" y2="${yy}" stroke="${G}" stroke-dasharray="3 5"/>`;out+=text(g.left-7,yy+4,format(value),'text-anchor="end"',9);}
 const labelIndices=[...new Set([0,Math.round((model.frames.length-1)/2),model.frames.length-1])];for(const i of labelIndices){const x=lineRaceState(model,i,g).cursor;if(i!==0&&i!==model.frames.length-1&&(x-g.left<48||g.left+g.width-x<48))continue;out+=text(x,g.top+g.height+22,fitText(model.periods[i],g.width/3,9),`text-anchor="${i===0?'start':i===model.frames.length-1?'end':'middle'}"`,9);}
 out+=`<line data-line-cursor="" x1="${state.cursor}" x2="${state.cursor}" y1="${g.top}" y2="${g.top+g.height}" stroke="${G}" stroke-dasharray="2 3"/>`;
 for(const l of state.lines){const colour=raceCategoryColour(l.name,s),v=l.endpoint,asset=appearance.showImages?assets.assets.get(l.name):null;
  const detail=l.name+'; '+state.period+(v?': '+format(v.value)+(v.transition?' (interpolated)':'')+(v.assumed?' (assumed zero)':''):'; no current observation');
  out+=`<g data-viz-part="point" data-viz-key="${E(encodeURIComponent(l.name))}" data-line-entity="${E(l.name)}" role="img" aria-label="${E(detail)}" tabindex="0"><title>${E(detail)}</title><path data-line-path="" d="${l.path}" fill="none" stroke="${colour}" stroke-width="${lineW}" stroke-linejoin="round"/>`;
  for(let i=0;i<model.frames.length;i++){const point=l.points.find(p=>p.index===i);out+=`<circle data-line-observation="${i}" cx="${point?.x||0}" cy="${point?.y||0}" r="2.5" fill="${colour}"${point?'':' display="none"'}><title>${E(point?model.periods[i]+': '+format(point.value):'No observation')}</title></circle>`;}
  out+=`<g data-line-end="" ${v?'':'display="none"'}><circle data-line-head="" cx="${v?.x||0}" cy="${v?.y||0}" r="4" fill="${colour}"/><path data-line-leader="" d="${v?`M${v.x},${v.y} L${g.left+g.width+7},${v.labelY}`:''}" stroke="${colour}" fill="none" opacity=".35" stroke-dasharray="2 4"/>`;
  if(asset)out+=`<image href="${E(asset.data)}" x="${g.left+g.width+8}" y="${(v?.labelY||0)-size/2}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet" data-line-image="" aria-hidden="true"/>`;
  const labelX=g.left+g.width+10+(asset?size+5:0),labelWidth=Math.max(18,reserve-(asset?size+5:0)-14);out+=text(labelX,(v?.labelY||0)+4,fitText(l.name+(appearance.values&&v?' '+format(v.value):''),labelWidth,11),`data-line-label="" data-cap="${labelWidth}"`)+'</g></g>';
 }
 return out+'</g>';
}

export function updateLineRaceScene(scene,model,position,settings){
 const g={left:Number(scene.dataset.left),top:Number(scene.dataset.top),width:Number(scene.dataset.width),height:Number(scene.dataset.height)},state=lineRaceState(model,position,g),format=v=>raceNumber(v,settings);
 scene.querySelector('[data-line-period]').textContent=fitText(state.period,g.width+Number(scene.dataset.labelWidth),20);
 const caption=scene.querySelector('[data-line-caption]');if(caption){const lines=wrapText(state.caption,Number(caption.dataset.width),12,2);caption.replaceChildren(...lines.map((v,i)=>{const t=scene.ownerDocument.createElementNS('http://www.w3.org/2000/svg','tspan');t.setAttribute('x',caption.getAttribute('x'));t.setAttribute('dy',i?'14.4':'0');t.textContent=v;return t;}));}
 const cursor=scene.querySelector('[data-line-cursor]');cursor.setAttribute('x1',state.cursor);cursor.setAttribute('x2',state.cursor);
 for(const mark of scene.querySelectorAll('[data-line-entity]')){const l=state.lines.find(l=>l.name===mark.dataset.lineEntity);if(!l)continue;const points=new Map(l.points.map(p=>[p.index,p]));mark.querySelector('[data-line-path]').setAttribute('d',l.path);for(const circle of mark.querySelectorAll('[data-line-observation]')){const p=points.get(Number(circle.dataset.lineObservation));if(!p){circle.setAttribute('display','none');continue;}circle.removeAttribute('display');circle.setAttribute('cx',p.x);circle.setAttribute('cy',p.y);circle.querySelector('title').textContent=model.periods[p.index]+': '+format(p.value)+(p.assumed?' (assumed zero)':'');}
  const end=mark.querySelector('[data-line-end]'),v=l.endpoint;end.setAttribute('display',v?'inline':'none');const detail=l.name+'; '+state.period+(v?': '+format(v.value)+(v.transition?' (interpolated)':'')+(v.assumed?' (assumed zero)':''):'; no current observation');mark.setAttribute('aria-label',detail);mark.querySelector('title').textContent=detail;
  if(!v)continue;const head=mark.querySelector('[data-line-head]');head.setAttribute('cx',v.x);head.setAttribute('cy',v.y);mark.querySelector('[data-line-leader]').setAttribute('d',`M${v.x},${v.y} L${g.left+g.width+7},${v.labelY}`);const label=mark.querySelector('[data-line-label]');label.setAttribute('y',v.labelY+4);label.textContent=fitText(l.name+(scene.dataset.values==='true'?' '+format(v.value):''),Number(label.dataset.cap),11);const image=mark.querySelector('[data-line-image]');if(image)image.setAttribute('y',v.labelY-Number(image.getAttribute('height'))/2);
 }
}
