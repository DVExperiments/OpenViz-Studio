// Export dialogs: PPTX compatibility, PDF export, PPTX report and the export menu.
// Extracted from app.js by tools/extract-editor-module.mjs. Shared editor state and helpers come from `ctx`, bound in app.js.
import {ctx} from './context.js';
import {chartData} from '../charts.js';
import {pptxChartMode} from '../exports.js';
import {exportPrintableFigure,exportPrintableSlides,exportFigurePdf,exportSlidesPdf} from '../pdf-export.js';
import {TIME_TYPES} from '../time-controls.js';
function pptxCompatibility(){
 const details=[],counts={text:0,shape:0,native:0,vector:0,missing:0};
 for(const [i,slideSpec] of ctx.project.slides.entries()){
  for(const o of slideSpec.objects){
   if(o.hidden)continue;
   let mode='',note='';
   if(o.type==='text'){mode='Editable text';counts.text++;note='Recipient needs the chosen font installed for exact appearance.';}
   else if(o.type==='rect'){mode='Editable shape';counts.shape++;note='Shape remains independently editable.';}
   else if(o.type==='chart'){
    const c=ctx.project.charts.find(x=>x.id===o.chartId),ds=c?ctx.chartDataset(c):null;
    if(!c||!ds){mode='Missing reference';counts.missing++;note='This object cannot export until the source chart and dataset are restored.';}
    else{const data=chartData(ds.rows,c,c.type);if(!data.length){mode='No chart data';counts.missing++;note='No compatible data points to export.';}
    else if(pptxChartMode(c,o,data)==='native'){mode='Editable chart';counts.native++;note=o.pptxMode==='editable'?'Editable requested: styling, crop and typography may differ from OpenViz.':'Data is editable; some OpenViz styling is simplified.';}
    else{mode='Vector chart';counts.vector++;note=o.pptxMode==='editable'?'No reliable native chart is available for this type or dataset; using vector artwork.':'Appearance is preserved; chart data cannot be edited natively.';}
    }
   }else{mode='Unsupported object';counts.missing++;note='Object may not appear in PowerPoint.';}
   if(Number(o.x)<0||Number(o.y)<0||Number(o.x)+Number(o.w)>100||Number(o.y)+Number(o.h)>100)note+=' Extends beyond the slide; content may be cropped.';
   if(o.groupId)note+=' Groups are exported as individual objects.';
   details.push({slide:i+1,name:o.text?String(o.text).slice(0,34):o.type==='chart'?(ctx.project.charts.find(c=>c.id===o.chartId)?.title||'Chart'):o.shapeKind||o.type,mode,note});
  }
 }return {counts,details};
}
export function openPdfExport(){const hasSlides=ctx.project.slides.length>0,hasChart=!!ctx.chart();
 ctx.openModal('Export PDF & publication output',`<p class="muted">Download a landscape PDF from your slides or current visualisation. Slide text and simple shapes remain native PDF elements; charts are high-resolution images. For vector charts, use Print-ready HTML and choose Save as PDF in your browser.</p><label class="field"><span>Content</span><select id="pdfTarget"><option value="slides" ${hasSlides?'':'disabled'}>Entire slide deck (${ctx.project.slides.length} slides)</option><option value="chart" ${hasChart?'':'disabled'}>Selected visualisation</option></select></label><div class="inline-actions" style="gap:12px"><label class="field" style="flex:1"><span>Page size</span><select id="pdfPaper"><option value="widescreen">16:9 widescreen</option><option value="a4">A4 landscape</option><option value="letter">Letter landscape</option></select></label><label class="field" style="flex:1"><span>Chart image quality</span><select id="pdfQuality"><option value="2">High (2×)</option><option value="3" selected>Print (3×)</option><option value="4">Maximum (4×)</option></select></label></div><div class="notice" style="margin-top:12px">PDF chart graphics are rasterised for dependable browser export. Text outside charts remains selectable. Use Print-ready HTML for vector chart artwork; browser print settings determine the final PDF.</div><div class="recovery-status" id="pdfExportStatus" role="status">Ready to export</div><div class="modal-actions" style="margin:16px -22px -22px"><button class="secondary-button" data-action="close-modal">Cancel</button><button class="secondary-button" data-action="export-vector-print">Print-ready vector HTML</button><button class="primary" data-action="export-pdf-start">Download PDF</button></div>`,true);
}
export async function performPdfExport(vector=false){const tgt=ctx.$('pdfTarget')?.value||'slides',paper=ctx.$('pdfPaper')?.value||'widescreen',quality=Number(ctx.$('pdfQuality')?.value)||3,status=ctx.$('pdfExportStatus');
 if(status)status.textContent=vector?'Generating print-ready document…':'Rendering pages…';
 try{
  if(vector){if(tgt==='chart'){const c=ctx.chart(),ds=c&&ctx.chartDataset(c);if(!c||!ds)throw Error('Select a chart with data first.');exportPrintableFigure(ctx.project,c,ds.rows);}else exportPrintableSlides(ctx.project,ctx.project.slides,c=>ctx.chartDataset(c),{paper});}
  else if(tgt==='chart'){const c=ctx.chart(),ds=c&&ctx.chartDataset(c);if(!c||!ds)throw Error('Select a chart with a dataset first.');await exportFigurePdf(ctx.project,c,ds.rows,{paper,quality});}
  else await exportSlidesPdf(ctx.project,ctx.project.slides,c=>ctx.chartDataset(c),{paper,quality});
  if(status)status.textContent=vector?'Print-ready HTML downloaded. Open it and use Print > Save as PDF.':'PDF exported successfully.';
  ctx.showToast(vector?'Print-ready document downloaded':'PDF downloaded');
 }catch(error){if(status)status.textContent='Export failed: '+error.message;ctx.showToast(error.message);}
}
export function openPptxReport(){const {counts,details}=pptxCompatibility();
 ctx.openModal('PowerPoint compatibility report',`<p class="muted" style="margin-bottom:13px">This checks the project specification before export. It does not guarantee identical font layout or full Microsoft PowerPoint compatibility. Always inspect the finished .pptx file.</p><div class="pptx-summary"><div><strong>${counts.text+counts.shape}</strong><span>Editable text & shapes</span></div><div><strong>${counts.native}</strong><span>Editable charts</span></div><div><strong>${counts.vector}</strong><span>Vector charts</span></div><div class="${counts.missing?'notice':''}"><strong>${counts.missing}</strong><span>Missing / unsupported</span></div></div><div class="table-shell pptx-report-table"><table><thead><tr><th>Slide</th><th>Object</th><th>Export mode</th><th>Notes</th></tr></thead><tbody>${details.map(d=>`<tr><td>${d.slide}</td><td>${ctx.E(d.name)}</td><td><strong>${ctx.E(d.mode)}</strong></td><td>${ctx.E(d.note)}</td></tr>`).join('')||'<tr><td colspan="4">No slide objects yet.</td></tr>'}</tbody></table></div><div class="modal-actions" style="margin:16px -22px -22px"><button class="secondary-button" data-action="close-modal">Close</button><button class="primary" data-action="export-pptx">Export PowerPoint</button></div>`,true);
}
export function openExport(){const c=ctx.chart();ctx.openModal('Export and publish',`<p class="muted" style="margin-bottom:15px">Download your work without watermarks or a subscription. Nothing is uploaded to an OpenViz server.</p>${['bar-race','line-race'].includes(c?.type)?'<p class="notice">Choose Race GIF/video to render the actual timeline, or Interactive HTML for a playable file. Static formats and dashboard/story scenes use the saved period.</p>':''}${[
 ['publish-open','Publishing Studio / embed code','Preview a responsive website, download a publishing kit and generate iframe code',!!ctx.project.charts.length||!!ctx.project.stories?.length],['export-svg','SVG vector','Editable vector graphic for publishing and design',!!c],['export-png','PNG image','High-resolution raster graphic (2×)',!!c],['export-html','Static HTML embed','Self-contained chart with no animation or controls',!!c],['bar-race','line-race'].includes(c?.type)?['race-export-open','Race GIF / video','Record changing values, positions, captions and entity history',true]:c?.timeEnabled&&TIME_TYPES.has(c.type)?['snapshot-export-open','Snapshot GIF / video','Export observed periods on the full-timeline scales',true]:['motion-open','Animation timeline / GIF / video','Set reveal, hold and exit timings, preview motion, and export GIF or supported video',!!c],['export-interactive-html','Interactive HTML embed','Hover details, replayable animation and category filtering where compatible',!!c],['export-pdf-dialog','PDF (.pdf)','Download widescreen/A4/Letter PDF slides or figures; slide text stays selectable',true],['export-pptx','PowerPoint (.pptx)','Editable text/shapes and basic native charts; point-styled charts use vector fallback',true],['export-project','OpenViz project','Portable archive including your data, slides and designs',true]
 ].map(([act,name,desc,enabled])=>`<button class="modal-choice" data-action="${act}" ${enabled?'':'disabled'}><span class="choice-icon">${act==='export-pptx'?'▣':act==='export-project'?'▤':'↧'}</span><span><strong>${ctx.E(name)}</strong><small>${ctx.E(desc)}</small></span></button>`).join('')}<div class="inline-actions" style="margin:14px 0"><button class="secondary-button" data-action="pptx-report">Review PowerPoint editability →</button></div><p class="hint">Video and GIF export are available in Motion timeline. PDF export is available with a separate vector-print option; importing edited PowerPoint slides remains future work. Interactive HTML is self-contained and requires no external service.</p>`);}
