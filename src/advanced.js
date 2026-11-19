// V3.3 advanced visualisations. Full edge-list aggregation with bounded visual detail; no AI or network.
import {aggregateEdges} from './performance.js';
// Structured data remains unmodified. SVG content is escaped before interpolation.
export const ADVANCED_TYPES = new Set(['sankey','network','sunburst','timeline','parallel','gantt']);
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hex = (v,d='#0d9488')=>/^#[0-9a-f]{6}$/i.test(String(v))?v:d;
const finite = v=>v!==null&&v!==undefined&&String(v).trim()!==''&&Number.isFinite(Number(v));
const dateVal = v => {if(v instanceof Date)return v.getTime();const n=typeof v==='number'?v:NaN;return Number.isFinite(n)&&n>10000&&n<80000?(n-25569)*86400000:Date.parse(String(v??''));};
const vals=(rows,key)=>rows.map(r=>r[key]);
const fmt=(v)=>Number(v).toLocaleString('en-US',{maximumFractionDigits:2});
const BASE_PALETTE=['#209589','#e6aa67','#7199c6','#ae8bc4','#65b7aa','#d4818d','#8dadd2','#bbb374'];
// V3.55: an organisation theme palette (chart.palette) replaces the default for this render only.
let palette=BASE_PALETTE;
const text=(x,y,value,size=12,colour='#1c2c3e',attrs='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${colour}" font-family="Arial, sans-serif" ${attrs}>${esc(value)}</text>`;
const mark=(key)=>`data-viz-part="point" data-viz-key="${esc(encodeURIComponent(String(key)))}"`;
const mapRange=(v,a,b,c,d)=>c+(v-a)/(b-a||1)*(d-c);
const dString=t=>new Date(t).toISOString().slice(0,10);
const num=(v,f)=>Number.isFinite(Number(v))?Number(v):f;
const baseGroup=(x,field,rows)=>[...new Set(rows.map(r=>String(r[field]??'Unlabelled')))];
const isPresent=v=>v!==null&&v!==undefined&&String(v).trim()!=='';

export function advancedData(rows,s,type){
 if(type==='sankey'||type==='network')return rows.filter(r=>isPresent(r[s.x])&&isPresent(r[s.seriesField])&&(type==='network'||(finite(r[s.y])&&Number(r[s.y])>0))).map((r,i)=>({x:String(r[s.x]),y:type==='sankey'?Number(r[s.y]):finite(r[s.y])?Number(r[s.y]):1,row:r,index:i}));
 if(type==='sunburst')return rows.filter(r=>isPresent(r[s.x])&&finite(r[s.y])&&Number(r[s.y])>0).map((r,i)=>({x:String(r[s.x]),y:Number(r[s.y]),row:r,index:i}));
 if(type==='timeline')return rows.filter(r=>isPresent(r[s.x])&&Number.isFinite(dateVal(r[s.x]))).map((r,i)=>({x:String(r[s.x]),y:1,row:r,index:i}));
 if(type==='gantt')return rows.filter(r=>isPresent(r[s.x])&&Number.isFinite(dateVal(r[s.y]))&&Number.isFinite(dateVal(r[s.endField]))&&dateVal(r[s.endField])>=dateVal(r[s.y])).map((r,i)=>({x:String(r[s.x]),y:1,row:r,index:i}));
 if(type==='parallel'){const dims=(s.parallelFields||[]).filter(f=>rows.some(r=>finite(r[f])));return rows.filter(r=>dims.every(f=>finite(r[f]))).map((r,i)=>({x:String(r[s.x]??i),y:Number(r[dims[0]]||0),row:r,index:i}));}
 return [];
}
export function advancedWarnings(rows,s,type){
 const warnings=[],cols=rows.length?Object.keys(rows[0]):[];const has=k=>!!k&&cols.includes(k);
 if(!has(s.x))warnings.push(`${type==='gantt'?'Task':type==='timeline'?'Date':'Source/category'} field is missing.`);
 if(['sankey','network','sunburst'].includes(type)&&(!has(s.seriesField)||s.seriesField===s.x))warnings.push(`${type} requires a second, distinct field (Target / Subcategory).`);
 if(['sankey','sunburst'].includes(type)&&!has(s.y))warnings.push(`${type} requires a positive numeric Value field.`);
 if(type==='gantt'&&(!has(s.y)||!has(s.endField)||s.endField===s.y))warnings.push('Gantt requires distinct Start and End date fields.');
 if(type==='timeline'&&!has(s.labelField))warnings.push('Timeline needs an Event title field.');
 if(type==='parallel'&&(!Array.isArray(s.parallelFields)||s.parallelFields.filter(has).length<2))warnings.push('Parallel coordinates require two or more selected numeric dimensions.');
 const isGraph=type==='sankey'||type==='network';const edgeInfo=isGraph?aggregateEdges(rows,s.x,s.seriesField,s.y,type,type==='sankey'?52:64,type==='sankey'?180:220):null;const valid=isGraph?[]:advancedData(rows,s,type);
 if(!(isGraph?edgeInfo.eligible:valid.length))warnings.push('No compatible observations for the required fields.');
 if(type==='network'&&rows.some(r=>finite(r[s.y])&&Number(r[s.y])<=0))warnings.push('Network excludes zero or negative link weights; use a separate sign field or another visualisation for signed relationships.');
 if(type==='sankey'&&rows.some(r=>isPresent(r[s.x])&&isPresent(r[s.seriesField])&&(!finite(r[s.y])||Number(r[s.y])<=0)))warnings.push('Sankey excludes zero, negative and nonnumeric flow values.');
 if(type==='sunburst'&&rows.some(r=>finite(r[s.y])&&Number(r[s.y])<=0))warnings.push('Sunburst excludes zero and negative sizes.');
 if(type==='gantt'&&valid.length<rows.length)warnings.push('Gantt omits records with invalid dates or an end date before the start.');
 if(type==='timeline'&&valid.length<rows.length)warnings.push('Timeline omits records without a parseable date.');
 if(isGraph){
  if(edgeInfo.reduced){const fraction=edgeInfo.totalWeight?100*edgeInfo.shownWeight/edgeInfo.totalWeight:0;
   warnings.push(`Showing ${edgeInfo.edges.length.toLocaleString()} of ${edgeInfo.allEdges.toLocaleString()} unique connections across ${edgeInfo.allNodes.toLocaleString()} nodes; displayed links account for ${fraction.toFixed(1)}% of the total positive weight. Full input was aggregated; filter before publication for omitted relationships.`);
  }
  if(type==='sankey'){
   const edgeKeys=new Set(edgeInfo.edges.map(e=>JSON.stringify([e.source,e.target])));
   if(edgeInfo.edges.some(e=>edgeKeys.has(JSON.stringify([e.target,e.source]))))warnings.push('Reciprocal flows are present. Some links may curve backward or overlap; review before publication.');
  }
 }
 const limits={sunburst:250,timeline:80,parallel:240,gantt:80};
 if(limits[type]&&valid.length>limits[type])warnings.push(`This view displays only the first ${limits[type]} compatible records; filter before publishing.`);
 if(type==='timeline'&&num(s.timelineZoom,1)>1)warnings.push('Timeline zoom hides dates outside the visible time window; reset zoom to show every event.');
 if(type==='parallel'&&rows.length>240)warnings.push('Parallel coordinates samples the first 240 complete records; filter to inspect omitted observations.');
 return warnings;
}

function edgeRows(rows,s,type){const out=new Map();for(const r of rows){const src=String(r[s.x]??'').trim(),dst=String(r[s.seriesField]??'').trim();if(!src||!dst)continue;const w=type==='network'?(finite(r[s.y])?Number(r[s.y]):1):Number(r[s.y]);if(!Number.isFinite(w)||w<=0)continue;const key=JSON.stringify([src,dst]);out.set(key,(out.get(key)||0)+w);}return [...out].map(([k,w])=>{const [source,target]=JSON.parse(k);return {source,target,w};});}
function circlePath(cx,cy,r0,r1,a0,a1){const polar=(r,a)=>[cx+r*Math.cos(a),cy+r*Math.sin(a)];const outer1=polar(r1,a0),outer2=polar(r1,a1),inner2=polar(r0,a1),inner1=polar(r0,a0);return `M ${outer1.join(' ')} A ${r1} ${r1} 0 ${a1-a0>Math.PI?1:0} 1 ${outer2.join(' ')} L ${inner2.join(' ')} A ${r0} ${r0} 0 ${a1-a0>Math.PI?1:0} 0 ${inner1.join(' ')} Z`;}

function sankey(rows,s,b){
 const {left,right,top,bottom,pw,ph,C,T}=b,selection=aggregateEdges(rows,s.x,s.seriesField,s.y,'sankey',52,180),edges=selection.edges;
 if(!edges.length)return '';
 const names=[...new Set(edges.flatMap(e=>[e.source,e.target]))],nodes=new Map(names.map(name=>[name,{name,in:0,out:0,layer:0}]));
 const valid=edges.filter(e=>nodes.has(e.source)&&nodes.has(e.target));for(const e of valid){nodes.get(e.source).out+=e.w;nodes.get(e.target).in+=e.w;}
 // Longest-path rank for DAGs; bounded relaxation supplies a stable layout for cyclic data.
 for(let k=0;k<Math.min(names.length,16);k++){let changed=false;for(const e of valid){const a=nodes.get(e.source),z=nodes.get(e.target);if(a.layer<15&&a.layer+1>z.layer){z.layer=a.layer+1;changed=true;}}if(!changed)break;}
 const maxLayer=Math.max(1,...[...nodes.values()].map(x=>x.layer));const stacks=Array.from({length:maxLayer+1},()=>[]);for(const node of nodes.values())stacks[node.layer].push(node);
 // Shared global flow-to-pixel scale; link thickness is proportional to magnitude.
 const gap=Math.max(6,Math.min(17,num(s.nodeGap,12)));const unit=Math.max(.01,Math.min(8,...stacks.filter(a=>a.length).map(a=>(ph-gap*Math.max(0,a.length-1)-a.length*5)/Math.max(1,a.reduce((sum,n)=>sum+Math.max(n.in,n.out),0)))));
 const nw=Math.max(9,Math.min(48,num(s.nodeWidth,17)));const override=s.nodePositions||{};
 for(const stack of stacks){let y=top;for(const node of stack){node.h=Math.max(5,Math.max(node.in,node.out)*unit+5);node.x=left+node.layer/maxLayer*(pw-nw);node.y=y;const pos=override[node.name];if(pos){node.x=Math.max(left,Math.min(right-nw,left+num(pos.x,0)*pw));node.y=Math.max(top,Math.min(bottom-node.h,top+num(pos.y,0)*ph));}y+=node.h+gap;}}
 const offsIn=new Map(),offsOut=new Map(),alpha=Math.max(.1,Math.min(.95,num(s.linkOpacity,.5)));let svg='';
 for(const [i,e] of valid.entries()){const a=nodes.get(e.source),z=nodes.get(e.target),width=Math.max(.15,e.w*unit),oa=offsOut.get(a.name)||0,oz=offsIn.get(z.name)||0,sy=a.y+2.5+oa+width/2,ey=z.y+2.5+oz+width/2;
  offsOut.set(a.name,oa+width);offsIn.set(z.name,oz+width);const x1=a.x+nw,x2=z.x,mx=(x1+x2)/2;const cl=hex(s.pointColors?.[e.source+' → '+e.target]||s.pointColors?.[e.source]||palette[names.indexOf(e.source)%palette.length],C);
  svg+=`<path d="M ${x1} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${x2} ${ey}" fill="none" stroke="${cl}" stroke-opacity="${alpha}" stroke-width="${width}" ${mark(e.source+' → '+e.target)}><title>${esc(e.source)} → ${esc(e.target)}: ${fmt(e.w)}</title></path>`;}
 for(const node of nodes.values()){const cl=hex(s.pointColors?.[node.name]||palette[names.indexOf(node.name)%palette.length],C);svg+=`<g ${mark(node.name)}><rect x="${node.x}" y="${node.y}" width="${nw}" height="${node.h}" rx="2" fill="${cl}" data-viz-drag="node" data-viz-node="${esc(node.name)}" data-node-x="${(node.x-left)/pw}" data-node-y="${(node.y-top)/ph}" stroke="${T}" stroke-opacity=".2"/><title>${esc(node.name)} · Incoming ${fmt(node.in)}, outgoing ${fmt(node.out)}</title></g>`;svg+=text(node.x+nw+5,node.y+Math.min(node.h/2+4,18),node.name.slice(0,18),11,T);}
 return svg;
}

function network(rows,s,b){const {left,top,pw,ph,C,T}=b,selection=aggregateEdges(rows,s.x,s.seriesField,s.y,'network',64,220),edges=selection.edges,names=[...new Set(edges.flatMap(e=>[e.source,e.target]))];if(!names.length)return '';
 const nodes=new Map(names.map((name,i)=>[name,{name,index:i,x:Math.cos(i*2*Math.PI/names.length)*.39+.5,y:Math.sin(i*2*Math.PI/names.length)*.39+.5,degree:0}]));const valid=edges.filter(e=>nodes.has(e.source)&&nodes.has(e.target));for(const e of valid){nodes.get(e.source).degree+=e.w;nodes.get(e.target).degree+=e.w;}
 if(s.networkLayout!=='circular'&&names.length<=60){for(let tick=0;tick<85;tick++){const forces=new Map(names.map(n=>[n,{x:0,y:0}]));for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){const a=nodes.get(names[i]),z=nodes.get(names[j]),dx=a.x-z.x,dy=a.y-z.y,dist2=Math.max(.001,dx*dx+dy*dy),push=.0002/dist2;forces.get(a.name).x+=dx*push;forces.get(a.name).y+=dy*push;forces.get(z.name).x-=dx*push;forces.get(z.name).y-=dy*push;}
 for(const e of valid){const a=nodes.get(e.source),z=nodes.get(e.target),dx=z.x-a.x,dy=z.y-a.y,force=.005*(Math.hypot(dx,dy)-.24);forces.get(a.name).x+=dx*force;forces.get(a.name).y+=dy*force;forces.get(z.name).x-=dx*force;forces.get(z.name).y-=dy*force;}
 for(const node of nodes.values()){const f=forces.get(node.name);node.x=Math.max(.04,Math.min(.96,node.x+f.x+(.5-node.x)*.009));node.y=Math.max(.05,Math.min(.95,node.y+f.y+(.5-node.y)*.009));}}}
 for(const node of nodes.values()){const pos=s.nodePositions?.[node.name];if(pos){node.x=Math.max(.02,Math.min(.98,num(pos.x,node.x)));node.y=Math.max(.02,Math.min(.98,num(pos.y,node.y)));}}
 const px=n=>left+n.x*pw,py=n=>top+n.y*ph,maxDegree=Math.max(1,...[...nodes.values()].map(n=>n.degree));let svg='';for(const e of valid){const a=nodes.get(e.source),z=nodes.get(e.target),w=Math.max(.8,Math.min(7,e.w*2/Math.sqrt(maxDegree)));svg+=`<line x1="${px(a)}" y1="${py(a)}" x2="${px(z)}" y2="${py(z)}" stroke="${hex(s.pointColors?.[e.source+' → '+e.target]||s.secondary,'#b7a0c9')}" stroke-opacity="${Math.max(.1,Math.min(.95,num(s.linkOpacity,.48)))}" stroke-width="${w}" ${mark(e.source+' → '+e.target)}><title>${esc(e.source)} — ${esc(e.target)}: ${fmt(e.w)}</title></line>`;}
 for(const node of nodes.values()){const r=Math.max(7,Math.min(24,num(s.networkNodeRadius,12)*(0.55+Math.sqrt(node.degree/maxDegree)))),fill=hex(s.pointColors?.[node.name]||palette[node.index%palette.length],C);svg+=`<circle cx="${px(node)}" cy="${py(node)}" r="${r}" fill="${fill}" stroke="#fff" stroke-width="2" ${mark(node.name)} data-graph-node="${esc(node.name)}" data-viz-drag="node" data-viz-node="${esc(node.name)}" data-node-x="${node.x}" data-node-y="${node.y}"><title>${esc(node.name)} · weighted degree ${fmt(node.degree)}</title></circle>`;svg+=text(px(node)+r+3,py(node)+3,node.name.slice(0,19),Math.max(9,Math.min(13,num(s.labelSize,12))),T);}
 return svg;}

