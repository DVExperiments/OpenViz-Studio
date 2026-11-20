// Dashboards: cross-filter selection, layout items, guides and the dashboard inspector.
// Extracted from app.js by tools/extract-editor-module.mjs. Shared editor state and helpers come from `ctx`, bound in app.js.
import {ctx} from './context.js';
import {validSelection,matchesCategory,chartCanSelect,markCategory,matchingRows} from '../dashboard-links.js';
import {isRegional} from '../regional-map.js';
import {dashboardFilterCandidates} from '../dashboard-interactive.js';
import {buildChart} from '../charts.js';
import {parameterBarForCharts} from './parameters-ui.js';
function dashboardSelectionField(dash){return dash?.sharedFilterField||'';}
function dashboardSelectionValues(dash,values){const field=dashboardSelectionField(dash);return field?validSelection(ctx.ui.dashboardPicked,values):[];}
export function dashboardClickMark(event){
 if(ctx.ui.page!=='dashboard')return;
 const mark=event.target.closest('[data-dash-category]');if(!mark)return;
 const dash=ctx.project.dashboards[0],field=dashboardSelectionField(dash);
 if(!field||dash.interactionMode==='off')return;
 const value=mark.dataset.dashCategory;
 const current=ctx.ui.dashboardPicked||[];
 if(event.shiftKey||event.ctrlKey||event.metaKey){
  ctx.ui.dashboardPicked=current.some(v=>matchesCategory(v,value))?current.filter(v=>!matchesCategory(v,value)):[...current,value];
 }else ctx.ui.dashboardPicked=current.length===1&&matchesCategory(current[0],value)?[]:[value];
 ctx.ui.dashboardFilterValue=ctx.ui.dashboardPicked.length===1?ctx.ui.dashboardPicked[0]:'all';
 renderDashboard();
}
export function dashboardClearSelection(){ctx.ui.dashboardPicked=[];ctx.ui.dashboardFilterValue='all';renderDashboard();}
function setDashboardInteractionMarkers(dash,selection){
 const field=dashboardSelectionField(dash),active=selection.length>0&&dash.interactionMode!=='off';
 for(const card of document.querySelectorAll('[data-dashboard-card]')){
  const c=ctx.project.charts.find(v=>v.id===card.dataset.dashboardCard),d=ctx.chartDataset(c);
  if(!c||!d)continue;
  const supported=chartCanSelect(c,field);
  card.classList.toggle('dashboard-unmapped',active&&!supported&&dash.interactionMode==='highlight');
  if(supported&&dash.interactionMode!=='off'){
   const markEls=card.querySelectorAll('.dashboard-plot [data-viz-part="point"][data-viz-key]');
   for(const mark of markEls){
    let raw;try{raw=decodeURIComponent(mark.dataset.vizKey);}catch{continue;}
    const value=markCategory(c,field,raw,d.rows);if(value===null)continue;
    mark.dataset.dashCategory=value;
    mark.setAttribute('tabindex','0');mark.setAttribute('role','button');
    mark.setAttribute('aria-label',`Select ${field}: ${value}. Hold Shift to select several.`);
    const selected=selection.some(v=>matchesCategory(v,value,c.type==='geo-choropleth'&&!isRegional(c)));
    mark.classList.toggle('dashboard-linked-selected',active&&selected);
    mark.classList.toggle('dashboard-linked-dim',active&&!selected&&dash.interactionMode==='highlight');
   }
  }
 }
}
export function renderDashboard(){const dash=ctx.project.dashboards[0]||{id:'',name:'Dashboard',chartIds:[]},columns=Number(dash.columns)||0,free=dash.mode==='free';if(free)ctx.ensureDashboardItems(dash);
 const availableCards=dash.chartIds.map(id=>{const chart=ctx.project.charts.find(c=>c.id===id);return chart?{chart,rows:ctx.chartDataset(chart)?.rows||[]}:null;}).filter(Boolean);
 const sharedCandidates=dashboardFilterCandidates(availableCards);
 if(!sharedCandidates.some(v=>v.field===dash.sharedFilterField)){ctx.ui.dashboardFilterValue='all';ctx.ui.dashboardPicked=[];}
 const chosen=sharedCandidates.find(v=>v.field===dash.sharedFilterField),values=chosen?.values||[];
 if(!ctx.ui.dashboardPicked.length&&values.includes(ctx.ui.dashboardFilterValue))ctx.ui.dashboardPicked=[ctx.ui.dashboardFilterValue];
 ctx.ui.dashboardPicked=dashboardSelectionValues(dash,values);
 const selected=ctx.ui.dashboardPicked;
 const interaction=dash.interactionMode||'highlight';
 const modeActive=interaction!=='off'&&!!dash.sharedFilterField;
 const filteredMode=modeActive&&interaction==='filter'&&selected.length;
 const configured=free?dash.items:dash.chartIds.map(id=>({chartId:id}));
 const cards=configured.map(item=>{const c=ctx.project.charts.find(v=>v.id===item.chartId),d=ctx.chartDataset(c);if(!c||!d)return '';
  const filtered=filteredMode?matchingRows(d.rows,dash.sharedFilterField,selected):d.rows;
  const graphic=buildChart(filtered,{...c,showTitle:false,showSubtitle:false,padding:Math.min(c.padding,40)},c.type,{width:720,height:460,...(['multi-line','multi-area','stacked-area','small-multiples'].includes(c.type)&&c.timeEnabled?{lineTimeSourceRows:d.rows}:{}),...(c.type==='stacked-hbar'&&c.timeEnabled?{horizontalStackTimeSourceRows:d.rows}:{}),...(['percent-bar','percent-hbar'].includes(c.type)&&c.timeEnabled?{percentTimeSourceRows:d.rows}:{}),...(['grouped-bar','grouped-hbar'].includes(c.type)&&c.timeEnabled?{groupedTimeSourceRows:d.rows}:{}),...(c.type==='stacked-bar'&&c.timeEnabled?{stackedTimeSourceRows:d.rows}:{}),...(c.type==='heatmap'&&c.timeEnabled?{heatmapTimeSourceRows:d.rows}:{}),...(c.type==='geo-route'&&c.timeEnabled?{routeTimeSourceRows:d.rows}:{})});
  const cardLabel=modeActive&&!chartCanSelect(c,dash.sharedFilterField)?'<span class="dashboard-receiver" title="This chart responds to filters, but its marks do not map directly to the chosen category field">Filter receiver</span>':'';
  if(free)return `<article class="dashboard-card dashboard-free-card ${ctx.ui.dashboardSelectedId===c.id?'selected':''}" data-dashboard-card="${ctx.E(c.id)}" data-dashboard-free-id="${ctx.E(c.id)}" style="left:${item.x}%;top:${item.y}px;width:${item.w}%;height:${item.h}px"><div class="dashboard-card-header dashboard-drag-handle" title="Drag to move this chart"><strong>${ctx.E(c.title)}</strong>${cardLabel}<div class="inline-actions"><button class="subtle-button button-small" data-action="dashboard-edit-chart" data-id="${ctx.E(c.id)}">Edit chart</button><button class="subtle-button button-small" data-action="dashboard-remove" data-id="${ctx.E(c.id)}" aria-label="Remove ${ctx.E(c.title)} from dashboard" title="Remove from dashboard">✕</button></div></div><div class="dashboard-plot dashboard-free-plot">${graphic}</div><div class="dashboard-resize-handle" title="Drag to resize chart" role="presentation"></div></article>`;
  return `<article class="dashboard-card" data-dashboard-card="${ctx.E(c.id)}" title="Right-click for more actions"><div class="dashboard-card-header"><strong>${ctx.E(c.title)}</strong>${cardLabel}<div class="inline-actions"><button class="subtle-button button-small" data-action="dashboard-edit-chart" data-id="${ctx.E(c.id)}">Edit</button><button class="subtle-button button-small" data-action="dashboard-remove" data-id="${ctx.E(c.id)}" aria-label="Remove ${ctx.E(c.title)} from dashboard" title="Remove from dashboard">✕</button></div></div><div class="dashboard-plot">${graphic}</div></article>`;}).join('');
 ctx.$('workspaceContent').innerHTML=`<div class="dashboard-workspace"><div class="workspace-heading"><div><div class="eyebrow">DASHBOARD</div><h1>${ctx.E(dash.name)}</h1><p>${free?'Drag a chart by its title bar to move it. Drag its bottom-right corner to resize it.':'Put several charts on one page. They rearrange themselves to fit the screen.'}</p></div><div class="inline-actions"><label class="field dashboard-column-picker"><span>Arrange charts</span><select data-ui="dash-mode"><option value="grid" ${!free?'selected':''}>Automatically (fits any screen)</option><option value="free" ${free?'selected':''}>By hand (drag and resize)</option></select></label>${free?`<label class="field dashboard-column-picker"><span>Canvas height</span><select data-ui="dash-canvas-height">${[700,900,1200,1600].map(n=>`<option value="${n}" ${n===dash.canvasHeight?'selected':''}>${n} px</option>`).join('')}</select></label>`:`<label class="field dashboard-column-picker"><span>Columns</span><select data-ui="dash-columns"><option value="0" ${!columns?'selected':''}>Auto</option>${[1,2,3].map(n=>`<option value="${n}" ${n===columns?'selected':''}>${n}</option>`).join('')}</select></label>`}<button class="primary" data-action="dashboard-add">＋ Add chart</button></div></div>
 ${parameterBarForCharts(availableCards.map(a=>a.chart))}<div class="dashboard-shared-filters"><label class="field"><span>Connect charts by</span><select data-ui="dashboard-filter-field"><option value="">Not connected</option>${sharedCandidates.map(f=>`<option value="${ctx.E(f.field)}" ${dash.sharedFilterField===f.field?'selected':''}>${ctx.E(f.field)} (${f.values.length} values)</option>`).join('')}</select></label><label class="field"><span>When someone clicks a chart</span><select data-ui="dashboard-interaction-mode" ${!dash.sharedFilterField?'disabled':''}><option value="highlight" ${interaction==='highlight'?'selected':''}>Highlight the same item in every chart</option><option value="filter" ${interaction==='filter'?'selected':''}>Show only that item in every chart</option><option value="off" ${interaction==='off'?'selected':''}>Do nothing</option></select></label>${values.length?`<label class="field"><span>Category</span><select data-ui="dashboard-filter-value"><option value="all" ${!selected.length?'selected':''}>All values</option>${values.map(v=>`<option value="${ctx.E(v)}" ${selected.length===1&&selected[0]===v?'selected':''}>${ctx.E(v)}</option>`).join('')}</select></label>`:''}<button class="secondary-button" data-action="dashboard-clear-selection" ${!selected.length?'disabled':''}>Clear selection</button><button class="secondary-button" data-action="dashboard-html-interactive">Save as web page</button></div>
 ${selected.length?`<div class="dashboard-selection-banner" role="status"><strong>${selected.length} selected:</strong> ${selected.map(v=>`<span class="dashboard-selection-chip">${ctx.E(v)}</span>`).join('')}<span>${interaction==='highlight'?'Other marks are dimmed; axes remain unchanged.':'All linked charts show selected rows; axes may rescale.'}</span></div>`:dash.sharedFilterField&&interaction!=='off'?`<p class="dashboard-selection-tip">Click a category mark in a linked chart to explore. Shift/Ctrl-click for multiple categories. Click the same mark again or clear the selection to reset.</p>`:''}
 ${free?`<div class="dashboard-free-scroll"><div class="dashboard-free-canvas" id="dashboardFreeCanvas" style="height:${dash.canvasHeight}px">${cards||`<div class="workspace-message"><h2>Your dashboard is empty</h2><p>Add a chart to start.</p><button class="primary" data-action="dashboard-add">＋ Add chart</button></div>`}</div></div>`:`<div class="dashboard-grid" data-columns="${columns||'auto'}">${cards||`<div class="workspace-message" style="grid-column:1/-1"><h2>Your dashboard is empty</h2><p>Add the charts you have already made, or make a new one.</p><button class="primary" data-action="dashboard-add">＋ Add chart</button></div>`}</div>`}<p class="dashboard-hint">${free?'Charts stay exactly where you put them; on small screens readers may need to scroll.':'Tip: choose “Connect charts by” so clicking a bar or region in one chart highlights it in the others.'} Clicking never changes your data. ${availableCards.some(v=>v.chart.type==='geo-route'&&v.chart.timeEnabled)?'Timed route cards keep the saved period and full-timeline scales when filtered; no matching connections gives an empty map.':''}</p></div>`;
 setDashboardInteractionMarkers(dash,selected);
}
function dashboardItem(){return ctx.project.dashboards[0]?.items?.find(v=>v.chartId===ctx.ui.dashboardSelectedId);}
export function updateDashboardItem(key,value){const it=dashboardItem();if(!it)return;const n=Number(value);if(!Number.isFinite(n))return;ctx.trackChange();if(key==='x')it.x=Math.min(99,Math.max(-5,n));if(key==='y')it.y=Math.min(1550,Math.max(0,n));if(key==='w')it.w=Math.min(100,Math.max(20,n));if(key==='h')it.h=Math.min(1000,Math.max(180,n));ctx.markDirty();renderDashboard();ctx.renderInspector();}
export function renderDashboardInspector(){const root=ctx.$('inspectorContent'),dash=ctx.project.dashboards[0],free=dash?.mode==='free',it=dashboardItem();if(!free){root.innerHTML=`<div class="inspector-group"><h4>Arranging charts</h4><p class="hint">Charts are arranged automatically to fit the screen. To place them by hand, choose “By hand” under Arrange charts at the top.</p></div>`;return;}
 root.innerHTML=it?`<section class="inspector-group"><h4>Selected chart</h4><p class="hint">${ctx.E(ctx.project.charts.find(c=>c.id===it.chartId)?.title||'Chart')} · Drag from its header, resize from its bottom-right corner, or enter exact values.</p><div class="field-row">${ctx.field('X (%)',`<input type="number" data-dashboard-setting="x" step="0.1" value="${it.x}">`)}${ctx.field('Y (px)',`<input type="number" data-dashboard-setting="y" step="1" value="${it.y}">`)}</div><div class="field-row">${ctx.field('Width (%)',`<input type="number" data-dashboard-setting="w" min="20" max="100" step="0.1" value="${it.w}">`)}${ctx.field('Height (px)',`<input type="number" data-dashboard-setting="h" min="180" max="1000" step="1" value="${it.h}">`)}</div><button class="secondary-button button-small" data-action="dashboard-edit-chart" data-id="${ctx.E(it.chartId)}">Edit source visualisation →</button></section>`:`<div class="inspector-group"><h4>Free canvas</h4><p class="hint">Click a chart to adjust its geometry. Drag its header to move and the corner handle to resize. Hold Alt to temporarily disable alignment snapping.</p></div>`;
}
export function dashboardGuide(axis,at,label){const canvas=ctx.$('dashboardFreeCanvas');if(!canvas)return;const e=document.createElement('div');e.className='dashboard-smart-guide '+axis;e.style[axis==='x'?'left':'top']=axis==='x'?`${at}%`:`${at}px`;if(label){const t=document.createElement('span');t.textContent=label;e.appendChild(t);}canvas.appendChild(e);}
export function clearDashboardGuides(){document.querySelectorAll('#dashboardFreeCanvas .dashboard-smart-guide').forEach(e=>e.remove());}
