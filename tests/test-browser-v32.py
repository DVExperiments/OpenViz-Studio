"""V3.2 PDF & PPTX export interactions with isolated Chromium and mocked storage.
No claim of ordinary localhost persistence or Firefox/Safari validation.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64,re,zipfile,fitz
root=Path(__file__).resolve().parent.parent
uri=lambda s:'data:text/javascript;base64,'+base64.b64encode(s.encode()).decode()
mods={}
for n in ['data','catalogue','performance','advanced','world-data','themes','natural-motion','gif']:
 code=(root/'src'/f'{n}.js').read_text();mods[n]=uri(code.replace("from './performance.js'",f"from '{mods['performance']}'") if n=='advanced' else code)
storage_stub='''
const records=window.__v32Store=new Map();const clone=v=>v==null?null:structuredClone(v);
export function newId(p='obj'){return p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}
export function preference(n,d){return d;}export function setPreference(){}
export async function listProjects(){return [...records.values()].map(p=>({id:p.id,name:p.name,updatedAt:p.updatedAt,charts:p.charts?.length||0,datasets:p.datasets?.length||0}));}
export async function getProject(id){return clone(records.get(id));}
export async function saveProject(p){records.set(p.id,clone(p));}
export async function saveProjectIfCurrent(p,expected){const v=records.get(p.id),current=v?._storageRevision||null;if(current!==(expected||null)){const e=Error('Changed in another tab');e.code='STORAGE_CONFLICT';throw e;}records.set(p.id,clone(p));}
export async function deleteProject(id){records.delete(id);}export async function listCheckpoints(){return [];}export async function getCheckpoint(){return null;}export async function createCheckpoint(){return {};}
export async function testLocalStorage(){return {ok:true,usage:0,quota:30000000,persisted:false};}
'''
mods['storage']=uri(storage_stub)
for name,deps in {
 'dataset-edit':['data'],'geo':['world-data'],'charts':['data','advanced','geo','performance'],
 'advisor':['data','geo'],'exports':['charts'],'motion':['natural-motion'],
 'dashboard-interactive':['charts'],'video':['motion','gif'],
 'story':['motion','gif','natural-motion'],
 'pdf-export':['charts','exports']}.items():
 code=(root/'src'/f'{name}.js').read_text()
 for dep in deps:code=code.replace(f"from './{dep}.js'",f"from '{mods[dep]}'")
 mods[name]=uri(code)
app=(root/'src/app.js').read_text()
for dep in ['data','dataset-edit','catalogue','storage','performance','advanced','geo','charts','advisor','exports','pdf-export','themes','motion','video','dashboard-interactive','story','natural-motion']:
 app=app.replace(f"from './{dep}.js'",f"from '{mods[dep]}'")
html=(root/'index.html').read_text().replace('<link rel="stylesheet" href="src/styles.css" />','<style>'+(root/'src/styles.css').read_text()+'</style>')
html=re.sub(r'<script[^>]+src="(?:vendor|src)/[^"]+"[^>]*></script>','',html)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 ctx=browser.new_context(viewport={'width':1450,'height':920},accept_downloads=True)
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('''() => { const vals=new Map(); Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>vals.get(k)||null,setItem:(k,v)=>vals.set(k,v),removeItem:k=>vals.delete(k)}}); }''')
 for name in ['jszip.min.js','pptxgen.min.js']:page.add_script_tag(content=(root/'vendor'/name).read_text())
 page.add_script_tag(type='module',content=f"import '{uri(app)}';")
 page.wait_for_function('window.__v32Store && document.querySelector("[data-action=load-sample]")',timeout=25000)
 page.locator('[data-action=load-sample]').first.click()
 page.wait_for_function('document.querySelector("#liveChartSvg svg")',timeout=25000)
 page.locator('[data-menu=File]').click()
 page.locator('#menuPopover [data-action=export-pdf-dialog]').click()
 assert 'publication output' in page.locator('#modalLayer').inner_text().lower()
 page.screenshot(path=str(root/'v32-pdf-export-options.png'))
 with page.expect_download(timeout=35000) as ev:page.locator('#modalLayer [data-action=export-pdf-start]').click()
 p=Path(ev.value.path());name=ev.value.suggested_filename
 assert name.endswith('.pdf'),name
 data=p.read_bytes();assert data[:8]==b'%PDF-1.4',data[:16]
 doc=fitz.open(stream=data,filetype='pdf')
 assert len(doc)==1
 text=doc[0].get_text()
 assert 'Annual performance' in text,text
 assert doc[0].get_images(),"PDF did not embed slide chart"
 assert abs(doc[0].rect.width/ doc[0].rect.height - 16/9)<.002
 (root/'tests'/'v32-sample-slides.pdf').write_bytes(data)
 pix=doc[0].get_pixmap(matrix=fitz.Matrix(1.25,1.25));pix.save(str(root/'v32-pdf-slide-preview.png'))
 print('PASS PDF presentation: valid file, selectable text, embedded chart, 16:9 page',flush=True)
 page.locator('#pdfTarget').select_option('chart')
 page.locator('#pdfPaper').select_option('a4')
 with page.expect_download(timeout=35000) as ev:page.locator('#modalLayer [data-action=export-pdf-start]').click()
 data=Path(ev.value.path()).read_bytes();pdf=fitz.open(stream=data,filetype='pdf')
 assert len(pdf)==1 and abs(pdf[0].rect.width-841.89)<1
 assert pdf[0].get_images()
 print('PASS PDF figure: valid A4 landscape PDF with chart',flush=True)
 with page.expect_download(timeout=30000) as ev:page.locator('#modalLayer [data-action=export-vector-print]').click()
 h=Path(ev.value.path()).read_text()
 assert '<svg' in h and 'OpenViz vector figure' in h
 print('PASS single-figure vector-print HTML',flush=True)
 page.locator('#pdfTarget').select_option('slides')
 with page.expect_download(timeout=30000) as ev:page.locator('#modalLayer [data-action=export-vector-print]').click()
 h=Path(ev.value.path()).read_text()
 assert '<svg' in h and '@page{size:' in h and 'Annual performance' in h
 printpage=ctx.new_page();printpage.set_content(h,wait_until='load')
 vectorpdf=printpage.pdf(prefer_css_page_size=True,print_background=True)
 document=fitz.open(stream=vectorpdf,filetype='pdf')
 assert len(document)==1 and 'Annual performance' in document[0].get_text()
 assert not document[0].get_images(), 'Expected vector print path, not raster chart image'
 (root/'tests/v32-vector-print-slides.pdf').write_bytes(vectorpdf)
 printpage.close()
 print('PASS vector-print HTML: SVG and selectable text retained in Chromium PDF',flush=True)
 page.locator('#modalLayer [data-action=close-modal]').first.click()
 # Enter slide and select its existing linked chart.
 page.locator('[data-menu=View]').click();page.locator('#menuPopover [data-action=to-present]').click()
 page.wait_for_function('document.querySelector(".slide-object.chart")')
 page.locator('.slide-object.chart').click()
 sel=page.locator('#inspectorContent [data-object-setting=pptxMode]')
 assert sel.count()==1, page.locator('#inspectorContent').inner_text()[:900]
 assert sel.input_value()=='auto'
 assert 'powerpoint export' in page.locator('#inspectorContent .export-mode-indicator').inner_text().lower()
 sel.select_option('editable')
 assert 'editable chart' in page.locator('#inspectorContent .export-mode-indicator').inner_text().lower()
 page.screenshot(path=str(root/'v32-pptx-editability.png'))
 with page.expect_download(timeout=30000) as ev:page.locator('.slide-toolbar [data-action=export-pptx]').click()
 ppt=Path(ev.value.path());assert ppt.exists() and ppt.stat().st_size>10000
 with zipfile.ZipFile(ppt) as z:
  files=z.namelist()
  assert any(f.startswith('ppt/charts/chart') and f.endswith('.xml') for f in files),files
  assert b'Annual performance' in z.read('ppt/slides/slide1.xml')
 print('PASS PPTX editable mode: native chart XML and editable slide text',flush=True)
 page.locator('.slide-object.chart').click()
 page.locator('#inspectorContent [data-object-setting=pptxMode]').select_option('vector')
 with page.expect_download(timeout=30000) as ev:page.locator('.slide-toolbar [data-action=export-pptx]').click()
 with zipfile.ZipFile(Path(ev.value.path())) as z:
  assert not any(f.startswith('ppt/charts/chart') and f.endswith('.xml') for f in z.namelist())
  assert any(f.startswith('ppt/media/') for f in z.namelist())
 print('PASS PPTX fidelity mode: SVG artwork and no native chart data',flush=True)
 assert not errors,errors
 print('V3.2 export workflow PASS',flush=True)
 ctx.close();browser.close()
