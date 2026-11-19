import {formatMapLegendValue} from './map-legend-format.js';
export const TOOLTIP_FIELD_METHODS={unique:'Unique text',sum:'Sum',average:'Mean',min:'Minimum',max:'Maximum',count:'Non-empty count'};
export const newTooltipField=()=>({field:'',label:'',aggregation:'unique',format:'auto',decimals:2,prefix:'',suffix:''});
export function validateTooltipFields(fields=[]){
 if(!Array.isArray(fields)||fields.length>4)throw Error('Choose at most four additional tooltip fields.');
 const keys=Object.keys(newTooltipField());for(const f of fields){if(!f||typeof f!=='object'||Array.isArray(f)||Object.keys(f).some(k=>!keys.includes(k)))throw Error('Invalid additional tooltip field.');
  for(const [k,max] of [['field',300],['label',60],['prefix',16],['suffix',16]])if(typeof f[k]!=='string'||f[k].length>max||/[\x00-\x1f\x7f]/.test(f[k])||k==='field'&&(!f[k].trim()||['__proto__','constructor','prototype'].includes(f[k])))throw Error('Choose a source column and plain tooltip labels within their length limits.');
  if(!Object.hasOwn(TOOLTIP_FIELD_METHODS,f.aggregation)||!['auto','decimal','compact','scientific'].includes(f.format)||!Number.isInteger(f.decimals)||f.decimals<0||f.decimals>6)throw Error('Choose a supported tooltip aggregation, number format and 0–6 decimal places.');
 }return true;
}
const present=v=>(typeof v==='string'&&v.trim()!=='')||(typeof v==='number'&&Number.isFinite(v))||typeof v==='boolean';
const numeric=v=>(typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v));
export function tooltipFieldResult(rows,f){
 const values=rows.map(r=>Object.hasOwn(r,f.field)?r[f.field]:undefined),label=f.label||f.field,method=TOOLTIP_FIELD_METHODS[f.aggregation];
 if(f.aggregation==='unique'){const seen=new Map();for(const v of values.filter(present)){const text=(typeof v==='string'?v.trim():String(v)).replace(/[\x00-\x1f\x7f]/g,'�');seen.set(typeof v+':'+text,text);}const valid=values.filter(present).length;return {label,method,text:seen.size===0?'No data':seen.size>1?'Multiple values ('+seen.size+' distinct)':Array.from([...seen.values()][0]).slice(0,120).join('')+(Array.from([...seen.values()][0]).length>120?'…':''),valid,excluded:rows.length-valid,value:null};}
 const selected=values.filter(f.aggregation==='count'?present:numeric),numbers=selected.map(Number);let value=null;if(f.aggregation==='count')value=selected.length;else if(numbers.length){if(f.aggregation==='sum')value=numbers.reduce((a,v)=>a+v,0);else if(f.aggregation==='average')value=numbers.reduce((a,v)=>a+v/numbers.length,0);else if(f.aggregation==='min')value=numbers.reduce((a,v)=>Math.min(a,v),Infinity);else value=numbers.reduce((a,v)=>Math.max(a,v),-Infinity);}
 if(value!==null&&!Number.isFinite(value))return {label,method,text:'Outside numeric range',value:null,valid:selected.length,excluded:rows.length-selected.length};
 const display=value===null?{text:'No data',exact:'No data',approximate:false}:formatMapLegendValue(value,{geoLegendNumberFormat:f.format,geoLegendDecimals:f.decimals,geoLegendPrefix:f.prefix,geoLegendSuffix:f.suffix});return {label,method,text:display.text,exact:display.exact,approximate:display.approximate,value,valid:selected.length,excluded:rows.length-selected.length};
}
export function tooltipFieldLines(rows,fields,showExact=true){return fields.flatMap(f=>{const r=tooltipFieldResult(rows,f),name=r.label+' ('+r.method+')',lines=[name+': '+r.text];if(showExact&&r.approximate)lines.push(name+' exact: '+r.exact);if(r.excluded)lines.push(name+': '+r.valid+' valid; '+r.excluded+' missing/invalid');return lines;});}
