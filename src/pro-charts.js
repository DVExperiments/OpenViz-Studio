import {labelPicker,labelPlacer} from './labels.js';
import {EXTRA_META,EXTRA_OPTIONS,EXTRA_TYPES,extraFieldSpecs,extraData,extraWarnings,renderExtra,extraExample} from './pro-charts-v360.js';
// V3.53 professional chart families.
// Each type follows the existing renderer contract: proData() supplies the
// compatibility check, proWarnings() discloses exclusions, renderPro() draws
// inside the plot box that buildChart() has already laid out.
// No values are invented: missing/nonnumeric observations are excluded and disclosed.

export const PRO_META = {
 ...EXTRA_META,
 pie:{name:'Pie chart',category:'Part-to-whole',use:'Show how a small number of categories share one positive total.',needs:'Category and a nonnegative measure.',example:'Household budget split',tags:['pie','share','composition','percentage','proportion'],aggregates:true},
 waffle:{name:'Waffle chart',category:'Part-to-whole',use:'Show shares as countable squares out of 100 — easier to read than pies.',needs:'Category and a nonnegative measure.',example:'How commuters travel to work',tags:['waffle','grid','pictogram','share','percentage','unit'],aggregates:true},
 marimekko:{name:'Marimekko chart',category:'Part-to-whole',use:'Compare category totals (width) and their composition (height) at once.',needs:'Category, segment and nonnegative measure.',example:'Market share by region and brand',tags:['mekko','mosaic','variable width','composition','market'],aggregates:true},
 'circle-pack':{name:'Circle packing',category:'Hierarchy',use:'Show nested groups as packed circles sized by value.',needs:'Group and positive measure; optional subgroup.',example:'Budget by department and team',tags:['bubbles','hierarchy','packed','nested','circles'],aggregates:true},
 combo:{name:'Column + line combo',category:'Comparison',use:'Show two related measures together, such as volume as columns and a rate as a line.',needs:'Category/period, a column measure and a line measure; optional second axis.',example:'Monthly sales and margin',tags:['combo','dual axis','dual-axis','column','line','mixed','pareto'],aggregates:true},
 lollipop:{name:'Lollipop chart',category:'Comparison',use:'Rank categories with lighter ink than bars.',needs:'Category and a numerical measure.',example:'Customer satisfaction by store',tags:['lollipop','rank','stem','dot'],aggregates:true},
 'split-bars':{name:'Split bars',category:'Comparison',use:'Compare several measures side by side, each in its own column of bars.',needs:'Category, series (one panel each) and a numerical measure.',example:'Survey results by age group',tags:['split','panels','table','bars','side by side'],aggregates:true},
 'range-plot':{name:'Range plot (dumbbell)',category:'Comparison',use:'Show the gap between two values for each category.',needs:'Category and two numerical measures in the same units.',example:'Pay gap by occupation',tags:['dumbbell','range','gap','connected dot','before after'],aggregates:true},
 'arrow-plot':{name:'Arrow plot',category:'Time & trends',use:'Show the direction and size of change between two values.',needs:'Category, a start measure and an end measure in the same units.',example:'Change in life expectancy, 2000 → 2020',tags:['arrow','change','before after','direction','delta'],aggregates:true},
 bullet:{name:'Bullet chart',category:'Financial & specialised',use:'Compare actual performance against targets.',needs:'Label, actual measure; optional target and range maximum.',example:'Sales against quarterly target',tags:['bullet','target','kpi','progress','goal','performance'],aggregates:true},
 gauge:{name:'Gauge',category:'Financial & specialised',use:'Show a single value within a known range, optionally against a target.',needs:'Numerical measure; optional label for several gauges and a target.',example:'Customer satisfaction score',tags:['gauge','dial','meter','speedometer','kpi','progress'],aggregates:true},
 kpi:{name:'Number cards (KPI)',category:'Financial & specialised',use:'Headline big numbers with change against a comparison value.',needs:'Numerical measure; optional label and comparison measure.',example:'Quarterly business headlines',tags:['kpi','big number','card','scorecard','ticker','metric','ban'],aggregates:true},
 funnel:{name:'Funnel chart',category:'Financial & specialised',use:'Show how a quantity falls through ordered stages.',needs:'Ordered stages and a nonnegative measure.',example:'Website visitors to customers',tags:['funnel','conversion','pipeline','stages','drop-off'],aggregates:true},
 candlestick:{name:'Candlestick chart',category:'Financial & specialised',use:'Show open, high, low and close values for each period.',needs:'Date/period, open, close, low and high columns.',example:'Daily share price',tags:['finance','stock','ohlc','price','trading','market'],aggregates:false},
 radar:{name:'Radar chart',category:'Relationships',use:'Compare profiles across several dimensions on one common scale.',needs:'Dimension, value; optional series. Dimensions must share units.',example:'Product ratings across criteria',tags:['radar','spider','star','web','profile','polar'],aggregates:true},
 beeswarm:{name:'Beeswarm plot',category:'Distribution',use:'Show every observation without overlap, optionally in groups.',needs:'Raw numerical observations; optional group and label.',example:'Salaries of individual employees',tags:['beeswarm','swarm','strip','jitter','dots','distribution'],aggregates:false},
 ridgeline:{name:'Ridgeline plot',category:'Distribution',use:'Compare the shapes of many distributions stacked as ridges.',needs:'Group and raw numerical observations.',example:'Temperature distribution by month',tags:['ridgeline','joyplot','density','kde','distribution'],aggregates:false},
 pyramid:{name:'Population pyramid',category:'Distribution',use:'Compare two groups back to back across ordered bands.',needs:'Band (e.g. age group), two-group field and a measure.',example:'Population by age and sex',tags:['pyramid','population','age','sex','butterfly','back to back','tornado'],aggregates:true},
 bump:{name:'Bump chart',category:'Animation & ranking',use:'Show how rankings change over time.',needs:'Period, entity and a measure to rank.',example:'League positions by season',tags:['bump','rank','ranking','position','league'],aggregates:true},
 streamgraph:{name:'Streamgraph',category:'Time & trends',use:'Show how the volume of many series flows over time.',needs:'Ordered period, series and nonnegative measure.',example:'Music genre listening over a decade',tags:['stream','streamgraph','flow','theme river','stacked'],aggregates:true},
 chord:{name:'Chord diagram',category:'Flows & networks',use:'Show flows and mutual exchanges between a set of entities.',needs:'Source, target and optional positive weight.',example:'Migration between regions',tags:['chord','flow','matrix','exchange','migration','circular'],aggregates:true},
 'arc-diagram':{name:'Arc diagram',category:'Flows & networks',use:'Show connections between ordered entities as arcs.',needs:'Source, target and optional positive weight.',example:'Character interactions in a story',tags:['arc','network','links','connections','linear'],aggregates:true},
 parliament:{name:'Parliament chart',category:'Part-to-whole',use:'Show seats won by each party in a hemicycle.',needs:'Party and whole-number seats.',example:'Seats in a fictional parliament',tags:['parliament','election','seats','hemicycle','politics','party'],aggregates:true},
 'tile-map':{name:'Tile map (grid cartogram)',category:'Geographic',use:'Give every region an equal tile so small regions are as visible as large ones.',needs:'Region name or code and a value; built-in US states and NZ regions grids, or your own row/column fields.',example:'Rates by US state',tags:['tile','grid','cartogram','hex map','state','region','map','equal area'],aggregates:true},
 wordcloud:{name:'Word cloud',category:'Tables',use:'Show prominent words or tags sized by frequency. Best as a teaser, not for exact comparison.',needs:'Word/term and optional weight.',example:'Most mentioned survey themes',tags:['word','tag','cloud','text','frequency','themes'],aggregates:true},
};
export const PRO_TYPES = new Set(Object.keys(PRO_META));
export const PRO_AGGREGATING = new Set(Object.entries(PRO_META).filter(([,m])=>m.aggregates).map(([id])=>id));

// Type-specific inspector controls (rendered generically by app.js).
export const PRO_OPTIONS = {
 ...EXTRA_OPTIONS,
 pie:[{key:'pieLabels',label:'Labels',kind:'select',options:[['outside','Outside with leader lines'],['inside','Inside slices'],['legend','Legend only']],def:'outside'},{key:'proSort',label:'Order',kind:'select',options:[['desc','Largest first'],['none','Data order']],def:'desc'},{key:'pieMaxSlices',label:'Maximum slices before “Other”',kind:'number',min:2,max:20,def:8}],
 waffle:[{key:'waffleShape',label:'Cell shape',kind:'select',options:[['square','Squares'],['circle','Circles']],def:'square'},{key:'proSort',label:'Order',kind:'select',options:[['desc','Largest first'],['none','Data order']],def:'desc'}],
 combo:[{key:'comboAxis',label:'Axes',kind:'select',options:[['dual','Separate right axis for the line'],['shared','One shared axis']],def:'dual'},{key:'comboLineAgg',label:'Line calculation',kind:'select',options:[['same','Same as columns'],['sum','Sum'],['average','Average'],['min','Minimum'],['max','Maximum']],def:'same'}],
 lollipop:[{key:'proSort',label:'Order',kind:'select',options:[['desc','Largest first'],['asc','Smallest first'],['none','Data order']],def:'desc'}],
 'split-bars':[{key:'splitScale',label:'Scale',kind:'select',options:[['shared','Shared across panels'],['independent','Independent per panel']],def:'shared'},{key:'proSort',label:'Order',kind:'select',options:[['none','Data order'],['desc','By first panel, largest first']],def:'none'}],
 'range-plot':[{key:'rangeSort',label:'Order',kind:'select',options:[['none','Data order'],['end','By end value'],['start','By start value'],['gap','By gap size']],def:'none'}],
 'arrow-plot':[{key:'rangeSort',label:'Order',kind:'select',options:[['none','Data order'],['end','By end value'],['start','By start value'],['gap','By size of change']],def:'none'}],
 bullet:[{key:'bulletColourByTarget',label:'Use secondary colour when target is missed',kind:'check',def:true}],
 gauge:[{key:'gaugeMin',label:'Minimum',kind:'number',def:0},{key:'gaugeMax',label:'Maximum (blank = automatic)',kind:'number',def:''}],
 kpi:[{key:'kpiDelta',label:'Change shown as',kind:'select',options:[['percent','Percentage change'],['absolute','Absolute difference'],['none','Hide change']],def:'percent'},{key:'kpiGood',label:'An increase is',kind:'select',options:[['up','Good (green)'],['down','Bad (red)'],['neutral','Neutral']],def:'up'},{key:'kpiColumns',label:'Cards per row (0 = automatic)',kind:'number',min:0,max:6,def:0}],
 funnel:[{key:'funnelShape',label:'Shape',kind:'select',options:[['bars','Centred bars'],['tapered','Tapered funnel']],def:'bars'}],
 candlestick:[{key:'candleColours',label:'Colours',kind:'select',options:[['finance','Green up / red down'],['brand','Brand colours']],def:'finance'}],
 radar:[{key:'radarFill',label:'Fill areas',kind:'check',def:true},{key:'radarMax',label:'Scale maximum (blank = automatic)',kind:'number',def:''}],
 beeswarm:[{key:'swarmRadius',label:'Dot radius (px)',kind:'number',min:1.5,max:12,step:0.5,def:4},{key:'swarmMedian',label:'Show group median',kind:'check',def:true}],
 ridgeline:[{key:'ridgeOverlap',label:'Ridge overlap',kind:'number',min:0.5,max:4,step:0.1,def:1.6},{key:'ridgeBandwidth',label:'Bandwidth (0 = automatic)',kind:'number',min:0,step:0.1,def:0}],
 pyramid:[{key:'pyramidOrder',label:'First band at',kind:'select',options:[['bottom','Bottom (age pyramids)'],['top','Top']],def:'bottom'},{key:'pyramidPercent',label:'Show as % of total',kind:'check',def:false}],
 bump:[{key:'bumpOrder',label:'Rank 1 is',kind:'select',options:[['desc','Highest value'],['asc','Lowest value']],def:'desc'},{key:'bumpMax',label:'Maximum entities',kind:'number',min:2,max:20,def:10}],
 streamgraph:[{key:'streamOffset',label:'Baseline',kind:'select',options:[['silhouette','Centred stream'],['zero','Zero baseline (stacked)']],def:'silhouette'}],
 chord:[{key:'chordMax',label:'Maximum entities before “Other”',kind:'number',min:3,max:20,def:12}],
 'arc-diagram':[{key:'arcOrder',label:'Node order',kind:'select',options:[['data','First appearance'],['name','Alphabetical'],['weight','Total weight']],def:'data'}],
 parliament:[{key:'parliamentMajority',label:'Show majority line',kind:'check',def:true}],
 wordcloud:[{key:'wordMax',label:'Maximum words',kind:'number',min:5,max:150,def:60},{key:'wordRotate',label:'Rotation',kind:'select',options:[['none','Horizontal only'],['some','Some vertical words']],def:'none'}],
 'tile-map':[{key:'tileLayout',label:'Layout',kind:'select',options:[['us-states','US states (51 tiles)'],['nz-regions','New Zealand regions (16 tiles)'],['custom','My own grid (Row and Column fields)']],def:'us-states'},{key:'tileShape',label:'Tile shape',kind:'select',options:[['square','Squares'],['hex','Hexagons']],def:'square'},{key:'tileClasses',label:'Colour scale',kind:'select',options:[['continuous','Continuous'],['5','5 equal-interval classes'],['4','4 equal-interval classes']],def:'continuous'}],
 marimekko:[{key:'mekkoLabels',label:'Segment labels',kind:'select',options:[['percent','Share of column'],['value','Value'],['none','None']],def:'percent'}],
 'circle-pack':[{key:'packLabels',label:'Show labels',kind:'check',def:true}],
};
export const PRO_SETTING_NUMBERS=[...new Set(Object.values(PRO_OPTIONS).flat().filter(o=>o.kind==='number').map(o=>o.key))];
export const PRO_SETTING_CHECKS=[...new Set(Object.values(PRO_OPTIONS).flat().filter(o=>o.kind==='check').map(o=>o.key))];
export function proOption(s,key){const spec=Object.values(PRO_OPTIONS).flat().find(o=>o.key===key);const v=s[key];if(v===undefined||v===null||v==='')return spec?spec.def:undefined;return v;}

