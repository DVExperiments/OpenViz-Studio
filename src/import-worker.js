// V3.3: local worker for large XLSX and text imports. No network/API usage.
import '../vendor/jszip.min.js';
import {parseExcel,parseDelimited,parseJSON} from './data.js';
self.onmessage=async ({data})=>{
 const {id,name,text,file}=data;
 try{
  const payload=name.endsWith('.xlsx')?await parseExcel(file):name.endsWith('.json')?parseJSON(text):parseDelimited(text,name.endsWith('.tsv')?'\t':',');
  self.postMessage({id,payload});
 }catch(error){self.postMessage({id,error:String(error?.message||error)});}
};
