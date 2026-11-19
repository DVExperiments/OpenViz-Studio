import {parseDelimited,addCalculatedField,aggregate} from 'src/data.js';
import {buildChart} from 'src/charts.js';
import {applyParameters} from 'src/parameters.js';
import {livePayload} from 'src/live-publish.js';
import {writeFileSync} from 'node:fs';
const regions=['North','South','East','West','Central'],cats=Array.from({length:40},(_,i)=>`Product ${i+1}`);
function csv(n){let s='Date,Region,Product,Sales,Units,Margin\n';for(let i=0;i<n;i++){const d=new Date(Date.UTC(2020,0,1)+((i*37)%1800)*864e5).toISOString().slice(0,10);s+=`${d},${regions[i%5]},${cats[(i*7)%40]},${(100+((i*7919)%1000)/3).toFixed(2)},${1+(i*13)%50},${((i*31)%40)/100}\n`;}return s;}
const t=f=>{const a=performance.now();const r=f();return [r,Math.round(performance.now()-a)];};
const out=[];
for(const n of [10000,50000,99999]){
 const text=csv(n);if(n===50000)writeFileSync('/tmp/perf-50k.csv',text);if(n===99999)writeFileSync("/tmp/perf-100k.csv",text);
 const [rows,tp]=t(()=>parseDelimited(text,','));
 const [calc,tc]=t(()=>addCalculatedField(rows,'Revenue','[Sales]*[Units]*(1+{G}/100)',{G:5}));
 const res={rows:n,mb:(text.length/1048576).toFixed(1),parse:tp,calc:tc};
 for(const [type,x,y] of [['bar','Region','Sales'],['line','Date','Sales'],['scatter','Sales','Units'],['heatmap','Region','Product'],['histogram','Sales','Sales'],['box-plot','Region','Sales'],['treemap','Product','Sales'],['beeswarm','Region','Sales']]){
  try{const [svg,tm]=t(()=>buildChart(calc,{x,y,aggregation:'sum',title:'t',color:'Product'},type,{width:960,height:540}));res[type]=`${tm}ms/${Math.round(svg.length/1024)}KB`;}catch(e){res[type]='ERR '+e.message.slice(0,40);}
 }
 const project={parameters:[{id:'g',name:'G',value:10,min:0,max:50,step:1}],datasets:[{id:'d',name:'S',rows:calc,calculations:[{name:'Revenue',expression:'[Sales]*[Units]*(1+{G}/100)'}]}],charts:[{id:'c',title:'c',type:'bar',datasetId:'d',x:'Region',y:'Revenue'}],dashboards:[]};
 res.applyParameters=t(()=>applyParameters(project))[1];
 const [lp,tl]=t(()=>livePayload(project,{kind:'chart',assetId:'c'}));res.livePayload=`${tl}ms/${(JSON.stringify(lp.payload).length/1048576).toFixed(1)}MB ${lp.warnings.length?'(warn)':''}`;
 res.json=`${(JSON.stringify(calc).length/1048576).toFixed(1)}MB`;
 out.push(res);console.log(JSON.stringify(res));
}