// ---------- helpers ----------
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const present=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
const num=v=>present(v)&&Number.isFinite(Number(v))?Number(v):NaN;
const hex=(v,d)=>/^#[0-9a-f]{6}$/i.test(String(v))?v:d;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const has=(rows,k)=>!!k&&rows.length>0&&Object.prototype.hasOwnProperty.call(rows[0],k);
const r2=v=>Math.round(v*100)/100;
const textW=(t,size)=>String(t).length*size*.56;
const cut=(t,max)=>{t=String(t??'');return t.length>max?t.slice(0,Math.max(1,max-1))+'…':t;};
const median=a=>{if(!a.length)return NaN;const s=[...a].sort((x,y)=>x-y),m=(s.length-1)/2;return (s[Math.floor(m)]+s[Math.ceil(m)])/2;};
const DEFAULT_PALETTE=['#5779a3','#a56ca1','#54a69a','#bd7c69','#7a92aa','#9b984b','#ba6f84','#65885e','#c49a47','#6f6fb3'];
function reduceValues(values,mode,count){
 if(mode==='count')return count;
 const v=values.filter(Number.isFinite);if(!v.length)return NaN;
 if(mode==='average')return v.reduce((a,b)=>a+b,0)/v.length;
 if(mode==='min')return Math.min(...v);
 if(mode==='max')return Math.max(...v);
 if(mode==='median')return median(v);
 return v.reduce((a,b)=>a+b,0);
}
function dateValue(v){if(v instanceof Date)return v.getTime();const s=String(v??'').trim();if(/^\d{4}$/.test(s))return Date.UTC(Number(s),0,1);if(/^\d{4}-\d{2}(-\d{2})?/.test(s)||/[a-z]{3}/i.test(s)){const t=Date.parse(s);return Number.isFinite(t)?t:NaN;}return NaN;}
// Numeric keys sort numerically, date keys chronologically; otherwise first-seen order is kept.
export function orderKeys(keys){
 if(keys.length&&keys.every(k=>Number.isFinite(Number(k))&&String(k).trim()!==''))return [...keys].sort((a,b)=>Number(a)-Number(b));
 if(keys.length&&keys.every(k=>Number.isFinite(dateValue(k))))return [...keys].sort((a,b)=>dateValue(a)-dateValue(b));
 return keys;
}
// Group one field; missing values are excluded (except Count, which counts rows with a key).
function group(rows,keyField,valueField,mode='sum'){
 const map=new Map();
 for(const r of rows){
  const k=keyField?r[keyField]:'All';if(!present(k))continue;const id=String(k);
  if(!map.has(id))map.set(id,{key:id,values:[],count:0});const item=map.get(id);
  if(mode==='count'){item.count++;continue;}
  const v=num(r[valueField]);if(Number.isFinite(v)){item.values.push(v);item.count++;}
 }
 return [...map.values()].map(g=>({key:g.key,value:reduceValues(g.values,mode,g.count),n:g.count})).filter(g=>Number.isFinite(g.value));
}
function group2(rows,catField,serField,valueField,mode='sum'){
 const cells=new Map(),cats=[],series=[],seenC=new Set(),seenS=new Set();
 for(const r of rows){
  const c=r[catField],g=serField?r[serField]:'Value';if(!present(c)||!present(g))continue;
  const v=num(r[valueField]);if(mode!=='count'&&!Number.isFinite(v))continue;
  const cs=String(c),gs=String(g);if(!seenC.has(cs)){seenC.add(cs);cats.push(cs);}if(!seenS.has(gs)){seenS.add(gs);series.push(gs);}
  const id=cs+'\u0000'+gs;if(!cells.has(id))cells.set(id,{values:[],count:0});const cell=cells.get(id);cell.count++;if(Number.isFinite(v))cell.values.push(v);
 }
 const out=new Map();for(const [id,c] of cells){const v=reduceValues(c.values,mode,c.count);if(Number.isFinite(v))out.set(id,v);}
 return {cats,series,get:(c,g)=>out.get(c+'\u0000'+g)};
}
export function niceScale(lo,hi,count=5){
 if(!Number.isFinite(lo)||!Number.isFinite(hi)){lo=0;hi=1;}
 if(lo===hi){const bump=Math.abs(lo)||1;lo-=bump*.5;hi+=bump*.5;}
 const raw=(hi-lo)/Math.max(1,count-1),mag=10**Math.floor(Math.log10(raw)),step=[1,2,2.5,5,10].map(k=>k*mag).find(k=>k>=raw)||10*mag;
 const a=Math.floor(lo/step+1e-9)*step,b=Math.ceil(hi/step-1e-9)*step,ticks=[];
 for(let v=a;v<=b+step*1e-6;v+=step)ticks.push(Number(v.toPrecision(12)));
 return {lo:a,hi:b,ticks};
}
const polar=(cx,cy,r,a)=>[cx+Math.cos(a)*r,cy+Math.sin(a)*r];
function sector(cx,cy,r0,r1,a0,a1){
 const large=a1-a0>Math.PI?1:0,[x0,y0]=polar(cx,cy,r1,a0),[x1,y1]=polar(cx,cy,r1,a1);
 if(a1-a0>=Math.PI*2-1e-6){return r0>0?`M${cx+r1},${cy}A${r1},${r1} 0 1 1 ${cx-r1},${cy}A${r1},${r1} 0 1 1 ${cx+r1},${cy}ZM${cx+r0},${cy}A${r0},${r0} 0 1 0 ${cx-r0},${cy}A${r0},${r0} 0 1 0 ${cx+r0},${cy}Z`:`M${cx+r1},${cy}A${r1},${r1} 0 1 1 ${cx-r1},${cy}A${r1},${r1} 0 1 1 ${cx+r1},${cy}Z`;}
 if(r0<=0)return `M${r2(cx)},${r2(cy)}L${r2(x0)},${r2(y0)}A${r1},${r1} 0 ${large} 1 ${r2(x1)},${r2(y1)}Z`;
 const [x2,y2]=polar(cx,cy,r0,a1),[x3,y3]=polar(cx,cy,r0,a0);
 return `M${r2(x0)},${r2(y0)}A${r1},${r1} 0 ${large} 1 ${r2(x1)},${r2(y1)}L${r2(x2)},${r2(y2)}A${r0},${r0} 0 ${large} 0 ${r2(x3)},${r2(y3)}Z`;
}
// Catmull–Rom spline through points, rendered as cubic Béziers (passes through every observation).
function smoothPath(pts,move=true){
 if(!pts.length)return '';let d=(move?'M':'L')+r2(pts[0][0])+','+r2(pts[0][1]);
 for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
  const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
  d+=`C${r2(c1[0])},${r2(c1[1])} ${r2(c2[0])},${r2(c2[1])} ${r2(p2[0])},${r2(p2[1])}`;}
 return d;
}

// ---------- field contracts ----------
export function proFieldSpecs(c,role){
 if(EXTRA_TYPES.has(c.type))return extraFieldSpecs(c,role);
 const agg=c.aggregation!=='count';
 switch(c.type){
  case 'pie':case 'waffle':return [role('x','Category','any',true,'category|type|name|group'),role('y','Value','number',agg,'value|amount|share|count')];
  case 'lollipop':return [role('x','Category','any',true,'category|name|store|country'),role('y','Value','number',agg)];
  case 'funnel':return [role('x','Stage (in order)','any',true,'stage|step|phase'),role('y','Value','number',agg,'count|value|users|visitors')];
  case 'combo':return [role('x','Category / period','any',true,'month|year|date|period|category'),role('y','Columns measure','number',agg,'sales|revenue|volume|value'),role('endField','Line measure','number',true,'rate|margin|percent|growth|average')];
  case 'split-bars':return [role('x','Category (rows)','any',true,'category|group|name'),role('seriesField','Panel (one per value)','any',true,'series|measure|year|answer'),role('y','Value','number',agg)];
  case 'range-plot':case 'arrow-plot':return [role('x','Category','any',true,'category|name|country|group'),role('y',c.type==='arrow-plot'?'Start value':'First value','number',true,'start|before|from|min|low|2000'),role('endField',c.type==='arrow-plot'?'End value':'Second value','number',true,'end|after|to|max|high|2020')];
  case 'bullet':return [role('x','Label','any',true,'name|metric|label|region'),role('y','Actual','number',agg,'actual|value|sales'),role('endField','Target','number',false,'target|goal|budget|plan'),role('upperField','Range maximum','number',false,'max|maximum|capacity|limit')];
  case 'gauge':return [role('y','Value','number',agg,'value|score|percent'),role('x','Label (one gauge each)','any',false,'name|label|metric'),role('endField','Target','number',false,'target|goal')];
  case 'kpi':return [role('y','Value','number',agg,'value|current|amount'),role('x','Label (one card each)','any',false,'metric|name|label|kpi'),role('endField','Comparison value','number',false,'previous|prior|last|comparison|baseline')];
  case 'candlestick':return [role('x','Date / period','any',true,'date|day|time|period'),role('y','Open','number',true,'^open$'),role('endField','Close','number',true,'^close$'),role('lowerField','Low','number',true,'^low$'),role('upperField','High','number',true,'^high$')];
  case 'radar':return [role('x','Dimension (spoke)','any',true,'criterion|dimension|attribute|skill|axis'),role('y','Value','number',agg,'score|value|rating'),role('seriesField','Series','any',false,'product|series|team|name')];
  case 'beeswarm':return [role('y','Observations','number',true,'value|salary|score'),role('x','Group','any',false,'group|team|department|category'),role('labelField','Label (tooltips)','any',false,'name|label|id')];
  case 'ridgeline':return [role('x','Group','any',true,'group|month|category'),role('y','Observations','number',true,'value|temperature|score')];
  case 'pyramid':return [role('x','Band (e.g. age group)','any',true,'age|band|group'),role('seriesField','Two groups (e.g. sex)','any',true,'sex|gender|side|group'),role('y','Value','number',agg,'population|count|value')];
  case 'bump':return [role('x','Period','any',true,'year|season|period|date'),role('seriesField','Entity','any',true,'team|entity|name|country'),role('y','Value to rank','number',agg,'points|score|value|rank')];
  case 'streamgraph':return [role('x','Period','any',true,'year|month|period|date'),role('seriesField','Series','any',true,'series|genre|category|group'),role('y','Value','number',agg,'value|plays|count')];
  case 'chord':case 'arc-diagram':return [role('x','Source','any',true,'source|from|origin'),role('seriesField','Target','any',true,'target|to|destination'),role('y','Weight','number',false,'weight|value|flow|count')];
  case 'parliament':return [role('x','Party','any',true,'party|group|name'),role('y','Seats','number',agg,'seats|count')];
  case 'tile-map':return [role('x','Region name or code','any',true,'state|region|code|name|abbr'),role('y','Value','number',agg,'value|rate|percent|count'),...(c.tileLayout==='custom'?[role('lowerField','Row (0 = top)','number',true,'^row$'),role('upperField','Column (0 = left)','number',true,'^col(umn)?$')]:[])];
  case 'wordcloud':return [role('x','Word / term','any',true,'word|term|tag|theme|keyword'),role('y','Weight','number',false,'count|frequency|weight|mentions')];
  case 'marimekko':return [role('x','Category (column)','any',true,'region|category|market'),role('seriesField','Segment','any',true,'brand|segment|series'),role('y','Value','number',agg,'value|sales|share')];
  case 'circle-pack':return [role('x','Group','any',true,'department|group|category'),role('y','Size','number',agg,'value|budget|size|amount'),role('seriesField','Subgroup','any',false,'team|subgroup|child')];
 }
 return [role('x','Category'),role('y','Value','number')];
}

// ---------- data models ----------
const agg=s=>s.aggregation||'sum';
function edgeModel(rows,s,maxNodes){
 const weightField=has(rows,s.y)?s.y:null,flows=new Map(),totals=new Map();let excluded=0;
 for(const r of rows){const a=r[s.x],b=r[s.seriesField];if(!present(a)||!present(b)){excluded++;continue;}const w=weightField?num(r[weightField]):1;if(!(w>0)){excluded++;continue;}
  const A=String(a),Bn=String(b),id=A+'\u0000'+Bn;flows.set(id,(flows.get(id)||0)+w);totals.set(A,(totals.get(A)||0)+w);totals.set(Bn,(totals.get(Bn)||0)+w);}
 let nodes=[...totals.keys()];let other=false;
 if(nodes.length>maxNodes){const keep=new Set([...nodes].sort((a,b)=>totals.get(b)-totals.get(a)).slice(0,maxNodes-1));nodes=nodes.filter(n=>keep.has(n));nodes.push('Other');other=true;
  const merged=new Map();for(const [id,w] of flows){let [a,b]=id.split('\u0000');if(!keep.has(a))a='Other';if(!keep.has(b))b='Other';const k=a+'\u0000'+b;merged.set(k,(merged.get(k)||0)+w);}flows.clear();for(const [k,v] of merged)flows.set(k,v);}
 const edges=[...flows].map(([id,w])=>{const [a,b]=id.split('\u0000');return {source:a,target:b,value:w};});
 return {nodes,edges,excluded,other,weighted:!!weightField};
}
function seatsModel(rows,s){return group(rows,s.x,s.y,agg(s)).map(g=>({...g,seats:Math.round(g.value)})).filter(g=>g.seats>0);}
function topWithOther(items,max){if(items.length<=max)return items;const head=items.slice(0,max-1),rest=items.slice(max-1);return [...head,{key:'Other',value:rest.reduce((a,b)=>a+b.value,0),n:rest.reduce((a,b)=>a+b.n,0),other:rest.length}];}
function sorted(items,mode,by=g=>g.value){if(mode==='desc')return [...items].sort((a,b)=>by(b)-by(a));if(mode==='asc')return [...items].sort((a,b)=>by(a)-by(b));return items;}
function pairModel(rows,s){
 const map=new Map();for(const r of rows){const k=r[s.x];if(!present(k))continue;const a=num(r[s.y]),b=num(r[s.endField]);if(!Number.isFinite(a)||!Number.isFinite(b))continue;const id=String(k);if(!map.has(id))map.set(id,{key:id,a:[],b:[]});map.get(id).a.push(a);map.get(id).b.push(b);}
 const mode=agg(s)==='count'?'sum':agg(s);let items=[...map.values()].map(g=>({key:g.key,start:reduceValues(g.a,mode,g.a.length),end:reduceValues(g.b,mode,g.b.length),n:g.a.length}));
 const o=proOption(s,'rangeSort');if(o==='end')items.sort((a,b)=>b.end-a.end);else if(o==='start')items.sort((a,b)=>b.start-a.start);else if(o==='gap')items.sort((a,b)=>Math.abs(b.end-b.start)-Math.abs(a.end-a.start));
 return items.slice(0,40);
}
function candleModel(rows,s){
 const out=[];for(const r of rows){const k=r[s.x];if(!present(k))continue;const o=num(r[s.y]),c=num(r[s.endField]),l=num(r[s.lowerField]),h=num(r[s.upperField]);if(![o,c,l,h].every(Number.isFinite))continue;if(l>Math.min(o,c)||h<Math.max(o,c))continue;out.push({key:String(k),open:o,close:c,low:l,high:h});}
 const keys=orderKeys(out.map(d=>d.key));if(keys!==out.map(d=>d.key)){const pos=new Map(keys.map((k,i)=>[k,i]));out.sort((a,b)=>pos.get(a.key)-pos.get(b.key));}
 return out.slice(-400);
}
function rankModel(rows,s){
 const m=group2(rows,s.x,s.seriesField,s.y,agg(s)),periods=orderKeys(m.cats),asc=proOption(s,'bumpOrder')==='asc';
 const ranks=new Map();
 for(const p of periods){const vals=m.series.map(e=>({e,v:m.get(p,e)})).filter(d=>d.v!==undefined).sort((a,b)=>asc?a.v-b.v:b.v-a.v);
  vals.forEach((d,i)=>{const rank=i>0&&vals[i-1].v===d.v?ranks.get(p+'\u0000'+vals[i-1].e).rank:i+1;ranks.set(p+'\u0000'+d.e,{rank,value:d.v});});}
 const max=clamp(Math.round(Number(proOption(s,'bumpMax'))||10),2,20),last=periods[periods.length-1];
 const score=e=>{for(let i=periods.length-1;i>=0;i--){const r=ranks.get(periods[i]+'\u0000'+e);if(r)return r.rank+(periods.length-1-i)*1000;}return 1e9;};
 const entities=[...m.series].sort((a,b)=>score(a)-score(b)).slice(0,max);
 return {periods,entities,ranks,last,totalEntities:m.series.length};
}
export function proData(rows,s,type){
 if(EXTRA_TYPES.has(type))return extraData(rows,s,type);
 const a=agg(s);
 switch(type){
  case 'pie':case 'waffle':case 'funnel':case 'lollipop':case 'wordcloud':return group(rows,s.x,s.y,type==='wordcloud'&&!has(rows,s.y)?'count':a).filter(g=>type==='lollipop'||g.value>0).map(g=>({x:g.key,y:g.value}));
  case 'parliament':return seatsModel(rows,s).map(g=>({x:g.key,y:g.seats}));
  case 'combo':return group(rows,s.x,s.y,a).map(g=>({x:g.key,y:g.value}));
  case 'gauge':case 'kpi':return group(rows,has(rows,s.x)?s.x:null,s.y,a).map(g=>({x:g.key,y:g.value}));
  case 'bullet':return group(rows,s.x,s.y,a).map(g=>({x:g.key,y:g.value}));
  case 'range-plot':case 'arrow-plot':return pairModel(rows,s).map(p=>({x:p.key,y:p.end}));
  case 'candlestick':return candleModel(rows,s).map(d=>({x:d.key,y:d.close}));
  case 'beeswarm':case 'ridgeline':return rows.filter(r=>Number.isFinite(num(r[s.y]))&&(type==='beeswarm'||present(r[s.x]))).map(r=>({x:type==='beeswarm'&&!has(rows,s.x)?'All':String(r[s.x]??'All'),y:num(r[s.y])}));
  case 'radar':{const m=group2(rows,s.x,has(rows,s.seriesField)?s.seriesField:null,s.y,a);return m.cats.flatMap(c=>m.series.map(g=>({x:c,y:m.get(c,g)}))).filter(p=>p.y!==undefined);}
  case 'pyramid':case 'bump':case 'streamgraph':case 'marimekko':case 'split-bars':{if(!has(rows,s.seriesField)||s.seriesField===s.x)return [];const m=group2(rows,s.x,s.seriesField,s.y,a);return m.cats.flatMap(c=>m.series.map(g=>({x:c,y:m.get(c,g),series:g}))).filter(p=>p.y!==undefined);}
  case 'chord':case 'arc-diagram':{if(!has(rows,s.seriesField)||s.seriesField===s.x)return [];return edgeModel(rows,s,40).edges.map(e=>({x:e.source,y:e.value}));}
  case 'circle-pack':return group(rows,s.x,s.y,a).filter(g=>g.value>0).map(g=>({x:g.key,y:g.value}));
  case 'tile-map':return tileModel(rows,s).tiles.filter(t=>t.value!==undefined).map(t=>({x:t.key,y:t.value}));
 }
 return [];
}
export function proWarnings(rows,s,type){
 const w=[],specs=proFieldSpecs({...s,type},(key,label,kind='any',required=true)=>({key,label,kind,required}));
 for(const spec of specs){if(spec.required&&!has(rows,s[spec.key]))w.push(`${spec.label} field is not mapped.`);}
 if(EXTRA_TYPES.has(type))return [...w,...(w.length?[]:extraWarnings(rows,s,type))];
 const nonnum=f=>rows.filter(r=>present(r[f])&&!Number.isFinite(num(r[f]))).length;
 if(has(rows,s.y)&&s.aggregation!=='count'){const n=nonnum(s.y);if(n)w.push(`${n} nonnumeric ${s.y} value${n===1?' is':'s are'} excluded, not treated as zero.`);}
 const data=proData(rows,s,type);if(!data.length)w.push('No compatible observations for the mapped fields.');
 if(['pie','waffle','funnel','marimekko','streamgraph','parliament','circle-pack','wordcloud'].includes(type)&&has(rows,s.y)&&rows.some(r=>num(r[s.y])<0))w.push('Negative values are excluded: this chart shows parts of a positive total.');
 if(type==='pie'){const n=data.length,max=clamp(Number(proOption(s,'pieMaxSlices'))||8,2,20);if(n>max)w.push(`${n-max+1} smallest categories are combined into “Other”.`);if(n>6)w.push('Pies with many slices are hard to read; consider a bar chart or waffle.');}
 if(type==='waffle')w.push('Each square represents 1% of the total; percentages are rounded with the largest-remainder method so squares sum to 100.');
 if(type==='combo'&&proOption(s,'comboAxis')==='dual')w.push('Dual axes can imply relationships that do not exist; label both axes clearly.');
 if(type==='radar')w.push('All dimensions share one radial scale starting at zero; only compare dimensions measured in the same units.');
 if(type==='candlestick'&&has(rows,s.lowerField)){const bad=rows.filter(r=>{const o=num(r[s.y]),c=num(r[s.endField]),l=num(r[s.lowerField]),h=num(r[s.upperField]);return [o,c,l,h].every(Number.isFinite)&&(l>Math.min(o,c)||h<Math.max(o,c));}).length;if(bad)w.push(`${bad} row${bad===1?'':'s'} with low above open/close or high below open/close excluded.`);if(rows.length>400)w.push('Only the latest 400 periods are drawn.');}
 if(type==='bump'){const m=rankModel(rows,s);if(m.totalEntities>m.entities.length)w.push(`Showing ${m.entities.length} of ${m.totalEntities} entities (best-ranked at the latest period).`);w.push('Tied values share a rank (1, 2, 2, 4). Gaps mean the entity has no value in that period.');}
 if(type==='pyramid'){const g=group2(rows,s.x,s.seriesField,s.y,agg(s));if(g.series.length>2)w.push(`Only the first two groups (${g.series.slice(0,2).join(', ')}) are drawn; ${g.series.length-2} other group(s) excluded.`);if(g.series.length<2)w.push('A population pyramid needs exactly two groups in the second field.');}
 if(type==='parliament'&&has(rows,s.y)&&rows.some(r=>Number.isFinite(num(r[s.y]))&&num(r[s.y])%1!==0))w.push('Seat values are rounded to whole numbers.');
 if(type==='tile-map'){const m=tileModel(rows,s);if(m.unmatched.length)w.push(`${m.unmatched.length} region${m.unmatched.length===1?'':'s'} not found in the ${m.layoutName} grid: ${m.unmatched.slice(0,6).join(', ')}${m.unmatched.length>6?'…':''}.`);if(m.missing&&m.layout!=='custom')w.push(`${m.missing} tile${m.missing===1?' has':'s have'} no data and ${m.missing===1?'is':'are'} shown in grey.`);w.push('Tiles are equal in size: they show which regions, not how large they are.');}
 if(s.proTimeField){const tm=proTimeModel(rows,s,type);if(tm)w.push(`Playback: ${tm.periods.length} periods of ${s.proTimeField}; showing ${tm.periods[tm.index]}. Scales are fixed across all periods so frames stay comparable; nothing is interpolated between periods.`);else w.push(`Playback needs at least two values in ${s.proTimeField}.`);}
 if(type==='wordcloud')w.push('Word size is approximate (area roughly follows weight); use a bar chart for exact comparison.');
 if(['chord','arc-diagram'].includes(type)&&has(rows,s.x)&&has(rows,s.seriesField)){const m=edgeModel(rows,s,type==='chord'?clamp(Number(proOption(s,'chordMax'))||12,3,20):40);if(m.excluded)w.push(`${m.excluded} row${m.excluded===1?'':'s'} without both endpoints or a positive weight excluded.`);if(m.other)w.push('Smaller entities are combined into “Other”.');if(!m.weighted)w.push('No weight mapped: each row counts as one connection.');}
 if(type==='ridgeline'||type==='beeswarm'){if(data.length>1500&&type==='beeswarm')w.push('Only the first 1,500 observations are drawn as dots.');}
 if(['range-plot','arrow-plot','combo','bullet'].includes(type)&&has(rows,s.endField)){const n=nonnum(s.endField);if(n)w.push(`${n} nonnumeric ${s.endField} value${n===1?' is':'s are'} excluded.`);}
 return [...new Set(w)];
}

