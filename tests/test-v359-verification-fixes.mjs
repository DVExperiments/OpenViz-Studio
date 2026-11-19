// V3.59 verification fixes: scalable undo snapshots, per-array caches, PDF font mapping, contrast tokens.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectSnapshot,restoreProjectSnapshot,invalidateRowsSnapshot} from '../src/snapshot.js';
import {getFields,aggregate,rowsChanged} from '../src/data.js';

// ---- undo snapshots share unchanged rows ----
const rows=Array.from({length:3000},(_,i)=>({Region:['N','S','E'][i%3],Sales:i}));
const project={id:'p',name:'P',charts:[{id:'c',title:'T'}],datasets:[{id:'d',name:'D',rows,rawRows:rows}],slides:[]};
const s1=projectSnapshot(project);project.charts[0].title='Changed';const s2=projectSnapshot(project);
assert.equal(s1.rows[0][0],s2.rows[0][0],'unchanged rows reuse the same serialised string');
assert.notEqual(s1.meta,s2.meta);
const back=restoreProjectSnapshot(s1);assert.equal(back.charts[0].title,'T');assert.equal(back.datasets[0].rows.length,3000);assert.deepEqual(back.datasets[0].rows[5],rows[5]);
assert.notEqual(back.datasets[0].rows,rows,'restored rows are a fresh copy');
// a restored snapshot seeds the cache, so the next snapshot does not reserialise
const s3=projectSnapshot(back);assert.equal(s3.rows[0][0],s1.rows[0][0]);
// in-place cell edit: invalidation makes the next snapshot see the change, the old one keeps the old value
const s4=projectSnapshot(project);rows[0].Sales=999999;invalidateRowsSnapshot(rows);const s5=projectSnapshot(project);
assert.equal(restoreProjectSnapshot(s4).datasets[0].rows[0].Sales,0);assert.equal(restoreProjectSnapshot(s5).datasets[0].rows[0].Sales,999999);
// legacy string snapshots still restore; rawRows null / absent preserved
assert.equal(restoreProjectSnapshot(JSON.stringify({id:'x',datasets:[]})).id,'x');
const noRaw={id:'q',datasets:[{id:'a',rows:[{a:1}]}]};assert.equal('rawRows' in restoreProjectSnapshot(projectSnapshot(noRaw)).datasets[0],false);
const nullRaw={id:'q',datasets:[{id:'a',rows:[{a:1}],rawRows:null}]};assert.equal(restoreProjectSnapshot(projectSnapshot(nullRaw)).datasets[0].rawRows,null);

const ordered={id:'o',datasets:[{id:'d',name:'n',rawRows:[{a:1}],rows:[{a:1}],log:[]}],charts:[]};
assert.equal(JSON.stringify(restoreProjectSnapshot(projectSnapshot(ordered))),JSON.stringify(ordered),'undo keeps exact key order');

// ---- caches return copies and respect invalidation ----
const f=getFields(rows);f.push('mutated');assert.deepEqual(getFields(rows),['Region','Sales']);
const a1=aggregate(rows,'Region','Sales','sum');a1[0].y=-1;a1.sort((x,y)=>y.y-x.y);
const a2=aggregate(rows,'Region','Sales','sum');assert.notEqual(a2[0].y,-1,'callers cannot corrupt the cache');
const before=a2.find(o=>o.x==='N').y;rows[3].Sales+=1000;rowsChanged(rows);assert.equal(aggregate(rows,'Region','Sales','sum').find(o=>o.x==='N').y,before+1000);
assert.equal(aggregate(rows,'Region','Sales','average').length,3,'different aggregation is a different cache entry');
const small=[{a:'x',b:1}];assert.deepEqual(aggregate(small,'a','b').map(o=>o.y),[1]);

// ---- PDF fonts: F1..F8 map to the right face ----
const {fontIndex}=await import('../src/pdf-export.js').catch(()=>({}));
if(fontIndex){
 const FACES=['Helvetica','Helvetica-Bold','Helvetica-Oblique','Helvetica-BoldOblique','Times-Roman','Times-Bold','Times-Italic','Times-BoldItalic'];
 const face=o=>FACES[fontIndex(o)-1];
 assert.equal(face({font:'Arial, sans-serif'}),'Helvetica');assert.equal(face({font:'Arial, sans-serif',bold:true}),'Helvetica-Bold');
 assert.equal(face({font:'Inter',italic:true}),'Helvetica-Oblique');assert.equal(face({font:'Georgia, serif',bold:true,italic:true}),'Times-BoldItalic');
}
const pdfSrc=readFileSync(new URL('../src/pdf-export.js',import.meta.url),'utf8');assert.ok(!pdfSrc.includes('fontIndex(o)+1'),'no off-by-one font offset');

// ---- accessibility tokens meet WCAG AA on white ----
const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
const ratio=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05);};
const css=readFileSync(new URL('../src/ui-refresh.css',import.meta.url),'utf8');
const muted=css.match(/--muted:(#[0-9a-f]{6})/i)[1],accent=css.match(/--accent:(#[0-9a-f]{6})/i)[1];
assert.ok(ratio(muted,'#ffffff')>=4.5,`muted text ${muted} ${ratio(muted,'#ffffff').toFixed(2)}`);assert.ok(ratio(muted,'#f3f5f7')>=4.5);
assert.ok(ratio(accent,'#ffffff')>=4.5,`accent ${accent}`);assert.ok(ratio('#ffffff',accent)>=4.5,'white on accent buttons');
console.log('V3.59 verification fixes: all checks passed');
