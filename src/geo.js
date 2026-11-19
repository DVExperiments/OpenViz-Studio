import {routeReport,routeWarnings,renderRoutes,routeFitBounds,routeTimelineDomain} from './route-map.js';
import {mapFeatureAttributes,mapNavigationFrame} from './map-exploration-meta.js';
import {mapTooltipText,mapTooltipAttributes,validateMapTooltip} from './map-tooltips.js';
import {classificationModel,classifiedColour,renderClassLegend,mapLegendHeight} from './map-classification.js';
import {globeGraticule,mapProjection,resolveMapView,shortestLongitudeBounds,projectedMapPath} from './map-projection.js';
import {renderMapAnnotations} from './map-authoring.js';
import {mapLabels,mapLocator,locatorBox} from './map-furniture.js';
import {boundaryIndex,regionalAnchor,isRegional,regionalReport,regionalWarnings,regionalTimeDomain,renderRegional} from './regional-map.js';
import {timeEntityKey,timeIdentityField,stableTimeColour} from './time-spatial.js';
/* OpenViz Studio V2.5 — local, deterministic geographic rendering.
 * Natural Earth 1:110m simplified boundaries are PUBLIC DOMAIN (included in world-data.js).
 * No tiles, geocoding API, tracking, or online dependencies.
 */
import {WORLD} from './world-data.js';
import {markerStyle,markerSVG,dotDensitySVG,niceDotValue,dotLegendSVG,DOT_BUDGET} from './map-markers.js';
export const GEO_TYPES=new Set(['geo-choropleth','geo-symbol','geo-heat','geo-route']);
export const GEO_VIEWS={world:[-180,-60,180,85],oceania:[108,-50,180,5],nz:[165,-49,180,-32],northamerica:[-170,5,-50,76],southamerica:[-84,-58,-32,15],europe:[-13,34,45,74],africa:[-20,-36,54,39],asia:[25,-13,180,80],fit:null};
export const GEO_PALETTES={teal:['#e8f6f3','#0f827c'],blue:['#e9f2fc','#215da8'],sunset:['#ffe8bd','#c44b42'],purple:['#f0eafb','#693a9a'],gray:['#eeeeee','#414a55']};
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
const finite=v=>(typeof v==='number'||typeof v==='string')&&String(v).trim()!==''&&Number.isFinite(Number(v));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const aliases={unitedstates:'unitedstatesofamerica',usa:'unitedstatesofamerica',us:'unitedstatesofamerica',america:'unitedstatesofamerica',uk:'unitedkingdom',greatbritain:'unitedkingdom',britain:'unitedkingdom',southkorea:'southkorea',republicofkorea:'southkorea',northkorea:'northkorea',russianfederation:'russia',czechia:'czechrepublic',ivorycoast:'cotedivoire',drcongo:'demrepcogo',democraticrepublicofthecongo:'demrepcogo',tanzania:'unitedrepublicoftanzania'};
const features=WORLD.features;
const countryIndex=new Map();
// Natural Earth 1:110m has no ISO3 for France and Norway; accept their real codes too.
const ISO3_GAPS={FR:'FRA',NO:'NOR'};const iso3Of=f=>f.properties.iso3!=='-99'?f.properties.iso3:ISO3_GAPS[f.properties.iso2]||null;
for(const f of features){for(const key of [iso3Of(f),f.properties.iso2,f.properties.name]){if(key&&key!=='-99')countryIndex.set(norm(key),f);}}
function country(value){const key=norm(value);return countryIndex.get(key)||countryIndex.get(aliases[key]||'')||null;}
export function geoCanonicalValue(value){const f=country(value);return f?(f.properties.iso3!=='-99'?f.properties.iso3:f.properties.name):null;}
function polygons(g){return g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];}
function centroid(f){ // polygon area weighted center, sufficient for placing country-level symbols
 const rings=polygons(f.geometry);let best=[],size=-1;
 for(const poly of rings)for(const ring of poly.slice(0,1)){let minX=180,maxX=-180,minY=90,maxY=-90;for(const [x,y] of ring){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}const area=(maxX-minX)*(maxY-minY);if(area>size){size=area;best=ring;}}
 if(!best.length)return [0,0];let a=0,cx=0,cy=0;for(let i=0;i<best.length;i++){const p=best[i],q=best[(i+1)%best.length],cross=p[0]*q[1]-q[0]*p[1];a+=cross;cx+=(p[0]+q[0])*cross;cy+=(p[1]+q[1])*cross;}if(Math.abs(a)>1e-8)return [cx/(3*a),cy/(3*a)];return [best.reduce((v,p)=>v+p[0],0)/best.length,best.reduce((v,p)=>v+p[1],0)/best.length];
}
const centerMap=new Map(features.map(f=>[f,centroid(f)]));
function canonical(f){return f.properties.iso3!=='-99'?f.properties.iso3:f.properties.name;}
function rowsFor(rows,s,type){const out=[];for(let i=0;i<rows.length;i++){
 const r=rows[i];if(type==='geo-choropleth'){
  const f=country(r[s.x]);if(!f||s.aggregation!=='count'&&!finite(r[s.y]))continue;out.push({x:canonical(f),y:s.aggregation==='count'?1:Number(r[s.y]),feature:f,row:r,index:i});
 }else if(type==='geo-symbol'){
  let latitude,longitude,f=null;
  if(s.geoLatField&&s.geoLonField&&finite(r[s.geoLatField])&&finite(r[s.geoLonField])){latitude=Number(r[s.geoLatField]);longitude=Number(r[s.geoLonField]);}
  else if(s.geoLocationMode!=='coordinates'&&(f=country(r[s.x]))){[longitude,latitude]=centerMap.get(f);}
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)continue;
  if(!finite(r[s.y])||Number(r[s.y])<0)continue;
  out.push({x:String(r[s.x]??f?.properties.name??`Point ${i+1}`),y:Number(r[s.y]),lat:latitude,lon:longitude,feature:f,row:r,index:i});
 }else{
  if(!s.geoLatField||!s.geoLonField||!finite(r[s.geoLatField])||!finite(r[s.geoLonField]))continue;
  const lat=Number(r[s.geoLatField]),lon=Number(r[s.geoLonField]),weight=s.y&&finite(r[s.y])?Number(r[s.y]):1;
  if(Math.abs(lat)>90||Math.abs(lon)>180||weight<=0)continue;
  out.push({x:String(r[s.x]??`Observation ${i+1}`),y:weight,lat,lon,row:r,index:i});
 }
 }return out;}
