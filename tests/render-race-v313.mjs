import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {buildChart,DEFAULT_CHART} from '../src/charts.js';
import {raceExample} from '../src/race.js';
const dir=process.argv[2]||'race-presentation-fixtures';mkdirSync(dir,{recursive:true});const ex=raceExample();for(const width of [360,960])for(const raceIndex of [0,2,5])writeFileSync(join(dir,`race-${width}-${raceIndex}.svg`),buildChart(ex.rows,{...DEFAULT_CHART,...ex,type:'bar-race',height:720,raceIndex,raceTimeline:true,raceCaptions:ex.raceCaptions,title:'Changing team performance',subtitle:'Illustrative data · captions and entity history',showSubtitle:true,sourceNote:'OpenViz example'},'bar-race',{width}));console.log('Wrote 6 race presentation fixtures');
