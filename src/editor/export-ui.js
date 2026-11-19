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
export function openExport(){const c=ctx.chart(),has=!!ctx.project.charts.length||!!ctx.project.stories?.length;
 // Plain-language first: most people want a picture, a PDF or a PowerPoint slide. Web and specialist
 // formats follow, and developer formats sit under "More formats".
 const motion=['bar-race','line-race'].includes(c?.type)?['race-export-open','Video or animated GIF','Record the race as it plays',true]:c?.timeEnabled&&TIME_TYPES.has(c.type)?['snapshot-export-open','Video or animated GIF','Play through each period of the timeline',true]:['motion-open','Video or animated GIF','Animate the chart building up, then save it as a video or GIF',!!c];
 const tile=([act,name,desc,enabled,icon='↧'])=>`<button class="modal-choice" data-action="${act}" ${enabled?'':'disabled'}><span class="choice-icon" aria-hidden="true">${icon}</span><span><strong>${ctx.E(name)}</strong><small>${ctx.E(desc)}</small></span></button>`;
 const group=(title,items)=>`<h3 class="export-group-title">${title}</h3><div class="export-group">${items.map(tile).join('')}</div>`;
 ctx.openModal('Save or share',`<p class="muted" style="margin-bottom:12px">Everything is created on this computer. Nothing is uploaded.</p>${!c?'<p class="notice">Make a chart first to save it as a picture.</p>':''}
 ${group('Save a copy',[['export-png','Picture (PNG)','For Word, email, social media or slides',!!c,'▧'],['export-pdf-dialog','PDF','For printing or sending as a document',true,'▤'],['export-pptx','PowerPoint (.pptx)','A slide you can open and edit in PowerPoint',true,'▣'],[...motion,'▶']])}
 ${group('Put it on a website',[['publish-open','Web page or embed code','Preview it on desktop, tablet and phone, then download a page for your website',has,'↗'],['export-interactive-html','Interactive file (.html)','One file that opens in any browser, with hover details',!!c,'⌘']])}
 ${group('Keep a backup',[['export-project','Back up this project','Save a file with your data and charts. Your work is stored in this browser, so keep a backup.',true,'⛁']])}
 <details class="export-more"><summary>More formats (for designers and developers)</summary><div class="export-group">${[['export-svg','SVG vector graphic','Scales without blurring; edit in Illustrator, Inkscape or Figma',!!c],['export-html','Static web file (.html)','Self-contained chart with no animation or controls',!!c]].map(tile).join('')}<div class="inline-actions" style="margin:10px 0"><button class="secondary-button" data-action="pptx-report">Check how editable the PowerPoint will be →</button></div></div></details>`);}
