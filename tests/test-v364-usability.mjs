// V3.64 usability fixes: suggested charts for the user's data, forgiving region-name matching and
// recognising a spreadsheet of one country's regions, plain map names.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CATALOGUE,CATALOGUE_GROUPS,catalogueSearch,setSuggestedTypes,suggestTypesForRows} from '../src/catalogue.js';
import {looseName} from '../src/regional-map.js';
import {MAP_RESOURCES,primeBoundarySet,primeRegionNames,matchRegionCountry,regionMapSettings} from '../src/map-library.js';
import {CHARTS,buildChart,DEFAULT_CHART} from '../src/charts.js';

// suggestions: time → line first; few categories → columns and a donut; many → horizontal bars
assert.deepEqual(suggestTypesForRows([{Month:'Jan',Sales:1},{Month:'Feb',Sales:2}],'Month','Sales').slice(0,2),['line','bar']);
assert.ok(suggestTypesForRows([{Fruit:'Apple',N:3},{Fruit:'Pear',N:4},{Fruit:'Plum',N:1}],'Fruit','N').includes('donut'));
assert.equal(suggestTypesForRows(Array.from({length:30},(_,i)=>({Shop:'S'+i,N:i})),'Shop','N')[0],'hbar');
assert.deepEqual(suggestTypesForRows([],'x','y'),[]);
setSuggestedTypes(['line','bar','nope']);const g=catalogueSearch('','All categories','all','suggested');assert.deepEqual(g.map(c=>c.id),['line','bar'],'suggested keeps order and drops unknown types');
assert.equal(CATALOGUE_GROUPS[0].id,'suggested');setSuggestedTypes([]);

// forgiving names
assert.equal(looseName('Manawatū-Whanganui'),looseName('Manawatu-Wanganui'));
assert.equal(looseName('Gisborne'),looseName('Gisborne District'));
assert.equal(looseName("Hawke’s Bay"),looseName("Hawke's Bay"));
assert.notEqual(looseName('Otago'),looseName('Southland'));

// recognise a country's regions and switch the map to them
primeRegionNames(JSON.parse(readFileSync(new URL('../src/boundaries/region-names.json',import.meta.url),'utf8')));
const rows=[['Northland',120000],['Auckland',2100000],['Waikato',450000],['Bay of Plenty',380000],['Wellington',900000],['Canterbury',760000],['Otago',820000]].map(([Region,V])=>({Region,'Visitors 2025':V}));
const hit=matchRegionCountry(rows.map(r=>r.Region));assert.equal(hit.iso3,'NZL');assert.equal(hit.matched,7);
assert.equal(matchRegionCountry(['Jan','Feb','Mar']),null);assert.equal(matchRegionCountry(['France','Germany','Italy']),null,'country names are not mistaken for regions');
const set=MAP_RESOURCES.find(r=>r.id==='admin1-NZL');primeBoundarySet(set.id,JSON.parse(readFileSync(new URL('../src/boundaries/'+set.file,import.meta.url))));
const cfg={...DEFAULT_CHART,type:'geo-choropleth',x:'Region',y:'Visitors 2025',...regionMapSettings('NZL')};
const svg=buildChart(rows,cfg,'geo-choropleth');const shaded=(svg.match(/aria-label="[^"]*"/g)||[]).filter(a=>/data-region|·/.test(a)&&!/no data/.test(a));assert.ok(rows.every(r=>svg.includes(`aria-label="${r.Region}`)&&!svg.includes(`aria-label="${r.Region} · no data`)),'all seven regions are shaded');

// plain names for map types
assert.equal(CHARTS['geo-choropleth'].name,'Shaded map (choropleth)');assert.equal(CATALOGUE.find(c=>c.id==='geo-choropleth').name,'Shaded map (choropleth)');
console.log('PASS v3.64 suggestions, forgiving region names, plain names');
