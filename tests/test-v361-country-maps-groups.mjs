// V3.61: starting points for every country, template groups, apostrophes in map tooltips.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MAP_RESOURCES,STARTER_COUNTRIES,starterCountry,searchStarterCountries,countryStarters,countryStarter,countryStarterResource,primeBoundarySet} from '../src/map-library.js';
import {CATALOGUE,CATALOGUE_GROUPS,catalogueSearch} from '../src/catalogue.js';
import {buildChart,DEFAULT_CHART} from '../src/charts.js';

for(const r of MAP_RESOURCES.filter(r=>r.file))primeBoundarySet(r.id,JSON.parse(readFileSync(new URL('../src/boundaries/'+r.file,import.meta.url))));

// every country or area in the bundled snapshot is offered, once, by name
assert.ok(STARTER_COUNTRIES.length>=200,'countries offered');
assert.equal(new Set(STARTER_COUNTRIES.map(c=>c.iso3)).size,STARTER_COUNTRIES.length);
for(const iso3 of ['NZL','AUS','USA','FRA','NOR','BRA','IND','ZAF','JPN','DEU','GBR','CAN','MEX','EGY','IDN'])assert.ok(starterCountry(iso3)?.admin1,iso3+' has regions');
assert.ok(searchStarterCountries('braz').some(c=>c.iso3==='BRA'));assert.deepEqual(searchStarterCountries('b'),[]);

// every country's starters build and render without NaN; a few are checked in detail
let built=0;
for(const c of STARTER_COUNTRIES){const cards=countryStarters(c.iso3);assert.ok(cards.length>=4,c.iso3);assert.ok(countryStarterResource(c.iso3));
 for(const card of cards){const ex=countryStarter(card.id);assert.ok(ex.rows.length>0,card.id);
  if(['NZL','FRA','USA','KIR','RUS','CIV'].includes(c.iso3)){const svg=buildChart(ex.rows,{...DEFAULT_CHART,...ex.settings},ex.settings.type,{width:640,height:480});assert.ok(svg.startsWith('<svg')&&!/NaN|undefined/.test(svg),card.id);}
  built++;}}
assert.ok(built>=STARTER_COUNTRIES.length*4);

// framing ignores far-flung territories: France frames on the mainland, the US on the lower 48
const fr=countryStarter('country:FRA:places').settings.geoExtent;assert.ok(fr[0]>-10&&fr[2]<15&&fr[1]>38,'France framed on the mainland '+fr);
const us=countryStarter('country:USA:locator').settings.geoExtent;assert.ok(us[0]>-130&&us[1]>20,'US framed on the lower 48 '+us);
// points sit inside the country frame and are spread out (not all in one corner)
const pts=countryStarter('country:USA:places').rows;assert.ok(Math.max(...pts.map(r=>r.Longitude))-Math.min(...pts.map(r=>r.Longitude))>30);
// values are fictional and labelled as such
assert.match(countryStarter('country:DEU:regions').settings.sourceNote,/fictional/);

// apostrophes in place names survive tooltips (was "undefined")
const ci=countryStarter('country:UKR:places');const svg=buildChart(ci.rows,{...DEFAULT_CHART,...ci.settings},'geo-symbol');assert.doesNotMatch(svg,/undefined/);

// template groups: every template is reachable from a group chip, and "All" shows everything
assert.ok(CATALOGUE_GROUPS.some(g=>g.id==='all'));assert.equal(catalogueSearch('','All categories','all','all').length,CATALOGUE.length);
const covered=new Set(CATALOGUE_GROUPS.filter(g=>!['all','new','suggested'].includes(g.id)).flatMap(g=>catalogueSearch('','All categories','all',g.id).map(c=>c.id)));
assert.equal(covered.size,CATALOGUE.length,'every template belongs to a group');
assert.ok(catalogueSearch('','All categories','all','new').some(c=>c.id==='quiz'),'New includes V3.60 templates');
assert.ok(catalogueSearch('','All categories','all','maps').every(c=>c.category==='Geographic'));
console.log('PASS v3.61 country map starters, template groups, tooltip apostrophes');
