import {rowsChanged} from './data.js';
// V3.59 undo history that scales: dataset rows are serialised once per array and the same string is
// shared by every snapshot that has not changed them, so 40 undo steps of a 100,000-row project
// no longer hold 40 copies (or re-serialise 20 MB on every edit). In-place edits call invalidateRowsSnapshot.
const rowsJsonCache=new WeakMap();
function rowsJson(arr){if(!Array.isArray(arr))return null;let j=rowsJsonCache.get(arr);if(j===undefined){j=JSON.stringify(arr);rowsJsonCache.set(arr,j);}return j;}
export function invalidateRowsSnapshot(arr){if(arr){rowsJsonCache.delete(arr);rowsChanged(arr);}}
export function projectSnapshot(project){const datasets=(project.datasets||[]).map(d=>{const out={...d};if('rows' in out)out.rows=0;if('rawRows' in out&&out.rawRows!==undefined)out.rawRows=0;return out;});// placeholders keep the original key order
 return {meta:JSON.stringify({...project,datasets}),rows:(project.datasets||[]).map(d=>[rowsJson(d.rows),d.rawRows===undefined?undefined:rowsJson(d.rawRows)])};}
export function restoreProjectSnapshot(s){if(typeof s==='string')return JSON.parse(s);const p=JSON.parse(s.meta);(p.datasets||[]).forEach((d,i)=>{const [r,raw]=s.rows[i]||[];if(r===null)d.rows=null;else if(r!==undefined){d.rows=JSON.parse(r);rowsJsonCache.set(d.rows,r);}if(raw!==undefined){if(raw===null)d.rawRows=null;else{d.rawRows=JSON.parse(raw);rowsJsonCache.set(d.rawRows,raw);}}});return p;}
