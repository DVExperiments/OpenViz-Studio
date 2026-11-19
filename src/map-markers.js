// V3.60 map marker styles for symbol maps: proportional circles (default), spikes, icons and dot density.
// One module serves the world map (geo.js) and imported/library boundaries (regional-map.js).
import {globeRing} from './map-projection.js';

export const MARKER_STYLES=[['circle','Proportional circles'],['spike','Spikes (height shows the value)'],['icon','Icons (pins and symbols)'],['dots','Dot density (one dot = a set amount)']];
// Original simple icons on a 24×24 grid. anchor 'bottom' sits the tip on the location.
export const MARKER_ICONS={
 pin:{name:'Pin',anchor:'bottom',d:'M12 1.5c-4.1 0-7.5 3.3-7.5 7.4 0 5.6 7.5 13.6 7.5 13.6s7.5-8 7.5-13.6c0-4.1-3.4-7.4-7.5-7.4zm0 10.2a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6z'},
 dot:{name:'Dot',anchor:'centre',d:'M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm0 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z'},
 star:{name:'Star',anchor:'centre',d:'M12 2.5l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 17.1l-5.9 3.4 1.4-6.6-5-4.5 6.6-.7z'},
 square:{name:'Square',anchor:'centre',d:'M5 5h14v14H5z'},
 triangle:{name:'Triangle',anchor:'centre',d:'M12 3.5l9 16H3z'},
 diamond:{name:'Diamond',anchor:'centre',d:'M12 2.5l9.5 9.5-9.5 9.5L2.5 12z'},
 flag:{name:'Flag',anchor:'bottomleft',d:'M5 2h2v20H5zM8 3h11l-2.5 4L19 11H8z'},
 home:{name:'Home',anchor:'centre',d:'M12 3l9 8h-2.5v9h-5v-6h-3v6h-5v-9H3z'},
 building:{name:'Building',anchor:'centre',d:'M5 21V4h9v4h5v13zm2.5-14v2h2V7zm0 4v2h2v-2zm0 4v2h2v-2zm6 0v2h2v-2zm0-4v2h2v-2z'},
 airport:{name:'Airport',anchor:'centre',d:'M21 15.5v-2l-7.5-4.7V3.5a1.5 1.5 0 0 0-3 0v5.3L3 13.5v2l7.5-2.4v5.4L8.5 20v1.5L12 20.5l3.5 1V20l-2-1.5v-5.4z'},
 harbour:{name:'Harbour',anchor:'centre',d:'M11 2h2v3.2a3 3 0 1 1-2 0zm1 2.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM11 9h2v10.4c2.6-.4 4.6-2.4 5-5.1l-1.9.7.9-4.5 3.4 3-1.5.5C18.4 18.4 15.5 21.5 12 21.5S5.6 18.4 5.1 14l-1.5-.5 3.4-3 .9 4.5-1.9-.7c.4 2.7 2.4 4.7 5 5.1z'},
 hospital:{name:'Hospital / health',anchor:'centre',d:'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z'},
 school:{name:'School',anchor:'centre',d:'M12 3L1.5 8.5 12 14l8.5-4.5V16h2V8.5zM5.5 12.6v4L12 20l6.5-3.4v-4L12 16z'},
 warning:{name:'Warning',anchor:'centre',d:'M12 2.5L22 20.5H2zm-1 6v6h2v-6zm0 8v2h2v-2z'},
 event:{name:'Event / incident',anchor:'centre',d:'M12 2l2.4 5.6L20 6l-1.6 5.6L23 15l-5.8.6L16 21.5 12 17.5 8 21.5l-1.2-5.9L1 15l4.6-3.4L4 6l5.6 1.6z'}
};
export const MARKER_IMAGE_MAX=200*1024;
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=v=>Number(v).toFixed(2);
export function markerStyle(s){return MARKER_STYLES.some(([k])=>k===s?.geoMarkerStyle)?s.geoMarkerStyle:'circle';}
export function validMarkerImage(uri){return typeof uri==='string'&&/^data:image\/(png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(uri)&&uri.length<=MARKER_IMAGE_MAX*1.4;}

// Draws one marker. `common` is the attribute string the caller already builds (data attributes,
// tooltips and the <title>), so interactivity and accessibility stay identical across styles.
export function markerSVG(s,{x,y,r,value,top,fill,opacity,stroke='#ffffff',attrs='',title='',plotH=400}){
 const style=markerStyle(s);
 if(style==='spike'){
  const H=Math.max(10,Math.min(plotH*.6,Number(s.geoSpikeHeight)||plotH*.28)),h=top>0?Math.max(1,H*Math.max(0,value)/top):0,w=Math.max(2,Math.min(30,Number(s.geoSpikeWidth)||7))/2;
  return `<path d="M${f(x-w)},${f(y)}L${f(x)},${f(y-h)}L${f(x+w)},${f(y)}Z" fill="${E(fill)}" fill-opacity="${opacity}" stroke="${E(fill)}" stroke-width="0.8" stroke-linejoin="round" ${attrs}>${title}</path>`;
 }
 if(style==='icon'){
  const size=s.geoIconSizing==='value'?Math.max(10,r*2):Math.max(8,Math.min(64,Number(s.geoIconSize)||22));
  if(s.geoMarkerIcon==='custom'&&validMarkerImage(s.geoMarkerImage))return `<g ${attrs}><image href="${s.geoMarkerImage}" x="${f(x-size/2)}" y="${f(y-size/2)}" width="${f(size)}" height="${f(size)}" preserveAspectRatio="xMidYMid meet"/>${title}</g>`;
  const icon=MARKER_ICONS[s.geoMarkerIcon]||MARKER_ICONS.pin,k=size/24,ox=icon.anchor==='bottomleft'?x-6*k:x-12*k,oy=icon.anchor==='bottom'||icon.anchor==='bottomleft'?y-22*k:y-12*k;
  return `<g ${attrs}><path transform="translate(${f(ox)} ${f(oy)}) scale(${k.toFixed(4)})" d="${icon.d}" fill="${E(fill)}" fill-opacity="${Math.max(.5,opacity)}" stroke="${E(stroke)}" stroke-width="${(1.2/k).toFixed(2)}" paint-order="stroke" fill-rule="evenodd"/>${title}</g>`;
 }
 return `<circle cx="${Number(x).toFixed(3)}" cy="${Number(y).toFixed(3)}" r="${Number(r).toFixed(4)}" fill="${E(fill)}" fill-opacity="${opacity}" stroke="${E(stroke)}" stroke-width="1" ${attrs}>${title}</circle>`;
}

// ---- dot density ----
function rng(seed){let h=2166136261;for(const ch of String(seed))h=Math.imul(h^ch.charCodeAt(0),16777619);return ()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
function screenRings(geometry,proj){const polys=geometry.type==='Polygon'?[geometry.coordinates]:geometry.type==='MultiPolygon'?geometry.coordinates:[];const out=[];
 for(const poly of polys)for(const ring of poly){if(ring.length<3)continue;if(proj.kind==='globe'){const pts=globeRing(ring,proj);if(pts)out.push(pts.map(v=>proj.screen(v)));}else{const r=[];for(const p of ring){if(!proj.contains||proj.contains(p))r.push(proj(p));}if(r.length>=3)out.push(r);}}return out;}
function inside(x,y,rings){let c=false;for(const ring of rings)for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}return c;}
export function niceDotValue(values,targetDots=60){const top=Math.max(0,...values.filter(Number.isFinite));if(!(top>0))return 1;const raw=top/targetDots,p=10**Math.floor(Math.log10(raw)),m=raw/p;return (m<=1?1:m<=2?2:m<=5?5:10)*p;}
// Returns {svg, drawn, capped}. Dots are placed by a seeded generator, so the same data always gives the same picture.
export function dotDensitySVG(s,{geometry,proj,value,dotValue,fill,key,attrs='',title='',budget}){
 if(!geometry||!(value>0)||!(dotValue>0))return {svg:'',drawn:0,capped:false};
 const rings=screenRings(geometry,proj);if(!rings.length)return {svg:'',drawn:0,capped:false};
 let xmin=Infinity,ymin=Infinity,xmax=-Infinity,ymax=-Infinity;for(const r of rings)for(const [x,y] of r){if(x<xmin)xmin=x;if(x>xmax)xmax=x;if(y<ymin)ymin=y;if(y>ymax)ymax=y;}
 const want=Math.round(value/dotValue),n=Math.min(want,budget.left),rand=rng(key),size=Math.max(.6,Math.min(6,Number(s.geoDotSize)||1.6));let d='',drawn=0;
 for(let tries=0;drawn<n&&tries<n*40;tries++){const x=xmin+rand()*(xmax-xmin),y=ymin+rand()*(ymax-ymin);if(!inside(x,y,rings))continue;d+=`M${f(x-size)},${f(y)}a${size},${size} 0 1,0 ${f(size*2)},0a${size},${size} 0 1,0 ${f(-size*2)},0`;drawn++;}
 // tiny areas: put the remaining dots near the area's centre so small places are not lost
 const cx=(xmin+xmax)/2,cy=(ymin+ymax)/2;for(;drawn<n;drawn++){const a=rand()*Math.PI*2,rr=rand()*Math.max(2,Math.min(xmax-xmin,ymax-ymin)/2);d+=`M${f(cx+Math.cos(a)*rr-size)},${f(cy+Math.sin(a)*rr)}a${size},${size} 0 1,0 ${f(size*2)},0a${size},${size} 0 1,0 ${f(-size*2)},0`;}
 budget.left-=drawn;
 return {svg:d?`<path d="${d}" fill="${E(fill)}" fill-opacity="${Math.max(.4,Math.min(1,Number(s.geoOpacity)||.85))}" ${attrs}>${title}</path>`:'',drawn,capped:want>n};
}
export const DOT_BUDGET=12000;
export function dotLegendSVG(x,y,dotValue,fill,T,font,s,capped){const size=Math.max(.6,Math.min(6,Number(s.geoDotSize)||1.6)),fmt=v=>Number(v).toLocaleString(undefined,{maximumFractionDigits:2});return `<g data-viz-part="legend"><circle cx="${f(x+size)}" cy="${f(y-4)}" r="${size}" fill="${E(fill)}"/><text x="${f(x+size*2+6)}" y="${f(y)}" font-size="11" fill="${E(T)}" font-family="${E(font)}">1 dot = ${E(fmt(dotValue))}${capped?' · dot limit reached; raise the dot value':''}</text></g>`;}