function sunburst(rows,s,b){const {left,top,pw,ph,C,T}=b,groups=new Map();for(const r of rows.slice(0,250)){const group=String(r[s.x]??'').trim(),sub=String(r[s.seriesField]??'Other').trim()||'Other',weight=Number(r[s.y]);if(!group||!Number.isFinite(weight)||weight<=0)continue;if(!groups.has(group))groups.set(group,new Map());groups.get(group).set(sub,(groups.get(group).get(sub)||0)+weight);}
 const total=[...groups.values()].reduce((sum,v)=>sum+[...v.values()].reduce((a,c)=>a+c,0),0);if(!total)return '';
 const cx=left+pw/2,cy=top+ph/2,radius=Math.min(pw,ph)*.46,inner=radius*.18,mid=radius*.59;let angle=-Math.PI/2,svg='';for(const [i,[g,children]] of [...groups].entries()){const groupTotal=[...children.values()].reduce((a,c)=>a+c,0),end=angle+groupTotal/total*2*Math.PI,cl=hex(s.pointColors?.[g]||palette[i%palette.length],C);const a1=Math.min(end,angle+2*Math.PI-.00001);svg+=`<path d="${circlePath(cx,cy,inner,mid,angle,a1)}" fill="${cl}" stroke="#fff" stroke-width="2" ${mark(g)} data-viz-hierarchy-level="0"><title>${esc(g)}: ${fmt(groupTotal)} (${(groupTotal/total*100).toFixed(1)}%)</title></path>`;let subAngle=angle;for(const [j,[sub,w]] of [...children].entries()){const nxt=subAngle+(w/groupTotal)*(end-angle);const color=hex(s.pointColors?.[g+' / '+sub]||palette[(i+j+1)%palette.length],C);svg+=`<path d="${circlePath(cx,cy,mid+2,radius,subAngle,Math.min(nxt,subAngle+2*Math.PI-.00001))}" fill="${color}" stroke="#fff" stroke-width="1.5" ${mark(g+' / '+sub)} data-viz-hierarchy-level="1"><title>${esc(g)} / ${esc(sub)}: ${fmt(w)}</title></path>`;subAngle=nxt;}
 if(end-angle>.32){const midAngle=(angle+end)/2,x=cx+Math.cos(midAngle)*radius*.38,y=cy+Math.sin(midAngle)*radius*.38;svg+=text(x,y,g.slice(0,12),11,'#fff','text-anchor="middle" font-weight="700" pointer-events="none"');}angle=end;}
 svg+=text(cx,cy+3,'TOTAL',12,T,'text-anchor="middle" font-weight="700"')+text(cx,cy+22,fmt(total),14,T,'text-anchor="middle"');return svg;}

