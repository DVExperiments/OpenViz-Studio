// Display-only map legend settings. Never transform source values or class breaks.
export const MAP_LEGEND_FORMATS={auto:'Automatic',decimal:'Decimal',compact:'Compact (k, M, B, T)',scientific:'Scientific'};
export function validateMapLegend(c){
 for(const [key,choices] of [['geoLegendAlign',['left','center','right']],['geoLegendLayout',['auto','list']],['geoLegendNumberFormat',Object.keys(MAP_LEGEND_FORMATS)]])if(c[key]!==undefined&&!choices.includes(c[key]))throw Error('Choose a supported legend layout or number format.');
 for(const [key,min,max] of [['geoLegendWidth',25,100],['geoLegendFontSize',9,16],['geoLegendDecimals',0,6]])if(c[key]!==undefined&&(!Number.isInteger(c[key])||c[key]<min||c[key]>max))throw Error('Legend width must be 25–100%, text size 9–16, and decimal places 0–6.');
 for(const key of ['geoLegendPrefix','geoLegendSuffix'])if(c[key]!==undefined&&(typeof c[key]!=='string'||c[key].length>16||/[\x00-\x1f\x7f]/.test(c[key])))throw Error('Legend prefix and suffix must be at most 16 characters without control characters.');return true;
}
export function mapLegendMetrics(c,plotWidth){const font=Number.isFinite(c.geoLegendFontSize)?Math.max(9,Math.min(16,c.geoLegendFontSize)):9,pct=Number.isFinite(c.geoLegendWidth)?Math.max(25,Math.min(100,c.geoLegendWidth)):100,width=Math.min(plotWidth,Math.max(120,plotWidth*pct/100)),scale=font/9,shift=(plotWidth-width)*(c.geoLegendAlign==='right'?1:c.geoLegendAlign==='center'?.5:0);return {width,scale,shift,logicalWidth:width/scale};}
export function formatMapLegendValue(value,c={},precision=null){
 const v=Object.is(value,-0)?0:value,mode=c.geoLegendNumberFormat||'auto',digits=Number.isInteger(c.geoLegendDecimals)?Math.max(0,Math.min(6,c.geoLegendDecimals)):2;let display,represented=v;
 if(mode==='decimal'){display=v.toLocaleString('en-US',{useGrouping:true,minimumFractionDigits:digits,maximumFractionDigits:digits});represented=Number(display.replaceAll(',',''));if(Object.is(represented,-0))display=display.replace(/^-/, '');}
 else if(mode==='scientific'||mode==='compact'&&Math.abs(v)>=1e15){display=v.toExponential(digits);represented=Number(display);}
 else if(mode==='compact'){const factors=[1,1e3,1e6,1e9,1e12],units=['','k','M','B','T'];let i=0;while(i<4&&Math.abs(v)>=factors[i+1])i++;const n=(v/factors[i]).toFixed(digits);represented=Number(n)*factors[i];display=(Object.is(Number(n),-0)?n.replace(/^-/,''):n)+units[i];}
 else if(precision!==null){display=v===0?'0':Math.abs(v)<.001||Math.abs(v)>=1e6?v.toExponential(precision-1):String(Number(v.toPrecision(precision)));represented=Number(display);}
 else display=String(v);
 const prefix=c.geoLegendPrefix||'',suffix=c.geoLegendSuffix||'',approximate=represented!==v;return {text:(approximate?'≈':'')+prefix+display+suffix,exact:prefix+String(v)+suffix,approximate};
}
