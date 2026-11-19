import {PRO_TYPES,proData} from './pro-charts.js';
import {routeReport} from './route-map.js';
import {EXPANDED_TYPES,EXPANDED_META,expandedWarnings} from './expanded-charts.js';
import {mappingIssues} from './data-contracts.js';
import {fieldType,numericFields,dateFields,getFields} from './data.js';
import {geoData} from './geo.js';
export const intents={
 geography:{label:'Map locations and geographic patterns',synonyms:['geographic','geography','map','mapping','country','spatial','location','latitude','longitude','regional map','choropleth','hotspots'],types:['geo-choropleth','geo-symbol','geo-heat','hbar'],why:['Compare values by country.','Show numerical magnitudes at locations.','Reveal concentrations in coordinate data.','Compare regions precisely using bars.']},
 flow:{label:'Show flows and connections',synonyms:['flow','flows','transfer','movement between','network','connections','sankey'],types:['sankey','network','treemap','stacked-bar'],why:['Show weighted transfers.','Reveal linked entities.','Show proportional totals.','Compare grouped contributions.']},
 hierarchy:{label:'Show a hierarchy',synonyms:['hierarchy','organisational','nested','parent child','sunburst','subgroups'],types:['sunburst','treemap','stacked-bar','donut'],why:['Show nested parts.','Compare component area.','Compare grouped components.','Summarise broad proportions.']},
 timeline:{label:'Show events through time',synonyms:['event timeline','events over time','milestone','chronology','historic events','timeline'],types:['timeline','gantt','line','slope'],why:['Show dated events.','Show task ranges.','Show numeric trends.','Compare two endpoints.']},
 schedule:{label:'Show tasks and schedules',synonyms:['gantt','schedule','project plan','task duration','deadline','start and end','work plan'],types:['gantt','timeline','bar','waterfall'],why:['Show overlapping task durations.','Show milestones.','Compare quantities.','Show contributions.']},
 multivariate:{label:'Compare multiple measures',synonyms:['multivariate','many variables','multiple measures','several metrics','multi-dimensional','parallel coordinates'],types:['parallel','bubble','scatter','heatmap'],why:['Compare many numeric dimensions.','Add size as a third measure.','Compare numeric pairs.','Compare two dimensions as colour.']},

 trend:{label:'Change over time',synonyms:['trend','over time','timeline','year','monthly','date','history','changes','growth','evol','increase','decrease'],types:['line','area','slope','bar'],why:['Shows a continuous pattern across ordered time points.','Emphasises the volume or magnitude of a trend.','Compares groups between the first and last periods.','Makes individual periods easy to compare.']},
 comparison:{label:'Compare groups',synonyms:['compar','between','versus','vs ','difference','rank','top','bottom','group','higher','lower','performance'],types:['hbar','bar','dot','slope'],why:['Readable rankings and long category labels.','Strong direct comparisons.','Clean precise comparisons.','Shows two-period change for the same groups.']},
 relation:{label:'Find relationships',synonyms:['relationship','correl','associat','related','against','connection','linked','scatter'],types:['scatter','bubble','heatmap','dot'],why:['Reveals patterns between two numeric variables.','Adds a third positive measure encoded as area.','Highlights cells with large or small values.','Offers precise category-based comparisons.']},
 parts:{label:'Parts of a whole',synonyms:['share','portion','proportion','percentage','part of','whole','total breakdown','composition','breakdown'],types:['donut','treemap','stacked-bar','hbar'],why:['Shows approximate shares of one total.','Shows shares using proportional areas.','Shows components of category totals.','Often easier for precise comparisons.']},
 distribution:{label:'Explore a distribution',synonyms:['distribution','spread','median','quartile','density','range','variability','variation','outlier','frequency','histogram'],types:['histogram','box-plot','violin','dot'],why:['Shows frequencies across numerical bins.','Shows quartiles and outliers.','Shows the estimated shape of raw observations.','Compares individual group values precisely.']},
 finance:{label:'Explain changes to a total',synonyms:['waterfall','profit','net change','cost breakdown','positive and negative','bridge chart','financial change'],types:['waterfall','bar','line','treemap'],why:['Shows how signed changes accumulate.','Compares individual contributions.','Shows totals across time if available.','Shows positive parts of a whole.']},
};
export function advise(text,rows){const value=String(text||'').trim().toLowerCase();const scores=Object.entries(intents).map(([key,obj])=>({key,score:obj.synonyms.reduce((n,t)=>n+(value.includes(t)?t.length>7?2:1:0),0)})).sort((a,b)=>b.score-a.score);const key=scores[0]?.score?scores[0].key:'comparison',intent=intents[key];const fields=rows?.length?getFields(rows):[],numeric=rows?.length?numericFields(rows):[],dates=rows?.length?dateFields(rows):[];return {intent:key,label:intent.label,recognised:!!scores[0]?.score,hasData:!!rows?.length,required:{category:'One category or date field',numeric:'At least one numerical measure'},results:intent.types.map((type,i)=>{let compatible=!rows?.length||numeric.length>0,note='';if(['scatter','bubble'].includes(type)&&rows?.length&&numeric.length<(type==='bubble'?3:2)){compatible=false;note='Choose two numeric columns to use scatter.';}if(type==='violin'&&rows?.length&&!numeric.length){compatible=false;note='A numeric observation field is required.';}if(type==='donut'&&rows?.length&&fields.length>0&&rows.length>15)note='Aggregate by category before interpreting proportions.';if(['line','area'].includes(type)&&rows?.length&&!dates.length)note='Use a meaningful ordered field to avoid suggesting false continuity.';return {type,reason:intent.why[i],compatible,note};})};}

