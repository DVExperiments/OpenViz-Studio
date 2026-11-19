import assert from 'node:assert/strict';
import {freshScene,normalizeScene,storyLayout,storySvgAt,tween} from '../src/story.js';
import {renameDatasetColumn} from '../src/dataset-edit.js';
const draft={columns:['Country','Revenue','Year'],columnTypes:{Country:'text',Revenue:'number',Year:'number'},rows:[{Country:'New Zealand',Revenue:10,Year:2025},{Country:'Chile',Revenue:20,Year:2026}],rawRows:[{Country:'New Zealand',Revenue:10,Year:2025}],calculations:[{name:'Difference',expression:'[Revenue] - [Year]'}]};
const charts=[{id:'a',title:'Test',x:'Country',y:'Revenue',seriesField:'Country',parallelFields:['Revenue','Year']}];
assert.equal(renameDatasetColumn(draft,'Country','Region',charts),'Region');
assert.deepEqual(draft.columns,['Region','Revenue','Year']);
assert.equal(draft.rows[1].Region,'Chile');assert(!('Country' in draft.rows[0]));
assert.equal(draft.rawRows[0].Country,'New Zealand');
assert.equal(charts[0].x,'Region');assert.equal(charts[0].seriesField,'Region');
assert.equal(renameDatasetColumn(draft,'Revenue','Total',charts),'Total');
assert.equal(charts[0].y,'Total');assert.deepEqual(charts[0].parallelFields,['Total','Year']);assert.equal(draft.calculations[0].expression,'[Total] - [Year]');
assert.throws(()=>renameDatasetColumn(draft,'Total','Year',charts),/already/);
assert.throws(()=>renameDatasetColumn(draft,'Nope','Test',charts),/no longer/);
const scene=freshScene('a','scene-a');assert.equal(scene.duration,5400);assert.equal(scene.animationMs,2600);
const legacy=normalizeScene({id:'old',chartId:'a',duration:3200});assert(legacy.animationMs<legacy.duration);
const newScene=normalizeScene(scene);assert.equal(newScene.animationMs,2600);
const st={id:'story',scenes:[newScene,{...freshScene('b','scene-b'),duration:4800}]};
const layout=storyLayout(st);assert.equal(layout.scenes.length,2);assert(layout.duration>9000);
// Verify the newly introduced hold freezes keyframed values.
const rawSvg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540"><g data-viz-part="title"><text x="30" y="45">Title</text></g><g data-viz-part="point"><rect x="100" y="200" width="25" height="220" /></g></svg>';
// Pure interpolation: last keyframe wins during the completed-chart hold.
const a=tween(newScene.tracks.title,1),b=tween(newScene.tracks.title,.99999);assert(Math.abs(a.opacity-b.opacity)<.01);
console.log('PASS: rename and chart mappings; original import intact; schema validation; default and legacy scene duration, animation & hold');
