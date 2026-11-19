export const MAP_PROJECTIONS={local:'Local equirectangular',mercator:'Mercator (spherical)',equalArea:'Cylindrical equal-area (30°)',globe:'Globe (orthographic, 3D view)'};
export const MERCATOR_LIMIT=85.0511287798066;
const finite=v=>typeof v==='number'&&Number.isFinite(v),deg=Math.PI/180;
export function validateMapFrame(c){
 if(c.geoProjection!==undefined&&!Object.hasOwn(MAP_PROJECTIONS,c.geoProjection))throw Error('Unsupported map projection.');
 if(c.geoFramePadding!==undefined&&(!finite(c.geoFramePadding)||c.geoFramePadding<0||c.geoFramePadding>20))throw Error('Map frame padding must be 0–20 percent.');
 if(c.geoExtent!==undefined&&c.geoExtent!==null){const v=c.geoExtent;if(!Array.isArray(v)||v.length!==4||!v.every(finite)||v[0]<-180||v[0]>180||v[2]<-180||v[2]>540||v[1]<-90||v[3]>90||v[1]>=v[3])throw Error('Use a valid west/south/east/north extent in degrees.');if(v[2]===v[0])throw Error('West and east must be different.');const span=v[2]-v[0]<=0?v[2]-v[0]+360:v[2]-v[0];if(span<=0||span>360)throw Error('Map longitude extent must span more than 0 and at most 360 degrees.');}
 return true;
}
export function resolveMapView(base,c){try{validateMapFrame(c);}catch{return [...base];}if(!c.geoExtent)return [...base];const [w,s,e,n]=c.geoExtent;return [w,s,e<=w?e+360:e,n];}
export function shortestLongitudeBounds(values){const a=values.filter(Number.isFinite).map(x=>((x%360)+360)%360).sort((x,y)=>x-y);if(!a.length)return null;let gap=-1,start=a[0];for(let i=0;i<a.length;i++){const next=i===a.length-1?a[0]+360:a[i+1],size=next-a[i];if(size>gap){gap=size;start=next%360;}}if(start>180)start-=360;return [start,start+360-gap];}
/** Unit-sphere forward equations. Render fitting uses one uniform screen scale. */
export function projectionRaw(lon,lat,kind='local',parallel=1){if(kind==='mercator'){const p=Math.max(-MERCATOR_LIMIT,Math.min(MERCATOR_LIMIT,lat))*deg;return [lon*deg,Math.log(Math.tan(Math.PI/4+p/2))];}if(kind==='equalArea'){const k=Math.cos(30*deg);return [lon*deg*k,Math.sin(lat*deg)/k];}return [lon*parallel,lat];}
export function mapProjection(view,b,c={},inset=0){
 if(c.geoProjection==='globe')return globeProjection(view,b,c,inset);
 const kind=Object.hasOwn(MAP_PROJECTIONS,c.geoProjection)?c.geoProjection:'local',[w,s,e,n]=view,parallel=Math.max(.15,Math.cos((s+n)/2*deg)),latMin=kind==='mercator'?Math.max(-MERCATOR_LIMIT,Math.min(MERCATOR_LIMIT-1e-6,s)):s,latMax=kind==='mercator'?Math.min(MERCATOR_LIMIT,Math.max(-MERCATOR_LIMIT+1e-6,n)):n;
 const bottom=projectionRaw(w,latMin,kind,parallel),top=projectionRaw(e,latMax,kind,parallel),padding=Math.min(b.pw,b.ph)*(Math.max(0,Math.min(20,Number(c.geoFramePadding)||0))/100),pad=Math.min(Math.max(0,Math.min(b.pw,b.ph)/2-1),inset+padding),dx=Math.max(1e-10,top[0]-bottom[0]),dy=Math.max(1e-10,top[1]-bottom[1]),scale=Math.min(Math.max(1,b.pw-2*pad)/dx,Math.max(1,b.ph-2*pad)/dy),ox=b.left+(b.pw-dx*scale)/2,oy=b.top+(b.ph-dy*scale)/2;
 const unwrap=lon=>lon+360*Math.round(((w+e)/2-lon)/360),raw=(lon,lat)=>{const p=projectionRaw(lon,lat,kind,parallel);return [ox+(p[0]-bottom[0])*scale,oy+(top[1]-p[1])*scale];},point=p=>raw(unwrap(p[0]),p[1]);
 point.contains=p=>{const lon=unwrap(p[0]);return Number.isFinite(lon)&&Number.isFinite(p[1])&&lon>=w-1e-9&&lon<=e+1e-9&&p[1]>=latMin&&p[1]<=latMax;};point.raw=raw;point.view=[w,latMin,e,latMax];point.kind=kind;return point;
}
function clip(ring,axis,edge,greater){let out=[];for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[j],b=ring[i],insideA=greater?a[axis]>=edge:a[axis]<=edge,insideB=greater?b[axis]>=edge:b[axis]<=edge;if(insideA!==insideB){const t=(edge-a[axis])/(b[axis]-a[axis]);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}if(insideB)out.push(b);}return out;}
/** Clip unwrapped cylindrical polygons to the geographic frame before projection. */
export function projectedMapPath(polys,proj){if(proj.kind==='globe'){let g='';for(const poly of polys)for(const ring of poly){if(ring.length<3)continue;const pts=globeRing(ring,proj);if(pts)g+='M'+pts.map(v=>proj.screen(v).map(x=>x.toFixed(2)).join(',')).join('L')+'Z';}return g;}let d='';const [w,s,e,n]=proj.view;for(const poly of polys){let outerCenter=null;for(const original of poly){if(original.length<3)continue;const ring=[];for(const p of original){let lon=p[0];if(ring.length)lon+=360*Math.round((ring.at(-1)[0]-lon)/360);ring.push([lon,p[1]]);}const center=ring.reduce((a,p)=>a+p[0],0)/ring.length;if(outerCenter===null)outerCenter=center;const align=360*Math.round((outerCenter-center)/360);for(const shift of [-720,-360,0,360,720]){let r=ring.map(p=>[p[0]+align+shift,p[1]]);let lo=Infinity,hi=-Infinity;for(const p of r){lo=Math.min(lo,p[0]);hi=Math.max(hi,p[0]);}if(hi<w||lo>e)continue;for(const [axis,edge,greater] of [[0,w,true],[0,e,false],[1,s,true],[1,n,false]]){r=clip(r,axis,edge,greater);if(!r.length)break;}if(r.length<3)continue;d+='M'+r.map(p=>proj.raw(...p).map(x=>x.toFixed(3)).join(',')).join('L')+'Z';}}}return d;}