// V2.3 comparison guidance: transparent, deterministic rules. This module never
// modifies uploaded data, guesses semantic units, or uses a language model.
export const VISUAL_GOALS = [
 {id:'geography',label:'Map places and geographic patterns'},
 {id:'flow',label:'Show flows and connections'},
 {id:'hierarchy',label:'Show a hierarchy'},
 {id:'timeline',label:'Show events through time'},
 {id:'schedule',label:'Show tasks and schedules'},
 {id:'multivariate',label:'Compare multiple measures'},

 {id:'comparison',label:'Compare categories'},
 {id:'trend',label:'Show change over time'},
 {id:'relation',label:'Explore relationships'},
 {id:'distribution',label:'Examine distributions'},
 {id:'parts',label:'Show parts of a whole'},
 {id:'finance',label:'Explain changes to a total'},
];
export const CHART_TRADEOFFS = {
 'editorial-table':['Readers can look up and sort exact source values.','Up to 5,000 rows/8 explicit columns; SVG and dashboard views show one static page.','One source record per row, no aggregation'],
 ...Object.fromEntries(Object.entries(EXPANDED_META).map(([type,m])=>[type,[m.use,m.category==='Experimental'?'Exploratory combination; interpretation requires checking assumptions.':'Review missing combinations, displayed series limits and shared scale.',m.needs]])),
 'geo-choropleth':['Compares measurements across country areas.','Requires matching country names/ISO codes; large countries can visually dominate and country boundaries are simplified.','Values aggregated for matched countries'],
 'geo-symbol':['Shows quantities at coordinates or country centroids.','Country centroids are illustrative; overlapping symbols may hide locations.','Raw location observations with area-encoded values'],
 'geo-heat':['Reveals the concentration of weighted geographic observations.','Requires coordinates; smoothing radius changes the pattern and output is relative density, not an exact count.','Raw location coordinates combined into a kernel-density surface'],
 sankey:['Shows how positive quantities move between entities and stages.','Needs source, destination and positive weights; cycles may overlap.','Aggregated directed weighted flows'],
 network:['Reveals connections and clusters among entities.','Layouts are illustrative, not measures of geographic distance or hierarchy.','Raw or weighted source–destination edges'],
 sunburst:['Shows nested proportions in two hierarchical levels.','Small sectors are hard to compare precisely; only two levels are supported.','Positive values aggregated by parent and child'],
 timeline:['Shows dated events with optional category lanes.','Dense events overlap; zoom may hide dates outside the selected window.','Individual dated events'],
 gantt:['Shows task lengths, overlaps and scheduling dependencies indirectly.','Does not model true dependency logic or critical paths.','Task start and end dates'],
 parallel:['Compares many numeric dimensions for each observation.','Overplotting grows rapidly; axes use independent scales.','Raw observations across multiple numeric measures'],

 bar:['Easy to read individual category values.','Many categories become crowded; bar lengths should start at zero.','Aggregated by category'],
 hbar:['Long category labels remain readable.','Too many groups can obscure the comparison.','Aggregated by category'],
 dot:['Compact and precise comparisons.','Small points may be harder for novices to locate.','Aggregated by category'],
 line:['Makes change across ordered measurements easy to follow.','Connecting unordered categories implies continuity.','Aggregated across repeated X values'],
 area:['Shows trends and visually emphasises magnitude.','Filled area can exaggerate differences; a zero baseline usually matters.','Aggregated across repeated X values'],
 scatter:['Shows relationships, clusters and outliers.','Overlapping points may hide dense regions; association is not causation.','Raw numeric pairs'],
 bubble:['Adds a third numerical variable through circle area.','Precise circle-area comparisons are difficult; requires positive size data.','Raw numeric observations'],
 donut:['A compact overview of a few parts of a total.','Difficult to judge similar slices; excludes negative values.','Aggregated positive category totals'],
 treemap:['Uses area to show the relative sizes of groups.','Area comparisons are less precise than aligned bars.','Aggregated positive category totals'],
 'stacked-bar':['Shows composition within different categories.','Middle segments lack a common baseline; negative segments are unsupported.','Aggregated category × series values'],
 histogram:['Reveals distribution shape and skew.','Bin width changes the visual impression.','Raw numeric observations binned into counts'],
 'box-plot':['Makes median, quartiles and outliers easy to compare.','Can hide multimodality and the detailed distribution shape.','Raw numeric observations grouped into summaries'],
 violin:['Reveals density shape in addition to summary statistics.','Smoothed density depends on bandwidth and may overstate small samples.','Raw numeric observations with estimated density'],
 heatmap:['Shows patterns and hotspots across two dimensions.','Colours make small quantitative differences difficult to judge.','Aggregated category × series cells'],
 waterfall:['Explains how signed changes build to a total.','Requires ordered, additive changes; not suitable for independent absolute values.','Cumulative sum of aggregated changes'],
 slope:['Highlights the change of each group between two endpoints.','Intermediate periods are intentionally omitted.','Grouped first and last period values'],
};
const CHART_GOALS = {
 geography:['geo-choropleth','geo-symbol','geo-heat','hbar'],
 flow:['sankey','network','treemap','stacked-bar'],
 hierarchy:['sunburst','treemap','stacked-bar'],
 timeline:['timeline','gantt','line'],
 schedule:['gantt','timeline','bar'],
 multivariate:['parallel','bubble','scatter','heatmap'],

 comparison:['hbar','bar','dot','box-plot','slope','line'],
 trend:['line','area','slope','bar','stacked-bar'],
 relation:['scatter','bubble','heatmap','dot'],
 distribution:['histogram','box-plot','violin','dot'],
 parts:['hbar','stacked-bar','treemap','donut'],
 finance:['waterfall','bar','line','treemap'],
};
export function compareSuitability(type,rows={},mapping={}){if(type==='editorial-table'){const missing=mappingIssues({...mapping,type},{rows:Array.isArray(rows)?rows:[]});if(!Array.isArray(rows)||!rows.length)missing.push('Import data to use a table.');if(rows.length>5000)missing.push('Filter to 5,000 or fewer rows.');const [benefit,limitation,basis]=CHART_TRADEOFFS[type];return {compatible:!missing.length,missing,benefit,limitation,basis,score:0,notes:[]};}if(EXPANDED_TYPES.has(type)){const data=Array.isArray(rows)?rows:[],cfg={...mapping,type},missing=mappingIssues(cfg,{rows:data});if(!data.length)missing.unshift('Import data to use your own values.');const meta=EXPANDED_META[type];return {compatible:!missing.length,missing,benefit:meta.use,limitation:meta.category==='Experimental'?'Exploratory view; review its assumptions.':'Displayed categories/series are bounded; review chart warnings.',basis:meta.needs,score:0,notes:expandedWarnings(data,cfg,type)};}
 const values=Array.isArray(rows)?rows:[],fields=values.length?getFields(values):[];
 const numeric=values.length?numericFields(values):[],issues=[];
 const {x='',y='',seriesField='',bubbleSizeField='',aggregation='sum'}=mapping;
 const has=f=>!!f&&fields.includes(f),isNum=f=>has(f)&&numeric.includes(f);
 const raw=['geo-route','geo-symbol','geo-heat','scatter','bubble','histogram','box-plot','violin','parallel','timeline','gantt','network'].includes(type);
 const notes=[...CHART_TRADEOFFS[type]||['Shows data in a particular structure.','Review assumptions and labels.','Depends on chart type']];
 if(!values.length)return {compatible:false,missing:['Import data to use your own values.'],benefit:notes[0],limitation:notes[1],basis:notes[2],score:0,notes:[]};
 if(type==='geo-route'){issues.push(...mappingIssues({...mapping,type}, {rows:values}));if(!routeReport(values,{...mapping,type}).routes.length)issues.push('No valid origin/destination connections.');}
 else if(['geo-choropleth','geo-symbol','geo-heat'].includes(type)){
  const latField=mapping.geoLatField,lonField=mapping.geoLonField;const coords=isNum(latField)&&isNum(lonField)&&latField!==lonField;
  if(type==='geo-choropleth'&&(!has(x)||!isNum(y)))issues.push('Choose a country/region field and a numeric measure.');
  if(type==='geo-symbol'&&(!isNum(y)||!has(x)&&!coords))issues.push('Choose numeric values and either a location field or latitude/longitude.');
  if(type==='geo-heat'&&!coords)issues.push('Choose distinct numeric latitude and longitude fields.');
  if(!issues.length&&!geoData(values,{...mapping,x,y,geoLatField:latField,geoLonField:lonField},type).length)issues.push(type==='geo-choropleth'?'No country values match the bundled country boundaries. Use ISO2, ISO3 or a recognised country name.':'No valid geographic observations remain after checking coordinates and values.');
 }else if(['sankey','sunburst'].includes(type)){
  if(!isNum(y))issues.push('Choose a positive numeric flow / size measure.');
  if(!has(x))issues.push('Choose a valid source / group field.');
  if(!has(seriesField)||[x,y].includes(seriesField))issues.push('Choose a distinct target / subgroup field.');
  if(isNum(y)&&!values.some(r=>Number(r[y])>0))issues.push('Positive values are required.');
 }else if(type==='network'){
  if(!has(x)||!has(seriesField)||x===seriesField)issues.push('Choose distinct source and destination fields.');
 }else if(type==='timeline'){
  if(!has(x)||!values.some(r=>Number.isFinite(Date.parse(String(r[x]??'')))))issues.push('Choose a field containing parseable dates.');
  if(!has(mapping.labelField))issues.push('Choose an event label field.');
 }else if(type==='gantt'){
  if(!has(x))issues.push('Choose a task label field.');
  if(!has(y)||!has(mapping.endField)||y===mapping.endField||!values.some(r=>Number.isFinite(Date.parse(String(r[y]??'')))&&Number.isFinite(Date.parse(String(r[mapping.endField]??'')))))issues.push('Choose distinct start and end date fields.');
 }else if(type==='parallel'){
  if(!Array.isArray(mapping.parallelFields)||mapping.parallelFields.filter(isNum).length<2)issues.push('Choose at least two numeric dimensions.');
 }else if(PRO_TYPES.has(type)){issues.push(...mappingIssues({...mapping,type},{rows:values}));if(!issues.length&&!proData(values,{aggregation,...mapping,type},type).length)issues.push('No compatible observations for this chart.');
 }else if(!isNum(y))issues.push('Select a numerical Y / measure field.');
 if(!has(x)&&!['geo-route','geo-heat','geo-symbol','geo-choropleth','histogram','sankey','sunburst','network','timeline','gantt','parallel'].includes(type))issues.push('Select an X / category field.');
 if(['scatter','bubble'].includes(type)&&(!isNum(x)||x===y))issues.push('Choose two different numerical X and Y fields.');
 if(type==='bubble'&&(!isNum(bubbleSizeField)||[x,y].includes(bubbleSizeField)))issues.push('Choose a third, distinct numerical bubble-size field.');
 if(['heatmap','stacked-bar','slope'].includes(type)&&(!has(seriesField)||[x,y].includes(seriesField)))issues.push('Choose a distinct Series / group field.');
 if(type==='treemap'&&has(x)&&isNum(x))issues.push('Choose a categorical X field for treemap groups.');
 if(type==='slope'&&has(x)&&new Set(values.map(r=>String(r[x]))).size<2)issues.push('At least two different X periods are needed.');
 if(['treemap','donut'].includes(type)&&isNum(y)&&!values.some(r=>Number(r[y])>0))issues.push('At least one positive measure is needed.');
 if(type==='bubble'&&isNum(bubbleSizeField)&&!values.some(r=>Number(r[bubbleSizeField])>0))issues.push('At least one positive bubble size is needed.');
 const cautions=[];
 if((type==='line'||type==='area'||type==='slope')&&has(x)&&fieldType(values,x)==='category')cautions.push('Verify that the X values are meaningfully ordered.');
 if(type==='slope'&&has(x)&&new Set(values.map(r=>String(r[x]))).size>2)cautions.push('Only the first and last periods will be displayed.');
 if(type==='stacked-bar'&&aggregation!=='sum')cautions.push(`Adding ${aggregation} values across segments may not represent an additive total.`);
 if(raw)cautions.push('Raw observations are used rather than the shared aggregation.');
 if(['waterfall','donut','treemap','stacked-bar'].includes(type)&&aggregation!=='sum')cautions.push(`This view uses ${aggregation}; check whether that operation makes sense for your goal.`);
 if((type==='bar'||type==='hbar'||type==='dot')&&has(x)&&new Set(values.map(r=>String(r[x]))).size>30)cautions.push('Many categories may make this view difficult to read.');
 return {compatible:issues.length===0,missing:issues,benefit:notes[0],limitation:notes[1],basis:notes[2],notes:cautions,score:0};
}
export function rankComparisonTypes(goal,rows,mapping){
 const target=CHART_GOALS[goal]||CHART_GOALS.comparison;
 return Object.keys(CHART_TRADEOFFS).map(type=>{
  const assessment=compareSuitability(type,rows,mapping),rank=target.indexOf(type);
  return {type,...assessment,score:(rank<0?5:Math.max(8,70-rank*10))+(assessment.compatible?25:-40)-assessment.notes.length*3};
 }).sort((a,b)=>b.score-a.score||a.type.localeCompare(b.type));
}
export function inferVisualGoal(text){
 const value=String(text||'').trim().toLowerCase();
 if(!value)return {goal:null,matched:false};
 const rank=Object.entries(intents).map(([goal,item])=>({goal,score:item.synonyms.reduce((v,s)=>v+(value.includes(s)?s.length>7?3:2:0),0)})).sort((a,b)=>b.score-a.score);
 return {goal:rank[0]?.score?rank[0].goal:null,matched:!!rank[0]?.score};
}

