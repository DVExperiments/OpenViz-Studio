// V3.58 what-if parameters. A parameter is a named number with a range (for example "Growth rate",
// 0–20%, step 0.5). Calculated fields refer to it as {Growth rate}, and reference lines can follow it.
// Moving a parameter re-derives only the calculated fields that depend on it, so dataset edits are kept.
import {getFields,compileExpression} from './data.js';

export const PARAM_FORMATS=[['number','Number'],['percent','Percent (value is in %)'],['currency','Currency']];
const NAME_BAD=/[{}[\]]/;
const num=(v,d)=>Number.isFinite(Number(v))&&v!==''&&v!==null?Number(v):d;

export function normalizeParameter(p={}){
 const name=String(p.name??'').trim().slice(0,60);
 if(!name)throw new Error('Give the parameter a name.');
 if(NAME_BAD.test(name))throw new Error('Parameter names cannot contain { } [ or ].');
 let min=num(p.min,0),max=num(p.max,100);if(min>max)[min,max]=[max,min];if(min===max)max=min+1;
 const step=Math.abs(num(p.step,1))||1,value=Math.min(max,Math.max(min,num(p.value,min)));
 const format=PARAM_FORMATS.some(([f])=>f===p.format)?p.format:'number';
 return {id:String(p.id||`param-${Math.random().toString(36).slice(2,9)}`),name,value,min,max,step,format,...(p.description?{description:String(p.description).slice(0,200)}:{})};
}
export function formatParameter(p,v=p?.value){
 const n=Number(v);if(!Number.isFinite(n))return '';const decimals=Math.min(6,Math.max(0,(String(p?.step??1).split('.')[1]||'').length));
 const s=n.toLocaleString(undefined,{minimumFractionDigits:decimals,maximumFractionDigits:decimals});
 return p?.format==='percent'?`${s}%`:p?.format==='currency'?`$${s}`:s;
}
// Names referred to as {Name} in an expression.
export function parameterRefs(expression){return [...String(expression||'').matchAll(/\{([^{}]{1,60})\}/g)].map(m=>m[1].trim());}
export function parameterValues(list){const out={};for(const p of list||[])out[p.name]=Number(p.value);return out;}
// Replaces {Name} with the parameter's current value so the existing expression engine can run it.
export function substituteParameters(expression,values={}){
 return String(expression||'').replace(/\{([^{}]{1,60})\}/g,(_,raw)=>{const name=raw.trim();if(!Object.prototype.hasOwnProperty.call(values,name)||!Number.isFinite(values[name]))throw new Error(`Unknown parameter: {${name}}. Add it in Data → What-if parameters.`);const v=values[name];return v<0?`(0-${Math.abs(v)})`:`(${v})`;});
}
export function calculationUsesParameters(calc){return parameterRefs(calc?.expression).length>0;}
export function datasetUsesParameters(d){return (d?.calculations||[]).some(calculationUsesParameters);}
// Recomputes calculated columns from the first one that uses a parameter onwards (later ones may build on it).
export function recomputeParameterCalculations(rows,calcs,values){
 const start=(calcs||[]).findIndex(calculationUsesParameters);if(start<0)return rows;let out=rows;
 for(const calc of calcs.slice(start)){const fields=getFields(out);const fn=compileExpression(substituteParameters(calc.expression,values),fields);out=out.map(r=>{const v=fn(r);return {...r,[calc.name]:Number.isFinite(v)?v:null};});}
 return out;
}
// Applies every parameter's current value to the project: dataset calculations and reference lines.
// Returns the names of datasets and charts that changed.
export function applyParameters(project){
 const list=project?.parameters||[],values=parameterValues(list),changed={datasets:[],charts:[],errors:[]};
 for(const d of project?.datasets||[]){if(!datasetUsesParameters(d)||!d.rows?.length)continue;try{d.rows=recomputeParameterCalculations(d.rows,d.calculations,values);changed.datasets.push(d.name);}catch(e){changed.errors.push(`${d.name}: ${e.message}`);}}
 for(const c of project?.charts||[]){if(c.refLineMode!=='parameter')continue;const p=list.find(x=>x.id===c.refLineParam);c.refLineValue=p?p.value:'';c.refLineParamName=p?p.name:'';c.refLineValueText=p?formatParameter(p):'';changed.charts.push(c.title);}
 return changed;
}
// Which parameters a chart depends on (through its dataset's calculations or its reference line).
export function chartParameters(project,chart){
 const list=project?.parameters||[];if(!chart||!list.length)return [];const names=new Set();
 const d=(project.datasets||[]).find(x=>x.id===chart.datasetId);for(const c of d?.calculations||[])parameterRefs(c.expression).forEach(n=>names.add(n));
 return list.filter(p=>names.has(p.name)||(chart.refLineMode==='parameter'&&chart.refLineParam===p.id));
}
// Where a parameter is used, for the manager dialog and before deleting.
export function parameterUsage(project,p){
 const calcs=[],charts=[];for(const d of project?.datasets||[])for(const c of d.calculations||[])if(parameterRefs(c.expression).includes(p.name))calcs.push(`${d.name} → ${c.name}`);
 for(const c of project?.charts||[])if(c.refLineMode==='parameter'&&c.refLineParam===p.id)charts.push(c.title||'Untitled chart');
 return {calcs,charts};
}
// Renaming a parameter rewrites {Old name} references so calculations keep working.
export function renameParameterRefs(project,oldName,newName){if(oldName===newName)return 0;let n=0;
 for(const d of project?.datasets||[])for(const c of d.calculations||[]){const next=c.expression.replace(/\{([^{}]{1,60})\}/g,(m,raw)=>raw.trim()===oldName?(n++,`{${newName}}`):m);c.expression=next;}
 return n;}