// V3.60 globe: orthographic projection centred on (globeLon, globeLat). Rings are clipped to the
// visible hemisphere in 3D and the cut is closed along the horizon, so filled shapes stay correct.
function rotateTo(lon,lat,lon0,lat0){const l=(lon-lon0)*deg,p=lat*deg,p0=lat0*deg,x=Math.cos(p)*Math.sin(l),y=Math.cos(p0)*Math.sin(p)-Math.sin(p0)*Math.cos(p)*Math.cos(l),z=Math.sin(p0)*Math.sin(p)+Math.cos(p0)*Math.cos(p)*Math.cos(l);return [x,y,z];}
export function globeCentre(view,c){const lon=Number.isFinite(Number(c.globeLon))&&c.globeLon!==''&&c.globeLon!==null?Number(c.globeLon):((view[0]+view[2])/2+540)%360-180,lat=Number.isFinite(Number(c.globeLat))&&c.globeLat!==''&&c.globeLat!==null?Number(c.globeLat):Math.max(-60,Math.min(60,(view[1]+view[3])/2));return [lon,Math.max(-90,Math.min(90,lat))];}
function globeProjection(view,b,c,inset){
 const [lon0,lat0]=globeCentre(view,c),padding=Math.min(b.pw,b.ph)*(Math.max(0,Math.min(20,Number(c.geoFramePadding)||0))/100),r=Math.max(10,Math.min(b.pw,b.ph)/2-inset-padding-2),cx=b.left+b.pw/2,cy=b.top+b.ph/2;
 const xyz=(lon,lat)=>rotateTo(lon,lat,lon0,lat0),screen=v=>[cx+v[0]*r,cy-v[1]*r],raw=(lon,lat)=>screen(xyz(lon,lat));
 const point=p=>raw(p[0],p[1]);point.contains=p=>Number.isFinite(p[0])&&Number.isFinite(p[1])&&xyz(p[0],p[1])[2]>=0;point.raw=raw;point.xyz=xyz;point.screen=screen;point.view=[-180,-90,180,90];point.kind='globe';point.globe={cx,cy,r,lon0,lat0};return point;}
