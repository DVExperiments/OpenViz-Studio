"""V3.1 browser interaction regression using an explicit *mocked* local storage
module on isolated Chromium. No claims of real-origin IndexedDB coverage.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64,re
root=Path(__file__).resolve().parent.parent
uri=lambda s:'data:text/javascript;base64,'+base64.b64encode(s.encode()).decode()
mods={}
for n in ['data','catalogue','performance','advanced','world-data','themes','natural-motion','gif']:
 code=(root/'src'/f'{n}.js').read_text();mods[n]=uri(code.replace("from './performance.js'",f"from '{mods['performance']}'") if n=='advanced' else code)
# The fake storage gives the UI a genuinely independent external-tab writer.
# The actual IndexedDB transaction-level guard is covered by test-storage-v31.mjs.
storage_stub='''
const records=window.__v31Store=new Map();window.__v31ForceFail=false;
const clone=v=>v==null?null:structuredClone(v);
export function newId(p='obj'){return p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}
export function preference(n,d){return d;}export function setPreference(){}
export async function listProjects(){return [...records.values()].map(p=>({id:p.id,name:p.name,updatedAt:p.updatedAt,charts:p.charts?.length||0,datasets:p.datasets?.length||0}));}
export async function getProject(id){return clone(records.get(id));}
export async function saveProject(p){if(window.__v31ForceFail)throw Error('Storage unavailable');records.set(p.id,clone(p));}
export async function saveProjectIfCurrent(p,expected){if(window.__v31ForceFail)throw Error('Storage unavailable');const v=records.get(p.id),current=v?._storageRevision||null;if(current!==(expected||null)){const e=Error('Changed in another tab');e.code='STORAGE_CONFLICT';throw e;}records.set(p.id,clone(p));}
export async function deleteProject(id){records.delete(id);}export async function listCheckpoints(){return [];}export async function getCheckpoint(){return null;}export async function createCheckpoint(){return {time:new Date().toISOString()};}
export async function testLocalStorage(){return {ok:true,usage:0,quota:30000000,persisted:false};}
'''
mods['storage']=uri(storage_stub)
for name,deps in {
 'dataset-edit':['data'],'geo':['world-data'],'charts':['data','advanced','geo','performance'],
 'advisor':['data','geo'],'exports':['charts'],'motion':['natural-motion'],
 'dashboard-interactive':['charts'],'video':['motion','gif'],
 'story':['motion','gif','natural-motion'], 'pdf-export':['charts','exports']}.items():
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
 ctx=browser.new_context(viewport={'width':1350,'height':900},accept_downloads=True)
 page=ctx.new_page();errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('''() => { const vals=new Map(); Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>vals.get(k)||null,setItem:(k,v)=>vals.set(k,v),removeItem:k=>vals.delete(k)}}); }''')
 for name in ['jszip.min.js','pptxgen.min.js']:page.add_script_tag(content=(root/'vendor'/name).read_text())
 page.add_script_tag(type='module',content=f"import '{uri(app)}';")
 page.wait_for_function('window.__v31Store && document.querySelector("[data-action=load-sample]")',timeout=20000)
 page.locator('[data-action=load-sample]').first.click()
 page.wait_for_function('document.querySelector("#liveChartSvg svg")',timeout=20000)
 # Wait for autosave and obtain the active project ID and revision.
 page.wait_for_function('''() => [...window.__v31Store.values()].some(p=>p._storageRevision&&p.charts?.length)''',timeout=20000)
 original=page.evaluate('''() => [...window.__v31Store.values()].find(p=>p._storageRevision&&p.charts?.length).id''')
 page.evaluate('''id=>{const other=structuredClone(window.__v31Store.get(id));other._storageRevision='external-tab-write';other.name='Other tab version';window.__v31Store.set(id,other);}''',original)
 page.locator('[data-menu=File]').click();page.locator('#menuPopover [data-action=save-now]').click()
 page.wait_for_function('''() => !!document.querySelector('#modalLayer [data-action="conflict-save-copy"]')''',timeout=3000)
 assert 'updated in another tab' in page.locator('#modalLayer').inner_text().lower()
 assert 'Conflict' in page.locator('#saveStatus').inner_text()
 page.screenshot(path=str(root/'v32-regression-save-conflict.png'),full_page=False)
 print('PASS: conflicting tab save displays recovery choices and does not overwrite newer version',flush=True)
 page.locator('#modalLayer [data-action=close-modal]').click()
 page.locator('[data-menu=File]').click()
 assert page.locator('#menuPopover [data-action=review-save-conflict]').count()==1
 page.locator('#menuPopover [data-action=review-save-conflict]').click()
 assert page.locator('#modalLayer [data-action=conflict-save-copy]').count()==1
 print('PASS: dismissed conflict can be reopened from File menu',flush=True)
 # Avoid discarding edits: copy is new project, old external version is unchanged.
 page.locator('#modalLayer [data-action=conflict-save-copy]').click()
 page.wait_for_function('''() => [...window.__v31Store.values()].some(p=>p.name.includes('(recovered copy)')&&p._storageRevision)''',timeout=20000)
 copyid=page.evaluate('''() => [...window.__v31Store.values()].find(p=>p.name.includes('(recovered copy)')).id''')
 assert copyid!=original
 assert page.evaluate('id=>window.__v31Store.get(id).name',original)=='Other tab version'
 assert page.locator('#modalLayer.hidden').count()==1
 print('PASS: recovered copy gets a new ID; original remains untouched',flush=True)
 # Repeat conflict and explicitly choose to load latest saved version.
 page.evaluate('''id=>{const other=structuredClone(window.__v31Store.get(id));other._storageRevision='external-revision-two';other.name='Externally updated recovery';window.__v31Store.set(id,other);}''',copyid)
 page.locator('[data-menu=File]').click();page.locator('#menuPopover [data-action=save-now]').click()
 page.wait_for_function('''() => !!document.querySelector('#modalLayer [data-action="conflict-load-latest"]')''',timeout=20000)
 page.locator('#modalLayer [data-action=conflict-load-latest]').click()
 page.locator('#modalLayer [data-action=conflict-confirm-load]').click()
 page.wait_for_function('''() => document.querySelector('#projectName').textContent.includes('Externally updated recovery')''',timeout=20000)
 assert page.locator('#modalLayer.hidden').count()==1
 print('PASS: latest version loads only following explicit discard confirmation',flush=True)
 # Simulate an ordinary storage outage following an edit; attempted switching cannot lose the dirty project.
 page.locator('.workspace-toolbar [data-action=add-annotation]').click()
 page.evaluate('window.__v31ForceFail=true')
 page.locator('[data-menu=File]').click();page.locator('#menuPopover [data-action=save-now]').click()
 page.wait_for_function('''() => document.querySelector('#saveStatus').textContent.includes('unavailable')''',timeout=20000)
 page.locator('[data-menu=File]').click();page.locator('#menuPopover [data-action=new-blank]').click()
 page.wait_for_timeout(150)
 assert 'Externally updated recovery' in page.locator('#projectName').inner_text()
 print('PASS: failed storage save blocks a destructive new-project switch',flush=True)
 # Diagnostic reports can be downloaded without including the underlying dataset.
 page.evaluate('window.__v31ForceFail=false')
 page.locator('[data-menu=Help]').click();page.locator('#menuPopover [data-action=release-diagnostics]').click()
 page.locator('#modalLayer [data-action=release-run-diagnostics]').click()
 page.wait_for_function('''() => document.querySelector('#releaseDownloadReport')?.disabled === false''',timeout=20000)
 page.screenshot(path=str(root/'v32-regression-release-diagnostics.png'),full_page=False)
 with page.expect_download() as dl:
  page.locator('#releaseDownloadReport').click()
 report=dl.value
 assert report.suggested_filename=='openviz-v3.3-diagnostics.json'
 content=Path(report.path()).read_text()
 assert '"version": "3.3"' in content and '"checks"' in content
 assert 'Regional sales' not in content
 page.keyboard.press('Escape')
 print('PASS: downloadable diagnostic report excludes project data',flush=True)
 # Smaller screens retain room for the central workspace and expose the overlay panels via View.
 for width in [660,940,1400]:
  page.set_viewport_size({'width':width,'height':820});page.wait_for_timeout(90)
  available=page.locator('#workspace').bounding_box()['width']
  assert available>=min(360,width*.5),(width,available)
  print('PASS:',width,'px viewport usable workspace',round(available),flush=True)
 assert not errors,errors
 print('V3.1 mocked-browser conflict and recovery suite PASS',flush=True)
 ctx.close();browser.close()
