import {chartFieldNames} from './field-bindings.js';
import {substituteParameters} from './parameters.js';
/** Local-only data pipeline. No expressions are executed as JavaScript. */
export const demoRows = [
  {Year:2021,Region:'North',Revenue:242000,Orders:840,Cost:128000,Profit:114000},
  {Year:2021,Region:'South',Revenue:175000,Orders:720,Cost:98000,Profit:77000},
  {Year:2021,Region:'East',Revenue:208000,Orders:770,Cost:119000,Profit:89000},
  {Year:2022,Region:'North',Revenue:281000,Orders:903,Cost:147000,Profit:134000},
  {Year:2022,Region:'South',Revenue:198000,Orders:780,Cost:103000,Profit:95000},
  {Year:2022,Region:'East',Revenue:225000,Orders:812,Cost:128000,Profit:97000},
  {Year:2023,Region:'North',Revenue:298000,Orders:966,Cost:161000,Profit:137000},
  {Year:2023,Region:'South',Revenue:226000,Orders:827,Cost:118000,Profit:108000},
  {Year:2023,Region:'East',Revenue:256000,Orders:880,Cost:137000,Profit:119000},
  {Year:2024,Region:'North',Revenue:345000,Orders:1080,Cost:182000,Profit:163000},
  {Year:2024,Region:'South',Revenue:257000,Orders:942,Cost:131000,Profit:126000},
  {Year:2024,Region:'East',Revenue:282000,Orders:986,Cost:150000,Profit:132000},
  {Year:2025,Region:'North',Revenue:402000,Orders:1194,Cost:207000,Profit:195000},
  {Year:2025,Region:'South',Revenue:285000,Orders:1030,Cost:146000,Profit:139000},
  {Year:2025,Region:'East',Revenue:321000,Orders:1097,Cost:166000,Profit:155000},
  {Year:2026,Region:'North',Revenue:447000,Orders:1284,Cost:226000,Profit:221000},
  {Year:2026,Region:'South',Revenue:319000,Orders:1142,Cost:161000,Profit:158000},
  {Year:2026,Region:'East',Revenue:366000,Orders:1208,Cost:188000,Profit:178000},
];
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_ROWS = 100000;
const numText = /^[-+]?(?:(?:\d{1,3}(?:,\d{3})+)|\d+)(?:\.\d+)?(?:e[-+]?\d+)?$/i;
function coerce(v){if(v==null)return null;if(typeof v!=='string')return v;const str=v.trim();if(!str)return null;if(numText.test(str)&&!(/^0\d+/.test(str))) {const n=Number(str.replaceAll(',',''));if(Number.isFinite(n))return n;}return v;}
export function parseDelimited(input, delimiter=','){
 // Builds each row only once; the previous importer first retained a second,
 // full-size matrix of raw cell arrays, doubling peak allocations on 100k CSVs.
 const text=String(input).replace(/^\uFEFF/,''),rows=[];
 let header=null,row=[],field='',quote=false;
 const commit=()=>{
  row.push(field);field='';
  if(!row.some(v=>String(v).trim()!=='')){row=[];return;}
  if(header===null){
   header=row.map((v,i)=>String(v).trim()||`Column ${i+1}`);
   if(new Set(header).size<header.length)throw new Error('Duplicate column headers are not supported.');
  }else{
   if(rows.length>=MAX_ROWS)throw new Error(`This build supports up to ${MAX_ROWS.toLocaleString()} rows per dataset.`);
   const obj={};for(let i=0;i<header.length;i++)obj[header[i]]=coerce(row[i]??'');rows.push(obj);
  }
  row=[];
 };
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){if(quote&&text[i+1]==='"'){field+='"';i++;}else if(!quote&&!field)quote=true;else if(quote)quote=false;else field+=c;}
  else if(c===delimiter&&!quote){row.push(field);field='';}
  else if((c==='\r'||c==='\n')&&!quote){if(c==='\r'&&text[i+1]==='\n')i++;commit();}
  else field+=c;
 }
 if(quote)throw new Error('Unclosed quoted value in CSV');commit();
 if(!header||!rows.length)throw new Error('A header row and at least one data row are required.');
 return rows;
}
// V3.59: per-array caches. Row arrays are replaced (not mutated) by every edit except a single-cell
// edit, which calls rowsChanged(); large datasets no longer rescan 100,000 rows on every redraw.
const fieldsCache=new WeakMap(),aggregateCache=new WeakMap();
export function rowsChanged(rows){if(rows){fieldsCache.delete(rows);aggregateCache.delete(rows);}}
export function getFields(rows){
 if(Array.isArray(rows)&&rows.length>2000){const hit=fieldsCache.get(rows);if(hit)return hit.slice();const out=scanFields(rows);fieldsCache.set(rows,out);return out.slice();}
 return scanFields(rows);}
