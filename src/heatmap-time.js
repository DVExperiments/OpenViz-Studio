// Exact categorical cells, aggregated independently in each observed period.
const present=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
const numeric=v=>(typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v));
export function heatmapTimeMatrix(rows,c){
 const buckets=new Map(),categories=[],series=[];let missingDimensions=0,invalidValues=0;
 for(const row of rows){if(!present(row[c.x])||!present(row[c.seriesField])){missingDimensions++;continue;}if(c.aggregation!=='count'&&!numeric(row[c.y])){invalidValues++;continue;}const x=String(row[c.x]),group=String(row[c.seriesField]),key=JSON.stringify([x,group]);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(c.aggregation==='count'?1:Number(row[c.y]));if(!categories.includes(x))categories.push(x);if(!series.includes(group))series.push(group);}
 const groups=new Map(),cells=[];let error='';for(const [key,values] of buckets){let value;switch(c.aggregation){case 'count':value=values.length;break;case 'average':value=values.reduce((sum,v)=>sum+v/values.length,0);break;case 'min':value=values.reduce((a,v)=>Math.min(a,v),Infinity);break;case 'max':value=values.reduce((a,v)=>Math.max(a,v),-Infinity);break;default:value=values.reduce((a,v)=>a+v,0);}
 if(!Number.isFinite(value)){error='Aggregated heatmap values exceed the numerical range. Rescale the units.';break;}groups.set(key,value);const [x,series]=JSON.parse(key);cells.push({x,series,y:value,id:key,count:values.length});}
 return {categories,series,groups,cells,missingDimensions,invalidValues,error};
}
export function heatmapTimeDomain(frames,c){
 const categories=[],series=[];let min=0,max=1,valid=0;for(const f of frames){const m=heatmapTimeMatrix(f.rows,c);if(m.error)return {error:m.error};for(const x of m.categories)if(!categories.includes(x))categories.push(x);for(const g of m.series)if(!series.includes(g))series.push(g);for(const value of m.groups.values()){min=Math.min(min,value);max=Math.max(max,value);valid++;}}
 if(categories.length>32||series.length>16)return {error:'Heatmap time views support at most 32 columns and 16 rows across the timeline. Filter the source first.'};
 if(!valid)return {error:'No compatible cells across the heatmap timeline.'};if(!Number.isFinite(max-min))return {error:'Heatmap colour range exceeds the numerical range. Rescale the units.'};
 return {domain:{kind:'heatmap',categories,series,min,max},error:''};
}