// Explainable mapping suggestions use only column names/types and the described
// communication goal. They are displayed as a proposal, never applied silently.
export function suggestAdvisorMapping(rows,text,goal,current={}){
 const fields=getFields(rows),nums=numericFields(rows),dates=dateFields(rows),nonNumeric=fields.filter(f=>!nums.includes(f));
 const words=String(text||'').toLowerCase();
 const mentioned=fields.filter(f=>{
  const q=f.toLowerCase().trim();if(!q)return false;
  return new RegExp(`(^|[^a-z0-9])${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}([^a-z0-9]|$)`,'i').test(words);
 });
 const namedNums=mentioned.filter(f=>nums.includes(f)),namedCats=mentioned.filter(f=>!nums.includes(f));
 const looksTemporal=f=>dates.includes(f)||/^(year|date|time|month|quarter|week|day|period|timestamp)$/i.test(f)||/(^|\W)(year|date|time|month|quarter|week|day|period)(\W|$)/i.test(f);
 const temporal=fields.filter(looksTemporal),otherCats=nonNumeric.filter(f=>!temporal.includes(f));
 let x='',y='';
 if(goal==='schedule'){
  x=namedCats.find(f=>/task|activity|name|work/i.test(f))||fields.find(f=>/task|activity|name|work/i.test(f))||nonNumeric[0]||fields[0]||'';
  y=fields.find(f=>/^(start|begin|start.date)$/i.test(f))||fields.find(f=>f!==x&&/date|start/i.test(f))||'';
 }else if(goal==='geography'){
  x=fields.find(f=>/^(country|country.name|iso|iso2|iso3|country.code|location|region|place|city)$/i.test(f))||namedCats[0]||otherCats[0]||fields[0]||'';
  y=namedNums[0]||nums.find(f=>!/(latitude|longitude|^lat$|^lon$|^lng$)/i.test(f))||nums[0]||'';
 }else if(goal==='timeline'){
  x=namedCats.find(f=>temporal.includes(f))||temporal[0]||fields.find(f=>/date|time/i.test(f))||fields[0]||'';
  y=x;
 }else if(goal==='flow'||goal==='hierarchy'){
  x=namedCats[0]||nonNumeric[0]||fields[0]||'';
  y=namedNums[0]||nums[0]||'';
 }else if(goal==='multivariate'){
  x=nonNumeric[0]||fields[0]||'';
  y=nums[0]||'';
 }else if(goal==='trend'||goal==='finance'){
  x=namedCats.find(f=>temporal.includes(f))||temporal[0]||namedCats[0]||nonNumeric[0]||fields[0]||'';
  y=namedNums[0]||nums.find(f=>f!==x)||'';
 }else if(goal==='distribution'){
  y=namedNums[0]||nums.find(f=>f!==current.x)||nums[0]||'';
  x=namedCats[0]||otherCats[0]||nonNumeric[0]||temporal[0]||fields[0]||'';
 }else if(goal==='relation'){
  x=namedNums[0]||nums.find(f=>f!==current.y)||nums[0]||'';
  y=namedNums.find(f=>f!==x)||nums.find(f=>f!==x)||'';
 }else{
  x=namedCats[0]||otherCats[0]||nonNumeric[0]||temporal[0]||fields.find(f=>f!==nums[0])||fields[0]||'';
  y=namedNums[0]||nums.find(f=>f!==x)||'';
 }
 const seriesField=fields.find(f=>f!==x&&f!==y&&!nums.includes(f))||'';
 const bubbleSizeField=nums.find(f=>f!==x&&f!==y)||'';
 const endField=fields.find(f=>/^(end|finish|deadline|end.date)$/i.test(f)&&f!==y)||'';
 const labelField=fields.find(f=>/^(event|title|milestone|description|name)$/i.test(f)&&f!==x)||'';
 const targetField=fields.find(f=>/^(target|to|destination|child|subcategory|team)$/i.test(f)&&f!==x)||'';
 const geoLatField=fields.find(f=>/^(lat|latitude)$/i.test(f))||'';
 const geoLonField=fields.find(f=>/^(lon|lng|long|longitude)$/i.test(f))||'';
 return {x,y,geoLatField,geoLonField,seriesField:['flow','hierarchy'].includes(goal)?targetField||seriesField:seriesField,bubbleSizeField,labelField,endField,parallelFields:nums.slice(0,6),aggregation:current.aggregation||'sum',source:'Column-name and data-type rules (please review)'};
}

