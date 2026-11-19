import {escapeText as E,fitText,textWidth} from './chart-quality.js';
const record=v=>v&&typeof v==='object'&&!Array.isArray(v),number=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export const MAP_AUTHOR_KEYS=['geoLabelPositions','geoSymbolAnchors','geoAnnotations'];
export function validateMapAuthoring(c){
 const labels=c.geoLabelPositions??{},anchors=c.geoSymbolAnchors??{},notes=c.geoAnnotations??[];
 for(const [name,value,limit] of [['label positions',labels,80],['symbol anchors',anchors,2000]])if(!record(value)||Object.keys(value).length>limit)throw Error('Map '+name+' exceed supported limits.');
 for(const [id,p] of Object.entries(labels)){if(id.length>1000||!record(p)||!number(p.x,0,1)||!number(p.y,0,1)||(p.hidden!==undefined&&typeof p.hidden!=='boolean'))throw Error('Invalid manual map label position.');}
 for(const [id,p] of Object.entries(anchors)){if(id.length>1000||!record(p)||!number(p.lon,-180,180)||!number(p.lat,-90,90))throw Error('Invalid manual region symbol anchor.');}
 if(!Array.isArray(notes)||notes.length>20)throw Error('Maps support at most 20 annotations.');
 for(const n of notes)if(!record(n)||typeof n.text!=='string'||!n.text.trim()||n.text.length>240||/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(n.text)||!number(n.lon,-180,180)||!number(n.lat,-90,90)||!number(n.x,0,1)||!number(n.y,0,1))throw Error('Invalid map annotation. Use text, WGS84 coordinates and a label position within the plot.');
 return {geoLabelPositions:Object.fromEntries(Object.entries(labels).map(([k,p])=>[k,{x:p.x,y:p.y,hidden:!!p.hidden}])),geoSymbolAnchors:Object.fromEntries(Object.entries(anchors).map(([k,p])=>[k,{lon:p.lon,lat:p.lat}])),geoAnnotations:notes.map(n=>({text:n.text,lon:n.lon,lat:n.lat,x:n.x,y:n.y}))};
}
export function manualRegionAnchor(c,id,fallback,bounds,start){const p=Object.hasOwn(c.geoSymbolAnchors||{},id)?c.geoSymbolAnchors[id]:null;if(!p||!number(p.lon,-180,180)||!number(p.lat,-90,90))return fallback;const west=bounds[0],lon=((p.lon+360-start)%360+360)%360+west;return lon>=west&&lon<=bounds[2]&&p.lat>=bounds[1]&&p.lat<=bounds[3]?[p.lon,p.lat]:fallback;}
export function renderMapAnnotations(c,b,project){
 if(b.pw<20||b.ph<25)return '';let settings;try{settings=validateMapAuthoring(c);}catch{return '';}
 const colour=/^#[\da-f]{6}$/i.test(c.geoLabelColor||'')?c.geoLabelColor:b.T,background=/^#[\da-f]{6}$/i.test(c.background||'')?c.background:'#ffffff';let out='';
 for(const [i,n] of settings.geoAnnotations.entries()){const [x,y]=project([n.lon,n.lat]);if(!Number.isFinite(x)||!Number.isFinite(y)||x<b.left||x>b.left+b.pw||y<b.top||y>b.top+b.ph)continue;const text=fitText(n.text,Math.min(210,b.pw-16),11),w=Math.min(b.pw,textWidth(text,11)+12),h=25,cx=Math.max(b.left+w/2,Math.min(b.left+b.pw-w/2,b.left+n.x*b.pw)),cy=Math.max(b.top+h/2,Math.min(b.top+b.ph-h/2,b.top+n.y*b.ph));out+=`<g data-map-annotation="${i}" role="img" aria-label="${E(n.text+' · '+n.lat+', '+n.lon)}"><title>${E(n.text)}</title><line x1="${x}" y1="${y}" x2="${cx}" y2="${cy}" stroke="${E(colour)}" stroke-width="1"/><circle cx="${x}" cy="${y}" r="3" fill="${E(colour)}"/><rect x="${cx-w/2}" y="${cy-h/2}" width="${w}" height="${h}" rx="4" fill="${background}" stroke="${E(colour)}" stroke-opacity=".5"/><text x="${cx}" y="${cy+4}" text-anchor="middle" fill="${E(colour)}" font-family="Arial,sans-serif" font-size="11">${E(text)}</text></g>`;}
 return out?'<g data-map-annotations="">'+out+'</g>':'';
}
