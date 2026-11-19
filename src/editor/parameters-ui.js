// V3.58 what-if parameters: the manager dialog, inspector sliders and dashboard slider bar.
import {ctx} from './context.js';
import {renderDashboard} from './dashboard-ui.js';
import {normalizeParameter,formatParameter,applyParameters,parameterUsage,renameParameterRefs,chartParameters,PARAM_FORMATS} from '../parameters.js';

let draft=null;
export function openParameters(){
 draft=(ctx.project.parameters||[]).map(p=>({...p,originalName:p.name}));
 if(!draft.length)draft.push({id:'',name:'Growth rate',value:5,min:0,max:20,step:0.5,format:'percent',isNew:true});
 renderParameters();
}
function row(p,i){const usage=p.isNew?{calcs:[],charts:[]}:parameterUsage(ctx.project,p),used=[...usage.calcs,...usage.charts.map(t=>`Reference line in ${t}`)];
 return `<fieldset class="param-row" data-param-index="${i}"><legend class="sr-only">Parameter ${i+1}</legend>
  <div class="param-grid">
   <label>Name<input data-param-field="name" value="${ctx.E(p.name)}" maxlength="60"></label>
   <label>Current value<input type="number" data-param-field="value" value="${ctx.E(p.value)}" step="any"></label>
   <label>Minimum<input type="number" data-param-field="min" value="${ctx.E(p.min)}" step="any"></label>
   <label>Maximum<input type="number" data-param-field="max" value="${ctx.E(p.max)}" step="any"></label>
   <label>Step<input type="number" data-param-field="step" value="${ctx.E(p.step)}" step="any" min="0"></label>
   <label>Show as<select data-param-field="format">${PARAM_FORMATS.map(([v,l])=>`<option value="${v}" ${p.format===v?'selected':''}>${l}</option>`).join('')}</select></label>
  </div>
  <p class="hint">${used.length?`Used by ${used.map(ctx.E).join(' · ')}`:`Not used yet. In a calculated field, write <code>{${ctx.E(p.name)}}</code>, for example <code>[Revenue] * (1 + {${ctx.E(p.name)}} / 100)</code>.`}</p>
  <button class="subtle-button button-small danger-text" data-action="param-remove" data-index="${i}">Remove</button></fieldset>`;}
function renderParameters(){
 ctx.openModal('What-if parameters',`<div class="param-manager"><p class="hint">A parameter is a number you can change with a slider to explore scenarios: a growth rate, a target or a price. Use it in calculated fields as <code>{Name}</code>, or as a chart's reference line. Sliders appear in the chart settings, on dashboards and in Live publications.</p>
  ${draft.map(row).join('')}
  <button class="secondary-button button-small" data-action="param-add">Add parameter</button></div>
  <div class="modal-actions" style="margin:15px -22px -22px"><button class="secondary-button" data-action="close-modal">Cancel</button><button class="primary" data-action="param-save">Save parameters</button></div>`);
}
function readDraft(){document.querySelectorAll('[data-param-index]').forEach(fs=>{const p=draft[Number(fs.dataset.paramIndex)];if(!p)return;fs.querySelectorAll('[data-param-field]').forEach(el=>{p[el.dataset.paramField]=el.value;});});}
export function paramAdd(){readDraft();draft.push({id:'',name:`Parameter ${draft.length+1}`,value:0,min:0,max:100,step:1,format:'number',isNew:true});renderParameters();}
export function paramRemove(i){readDraft();const p=draft[i];if(!p)return;const u=p.isNew?{calcs:[],charts:[]}:parameterUsage(ctx.project,p);if(u.calcs.length&&!confirm(`“${p.name}” is used by ${u.calcs.length} calculated field(s). Those fields will show blanks until you edit them. Remove it?`))return;draft.splice(i,1);renderParameters();}
export function paramSave(){readDraft();let next;
 try{next=draft.map(p=>normalizeParameter({...p,id:p.isNew?'':p.id}));}catch(e){ctx.showToast(e.message);return;}
 const names=next.map(p=>p.name.toLowerCase());const dup=names.find((n,i)=>names.indexOf(n)!==i);if(dup){ctx.showToast(`Two parameters are called “${dup}”. Names must be unique.`);return;}
 ctx.trackChange();
 next.forEach((p,i)=>{const old=draft[i].originalName;if(old&&old!==p.name)renameParameterRefs(ctx.project,old,p.name);});
 ctx.project.parameters=next;
 for(const c of ctx.project.charts)if(c.refLineMode==='parameter'&&!next.some(p=>p.id===c.refLineParam)){c.refLineParam=next[0]?.id||'';if(!next.length)c.refLineMode='none';}
 const r=applyParameters(ctx.project);ctx.markDirty();ctx.closeModal();ctx.render();
 ctx.showToast(r.errors.length?`Saved. Check: ${r.errors[0]}`:`Saved ${next.length} parameter${next.length===1?'':'s'}`);
}