function scanFields(rows){
 const fields=[],seen=new Set();
 for(const row of rows){for(const key of Object.keys(row)){if(!seen.has(key)){seen.add(key);fields.push(key);}}}
 return fields;
}
export function fieldType(rows,key){const values=rows.slice(0,5000).map(x=>x[key]).filter(x=>x!==null&&x!==undefined&&x!=='');if(!values.length)return 'empty';if(values.every(v=>typeof v==='number'&&Number.isFinite(v)))return 'number';if(values.every(v=>/^\d{4}-\d\d-\d\d/.test(String(v))))return 'date';return 'category';}
export function numericFields(rows){return getFields(rows).filter(f=>fieldType(rows,f)==='number');}
export function dateFields(rows){return getFields(rows).filter(f=>fieldType(rows,f)==='date');}
export function profile(rows){
 // One column profile pass, exact missingness. Types deliberately use the same
 // first-5,000-row rule as fieldType so existing projects classify identically.
 const cols=getFields(rows),states=cols.map(name=>({name,missing:0,seen:false,numeric:true,dates:true}));
 for(let i=0;i<rows.length;i++){
  const row=rows[i];
  for(const st of states){const value=row[st.name];
   if(value==null||value===''){st.missing++;continue;}
   if(i<5000){st.seen=true;st.numeric &&= typeof value==='number'&&Number.isFinite(value);st.dates &&= /^\d{4}-\d\d-\d\d/.test(String(value));}
  }
 }
 const fields=states.map(st=>({name:st.name,type:!st.seen?'empty':st.numeric?'number':st.dates?'date':'category',missing:st.missing}));
 return {rowCount:rows.length,colCount:cols.length,fields,issues:fields.filter(f=>f.missing).map(f=>`${f.name}: ${f.missing} missing values`)};
}
export function parseJSON(text){const parsed=JSON.parse(text);if(!Array.isArray(parsed)||!parsed.length||!parsed.every(v=>v&&typeof v==='object'&&!Array.isArray(v)))throw new Error('JSON must be a non-empty array of objects.');if(parsed.length>MAX_ROWS)throw new Error('Dataset exceeds row limit.');return parsed;}
function textOfCell(cell){if(!cell)return '';const texts=[...cell.getElementsByTagName('t')];if(texts.length)return texts.map(n=>n.textContent??'').join('');return cell.getElementsByTagName('v')[0]?.textContent??'';}
function columnIndex(ref){let s=String(ref).match(/^[A-Z]+/i)?.[0]||'A';return [...s.toUpperCase()].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0)-1;}
function excelDate(serial,epoch1904=false){const days=Number(serial);if(!Number.isFinite(days))return null;const base=epoch1904?Date.UTC(1904,0,1):Date.UTC(1899,11,30);const date=new Date(base+Math.round(days*86400000));if(Number.isNaN(date.getTime()))return null;const iso=date.toISOString();return Math.abs(days%1)>0.00001?iso.slice(0,19).replace('T',' '):iso.slice(0,10);}
function getDateStyles(zipStyles){if(!zipStyles)return new Set();const numFmtMap=new Map([...zipStyles.getElementsByTagName('numFmt')].map(el=>[Number(el.getAttribute('numFmtId')),el.getAttribute('formatCode')||'']));const builtin=new Set([14,15,16,17,18,19,20,21,22,45,46,47]);const xfs=[...zipStyles.getElementsByTagName('cellXfs')[0]?.getElementsByTagName('xf')||[]];return new Set(xfs.flatMap((el,i)=>{const id=Number(el.getAttribute('numFmtId')),format=(numFmtMap.get(id)||'').replace(/"[^"]*"/g,'').replace(/\\./g,'');return builtin.has(id)||/[dyhms]/i.test(format)?[i]:[];}));}
function sheetRows(doc,strings,dateStyles=new Set(),epoch1904=false){const xmlRows=[...doc.getElementsByTagName('row')];const matrix=[];for(const row of xmlRows){const arr=[];let next=0;for(const cell of row.getElementsByTagName('c')) {const idx=cell.getAttribute('r')?columnIndex(cell.getAttribute('r')):next;next=idx+1;if(idx>300)continue;const type=cell.getAttribute('t');let v=textOfCell(cell);if(type==='s')v=strings[Number(v)]??'';else if(type==='b')v=v==='1';else if(type==='n'||(!type&&cell.getElementsByTagName('v').length)){const number=Number(v);v=Number.isFinite(number)?(dateStyles.has(Number(cell.getAttribute('s')||0))?excelDate(number,epoch1904):number):null;}else if(!v)v=null;arr[idx]=v;}if(arr.some(v=>v!==undefined&&v!==''))matrix.push(arr);if(matrix.length>MAX_ROWS+1)throw new Error('Excel worksheet exceeds 100,000 row limit.');}if(matrix.length<2)return [];const head=matrix.shift().map((v,i)=>String(v??'').trim()||`Column ${i+1}`);const unique=[];head.forEach((h,i)=>{let name=h,n=2;while(unique.includes(name))name=`${h} (${n++})`;unique[i]=name;});return matrix.map(cells=>Object.fromEntries(unique.map((key,i)=>[key,coerce(cells[i]??null)])));}
function parseXml(text,name){const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror'))throw new Error(`Cannot read ${name} inside Excel workbook`);return doc;}
export async function parseExcel(file){if(typeof JSZip==='undefined')throw new Error('Excel importer could not initialise.');const zip=await JSZip.loadAsync(file);const files=Object.values(zip.files);if(files.length>1000||files.reduce((sum,item)=>sum+(item._data?.uncompressedSize||0),0)>120*1024*1024)throw new Error('Workbook exceeds safe expanded-size limits.');const workbook=zip.file('xl/workbook.xml');if(!workbook)throw new Error('Not a supported XLSX workbook.');
 const xml=parseXml(await workbook.async('string'),'workbook');const relationships=zip.file('xl/_rels/workbook.xml.rels');if(!relationships)throw new Error('Workbook relationships are missing.');const relDoc=parseXml(await relationships.async('string'),'relationships');const rels=new Map([...relDoc.getElementsByTagName('Relationship')].map(el=>[el.getAttribute('Id'),el.getAttribute('Target')]));let strings=[];const stylesFile=zip.file('xl/styles.xml'),styleDoc=stylesFile?parseXml(await stylesFile.async('string'),'styles'):null,dateStyles=getDateStyles(styleDoc);const epoch1904=xml.getElementsByTagName('workbookPr')[0]?.getAttribute('date1904')==='1';
 const shared=zip.file('xl/sharedStrings.xml');if(shared){const txt=parseXml(await shared.async('string'),'shared strings');strings=[...txt.getElementsByTagName('si')].map(si=>[...si.getElementsByTagName('t')].map(n=>n.textContent??'').join(''));}
 const sheets=[];for(const sheet of xml.getElementsByTagName('sheet')){const name=sheet.getAttribute('name')||'Sheet';const rid=sheet.getAttribute('r:id')||sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');let target=rels.get(rid);if(!target)continue;target=target.replace(/^\//,'').replace(/^xl\//,'');const path='xl/'+target;const item=zip.file(path);if(!item)continue;const doc=parseXml(await item.async('string'),name);const rows=sheetRows(doc,strings,dateStyles,epoch1904);if(rows.length)sheets.push({name,rows});}if(!sheets.length)throw new Error('No usable worksheets found in this Excel file.');return sheets;}
async function parseLargeFileInWorker(value,name){
 if(typeof Worker!=='function')return null;
 let worker;try{worker=new Worker(new URL('./import-worker.js',import.meta.url),{type:'module'});}catch{return null;}
 return await new Promise((resolve,reject)=>{
  let done=false;const finish=(value,error)=>{if(done)return;done=true;clearTimeout(timeout);worker.terminate();error?reject(error):resolve(value);};
  const timeout=setTimeout(()=>finish(null,new Error('Large-file parser timed out; try splitting the source dataset.')),60000);
  worker.onmessage=({data})=>{if(data?.error)finish(null,new Error(data.error));else finish(data.payload);};
  worker.onerror=()=>finish(null); // Browser worker blocked: retry with the existing main-thread importer.
  worker.postMessage({id:1,name,...(typeof value==='string'?{text:value}:{file:value})});
 });
}
export async function importFile(file){if(file.size>MAX_FILE_BYTES)throw new Error('File is larger than the 25 MB import limit for this release.');const name=file.name.toLowerCase();if(/\.xlsx$/.test(name)){
  if(file.size>=512*1024){const result=await parseLargeFileInWorker(file,name);if(result!==null)return result;}
  return await parseExcel(file);
 }if(/\.xls$/.test(name))throw new Error('Legacy .xls files are not supported. Save as .xlsx or .csv.');if(!/\.(csv|tsv|json)$/.test(name))throw new Error('Choose an XLSX, CSV, TSV or JSON file.');
 const text=await file.text();
 let rows=null;
 if(file.size>=512*1024){try{rows=await parseLargeFileInWorker(text,name);}catch(error){
  // An actual parser error must be reported; never silently import partial data.
  throw error;
 }}
 if(rows===null)rows=name.endsWith('.json')?parseJSON(text):parseDelimited(text,name.endsWith('.tsv')?'\t':',');
 return [{name:'Data',rows}];}
/** Limited, validated arithmetic grammar: literals, [field names], + - * /, parentheses and ROUND/ABS/MIN/MAX. */
function tokenize(src){const tokens=[];const re=/\s*(\[[^\]]+\]|(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?|[a-zA-Z_]+|[()+*/,-])/gy;let at=0;while(at<src.length){re.lastIndex=at;const match=re.exec(src);if(!match)throw new Error(`Unsupported expression near "${src.slice(at,at+15)}"`);tokens.push(match[1]);at=re.lastIndex;}if(tokens.length>150)throw new Error('Expression is too long.');return tokens;}
export function compileExpression(src,fields){const tokens=tokenize(src);let p=0;const peek=()=>tokens[p];const next=()=>tokens[p++];function expr(){let left=term();while(peek()==='+'||peek()==='-'){const op=next(),right=term(),old=left;left=row=>op==='+'?old(row)+right(row):old(row)-right(row);}return left;}
 function term(){let left=unit();while(peek()==='*'||peek()==='/'){const op=next(),right=unit(),old=left;left=row=>op==='*'?old(row)*right(row):right(row)===0?NaN:old(row)/right(row);}return left;}
 function unit(){const t=next();if(t===undefined)throw new Error('Incomplete expression');if(t==='-'||t==='+'){const a=unit();return row=>(t==='-'?-1:1)*a(row);}if(t==='('){const v=expr();if(next()!==')')throw new Error('Expected closing parenthesis');return v;}if(t.startsWith('[')){const key=t.slice(1,-1);if(!fields.includes(key))throw new Error(`Unknown field: ${key}`);return row=>Number(row[key]);}if(/^\d|^\./.test(t)){const n=Number(t);return ()=>n;}if(/^[A-Za-z_]+$/.test(t)){const fn=t.toUpperCase();if(!['ROUND','ABS','MIN','MAX'].includes(fn))throw new Error(`Unsupported function ${t}`);if(next()!=='(')throw new Error('Expected ( after function');const a=expr();const args=[a];while(peek()===','){next();args.push(expr());}if(next()!==')')throw new Error('Expected ) after function arguments');return row=>{const n=args.map(f=>f(row));if(fn==='ROUND')return Number(n[0].toFixed(Math.min(10,Math.max(0,n[1]??0))));if(fn==='ABS')return Math.abs(n[0]);if(fn==='MIN')return Math.min(...n);return Math.max(...n);};}throw new Error(`Unexpected token ${t}`);}
 const fn=expr();if(p!==tokens.length)throw new Error(`Unexpected token ${peek()}`);return fn;}
export function addCalculatedField(rows,name,expression,parameters={}){if(!name.trim())throw new Error('Enter a field name.');const fields=getFields(rows);if(fields.includes(name))throw new Error('That field already exists.');const fn=compileExpression(substituteParameters(expression,parameters),fields);return rows.map(row=>{const value=fn(row);return {...row,[name]:Number.isFinite(value)?value:null};});}
export function aggregate(rows,x,y,aggregation='sum',type='bar'){
 if(type!=='scatter'&&Array.isArray(rows)&&rows.length>2000){let m=aggregateCache.get(rows);if(!m){m=new Map();aggregateCache.set(rows,m);}const key=JSON.stringify([x,y,aggregation]);let hit=m.get(key);if(!hit){hit=aggregateUncached(rows,x,y,aggregation,type);if(m.size>40)m.clear();m.set(key,hit);}return hit.map(o=>({...o}));}
 return aggregateUncached(rows,x,y,aggregation,type);}
function aggregateUncached(rows,x,y,aggregation='sum',type='bar'){const scatter=type==='scatter';const values=[];if(scatter){for(const row of rows){const xv=Number(row[x]),yv=Number(row[y]);if(Number.isFinite(xv)&&Number.isFinite(yv)&&row[x]!=null&&row[y]!=null&&String(row[x]).trim()!==''&&String(row[y]).trim()!=='')values.push({x:xv,y:yv,n:1});}return values;}
 const by=new Map();for(const row of rows){const key=row[x];if(key==null||key==='')continue;const raw=row[y],num=Number(raw);if(aggregation!=='count'&&(!Number.isFinite(num)||raw==null||raw===''))continue;const id=String(key),item=by.get(id)||{x:key,y:0,n:0,min:Infinity,max:-Infinity};item.n++;if(Number.isFinite(num)){item.y+=num;item.min=Math.min(item.min,num);item.max=Math.max(item.max,num);}by.set(id,item);}
 return [...by.values()].map(item=>({...item,y:aggregation==='count'?item.n:aggregation==='average'?item.y/item.n:aggregation==='min'?item.min:aggregation==='max'?item.max:item.y})).slice(0,400);
}
export function refreshImpact(oldRows,newRows,charts){const before=getFields(oldRows),after=getFields(newRows);const removed=before.filter(f=>!after.includes(f)),added=after.filter(f=>!before.includes(f)),affected=charts.filter(c=>chartFieldNames(c).some(field=>removed.includes(field))).map(c=>c.title);return {before:oldRows.length,after:newRows.length,removed,added,affected};}
