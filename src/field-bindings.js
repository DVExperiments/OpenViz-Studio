// Shared schema dependencies: switching, renaming and refreshing must agree.
export const FIELD_BINDING_KEYS=['x','y','timeField','timeEntityField','seriesField','bubbleSizeField','labelField','endField','geoLatField','geoLonField','geoToLatField','geoToLonField','lowerField','upperField'];

export const tooltipFieldNames=c=>Array.isArray(c.geoTooltipFields)?c.geoTooltipFields.map(f=>f?.field).filter(f=>typeof f==='string'&&f):[];
export const chartFieldNames=c=>[...new Set([...FIELD_BINDING_KEYS.map(k=>c[k]),...(c.parallelFields||[]),...tooltipFieldNames(c)].filter(Boolean))];
