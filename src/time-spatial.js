import {geoCanonicalValue,geoData,geoTimeDomain} from './geo.js';

export const POINT_TIME_TYPES=new Set(['scatter','bubble','geo-symbol']);
export const SPATIAL_TIME_TYPES=new Set([...POINT_TIME_TYPES,'geo-choropleth','geo-route']);
export const timePresent=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
const numeric=v=>timePresent(v)&&Number.isFinite(Number(v));
export function timeIdentityField(c){return c.timeEntityField||(c.type==='geo-symbol'?c.x:'');}
export function timeEntityKey(row,c){
 const field=timeIdentityField(c),value=row[field];if(!field||!timePresent(value))return null;
 // Country-centroid mode has canonical country identity; coordinate observations
 // keep the explicitly supplied identifier, even when it resembles a country.
 if(c.type==='geo-symbol'&&field===c.x&&!(c.geoLatField&&c.geoLonField)&&c.geoLocationMode!=='coordinates')return geoCanonicalValue(value)||String(value);
 return String(value);
}
export function stableTimeColour(key,c){
 const custom=c.pointColors?.[String(key)];if(/^#[\da-f]{6}$/i.test(custom||''))return custom;
 const base=/^#[\da-f]{6}$/i.test(c.color||'')?c.color:'#0d9488',palette=[base,'#e7a15a','#557da5','#a16a9b','#649a80','#aa7659','#777fca','#3c9fbc'];
 const hash=Array.from(String(key)).reduce((n,ch)=>(n*31+ch.codePointAt(0))>>>0,0);return palette[hash%palette.length];
}
export function timePointData(rows,c){
 return rows.flatMap(row=>{const id=timeEntityKey(row,c);if(id===null||!numeric(row[c.x])||!numeric(row[c.y]))return [];
  const size=c.type==='bubble'?row[c.bubbleSizeField]:null;if(c.type==='bubble'&&(!numeric(size)||Number(size)<0))return [];
  return [{x:Number(row[c.x]),y:Number(row[c.y]),...(c.type==='bubble'?{size:Number(size)}:{}),id,name:String(row[timeIdentityField(c)]),n:1}];});
}
function domain(values){let lo=Number.MAX_VALUE,hi=-Number.MAX_VALUE;for(const v of values){lo=Math.min(lo,v);hi=Math.max(hi,v);}if(lo===Number.MAX_VALUE&&hi===-Number.MAX_VALUE)return null;
 if(lo===hi){const pad=Math.max(1,Math.abs(lo)*.05),a=lo-pad,b=hi+pad;lo=Number.isFinite(a)?a:lo;hi=Number.isFinite(b)?b:hi;}
 return {lo,hi};
}
export function timeSpatialSettings(model,c){
 if(c.type.startsWith('geo-')){const result=geoTimeDomain(model.frames,c);return {domain:{kind:c.type,entityField:timeIdentityField(c),...result},error:result.error||''};}
 const points=model.frames.flatMap(f=>timePointData(f.rows,c)),x=domain(points.map(p=>p.x)),y=domain(points.map(p=>p.y));let sizeMax=0;for(const p of points)sizeMax=Math.max(sizeMax,p.size||0);
 const error=!points.length?'No compatible point observations across the timeline.':!x||!y||!Number.isFinite(x.hi-x.lo)||!Number.isFinite(y.hi-y.lo)?'The time axis range exceeds the numerical range. Rescale the units.':'';
 return {domain:{kind:c.type,entityField:timeIdentityField(c),x,y,sizeMax:Math.max(1,sizeMax),valid:points.length},error};
}
