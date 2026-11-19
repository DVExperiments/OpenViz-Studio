import {validateTooltipFields,tooltipFieldLines} from './map-tooltip-fields.js';
import {escapeText as E} from './chart-quality.js';
import {formatMapLegendValue} from './map-legend-format.js';
export const MAP_TOOLTIP_DEFAULTS={geoTooltipFields:[],geoTooltipMode:'auto',geoTooltipNameLabel:'',geoTooltipValueLabel:'',geoTooltipNumberFormat:'auto',geoTooltipDecimals:2,geoTooltipPrefix:'',geoTooltipSuffix:'',geoTooltipShowValue:true,geoTooltipShowExact:true,geoTooltipShowCount:true,geoTooltipShowAggregation:true,geoTooltipShowPeriod:true,geoTooltipShowCoordinates:false,geoTooltipNoDataText:'No data'};
export const MAP_TOOLTIP_KEYS=Object.keys(MAP_TOOLTIP_DEFAULTS);
export const mapTooltipSettings=c=>Object.fromEntries(MAP_TOOLTIP_KEYS.map(k=>[k,structuredClone(c[k]??MAP_TOOLTIP_DEFAULTS[k])]));
export function validateMapTooltip(c){
 if(c.geoNavigationEnabled!==undefined&&typeof c.geoNavigationEnabled!=='boolean')throw Error('Invalid map navigation setting.');
 if(c.geoExploreEnabled!==undefined&&typeof c.geoExploreEnabled!=='boolean')throw Error('Invalid map exploration setting.');
 validateTooltipFields(c.geoTooltipFields);
 if(c.geoTooltipMode!==undefined&&!['auto','custom'].includes(c.geoTooltipMode))throw Error('Choose Automatic or Custom map tooltips.');
 if(c.geoTooltipNumberFormat!==undefined&&!['auto','decimal','compact','scientific'].includes(c.geoTooltipNumberFormat))throw Error('Choose a supported tooltip number format.');
 if(c.geoTooltipDecimals!==undefined&&(!Number.isInteger(c.geoTooltipDecimals)||c.geoTooltipDecimals<0||c.geoTooltipDecimals>6))throw Error('Tooltip decimal places must be an integer from 0 to 6.');
 for(const [key,max] of [['geoTooltipNameLabel',60],['geoTooltipValueLabel',60],['geoTooltipPrefix',16],['geoTooltipSuffix',16],['geoTooltipNoDataText',80]])if(c[key]!==undefined&&(typeof c[key]!=='string'||c[key].length>max||/[\x00-\x1f\x7f]/.test(c[key])||key==='geoTooltipNoDataText'&&!c[key].trim()))throw Error('Use plain tooltip labels within their length limits; missing-data text cannot be blank.');
 for(const key of MAP_TOOLTIP_KEYS.filter(k=>k.startsWith('geoTooltipShow')))if(c[key]!==undefined&&typeof c[key]!=='boolean')throw Error('Invalid tooltip visibility setting.');return true;
}
export function mapTooltipText(c,ctx,fallback=''){
 if(c.geoTooltipMode!=='custom')return fallback;const s=mapTooltipSettings(c),name=String(ctx.name??'').trim()||'(Unnamed place)',lines=[s.geoTooltipNameLabel?s.geoTooltipNameLabel+': '+name:name],valid=typeof ctx.value==='number'&&Number.isFinite(ctx.value);
 if(!valid)lines.push(s.geoTooltipNoDataText);
 else if(s.geoTooltipShowValue){const f=formatMapLegendValue(ctx.value,{geoLegendNumberFormat:s.geoTooltipNumberFormat,geoLegendDecimals:s.geoTooltipDecimals,geoLegendPrefix:s.geoTooltipPrefix,geoLegendSuffix:s.geoTooltipSuffix});lines.push((s.geoTooltipValueLabel||(ctx.aggregate&&c.aggregation==='count'?'Count of records':c.y||'Value'))+': '+f.text);if(f.approximate&&s.geoTooltipShowExact)lines.push('Exact value: '+f.exact);}
 if(ctx.aggregate&&s.geoTooltipShowAggregation)lines.push('Aggregation: '+({sum:'Sum',average:'Mean',min:'Minimum',max:'Maximum',count:'Count'}[c.aggregation]||'Sum'));
 if(s.geoTooltipShowCount&&Number.isInteger(ctx.count)&&ctx.count>=0)lines.push('Contributing records: '+ctx.count);
 if(s.geoTooltipShowPeriod&&ctx.period!==undefined&&ctx.period!==null&&String(ctx.period)!=='')lines.push('Period: '+String(ctx.period));
 if(s.geoTooltipShowCoordinates&&Array.isArray(ctx.coordinates)&&ctx.coordinates.every(Number.isFinite)){const [lon,lat]=ctx.coordinates;lines.push((ctx.coordinateLabel||'Display position')+' (lat, lon): '+lat.toFixed(3)+', '+lon.toFixed(3));}
 if(s.geoTooltipFields.length)lines.push(...tooltipFieldLines(ctx.sourceRows||[],s.geoTooltipFields,s.geoTooltipShowExact));
 return lines.join('\n');
}
export function mapTooltipAttributes(c,ctx,text){if(c.geoTooltipMode!=='custom')return '';return `data-map-tooltip="" data-map-tooltip-value="${Number.isFinite(ctx.value)?ctx.value:''}" data-map-tooltip-count="${Number.isInteger(ctx.count)?ctx.count:''}" role="img" aria-label="${E(text).replaceAll('\n','&#10;')}"`;}