// ---------- rendering ----------
// V3.56 time playback for these families: one frame per observed period, scales fixed across the timeline.
export function proTimeModel(rows,s,type){if(EXTRA_TYPES.has(type))return null;const f=s.proTimeField;if(!f||!rows.length||!Object.prototype.hasOwnProperty.call(rows[0],f))return null;
 const periods=orderKeys([...new Set(rows.filter(r=>present(r[f])).map(r=>String(r[f])))]).slice(0,120);if(periods.length<2)return null;
 const frames=periods.map(p=>rows.filter(r=>String(r[f])===p));let lo=Infinity,hi=-Infinity,lo2=Infinity,hi2=-Infinity;
 for(const fr of frames){const v=proFrameValues(fr,s,type);for(const x of v.main){if(Number.isFinite(x)){lo=Math.min(lo,x);hi=Math.max(hi,x);}}for(const x of v.second||[]){if(Number.isFinite(x)){lo2=Math.min(lo2,x);hi2=Math.max(hi2,x);}}}
 const index=Math.max(0,Math.min(periods.length-1,Math.round(Number(s.proTimeIndex)||0)));
 return {field:f,periods,frames,index,domain:Number.isFinite(lo)?{lo,hi}:null,domain2:Number.isFinite(lo2)?{lo:lo2,hi:hi2}:null};}
export function proFrameValues(rows,s,type){const a=agg(s);
 switch(type){
  case 'range-plot':case 'arrow-plot':return {main:pairModel(rows,s).flatMap(p=>[p.start,p.end])};
  case 'bullet':return {main:[...group(rows,s.x,s.y,a).map(g=>g.value),...(has(rows,s.endField)?group(rows,s.x,s.endField,a==='count'?'sum':a).map(g=>g.value):[]),...(has(rows,s.upperField)?group(rows,s.x,s.upperField,'max').map(g=>g.value):[])]};
  case 'candlestick':return {main:candleModel(rows,s).flatMap(c=>[c.low,c.high])};
  case 'beeswarm':case 'ridgeline':return {main:rows.map(r=>num(r[s.y]))};
  case 'pyramid':return {main:proData(rows,s,type).map(p=>Math.abs(p.y))};
  case 'combo':{const cs=group(rows,s.x,s.y,a).map(g=>g.value),ls=group(rows,s.x,s.endField,(s.comboLineAgg&&s.comboLineAgg!=='same')?s.comboLineAgg:(a==='count'?'sum':a)).map(g=>g.value);return proOption(s,'comboAxis')==='shared'?{main:[...cs,...ls]}:{main:cs,second:ls};}
  case 'streamgraph':{const m=group2(rows,s.x,s.seriesField,s.y,a);return {main:m.cats.map(c=>m.series.reduce((t,g)=>t+Math.max(0,m.get(c,g)??0),0))};}
  case 'gauge':return {main:[...proData(rows,s,type).map(p=>p.y),...(has(rows,s.endField)?group(rows,has(rows,s.x)?s.x:null,s.endField,a==='count'?'sum':a).map(g=>g.value):[])]};
 }
 return {main:proData(rows,s,type).map(p=>p.y)};}
export function renderPro(type,rows,s,b){
 const tm=proTimeModel(rows,s,type);if(!tm)return renderProFrame(type,rows,s,b);
 const frameRows=tm.frames[tm.index],out=renderProFrame(type,frameRows,{...s,_domain:tm.domain,_domain2:tm.domain2},b);
 const label=String(tm.periods[tm.index]),sz=Math.max(18,Math.min(48,b.ph*.12));
 return `<g data-viz-part="time-period" data-pro-time="${esc(JSON.stringify({field:tm.field,periods:tm.periods,index:tm.index}))}"><text x="${b.right-4}" y="${b.top+sz}" text-anchor="end" font-size="${sz}" font-weight="800" fill="${b.T}" fill-opacity=".14" font-family="${b.font}">${esc(label)}</text></g>`+out;}
