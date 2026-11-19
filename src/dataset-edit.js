import {FIELD_BINDING_KEYS,chartFieldNames} from './field-bindings.js';
/** Small, reversible dataset correction operations. Original imported rawRows are never mutated. */
import {getFields,MAX_ROWS} from './data.js';
export function datasetFields(dataset){return Array.isArray(dataset?.columns)&&dataset.columns.length?dataset.columns:getFields(dataset?.rows||[]);}
export function appendBlankRow(dataset){if(!dataset)throw new Error('Choose a dataset.');if(dataset.rows.length>=MAX_ROWS)throw new Error('This dataset has reached the 100,000-row limit.');const columns=datasetFields(dataset);if(!columns.length)throw new Error('Add a column before inserting a row.');dataset.columns=[...columns];dataset.rows.push(Object.fromEntries(columns.map(name=>[name,null])));return dataset.rows.length-1;}
export function deleteDatasetRows(dataset,indices){if(!dataset)throw new Error('Choose a dataset.');const unique=[...new Set(indices)].filter(i=>Number.isInteger(i)&&i>=0&&i<dataset.rows.length).sort((a,b)=>b-a);if(!unique.length)throw new Error('Select at least one row to remove.');dataset.columns=datasetFields(dataset);for(const i of unique)dataset.rows.splice(i,1);return unique.length;}
export function addDatasetColumn(dataset,name,type='text'){if(!dataset)throw new Error('Choose a dataset.');const value=String(name??'').trim();if(!value||value.length>80||/[\x00-\x1f\[\]]/.test(value)||['__proto__','prototype','constructor'].includes(value.toLowerCase()))throw new Error('Use a column name of 1–80 characters, without square brackets or control characters.');if(!['text','number','date'].includes(type))throw new Error('Choose a valid column type.');const fields=datasetFields(dataset);if(fields.some(k=>k.toLocaleLowerCase()===value.toLocaleLowerCase()))throw new Error('A column with that name already exists.');if(fields.length>=300)throw new Error('This dataset has reached the 300-column limit.');dataset.columns=[...fields,value];dataset.columnTypes||={};dataset.columnTypes[value]=type;dataset.rows=dataset.rows.map(row=>({...row,[value]:null}));return value;}
export function columnDependencies(name,charts,calculations){const linked=charts.filter(c=>chartFieldNames(c).includes(name)).map(c=>c.title||c.id);const expressions=(calculations||[]).filter(c=>c.name===name||String(c.expression||'').includes(`[${name}]`)).map(c=>c.name);return {linked,expressions};}
export function removeDatasetColumn(dataset,name,charts=[]){const fields=datasetFields(dataset);if(!fields.includes(name))throw new Error('The column no longer exists.');if(fields.length<=1)throw new Error('Keep at least one column in the dataset.');const dependencies=columnDependencies(name,charts,dataset.calculations||[]);if(dependencies.linked.length||dependencies.expressions.length)throw new Error(`Column is in use: ${[...dependencies.linked,...dependencies.expressions].join(', ')}. Change those mappings or calculations first.`);dataset.columns=fields.filter(field=>field!==name);dataset.rows=dataset.rows.map(row=>Object.fromEntries(Object.entries(row).filter(([key])=>key!==name)));if(dataset.columnTypes)delete dataset.columnTypes[name];return name;}
export function parseManualCell(text,type){const value=String(text??'').trim();if(!value)return null;if(type==='number'){const numeric=Number(value.replaceAll(',',''));if(!Number.isFinite(numeric))throw new Error('Enter a valid numeric value.');return numeric;}return value;}

/** Rename a schema field without losing data or breaking linked chart references.
 * Imported rawRows intentionally retain their original headers for audit/refresh.
 */
export function renameDatasetColumn(dataset,oldName,newName,charts=[]){
 if(!dataset)throw new Error('Choose a dataset.');
 const fields=datasetFields(dataset),old=String(oldName??'');
 if(!fields.includes(old))throw new Error('The column no longer exists.');
 const next=String(newName??'').trim();
 if(!next||next.length>80||/[\x00-\x1f\[\]]/.test(next)||['__proto__','prototype','constructor'].includes(next.toLowerCase()))throw new Error('Use a column name of 1–80 characters, without square brackets or control characters.');
 if(fields.some(name=>name!==old&&name.toLocaleLowerCase()===next.toLocaleLowerCase()))throw new Error('Another column already has that name.');
 if(next===old)return old;
 dataset.columns=fields.map(name=>name===old?next:name);
 dataset.rows=(dataset.rows||[]).map(row=>{
  const replaced=Object.create(null);
  for(const [name,value] of Object.entries(row))replaced[name===old?next:name]=value;
  return Object.assign({},replaced);
 });
 if(dataset.columnTypes&&Object.prototype.hasOwnProperty.call(dataset.columnTypes,old)){
  dataset.columnTypes[next]=dataset.columnTypes[old];delete dataset.columnTypes[old];
 }
 const mappings=FIELD_BINDING_KEYS;
 for(const chart of charts){for(const mapping of mappings){if(chart[mapping]===old)chart[mapping]=next;}
  if(Array.isArray(chart.geoTooltipFields))chart.geoTooltipFields=chart.geoTooltipFields.map(f=>({...f,field:f.field===old?next:f.field}));
  if(Array.isArray(chart.tableColumnStyles))chart.tableColumnStyles=chart.tableColumnStyles.map(style=>({...style,field:style.field===old?next:style.field}));
  if(Array.isArray(chart.parallelFields))chart.parallelFields=chart.parallelFields.map(value=>value===old?next:value);
 }
 for(const calculation of dataset.calculations||[]){
  if(calculation.name===old)calculation.name=next;
  if(typeof calculation.expression==='string')calculation.expression=calculation.expression.split('['+old+']').join('['+next+']');
 }
 // Keep original import and chronological audit log unchanged; append a rename event in the caller.
 return next;
}
