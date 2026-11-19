// V3.62: Excel files whose XML uses a namespace prefix (<x:worksheet>, <x:row>), as written by ArcGIS Online
// and other .NET exporters, with absolute relationship targets, "str" cells, a byte-order mark and no
// shared strings. These were rejected with "No usable worksheets found".
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const {JSDOM}=await import(process.env.OPENVIZ_DOM_MODULE||'jsdom');
const dom=new JSDOM('');
// Browsers reject <?xml ...?> after a byte-order mark; jsdom does not, so mimic the browser here.
globalThis.DOMParser=class{parseFromString(text,type){if(/^\uFEFF<\?xml/.test(text))return new dom.window.DOMParser().parseFromString('<parsererror/>','application/xml');return new dom.window.DOMParser().parseFromString(text,type);}};
// The vendored JSZip is a UMD bundle; load it as CommonJS regardless of the package's module type.
{const module={exports:{}};new Function('module','exports',readFileSync(new URL('../vendor/jszip.min.js',import.meta.url),'utf8'))(module,module.exports);globalThis.JSZip=module.exports;}assert.ok(globalThis.JSZip?.loadAsync,'JSZip loaded');
const {parseExcel}=await import('../src/data.js');
const NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main',R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
async function workbook(prefixed){const zip=new JSZip(),p=prefixed?'x:':'',decl=prefixed?` xmlns:x="${NS}"`:` xmlns="${NS}"`,bom='﻿';
 const cell=(ref,t,v)=>`<${p}c r="${ref}" t="${t}"><${p}v>${v}</${p}v></${p}c>`;
 zip.file('[Content_Types].xml','<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>');
 zip.file('xl/workbook.xml',`${bom}<?xml version="1.0" encoding="utf-8"?><${p}workbook${decl}><${p}sheets><${p}sheet name="Operations Districts_0" sheetId="1" r:id="Rabc" xmlns:r="${R}" /></${p}sheets></${p}workbook>`);
 zip.file('xl/_rels/workbook.xml.rels',`${bom}<?xml version="1.0" encoding="utf-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Type="${R}/worksheet" Target="/xl/worksheets/sheet1.xml" Id="Rabc" /><Relationship Type="${R}/styles" Target="/xl/styles.xml" Id="Rsty" /></Relationships>`);
 zip.file('xl/styles.xml',`${bom}<?xml version="1.0" encoding="utf-8"?><${p}styleSheet${decl}><${p}cellXfs count="1"><${p}xf numFmtId="0"/></${p}cellXfs></${p}styleSheet>`);
 zip.file('xl/worksheets/sheet1.xml',`${bom}<?xml version="1.0" encoding="utf-8"?><${p}worksheet${decl}><${p}sheetData><${p}row r="1">${cell('A1','str','OBJECTID')}${cell('B1','str','DistrictName')}${cell('C1','str','Shape__Area')}</${p}row><${p}row r="2">${cell('A2','n','184')}${cell('B2','str','Central Otago')}${cell('C2','n','14309005479.77246')}</${p}row><${p}row r="3">${cell('A3','n','185')}${cell('B3','str','Aoraki Mt Cook')}${cell('C3','n','547546866.5488281')}</${p}row></${p}sheetData></${p}worksheet>`);
 return zip.generateAsync({type:'uint8array'});}
for(const prefixed of [true,false]){const sheets=await parseExcel(await workbook(prefixed));
 assert.equal(sheets.length,1);assert.equal(sheets[0].name,'Operations Districts_0');
 assert.deepEqual(Object.keys(sheets[0].rows[0]),['OBJECTID','DistrictName','Shape__Area']);
 assert.equal(sheets[0].rows.length,2);assert.equal(sheets[0].rows[0].DistrictName,'Central Otago');assert.equal(sheets[0].rows[1].OBJECTID,185);assert.ok(Math.abs(sheets[0].rows[0].Shape__Area-14309005479.77246)<1e-3);}
console.log('PASS v3.62 Excel files with prefixed XML');