function horizonArc(a,b,out){let t0=Math.atan2(a[1],a[0]),t1=Math.atan2(b[1],b[0]),d=t1-t0;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;const n=Math.max(1,Math.ceil(Math.abs(d)/(Math.PI/36)));for(let i=1;i<n;i++){const t=t0+d*i/n;out.push([Math.cos(t),Math.sin(t),0]);}}
export function globeRing(ring,proj){
 // densify long edges so great-circle segments bend correctly, then clip against z>=0
 const pts=[];for(let i=0;i<ring.length;i++){const a=ring[i],b2=ring[(i+1)%ring.length];pts.push(proj.xyz(a[0],a[1]));const span=Math.max(Math.abs(b2[0]-a[0])%360,Math.abs(b2[1]-a[1]));const n=Math.min(40,Math.floor(span/4));for(let k=1;k<=n;k++){const t=k/(n+1);pts.push(proj.xyz(a[0]+(b2[0]-a[0])*t,a[1]+(b2[1]-a[1])*t));}}
 if(!pts.some(p=>p[2]>=0))return null;if(pts.every(p=>p[2]>=0))return pts;
 const out=[];let exit=null;const start=pts.findIndex(p=>p[2]>=0);
 for(let k=0;k<pts.length;k++){const i=(start+k)%pts.length,a=pts[i],b2=pts[(i+1)%pts.length],inA=a[2]>=0,inB=b2[2]>=0;if(inA)out.push(a);
  if(inA!==inB){const t=a[2]/(a[2]-b2[2]),x=a[0]+(b2[0]-a[0])*t,y=a[1]+(b2[1]-a[1])*t,l=Math.hypot(x,y)||1,h=[x/l,y/l,0];
   if(inA){out.push(h);exit=h;}else{if(exit)horizonArc(exit,h,out);out.push(h);exit=null;}}}
 return out.length>=3?out:null;}
export function globeOutline(proj){const {cx,cy,r}=proj.globe;return {cx,cy,r};}
export function globeGraticule(proj,step=30){let d='';for(let lon=-180;lon<180;lon+=step){let seg=[];for(let lat=-90;lat<=90;lat+=3){const v=proj.xyz(lon,lat);if(v[2]>=0)seg.push(proj.screen(v));else{if(seg.length>1)d+='M'+seg.map(p=>p.map(x=>x.toFixed(1)).join(',')).join('L');seg=[];}}if(seg.length>1)d+='M'+seg.map(p=>p.map(x=>x.toFixed(1)).join(',')).join('L');}
 for(let lat=-60;lat<=60;lat+=step){let seg=[];for(let lon=-180;lon<=180;lon+=3){const v=proj.xyz(lon,lat);if(v[2]>=0)seg.push(proj.screen(v));else{if(seg.length>1)d+='M'+seg.map(p=>p.map(x=>x.toFixed(1)).join(',')).join('L');seg=[];}}if(seg.length>1)d+='M'+seg.map(p=>p.map(x=>x.toFixed(1)).join(',')).join('L');}return d;}