function renderProFrame(type,rows,s,b){
 if(EXTRA_TYPES.has(type))return renderExtra(type,rows,s,b);
 const {left,right,top,bottom,pw,ph,C,T,G,B,font,format}=b;
 const D=s._domain,D2=s._domain2,dom=(lo,hi,c)=>niceScale(D?Math.min(lo,D.lo):lo,D?Math.max(hi,D.hi):hi,c);
 const size=clamp(Number(s.labelSize)||12,8,28),axisSize=clamp(Number(s.axisFontSize)||Math.max(10,size-1),8,28),legendSize=clamp(Number(s.legendFontSize)||size,8,28);
 const custom=Array.isArray(s.palette)?s.palette.filter(v=>/^#[0-9a-f]{6}$/i.test(v)):[],pal=custom.length>=2?custom:[C,hex(s.secondary,'#f2aa64'),...DEFAULT_PALETTE];
 const colour=(key,i)=>hex(s.pointColors?.[key],pal[i%pal.length]);
 const fmt=v=>format(v);
 const t=(x,y,v,o={})=>`<text x="${r2(x)}" y="${r2(y)}" font-size="${o.size||size}" fill="${o.fill||T}" font-family="${font}"${o.anchor?` text-anchor="${o.anchor}"`:''}${o.weight?` font-weight="${o.weight}"`:''}${o.opacity?` opacity="${o.opacity}"`:''}${o.extra?' '+o.extra:''}>${esc(v)}</text>`;
 const ln=(x1,y1,x2,y2,stroke=G,extra='')=>`<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${stroke}" ${extra}/>`;
 const mark=(key,title,content)=>`<g data-viz-part="point" data-viz-key="${esc(encodeURIComponent(String(key)))}"><title>${esc(title)}</title>${content}</g>`;
 const muted=`opacity=".72"`;
 // Horizontal legend that wraps; returns its height so plots can start below it.
 const legend=(items,x,y,maxW)=>{let cx=x,cy=y,out='';for(const it of items){const w=16+textW(it.label,legendSize)+18;if(cx+w>x+maxW&&cx>x){cx=x;cy+=legendSize+8;}
   const sw=it.kind==='line'?ln(cx,cy-legendSize*.32,cx+12,cy-legendSize*.32,it.colour,'stroke-width="3" stroke-linecap="round"'):it.kind==='hollow'?`<circle cx="${cx+6}" cy="${cy-legendSize*.32}" r="4.5" fill="${B}" stroke="${it.colour}" stroke-width="2"/>`:it.kind==='dot'?`<circle cx="${cx+6}" cy="${cy-legendSize*.32}" r="5" fill="${it.colour}"/>`:`<rect x="${cx}" y="${cy-legendSize*.75}" width="12" height="12" rx="2" fill="${it.colour}"/>`;
   out+=sw+t(cx+17,cy,it.label,{size:legendSize});cx+=w;}
  return {svg:`<g data-viz-part="legend">${out}</g>`,height:cy-y+legendSize+10};};
 const showLegend=s.showLegend!==false;
 const yAxis=(sc,yy,x0,x1,opts={})=>{let o='';for(const v of sc.ticks){const y=yy(v);if(s.showGrid!==false&&!opts.noGrid)o+=ln(x0,y,x1,y,G,v===0?`stroke-width="1.2"`:'stroke-width="1"');if(s.showAxes!==false)o+=t(opts.right?x1+8:x0-8,y+axisSize*.35,fmt(v),{size:axisSize,anchor:opts.right?'start':'end',fill:opts.colour||T,opacity:'.75'});}return `<g data-viz-part="${opts.right?'y-axis':'y-axis'}">${o}</g>`;};
 const xAxisBottom=(sc,xx,y0,y1)=>{let o='';for(const v of sc.ticks){const x=xx(v);if(s.showGrid!==false)o+=ln(x,y0,x,y1,G,v===0?'stroke-width="1.2"':'');if(s.showAxes!==false)o+=t(x,y1+axisSize+6,fmt(v),{size:axisSize,anchor:'middle',opacity:'.75'});}return `<g data-viz-part="x-axis">${o}</g>`;};
 const bandLabels=(keys,xx,y,maxW)=>{const every=Math.max(1,Math.ceil(keys.length*(Math.min(maxW,Math.max(...keys.map(k=>textW(cut(k,14),axisSize))))+16)/Math.max(1,pw)));return `<g data-viz-part="x-axis">${keys.map((k,i)=>i%every===0?t(xx(i),y,cut(k,14),{size:axisSize,anchor:'middle',opacity:'.8'}):'').join('')}</g>`;};
 const empty=msg=>t(left+pw/2,top+ph/2,msg,{anchor:'middle',size:14,opacity:'.7'});
 let out='';

 if(type==='pie'){
  const max=clamp(Math.round(Number(proOption(s,'pieMaxSlices'))||8),2,20);
  const items=topWithOther(sorted(group(rows,s.x,s.y,agg(s)).filter(g=>g.value>0),proOption(s,'proSort')),max),total=items.reduce((a,g)=>a+g.value,0);if(!total)return empty('No positive values to show.');
  const mode=proOption(s,'pieLabels'),legendW=mode==='legend'?Math.min(240,pw*.38):0,labelRoom=mode==='outside'?Math.min(150,pw*.24):0;
  const radius=Math.max(30,Math.min((pw-legendW)/2-labelRoom-6,ph/2-14)),cx=left+(pw-legendW)/2,cy=top+ph/2;let a=-Math.PI/2;const labels=[];
  items.forEach((g,i)=>{const frac=g.value/total,a1=a+frac*Math.PI*2,cl=g.key==='Other'?'#a7b1bc':colour(g.key,i),mid=(a+a1)/2,pct=frac*100;
   out+=mark(g.key,`${g.key}: ${fmt(g.value)} (${pct.toFixed(1)}%)${g.other?` · combines ${g.other} categories`:''}`,`<path d="${sector(cx,cy,0,radius,a,a1)}" fill="${cl}" stroke="${B}" stroke-width="1.5"/>`);
   labels.push({g,mid,pct,cl});a=a1;});
  if(mode==='inside'){for(const l of labels){if(l.pct<4)continue;const [x,y]=polar(cx,cy,radius*.66,l.mid);out+=t(x,y-2,cut(l.g.key,12),{anchor:'middle',fill:'#ffffff',weight:600,size:Math.max(9,size-1)})+t(x,y+size,`${l.pct.toFixed(0)}%`,{anchor:'middle',fill:'#ffffff',size:Math.max(9,size-1)});}}
  else if(mode==='outside'){
   const sides={l:[],r:[]};for(const l of labels){const [x,y]=polar(cx,cy,radius+14,l.mid);(Math.cos(l.mid)>=0?sides.r:sides.l).push({...l,x,y});}
   for(const [side,list] of Object.entries(sides)){list.sort((p,q)=>p.y-q.y);const gap=size*2.3;for(let i=1;i<list.length;i++)if(list[i].y-list[i-1].y<gap)list[i].y=list[i-1].y+gap;const over=list.length?list[list.length-1].y-(top+ph-size*1.6):0;if(over>0)for(const l of list)l.y-=over;for(let i=list.length-2;i>=0;i--)if(list[i+1].y-list[i].y<gap)list[i].y=list[i+1].y-gap;const under=list.length?top+size-list[0].y:0;if(under>0){for(const l of list)l.y+=under;}
    for(const l of list){const [ax,ay]=polar(cx,cy,radius+2,l.mid),ex=side==='r'?cx+radius+20:cx-radius-20,anchor=side==='r'?'start':'end',tx=side==='r'?ex+6:ex-6;
     out+=`<path d="M${r2(ax)},${r2(ay)}L${r2(l.x)},${r2(l.y)}L${r2(ex)},${r2(l.y)}" fill="none" stroke="${T}" stroke-opacity=".35"/>`+t(tx,l.y-1,cut(l.g.key,22),{anchor,weight:600,extra:'data-viz-part="labels"'})+t(tx,l.y+size+1,`${l.pct.toFixed(l.pct<10?1:0)}% · ${fmt(l.g.value)}`,{anchor,size:Math.max(9,size-1),opacity:'.72'});}}
  }else{const lx=left+pw-legendW+12;labels.forEach((l,i)=>{const y=cy-labels.length*(size+10)/2+i*(size+10)+size;out+=`<rect x="${lx}" y="${y-size*.8}" width="12" height="12" rx="2" fill="${l.cl}"/>`+t(lx+18,y,`${cut(l.g.key,20)} — ${l.pct.toFixed(1)}%`,{size:legendSize});});}
  return out;
 }

 if(type==='waffle'){
  const items=sorted(group(rows,s.x,s.y,agg(s)).filter(g=>g.value>0),proOption(s,'proSort')).slice(0,10),total=items.reduce((a,g)=>a+g.value,0);if(!total)return empty('No positive values to show.');
  const exact=items.map(g=>g.value/total*100),cells=exact.map(Math.floor);let rem=100-cells.reduce((a,b)=>a+b,0);exact.map((v,i)=>[v-Math.floor(v),i]).sort((a,b)=>b[0]-a[0]).slice(0,rem).forEach(([,i])=>cells[i]++);
  const legendW=Math.min(260,pw*.42),gridSize=Math.min(ph-4,pw-legendW-24),cell=gridSize/10,gap=Math.max(1.5,cell*.12),gx=left,gy=top+(ph-gridSize)/2,circle=proOption(s,'waffleShape')==='circle';
  let idx=0;items.forEach((g,i)=>{const cl=colour(g.key,i);let squares='';for(let k=0;k<cells[i];k++,idx++){const row=Math.floor(idx/10),col=idx%10,x=gx+col*cell,y=gy+row*cell;squares+=circle?`<circle cx="${r2(x+cell/2)}" cy="${r2(y+cell/2)}" r="${r2((cell-gap)/2)}" fill="${cl}"/>`:`<rect x="${r2(x+gap/2)}" y="${r2(y+gap/2)}" width="${r2(cell-gap)}" height="${r2(cell-gap)}" rx="${r2(Math.min(3,cell*.12))}" fill="${cl}"/>`;}
   out+=mark(g.key,`${g.key}: ${fmt(g.value)} (${exact[i].toFixed(1)}% · ${cells[i]} squares)`,squares);});
  const lx=gx+gridSize+28,lh=Math.min(54,ph/Math.max(1,items.length));items.forEach((g,i)=>{const y=top+(ph-lh*items.length)/2+i*lh+lh/2;out+=`<rect x="${lx}" y="${y-size}" width="14" height="14" rx="3" fill="${colour(g.key,i)}"/>`+t(lx+22,y-1,cut(g.key,24),{weight:600})+t(lx+22,y+size+2,`${exact[i].toFixed(1)}% · ${fmt(g.value)}`,{size:Math.max(9,size-1),opacity:'.7'});});
  return out;
 }

 if(type==='lollipop'){
  const items=sorted(group(rows,s.x,s.y,agg(s)),proOption(s,'proSort')).slice(0,40);if(!items.length)return empty('No values to show.');
  const labelW=Math.min(pw*.32,Math.max(40,...items.map(g=>textW(cut(g.key,26),size)))+12),x0=left+labelW,w=pw-labelW-40,sc=dom(Math.min(0,...items.map(g=>g.value)),Math.max(0,...items.map(g=>g.value)),Number(s.tickCount)||5),xx=v=>x0+(v-sc.lo)/(sc.hi-sc.lo)*w,step=(ph-26)/items.length;
  out+=xAxisBottom(sc,xx,top,top+ph-26);const r=clamp(step*.22,3,7),lolOk=labelPicker(s,items.map(g=>g.value));
  items.forEach((g,i)=>{const y=top+(i+.5)*step,cl=colour(g.key,0);out+=t(x0-10,y+size*.35,cut(g.key,26),{anchor:'end'})+mark(g.key,`${g.key}: ${fmt(g.value)}`,ln(xx(0),y,xx(g.value),y,cl,'stroke-width="2"')+`<circle cx="${r2(xx(g.value))}" cy="${r2(y)}" r="${r}" fill="${cl}"/>`);
   if(s.showLabels!==false&&lolOk(i))out+=t(xx(g.value)+(g.value<0?-r-5:r+5),y+size*.35,fmt(g.value),{anchor:g.value<0?'end':'start',size:Math.max(9,size-1),opacity:'.85',extra:'data-viz-part="labels"'});});
  return out;
 }

 if(type==='funnel'){
  const items=group(rows,s.x,s.y,agg(s)).filter(g=>g.value>=0).slice(0,14);if(!items.length)return empty('No values to show.');
  const first=items[0].value||1,max=Math.max(...items.map(g=>g.value),...(D?[D.hi]:[]))||1,labelW=Math.min(pw*.26,Math.max(...items.map(g=>textW(cut(g.key,24),size)))+16),cx=left+labelW+(pw-labelW-110)/2,maxW=pw-labelW-110,step=ph/items.length,bh=step*.68,tapered=proOption(s,'funnelShape')==='tapered';
  items.forEach((g,i)=>{const w=Math.max(2,g.value/max*maxW),y=top+i*step+(step-bh)/2,cl=colour(g.key,0),next=items[i+1];
   let shape;if(tapered){const nw=next?Math.max(2,next.value/max*maxW):w;shape=`<path d="M${r2(cx-w/2)},${r2(y)}L${r2(cx+w/2)},${r2(y)}L${r2(cx+nw/2)},${r2(y+bh)}L${r2(cx-nw/2)},${r2(y+bh)}Z" fill="${cl}" fill-opacity="${1-i*.5/items.length}"/>`;}
   else shape=`<rect x="${r2(cx-w/2)}" y="${r2(y)}" width="${r2(w)}" height="${r2(bh)}" rx="3" fill="${cl}" fill-opacity="${1-i*.5/items.length}"/>`;
   if(next&&!tapered){const nw=Math.max(2,next.value/max*maxW);out+=`<path d="M${r2(cx-w/2)},${r2(y+bh)}L${r2(cx+w/2)},${r2(y+bh)}L${r2(cx+nw/2)},${r2(y+step)}L${r2(cx-nw/2)},${r2(y+step)}Z" fill="${cl}" fill-opacity=".12"/>`;}
   out+=mark(g.key,`${g.key}: ${fmt(g.value)} · ${(g.value/first*100).toFixed(1)}% of first stage${i?` · ${(items[i-1].value?g.value/items[i-1].value*100:0).toFixed(1)}% of previous`:''}`,shape);
   out+=t(left+labelW-12,y+bh/2+size*.35,cut(g.key,24),{anchor:'end',weight:600});
   out+=t(cx+maxW/2+14,y+bh/2-1,fmt(g.value),{weight:700})+t(cx+maxW/2+14,y+bh/2+size+1,i?`${(items[i-1].value?g.value/items[i-1].value*100:0).toFixed(0)}% of previous`:'100%',{size:Math.max(9,size-2),opacity:'.65'});});
  return out;
 }

 if(type==='combo'){
  const colsG=group(rows,s.x,s.y,agg(s)),lineMode=proOption(s,'comboLineAgg')==='same'?(agg(s)==='count'?'sum':agg(s)):proOption(s,'comboLineAgg'),lineG=group(rows,s.x,s.endField,lineMode);
  const keys=orderKeys([...new Set([...colsG.map(g=>g.key),...lineG.map(g=>g.key)])]).slice(0,60),cv=new Map(colsG.map(g=>[g.key,g.value])),lv=new Map(lineG.map(g=>[g.key,g.value]));if(!keys.length)return empty('No values to show.');
  const dual=proOption(s,'comboAxis')!=='shared',lineColour=hex(s.secondary,'#f2aa64');
  const lg=showLegend?legend([{label:s.y,colour:C},{label:s.endField||'Line',colour:lineColour,kind:'line'}],left,top+legendSize,pw):{svg:'',height:0};out+=lg.svg;
  const t0=top+lg.height+6,cvals=[...cv.values()],lvals=[...lv.values()];
  const scL=dom(Math.min(0,...cvals,...(dual?[]:lvals)),Math.max(0,...cvals,...(dual?[]:lvals)),Number(s.tickCount)||5),scR=dual?niceScale(Math.min(0,...lvals,...(D2?[D2.lo]:[])),Math.max(0,...lvals,...(D2?[D2.hi]:[])),scL.ticks.length):scL;
  const rightPad=dual?Math.max(...scR.ticks.map(v=>textW(fmt(v),axisSize)))+12:0,x1=right-rightPad,w=x1-left,yb=bottom-4,h=yb-t0,yl=v=>yb-(v-scL.lo)/(scL.hi-scL.lo)*h,yr=v=>yb-(v-scR.lo)/(scR.hi-scR.lo)*h,band=w/keys.length,xx=i=>left+band*(i+.5);
  const comboOk=labelPicker(s,keys.map(k=>cv.get(k))),comboPlace=labelPlacer(s);out+=yAxis(scL,yl,left,x1);if(dual)out+=yAxis(scR,yr,left,x1,{right:true,noGrid:true,colour:lineColour});
  keys.forEach((k,i)=>{const v=cv.get(k);if(v===undefined)return;const y=yl(Math.max(0,v)),h0=Math.abs(yl(v)-yl(0)),bw=band*clamp(Number(s.barWidthRatio)||.62,.2,.95);out+=mark(k,`${k}: ${s.y} ${fmt(v)}${lv.has(k)?` · ${s.endField} ${fmt(lv.get(k))}`:''}`,`<rect x="${r2(xx(i)-bw/2)}" y="${r2(v>=0?y:yl(0))}" width="${r2(bw)}" height="${r2(h0)}" rx="${clamp(Number(s.barRadius)||2,0,12)}" fill="${hex(s.pointColors?.[k],C)}"/>`);if(s.showLabels&&comboOk(i)&&comboPlace(xx(i),(v>=0?y-5:yl(v)+size+3),fmt(v),Math.max(9,size-1)))out+=t(xx(i),(v>=0?y-5:yl(v)+size+3),fmt(v),{anchor:'middle',size:Math.max(9,size-1),extra:'data-viz-part="labels"'});});
  let seg=[];const segs=[];keys.forEach((k,i)=>{if(lv.has(k))seg.push([xx(i),yr(lv.get(k))]);else if(seg.length){segs.push(seg);seg=[];}});if(seg.length)segs.push(seg);
  for(const sg of segs)out+=`<path d="M${sg.map(p=>p.map(r2).join(',')).join('L')}" fill="none" stroke="${lineColour}" stroke-width="${clamp(Number(s.lineWidth)||2.5,1,8)}" stroke-linejoin="round" stroke-linecap="round" data-viz-part="series"/>`;
  keys.forEach((k,i)=>{if(!lv.has(k))return;out+=mark(k+' (line)',`${k}: ${s.endField} ${fmt(lv.get(k))}`,`<circle cx="${r2(xx(i))}" cy="${r2(yr(lv.get(k)))}" r="3.5" fill="${B}" stroke="${lineColour}" stroke-width="2"/>`);});
  out+=bandLabels(keys,xx,yb+axisSize+8,90);
  return out;
 }

 if(type==='split-bars'){
  const m=group2(rows,s.x,s.seriesField,s.y,agg(s)),panels=m.series.slice(0,6);let cats=m.cats.slice(0,30);if(!panels.length||!cats.length)return empty('Map a category and a panel field.');
  if(proOption(s,'proSort')==='desc')cats=[...cats].sort((a,b)=>(m.get(b,panels[0])??-Infinity)-(m.get(a,panels[0])??-Infinity));
  const labelW=Math.min(pw*.28,Math.max(...cats.map(c=>textW(cut(c,24),size)))+14),gap=18,panelW=(pw-labelW-gap*(panels.length-1))/panels.length,headH=size*2+6,step=(ph-headH)/cats.length,bh=Math.min(28,step*.66),shared=proOption(s,'splitScale')!=='independent';
  const all=panels.flatMap(p=>cats.map(c=>m.get(c,p)).filter(v=>v!==undefined)),gmax=Math.max(0,...all,...(D?[D.hi]:[])),gmin=Math.min(0,...all,...(D?[D.lo]:[]));
  cats.forEach((c,i)=>{const y=top+headH+i*step+step/2;out+=t(left+labelW-10,y+size*.35,cut(c,24),{anchor:'end'});if(i%2===0)out+=`<rect x="${left}" y="${r2(y-step/2)}" width="${pw}" height="${r2(step)}" fill="${G}" fill-opacity=".25"/>`;});
  panels.forEach((p,j)=>{const px=left+labelW+j*(panelW+gap),vals=cats.map(c=>m.get(c,p)).filter(v=>v!==undefined),mx=shared?gmax:Math.max(0,...vals),mn=shared?gmin:Math.min(0,...vals),valueRoom=textW(fmt(mx||1),size)+8,bw=panelW-valueRoom,z=px+(mn<0?(-mn)/(mx-mn||1)*bw:0),sc=v=>v/((mx-mn)||1)*bw,cl=colour(p,j);
   out+=t(px,top+size+2,cut(p,Math.max(6,Math.floor(panelW/(size*.58)))),{weight:700})+ln(px,top+headH-6,px+panelW,top+headH-6,T,'stroke-opacity=".5"');
   cats.forEach((c,i)=>{const v=m.get(c,p),y=top+headH+i*step+step/2;if(v===undefined){out+=t(px,y+size*.35,'–',{opacity:'.5'});return;}const w=Math.abs(sc(v));out+=mark(c+' · '+p,`${c} · ${p}: ${fmt(v)}`,`<rect x="${r2(v>=0?z:z-w)}" y="${r2(y-bh/2)}" width="${r2(Math.max(w,.5))}" height="${r2(bh)}" rx="2" fill="${cl}"/>`);if(proOption(s,'splitValues')!==false)out+=t(v>=0?z+w+4:z-w-4,y+size*.35,fmt(v),{anchor:v>=0?'start':'end',size:Math.max(9,size-1),extra:'data-viz-part="labels"'});});});
  return out;
 }

 if(type==='range-plot'||type==='arrow-plot'){
  const items=pairModel(rows,s);if(!items.length)return empty('Map a category and two numerical measures.');
  const startC=hex(s.secondary,'#f2aa64'),endC=C,arrow=type==='arrow-plot';
  const lg=showLegend?legend([{label:s.y,colour:arrow?T:startC,kind:arrow?'hollow':'dot'},{label:s.endField,colour:endC,kind:'dot'}],left,top+legendSize,pw):{svg:'',height:0};out+=lg.svg;
  const t0=top+lg.height+4,labelW=Math.min(pw*.3,Math.max(...items.map(g=>textW(cut(g.key,26),size)))+14),x0=left+labelW,w=pw-labelW-12,vals=items.flatMap(g=>[g.start,g.end]),sc=dom(Math.min(...vals),Math.max(...vals),Number(s.tickCount)||5),xx=v=>x0+(v-sc.lo)/(sc.hi-sc.lo)*w,step=(bottom-26-t0)/items.length;
  out+=xAxisBottom(sc,xx,t0,bottom-26);const r=clamp(step*.2,3.5,7),rangeOk=labelPicker(s,items.map(g=>g.end-g.start));
  items.forEach((g,i)=>{const y=t0+(i+.5)*step,a=xx(g.start),z=xx(g.end),dir=Math.sign(z-a)||1,cl=arrow?(g.end>=g.start?endC:hex(s.secondary,'#d4818d')):T;
   let body=ln(a,y,arrow?z-dir*Math.min(Math.abs(z-a),r*1.4):z,y,arrow?cl:G,`stroke-width="${arrow?2.5:Math.max(3,r*.9)}" stroke-linecap="round"`);
   if(arrow)body+=`<circle cx="${r2(a)}" cy="${r2(y)}" r="${r2(r*.75)}" fill="${B}" stroke="${cl}" stroke-width="1.8"/>`+(Math.abs(z-a)>1?`<path d="M${r2(z)},${r2(y)}l${r2(-dir*r*2.1)},${r2(-r*1.2)}v${r2(r*2.4)}Z" fill="${cl}"/>`:'');
   else body+=`<circle cx="${r2(a)}" cy="${r2(y)}" r="${r}" fill="${startC}"/><circle cx="${r2(z)}" cy="${r2(y)}" r="${r}" fill="${endC}"/>`;
   out+=t(x0-10,y+size*.35,cut(g.key,26),{anchor:'end'})+mark(g.key,`${g.key}: ${s.y} ${fmt(g.start)} → ${s.endField} ${fmt(g.end)} (change ${g.end-g.start>=0?'+':''}${fmt(g.end-g.start)})`,body);
   if(s.showLabels!==false&&step>=16&&rangeOk(i)){const lo=Math.min(a,z),hi=Math.max(a,z),loV=a<=z?g.start:g.end,hiV=a<=z?g.end:g.start;out+=t(lo-r-5,y+size*.35,fmt(loV),{anchor:'end',size:Math.max(9,size-2),opacity:'.75',extra:'data-viz-part="labels"'})+t(hi+r+5,y+size*.35,fmt(hiV),{size:Math.max(9,size-2),opacity:'.75',extra:'data-viz-part="labels"'});}});
  return out;
 }

 if(type==='bullet'){
  const a=group(rows,s.x,s.y,agg(s)),tg=has(rows,s.endField)?new Map(group(rows,s.x,s.endField,agg(s)==='count'?'sum':agg(s)).map(g=>[g.key,g.value])):new Map(),mxF=has(rows,s.upperField)?new Map(group(rows,s.x,s.upperField,'max').map(g=>[g.key,g.value])):new Map();
  const items=a.slice(0,24);if(!items.length)return empty('No values to show.');
  const lg=showLegend?legend([{label:s.y||'Actual',colour:C},...(tg.size?[{label:s.endField,colour:T,kind:'line'}]:[]),...(mxF.size?[{label:s.upperField,colour:G}]:[])],left,top+legendSize,pw):{svg:'',height:0};out+=lg.svg;
  const t0=top+lg.height+4,labelW=Math.min(pw*.3,Math.max(...items.map(g=>textW(cut(g.key,24),size)))+14),x0=left+labelW,w=pw-labelW-56,vals=items.flatMap(g=>[g.value,tg.get(g.key),mxF.get(g.key)]).filter(Number.isFinite),sc=dom(Math.min(0,...vals),Math.max(0,...vals),Number(s.tickCount)||5),xx=v=>x0+(v-sc.lo)/(sc.hi-sc.lo)*w,step=(bottom-26-t0)/items.length,bh=Math.min(36,step*.62);
  out+=xAxisBottom(sc,xx,t0,bottom-26);
  items.forEach((g,i)=>{const y=t0+(i+.5)*step,target=tg.get(g.key),mx=mxF.get(g.key),miss=Number.isFinite(target)&&g.value<target&&proOption(s,'bulletColourByTarget')!==false,cl=miss?hex(s.secondary,'#e6aa67'):hex(s.pointColors?.[g.key],C);
   let body=`<rect x="${r2(xx(Math.min(0,sc.lo)))}" y="${r2(y-bh/2)}" width="${r2(xx(Number.isFinite(mx)?mx:sc.hi)-xx(Math.min(0,sc.lo)))}" height="${r2(bh)}" rx="2" fill="${G}" fill-opacity=".7"/>`;
   if(Number.isFinite(target))body+=`<rect x="${r2(xx(0))}" y="${r2(y-bh*.32)}" width="${r2(Math.max(0,xx(target)-xx(0)))}" height="${r2(bh*.64)}" fill="${T}" fill-opacity=".14"/>`;
   body+=`<rect x="${r2(Math.min(xx(0),xx(g.value)))}" y="${r2(y-bh*.2)}" width="${r2(Math.abs(xx(g.value)-xx(0)))}" height="${r2(bh*.4)}" rx="1.5" fill="${cl}"/>`;
   if(Number.isFinite(target))body+=ln(xx(target),y-bh*.42,xx(target),y+bh*.42,T,'stroke-width="3"');
   out+=t(x0-10,y+size*.35,cut(g.key,24),{anchor:'end',weight:600})+mark(g.key,`${g.key}: ${fmt(g.value)}${Number.isFinite(target)?` · target ${fmt(target)} (${target?((g.value/target)*100).toFixed(0):'–'}%)`:''}${Number.isFinite(mx)?` · max ${fmt(mx)}`:''}`,body);
   out+=t(x0+w+8,y+size*.35,Number.isFinite(target)&&target?`${(g.value/target*100).toFixed(0)}%`:fmt(g.value),{weight:700,size:Math.max(9,size-1),fill:miss?hex(s.secondary,'#c27b2c'):T,extra:'data-viz-part="labels"'});});
  return out;
 }

 if(type==='gauge'){
  const items=group(rows,has(rows,s.x)?s.x:null,s.y,agg(s)).slice(0,6),targets=has(rows,s.endField)?new Map(group(rows,has(rows,s.x)?s.x:null,s.endField,agg(s)==='count'?'sum':agg(s)).map(g=>[g.key,g.value])):new Map();if(!items.length)return empty('No values to show.');
  const min=Number.isFinite(Number(proOption(s,'gaugeMin')))?Number(proOption(s,'gaugeMin')):0,manualMax=present(s.gaugeMax)&&Number.isFinite(Number(s.gaugeMax))?Number(s.gaugeMax):null;
  const cols=items.length<=3?items.length:Math.ceil(items.length/2),rowsN=Math.ceil(items.length/cols),cw=pw/cols,ch=ph/rowsN;
  items.forEach((g,i)=>{const target=targets.get(g.key),max=manualMax!==null&&manualMax>min?manualMax:niceScale(min,Math.max(g.value,Number.isFinite(target)?target:-Infinity,D?D.hi:-Infinity,min+1e-9),5).hi,cx=left+cw*(i%cols+.5),r=Math.min(cw*.42,(ch-size*3.6)*.95),cy=top+ch*Math.floor(i/cols)+Math.max(0,(ch-(r+size*3.4))/2)+r,thick=r*.2,frac=clamp((g.value-min)/(max-min||1),0,1),a0=Math.PI,a1=Math.PI+frac*Math.PI;
   let body=`<path d="${sector(cx,cy,r-thick,r,Math.PI,Math.PI*2)}" fill="${G}"/>`+(frac>0?`<path d="${sector(cx,cy,r-thick,r,a0,a1)}" fill="${hex(s.pointColors?.[g.key],C)}"/>`:'');
   if(Number.isFinite(target)){const ta=Math.PI+clamp((target-min)/(max-min||1),0,1)*Math.PI,[x1,y1]=polar(cx,cy,r-thick-4,ta),[x2,y2]=polar(cx,cy,r+5,ta);body+=ln(x1,y1,x2,y2,T,'stroke-width="3" stroke-linecap="round"');}
   out+=mark(g.key,`${g.key==='All'?s.y:g.key}: ${fmt(g.value)} on a ${fmt(min)}–${fmt(max)} scale${Number.isFinite(target)?` · target ${fmt(target)}`:''}`,body);
   out+=t(cx,cy-r*.12,fmt(g.value),{anchor:'middle',size:clamp(r*.36,14,64),weight:700})+t(cx,cy+size*1.4,g.key==='All'?(s.y||''):cut(g.key,26),{anchor:'middle',opacity:'.75'})+t(cx-r+thick/2,cy+size+4,fmt(min),{anchor:'middle',size:Math.max(9,size-2),opacity:'.6'})+t(cx+r-thick/2,cy+size+4,fmt(max),{anchor:'middle',size:Math.max(9,size-2),opacity:'.6'});
   if(Number.isFinite(target))out+=t(cx,cy+size*2.8,`Target ${fmt(target)}`,{anchor:'middle',size:Math.max(9,size-2),opacity:'.6'});});
  return out;
 }

 if(type==='kpi'){
  const keyField=has(rows,s.x)?s.x:null,items=group(rows,keyField,s.y,agg(s)).slice(0,12),comp=has(rows,s.endField)?new Map(group(rows,keyField,s.endField,agg(s)==='count'?'sum':agg(s)).map(g=>[g.key,g.value])):new Map();if(!items.length)return empty('No values to show.');
  const manual=Math.round(Number(proOption(s,'kpiColumns'))||0),cols=manual>0?Math.min(manual,items.length):items.length<=4?items.length:Math.ceil(items.length/Math.ceil(items.length/4)),rowsN=Math.ceil(items.length/cols),gap=16,cw=(pw-gap*(cols-1))/cols,ch=Math.min(200,(ph-gap*(rowsN-1))/rowsN),oy=top+(ph-(ch*rowsN+gap*(rowsN-1)))/2,deltaMode=proOption(s,'kpiDelta'),good=proOption(s,'kpiGood');
  items.forEach((g,i)=>{const x=left+(i%cols)*(cw+gap),y=oy+Math.floor(i/cols)*(ch+gap),c=comp.get(g.key),valueSize=clamp(Math.min(ch*.32,(cw-40)/Math.max(2,fmt(g.value).length*.62)),14,72);
   let body=`<rect x="${r2(x)}" y="${r2(y)}" width="${r2(cw)}" height="${r2(ch)}" rx="10" fill="${B}" stroke="${G}" stroke-width="1.2"/><rect x="${r2(x)}" y="${r2(y)}" width="4" height="${r2(ch)}" rx="2" fill="${hex(s.pointColors?.[g.key],C)}"/>`;
   body+=t(x+20,y+size+16,cut(g.key==='All'?(s.y||'Total'):g.key,Math.floor(cw/(size*.6))),{weight:600,opacity:'.75'})+t(x+20,y+ch*.38+valueSize*.55,fmt(g.value),{size:valueSize,weight:700,extra:'letter-spacing="-0.5"'});
   if(Number.isFinite(c)&&deltaMode!=='none'){const diff=g.value-c,pct=c?diff/Math.abs(c)*100:NaN,up=diff>0,flat=diff===0,positive=good==='neutral'?null:good==='up'?up:!up,dc=flat||positive===null?T:positive?'#1a8754':'#c0392b',label=deltaMode==='absolute'?`${diff>=0?'+':''}${fmt(diff)}`:Number.isFinite(pct)?`${pct>=0?'+':''}${pct.toFixed(1)}%`:'n/a';
    const vs=`vs ${s.endField} ${fmt(c)}`,dsz=Math.max(10,size),inline=textW(`▲ ${label}  ${vs}`,dsz)<cw-36;body+=t(x+20,y+ch-(inline?18:34),`${flat?'■':up?'▲':'▼'} ${label}`,{weight:700,fill:dc,size:dsz})+t(inline?x+20+textW(`▲ ${label}`,dsz)+10:x+20,y+ch-18,cut(vs,Math.floor((cw-36)/(Math.max(9,size-2)*.56))),{size:Math.max(9,size-2),opacity:'.6'});}
   out+=mark(g.key,`${g.key==='All'?s.y:g.key}: ${fmt(g.value)}${Number.isFinite(c)?` · ${s.endField} ${fmt(c)}`:''}`,body);});
  return out;
 }

 if(type==='candlestick'){
  const d=candleModel(rows,s);if(!d.length)return empty('Map open, close, low and high columns.');
  const finance=proOption(s,'candleColours')!=='brand',up=finance?'#1a9850':C,down=finance?'#d73027':hex(s.secondary,'#e6aa67'),sc=dom(Math.min(...d.map(c=>c.low)),Math.max(...d.map(c=>c.high)),Number(s.tickCount)||5),yy=v=>bottom-24-(v-sc.lo)/(sc.hi-sc.lo)*(ph-24),band=pw/d.length,xx=i=>left+band*(i+.5),bw=Math.max(1,band*.62);
  out+=yAxis(sc,yy,left,right);
  d.forEach((c,i)=>{const cl=c.close>=c.open?up:down,y0=yy(Math.max(c.open,c.close)),y1=yy(Math.min(c.open,c.close));out+=mark(c.key,`${c.key}: open ${fmt(c.open)} · high ${fmt(c.high)} · low ${fmt(c.low)} · close ${fmt(c.close)}`,ln(xx(i),yy(c.high),xx(i),yy(c.low),cl,'stroke-width="1.2"')+`<rect x="${r2(xx(i)-bw/2)}" y="${r2(y0)}" width="${r2(bw)}" height="${r2(Math.max(1,y1-y0))}" fill="${c.close>=c.open&&finance?B:cl}" stroke="${cl}" stroke-width="1.2"/>`);});
  out+=bandLabels(d.map(c=>c.key),xx,bottom-24+axisSize+8,80);
  if(showLegend)out+=legend([{label:'Close ≥ open',colour:up},{label:'Close < open',colour:down}],right-230,top-6,230).svg;
  return out;
 }

 if(type==='radar'){
  const series=has(rows,s.seriesField)&&s.seriesField!==s.x,m=group2(rows,s.x,series?s.seriesField:null,s.y,agg(s)),dims=m.cats.slice(0,16),ser=m.series.slice(0,8);if(dims.length<3)return empty('A radar chart needs at least three dimensions.');
  const all=ser.flatMap(g=>dims.map(d=>m.get(d,g))).filter(v=>v!==undefined),manual=present(s.radarMax)&&Number(s.radarMax)>0?Number(s.radarMax):null,sc=niceScale(0,manual??Math.max(1e-9,...all,...(D?[D.hi]:[])),5),max=manual??sc.hi;
  const lg=showLegend&&ser.length>1?legend(ser.map((g,i)=>({label:g,colour:colour(g,i)})),left,top+legendSize,pw):{svg:'',height:0};out+=lg.svg;
  const t0=top+lg.height,cx=left+pw/2,cy=t0+(bottom-t0)/2,R=Math.max(30,Math.min(pw/2-80,(bottom-t0)/2-size*1.6)),ang=i=>-Math.PI/2+i*2*Math.PI/dims.length;
  for(const v of sc.ticks.filter(v=>v>0&&v<=max)){const rr=v/max*R;out+=`<path d="${dims.map((_,i)=>(i?'L':'M')+polar(cx,cy,rr,ang(i)).map(r2).join(',')).join('')}Z" fill="none" stroke="${G}" data-viz-part="grid"/>`+t(cx+3,cy-rr-2,fmt(v),{size:Math.max(8,axisSize-2),opacity:'.6'});}
  dims.forEach((d,i)=>{const [x,y]=polar(cx,cy,R,ang(i)),[lx,ly]=polar(cx,cy,R+12,ang(i)),c=Math.cos(ang(i));out+=ln(cx,cy,x,y,G)+t(lx,ly+(Math.sin(ang(i))>.3?size:Math.sin(ang(i))<-.3?-2:size*.35),cut(d,18),{anchor:Math.abs(c)<.25?'middle':c>0?'start':'end',weight:600,size:Math.max(9,size-1)});});
  const fill=proOption(s,'radarFill')!==false;
  ser.forEach((g,j)=>{const cl=colour(g,j),pts=dims.map((d,i)=>{const v=m.get(d,g);return v===undefined?null:polar(cx,cy,clamp(v/max,0,1.05)*R,ang(i));});const valid=pts.every(Boolean);
   const path=valid?`M${pts.map(p=>p.map(r2).join(',')).join('L')}Z`:pts.map((p,i)=>p?(i&&pts[i-1]?'L':'M')+p.map(r2).join(','):'').join('');
   out+=mark(g,`${g==='Value'?s.y:g}: ${dims.map(d=>`${d} ${m.get(d,g)===undefined?'missing':fmt(m.get(d,g))}`).join(' · ')}`,`<path d="${path}" fill="${fill&&valid?cl:'none'}" fill-opacity="${ser.length>1?.12:.22}" stroke="${cl}" stroke-width="2.2" stroke-linejoin="round"/>${pts.filter(Boolean).map(p=>`<circle cx="${r2(p[0])}" cy="${r2(p[1])}" r="3" fill="${cl}"/>`).join('')}`);});
  return out;
 }

 if(type==='beeswarm'){
  const grouped=has(rows,s.x)&&s.x!==s.y,obs=[];for(const r of rows){const v=num(r[s.y]);if(!Number.isFinite(v))continue;const g=grouped?r[s.x]:'All';if(!present(g))continue;obs.push({g:String(g),v,label:has(rows,s.labelField)?String(r[s.labelField]??''):''});if(obs.length>=1500)break;}
  if(!obs.length)return empty('Map a numerical field.');
  const groups=[...new Set(obs.map(o=>o.g))].slice(0,12),labelW=grouped?Math.min(pw*.25,Math.max(...groups.map(g=>textW(cut(g,20),size)))+14):0,x0=left+labelW,w=pw-labelW-8,sc=dom(Math.min(...obs.map(o=>o.v)),Math.max(...obs.map(o=>o.v)),Number(s.tickCount)||5),xx=v=>x0+(v-sc.lo)/(sc.hi-sc.lo)*w,laneH=(ph-26)/groups.length,r=clamp(Number(proOption(s,'swarmRadius'))||4,1.5,12);
  out+=xAxisBottom(sc,xx,top,top+ph-26);
  groups.forEach((g,gi)=>{const cy=top+(gi+.5)*laneH,cl=grouped?colour(g,gi):C,pts=obs.filter(o=>o.g===g).map(o=>({...o,x:xx(o.v)})).sort((a,b)=>a.x-b.x),placed=[],limit=laneH/2-r;let marks='';
   for(const p of pts){const near=placed.filter(q=>Math.abs(q.x-p.x)<2*r);let best=0;if(near.length){const cands=[0];for(const q of near){const dy=Math.sqrt(Math.max(0,4*r*r-(q.x-p.x)**2))+.01;cands.push(q.y+dy,q.y-dy);}cands.sort((a,b)=>Math.abs(a)-Math.abs(b));best=cands.find(c=>near.every(q=>(q.x-p.x)**2+(q.y-c)**2>=4*r*r-.01))??0;}
    p.y=best;placed.push(p);const shown=clamp(best,-limit,limit);marks+=`<circle cx="${r2(p.x)}" cy="${r2(cy+shown)}" r="${r}" fill="${cl}" fill-opacity="${Math.abs(best)>limit?.35:.8}" stroke="${B}" stroke-width=".6"><title>${esc((p.label?p.label+' · ':'')+(grouped?g+': ':'')+fmt(p.v))}</title></circle>`;}
   out+=`<g data-viz-part="point" data-viz-key="${esc(encodeURIComponent(g))}">${marks}</g>`;if(grouped)out+=t(x0-10,cy+size*.35,cut(g,20),{anchor:'end',weight:600});
   if(proOption(s,'swarmMedian')!==false){const md=median(pts.map(p=>p.v));out+=ln(xx(md),cy-laneH*.42,xx(md),cy+laneH*.42,T,'stroke-width="2" stroke-dasharray="4 3"')+t(xx(md)+4,cy-laneH*.42+size,`median ${fmt(md)}`,{size:Math.max(8,size-2),opacity:'.7'});}});
  return out;
 }

 if(type==='ridgeline'){
  const by=new Map();for(const r of rows){const v=num(r[s.y]),g=r[s.x];if(!Number.isFinite(v)||!present(g))continue;const k=String(g);if(!by.has(k))by.set(k,[]);by.get(k).push(v);}
  const groups=orderKeys([...by.keys()]).slice(0,24).filter(g=>by.get(g).length>=2);if(!groups.length)return empty('Each group needs at least two observations.');
  const allV=groups.flatMap(g=>by.get(g)),n=allV.length,mean=allV.reduce((a,b)=>a+b,0)/n,sd=Math.sqrt(allV.reduce((a,b)=>a+(b-mean)**2,0)/Math.max(1,n-1))||1,manualBw=Number(proOption(s,'ridgeBandwidth'))||0,bw=manualBw>0?manualBw:1.06*sd*Math.pow(n/groups.length,-.2);
  const lo=Math.min(...allV,...(D?[D.lo]:[]))-bw*2,hi=Math.max(...allV,...(D?[D.hi]:[]))+bw*2,sc=niceScale(lo,hi,Number(s.tickCount)||5),labelW=Math.min(pw*.22,Math.max(...groups.map(g=>textW(cut(g,18),size)))+14),x0=left+labelW,w=pw-labelW-8,xx=v=>x0+(v-sc.lo)/(sc.hi-sc.lo)*w,steps=120;
  const dens=groups.map(g=>{const vals=by.get(g);return Array.from({length:steps+1},(_,i)=>{const x=sc.lo+(sc.hi-sc.lo)*i/steps;let sum=0;for(const v of vals)sum+=Math.exp(-.5*((x-v)/bw)**2);return [x,sum/(vals.length*bw*Math.sqrt(2*Math.PI))];});}),dmax=Math.max(...dens.flat().map(d=>d[1]))||1;
  const overlap=clamp(Number(proOption(s,'ridgeOverlap'))||1.6,.5,4),laneH=(ph-30)/(groups.length-1+overlap),amp=laneH*overlap;
  out+=xAxisBottom(sc,xx,top,top+ph-26);
  groups.forEach((g,i)=>{const base=top+amp+i*laneH,cl=colour(g,groups.length>8?0:i),pts=dens[i].map(([x,d])=>[xx(x),base-d/dmax*amp]),md=median(by.get(g));
   out+=mark(g,`${g}: n=${by.get(g).length} · median ${fmt(md)} · bandwidth ${fmt(bw)}`,`<path d="M${r2(xx(sc.lo))},${r2(base)}${smoothPath(pts,false)}L${r2(xx(sc.hi))},${r2(base)}Z" fill="${cl}" fill-opacity=".72" stroke="${B}" stroke-width="1.5"/>${ln(xx(md),base,xx(md),base-Math.min(amp,(pts[Math.round((md-sc.lo)/(sc.hi-sc.lo)*steps)]?base-pts[Math.round((md-sc.lo)/(sc.hi-sc.lo)*steps)][1]:amp)),B,'stroke-width="1.5"')}`)+t(x0-10,base-2,cut(g,18),{anchor:'end',weight:600,size:Math.max(8,Math.min(size,laneH*.95))});});
  return out;
 }

 if(type==='pyramid'){
  const m=group2(rows,s.x,s.seriesField,s.y,agg(s)),sides=m.series.slice(0,2);if(sides.length<2)return empty('Map a field with exactly two groups.');
  let cats=m.cats.slice(0,40);if(proOption(s,'pyramidOrder')!=='top')cats=[...cats].reverse();
  const pct=proOption(s,'pyramidPercent')===true||proOption(s,'pyramidPercent')==='true',total=cats.reduce((a,c)=>a+Math.abs(m.get(c,sides[0])||0)+Math.abs(m.get(c,sides[1])||0),0)||1,val=(c,g)=>{const v=m.get(c,g);return v===undefined?undefined:pct?Math.abs(v)/total*100:Math.abs(v);};
  const lg=legend(sides.map((g,i)=>({label:g,colour:colour(g,i)})),left,top+legendSize,pw);out+=showLegend?lg.svg:'';const t0=top+(showLegend?lg.height:0)+2;
  const centerW=Math.min(110,Math.max(...cats.map(c=>textW(cut(c,14),size)))+18),half=(pw-centerW)/2,mx=Math.max(1e-9,...cats.flatMap(c=>sides.map(g=>val(c,g)??0))),sc=niceScale(0,D?Math.max(mx,D.hi):mx,4),step=(bottom-26-t0)/cats.length,bh=step*.8,cxL=left+half,cxR=left+half+centerW;
  const fmtV=v=>pct?`${v.toFixed(1)}%`:fmt(v);
  for(const v of sc.ticks){const a=cxL-v/sc.hi*half,z=cxR+v/sc.hi*half;if(s.showGrid!==false){out+=ln(a,t0,a,bottom-26,G)+ln(z,t0,z,bottom-26,G);}out+=t(a,bottom-26+axisSize+6,fmtV(v),{anchor:'middle',size:axisSize,opacity:'.7'})+t(z,bottom-26+axisSize+6,fmtV(v),{anchor:'middle',size:axisSize,opacity:'.7'});}
  cats.forEach((c,i)=>{const y=t0+i*step+(step-bh)/2;sides.forEach((g,j)=>{const v=val(c,g);if(v===undefined)return;const w=v/sc.hi*half,cl=colour(g,j);out+=mark(c+' · '+g,`${c} · ${g}: ${fmtV(v)}${pct?` (${fmt(Math.abs(m.get(c,g)))})`:''}`,`<rect x="${r2(j?cxR:cxL-w)}" y="${r2(y)}" width="${r2(w)}" height="${r2(bh)}" fill="${cl}"/>`);if(s.showLabels&&bh>=size)out+=t(j?cxR+w+4:cxL-w-4,y+bh/2+size*.35,fmtV(v),{anchor:j?'start':'end',size:Math.max(8,size-2),extra:'data-viz-part="labels"'});});
   if(step>=size*.9||i%Math.ceil(size/step)===0)out+=t(left+half+centerW/2,y+bh/2+size*.35,cut(c,14),{anchor:'middle',size:Math.min(size,Math.max(8,step*.85)),opacity:'.85'});});
  return out;
 }

 if(type==='bump'){
  const m=rankModel(rows,s);if(m.periods.length<2||!m.entities.length)return empty('A bump chart needs at least two periods.');
  const maxRank=Math.max(...m.entities.flatMap(e=>m.periods.map(p=>m.ranks.get(p+'\u0000'+e)?.rank||0))),labelW=Math.min(pw*.22,Math.max(...m.entities.map(e=>textW(cut(e,18),size)))+20),x0=left+labelW,x1=right-labelW,xx=i=>x0+(x1-x0)*i/(m.periods.length-1),yy=r=>top+14+(r-1)/(Math.max(1,maxRank-1))*(ph-48);
  m.periods.forEach((p,i)=>{out+=ln(xx(i),top+4,xx(i),bottom-28,G)+t(xx(i),bottom-8,cut(p,10),{anchor:'middle',size:axisSize,opacity:'.75'});});
  m.entities.forEach((e,j)=>{const cl=colour(e,j),pts=m.periods.map((p,i)=>{const r=m.ranks.get(p+'\u0000'+e);return r?{i,r}:null;});let d='',prev=null;for(const q of pts){if(!q){prev=null;continue;}d+=(prev?'L':'M')+r2(xx(q.i))+','+r2(yy(q.r.rank));prev=q;}
   const first=pts.find(Boolean),last=[...pts].reverse().find(Boolean);
   out+=mark(e,`${e}: ${m.periods.map(p=>{const r=m.ranks.get(p+'\u0000'+e);return `${p} ${r?'#'+r.rank+' ('+fmt(r.value)+')':'–'}`;}).join(' · ')}`,`<path d="${d}" fill="none" stroke="${cl}" stroke-width="${clamp(Number(s.lineWidth)||3,1,8)}" stroke-linejoin="round" stroke-linecap="round"/>${pts.filter(Boolean).map(q=>`<circle cx="${r2(xx(q.i))}" cy="${r2(yy(q.r.rank))}" r="${clamp((Number(s.lineWidth)||3)*2.4,5,12)}" fill="${cl}"/><text x="${r2(xx(q.i))}" y="${r2(yy(q.r.rank)+3.5)}" font-size="9.5" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="${font}">${q.r.rank}</text>`).join('')}`);
   if(first)out+=t(xx(first.i)-14,yy(first.r.rank)+size*.35,cut(e,18),{anchor:'end',fill:cl,weight:600});if(last)out+=t(xx(last.i)+14,yy(last.r.rank)+size*.35,cut(e,18),{fill:cl,weight:600});});
  return out;
 }

 if(type==='streamgraph'){
  const m=group2(rows,s.x,s.seriesField,s.y,agg(s)),periods=orderKeys(m.cats).slice(0,80),ser=m.series.slice(0,12);if(periods.length<2)return empty('A streamgraph needs at least two periods.');
  const val=(p,g)=>Math.max(0,m.get(p,g)??0),tot=periods.map(p=>ser.reduce((a,g)=>a+val(p,g),0)),centred=proOption(s,'streamOffset')!=='zero',maxT=Math.max(1e-9,...tot,...(D?[D.hi]:[]));
  const t0=top+4,h=ph-30,xx=i=>left+pw*i/(periods.length-1),yy=v=>centred?t0+h/2-v/maxT*h:t0+h-v/maxT*h;
  let base=periods.map((_,i)=>centred?-tot[i]/2:0);const layers=[];
  ser.forEach((g,j)=>{const top_=periods.map((p,i)=>base[i]+val(p,g));layers.push({g,j,lo:base,hi:top_});base=top_;});
  if(!centred){const sc=niceScale(0,maxT,Number(s.tickCount)||5);out+=yAxis({...sc,ticks:sc.ticks.filter(v=>v<=maxT)},v=>yy(v),left,right);}
  for(const L of layers){const cl=colour(L.g,L.j),upper=L.hi.map((v,i)=>[xx(i),yy(v)]),lower=L.lo.map((v,i)=>[xx(i),yy(v)]).reverse();
   out+=mark(L.g,`${L.g}: ${periods.map(p=>`${p} ${m.get(p,L.g)===undefined?'–':fmt(m.get(p,L.g))}`).join(' · ')}`,`<path d="${smoothPath(upper)}L${r2(lower[0][0])},${r2(lower[0][1])}${smoothPath(lower,false).slice(1).replace(/^[^C]*/,'')}Z" fill="${cl}" fill-opacity=".88" stroke="${B}" stroke-width=".8"/>`);
   let best=-1,bi=0;periods.forEach((p,i)=>{const th=Math.abs(yy(L.lo[i])-yy(L.hi[i]));if(th>best&&i>0&&i<periods.length-1){best=th;bi=i;}});if(best>size*1.4)out+=t(xx(bi),(yy(L.lo[bi])+yy(L.hi[bi]))/2+size*.35,cut(L.g,18),{anchor:'middle',fill:'#ffffff',weight:600,size:Math.max(9,size-1),extra:'data-viz-part="labels"'});}
  out+=bandLabels(periods,xx,bottom-8,80);
  return out;
 }

 if(type==='chord'){
  const mdl=edgeModel(rows,s,clamp(Math.round(Number(proOption(s,'chordMax'))||12),3,20)),nodes=mdl.nodes;if(!mdl.edges.length)return empty('Map source and target fields.');
  const idx=new Map(nodes.map((n,i)=>[n,i])),out_=nodes.map(()=>0),in_=nodes.map(()=>0);for(const e of mdl.edges){out_[idx.get(e.source)]+=e.value;in_[idx.get(e.target)]+=e.value;}
  const total=out_.reduce((a,b)=>a+b,0)+in_.reduce((a,b)=>a+b,0),padA=.035,avail=Math.PI*2-padA*nodes.length,cx=left+pw/2,cy=top+ph/2,R=Math.max(40,Math.min(pw/2-Math.min(120,Math.max(...nodes.map(n=>textW(cut(n,16),size)))+20),ph/2-Math.min(70,Math.max(...nodes.map(n=>textW(cut(n,16),size)))*.55+14))),inner=R-Math.max(8,R*.06);
  let a=-Math.PI/2;const arcs=nodes.map((n,i)=>{const span=(out_[i]+in_[i])/total*avail,arc={n,i,a0:a,a1:a+span,cursor:a};a+=span+padA;return arc;});
  const seg=new Map();for(const arc of arcs){const outgoing=mdl.edges.filter(e=>e.source===arc.n).sort((p,q)=>idx.get(p.target)-idx.get(q.target)),incoming=mdl.edges.filter(e=>e.target===arc.n).sort((p,q)=>idx.get(q.source)-idx.get(p.source));
   for(const e of outgoing){const span=e.value/total*avail;seg.set('o'+e.source+'\u0000'+e.target,[arc.cursor,arc.cursor+span]);arc.cursor+=span;}for(const e of incoming){const span=e.value/total*avail;seg.set('i'+e.source+'\u0000'+e.target,[arc.cursor,arc.cursor+span]);arc.cursor+=span;}}
  for(const e of [...mdl.edges].sort((p,q)=>q.value-p.value)){const [s0,s1]=seg.get('o'+e.source+'\u0000'+e.target),[t0,t1]=seg.get('i'+e.source+'\u0000'+e.target),cl=colour(e.source,idx.get(e.source)),P=(r,an)=>polar(cx,cy,r,an).map(r2).join(',');
   const d=`M${P(inner,s0)}A${inner},${inner} 0 0 1 ${P(inner,s1)}Q${r2(cx)},${r2(cy)} ${P(inner,t0)}A${inner},${inner} 0 0 1 ${P(inner,t1)}Q${r2(cx)},${r2(cy)} ${P(inner,s0)}Z`;
   out+=mark(e.source+' → '+e.target,`${e.source} → ${e.target}: ${fmt(e.value)}`,`<path d="${d}" fill="${cl}" fill-opacity=".62" stroke="${cl}" stroke-opacity=".8" stroke-width=".5"/>`);}
  for(const arc of arcs){const cl=arc.n==='Other'?'#a7b1bc':colour(arc.n,arc.i),mid=(arc.a0+arc.a1)/2,[lx,ly]=polar(cx,cy,R+8,mid),deg=mid*180/Math.PI,flip=Math.cos(mid)<0;
   out+=mark(arc.n,`${arc.n}: out ${fmt(out_[arc.i])} · in ${fmt(in_[arc.i])}`,`<path d="${sector(cx,cy,inner+2,R,arc.a0,arc.a1)}" fill="${cl}"/>`)+`<text transform="translate(${r2(lx)} ${r2(ly)}) rotate(${r2(flip?deg+180:deg)})" text-anchor="${flip?'end':'start'}" dominant-baseline="middle" font-size="${size}" font-weight="600" fill="${T}" font-family="${font}">${esc(cut(arc.n,16))}</text>`;}
  return out;
 }

 if(type==='arc-diagram'){
  const mdl=edgeModel(rows,s,40);let nodes=mdl.nodes;if(!mdl.edges.length)return empty('Map source and target fields.');
  const weight=new Map(nodes.map(n=>[n,0]));for(const e of mdl.edges){weight.set(e.source,weight.get(e.source)+e.value);weight.set(e.target,weight.get(e.target)+e.value);}
  const order=proOption(s,'arcOrder');if(order==='name')nodes=[...nodes].sort((a,b)=>a.localeCompare(b));else if(order==='weight')nodes=[...nodes].sort((a,b)=>weight.get(b)-weight.get(a));
  const idx=new Map(nodes.map((n,i)=>[n,i])),rotate=nodes.length>12,labelH=rotate?Math.min(110,Math.max(...nodes.map(n=>textW(cut(n,16),size)))*.75+10):size+12,baseY=bottom-labelH,xx=i=>left+20+(pw-40)*(nodes.length===1?.5:i/(nodes.length-1)),maxE=Math.max(...mdl.edges.map(e=>e.value)),maxW=Math.max(...weight.values()),availH=baseY-top-6,maxSpan=Math.max(1,...mdl.edges.map(e=>Math.abs(idx.get(e.target)-idx.get(e.source))));
  for(const e of [...mdl.edges].sort((p,q)=>q.value-p.value)){const a=xx(idx.get(e.source)),z=xx(idx.get(e.target));if(a===z)continue;const span=Math.abs(idx.get(e.target)-idx.get(e.source)),hgt=Math.min(availH,span/maxSpan*availH),cl=colour(e.source,idx.get(e.source));
   out+=mark(e.source+' → '+e.target,`${e.source} → ${e.target}: ${fmt(e.value)}`,`<path d="M${r2(a)},${r2(baseY)}C${r2(a)},${r2(baseY-hgt*1.33)} ${r2(z)},${r2(baseY-hgt*1.33)} ${r2(z)},${r2(baseY)}" fill="none" stroke="${cl}" stroke-opacity=".55" stroke-width="${r2(1+e.value/maxE*9)}" stroke-linecap="round"/>`);}
  out+=ln(left+10,baseY,right-10,baseY,G);
  nodes.forEach((n,i)=>{const x=xx(i),rr=3+Math.sqrt(weight.get(n)/maxW)*8;out+=mark(n,`${n}: total weight ${fmt(weight.get(n))}`,`<circle cx="${r2(x)}" cy="${r2(baseY)}" r="${r2(rr)}" fill="${colour(n,i)}" stroke="${B}" stroke-width="1.5"/>`)+(rotate?`<text transform="translate(${r2(x+3)} ${r2(baseY+14)}) rotate(40)" font-size="${Math.max(9,size-1)}" fill="${T}" font-family="${font}">${esc(cut(n,16))}</text>`:t(x,baseY+size+10,cut(n,14),{anchor:'middle',size:Math.max(9,size-1)}));});
  return out;
 }

 if(type==='parliament'){
  const parties=seatsModel(rows,s).slice(0,20),N=parties.reduce((a,p)=>a+p.seats,0);if(!N)return empty('No seats to show.');if(N>1000)return empty('Parliament charts support up to 1,000 seats.');
  const legendW=Math.min(230,pw*.32),cx=left+(pw-legendW)/2,R=Math.max(40,Math.min((pw-legendW)/2-8,ph-size*3)),cy=top+R+size*2+(ph-size*2.5-R)/2,rowsN=Math.max(1,Math.round(Math.sqrt(N*.36))),r0=R*.45;
  const radii=Array.from({length:rowsN},(_,i)=>rowsN===1?(R+r0)/2:r0+(R-r0)*i/(rowsN-1)),sumR=radii.reduce((a,b)=>a+b,0);let counts=radii.map(r=>Math.floor(N*r/sumR));let left_=N-counts.reduce((a,b)=>a+b,0);for(let i=rowsN-1;left_>0;i=(i-1+rowsN)%rowsN,left_--)counts[i]++;
  const seats=[];radii.forEach((r,i)=>{const n=counts[i];for(let k=0;k<n;k++){const ang=Math.PI-(n===1?Math.PI/2:k*Math.PI/(n-1));seats.push({ang,r,x:cx+Math.cos(ang)*r,y:cy-Math.sin(ang)*r});}});seats.sort((a,b)=>b.ang-a.ang||a.r-b.r);
  const spacing=Math.min((R-r0)/Math.max(1,rowsN-1)||R,Math.PI*r0/Math.max(1,counts[0]-1||1)),dot=clamp(spacing*.42,1.2,18);let k=0;
  parties.forEach((p,i)=>{const cl=colour(p.key,i);let dots='';for(let j=0;j<p.seats;j++,k++){const st=seats[k];dots+=`<circle cx="${r2(st.x)}" cy="${r2(st.y)}" r="${r2(dot)}" fill="${cl}"/>`;}out+=mark(p.key,`${p.key}: ${p.seats} seat${p.seats===1?'':'s'} (${(p.seats/N*100).toFixed(1)}%)`,dots);});
  out+=t(cx,cy-size*1.2,String(N),{anchor:'middle',size:clamp(r0*.42,14,48),weight:700})+t(cx,cy+2,'seats',{anchor:'middle',opacity:'.65'});
  if(proOption(s,'parliamentMajority')!==false){const maj=Math.floor(N/2)+1;out+=ln(cx,cy-R-8,cx,cy-r0+dot*2,T,'stroke-dasharray="3 3" stroke-opacity=".55"')+t(cx,cy-R-12,`Majority: ${maj}`,{anchor:'middle',size:Math.max(9,size-1),opacity:'.75'});}
  const lx=left+pw-legendW+16,lh=Math.min(28,(ph-10)/parties.length);parties.forEach((p,i)=>{const y=top+(ph-lh*parties.length)/2+i*lh+lh*.6;out+=`<circle cx="${lx+6}" cy="${r2(y-size*.35)}" r="6" fill="${colour(p.key,i)}"/>`+t(lx+18,y,cut(p.key,20),{size:legendSize})+t(left+pw,y,String(p.seats),{anchor:'end',weight:700,size:legendSize});});
  return out;
 }

 if(type==='wordcloud'){
  const words=group(rows,s.x,s.y,has(rows,s.y)?agg(s):'count').filter(g=>g.value>0).sort((a,b)=>b.value-a.value).slice(0,clamp(Math.round(Number(proOption(s,'wordMax'))||60),5,150));if(!words.length)return empty('No words to show.');
  const mx=words[0].value,mn=words[words.length-1].value,maxF=clamp(Math.min(pw,ph)/6,18,84),minF=clamp(maxF/5,9,16),rot=proOption(s,'wordRotate')==='some',cx=left+pw/2,cy=top+ph/2,placed=[];
  const hit=(a)=>a.x0<left||a.x1>right||a.y0<top||a.y1>bottom||placed.some(b=>!(a.x1<b.x0||a.x0>b.x1||a.y1<b.y0||a.y0>b.y1));
  words.forEach((wd,i)=>{const fs=minF+(maxF-minF)*Math.sqrt((wd.value-mn)/((mx-mn)||1)),vertical=rot&&i%4===3,tw=textW(wd.key,fs)*1.02,th=fs*.92,w=vertical?th:tw,h=vertical?tw:th;
   for(let k=0;k<3000;k++){const ang=k*.18,rad=1.6*ang,x=cx+rad*Math.cos(ang)*(pw/ph>1?1.5:1),y=cy+rad*Math.sin(ang);const box={x0:x-w/2-2,x1:x+w/2+2,y0:y-h/2-2,y1:y+h/2+2};if(!hit(box)){placed.push(box);const cl=colour(wd.key,i%6);
     out+=mark(wd.key,`${wd.key}: ${fmt(wd.value)}`,`<text x="${r2(x)}" y="${r2(y)}" font-size="${r2(fs)}" font-weight="${fs>maxF*.55?700:500}" fill="${cl}" font-family="${font}" text-anchor="middle" dominant-baseline="central"${vertical?` transform="rotate(-90 ${r2(x)} ${r2(y)})"`:''}>${esc(wd.key)}</text>`);return;}}});
  return out;
 }

 if(type==='marimekko'){
  const m=group2(rows,s.x,s.seriesField,s.y,agg(s)),cats=m.cats.slice(0,16),ser=m.series.slice(0,10),val=(c,g)=>Math.max(0,m.get(c,g)??0),tot=cats.map(c=>ser.reduce((a,g)=>a+val(c,g),0)),grand=tot.reduce((a,b)=>a+b,0);if(!grand)return empty('No positive values to show.');
  const lg=showLegend?legend(ser.map((g,i)=>({label:g,colour:colour(g,i)})),left,top+legendSize,pw):{svg:'',height:0};out+=lg.svg;
  const t0=top+lg.height+4,h=bottom-t0-size*2.6,gap=2,avail=pw-gap*(cats.length-1),mode=proOption(s,'mekkoLabels');let x=left;
  for(const v of [0,25,50,75,100])out+=t(left-6,t0+h-v/100*h+axisSize*.35,v+'%',{anchor:'end',size:axisSize,opacity:'.65'});
  cats.forEach((c,i)=>{const w=tot[i]/grand*avail;let y=t0+h;ser.forEach((g,j)=>{const v=val(c,g);if(!v)return;const hh=v/tot[i]*h;y-=hh;const share=v/tot[i]*100;out+=mark(c+' · '+g,`${c} · ${g}: ${fmt(v)} (${share.toFixed(1)}% of ${c}; ${c} is ${(tot[i]/grand*100).toFixed(1)}% of total)`,`<rect x="${r2(x)}" y="${r2(y)}" width="${r2(Math.max(.5,w))}" height="${r2(hh)}" fill="${colour(g,j)}" stroke="${B}" stroke-width="1"/>`);
    if(mode!=='none'&&w>30&&hh>size+4)out+=t(x+w/2,y+hh/2+size*.35,mode==='value'?fmt(v):share.toFixed(0)+'%',{anchor:'middle',fill:'#ffffff',size:Math.max(8,size-2),weight:600,extra:'data-viz-part="labels"'});});
   if(w>18)out+=t(x+w/2,t0+h+size+4,cut(c,Math.max(3,Math.floor(w/(size*.58)))),{anchor:'middle',weight:600,size:Math.max(9,size-1)})+t(x+w/2,t0+h+size*2.2+4,`${(tot[i]/grand*100).toFixed(0)}%`,{anchor:'middle',size:Math.max(8,size-2),opacity:'.6'});x+=w+gap;});
  return out;
 }

 if(type==='circle-pack'){
  const nested=has(rows,s.seriesField)&&s.seriesField!==s.x,m=group2(rows,s.x,nested?s.seriesField:null,s.y,agg(s));
  const groups=m.cats.map((c,i)=>{const children=m.series.map(g=>({key:g,value:m.get(c,g)})).filter(d=>d.value>0).sort((a,b)=>b.value-a.value).slice(0,40);return {key:c,i,children,value:children.reduce((a,d)=>a+d.value,0)};}).filter(g=>g.value>0).sort((a,b)=>b.value-a.value).slice(0,40);if(!groups.length)return empty('No positive values to show.');
  for(const g of groups){const cs=packSiblings(g.children.map(d=>({...d,r:Math.sqrt(d.value)})));const enc=enclose(cs);g.r=nested?enc.r*1.06+Math.sqrt(g.value)*.04:Math.sqrt(g.value);g.kids=cs.map(c=>({...c,x:c.x-enc.x,y:c.y-enc.y}));}
  const placed=packSiblings(groups),enc=enclose(placed),scale=Math.min(pw,ph)/2/enc.r*.98,cx=left+pw/2,cy=top+ph/2,labels=proOption(s,'packLabels')!==false;
  for(const g of placed){const gx=cx+(g.x-enc.x)*scale,gy=cy+(g.y-enc.y)*scale,gr=g.r*scale,cl=colour(g.key,g.i);
   let body=`<circle cx="${r2(gx)}" cy="${r2(gy)}" r="${r2(gr)}" fill="${cl}" fill-opacity="${nested?.18:.85}" stroke="${cl}" stroke-width="${nested?1.2:0}"/>`;
   if(nested)for(const k of g.kids){const kr=k.r*scale;body+=`<circle cx="${r2(gx+k.x*scale)}" cy="${r2(gy+k.y*scale)}" r="${r2(kr)}" fill="${cl}" fill-opacity=".82"><title>${esc(`${g.key} › ${k.key}: ${fmt(k.value)}`)}</title></circle>`;if(labels&&kr>textW(cut(k.key,12),Math.max(8,size-2))/2+2)body+=t(gx+k.x*scale,gy+k.y*scale+size*.3,cut(k.key,12),{anchor:'middle',fill:'#ffffff',size:Math.max(8,size-2),extra:'pointer-events="none"'});}
   out+=mark(g.key,`${g.key}: ${fmt(g.value)}`,body);
   if(labels&&gr>textW(cut(g.key,16),size)/2+4)out+=nested?t(gx,gy-gr+size+4,cut(g.key,16),{anchor:'middle',weight:700,fill:T}):t(gx,gy,cut(g.key,16),{anchor:'middle',weight:700,fill:'#ffffff'})+t(gx,gy+size+2,fmt(g.value),{anchor:'middle',fill:'#ffffff',size:Math.max(8,size-2)});}
  return out;
 }
 if(type==='tile-map'){
  const m=tileModel(rows,s);if(!m.tiles.length)return empty(m.layout==='custom'?'Map Row and Column fields for your grid.':'No regions match this grid.');
  const vals=m.tiles.map(t=>t.value).filter(v=>v!==undefined);if(!vals.length)return empty('No values for these regions.');
  const lo=Math.min(...vals,...(D?[D.lo]:[])),hi=Math.max(...vals,...(D?[D.hi]:[])),classes=proOption(s,'tileClasses')==='continuous'?0:Number(proOption(s,'tileClasses')),light=mix('#ffffff',C,.12),cls=v=>{if(hi===lo)return 1;const t=(v-lo)/(hi-lo);return classes?Math.min(classes-1,Math.floor(t*classes))/(classes-1):t;},fill=v=>v===undefined?'#e3e7eb':mix(light,C,.15+.85*cls(v));
  const hex=proOption(s,'tileShape')==='hex',rowsN=Math.max(...m.tiles.map(t=>t.row))+1,colsN=Math.max(...m.tiles.map(t=>t.col))+1+(hex?.5:0),legendH=34,cell=Math.min(pw/colsN,(ph-legendH)/(hex?rowsN*.88+.12:rowsN)),gw=colsN*cell,ox=left+(pw-gw)/2,oy=top,gap=Math.max(1.5,cell*.06);
  for(const tile of m.tiles){const cx=ox+(tile.col+(hex&&tile.row%2?.5:0))*cell+cell/2,cy=oy+(hex?tile.row*cell*.88:tile.row*cell)+cell/2,colr=fill(tile.value),dark=tile.value!==undefined&&cls(tile.value)>.55,shape=hex?`<path d="${Array.from({length:6},(_,i)=>{const a=Math.PI/180*(60*i-30),r=(cell-gap)/Math.sqrt(3);return `${i?'L':'M'}${r2(cx+r*Math.cos(a))},${r2(cy+r*Math.sin(a))}`;}).join('')}Z" fill="${colr}"/>`:`<rect x="${r2(cx-cell/2+gap/2)}" y="${r2(cy-cell/2+gap/2)}" width="${r2(cell-gap)}" height="${r2(cell-gap)}" rx="${r2(cell*.08)}" fill="${colr}"/>`;
   const fs=Math.max(7,Math.min(size,cell*.3));out+=mark(tile.key,`${tile.name}: ${tile.value===undefined?'no data':fmt(tile.value)}`,shape+t(cx,cy+(cell>34?-1:fs*.35),tile.label,{anchor:'middle',size:fs,weight:700,fill:dark?'#ffffff':T,extra:'pointer-events="none"'})+(cell>34&&tile.value!==undefined?t(cx,cy+fs+1,fmt(tile.value),{anchor:'middle',size:Math.max(7,fs-2),fill:dark?'#ffffff':T,opacity:'.85',extra:'pointer-events="none"'}):''));}
  const ly=top+ph-legendH+14,lw=Math.min(240,pw*.5),lx=left+(pw-lw)/2;
  if(classes){for(let i=0;i<classes;i++){const a=lo+(hi-lo)*i/classes,b2=lo+(hi-lo)*(i+1)/classes;out+=`<rect x="${r2(lx+i*lw/classes)}" y="${ly}" width="${r2(lw/classes-2)}" height="10" fill="${mix(light,C,.15+.85*(i/(classes-1)))}"><title>${esc(fmt(a)+' – '+fmt(b2))}</title></rect>`;}}
  else{const id='tg'+Math.random().toString(36).slice(2,8);out+=`<defs><linearGradient id="${id}"><stop offset="0" stop-color="${mix(light,C,.15)}"/><stop offset="1" stop-color="${C}"/></linearGradient></defs><rect x="${r2(lx)}" y="${ly}" width="${r2(lw)}" height="10" fill="url(#${id})"/>`;}
  out+=`<g data-viz-part="legend">${t(lx,ly+24,fmt(lo),{size:Math.max(9,size-2)})}${t(lx+lw,ly+24,fmt(hi),{anchor:'end',size:Math.max(9,size-2)})}${m.missing?`<rect x="${r2(lx+lw+16)}" y="${ly}" width="10" height="10" fill="#e3e7eb"/>`+t(lx+lw+30,ly+9,'No data',{size:Math.max(9,size-2)}):''}</g>`;
  return out;
 }
 return empty('This chart type is not available.');
}
function mix(a,b,t){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),A=p(a),B=p(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*Math.max(0,Math.min(1,t))).toString(16).padStart(2,'0')).join('');}
// ---------- tile grids ----------
const US_TILES=[['AK','Alaska',0,0],['ME','Maine',0,11],['VT','Vermont',1,10],['NH','New Hampshire',1,11],['WA','Washington',2,1],['ID','Idaho',2,2],['MT','Montana',2,3],['ND','North Dakota',2,4],['MN','Minnesota',2,5],['IL','Illinois',2,6],['WI','Wisconsin',2,7],['MI','Michigan',2,8],['NY','New York',2,9],['RI','Rhode Island',2,10],['MA','Massachusetts',2,11],['OR','Oregon',3,1],['NV','Nevada',3,2],['WY','Wyoming',3,3],['SD','South Dakota',3,4],['IA','Iowa',3,5],['IN','Indiana',3,6],['OH','Ohio',3,7],['PA','Pennsylvania',3,8],['NJ','New Jersey',3,9],['CT','Connecticut',3,10],['CA','California',4,1],['UT','Utah',4,2],['CO','Colorado',4,3],['NE','Nebraska',4,4],['MO','Missouri',4,5],['KY','Kentucky',4,6],['WV','West Virginia',4,7],['VA','Virginia',4,8],['MD','Maryland',4,9],['DE','Delaware',4,10],['AZ','Arizona',5,2],['NM','New Mexico',5,3],['KS','Kansas',5,4],['AR','Arkansas',5,5],['TN','Tennessee',5,6],['NC','North Carolina',5,7],['SC','South Carolina',5,8],['DC','District of Columbia',5,9],['OK','Oklahoma',6,4],['LA','Louisiana',6,5],['MS','Mississippi',6,6],['AL','Alabama',6,7],['GA','Georgia',6,8],['HI','Hawaii',7,0],['TX','Texas',7,4],['FL','Florida',7,9]];
const NZ_TILES=[['NTL','Northland',0,1],['AUK','Auckland',1,1],['WKO','Waikato',2,1],['BOP','Bay of Plenty',2,2],['GIS','Gisborne',2,3],['TKI','Taranaki',3,0],['MWT','Manawatū-Whanganui',3,1],['HKB',"Hawke's Bay",3,2],['TAS','Tasman',4,0],['NSN','Nelson',4,1],['WGN','Wellington',4,2],['WTC','West Coast',5,0],['MBH','Marlborough',5,1],['CAN','Canterbury',6,1],['STL','Southland',7,0],['OTA','Otago',7,1]];
export const TILE_LAYOUTS={'us-states':{name:'US states',tiles:US_TILES},'nz-regions':{name:'New Zealand regions',tiles:NZ_TILES}};
const norm=v=>String(v??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\bregion\b/g,'').replace(/[^a-z0-9]/g,'');
const ALIASES={washingtondc:'DC',districtofcolumbia:'DC',manawatuwanganui:'MWT',manawatu:'MWT',whanganui:'MWT',hawkesbay:'HKB',bayofplenty:'BOP',westcoast:'WTC'};
export function tileModel(rows,s){
 const layoutId=proOption(s,'tileLayout');
 if(layoutId==='custom'){const g=new Map();for(const r of rows){const k=r[s.x],row=num(r[s.lowerField]),col=num(r[s.upperField]);if(!present(k)||!Number.isInteger(row)||!Number.isInteger(col)||row<0||col<0||row>60||col>60)continue;const key=String(k);if(!g.has(key))g.set(key,{key,name:key,label:cut(key,4),row,col,values:[],count:0});const t=g.get(key);t.count++;const v=num(r[s.y]);if(Number.isFinite(v))t.values.push(v);}
  const tiles=[...g.values()].map(t=>({...t,value:t.values.length||s.aggregation==='count'?reduceValues(t.values,agg(s),t.count):undefined}));return {layout:'custom',layoutName:'custom',tiles,unmatched:[],missing:tiles.filter(t=>t.value===undefined).length};}
 const L=TILE_LAYOUTS[layoutId]||TILE_LAYOUTS['us-states'],index=new Map();for(const [code,name] of L.tiles){index.set(norm(code),code);index.set(norm(name),code);}for(const [a,code] of Object.entries(ALIASES))if(L.tiles.some(t=>t[0]===code))index.set(a,code);
 const grouped=new Map(),unmatched=new Set();for(const g of group(rows,s.x,s.y,agg(s))){const code=index.get(norm(g.key));if(code)grouped.set(code,g.value);else unmatched.add(g.key);}
 const tiles=L.tiles.map(([code,name,row,col])=>({key:code,name,label:code.length>3?code.slice(0,3):code,row,col,value:grouped.get(code)}));
 return {layout:layoutId,layoutName:L.name,tiles,unmatched:[...unmatched],missing:tiles.filter(t=>t.value===undefined).length};
}