function timeline(rows,s,b){const {left,right,top,bottom,pw,ph,C,T}=b,points=rows.slice(0,80).map((r,i)=>({date:dateVal(r[s.x]),name:String(r[s.labelField]??'Event'),lane:s.seriesField?String(r[s.seriesField]??'Other'):'Events',index:i})).filter(p=>Number.isFinite(p.date)).sort((a,z)=>a.date-z.date);if(!points.length)return '';
 const min=points[0].date,max=points.at(-1).date,mid=(min+max)/2,zoom=Math.max(1,Math.min(5,num(s.timelineZoom,1))),lo=mid-(max-min||86400000)/2/zoom,hi=mid+(max-min||86400000)/2/zoom,lanes=[...new Set(points.map(p=>p.lane))].slice(0,8),laneH=ph/Math.max(1,lanes.length);let svg='';
 for(const [j,lane] of lanes.entries()){const y=top+laneH*(j+.5);svg+=`<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="${b.G}" stroke-width="1.5"/>`;svg+=text(left,y-14,lane.slice(0,22),11,T);}
 for(let i=0;i<6;i++){const at=lo+i*(hi-lo)/5,x=left+i*pw/5;svg+=`<line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" stroke="${b.G}" stroke-dasharray="3 5"/>`+text(x,bottom+22,dString(at),11,T,'text-anchor="middle"');}
 for(const p of points){if(p.date<lo||p.date>hi||!lanes.includes(p.lane))continue;const x=mapRange(p.date,lo,hi,left,right),y=top+laneH*(lanes.indexOf(p.lane)+.5),above=p.index%2===0,dy=above?-31:32,col=hex(s.pointColors?.[p.name]||palette[lanes.indexOf(p.lane)%palette.length],C);svg+=`<g ${mark(p.name)}><line x1="${x}" y1="${y}" x2="${x}" y2="${y+dy*.67}" stroke="${col}" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="6" stroke="#fff" stroke-width="1.4" fill="${col}"/><title>${esc(dString(p.date))}: ${esc(p.name)} (${esc(p.lane)})</title></g>`+text(x+5,y+dy,p.name.slice(0,23),10,T);}
 return svg;}

