import {heatmapTimeMatrix} from './heatmap-time.js';
// Reuse exact per-period cells; stack positive and negative aggregates separately.
export function stackedTimeMatrix(rows,c){const matrix=heatmapTimeMatrix(rows,c);matrix.error=matrix.error.replace('heatmap','stacked-column');return matrix;}
export function stackedTimeDomain(frames,c){
 const categories=[],series=[];let lo=0,hi=0,valid=0;
 for(const f of frames){const m=stackedTimeMatrix(f.rows,c);if(m.error)return {error:m.error};for(const x of m.categories)if(!categories.includes(x))categories.push(x);for(const g of m.series)if(!series.includes(g))series.push(g);const totals=new Map();for(const cell of m.cells){const t=totals.get(cell.x)||{positive:0,negative:0};if(cell.y>=0)t.positive+=cell.y;else t.negative+=cell.y;if(!Number.isFinite(t.positive)||!Number.isFinite(t.negative))return {error:'Stacked-column totals exceed the numerical range. Rescale the units.'};totals.set(cell.x,t);valid++;}for(const t of totals.values()){lo=Math.min(lo,t.negative);hi=Math.max(hi,t.positive);}}
 if(categories.length>32||series.length>10)return {error:'Stacked-column time views support at most 32 categories and 10 series across the timeline. Filter the source first.'};
 if(!valid)return {error:'No compatible segments across the stacked-column timeline.'};if(hi===lo)hi=lo+1;if(!Number.isFinite(hi-lo))return {error:'Stacked-column value range exceeds the numerical range. Rescale the units.'};
 return {domain:{kind:'stacked-bar',categories,series,y:{lo,hi}},error:''};
}