export function geoData(rows,s,type){if(type==='geo-route')return routeReport(rows,s).routes;return ['geo-choropleth','geo-symbol'].includes(type)&&s.geoCustom?regionalReport(rows,s).points:rowsFor(rows,s,type);}
function grouped(values,aggregation){const n=values.length,total=values.reduce((a,b)=>a+b,0);switch(aggregation){case 'count':return n;case 'average':return values.reduce((a,b)=>a+b/n,0);case 'min':return values.reduce((a,b)=>Math.min(a,b),Infinity);case 'max':return values.reduce((a,b)=>Math.max(a,b),-Infinity);default:return total;}}
export function geoWarnings(rows,s,type){if(type==='geo-route')return routeWarnings(rows,s);if(['geo-choropleth','geo-symbol'].includes(type)&&s.geoCustom)return regionalWarnings(rows,s);const warnings=[],fields=rows.length?Object.keys(rows[0]):[];const has=k=>!!k&&fields.includes(k);if(!rows.length)return ['No data rows are available.'];
 if(type==='geo-choropleth'){if(!has(s.x))warnings.push('Choose a country name, ISO2 or ISO3 field.');if(s.aggregation!=='count'&&!has(s.y))warnings.push('Choose a numeric value field.');}
 if(type==='geo-symbol'&&(!has(s.geoLatField)||!has(s.geoLonField))&&!has(s.x))warnings.push('Choose a country field or latitude and longitude fields.');
 if(type==='geo-heat'&&(!has(s.geoLatField)||!has(s.geoLonField)))warnings.push('Geographic heatmaps require latitude and longitude fields. Country names alone are not sufficient.');
 const valid=geoData(rows,s,type);if(!valid.length)warnings.push('No compatible geographic observations. Check country names, coordinates and numeric fields.');
 if(valid.length<rows.length){warnings.push(`${rows.length-valid.length} of ${rows.length} rows are excluded (unmatched country/region, invalid coordinates or invalid values).`);if(type==='geo-choropleth'){const missing=geoUnmatched(rows,s);if(missing.length)warnings.push(`Unmatched country values (first ${missing.length}): ${missing.join(', ')}. Use country names or ISO codes.`);}}
 if(type==='geo-symbol'&&!s.geoLatField)warnings.push('Country-symbol positions use approximate geographic centroids, not actual observation locations.');
 if(type==='geo-heat'&&s.geoHeatMode==='hexbin')warnings.push('Hexagons count points (or total weights) inside equal screen-space hexagons. On a projected map they do not cover equal ground areas, and counts are not rates.');else if(type==='geo-heat')warnings.push('Density depends on radius and weights; do not interpret colour as an exact count or rate.');
 if(valid.length>(type==='geo-heat'?1200:2500))warnings.push('This map displays a capped subset for performance; filter before interpreting an incomplete picture.');
 return warnings;}
