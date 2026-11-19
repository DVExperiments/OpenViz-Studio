/** OpenViz Studio V2.6: deterministic, portable, non-destructive visual styles.
 * Styles never contain data mappings, chart types, dataset IDs, project IDs, axes
 * values, annotations, point overrides or publication/figure metadata.
 */
export const THEME_SCHEMA_VERSION=1;
const hex=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
const FONT_RE=/^[A-Za-z0-9 ,.'"-]{1,110}$/;
const RULES={
 color:['color'],secondary:['color'],background:['color'],textColor:['color'],gridColor:['color'],
 titleColor:['color'],axisColor:['color'],labelColor:['color'],geoOcean:['color'],
 font:['font'],gridDash:['enum',['solid','dashed','dotted']],titleAlign:['enum',['left','center','right']],
 geoPalette:['enum',['teal','blue','sunset','purple','gray']],
 showGrid:['boolean'],showLegend:['boolean'],showAxes:['boolean'],showLabels:['boolean'],
 titleWeight:['number',100,900],titleSize:['number',12,64],labelSize:['number',8,32],axisFontSize:['number',8,32],
 legendFontSize:['number',8,32],gridWidth:['number',.2,5],axisLineWidth:['number',.5,8],
 lineWidth:['number',.5,15],pointSize:['number',1,25],barRadius:['number',0,25],
 geoBorderWidth:['number',0,5],geoOpacity:['number',0,1],
 // Optional layout tier: only applied when explicitly selected in UI.
 padding:['number',10,130],marginTop:['nullableNumber',0,300],marginRight:['nullableNumber',0,300],
 marginBottom:['nullableNumber',0,300],marginLeft:['nullableNumber',0,300],
 legendPosition:['enum',['top-right','top-left','bottom','right','custom']],
 barWidthRatio:['number',.08,1],xLabelRotation:['number',-90,90]
};
export const LAYOUT_PROPERTIES=new Set(['padding','marginTop','marginRight','marginBottom','marginLeft','legendPosition','barWidthRatio','xLabelRotation']);
export const STYLE_PROPERTIES=Object.freeze(Object.keys(RULES));
function checked(key,value){const r=RULES[key];if(!r)return undefined;
 if(r[0]==='color')return hex(value)?value.toLowerCase():undefined;
 if(r[0]==='font')return typeof value==='string'&&FONT_RE.test(value)&&!value.toLowerCase().includes('url')?value:undefined;
 if(r[0]==='boolean')return typeof value==='boolean'?value:undefined;
 if(r[0]==='enum')return r[1].includes(value)?value:undefined;
 if(r[0]==='nullableNumber'&&value===null)return null;
 if(r[0]==='number'||r[0]==='nullableNumber')return typeof value==='number'&&Number.isFinite(value)&&value>=r[1]&&value<=r[2]?value:undefined;
 return undefined;
}
export function cleanStyle(values){const clean={};if(!values||typeof values!=='object'||Array.isArray(values))return clean;
 for(const key of STYLE_PROPERTIES){if(!Object.prototype.hasOwnProperty.call(values,key))continue;const result=checked(key,values[key]);if(result!==undefined)clean[key]=result;}
 return clean;
}
const DEFAULT={
 color:'#0d9488',secondary:'#f2aa64',background:'#ffffff',textColor:'#1c2c3e',
 gridColor:'#e0e6ec',axisColor:'#718293',labelColor:'#1c2c3e',titleColor:'#1c2c3e',
 font:'Arial, sans-serif',titleSize:26,labelSize:12,axisFontSize:12,legendFontSize:12,
 titleWeight:700,gridWidth:1,axisLineWidth:1,lineWidth:3,pointSize:5,barRadius:3,
 gridDash:'dashed',showGrid:true,geoOcean:'#eff6f9',geoPalette:'teal',geoBorderWidth:.65,geoOpacity:.6
};
function builtin(id,name,category,description,overrides,layout={}){return {
 version:THEME_SCHEMA_VERSION,id,name,category,description,builtIn:true,
 properties:{...DEFAULT,...overrides,...layout}
};}
/** Curated OpenViz styles. Academic styles are visual starting points, not compliance certification. */
export const BUILTIN_STYLES=Object.freeze([
 builtin('editorial-teal','Editorial teal','Editorial','Restrained teal, clear typography and low-contrast gridlines.',{}),
 builtin('research-mono','Research monochrome','Academic','High-contrast black-and-white figure styling suitable for further academic formatting.',{color:'#252525',secondary:'#767676',textColor:'#191919',titleColor:'#191919',labelColor:'#191919',axisColor:'#393939',gridColor:'#dedede',font:'Arial, sans-serif',geoPalette:'gray',showGrid:false,lineWidth:2.5,pointSize:5,barRadius:0,gridDash:'solid'},{padding:38}),
 builtin('boardroom-navy','Boardroom navy','Business','Executive reporting, cool blues and confident headings.',{color:'#255b92',secondary:'#e3a34d',textColor:'#193249',titleColor:'#193249',labelColor:'#193249',axisColor:'#70879b',gridColor:'#d9e6ee',font:'Aptos, Arial, sans-serif',geoPalette:'blue',titleWeight:800,barRadius:3},{padding:42}),
 builtin('newsroom-ink','Newsroom ink','Journalism','Accessible editorial styling with a bold accent and understated axes.',{color:'#b4423d',secondary:'#466f8b',textColor:'#252a2e',titleColor:'#252a2e',labelColor:'#252a2e',axisColor:'#72787b',gridColor:'#e2e1dc',font:'Georgia, serif',geoPalette:'sunset',titleWeight:700,showGrid:false,barRadius:0},{padding:45}),
 builtin('presentation-bright','Presentation clarity','Presentation','Readable from a distance, with larger labels and high contrast.',{color:'#147ca3',secondary:'#e19934',textColor:'#142f43',titleColor:'#142f43',labelColor:'#142f43',axisColor:'#566878',gridColor:'#dde9ef',font:'Arial, sans-serif',titleSize:34,labelSize:17,axisFontSize:16,legendFontSize:16,titleWeight:800,lineWidth:4,pointSize:7,gridDash:'solid'},{padding:55}),
 builtin('dark-indigo','Midnight indigo','Presentation','Deep charcoal canvas for dark presentations and embeds.',{color:'#7dbbb7',secondary:'#e1af70',background:'#181e29',textColor:'#f4f5f8',titleColor:'#ffffff',labelColor:'#edf2f6',axisColor:'#c1cad5',gridColor:'#455064',geoOcean:'#222c3b',geoPalette:'purple',font:'Arial, sans-serif',gridDash:'solid',lineWidth:3.5},{padding:45}),
 builtin('accessible-bold','High-contrast accessible','Accessibility','Distinguishable blue/orange and clearer marks, lines and labels.',{color:'#0057a8',secondary:'#c65e00',textColor:'#101c2b',titleColor:'#101c2b',labelColor:'#101c2b',axisColor:'#374151',gridColor:'#d5dbe2',font:'Arial, sans-serif',geoPalette:'blue',titleSize:30,labelSize:15,axisFontSize:14,legendFontSize:14,gridWidth:1.2,lineWidth:4,pointSize:8,barRadius:1,gridDash:'solid'},{padding:50}),
 // V3.60 newsroom presets: generic styles inspired by common publication conventions (no brands).
 builtin('news-financial-paper','Financial paper','Newsroom','Warm paper background, deep blue and claret series, compact serif headings.',{color:'#0f5499',secondary:'#990f3d',background:'#fff1e5',textColor:'#33302e',titleColor:'#1a1817',labelColor:'#33302e',axisColor:'#66605c',gridColor:'#e6d9ce',font:'Georgia, serif',geoOcean:'#f2e5da',geoPalette:'blue',titleWeight:600,showGrid:true,gridDash:'solid',barRadius:0,lineWidth:2.5},{padding:40}),
 builtin('news-weekly-briefing','Weekly briefing','Newsroom','Crisp white canvas, strong blue first series, red highlight and solid light gridlines.',{color:'#006ba2',secondary:'#e3120b',textColor:'#0c0c0c',titleColor:'#0c0c0c',labelColor:'#333333',axisColor:'#595959',gridColor:'#d9d9d9',font:'Arial, sans-serif',geoPalette:'blue',titleWeight:700,titleSize:24,gridDash:'solid',barRadius:0,lineWidth:2.5},{padding:38}),
 builtin('news-wire-service','Wire service','Newsroom','Neutral greys with an orange accent, built for fast, clean news graphics.',{color:'#fa6400',secondary:'#404040',textColor:'#1f1f1f',titleColor:'#1f1f1f',labelColor:'#404040',axisColor:'#6b6b6b',gridColor:'#e5e5e5',font:'Arial, sans-serif',geoPalette:'gray',titleWeight:700,gridDash:'solid',barRadius:0,lineWidth:2.5},{padding:36}),
 builtin('news-public-broadcaster','Public broadcaster','Newsroom','Large left-aligned titles, teal-blue and amber, generous spacing for readability.',{color:'#1380a1',secondary:'#faab18',textColor:'#222222',titleColor:'#222222',labelColor:'#222222',axisColor:'#555555',gridColor:'#cbcbcb',font:'Helvetica, Arial, sans-serif',geoPalette:'teal',titleWeight:700,titleSize:30,labelSize:14,axisFontSize:14,legendFontSize:14,gridDash:'solid',barRadius:0,lineWidth:3},{padding:44}),
 builtin('news-data-desk','Data desk serif','Newsroom','Serif headlines, muted sage and rust, and quiet dotted gridlines for long-form stories.',{color:'#5b8a72',secondary:'#c0603a',textColor:'#121212',titleColor:'#121212',labelColor:'#333333',axisColor:'#777777',gridColor:'#e2e2e2',font:'Georgia, serif',geoPalette:'teal',titleWeight:700,gridDash:'dotted',barRadius:0,lineWidth:2.25},{padding:42}),
 builtin('news-tabloid-bold','Tabloid bold','Newsroom','Heavy black titles, signal red and high contrast for punchy explainers.',{color:'#d7141a',secondary:'#111111',textColor:'#111111',titleColor:'#000000',labelColor:'#111111',axisColor:'#333333',gridColor:'#dddddd',font:'Arial Black, Arial, sans-serif',geoPalette:'sunset',titleWeight:900,titleSize:30,gridDash:'solid',barRadius:0,lineWidth:3.5,pointSize:7},{padding:38}),
 builtin('news-statistics-office','Statistics office','Newsroom','Official-statistics look: navy and sky blue, plain sans-serif and solid gridlines.',{color:'#206095',secondary:'#27a0cc',textColor:'#222222',titleColor:'#003c57',labelColor:'#222222',axisColor:'#707070',gridColor:'#d9d9d9',font:'Arial, sans-serif',geoPalette:'blue',titleWeight:700,gridDash:'solid',barRadius:0,lineWidth:2.5},{padding:42}),
 builtin('news-night-desk','Night desk','Newsroom','Dark broadcast canvas with bright cyan and gold, for video and live blogs.',{color:'#38c6f4',secondary:'#ffc845',background:'#111820',textColor:'#e9eef2',titleColor:'#ffffff',labelColor:'#e9eef2',axisColor:'#9aa8b5',gridColor:'#2c3a47',geoOcean:'#16212c',geoPalette:'purple',font:'Arial, sans-serif',gridDash:'solid',lineWidth:3},{padding:42}),
 builtin('warm-minimal','Warm minimal','Editorial','Soft neutral tones, ample space and subtle visual hierarchy.',{color:'#88735a',secondary:'#b65f4a',background:'#fffcf7',textColor:'#3d3730',titleColor:'#3d3730',labelColor:'#3d3730',axisColor:'#857a6b',gridColor:'#e9e3d9',font:'Georgia, serif',geoPalette:'sunset',showGrid:false,barRadius:2},{padding:55}),
]);
/** A user-created preset is intentionally a simple JSON record. */
export function parseUserStyle(value){if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Style must be a JSON object.');
 if(value.version!==THEME_SCHEMA_VERSION)throw new Error('Unsupported style version.');
 if(typeof value.name!=='string'||!value.name.trim()||value.name.length>80)throw new Error('Enter a style name under 80 characters.');
 const props=cleanStyle(value.properties);
 if(!Object.keys(props).length)throw new Error('No supported design properties found.');
 const id=(typeof value.id==='string'&&/^custom-[a-zA-Z0-9_-]{4,80}$/.test(value.id))?value.id:'custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
 const desc=typeof value.description==='string'?value.description.trim().slice(0,180):'';
 return {version:1,id,name:value.name.trim(),description:desc,category:'My styles',builtIn:false,properties:props};
}
export function styleFromChart(chart,name,description=''){const properties={};for(const k of STYLE_PROPERTIES){const value=chart?.[k];if(value!==undefined)properties[k]=value;}
 return parseUserStyle({version:1,name,description,properties});
}
export function applyStyle(chart,style,{includeLayout=false,resetOverrides=false}={}){
 const values=cleanStyle(style.properties||{});
 for(const [key,value] of Object.entries(values)){if(!includeLayout&&LAYOUT_PROPERTIES.has(key))continue;chart[key]=value;}
 // Do not change chart type, fields, values, data source, annotations, title, axes bounds or publication metadata.
 if(resetOverrides)chart.pointColors={};
 return chart;
}
export function normalizeUserStyles(input){if(!Array.isArray(input))return [];const arr=[];const ids=new Set();for(const raw of input.slice(0,80)){try{const item=parseUserStyle(raw);if(!ids.has(item.id)){arr.push(item);ids.add(item.id);}}catch{}}return arr;}
export function styleTokensForSlides(style){const p=cleanStyle(style.properties);return {background:p.background||'#ffffff',textColor:p.textColor||'#1c2c3e',font:p.font||'Arial, sans-serif',accent:p.color||'#0d9488',secondary:p.secondary||'#f2aa64'};}
