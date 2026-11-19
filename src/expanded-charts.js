import {RESEARCH_META,RESEARCH_TYPES,researchData,researchWarnings,researchExample,renderResearch,researchAxisLabel} from './research-charts.js';
// V3.9. Shared long-format series engine and explicitly experimental views.
import {fieldType} from './data.js';
export const EXPANDED_META={
 ...RESEARCH_META,
 'grouped-bar':{name:'Grouped columns',category:'Comparison',use:'Compare series within each category using a common zero baseline.',needs:'Category, numeric value and series columns.'},
 'grouped-hbar':{name:'Grouped horizontal bars',category:'Comparison',use:'Compare multiple series when category names are long.',needs:'Category, numeric value and series columns.'},
 'stacked-hbar':{name:'Stacked horizontal bars',category:'Part-to-whole',use:'Show positive and negative contributions in horizontal stacks.',needs:'Category, numeric value and series columns.'},
 'percent-bar':{name:'100% stacked columns',category:'Part-to-whole',use:'Compare composition independently of category totals.',needs:'Category, nonnegative numeric value and series columns.'},
 'percent-hbar':{name:'100% stacked bars',category:'Part-to-whole',use:'Compare proportions with readable horizontal category labels.',needs:'Category, nonnegative numeric value and series columns.'},
 'multi-line':{name:'Multi-series lines',category:'Time & trends',use:'Compare several trajectories on one common numerical scale.',needs:'Ordered period, numeric value and series columns.'},
 'multi-area':{name:'Overlapping series areas',category:'Time & trends',use:'Compare series magnitudes with translucent fills and visible lines.',needs:'Ordered period, nonnegative numeric value and series columns.'},
 'stacked-area':{name:'Stacked areas',category:'Time & trends',use:'Show how nonnegative components contribute to a changing total.',needs:'Ordered period, nonnegative numeric value and series columns.'},
 'small-multiples':{name:'Shared-scale small multiples',category:'Time & trends',use:'Compare each series in its own panel with the same X and Y scales.',needs:'Ordered period, numeric value and series/facet columns.'},
 'evidence-lanes':{name:'Evidence lanes',category:'Experimental',use:'Inspect observations, full range, middle 50%, median and sample size together.',needs:'Group and raw numeric observations. Aggregation is not applied.'},
 'change-lens':{name:'Change lens',category:'Experimental',use:'Read before/after levels alongside their signed differences.',needs:'Category and two numeric measures in the same units; only complete pairs are used.'},
};
export const EXPANDED_TYPES=new Set(Object.keys(EXPANDED_META));
export const EXPERIMENTAL_TYPES=new Set(['evidence-lanes','change-lens','assumption-lens']);
export const SERIES_TYPES=new Set([...EXPANDED_TYPES].filter(type=>!EXPERIMENTAL_TYPES.has(type)&&!RESEARCH_TYPES.has(type)));
const present=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
const numeric=v=>present(v)&&Number.isFinite(Number(v));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeColour=(v,fallback)=>/^#[a-f0-9]{6}$/i.test(String(v))?v:fallback;
const cut=(v,max)=>String(v).length>max?String(v).slice(0,Math.max(1,max-1))+'…':String(v);
const key=(a,b)=>JSON.stringify([String(a),String(b)]);
const quantile=(a,p)=>{const at=(a.length-1)*p,lo=Math.floor(at),hi=Math.ceil(at);return a[lo]*(1-(at-lo))+a[hi]*(at-lo);};
const reducer=(values,op)=>op==='count'?values.length:op==='average'?values.reduce((a,b)=>a+b/values.length,0):op==='min'?values.reduce((a,b)=>Math.min(a,b),Infinity):op==='max'?values.reduce((a,b)=>Math.max(a,b),-Infinity):values.reduce((a,b)=>a+b,0);
function orderCategories(categories,rows,field){const kind=fieldType(rows,field);if(kind==='number')categories.sort((a,b)=>Number(a)-Number(b));else if(kind==='date')categories.sort((a,b)=>Date.parse(a)-Date.parse(b));return categories;}
export function seriesModel(rows,s){
 const buckets=new Map(),categories=[],series=[],seenCats=new Set(),seenSeries=new Set();let skipped=0;
 for(const row of rows){if(!present(row[s.x])||!present(row[s.seriesField])||(s.aggregation!=='count'&&!numeric(row[s.y]))){skipped++;continue;}
  const x=String(row[s.x]),g=String(row[s.seriesField]);if(!seenCats.has(x)){seenCats.add(x);categories.push(x);}if(!seenSeries.has(g)){seenSeries.add(g);series.push(g);}
  const id=key(x,g);if(!buckets.has(id))buckets.set(id,[]);buckets.get(id).push(s.aggregation==='count'?1:Number(row[s.y]));
 }
 if(['multi-line','multi-area','stacked-area','small-multiples'].includes(s.type))orderCategories(categories,rows,s.x);
 const cells=new Map([...buckets].map(([id,values])=>[id,{value:reducer(values,s.aggregation),count:values.length}]));
 const allCategories=categories.length,allSeries=series.length,limit=s.type==='small-multiples'?8:10;
 return {categories:categories.slice(0,40),series:series.slice(0,limit),cells,allCategories,allSeries,skipped};
}
export function evidenceModel(rows,s){const groups=new Map();let skipped=0;for(const row of rows){if(!present(row[s.x])||!numeric(row[s.y])){skipped++;continue;}const name=String(row[s.x]);if(!groups.has(name))groups.set(name,[]);groups.get(name).push(Number(row[s.y]));}
 return {groups:[...groups].slice(0,10).map(([x,values])=>{values.sort((a,b)=>a-b);return {x,y:quantile(values,.5),low:values[0],high:values.at(-1),q1:quantile(values,.25),q3:quantile(values,.75),n:values.length,values};}),allGroups:groups.size,skipped};}