function getBounds(s,points){let view=GEO_VIEWS[s.geoView]||GEO_VIEWS.world;if(s.geoView==='fit'&&points.length){const lon=points.map(p=>p.lon).filter(Number.isFinite);if(lon.length){const [minLon,maxLon]=shortestLongitudeBounds(lon);let minLat=90,maxLat=-90;for(const p of points)if(Number.isFinite(p.lat)){minLat=Math.min(minLat,p.lat);maxLat=Math.max(maxLat,p.lat);}minLat=Math.max(-90,Math.min(90,minLat));maxLat=Math.max(-90,Math.min(90,maxLat));const padX=Math.max(2,(maxLon-minLon)*.16),padY=Math.max(2,(maxLat-minLat)*.16);view=[minLon-padX,Math.max(-90,minLat-padY),maxLon+padX,Math.min(90,maxLat+padY)];}}return view||GEO_VIEWS.world;}

function gradient(a,b,t){let v=Math.min(1,Math.max(0,t));const aa=[1,3,5].map(i=>parseInt(a.slice(i,i+2),16)),bb=[1,3,5].map(i=>parseInt(b.slice(i,i+2),16));return '#'+aa.map((x,i)=>Math.round(x+(bb[i]-x)*v).toString(16).padStart(2,'0')).join('');}
// V3.60 detailed borders (Natural Earth 1:50m), loaded on demand; matching and data stay on the 1:110m set.
const detailedWorld=new Map();let useDetailed=false;
export function setDetailedWorld(json){detailedWorld.clear();for(const f of json?.features||[]){const k=f.properties?.iso3;if(k&&k!=='-99'&&f.geometry)detailedWorld.set(k,f.geometry);}}
export function detailedWorldReady(){return detailedWorld.size>0;}
function drawCountry(f,proj){const g=useDetailed?detailedWorld.get(iso3Of(f)):null;return projectedMapPath(polygons(g||f.geometry),proj);}
function palette(s){return GEO_PALETTES[s.geoPalette]||GEO_PALETTES.teal;}
function label(x,y,text,fill='#334155',size=11){return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-family="Arial, sans-serif">${esc(text)}</text>`;}
export function renderGeo(type,rows,s,b){useDetailed=s.geoDetail==='detailed'&&detailedWorld.size>0;if(type==='geo-route'){const report=routeReport(rows,s),points=report.routes.flatMap(r=>[r.from,r.to].map(([lon,lat])=>({lon,lat})));let view=resolveMapView(s.timeDomain?.view||(s.geoView==='fit'?routeFitBounds(report.routes,s):getBounds(s,points)),s),span=Math.min(360,view[2]-view[0]),west=((view[0]+180)%360+360)%360-180;view=[west,view[1],west+span,view[3]];const background=renderGeo('geo-symbol',[],{...s,type:'geo-symbol',timeDomain:null,timeDisplayPeriod:null,geoCustom:null,geoExtent:view,geoShowLegend:false,geoShowLocator:false,geoShowLabels:false,geoShowBoundaryNote:false,geoAnnotations:[],geoNavigationEnabled:false,geoExploreEnabled:false},b);return renderRoutes(rows,s,b,view,background);}try{validateMapTooltip(s);}catch(e){return label(b.left,b.top+24,e.message,b.T,12);}if(['geo-choropleth','geo-symbol'].includes(type)&&s.geoCustom)return renderRegional(rows,s,b,palette(s));
 const pts=geoData(rows,s,type),timeRadius=s.timeDomain&&type==='geo-symbol'?Math.min(Math.max(5,Math.min(75,Number(s.geoMaxRadius)||32)),Math.max(6,b.pw*.08),Math.max(5,b.ph*.2)):null,inset=timeRadius===null?0:timeRadius+2,requestedView=resolveMapView(s.timeDomain?.view||getBounds(s,pts),s),projection=mapProjection(requestedView,b,s,inset),view=projection.view,proj=(lon,lat)=>projection([lon,lat]);proj.raw=projection.raw;proj.view=view;const [light,dark]=palette(s);let out='';
 const sourceRowsByCountry=new Map(),valuesByCountry=new Map();if(type==='geo-choropleth')for(const p of pts){const a=valuesByCountry.get(p.feature)||[];a.push(p.y);valuesByCountry.set(p.feature,a);if(s.geoTooltipMode==='custom'&&s.geoTooltipFields?.length){const source=sourceRowsByCountry.get(p.feature)||[];source.push(p.row);sourceRowsByCountry.set(p.feature,source);}}
 const scores=[...(type==='geo-choropleth'?[...valuesByCountry.values()].map(v=>grouped(v,s.aggregation)):pts.map(p=>p.y))];const nonZeroMin=scores.length?scores.reduce((n,v)=>Math.min(n,v),Infinity):0,nonZeroMax=scores.length?scores.reduce((n,v)=>Math.max(n,v),-Infinity):1;
 const scaleMin=s.timeDomain?.colorMin??nonZeroMin,scaleMax=s.timeDomain?.colorMax??nonZeroMax,denom=scaleMax-scaleMin||1;
 const classification=type==='geo-choropleth'?(s.timeDomain?.classification||classificationModel(scores,s)):null;if(classification?.error)return label(b.left,b.top+24,classification.error,b.T,12);
 // SVG clipping preserves viewport framing and prevents out-of-view geometries from appearing outside plot bounds.
 const clipId='ov-geo-map-'+[type,b.width,b.height,b.left,b.top,b.pw,b.ph].join('-');out+=`<g data-geo-projection="${projection.kind}" data-geo-bounds="${view.join(',')}" data-geo-color-domain="${scaleMin},${scaleMax}" data-geo-size-max="${s.timeDomain?.sizeMax??''}"></g><defs><clipPath id="${clipId}"><rect x="${b.left}" y="${b.top}" width="${b.pw}" height="${b.ph}"/></clipPath></defs><g ${mapNavigationFrame(s,b)} clip-path="url(#${clipId})">`;
 out+=(projection.kind==='globe'?(g=>`<rect x="${b.left}" y="${b.top}" width="${b.pw}" height="${b.ph}" fill="none"/><circle cx="${g.cx}" cy="${g.cy}" r="${g.r}" fill="${s.geoOcean||'#eff6f9'}" data-viz-part="globe"/>${s.geoGraticule!==false?`<path d="${globeGraticule(projection)}" fill="none" stroke="#9fb3c3" stroke-opacity=".35" stroke-width=".6" data-viz-part="graticule"/>`:''}`)(projection.globe):`<rect x="${b.left}" y="${b.top}" width="${b.pw}" height="${b.ph}" fill="${s.geoOcean||'#eff6f9'}"/>`);
 if(s.geoNavigationEnabled&&type!=='geo-heat')out+='<g data-map-pan-layer="">';
 for(const f of features){const data=valuesByCountry.get(f),value=data?grouped(data,s.aggregation):null;const fill=type==='geo-choropleth'&&value!==null?(/^#[\da-f]{6}$/i.test(s.pointColors?.[canonical(f)]||'')?s.pointColors[canonical(f)]:classifiedColour(value,classification,[light,dark])):(s.geoNoDataColor||'#d8e2e8');const p=drawCountry(f,proj);if(!p)continue;const ctx={name:f.properties.name,value,count:data?.length||0,aggregate:true,period:s.timeDisplayPeriod,sourceRows:sourceRowsByCountry.get(f)||[]},legacy=f.properties.name+(value!==null?': '+value.toLocaleString('en-US',{maximumFractionDigits:2}):' · no data'),detail=type==='geo-choropleth'?mapTooltipText(s,ctx,legacy):type==='geo-symbol'&&s.geoTooltipMode==='custom'?f.properties.name:legacy;
  out+=`<path d="${p}" fill="${fill}" stroke="${s.geoBorders===false?'none':'#ffffff'}" stroke-width="${Math.max(.15,Math.min(2.5,Number(s.geoBorderWidth)||.65))}" ${type==='geo-choropleth'&&data?`data-viz-part="point" data-viz-key="${encodeURIComponent(canonical(f))}"`:''} ${type==='geo-choropleth'?mapFeatureAttributes(s,'country:'+canonical(f),f.properties.name,'area')+' '+mapTooltipAttributes(s,ctx,detail):''}><title>${esc(detail)}</title></path>`;
 }
 if(type==='geo-symbol'){
  const mStyle=markerStyle(s),dotValue=Number(s.geoDotValue)>0?Number(s.geoDotValue):niceDotValue(pts.map(p=>p.y)),dotBudget={left:DOT_BUDGET};let dotsCapped=false;
  const topValue=s.timeDomain?.sizeMax??pts.reduce((n,p)=>Math.max(n,p.y),1),minRadius=Math.max(2,Math.min(15,Number(s.geoMinRadius)||4)),maxRadius=timeRadius??Math.max(minRadius+1,Math.min(75,Number(s.geoMaxRadius)||32));
  for(const p of pts.slice(0,2500)){if(!projection.contains([p.lon,p.lat]))continue;const [x,y]=proj(p.lon,p.lat),r=s.timeDomain?maxRadius*Math.sqrt(p.y/topValue):Math.sqrt(minRadius*minRadius+(p.y/topValue)*(maxRadius*maxRadius-minRadius*minRadius));const key=s.timeDomain?timeEntityKey(p.row,s):p.x,name=s.timeDomain?String(p.row[timeIdentityField(s)]):p.x,c=s.timeDomain?stableTimeColour(key,s):s.pointColors?.[p.x]||dark;
   const ctx={name,value:p.y,count:1,aggregate:false,period:s.timeDisplayPeriod,coordinates:[p.lon,p.lat],coordinateLabel:p.feature?'Country representative position':'Observation position',sourceRows:[p.row]},legacy=name+': '+p.y.toLocaleString()+' · '+p.lat.toFixed(3)+', '+p.lon.toFixed(3),detail=mapTooltipText(s,ctx,legacy);
   {const mAttrs=`data-viz-part="point" data-viz-key="${encodeURIComponent(key)}" ${mapFeatureAttributes(s,'point:'+(s.timeDomain?String(key):JSON.stringify([name,p.lon,p.lat])),p.feature?.properties.name||p.x||name,'point')} ${s.timeDomain?`data-time-entity="${esc(key)}"`:""} ${s.geoTooltipMode==='custom'?mapTooltipAttributes(s,ctx,detail):s.timeDomain?`role="img" aria-label="${esc(name+': '+p.y)}"`:""}`,mTitle=`<title>${esc(detail)}</title>`,mOpacity=Math.min(.95,Math.max(.1,Number(s.geoOpacity)||.58));if(mStyle==='dots'){if(p.feature){const res=dotDensitySVG(s,{geometry:p.feature.geometry,proj:projection,value:p.y,dotValue,fill:c,key:key,attrs:mAttrs,title:mTitle,budget:dotBudget});out+=res.svg;dotsCapped=dotsCapped||res.capped;}else out+=`<circle cx="${x}" cy="${y}" r="${Math.max(.6,Math.min(6,Number(s.geoDotSize)||1.6))}" fill="${esc(c)}" ${mAttrs}>${mTitle}</circle>`;}else out+=markerSVG(s,{x,y,r,value:p.y,top:topValue,fill:c,opacity:mOpacity,attrs:mAttrs,title:mTitle,plotH:b.ph});}
   if(s.showLabels&&!s.geoShowLabels&&mStyle!=='dots')out+=label(x+(mStyle==='circle'?r:8)+3,y+4,name,b.T,11);
  }
  if(mStyle==='dots')out+=dotLegendSVG(b.left+8,b.bottom-8,dotValue,dark,b.T,b.font||'Arial, sans-serif',s,dotsCapped);
 }
 if(type==='geo-heat'&&s.geoHeatMode==='hexbin'){
  // V3.56 hexagonal binning: each hexagon totals the weights (or counts the points) that project inside it.
  const R=Math.max(5,Math.min(60,Number(s.geoHexSize)||14)),hw=Math.sqrt(3)*R,vh=1.5*R,bins=new Map();
  for(const p of pts.slice(0,20000)){if(!projection.contains([p.lon,p.lat]))continue;const [x,y]=proj(p.lon,p.lat);if(!Number.isFinite(x)||!Number.isFinite(y))continue;let row=Math.round((y-b.top)/vh),col=Math.round((x-b.left-(row&1?hw/2:0))/hw);let best=null,bd=Infinity;for(const dr of [-1,0,1])for(const dc of [-1,0,1]){const r=row+dr,c=col+dc,cx=b.left+c*hw+(r&1?hw/2:0),cy=b.top+r*vh,d=(x-cx)**2+(y-cy)**2;if(d<bd){bd=d;best=[r,c,cx,cy];}}const key=best[0]+','+best[1];if(!bins.has(key))bins.set(key,{cx:best[2],cy:best[3],n:0,w:0});const bin=bins.get(key);bin.n++;bin.w+=Number.isFinite(p.y)?p.y:1;}
  const useWeight=!!s.y&&pts.some(p=>p.row&&Object.prototype.hasOwnProperty.call(p.row,s.y));var hexMax=Math.max(0,...[...bins.values()].map(v=>useWeight?v.w:v.n));var hexLabel=useWeight?`Total ${s.y} per hexagon`:'Points per hexagon';
  out+=`<g data-viz-part="series" data-viz-hexbin-layer="true">`;const corners=Array.from({length:6},(_,i)=>{const a=Math.PI/180*(60*i-30);return [R*Math.cos(a),R*Math.sin(a)];});
  for(const v of bins.values()){const val=useWeight?v.w:v.n,t=hexMax?Math.pow(val/hexMax,Math.max(.35,Math.min(2.7,Number(s.geoHeatGamma)||.85))):0,cl=gradient(light,dark,Math.max(.12,t));out+=`<path d="M${corners.map(([dx,dy])=>`${(v.cx+dx).toFixed(1)},${(v.cy+dy).toFixed(1)}`).join('L')}Z" fill="${cl}" fill-opacity=".9" stroke="#ffffff" stroke-width=".8" data-viz-part="point"><title>${esc(`${v.n} point${v.n===1?'':'s'}${useWeight?` · total ${s.y} ${Number(v.w.toPrecision(6)).toLocaleString('en-US')}`:''}`)}</title></path>`;}
  out+='</g>';
 }
 else if(type==='geo-heat'){
  const width=Math.min(88,Math.max(25,Math.floor(b.pw/13))),height=Math.min(46,Math.max(12,Math.floor(b.ph/13))),cellW=b.pw/width,cellH=b.ph/height;
  const radius=Math.max(7,Math.min(95,Number(s.geoRadius)||32)),radius2=radius*radius*2,points=pts.slice(0,1200).filter(p=>projection.contains([p.lon,p.lat])).map(p=>{const [x,y]=proj(p.lon,p.lat);return {x,y,w:p.y};}),cells=[],density=[];
  for(let iy=0;iy<height;iy++)for(let ix=0;ix<width;ix++){
   const x=b.left+(ix+.5)*cellW,y=b.top+(iy+.5)*cellH;let v=0;
   for(const p of points){const dx=x-p.x,dy=y-p.y,dist=dx*dx+dy*dy;if(dist<radius2*5)v+=p.w*Math.exp(-dist/radius2);}
   cells.push([x,y,v]);density.push(v);
  }
  const maxDensity=Math.max(0,...density);
  out+=`<g data-viz-part="series" data-viz-heat-layer="true">`;
  for(const [x,y,v] of cells){if(!maxDensity||v/maxDensity<.032)continue;const t=Math.pow(v/maxDensity,Math.max(.35,Math.min(2.7,Number(s.geoHeatGamma)||.85)));const cl=gradient(light,dark,t);
   out+=`<rect x="${(x-cellW/2).toFixed(1)}" y="${(y-cellH/2).toFixed(1)}" width="${(cellW+.6).toFixed(1)}" height="${(cellH+.6).toFixed(1)}" fill="${cl}" fill-opacity="${Math.min(.98,Math.max(.08,t*.95)).toFixed(3)}"><title>Relative kernel density: ${(t*100).toFixed(1)}% of map maximum</title></rect>`;
  }
  out+='</g>';
 }
 if(s.geoNavigationEnabled&&type!=='geo-heat')out+='</g>';
 out+='</g>';
 const reserved=locatorBox(s,b),labelCandidates=type==='geo-choropleth'?[...valuesByCountry.keys()].map(f=>{const anchor=centerMap.get(f),[x,y]=projection.contains(anchor)?projection(anchor):[NaN,NaN];return {id:canonical(f),name:f.properties.name,x,y};}):type==='geo-symbol'?pts.slice(0,2500).map(p=>{const [x,y]=projection.contains([p.lon,p.lat])?proj(p.lon,p.lat):[NaN,NaN];return {id:s.timeDomain?timeEntityKey(p.row,s):p.x,name:p.x,x,y,radius:timeRadius??Math.max(6,Math.min(75,Number(s.geoMaxRadius)||32))};}):[];
 if(s.geoNavigationEnabled&&type!=='geo-heat')out+=`<g clip-path="url(#${clipId})"><g data-map-pan-layer="">`;
 out+=mapLabels(labelCandidates.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)),s,b,{reserved:reserved?[reserved]:[]})+((s.geoNavigationEnabled&&type!=='geo-heat')?'':mapLocator(view,s,b,projection))+renderMapAnnotations(s,b,p=>projection.contains(p)?projection(p):[NaN,NaN]);
 if(s.geoNavigationEnabled&&type!=='geo-heat')out+='</g></g>';
 if(s.geoNavigationEnabled&&type!=='geo-heat')out+=mapLocator(view,s,b,projection);
 // Colour / size key outside the plotted area, within the base chart canvas.
 const legendX=b.left+5,legendY=b.bottom+19;
 if(type==='geo-choropleth')out+=renderClassLegend(classification,s,b,[light,dark],{fixed:!!s.timeDomain,overrides:[...valuesByCountry.keys()].some(f=>/^#[\da-f]{6}$/i.test(s.pointColors?.[canonical(f)]||''))});
 else if(s.geoShowLegend!==false&&type==='geo-symbol'&&s.timeDomain){out+=label(legendX,legendY+5,'Area ∝ value · fixed max: '+s.timeDomain.sizeMax.toLocaleString('en-US',{maximumFractionDigits:2}),b.T,10)+label(legendX,legendY+23,'Colour: entity · zero: no area',b.T,9);}
 else if(s.geoShowLegend!==false){const width=140,steps=16;
  for(let i=0;i<steps;i++)out+=`<rect x="${legendX+i*width/steps}" y="${legendY}" width="${width/steps+.4}" height="8" fill="${gradient(light,dark,i/(steps-1))}"/>`;
  if(type==='geo-choropleth'){out+=label(legendX,legendY+21,scaleMin.toLocaleString('en-US',{maximumFractionDigits:2}),b.T,10);out+=label(legendX+width+4,legendY+21,scaleMax.toLocaleString('en-US',{maximumFractionDigits:2}),b.T,10);}
  else if(type==='geo-heat'&&s.geoHeatMode==='hexbin'&&typeof hexMax!=='undefined'){out+=label(legendX,legendY+21,'0',b.T,10);out+=label(legendX+118,legendY+21,Number((hexMax||0).toPrecision(4)).toLocaleString('en-US'),b.T,10);out+=label(legendX,legendY+33,hexLabel,b.T,9);}
  else if(type==='geo-heat'){out+=label(legendX,legendY+21,'Low density',b.T,10);out+=label(legendX+88,legendY+21,'High',b.T,10);}
  else{const ms=markerStyle(s);out+=label(legendX,legendY+21,ms==='spike'?'Spike height ∝ value':ms==='icon'?(s.geoIconSizing==='value'?'Icon size ∝ value':'Icons mark locations'):ms==='dots'?'Dot density · see dot key':'Symbol area ∝ value',b.T,10);}
 }
 if(s.geoShowBoundaryNote===true)out+=label(b.left,Math.min(b.height-7,type==='geo-choropleth'&&s.geoShowLegend!==false?b.bottom+mapLegendHeight(s,b.pw)+8:legendY+38),'Map boundaries: Natural Earth (simplified) · country joins and coordinates are approximate',b.T,9);
 return out;
}
export function geoUnmatched(rows,s){const excluded=rows.filter(r=>!country(r[s.x])).map(r=>String(r[s.x]??''));return [...new Set(excluded)].slice(0,12);}

// Timeline domains use per-period country aggregates, not pooled multi-year totals.
export function geoTimeDomain(frames,c){if(c.type==='geo-route')return routeTimelineDomain(frames,c,getBounds(c,[]));if(['geo-choropleth','geo-symbol'].includes(c.type)&&c.geoCustom)return regionalTimeDomain(frames,c);const all=[],scores=[];for(const frame of frames){const pts=geoData(frame.rows,c,c.type);all.push(...pts);if(c.type==='geo-choropleth'){const groups=new Map();for(const p of pts){if(!groups.has(p.x))groups.set(p.x,[]);groups.get(p.x).push(p.y);}for(const values of groups.values())scores.push(grouped(values,c.aggregation));}else scores.push(...pts.map(p=>p.y));}
 let colorMin=Number.MAX_VALUE,colorMax=-Number.MAX_VALUE,sizeMax=1;for(const value of scores){if(!Number.isFinite(value))return {error:'Aggregated map values exceed the numerical range. Rescale the units.'};colorMin=Math.min(colorMin,value);colorMax=Math.max(colorMax,value);sizeMax=Math.max(sizeMax,value);}
 if(!scores.length)return {error:'No compatible map observations across the timeline.'};if(!Number.isFinite(colorMax-colorMin))return {error:'The map colour range exceeds the numerical range. Rescale the units.'};
 const classification=c.type==='geo-choropleth'?classificationModel(scores,c):null;if(classification?.error)return {error:classification.error};return {classification,view:getBounds(c,all),colorMin,colorMax,sizeMax,valid:all.length,error:''};}

export function mapEditableTargets(rows,c){
 if(isRegional(c)){const r=boundaryIndex(c);if(r.errors.length)throw Error(r.errors[0]);return [...r.map.values()].map(e=>({id:e.id,name:e.label,anchor:regionalAnchor(e.feature,r.start)}));}
 const pts=geoData(rows,c,c.type),seen=new Set();return pts.flatMap(p=>{const id=c.type==='geo-choropleth'?canonical(p.feature):c.timeEnabled?timeEntityKey(p.row,c):p.x;if(id===null||seen.has(String(id)))return [];seen.add(String(id));return [{id:String(id),name:c.type==='geo-choropleth'?p.feature.properties.name:p.x,anchor:c.type==='geo-choropleth'?centerMap.get(p.feature):[p.lon,p.lat]}];});
}

export function currentMapExtent(rows,c){if(c.type==='geo-route'&&c.timeEnabled&&c.timeField){const periods=new Map();for(const row of rows){const key=row[c.timeField];if(key===null||key===undefined||String(key).trim()==='')continue;const list=periods.get(String(key))||[];list.push(row);periods.set(String(key),list);}const d=routeTimelineDomain([...periods].map(([period,rows])=>({period,rows})),c,getBounds(c,[]));if(!d.error)return resolveMapView(d.view,c);}if(c.type==='geo-route'){const pts=routeReport(rows,c).routes.flatMap(r=>[r.from,r.to].map(([lon,lat])=>({lon,lat})));const v=resolveMapView(c.geoView==='fit'?routeFitBounds(routeReport(rows,c).routes,c):getBounds(c,pts),c),w=((v[0]+180)%360+360)%360-180;return [w,v[1],w+Math.min(360,v[2]-v[0]),v[3]];}return resolveMapView(isRegional(c)?boundaryIndex(c).bounds:getBounds(c,geoData(rows,c,c.type)),c);}

export function geoStaticClassification(rows,c){if(isRegional(c)){const r=regionalReport(rows,c);return r.errors.length?{error:r.errors[0]}:classificationModel(r.scores.map(s=>s.value),c);}const groups=new Map();for(const p of geoData(rows,c,'geo-choropleth')){if(!groups.has(p.x))groups.set(p.x,[]);groups.get(p.x).push(p.y);}return classificationModel([...groups.values()].map(v=>grouped(v,c.aggregation)),c);}