// Greedy front-chain-like packing: each circle is placed tangent to placed circles, nearest the origin.
function packSiblings(circles){
 const cs=circles.map(c=>({...c})).sort((a,b)=>b.r-a.r);if(!cs.length)return cs;cs[0].x=0;cs[0].y=0;if(cs.length===1)return cs;cs[1].x=cs[0].r+cs[1].r;cs[1].y=0;
 const placed=[cs[0],cs[1]],ok=(x,y,r)=>placed.every(p=>(p.x-x)**2+(p.y-y)**2>=(p.r+r)**2-1e-6);
 for(let i=2;i<cs.length;i++){const c=cs[i];let best=null,bd=Infinity;
  for(let a=0;a<placed.length;a++)for(let b=a+1;b<placed.length;b++){const A=placed[a],Bc=placed[b],ra=A.r+c.r,rb=Bc.r+c.r,dx=Bc.x-A.x,dy=Bc.y-A.y,d=Math.hypot(dx,dy);if(d>ra+rb||d<Math.abs(ra-rb)||d===0)continue;
   const l=(ra*ra-rb*rb+d*d)/(2*d),h=Math.sqrt(Math.max(0,ra*ra-l*l)),mx=A.x+dx*l/d,my=A.y+dy*l/d;
   for(const sgn of [1,-1]){const x=mx-sgn*h*dy/d,y=my+sgn*h*dx/d,dist=x*x+y*y;if(dist<bd&&ok(x,y,c.r)){bd=dist;best=[x,y];}}}
  if(!best){const far=Math.max(...placed.map(p=>Math.hypot(p.x,p.y)+p.r));best=[far+c.r,0];}
  c.x=best[0];c.y=best[1];placed.push(c);}
 return cs;
}
function enclose(cs){if(!cs.length)return {x:0,y:0,r:1};let wx=0,wy=0,wt=0;for(const c of cs){const w=c.r*c.r;wx+=c.x*w;wy+=c.y*w;wt+=w;}let x=wx/wt,y=wy/wt;
 // Refine centre a few steps towards the farthest circle to tighten the enclosing radius.
 for(let k=0;k<40;k++){let far=null,fd=-1;for(const c of cs){const d=Math.hypot(c.x-x,c.y-y)+c.r;if(d>fd){fd=d;far=c;}}const step=.08*(1-k/40);x+=(far.x-x)*step;y+=(far.y-y)*step;}
 return {x,y,r:Math.max(...cs.map(c=>Math.hypot(c.x-x,c.y-y)+c.r))};}