// V3.53: newer chart families join the deterministic goal lists and trade-off notes.
Object.assign(CHART_TRADEOFFS,{
 pie:['Shows shares of one total at a glance.','Hard to compare similar or many slices.','Angle and area encode share'],
 waffle:['Shows shares as countable units out of 100.','Rounds to whole percentages.','Count of squares encodes share'],
 marimekko:['Shows category size and composition together.','Areas are harder to compare precisely.','Width = total, height = share'],
 'circle-pack':['Shows nested groups compactly.','Circle areas are hard to compare precisely.','Area encodes value'],
 combo:['Shows two related measures on one timeline.','Dual axes can suggest false relationships.','Columns and line, optional second axis'],
 lollipop:['Ranks values with minimal ink.','Less familiar than bars.','Position along a common scale'],
 'split-bars':['Compares several measures per category like a table.','Panels are read separately.','Bar length per panel'],
 'range-plot':['Highlights gaps between two values.','Needs both values in the same units.','Position of two dots'],
 'arrow-plot':['Shows direction and size of change.','Needs start and end in the same units.','Arrow from start to end'],
 bullet:['Compares actuals with targets compactly.','Needs a clear target measure.','Bar length with target marker'],
 gauge:['Shows one value within a known range.','Uses space inefficiently for many values.','Angle along an arc'],
 kpi:['Puts headline numbers first.','Hides distribution and trend.','Large numerals and change'],
 funnel:['Shows drop-off across ordered stages.','Stages must be sequential.','Bar width per stage'],
 candlestick:['Shows open, high, low and close per period.','Specialised for financial data.','Body and wick per period'],
 radar:['Compares profiles across dimensions.','Area exaggerates differences; same units required.','Distance from centre'],
 beeswarm:['Shows every observation without overlap.','Busy with very large samples.','Position of individual dots'],
 ridgeline:['Compares many distribution shapes compactly.','Smoothing depends on bandwidth.','Kernel density ridges'],
 pyramid:['Compares two groups across ordered bands.','Exactly two groups only.','Back-to-back bars'],
 bump:['Shows changes in rank over time.','Hides the size of differences.','Rank position by period'],
 streamgraph:['Shows changing volumes of many series.','Individual layers are hard to read precisely.','Layer thickness'],
 chord:['Shows mutual flows between entities.','Dense with many entities.','Ribbon width encodes flow'],
 'arc-diagram':['Shows connections along an ordered axis.','Long arcs can dominate.','Arc width encodes weight'],
 parliament:['Shows seat shares in a familiar hemicycle.','Only meaningful for whole-number seats.','One dot per seat'],
 wordcloud:['Highlights prominent terms quickly.','Imprecise for comparison.','Font size by weight'],
});
for(const [goal,extra] of Object.entries({flow:['chord','arc-diagram'],hierarchy:['circle-pack'],parts:['pie','waffle','marimekko','parliament'],comparison:['lollipop','range-plot','split-bars','bullet'],trend:['combo','streamgraph','arrow-plot','bump'],distribution:['beeswarm','ridgeline','pyramid'],finance:['kpi','bullet','funnel','candlestick','gauge'],multivariate:['radar']})){if(Array.isArray(CHART_GOALS[goal]))CHART_GOALS[goal].push(...extra.filter(t=>!CHART_GOALS[goal].includes(t)));}