function gantt(rows,s,b){const {left,right,top,bottom,pw,ph,C,T,G}=b,items=rows.slice(0,80).map((r,i)=>({task:String(r[s.x]??''),start:dateVal(r[s.y]),end:dateVal(r[s.endField]),group:s.seriesField?String(r[s.seriesField]??''):''})).filter(r=>r.task&&Number.isFinite(r.start)&&Number.isFinite(r.end)&&r.end>=r.start).sort((a,z)=>a.start-z.start);if(!items.length)return '';
 const min=Math.min(...items.map(i=>i.start)),max=Math.max(...items.map(i=>i.end)),duration=Math.max(86400000,max-min),padding=duration*.04,lo=min-padding,hi=max+padding,step=ph/items.length,barH=Math.max(3,Math.min(23,step*.64));let svg='';
 for(let i=0;i<6;i++){const x=left+i*pw/5;svg+=`<line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" stroke="${G}" stroke-dasharray="3 5"/>`+text(x,bottom+22,dString(lo+(hi-lo)*i/5),10,T,'text-anchor="middle"');}
 const groups=[...new Set(items.map(i=>i.group))];for(const [j,p] of items.entries()){const y=top+j*step+step*.5,x1=mapRange(p.start,lo,hi,left,right),x2=mapRange(p.end,lo,hi,left,right),fill=hex(s.pointColors?.[p.task]||palette[groups.indexOf(p.group)%palette.length],C);
  if(j%2===0)svg+=`<rect x="${left}" y="${top+j*step}" width="${pw}" height="${step}" fill="${G}" fill-opacity=".22"/>`;
  svg+=`<rect x="${x1}" y="${y-barH/2}" width="${Math.max(3,x2-x1)}" height="${barH}" rx="3" fill="${fill}" data-viz-grow-axis="x" data-viz-grow-origin="left" ${mark(p.task)}><title>${esc(p.task)}: ${dString(p.start)} → ${dString(p.end)}${p.group?' · '+esc(p.group):''}</title></rect>`+text(left-9,y+4,p.task.slice(0,22),11,T,'text-anchor="end"');}
 return svg;}

