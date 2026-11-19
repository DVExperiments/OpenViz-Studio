/** OpenViz V3.2: local, offline PDF creation.
 * Text and slide shapes are native PDF operators; complex SVG charts are rasterized
 * at user-selected high resolution. Print-ready HTML provides a vector chart path.
 * No network requests or third-party runtime services are used.
 */
import {buildChart} from './charts.js';
import {slideChartGraphic,slug,download} from './exports.js';
import {slideLogoPlacement} from './brand.js';

const te=new TextEncoder();
const ascii=s=>te.encode(String(s));
const bytesConcat=parts=>{let n=0;for(const b of parts)n+=b.length;const out=new Uint8Array(n);let i=0;for(const b of parts){out.set(b,i);i+=b.length;}return out;};
const limit=(v,min,max,fallback=min)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
const pdfNum=v=>Number(v).toFixed(3).replace(/0+$/,'').replace(/\.$/,'')||'0';
const safeName=v=>String(v||'OpenViz Studio').replace(/[\r\n<>\\]/g,' ').slice(0,180);
function pdfText(s){ // Standard 14 PDF fonts use WinAnsi: unsupported scripts use a visible substitution.
 return String(s??'').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/[\u2022]/g,'*').replace(/[^\x20-\x7e\xA0-\xFF]/g,'?');
}
function lit(s){return '<'+Array.from(pdfText(s)).map(ch=>ch.charCodeAt(0).toString(16).padStart(2,'0')).join('')+'>';}
function color(s,f='#1c2c3e'){const x=/^#[0-9a-f]{6}$/i.test(s||'')?s:f;return [1,3,5].map(i=>parseInt(x.slice(i,i+2),16)/255).map(pdfNum).join(' ');}
function pdfPathRoundRect(x,y,w,h,r){r=limit(r,0,Math.min(w,h)/2,0);if(!r)return `${pdfNum(x)} ${pdfNum(y)} ${pdfNum(w)} ${pdfNum(h)} re\n`;
 const k=.55228475,a=pdfNum;return `${a(x+r)} ${a(y)} m ${a(x+w-r)} ${a(y)} l ${a(x+w-r+r*k)} ${a(y)} ${a(x+w)} ${a(y+r-r*k)} ${a(x+w)} ${a(y+r)} c ${a(x+w)} ${a(y+h-r)} l ${a(x+w)} ${a(y+h-r+r*k)} ${a(x+w-r+r*k)} ${a(y+h)} ${a(x+w-r)} ${a(y+h)} c ${a(x+r)} ${a(y+h)} l ${a(x+r-r*k)} ${a(y+h)} ${a(x)} ${a(y+h-r+r*k)} ${a(x)} ${a(y+h-r)} c ${a(x)} ${a(y+r)} l ${a(x)} ${a(y+r-r*k)} ${a(x+r-r*k)} ${a(y)} ${a(x+r)} ${a(y)} c\n`;
}
function ellipse(x,y,w,h){const k=.55228475,cx=x+w/2,cy=y+h/2,rx=w/2,ry=h/2,a=pdfNum;return `${a(cx+rx)} ${a(cy)} m ${a(cx+rx)} ${a(cy+ry*k)} ${a(cx+rx*k)} ${a(cy+ry)} ${a(cx)} ${a(cy+ry)} c ${a(cx-rx*k)} ${a(cy+ry)} ${a(cx-rx)} ${a(cy+ry*k)} ${a(cx-rx)} ${a(cy)} c ${a(cx-rx)} ${a(cy-ry*k)} ${a(cx-rx*k)} ${a(cy-ry)} ${a(cx)} ${a(cy-ry)} c ${a(cx+rx*k)} ${a(cy-ry)} ${a(cx+rx)} ${a(cy-ry*k)} ${a(cx+rx)} ${a(cy)} c\n`;}
export function fontIndex(o){const isSerif=/serif|georgia|times/i.test(o.font||'')&&!/sans/i.test(o.font||'');const bold=!!o.bold,italic=!!o.italic;return (isSerif?5:1)+(bold?1:0)+(italic?2:0);}
function linesWithin(text,maxWidth,size,font='Arial'){const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=`${size}px ${font}`;const output=[];for(const paragraph of String(text||'').split(/\r?\n/)){let current='';for(const word of paragraph.split(/\s+/)){const candidate=current?current+' '+word:word;if(current&&ctx.measureText(candidate).width>maxWidth){output.push(current);current=word;}else current=candidate;}output.push(current);}return output;}
async function chartJpeg(svg,w,h,scale,bg){const isUri=/^data:image\//.test(svg),url=isUri?svg:URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));try{const img=new Image();await new Promise((ok,fail)=>{img.onload=ok;img.onerror=()=>fail(new Error('Could not render chart for PDF.'));img.src=url;});const cw=Math.max(64,Math.min(5500,Math.round(w*scale))),ch=Math.max(64,Math.min(5500,Math.round(h*scale)));if(cw*ch>22e6)throw new Error('PDF chart image is too large for this browser; reduce quality.');const canvas=document.createElement('canvas');canvas.width=cw;canvas.height=ch;const ctx=canvas.getContext('2d');ctx.fillStyle=/^#[\da-f]{6}$/i.test(bg||'')?bg:'#ffffff';ctx.fillRect(0,0,cw,ch);ctx.drawImage(img,0,0,cw,ch);const jpg=await new Promise((ok,fail)=>canvas.toBlob(b=>b?ok(b):fail(new Error('PDF rasterisation failed')),'image/jpeg',.94));return {bytes:new Uint8Array(await jpg.arrayBuffer()),w:cw,h:ch};}finally{URL.revokeObjectURL(url);}}
class PDFFile{
 constructor(title){this.parts=[ascii('%PDF-1.4\n%OpenViz Studio\n')];this.objects=[];this.title=safeName(title);}
 reserve(){this.objects.push(null);return this.objects.length;}
 put(n,data){this.objects[n-1]=data;}
 add(data){const n=this.reserve();this.put(n,data);return n;}
 stream(dictionary,content){const b=typeof content==='string'?ascii(content):content;return bytesConcat([ascii(`<< ${dictionary} /Length ${b.length} >>\nstream\n`),b,ascii('\nendstream')]);}
 output(){const result=[...this.parts],offsets=[0];let count=result.reduce((a,b)=>a+b.length,0);for(const [i,value] of this.objects.entries()){if(!value)throw Error('Missing PDF object');offsets.push(count);const header=ascii(`${i+1} 0 obj\n`),body=typeof value==='string'?ascii(value):value,tail=ascii('\nendobj\n');result.push(header,body,tail);count+=header.length+body.length+tail.length;}const xref=count;result.push(ascii(`xref\n0 ${this.objects.length+1}\n0000000000 65535 f \n`));for(const pos of offsets.slice(1))result.push(ascii(String(pos).padStart(10,'0')+' 00000 n \n'));result.push(ascii(`trailer\n<< /Size ${this.objects.length+1} /Root 1 0 R /Info 2 0 R >>\nstartxref\n${xref}\n%%EOF\n`));return new Blob([bytesConcat(result)],{type:'application/pdf'});}
}
const FACES=['Helvetica','Helvetica-Bold','Helvetica-Oblique','Helvetica-BoldOblique','Times-Roman','Times-Bold','Times-Italic','Times-BoldItalic'];
function paperSize(v){return v==='a4'?{w:841.89,h:595.28,label:'A4 landscape'}:v==='letter'?{w:792,h:612,label:'Letter landscape'}:{w:960,h:540,label:'16:9 widescreen'};}
function placeWork(paper){const k=Math.min(paper.w/960,paper.h/540);return {left:(paper.w-960*k)/2,bottom:(paper.h-540*k)/2,k};}
async function makePages(project,slides,datasetForChart,{paper='widescreen',quality=2.5,selectedChart=null}={}){
 const page=paperSize(paper),p=new PDFFile(project.name||selectedChart?.chart?.title||'OpenViz'),catalog=p.reserve(),info=p.reserve(),pagesRoot=p.reserve();
 const fonts=FACES.map(name=>p.add(`<< /Type /Font /Subtype /Type1 /BaseFont /${name} /Encoding /WinAnsiEncoding >>`));const pageRefs=[];
 const feed=selectedChart?[{objects:[{type:'chart',chartId:selectedChart.chart.id,x:4,y:6,w:92,h:88,cropToContent:false,showChartTitle:true,showChartSubtitle:true,showChartBackground:true}],background:'#ffffff'}]:slides;
 for(const slideSpec of feed){const frame=placeWork(page),content=[],images=[],graphicStates=[];const tx=x=>frame.left+x*frame.k,ty=y=>frame.bottom+y*frame.k;
  const bg=/^#[0-9a-f]{6}$/i.test(slideSpec.background||'')?slideSpec.background:'#ffffff';content.push('q\n'+color(bg)+' rg\n0 0 '+pdfNum(page.w)+' '+pdfNum(page.h)+' re f\nQ\n');
  for(const o of slideSpec.objects||[]){if(o.hidden)continue;const px=tx(limit(o.x,-400,400)/100*960),w=limit(o.w,0.1,400,1)/100*960*frame.k,h=limit(o.h,0.1,400,1)/100*540*frame.k,top=ty((100-limit(o.y,-400,400))/100*540),py=top-h;
   if(o.type==='rect'){
    const stroke=limit(o.borderWidth||0,0,50,0)*.75*frame.k,opacity=limit(o.opacity??100,0,100,100)/100;
    // PDF gstate lets native shapes retain the configured fill/stroke opacity.
    const shape=o.shapeKind==='ellipse'?ellipse(px,py,w,h):pdfPathRoundRect(px,py,w,h,o.shapeKind==='roundRect'?limit(o.radius||16,0,300,16)*frame.k:0);
    const fill=o.fillEnabled!==false,gsName='GS'+(graphicStates.length+1);
    const gsId=p.add(`<< /Type /ExtGState /ca ${pdfNum(opacity)} /CA ${pdfNum(opacity)} >>`);graphicStates.push({name:gsName,id:gsId});
    content.push(`q\n/${gsName} gs\n${color(o.color||'#e4f2f0')} rg\n${color(o.strokeColor||o.color||'#e4f2f0')} RG\n${pdfNum(stroke)} w\n${shape}${fill&&stroke?'B':fill?'f':stroke?'S':'n'}\nQ\n`);continue;
   }
   if(o.type==='text'){
    const fs=limit(o.fontSize||24,5,120,24)*frame.k,lh=limit(o.lineHeight||1.16,.8,3,1.16)*fs,lines=linesWithin(o.text||'',Math.max(1,w),fs,o.font).slice(0,Math.max(1,Math.floor(h/lh)+1)),fid=fontIndex(o);
    const align=o.align||'left',valign=o.valign||'top',textHeight=lines.length*lh,start=valign==='bottom'?py+textHeight:valign==='middle'?py+(h+textHeight)/2:top-fs*.8;
    content.push(`q\n${pdfNum(px)} ${pdfNum(py)} ${pdfNum(w)} ${pdfNum(h)} re W n\n${color(o.color||'#1c2c3e')} rg\n`);
    for(let i=0;i<lines.length;i++){
     const line=pdfText(lines[i]),ctx=document.createElement('canvas').getContext('2d');
     ctx.font=`${o.italic?'italic ':''}${o.bold?'bold ':''}${fs}px ${o.font||'Arial'}`;
     const spacing=limit(o.letterSpacing||0,-1,8,0)*frame.k,rough=ctx.measureText(line).width+Math.max(0,line.length-1)*spacing;
     const x=align==='center'?px+(w-rough)/2:align==='right'?px+w-rough:px,y=start-i*lh;
     content.push(`BT /F${fid} ${pdfNum(fs)} Tf ${pdfNum(spacing)} Tc 1 0 0 1 ${pdfNum(x)} ${pdfNum(y)} Tm ${lit(line)} Tj ET\n`);
     if(o.underline)content.push(`${pdfNum(Math.max(.4,fs*.045))} w ${pdfNum(x)} ${pdfNum(y-fs*.12)} m ${pdfNum(x+rough)} ${pdfNum(y-fs*.12)} l S\n`);
    }
    content.push('Q\n');continue;
   }
   if(o.type==='chart'){
    const c=selectedChart?.chart?.id===o.chartId?selectedChart.chart:project.charts.find(v=>v.id===o.chartId);if(!c)continue;const ds=selectedChart?.chart?.id===o.chartId?{rows:selectedChart.rows}:datasetForChart(c);if(!ds?.rows?.length)continue;
    const svg=slideChartGraphic(ds.rows,c,o).svg;
    const jpeg=await chartJpeg(svg,Math.max(200,w/frame.k),Math.max(120,h/frame.k),limit(quality,1,4,2.5),o.showChartBackground?(c.background||'#ffffff'):bg);
    const name='Im'+(images.length+1),id=p.add(p.stream(`/Type /XObject /Subtype /Image /Width ${jpeg.w} /Height ${jpeg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`,jpeg.bytes));images.push({id,name});
    content.push(`q\n${pdfNum(px)} ${pdfNum(py)} ${pdfNum(w)} ${pdfNum(h)} re W n\n${pdfNum(w)} 0 0 ${pdfNum(h)} ${pdfNum(px)} ${pdfNum(py)} cm /${name} Do\nQ\n`);
   }
  }
  const L=selectedChart?null:slideLogoPlacement(project,slideSpec);
  if(L){const lw=L.w/100*960*frame.k,lh=L.h/100*540*frame.k,lx=tx(L.x/100*960),ly=ty((100-L.y)/100*540)-lh;
   // JPEG has no transparency, so the logo is composited on the slide background.
   const jpeg=await chartJpeg(L.dataUri,Math.max(60,lw/frame.k),Math.max(20,lh/frame.k),3,bg);const name='Im'+(images.length+1),id=p.add(p.stream(`/Type /XObject /Subtype /Image /Width ${jpeg.w} /Height ${jpeg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`,jpeg.bytes));images.push({id,name});
   content.push(`q\n${pdfNum(lw)} 0 0 ${pdfNum(lh)} ${pdfNum(lx)} ${pdfNum(ly)} cm /${name} Do\nQ\n`);}
  const cs=p.add(p.stream('',content.join(''))),resources=`<< /Font << ${fonts.map((id,i)=>`/F${i+1} ${id} 0 R`).join(' ')} >> /XObject << ${images.map(i=>`/${i.name} ${i.id} 0 R`).join(' ')} >> >>`;
  pageRefs.push(p.add(`<< /Type /Page /Parent ${pagesRoot} 0 R /MediaBox [0 0 ${pdfNum(page.w)} ${pdfNum(page.h)}] /Resources ${resources} /Contents ${cs} 0 R >>`));
 }
 p.put(catalog,`<< /Type /Catalog /Pages ${pagesRoot} 0 R >>`);p.put(info,`<< /Title ${lit(p.title)} /Creator (OpenViz Studio V3.3) /Producer (OpenViz Studio browser PDF exporter) >>`);p.put(pagesRoot,`<< /Type /Pages /Count ${pageRefs.length} /Kids [${pageRefs.map(id=>id+' 0 R').join(' ')}] >>`);return p.output();
}
export async function exportSlidesPdf(project,slides,datasetForChart,options={}){const blob=await makePages(project,slides,datasetForChart,options);download(`${slug(project.name)}-slides.pdf`,blob);return blob;}
export async function exportFigurePdf(project,chart,rows,options={}){const blob=await makePages(project,[],()=>null,{...options,selectedChart:{chart,rows}});download(`${slug(chart.title||'figure')}.pdf`,blob);return blob;}
/** SVG, browser-native text and shapes, and page CSS make a vector-oriented print path.
 * The browser's Save as PDF dialog is required, because browsers cannot silently print.
 */
const safeHex=v=>/^#[0-9a-f]{6}$/i.test(v||'')?v:'#ffffff';
export function printableSlidesHtml(project,slides,datasetForChart,{paper='widescreen'}={}){const page=paperSize(paper),sw=Math.min(page.w,page.h*16/9),sh=sw*9/16,scale=sw/960;const all=(slides||[]).map(s=>`<section class="sheet" style="background:${/^#[0-9a-f]{6}$/i.test(s.background||'')?s.background:'#fff'}"><div class="canvas">${(s.objects||[]).filter(o=>!o.hidden).map(o=>{const common=`left:${Number(o.x)||0}%;top:${Number(o.y)||0}%;width:${Number(o.w)||1}%;height:${Number(o.h)||1}%;`;if(o.type==='chart'){const c=project.charts.find(v=>v.id===o.chartId),ds=c&&datasetForChart(c);return `<div class="obj" style="${common}">${c&&ds?slideChartGraphic(ds.rows,c,o).svg:''}</div>`;}if(o.type==='text')return `<div class="obj text" style="${common}font-family:${String(o.font||'Arial').replace(/[<>";]/g,'')};font-size:${((Number(o.fontSize)||24)*scale).toFixed(2)}pt;font-weight:${o.bold?700:400};font-style:${o.italic?'italic':'normal'};text-align:${o.align||'left'};color:${safeHex(o.color||'#1c2c3e')};line-height:${limit(o.lineHeight||1.16,.8,3,1.16)}">${String(o.text||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`;return `<div class="obj" style="${common}background:${safeHex(o.color||'#e4f2f0')};border:${limit(o.borderWidth||0,0,40,0)}px solid ${safeHex(o.strokeColor||'#ffffff')};border-radius:${o.shapeKind==='ellipse'?'50%':o.shapeKind==='roundRect'?'14px':'0'};opacity:${(Number(o.opacity)||100)/100}"></div>`;}).join('')}${(L=>L?`<img class="obj" alt="" src="${L.dataUri}" style="left:${L.x}%;top:${L.y}%;width:${L.w}%;height:${L.h}%;object-fit:contain">`:'')(slideLogoPlacement(project,s))}</div></section>`).join('');return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${String(project.name||'OpenViz').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</title><style>@page{size:${(page.w/72).toFixed(4)}in ${(page.h/72).toFixed(4)}in;margin:0}html,body{margin:0;padding:0;background:#e7ebef;color:#142636;font-family:Arial,sans-serif}.sheet{position:relative;width:${(page.w/72).toFixed(4)}in;height:${(page.h/72).toFixed(4)}in;margin:18px auto;overflow:hidden;page-break-after:always;break-after:page;box-shadow:0 3px 24px #0002;display:flex;align-items:center;justify-content:center}.canvas{position:relative;width:${(sw/72).toFixed(4)}in;height:${(sh/72).toFixed(4)}in;overflow:hidden}.obj{position:absolute;box-sizing:border-box;overflow:hidden}.obj svg{width:100%;height:100%;display:block}.obj.text{white-space:pre-wrap}header{padding:14px;text-align:center}button{padding:8px 16px}@media print{header{display:none}.sheet{margin:0;box-shadow:none;print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body><header>OpenViz vector-print presentation · <button onclick="window.print()">Print / Save as PDF</button><p>Choose Save as PDF, zero margins, background graphics on, and no headers/footers.</p></header>${all}</body></html>`;}
export function exportPrintableSlides(project,slides,datasetForChart,options={}){const html=printableSlidesHtml(project,slides,datasetForChart,options);download(`${slug(project.name)}-vector-print.html`,new Blob([html],{type:'text/html;charset=utf-8'}));return html;}

/** Vector-print path for a single academic/report figure; uses the authoritative SVG. */
export function exportPrintableFigure(project,chart,rows){
 const svg=buildChart(rows,{...chart,transparent:false},chart.type,{width:960,height:540});
 const title=safeName(chart.title||'OpenViz figure').replace(/&/g,'&amp;').replace(/</g,'&lt;');
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title><style>@page{size:13.333in 7.5in;margin:0}body{margin:0;background:#e7ebef;font-family:Arial,sans-serif}.sheet{width:13.333in;height:7.5in;background:#fff;margin:18px auto;display:grid;place-items:center;page-break-after:always}.sheet svg{width:100%;height:auto;max-height:100%}header{padding:12px;text-align:center}@media print{header{display:none}.sheet{margin:0;print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body><header>OpenViz vector figure · Open your browser's Print dialog and choose Save as PDF. <button onclick="print()">Print / Save as PDF</button></header><main class="sheet">${svg}</main></body></html>`;
 download(`${slug(chart.title||project.name)}-vector-print.html`,new Blob([html],{type:'text/html;charset=utf-8'}));return html;
}
