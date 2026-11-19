import assert from 'node:assert/strict';
import {fieldSpecs,mappingIssues,proposeMappings,calculationSummary,usesAggregation,alternativeHint} from '../src/data-contracts.js';
import {CHARTS,DEFAULT_CHART,chartData} from '../src/charts.js';
import {chartExample} from '../src/catalogue.js';
for(const type of Object.keys(CHARTS)){
 const ex=chartExample(type),c={...structuredClone(DEFAULT_CHART),...ex,type},d={id:'new',rows:ex.rows};
 assert.equal(mappingIssues(c,d).length,0,type+': '+mappingIssues(c,d).join('; '));
 const before=JSON.stringify({c,d}),p=proposeMappings(c,d);assert.equal(mappingIssues(p.draft,d).length,0,type+' preserved mapping');assert.equal(JSON.stringify({c,d}),before,type+' no mutation');
 assert(fieldSpecs(c).length>0);assert(calculationSummary(c).length>15);
}
const chart={...DEFAULT_CHART,type:'bubble',x:'Income',y:'Life',bubbleSizeField:'Population',seriesField:'Old grouping',parallelFields:['old']};
const target={id:'new',rows:[{Income:10,Life:'high',Population:100,Value:50,Other:20}]};
const p=proposeMappings(chart,target);assert.equal(p.draft.x,'Income');assert.equal(p.draft.bubbleSizeField,'Population');assert.equal(p.draft.y,'');assert.equal(p.status.y,'Choose a column');assert.equal(p.draft.seriesField,'');assert.deepEqual(p.draft.parallelFields,[]);assert(mappingIssues(p.draft,target).length>0);
const caseMatch=proposeMappings({...DEFAULT_CHART,x:'Region',y:'Revenue'},{id:'case',rows:[{region:'North',revenue:50}]});assert.equal(caseMatch.draft.x,'region');assert.equal(caseMatch.status.x,'Suggested — review');
const numericTypeChange=proposeMappings({...DEFAULT_CHART,x:'Region',y:'Revenue'},{id:'wrong',rows:[{Region:'North',Revenue:'high'}]});assert.equal(numericTypeChange.draft.y,'');
assert(mappingIssues({...chart,x:'Income',y:'Income',bubbleSizeField:'Population'},target).some(s=>s.includes('different')));
assert(mappingIssues({...DEFAULT_CHART,type:'geo-symbol',x:'',geoLatField:'Latitude',geoLonField:''},{rows:[{Latitude:1,Revenue:2}]}).length>0);
assert(mappingIssues({...DEFAULT_CHART,type:'parallel',x:'Name',parallelFields:['A']},{rows:[{Name:'a',A:1}]}).length>0);
assert(calculationSummary({...DEFAULT_CHART,type:'scatter'}).includes('no group aggregation'));
assert(calculationSummary({...DEFAULT_CHART,aggregation:'count'}).startsWith('Count of rows'));
assert.equal(usesAggregation('histogram'),false);
assert(alternativeHint({...DEFAULT_CHART,type:'line',x:'Group'},[{Group:'A'},{Group:'B'}]).includes('horizontal bars'));
const histogram=chartData([{V:null},{V:''},{V:' '},{V:0},{V:2},{V:4}],{...DEFAULT_CHART,type:'histogram',y:'V'});assert.equal(histogram.reduce((sum,p)=>sum+p.y,0),3);
const scatter=chartData([{X:'',Y:1},{X:' ',Y:2},{X:0,Y:0},{X:1,Y:null},{X:2,Y:3}],{...DEFAULT_CHART,type:'scatter',x:'X',y:'Y'});assert.equal(scatter.length,2);assert(scatter.some(p=>p.x===0&&p.y===0));
console.log('PASS '+Object.keys(CHARTS).length+' field contracts, non-mutating proposals, typed preservation, ambiguous/optional/distinct bindings, guidance and blank/zero calculation integrity');