// Sliders. `scope` is a chart (inspector) or a list of charts (dashboard).
function slider(p){return `<label class="param-slider"><span class="param-slider-name">${ctx.E(p.name)}</span><span class="param-slider-row"><input type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.value}" data-param-slider="${ctx.E(p.id)}" aria-valuetext="${ctx.E(formatParameter(p))}"><output data-param-out="${ctx.E(p.id)}">${ctx.E(formatParameter(p))}</output></span></label>`;}
export function parameterSlidersForChart(c){const ps=chartParameters(ctx.project,c);
 return `<div class="param-sliders">${ps.length?ps.map(slider).join(''):`<p class="hint">${(ctx.project.parameters||[]).length?'This chart does not use a parameter yet. Use one in a calculated field as {Name}, or choose “What-if parameter” as the reference line.':'Create a parameter to explore scenarios with a slider, for example a growth rate or a target.'}</p>`}<button class="secondary-button button-small" data-action="parameters-open">Manage parameters…</button></div>`;}
export function parameterBarForCharts(charts){const ids=new Set(),ps=[];for(const c of charts)for(const p of chartParameters(ctx.project,c))if(!ids.has(p.id)){ids.add(p.id);ps.push(p);}
 return ps.length?`<div class="param-bar" role="group" aria-label="What-if parameters">${ps.map(slider).join('')}</div>`:'';}

let tracked=false,frame=0;
// The chart preview updates while dragging. Dashboards rebuild their whole layout, so they update when the slider is released.
function rerender(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{applyParameters(ctx.project);if(ctx.ui.page!=='dashboard')ctx.renderChartPreview();});}
document.addEventListener('input',e=>{const el=e.target.closest?.('[data-param-slider]');if(!el||!ctx.project)return;const p=(ctx.project.parameters||[]).find(x=>x.id===el.dataset.paramSlider);if(!p)return;
 if(!tracked){ctx.trackChange();tracked=true;}p.value=Number(el.value);const text=formatParameter(p);document.querySelectorAll(`[data-param-out="${CSS.escape(p.id)}"]`).forEach(o=>o.textContent=text);el.setAttribute('aria-valuetext',text);rerender();});
document.addEventListener('change',e=>{const el=e.target.closest?.('[data-param-slider]');if(!el||!ctx.project)return;tracked=false;applyParameters(ctx.project);ctx.markDirty();if(ctx.ui.page==='dashboard'){const id=el.dataset.paramSlider;renderDashboard();document.querySelector(`[data-param-slider="${CSS.escape(id)}"]`)?.focus();}});
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-insert-param]');if(!b)return;const ta=document.getElementById('calcFormula');if(!ta)return;const text=`{${b.dataset.insertParam}}`,at=ta.selectionStart??ta.value.length;ta.value=ta.value.slice(0,at)+text+ta.value.slice(ta.selectionEnd??at);ta.focus();ta.selectionStart=ta.selectionEnd=at+text.length;});
