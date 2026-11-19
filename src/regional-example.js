import {normalizeBoundaryAsset} from './regional-map.js';
const rect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]];
export function regionalExample(){
 const f=(code,name,coordinates,type='Polygon')=>({type:'Feature',id:code,properties:{code,name},geometry:{type,coordinates}});
 const geojson={type:'FeatureCollection',features:[f('A','Harbour',[rect(172,-43,1.2,1.2),rect(172.35,-42.65,.35,.35)]),f('B','Ranges',[rect(173.2,-43,1.2,1.2)]),f('C','Plains',[rect(172,-41.8,1.2,1.2)]),f('D','Coast',[[rect(173.2,-41.8,1.2,1.2)],[rect(174.7,-41.5,.45,.45)]],'MultiPolygon'),f('E','Northern district',[rect(172.6,-40.6,1.2,.8)])]};
 const asset=normalizeBoundaryAsset(geojson,{name:'Illustrative districts.geojson',credit:'OpenViz illustrative geometry; not real administrative boundaries'}),rows=[2020,2023,2025].flatMap((Year,i)=>['A','B','C','D','E'].flatMap((Region,j)=>i===1&&Region==='E'?[]:[{Year,Region,Value:Region==='B'&&i===0?0:15+j*9+i*(7-j)}]));rows.push({Year:2020,Region:'A',Value:5},{Year:2025,Region:'UNKNOWN',Value:42});
 return {asset,geojson,rows,settings:{type:'geo-choropleth',x:'Region',y:'Value',geoCustom:asset,geoBoundaryKey:'code',geoBoundaryLabel:'name',geoJoinMode:'exact',geoShowBoundaryNote:true,timeEnabled:true,timeField:'Year',timeIndex:0,title:'Illustrative regional comparison',subtitle:'Made-up districts and values · not administrative boundaries',height:640,sourceNote:'Illustrative data; one unmatched source key'}};
}

export function regionalAuthoredSettings(symbol=false){return {geoShowLabels:true,geoShowLocator:true,geoLabelPositions:{A:{x:.15,y:.72,hidden:false}},geoSymbolAnchors:symbol?{A:{lon:172.2,lat:-42.1}}:{},geoAnnotations:[{text:'Illustrative map callout',lon:173.8,lat:-41.2,x:.78,y:.15}]};}
export function regionalClassifiedExample(){const ex=regionalExample();ex.rows=ex.rows.map(r=>r.Region==='A'&&r.Year===2020?{...r,Value:r.Value===5?-3:-12}:r.Region==='UNKNOWN'?{...r,Value:9999}:r);return ex;}

/** Fictional skewed values; original boundary geometry and missing-region pattern retained. */
export function regionalScaleExample(scale='symlog'){
 const ex=regionalExample(),values=scale==='log'?[1,10,100,1000,10000]:[-1000,-10,0,10,1000];
 ex.rows=ex.rows.map(r=>({...r,Value:r.Region==='UNKNOWN'?999999:values['ABCDE'.indexOf(r.Region)]*[1,2,5][[2020,2023,2025].indexOf(r.Year)]}));
 ex.settings={...ex.settings,geoScaleType:scale,geoSymlogConstant:10,geoColorMode:scale==='symlog'?'diverging':'sequential',geoMidpoint:0,geoDivergingRange:'symmetric',title:scale==='log'?'Positive values · logarithmic map':'Signed values · symmetric-log map',subtitle:'Fictional skewed values · original units retained'};return ex;
}
