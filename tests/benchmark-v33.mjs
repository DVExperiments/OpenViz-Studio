// A local comparison only. V3.2 source folder optional; timings fluctuate by machine.
import {performance} from 'node:perf_hooks';
import {writeFile} from 'node:fs/promises';
const latest=await import('../src/data.js');
let baseline=null;try{baseline=await import('../../openviz-studio-v3.2/src/data.js');}catch{}
const rows=Array.from({length:100000},(_,i)=>({ID:i,Year:2020+i%10,Value:i*.75,Count:1,Region:'R'+i%20,Date:'2026-01-01',Missing:i%3===0?null:'value',Text:'abc',Rank:i%9}));
const csv='ID,Year,Value,Count,Region,Date,Missing,Text,Rank\n'+rows.slice(0,50000).map(r=>[r.ID,r.Year,r.Value,r.Count,r.Region,r.Date,r.Missing||'',r.Text,r.Rank].join(',')).join('\n');
function medianTimes(fn){const t=[];for(let i=0;i<5;i++){const start=performance.now();fn();t.push(performance.now()-start);}return t.sort((a,b)=>a-b)[2];}
const result={environment:'Node 22, synthetic dataset; 5 passes, median, not general latency guarantee',rows:rows.length,csvRows:50000,profile:newly(true),csv:newly(false)};
function newly(isProfile){const method=isProfile?'profile':'parseDelimited',arg=isProfile?rows:csv;const old=baseline?medianTimes(()=>baseline[method](arg)):null;const current=medianTimes(()=>latest[method](arg));return {v32MedianMs:old==null?null:+old.toFixed(2),v33MedianMs:+current.toFixed(2),speedup:old==null?null:+(old/current).toFixed(2)};}
const output=JSON.stringify(result,null,2)+'\n';await writeFile(new URL('../docs/BENCHMARK_V33.json',import.meta.url),output);console.log(output);
