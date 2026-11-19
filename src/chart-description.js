// V3.60 automatic chart descriptions. Plain-language summaries built from the plotted values only
// (no AI, no guessing): what the chart shows, the largest and smallest values, the overall change for
// ordered data and the direction of a relationship for scatter plots. Used for the SVG <desc> that
// screen readers announce, the "Suggested description" in Accessible design and published pages.
const fmt=v=>{if(!Number.isFinite(v))return String(v);const a=Math.abs(v);return a>=1e9?(v/1e9).toLocaleString('en',{maximumFractionDigits:1})+' billion':a>=1e6?(v/1e6).toLocaleString('en',{maximumFractionDigits:1})+' million':v.toLocaleString('en',{maximumFractionDigits:a<10?2:a<1000?1:0});};
const ORDERED=/^(year|yr|date|month|quarter|period|week|day|time|season|wave)/i;
const isOrdered=(pts,s)=>ORDERED.test(String(s.x||''))||pts.length>2&&pts.every(p=>/^\d{4}([-/]\d{1,2}){0,2}$/.test(String(p.x).trim())||/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(String(p.x).trim())||/^q[1-4]/i.test(String(p.x).trim()));
const CATEGORY=new Set(['bar','hbar','dot','donut','pie','waffle','treemap','lollipop','funnel','wordcloud','parliament','gauge','kpi','number-ticker','poll','geo-choropleth','geo-symbol','tile-map','circle-pack','bullet','marimekko']);
const NO_TOTAL=new Set(['geo-choropleth','tile-map','kpi','number-ticker','gauge','bullet','poll','dot','lollipop']);
const SKIP=new Set(['quiz','profile-cards','countdown','tree','sankey','network','chord','arc-diagram','editorial-table','timeline','gantt']);
export function describePoints(pts,s,typeName='Chart'){
 const label=`${typeName}${s.y&&s.x?` of ${s.y} by ${s.x}`:''}`;
 if(SKIP.has(s.type))return `${typeName}${s.x?` of ${s.x}`:''}.`;
 if(!Array.isArray(pts)||!pts.length)return `${label}.`;
 if(s.type==='scatter'||s.type==='bubble'){const xs=pts.map(p=>Number(p.x)),ys=pts.map(p=>Number(p.y)),ok=xs.map((x,i)=>Number.isFinite(x)&&Number.isFinite(ys[i]));const X=xs.filter((_,i)=>ok[i]),Y=ys.filter((_,i)=>ok[i]),n=X.length;if(n<3)return `${label}; ${n} points.`;const mx=X.reduce((a,b)=>a+b,0)/n,my=Y.reduce((a,b)=>a+b,0)/n;let sxy=0,sxx=0,syy=0;for(let i=0;i<n;i++){sxy+=(X[i]-mx)*(Y[i]-my);sxx+=(X[i]-mx)**2;syy+=(Y[i]-my)**2;}const r=sxx&&syy?sxy/Math.sqrt(sxx*syy):0,strength=Math.abs(r)>=.7?'strong':Math.abs(r)>=.4?'moderate':Math.abs(r)>=.2?'weak':'no clear';return `${label}; ${n} points. ${strength==='no clear'?'There is no clear relationship':`There is a ${strength} ${r>0?'positive':'negative'} relationship`} between ${s.x} and ${s.y} (r = ${r.toFixed(2)}).`;}
 // Group series if present (multi-series charts): describe totals by series.
 const vals=pts.map(p=>({x:String(p.x??''),y:Number(p.y),series:p.series??p.group})).filter(p=>Number.isFinite(p.y));if(!vals.length)return `${label}.`;
 const series=new Set(vals.map(v=>v.series).filter(v=>v!==undefined&&v!==null&&v!==''));
 if(series.size>1){const tot=new Map();for(const v of vals)tot.set(v.series,(tot.get(v.series)||0)+v.y);const sorted=[...tot].sort((a,b)=>b[1]-a[1]);return `${label}, ${series.size} series across ${new Set(vals.map(v=>v.x)).size} categories. ${sorted[0][0]} has the largest total (${fmt(sorted[0][1])})${sorted.length>1?` and ${sorted.at(-1)[0]} the smallest (${fmt(sorted.at(-1)[1])})`:''}.`;}
 if(isOrdered(vals,s)&&!CATEGORY.has(s.type)||['line','area','multi-line','stacked-area','slope','bump'].includes(s.type)&&vals.length>1){const first=vals[0],last=vals.at(-1),peak=vals.reduce((a,b)=>b.y>a.y?b:a),low=vals.reduce((a,b)=>b.y<a.y?b:a),ch=first.y!==0?(last.y-first.y)/Math.abs(first.y)*100:NaN,dir=last.y>first.y?'rises':last.y<first.y?'falls':'is unchanged';return `${label}, ${vals.length} periods from ${first.x} to ${last.x}. ${s.y||'The value'} ${dir} from ${fmt(first.y)} to ${fmt(last.y)}${Number.isFinite(ch)&&dir!=='is unchanged'?` (${ch>0?'+':''}${ch.toFixed(Math.abs(ch)<10?1:0)}%)`:''}. The highest value is ${fmt(peak.y)} (${peak.x})${low!==peak?` and the lowest ${fmt(low.y)} (${low.x})`:''}.`;}
 const sorted=[...vals].sort((a,b)=>b.y-a.y),top=sorted[0],bottom=sorted.at(-1),total=vals.reduce((a,b)=>a+b.y,0),share=['pie','donut','waffle','treemap','marimekko','parliament'].includes(s.type)&&total>0;
 if(vals.length===1)return `${label}: ${top.x?top.x+' ':''}${fmt(top.y)}.`;
 let out=`${label}, ${vals.length} ${['geo-choropleth','geo-symbol','tile-map'].includes(s.type)?'places':isOrdered(vals,s)?'periods':'categories'}. ${top.x} is highest (${fmt(top.y)}${share?`, ${Math.round(top.y/total*100)}% of the total`:''})`;
 if(sorted.length>2)out+=`, followed by ${sorted[1].x} (${fmt(sorted[1].y)})`;
 out+=`; ${bottom.x} is lowest (${fmt(bottom.y)}).`;
 if(share||s.aggregation==='sum'&&vals.every(v=>v.y>=0)&&!NO_TOTAL.has(s.type))out+=` The total is ${fmt(total)}.`;
 return out;
}
