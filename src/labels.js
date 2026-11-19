// V3.57 per-family value-label rules: which values get a label, plus simple collision avoidance.
// Rules never change data; they only decide which existing value labels are drawn.
export const LABEL_RULES_SERIES=[['all','Every value'],['last','Last value only'],['first-last','First and last'],['extremes','Highest and lowest'],['max','Highest only']];
export const LABEL_RULES_CATEGORY=[['all','Every value'],['top3','Top 3'],['top5','Top 5'],['bottom3','Bottom 3'],['extremes','Highest and lowest'],['max','Highest only']];
export const LABEL_FAMILIES={line:'series',area:'series',bar:'category',hbar:'category',dot:'category',lollipop:'category',combo:'category','range-plot':'category','arrow-plot':'category','split-bars':'category',pyramid:'category'};
export function labelRulesFor(type){return LABEL_FAMILIES[type]==='series'?LABEL_RULES_SERIES:LABEL_FAMILIES[type]?LABEL_RULES_CATEGORY:null;}
// Returns a predicate (index) => boolean for the configured rule. values[i] is the labelled number.
export function labelPicker(s,values){const rule=s?.labelRule||'all',n=values.length,finite=values.map((v,i)=>[Number(v),i]).filter(([v])=>Number.isFinite(v));
 if(rule==='all'||!n)return ()=>true;
 const sorted=[...finite].sort((a,b)=>b[0]-a[0]||a[1]-b[1]),pick=new Set();
 if(rule==='last'){for(let i=n-1;i>=0;i--)if(Number.isFinite(Number(values[i]))){pick.add(i);break;}}
 else if(rule==='first-last'){const idx=finite.map(d=>d[1]);if(idx.length){pick.add(idx[0]);pick.add(idx[idx.length-1]);}}
 else if(rule==='extremes'){if(sorted.length){pick.add(sorted[0][1]);pick.add(sorted[sorted.length-1][1]);}}
 else if(rule==='max'){if(sorted.length)pick.add(sorted[0][1]);}
 else if(rule==='top3'||rule==='top5'){sorted.slice(0,rule==='top3'?3:5).forEach(d=>pick.add(d[1]));}
 else if(rule==='bottom3'){sorted.slice(-3).forEach(d=>pick.add(d[1]));}
 else return ()=>true;
 return i=>pick.has(i);}
// Greedy collision avoidance: a label is skipped if its box overlaps one already placed.
export function labelPlacer(s){const boxes=[],avoid=s?.labelAvoidOverlap!==false;return (x,y,text,size=12,anchor='middle')=>{if(!avoid)return true;const w=String(text).length*size*.58+4,h=size+2,x0=anchor==='start'?x:anchor==='end'?x-w:x-w/2,b={x0,x1:x0+w,y0:y-h+2,y1:y+2};if(boxes.some(o=>!(b.x1<o.x0||b.x0>o.x1||b.y1<o.y0||b.y0>o.y1)))return false;boxes.push(b);return true;};}
