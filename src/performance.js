// V3.3 viewport-level aggregation. No source row is edited or deleted.
export function scatterSample(points,limit=400){
 if(points.length<=limit)return points;
 if(limit<8)throw new RangeError('Scatter sampling needs a limit of at least 8');
 let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
 const extremes=[null,null,null,null];
 for(const p of points){const x=Number(p.x),y=Number(p.y);if(!Number.isFinite(x)||!Number.isFinite(y))continue;
  if(x<x0){x0=x;extremes[0]=p;}if(x>x1){x1=x;extremes[1]=p;}
  if(y<y0){y0=y;extremes[2]=p;}if(y>y1){y1=y;extremes[3]=p;}
 }
 const cells=Math.max(2,Math.floor(Math.sqrt(limit-4)));
 const buckets=new Map();
 for(let i=0;i<points.length;i++){
  const p=points[i],x=Number(p.x),y=Number(p.y);if(!Number.isFinite(x)||!Number.isFinite(y))continue;
  const gx=Math.min(cells-1,Math.floor((x-x0)/(x1-x0||1)*cells));
  const gy=Math.min(cells-1,Math.floor((y-y0)/(y1-y0||1)*cells));
  const key=gx+gy*cells;
  // Stable pseudo-random priority, independent of row sorting patterns in each cell.
  const seed=((i+1)*2654435761)>>>0;const score=Math.imul(seed^(seed>>>13),1597334677)>>>0;
  const previous=buckets.get(key);if(!previous||score<previous.score)buckets.set(key,{point:p,score});
 }
 const picked=new Set(extremes.filter(Boolean));
 for(const item of [...buckets.values()].sort((a,b)=>a.score-b.score)){if(picked.size>=limit)break;picked.add(item.point);}
 // A nearly linear dataset touches few grid cells; fill unused visual capacity
 // with uniformly spaced source observations, without sacrificing extremes.
 for(let j=0;j<limit*3&&picked.size<limit;j++){
  const index=Math.min(points.length-1,Math.floor((j+.5)*points.length/(limit*3)));
  picked.add(points[index]);
 }
 return [...picked].slice(0,limit);
}
export function aggregateEdges(rows,sourceField,targetField,valueField,kind,maxNodes,maxEdges){
 const all=new Map(),weightByNode=new Map();let eligible=0,totalWeight=0;
 for(const row of rows){const a=String(row[sourceField]??'').trim(),b=String(row[targetField]??'').trim();if(!a||!b)continue;
  const given=row[valueField];const weight=kind==='network'?(given==null||given===''?1:Number(given)):Number(given);
  if(!Number.isFinite(weight)||weight<=0)continue;
  eligible++;totalWeight+=weight;
  const key=JSON.stringify([a,b]);all.set(key,(all.get(key)||0)+weight);
  weightByNode.set(a,(weightByNode.get(a)||0)+weight);weightByNode.set(b,(weightByNode.get(b)||0)+weight);
 }
 const nodes=[...weightByNode].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
 const selectedNodes=new Set(nodes.slice(0,maxNodes).map(p=>p[0]));
 const edges=[...all].map(([k,w])=>{const [source,target]=JSON.parse(k);return {source,target,w};})
  .filter(e=>selectedNodes.has(e.source)&&selectedNodes.has(e.target))
  .sort((a,b)=>b.w-a.w||a.source.localeCompare(b.source)||a.target.localeCompare(b.target))
  .slice(0,maxEdges);
 const shownWeight=edges.reduce((sum,e)=>sum+e.w,0);
 return {edges,nodes:[...selectedNodes],allNodes:nodes.length,allEdges:all.size,eligible,totalWeight,shownWeight,
  reduced:nodes.length>maxNodes||all.size>edges.length};
}