function parallel(rows,s,b){const {left,right,top,bottom,pw,ph,C,T,G}=b,dims=(s.parallelFields||[]).filter(f=>rows.some(r=>finite(r[f]))).slice(0,8);if(dims.length<2)return '';const full=rows.filter(r=>dims.every(f=>finite(r[f]))).slice(0,240);if(!full.length)return '';const stats=dims.map(f=>{const v=full.map(r=>Number(r[f]));return {min:Math.min(...v),max:Math.max(...v)};}),gap=pw/(dims.length-1),groups=[...new Set(full.map(r=>String(r[s.seriesField]??'All')))];let svg='';
 for(const [i,r] of full.entries()){const c=hex(s.pointColors?.[String(r[s.x]??i)]||palette[groups.indexOf(String(r[s.seriesField]??'All'))%palette.length],C),points=dims.map((f,j)=>`${left+j*gap},${stats[j].min===stats[j].max?top+ph*.5:mapRange(Number(r[f]),stats[j].min,stats[j].max,bottom,top)}`).join(' ');svg+=`<polyline points="${points}" fill="none" stroke="${c}" stroke-width="${Math.max(.6,Math.min(3,num(s.lineWidth,2)))}" stroke-opacity="${Math.max(.08,Math.min(.85,num(s.linkOpacity,.30)))}" ${mark(String(r[s.x]??i))}><title>${esc(String(r[s.x]??'Observation '+(i+1)))}: ${dims.map(f=>esc(f)+': '+fmt(r[f])).join(' · ')}</title></polyline>`;}
 dims.forEach((f,j)=>{const x=left+j*gap;svg+=`<line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" stroke="${T}" stroke-width="1.5"/>`+text(x,top-9,f.slice(0,16),12,T,'text-anchor="middle" font-weight="600"')+text(x,bottom+17,fmt(stats[j].min),10,T,'text-anchor="middle"')+text(x,top+14,fmt(stats[j].max),10,T,'text-anchor="middle"');});return svg;}

export function renderAdvanced(type,rows,s,b){const custom=Array.isArray(s.palette)?s.palette.filter(v=>/^#[0-9a-f]{6}$/i.test(v)):[];palette=custom.length>=2?custom:BASE_PALETTE;switch(type){case 'sankey':return sankey(rows,s,b);case 'network':return network(rows,s,b);case 'sunburst':return sunburst(rows,s,b);case 'timeline':return timeline(rows,s,b);case 'gantt':return gantt(rows,s,b);case 'parallel':return parallel(rows,s,b);default:return '';}}