export function changeModel(rows,s){const groups=new Map();let skipped=0;for(const row of rows){if(!present(row[s.x])||!numeric(row[s.y])||!numeric(row[s.endField])){skipped++;continue;}const name=String(row[s.x]);if(!groups.has(name))groups.set(name,{before:[],after:[]});const g=groups.get(name);g.before.push(Number(row[s.y]));g.after.push(Number(row[s.endField]));}
 return {groups:[...groups].slice(0,12).map(([x,g])=>{const before=reducer(g.before,s.aggregation),after=reducer(g.after,s.aggregation);return {x,y:after-before,before,after,n:g.before.length};}),allGroups:groups.size,skipped};}
export function expandedData(rows,s,type=s.type){if(RESEARCH_TYPES.has(type))return researchData(rows,s,type);s={...s,type};if(type==='evidence-lanes')return evidenceModel(rows,s).groups;if(type==='change-lens')return changeModel(rows,s).groups;const m=seriesModel(rows,s);return m.categories.flatMap(x=>m.series.flatMap(series=>{const cell=m.cells.get(key(x,series));return cell?[{x,y:cell.value,series,n:cell.count}]:[];}));}
export function expandedWarnings(rows,s,type=s.type){if(RESEARCH_TYPES.has(type))return researchWarnings(rows,s,type);
 const warnings=[],cfg={...s,type};
 if(type==='evidence-lanes'){const m=evidenceModel(rows,cfg);if(m.allGroups>10)warnings.push(`Showing the first 10 of ${m.allGroups} groups; filter before publishing.`);if(m.groups.some(g=>g.n>180))warnings.push('Observation marks are deterministically sampled to at most 180 per lane, retaining endpoints; summaries use every valid observation.');if(m.skipped)warnings.push(`${m.skipped} rows have a missing group or nonnumeric observation and are excluded.`);warnings.push('Experimental: the band is the middle 50% of observations, not a confidence interval.');if(!m.groups.length)warnings.push('No valid observations. Choose group and numeric observation fields.');return warnings;}
 if(type==='change-lens'){const m=changeModel(rows,cfg);if(m.allGroups>12)warnings.push(`Showing the first 12 of ${m.allGroups} categories; filter before publishing.`);if(m.skipped)warnings.push(`${m.skipped} incomplete/nonnumeric pairs are excluded from both measures.`);if(s.aggregation==='count')warnings.push('Count is not meaningful for before/after magnitudes. Choose Sum, Average, Minimum or Maximum.');warnings.push('Experimental: before and after must share units. Difference is after minus before; no causal inference is made.');if(!m.groups.length)warnings.push('No complete numeric before/after pairs.');return warnings;}
 const m=seriesModel(rows,cfg);if(!m.categories.length||!m.series.length)warnings.push('Choose a category, numeric value and a distinct series column.');
 if(m.allCategories>40)warnings.push(`Showing the first 40 of ${m.allCategories} categories; filter before publishing.`);
 const limit=type==='small-multiples'?8:10;if(m.allSeries>limit)warnings.push(`Showing the first ${limit} of ${m.allSeries} series; filter before publishing.`);
 if(m.skipped)warnings.push(`${m.skipped} rows have missing categories/series or nonnumeric values and are excluded.`);
 if(['percent-bar','percent-hbar','stacked-area','stacked-hbar'].includes(type)&&m.categories.some(x=>{const vals=m.series.map(g=>m.cells.get(key(x,g))?.value||0);return !Number.isFinite(vals.filter(v=>v>=0).reduce((a,b)=>a+b,0))||!Number.isFinite(vals.filter(v=>v<0).reduce((a,b)=>a+b,0));}))warnings.push('Stack totals exceed the numerical range; rescale the values.');
 const values=[...m.cells.values()].map(c=>c.value);if(values.some(v=>!Number.isFinite(v)))warnings.push('Aggregation exceeds the numerical range. Rescale the values or choose Average.');
 if(['percent-bar','percent-hbar','multi-area','stacked-area'].includes(type)&&values.some(v=>v<0))warnings.push('This composition requires nonnegative aggregated values. Choose grouped bars or multi-series lines for signed data.');
 if(type.startsWith('percent')){warnings.push('Shares use only displayed series within each category. Zero-total categories have no defined percentages.');if(s.yMin!=null||s.yMax!=null)warnings.push('100% charts use a fixed 0–100% axis; manual bounds are ignored.');}
 if(['multi-line','multi-area','stacked-area','small-multiples'].includes(type)&&fieldType(rows,s.x)==='category')warnings.push('Categorical X values use input order. Confirm that this order is meaningful.');
 if(type==='stacked-area')warnings.push('Absent category–series combinations are treated as zero; use lines when missingness means unknown.');
 if(['multi-line','multi-area','small-multiples'].includes(type)&&m.categories.some(x=>m.series.some(g=>!m.cells.has(key(x,g)))))warnings.push('Missing category–series combinations appear as gaps, not interpolated values.');
 if(['stacked-area','stacked-hbar'].includes(type)&&s.aggregation!=='sum')warnings.push(`Stacking ${s.aggregation} values may not produce meaningful totals.`);
 if(s.yMin!=null||s.yMax!=null)warnings.push('Series templates use a common automatic scale so groups remain comparable; manual bounds are ignored.');
 return warnings;
}
export function expandedExample(type){const research=researchExample(type);if(research)return research;
 if(!EXPANDED_TYPES.has(type))return null;
 if(type==='evidence-lanes')return {rows:Array.from({length:90},(_,i)=>({Cohort:['Workshop A','Workshop B','Workshop C'][i%3],Score:Math.round(45+(i%3)*12+13*Math.sin(i*1.71)+7*Math.cos(i*.37))})),x:'Cohort',y:'Score'};
 if(type==='change-lens')return {rows:[{Team:'Design',Before:42,After:67},{Team:'Research',Before:71,After:63},{Team:'Support',Before:53,After:58},{Team:'Operations',Before:0,After:24},{Team:'Teaching',Before:65,After:65}],x:'Team',y:'Before',endField:'After'};
 return {rows:['2021','2022','2023','2024','2025'].flatMap((year,i)=>['North','South','East'].map((region,j)=>({Year:Number(year),Region:region,Revenue:[28,24,19][j]+i*[7,4,6][j]+(i===2&&j===1?-8:0)}))),x:'Year',y:'Revenue',seriesField:'Region'};
}
function range(values,zero=true){let lo=zero?0:Infinity,hi=zero?0:-Infinity;for(const value of values){if(Number.isFinite(value)){lo=Math.min(lo,value);hi=Math.max(hi,value);}}if(!Number.isFinite(lo)){lo=0;hi=1;}if(lo===hi){const v=lo,d=Math.abs(lo)*.1||1;lo=Number.isFinite(v-d)?v-d:v;hi=Number.isFinite(v+d)?v+d:v;}const span=hi-lo;if(span>1e-200&&span<1e300){const raw=span/4,unit=10**Math.floor(Math.log10(raw)),fraction=raw/unit,step=(fraction<=1?1:fraction<=2?2:fraction<=2.5?2.5:fraction<=5?5:10)*unit;return {lo:Math.floor(lo/step)*step,hi:Math.ceil(hi/step)*step,step};}const paddedLo=lo<0?lo-span*.04:lo,paddedHi=hi+span*.06;return {lo:Number.isFinite(paddedLo)?paddedLo:lo,hi:Number.isFinite(paddedHi)?paddedHi:hi};}
function scaleTicks(sc){if(sc.step){const n=Math.min(12,Math.round((sc.hi-sc.lo)/sc.step));return Array.from({length:n+1},(_,i)=>Number((sc.lo+i*sc.step).toPrecision(12)));}return Array.from({length:5},(_,i)=>sc.lo+(sc.hi-sc.lo)*(i/4));}
export function renderExpanded(type,rows,s,b){if(RESEARCH_TYPES.has(type))return renderResearch(type,rows,s,b);
 const {left,right,top,bottom,pw,ph,C,T,G,B,font,format}=b;
 const axisSize=Math.max(8,Math.min(32,Number(s.axisFontSize)||Number(s.labelSize)||12)),legendSize=Math.max(9,Math.min(30,Number(s.legendFontSize)||12));
 const customPalette=Array.isArray(s.palette)?s.palette.filter(v=>/^#[0-9a-f]{6}$/i.test(v)):[],palette=customPalette.length>=2?customPalette:[C,safeColour(s.secondary,'#f2aa64'),'#5779a3','#a56ca1','#54a69a','#bd7c69','#7a92aa','#9b984b','#ba6f84','#65885e'];
 const text=(x,y,v,extra='',size=s.labelSize||12)=>`<text x="${x}" y="${y}" fill="${T}" font-family="${font}" font-size="${Math.max(8,Math.min(32,size))}" ${extra}>${esc(v)}</text>`;
 const line=(x1,y1,x2,y2,colour=G,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colour}" ${extra}/>`;
 const fmt=v=>format(v),point=(id,title,content)=>`<g data-viz-part="point" data-viz-key="${esc(encodeURIComponent(id))}"><title>${esc(title)}</title>${content}</g>`;
 let out='';const checked=expandedData(rows,s,type).flatMap(p=>type==='evidence-lanes'?[p.low,p.high,p.y,p.q1,p.q3]:type==='change-lens'?[p.before,p.after,p.y]:[p.y]);if(checked.some(v=>!Number.isFinite(v))||checked.length&&(!Number.isFinite(Math.max(...checked)-Math.min(...checked))))return text(left,top+25,'Values exceed the safe display range. Rescale the units.','',11);
 if(type==='evidence-lanes'){
  const m=evidenceModel(rows,s),sc=range(m.groups.flatMap(g=>[g.low,g.high]),false),xx=v=>left+(v-sc.lo)/(sc.hi-sc.lo)*pw,step=ph/Math.max(1,m.groups.length);
  for(const v of scaleTicks(sc)){const x=xx(v);if(s.showGrid)out+=line(x,top,x,bottom);if(s.showAxes)out+=text(x,bottom+20,fmt(v),'text-anchor="middle"',axisSize);}
  for(const [i,g] of m.groups.entries()){const y=top+(i+.5)*step,cl=safeColour(s.pointColors?.[g.x],palette[i%palette.length]);let marks=line(xx(g.low),y,xx(g.high),y,cl,'stroke-width="1.5"')+`<rect x="${xx(g.q1)}" y="${y-10}" width="${Math.max(0,xx(g.q3)-xx(g.q1))}" height="20" fill="${cl}" fill-opacity=".25"/>`;
   const samples=g.values.length<=180?g.values:Array.from({length:180},(_,j)=>g.values[Math.round(j*(g.n-1)/179)]);
   for(const [j,v] of samples.entries())marks+=`<circle cx="${xx(v)}" cy="${y+((j*7)%9-4)*1.5}" r="2" fill="${cl}" fill-opacity=".48"><title>${esc(g.x)}: ${esc(fmt(v))}</title></circle>`;
   marks+=`<circle cx="${xx(g.y)}" cy="${y}" r="4" fill="${B}" stroke="${cl}" stroke-width="2"/>`;out+=point(g.x,`${g.x}: n=${g.n}; min ${fmt(g.low)}; Q1 ${fmt(g.q1)}; median ${fmt(g.y)}; Q3 ${fmt(g.q3)}; max ${fmt(g.high)}`,marks);
   if(s.showLabels)out+=text(xx(g.y),y-16,fmt(g.y),'text-anchor="middle" data-viz-part="labels"',s.labelSize||12);out+=text(left-9,y+4,cut(g.x,14),'text-anchor="end"',10)+text(right-4,y-13,`n=${g.n}${g.n>180?' · sampled marks':''}`,'text-anchor="end"',10);
  }out+=text(left,bottom+39,'Range · middle 50% band · observations · median · n = valid observations','',9);return out;
 }
 if(type==='change-lens'){
  const m=changeModel(rows,s);if(s.aggregation==='count')return text(left,top+30,'Choose a magnitude calculation rather than Count.');const sc=range(m.groups.flatMap(g=>[g.before,g.after]),false),half=pw*.56,gap=pw*.09,dx=left+half+gap,dw=pw-half-gap,max=Math.max(1,...m.groups.map(g=>Math.abs(g.y))),xx=v=>left+(v-sc.lo)/(sc.hi-sc.lo)*half,delta=v=>dx+dw/2+v/max*dw*.45,step=(ph-26)/Math.max(1,m.groups.length),laneTop=top+26;
  out+=text(left,top+9,`${s.y} → ${s.endField}`,'',10)+text(dx,top+9,'Change (after − before)','',10)+line(delta(0),laneTop,delta(0),bottom,T);
  for(const [i,g] of m.groups.entries()){const y=laneTop+(i+.5)*step,cl=safeColour(s.pointColors?.[g.x],C),bar=`<rect x="${Math.min(delta(0),delta(g.y))}" y="${y-7}" width="${Math.abs(delta(g.y)-delta(0))}" height="14" fill="${cl}" fill-opacity="${g.y<0?.4:.85}"/>`,marks=line(xx(g.before),y,xx(g.after),y,cl,'stroke-width="2"')+`<circle cx="${xx(g.before)}" cy="${y}" r="4" fill="${B}" stroke="${cl}" stroke-width="2"/><circle cx="${xx(g.after)}" cy="${y}" r="4" fill="${cl}"/>`+bar;
   if(s.showLabels&&step>=42)out+=text(xx(g.before),y-11,fmt(g.before),'text-anchor="middle" data-viz-part="labels"',s.labelSize||12)+text(xx(g.after),y+18,fmt(g.after),'text-anchor="middle" data-viz-part="labels"',s.labelSize||12);out+=point(g.x,`${g.x}: before ${fmt(g.before)}; after ${fmt(g.after)}; change ${fmt(g.y)}; complete pairs n=${g.n}`,marks)+text(left-9,y+4,cut(g.x,14),'text-anchor="end"',10)+text(delta(g.y)+(g.y>=0?5:-5),y-11,fmt(g.y),`text-anchor="${g.y>=0?'start':'end'}"`,10);
  }for(const v of scaleTicks(sc))out+=text(xx(v),bottom+20,fmt(v),'text-anchor="middle"',axisSize);out+=text(delta(0),bottom+20,'0','text-anchor="middle"',10);out+=text(left,bottom+39,'Hollow = before · filled = after · both measures must use the same units','',9);return out;
 }
 const m=seriesModel(rows,{...s,type}),cats=m.categories,series=m.series,values=cats.flatMap(x=>series.map(g=>m.cells.get(key(x,g))?.value).filter(v=>v!==undefined));
 const nonnegative=['percent-bar','percent-hbar','multi-area','stacked-area'].includes(type);
 if(nonnegative&&values.some(v=>v<0))return text(left,top+30,'Negative values: use grouped bars or multi-series lines.');
 const percent=type.startsWith('percent'),horizontal=['grouped-hbar','stacked-hbar','percent-hbar'].includes(type),stacked=['stacked-hbar','percent-bar','percent-hbar','stacked-area'].includes(type),small=type==='small-multiples';
 const totals=cats.map(x=>series.reduce((sum,g)=>sum+(m.cells.get(key(x,g))?.value||0),0));
 const extremes=type==='stacked-hbar'?cats.flatMap(x=>[series.reduce((sum,g)=>sum+Math.max(0,m.cells.get(key(x,g))?.value||0),0),series.reduce((sum,g)=>sum+Math.min(0,m.cells.get(key(x,g))?.value||0),0)]):stacked?totals:values;
 if(extremes.some(v=>!Number.isFinite(v))||stacked&&totals.some(v=>!Number.isFinite(v)))return text(left,top+25,'Values exceed the safe display range. Rescale the units.','',11);
 const sc=percent?{lo:0,hi:1}:range(extremes),valueText=v=>percent?`${Math.round(v*100)}%`:fmt(v);
 // Wrap legend rows without squeezing entries into a single line.
 const legendCols=Math.max(1,Math.floor(pw/120)),legendRows=Math.ceil(series.length/legendCols),legendH=s.showLegend!==false&&!small?legendRows*18+8:0,plotTop=top+legendH,plotH=Math.max(24,bottom-plotTop);
 const colour=g=>palette[series.indexOf(g)%palette.length];
 if(legendH)series.forEach((g,j)=>{const x=left+(j%legendCols)*pw/legendCols,y=top+Math.floor(j/legendCols)*18;out+=`<g><title>${esc(g)}</title><rect x="${x}" y="${y}" width="9" height="9" fill="${colour(g)}"/>`+text(x+13,y+9,cut(g,16),'',legendSize)+'</g>';});
 const drawAxes=(l,t,w,h)=>{let svg='';for(const v of scaleTicks(sc)){if(horizontal){const x=l+(v-sc.lo)/(sc.hi-sc.lo)*w;if(s.showGrid)svg+=line(x,t,x,t+h);if(s.showAxes&&s.showXAxis!==false)svg+=text(x,t+h+20,valueText(v),'text-anchor="middle"',axisSize);}else{const y=t+h-(v-sc.lo)/(sc.hi-sc.lo)*h;if(s.showGrid)svg+=line(l,y,l+w,y);if(s.showAxes&&s.showYAxis!==false)svg+=text(l-8,y+4,valueText(v),'text-anchor="end"',axisSize);}}return svg;};
 const categoriesLabels=(l,t,w,h)=>{let svg='';const stride=Math.max(1,Math.ceil(cats.length/Math.max(2,Math.floor((horizontal?h:w)/70))));cats.forEach((x,i)=>{if(i%stride!==0)return;if(horizontal){if(s.showAxes&&s.showYAxis!==false)svg+=text(l-8,t+(i+.5)*h/cats.length+4,cut(x,16),'text-anchor="end"',axisSize);}else if(s.showAxes&&s.showXAxis!==false)svg+=text(l+(i+.5)*w/cats.length,t+h+20,cut(x,12),'text-anchor="middle"',axisSize);});return svg;};
 const ordered=['multi-line','multi-area','stacked-area','small-multiples'].includes(type),kind=fieldType(rows,s.x),continuous=ordered&&['number','date'].includes(kind),asNumber=x=>kind==='date'?Date.parse(x):Number(x),first=asNumber(cats[0]),last=asNumber(cats.at(-1));
 const xpos=(i,l,w)=>continuous&&last!==first?l+(asNumber(cats[i])-first)/(last-first)*w:l+(i+.5)*w/cats.length;
 const chartLines=(l,t,w,h,only=null)=>{let svg='',yy=v=>t+h-(v-sc.lo)/(sc.hi-sc.lo)*h;const stacks=new Map(cats.map(x=>[x,0]));
 for(const g of only?[only]:series){let segment=[],lower=[];const flush=()=>{if(!segment.length)return;const d=segment.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(' ');const cl=colour(g);if(['multi-area','stacked-area'].includes(type)){const reverse=(type==='stacked-area'?lower:[...segment.map(([x])=>[x,yy(0)])]).slice().reverse();svg+=`<path d="${d} ${reverse.map(([x,y])=>`L${x},${y}`).join(' ')} Z" fill="${cl}" fill-opacity="${type==='stacked-area'?.65:.18}" data-viz-part="series" pointer-events="none"/>`;}svg+=`<path d="${d}" fill="none" stroke="${cl}" stroke-width="${Math.max(1,Math.min(10,Number(s.lineWidth)||2))}" data-viz-part="series"><title>${esc(g)}</title></path>`;segment=[];lower=[];};
  cats.forEach((x,i)=>{const cell=m.cells.get(key(x,g));if(!cell&&type!=='stacked-area'){flush();return;}const v=cell?.value||0,base=type==='stacked-area'?stacks.get(x):0,px=xpos(i,l,w),py=yy(base+v);segment.push([px,py]);lower.push([px,yy(base)]);if(type==='stacked-area')stacks.set(x,base+v);if(cell)svg+=point(key(x,g),`${x} / ${g}: ${fmt(v)}; n=${cell.count}`,`<circle cx="${px}" cy="${py}" r="${Math.max(2,Math.min(6,Number(s.pointSize)||3))}" fill="${safeColour(s.pointColors?.[key(x,g)],colour(g))}" stroke="${B}" stroke-width="1"/>`);if(cell&&s.showLabels&&cats.length*series.length<=60)svg+=text(px,py-8,fmt(v),'text-anchor="middle" data-viz-part="labels"',s.labelSize||12);});flush();}
 return svg;};
 const lineLabels=(l,t,w,h)=>{let svg='';const stride=Math.max(1,Math.ceil(cats.length/Math.max(2,Math.floor(w/70))));if(s.showAxes&&s.showXAxis!==false)cats.forEach((x,i)=>{if(i%stride===0||i===cats.length-1)svg+=text(xpos(i,l,w),t+h+20,cut(x,12),'text-anchor="middle"',axisSize);});return svg;};
 if(small){const cols=pw<260?1:2,rowsN=Math.ceil(series.length/cols),gapX=48,gapY=32,w=(pw-gapX*(cols-1))/cols,h=(plotH-gapY*(rowsN-1)-14*rowsN)/rowsN;if(h<35)return text(left,plotTop+28,'Increase canvas height or filter to fewer facets.','',11);series.forEach((g,j)=>{const l=left+(j%cols)*(w+gapX),t=plotTop+14+Math.floor(j/cols)*(h+gapY+14);out+=`<g data-viz-facet="${esc(g)}" data-viz-shared-scale="${sc.lo},${sc.hi}">`+text(l,t-8,cut(g,30),'font-weight="600"',11)+drawAxes(l,t,w,h)+chartLines(l,t,w,h,g)+lineLabels(l,t,w,h)+'</g>';});return out;}
 out+=drawAxes(left,plotTop,pw,plotH);
 if(ordered){out+=chartLines(left,plotTop,pw,plotH)+lineLabels(left,plotTop,pw,plotH);return out;}
 out+=categoriesLabels(left,plotTop,pw,plotH);
 cats.forEach((x,i)=>{const step=(horizontal?plotH:pw)/cats.length,groupStart=(horizontal?plotTop:left)+i*step+step*.12,groupSize=step*.76,total=totals[i];let positive=0,negative=0;
  series.forEach((g,j)=>{const cell=m.cells.get(key(x,g));if(!cell)return;let v=cell.value;if(percent){if(total<=0)return;v/=total;}
   const base=stacked?(v>=0?positive:negative):0;if(stacked){if(v>=0)positive+=v;else negative+=v;}
   const a=base,bv=base+v,scale=val=>(val-sc.lo)/(sc.hi-sc.lo),cl=safeColour(s.pointColors?.[key(x,g)],colour(g));let shape;
   if(horizontal){const x1=left+scale(a)*pw,x2=left+scale(bv)*pw,y=groupStart+(stacked?0:j*groupSize/series.length),h=stacked?groupSize:groupSize/series.length*.9;shape=`<rect x="${Math.min(x1,x2)}" y="${y}" width="${Math.abs(x2-x1)}" height="${h}" fill="${cl}"/>`;if(v===0)shape=line(x1,y,x1,y+h,cl,'stroke-width="2"');}
   else{const y1=plotTop+plotH-scale(a)*plotH,y2=plotTop+plotH-scale(bv)*plotH,px=groupStart+(stacked?0:j*groupSize/series.length),w=stacked?groupSize:groupSize/series.length*.9;shape=`<rect x="${px}" y="${Math.min(y1,y2)}" width="${w}" height="${Math.abs(y1-y2)}" fill="${cl}"/>`;if(v===0)shape=line(px,y1,px+w,y1,cl,'stroke-width="2"');}
   out+=point(key(x,g),`${x} / ${g}: ${fmt(cell.value)}${percent?`; ${(v*100).toFixed(1)}% of displayed total ${fmt(total)}`:''}; n=${cell.count}`,shape);
   if(s.showLabels){if(horizontal&&(!stacked||Math.abs(v)/(sc.hi-sc.lo)*pw>45)){const px=left+scale(base+v)*pw,py=groupStart+(stacked?groupSize/2:(j+.5)*groupSize/series.length);out+=text(px+(v>=0?4:-4),py+4,percent?`${(v*100).toFixed(0)}%`:fmt(cell.value),`text-anchor="${v>=0?'start':'end'}"`,10);}else if(!horizontal&&(!stacked||Math.abs(v)/(sc.hi-sc.lo)*plotH>22)){const px=groupStart+(stacked?groupSize/2:(j+.5)*groupSize/series.length),py=plotTop+plotH-scale(base+v)*plotH;out+=text(px,py-5,percent?`${(v*100).toFixed(0)}%`:fmt(cell.value),'text-anchor="middle"',10);}}
  });if(percent&&total===0)out+=horizontal?text(left+pw*.5,groupStart+groupSize*.6,'No positive total','text-anchor="middle"',10):text(left+(i+.5)*pw/cats.length,plotTop+plotH*.5,'No total','text-anchor="middle"',9);
 });return out;
}

export function expandedAxisLabel(s,type,axis){if(RESEARCH_TYPES.has(type))return researchAxisLabel(s,type,axis);const horizontal=['grouped-hbar','stacked-hbar','percent-hbar','evidence-lanes','change-lens'].includes(type);if(axis==='x')return horizontal?(type==='percent-hbar'?'Share':type==='change-lens'?`${s.y} / ${s.endField} (same units)`:s.y):s.x;return horizontal?s.x:type==='percent-bar'?'Share':s.y;}