// ---------- illustrative examples (fictional data) ----------
export function proExample(id){
 if(EXTRA_TYPES.has(id))return extraExample(id);
 const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 switch(id){
  case 'pie':return {rows:[{Category:'Housing',Spend:1450},{Category:'Food',Spend:620},{Category:'Transport',Spend:380},{Category:'Savings',Spend:500},{Category:'Leisure',Spend:290},{Category:'Other',Spend:160}],x:'Category',y:'Spend',title:'Where the monthly budget goes',subtitle:'Illustrative household, NZ$'};
  case 'waffle':return {rows:[{Mode:'Car',Share:57},{Mode:'Bus',Share:14},{Mode:'Walk',Share:11},{Mode:'Bike',Share:8},{Mode:'Train',Share:6},{Mode:'Other',Share:4}],x:'Mode',y:'Share',title:'How commuters travel to work',subtitle:'Each square is 1% of commuters · illustrative'};
  case 'marimekko':return {rows:['North','South','East','West'].flatMap((r,i)=>['Alpha','Beta','Gamma'].map((b,j)=>({Region:r,Brand:b,Sales:[[120,80,40],[60,90,30],[200,60,90],[40,30,60]][i][j]}))),x:'Region',seriesField:'Brand',y:'Sales',showLegend:true,title:'Market size and brand share by region',subtitle:'Column width = region’s share of sales · $k · illustrative'};
  case 'circle-pack':return {rows:[['Health','Hospitals',420],['Health','Primary care',180],['Health','Public health',60],['Education','Schools',380],['Education','Universities',210],['Education','Early learning',90],['Transport','Roads',260],['Transport','Rail',140],['Transport','Buses',70],['Environment','Conservation',80],['Environment','Water',110]].map(([Department,Team,Budget])=>({Department,Team,Budget})),x:'Department',seriesField:'Team',y:'Budget',title:'Spending by department and programme',subtitle:'$ millions · illustrative'};
  case 'combo':return {rows:months.map((Month,i)=>({Month,Sales:Math.round(120+60*Math.sin(i/2)+i*9),Margin:Number((18+6*Math.cos(i/3)+i*.3).toFixed(1))})),x:'Month',y:'Sales',endField:'Margin',showLegend:true,title:'Monthly sales and margin',subtitle:'Sales in $k (columns) · margin % (line, right axis)'};
  case 'lollipop':return {rows:[['Ponsonby',8.7],['Newmarket',8.1],['Takapuna',7.9],['Albany',7.4],['Manukau',7.1],['Henderson',6.8],['Botany',6.5]].map(([Store,Score])=>({Store,Score})),x:'Store',y:'Score',showLabels:true,title:'Customer satisfaction by store',subtitle:'Mean score out of 10 · illustrative'};
  case 'split-bars':return {rows:['18–29','30–44','45–64','65+'].flatMap((Age,i)=>[['Agree',[62,55,48,41][i]],['Neutral',[20,24,25,22][i]],['Disagree',[18,21,27,37][i]]].map(([Answer,Percent])=>({Age,Answer,Percent}))),x:'Age',seriesField:'Answer',y:'Percent',title:'“Cities should invest more in cycleways”',subtitle:'% of respondents by age group · illustrative'};
  case 'range-plot':return {rows:[['Managers',58,71],['Professionals',49,60],['Technicians',38,44],['Sales',29,37],['Admin',33,35],['Trades',36,48],['Labourers',27,31]].map(([Occupation,Women,Men])=>({Occupation,Women,Men})),x:'Occupation',y:'Women',endField:'Men',showLegend:true,rangeSort:'end',title:'Median hourly pay by occupation',subtitle:'$ per hour · illustrative'};
  case 'arrow-plot':return {rows:[['Aotearoa',78.6,82.3],['Australia',79.2,83.0],['Fiji',66.1,67.4],['Samoa',70.2,72.8],['Tonga',69.8,71.0],['Papua New Guinea',59.6,64.5]].map(([Country,Y2000,Y2020])=>({Country,Y2000,Y2020})),x:'Country',y:'Y2000',endField:'Y2020',showLegend:true,title:'Life expectancy, 2000 → 2020',subtitle:'Years at birth · illustrative values'};
  case 'bullet':return {rows:[['North',182,200,260],['South',214,190,260],['East',149,180,260],['West',201,210,260],['Online',236,220,260]].map(([Region,Sales,Target,Max])=>({Region,Sales,Target,Max})),x:'Region',y:'Sales',endField:'Target',upperField:'Max',showLegend:true,title:'Quarterly sales against target',subtitle:'$k · percentage of target on the right'};
  case 'gauge':return {rows:[{Metric:'Satisfaction',Score:78,Target:85},{Metric:'Retention',Score:91,Target:90},{Metric:'On-time delivery',Score:64,Target:80}],x:'Metric',y:'Score',endField:'Target',gaugeMax:100,title:'Service performance',subtitle:'Score out of 100 · tick marks show targets'};
  case 'kpi':return {rows:[{Metric:'Revenue ($k)',Current:4820,Previous:4310},{Metric:'New customers',Current:1284,Previous:1350},{Metric:'Avg order ($)',Current:86.4,Previous:79.9},{Metric:'Churn (%)',Current:2.1,Previous:2.6}],x:'Metric',y:'Current',endField:'Previous',title:'Q3 business headlines',subtitle:'Compared with Q2 · illustrative'};
  case 'funnel':return {rows:[['Site visits',48200],['Product views',21900],['Added to cart',6400],['Checkout started',3900],['Purchased',2650]].map(([Stage,Users])=>({Stage,Users})),x:'Stage',y:'Users',title:'From visit to purchase',subtitle:'Users in October · illustrative'};
  case 'candlestick':{let p=100;const rows=[];for(let i=0;i<40;i++){const d=new Date(Date.UTC(2026,8,1+i)).toISOString().slice(0,10),o=p,c=Number((o+Math.sin(i*1.7)*2.2+Math.cos(i*.6)*1.3+.25).toFixed(2)),h=Number((Math.max(o,c)+1+Math.abs(Math.sin(i))*1.6).toFixed(2)),l=Number((Math.min(o,c)-1-Math.abs(Math.cos(i*1.3))*1.4).toFixed(2));rows.push({Date:d,Open:Number(o.toFixed(2)),High:h,Low:l,Close:c});p=c;}return {rows,x:'Date',y:'Open',endField:'Close',lowerField:'Low',upperField:'High',showLegend:true,title:'Daily share price',subtitle:'Fictional company · NZ$'};}
  case 'radar':return {rows:['Price','Battery','Camera','Display','Speed','Durability'].flatMap((Criterion,i)=>[['Model A',[7,8,9,8,7,6][i]],['Model B',[9,6,6,7,8,8][i]]].map(([Product,Rating])=>({Criterion,Product,Rating}))),x:'Criterion',y:'Rating',seriesField:'Product',showLegend:true,radarMax:10,title:'Phone review ratings',subtitle:'Out of 10 · illustrative'};
  case 'beeswarm':{const rows=[];const teams=['Engineering','Sales','Support'];let seed=7;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280;};teams.forEach((Team,i)=>{for(let k=0;k<45;k++){const z=(rnd()+rnd()+rnd()-1.5)*1.4;rows.push({Employee:`${Team[0]}${k+1}`,Team,Salary:Math.round([112,84,66][i]+z*[16,18,9][i])*1000});}});return {rows,x:'Team',y:'Salary',labelField:'Employee',title:'Salaries by team',subtitle:'Each dot is one employee · illustrative'};}
  case 'ridgeline':{const rows=[];let seed=11;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280;};months.forEach((Month,i)=>{const mean=12+7*Math.cos((i-0.5)/12*2*Math.PI);for(let k=0;k<30;k++)rows.push({Month,Temperature:Number((mean+(rnd()+rnd()+rnd()-1.5)*3.4).toFixed(1))});});return {rows,x:'Month',y:'Temperature',title:'Daily maximum temperature by month',subtitle:'°C · illustrative southern-hemisphere city'};}
  case 'pyramid':{const bands=['0–9','10–19','20–29','30–39','40–49','50–59','60–69','70–79','80+'],f=[310,320,345,340,325,310,270,180,95],m=[325,335,350,335,315,300,255,160,65];return {rows:bands.flatMap((Age,i)=>[{Age,Sex:'Female',Population:f[i]},{Age,Sex:'Male',Population:m[i]}]),x:'Age',seriesField:'Sex',y:'Population',showLegend:true,title:'Population by age and sex',subtitle:'Thousands · illustrative'};}
  case 'bump':{const teams=['Kea','Tūī','Kererū','Kākā','Pīwakawaka','Ruru'],pts=[[60,52,48,44,40,30],[55,58,46,50,38,35],[50,60,57,42,44,33],[45,54,62,47,41,40],[58,49,61,53,36,45]];return {rows:['2022','2023','2024','2025','2026'].flatMap((Season,i)=>teams.map((Team,j)=>({Season,Team,Points:pts[i][j]}))),x:'Season',seriesField:'Team',y:'Points',title:'League position by season',subtitle:'Rank by points · illustrative'};}
  case 'streamgraph':{const genres=['Pop','Hip-hop','Rock','Electronic','Country','Jazz'];return {rows:Array.from({length:10},(_,i)=>2017+i).flatMap(Year=>genres.map((Genre,j)=>({Year:String(Year),Genre,Hours:Math.round(40+30*Math.sin((Year-2017)/(2+j*.6)+j)+[50,20,35,15,10,5][j]+(j===1?(Year-2017)*7:0))}))),x:'Year',seriesField:'Genre',y:'Hours',title:'What we listened to',subtitle:'Streaming hours (millions) · illustrative'};}
  case 'chord':{const r=['Auckland','Wellington','Canterbury','Waikato','Otago'],f=[[0,42,35,60,18],[38,0,22,15,12],[30,25,0,10,28],[55,12,9,0,8],[14,10,31,6,0]];return {rows:r.flatMap((From,i)=>r.map((To,j)=>({From,To,People:f[i][j]}))).filter(d=>d.People>0),x:'From',seriesField:'To',y:'People',title:'Moves between regions',subtitle:'Thousands of people · illustrative'};}
  case 'arc-diagram':{const pairs=[['Aroha','Mere',12],['Aroha','Tama',8],['Mere','Tama',5],['Tama','Hemi',9],['Hemi','Wiremu',4],['Aroha','Wiremu',3],['Mere','Hine',7],['Hine','Hemi',6],['Wiremu','Hine',2],['Aroha','Hine',4]];return {rows:pairs.map(([A,B,Scenes])=>({Character:A,With:B,Scenes})),x:'Character',seriesField:'With',y:'Scenes',title:'Who shares scenes with whom',subtitle:'Fictional story · arc width shows shared scenes'};}
  case 'parliament':return {rows:[['Green Party',14],['Labour',34],['Te Pāti Māori',6],['National',48],['ACT',11],['NZ First',8]].map(([Party,Seats])=>({Party,Seats})),x:'Party',y:'Seats',title:'Seats in a fictional parliament',subtitle:'121 seats · illustrative, not an election result'};
  case 'tile-map':{const v=[['AL',16.1],['AK',10.4],['AZ',13.5],['AR',16.2],['CA',12.2],['CO',9.4],['CT',10.0],['DE',11.4],['DC',13.8],['FL',12.7],['GA',13.5],['HI',10.5],['ID',10.1],['IL',11.8],['IN',12.3],['IA',11.0],['KS',11.6],['KY',16.0],['LA',18.6],['ME',10.9],['MD',9.6],['MA',10.4],['MI',13.1],['MN',9.3],['MS',19.1],['MO',12.7],['MT',11.9],['NE',10.8],['NV',12.7],['NH',7.4],['NJ',9.7],['NM',18.2],['NY',13.6],['NC',13.3],['ND',10.8],['OH',13.4],['OK',15.2],['OR',12.1],['PA',12.0],['RI',11.4],['SC',14.4],['SD',12.3],['TN',13.6],['TX',13.7],['UT',8.8],['VT',10.3],['VA',10.0],['WA',9.9],['WV',16.8],['WI',10.7],['WY',11.1]];return {rows:v.map(([State,Rate])=>({State,Rate})),x:'State',y:'Rate',tileLayout:'us-states',title:'Share of households below a fictional threshold',subtitle:'Percent · illustrative values, not official statistics'};}
  case 'wordcloud':return {rows:[['Housing',94],['Cost of living',88],['Transport',61],['Health',58],['Climate',52],['Jobs',47],['Education',40],['Safety',33],['Parks',28],['Water',26],['Broadband',21],['Libraries',17],['Arts',15],['Tourism',13],['Sport',12],['Cycling',11],['Noise',9],['Parking',9],['Heritage',7],['Events',6]].map(([Theme,Mentions])=>({Theme,Mentions})),x:'Theme',y:'Mentions',title:'Most mentioned survey themes',subtitle:'Open-text responses · illustrative'};
 }
 return null;
}

// V3.55: aligned series for native PowerPoint combo charts (same rules as the SVG renderer).
export function comboSeries(rows,s){const a=s.aggregation||'sum',colsG=group(rows,s.x,s.y,a),lineMode=(s.comboLineAgg&&s.comboLineAgg!=='same')?s.comboLineAgg:(a==='count'?'sum':a),lineG=group(rows,s.x,s.endField,lineMode),keys=orderKeys([...new Set([...colsG.map(g=>g.key),...lineG.map(g=>g.key)])]).slice(0,60),cv=new Map(colsG.map(g=>[g.key,g.value])),lv=new Map(lineG.map(g=>[g.key,g.value]));return {labels:keys,columns:keys.map(k=>cv.has(k)?cv.get(k):null),line:keys.map(k=>lv.has(k)?lv.get(k):null),dual:(s.comboAxis||'dual')!=='shared'};}
