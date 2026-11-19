"""V3.5 isolated browser integration. In-memory storage; does not certify localhost or public hosting."""
from pathlib import Path
import base64,re,io,json,zipfile
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
def uri(s): return 'data:text/javascript;base64,'+base64.b64encode(s.encode()).decode()
mods={}
for n in ['data','catalogue','performance','advanced','world-data','themes','natural-motion','gif']:
 code=(root/'src'/f'{n}.js').read_text()
 if n=='advanced':code=code.replace("from './performance.js'",f"from '{mods['performance']}'")
 mods[n]=uri(code)
mods['storage']=uri('''const db=new Map();export const newId=(p='id')=>p+Math.random().toString(36).slice(2);export const preference=(k,d)=>d;export const setPreference=()=>{};export async function listProjects(){return [...db.values()].map(p=>({id:p.id,name:p.name,updatedAt:p.updatedAt}));}export async function saveProject(p){db.set(p.id,structuredClone(p));}export async function getProject(id){return structuredClone(db.get(id)||null);}export async function saveProjectIfCurrent(p,expected){db.set(p.id,structuredClone(p));}export async function deleteProject(id){db.delete(id);}export async function listCheckpoints(){return [];}export async function createCheckpoint(){return null;}export async function getCheckpoint(){return null;}export async function testLocalStorage(){return {ok:true,usage:0,persisted:false};}''')
for name,deps in {'dataset-edit':['data'],'geo':['world-data'],'dashboard-links':['geo'],'charts':['data','advanced','geo','performance'],'advisor':['data','geo'],'exports':['charts'],'motion':['natural-motion'],'dashboard-interactive':['charts','dashboard-links'],'video':['motion','gif'],'story':['motion','gif','natural-motion'],'pdf-export':['charts','exports'],'publishing':['charts','exports','dashboard-interactive','story']}.items():
 code=(root/'src'/f'{name}.js').read_text()
 for dep in deps:code=code.replace(f"from './{dep}.js'",f"from '{mods[dep]}'")
 mods[name]=uri(code)
app=(root/'src/app.js').read_text()
for dep in ['data','dataset-edit','catalogue','storage','advanced','geo','dashboard-links','charts','advisor','exports','pdf-export','themes','motion','video','dashboard-interactive','story','natural-motion','publishing']:
 app=app.replace(f"from './{dep}.js'",f"from '{mods[dep]}'")
app+='''\nwindow.__v35={get project(){return project},get ui(){return ui},render,openPublishStudio,get publishUI(){return publishUI},createPublication,publicationAssets,embedCode,freshStory};\n'''
html=(root/'index.html').read_text().replace('<link rel="stylesheet" href="src/styles.css" />','<style>'+(root/'src/styles.css').read_text()+'</style>')
html=re.sub(r'<script[^>]+src="(?:vendor|src)/[^"]+"[^>]*></script>','',html)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1530,'height':940},accept_downloads=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 print('before html',flush=True);page.set_content(html,wait_until='domcontentloaded');print('after html',flush=True)
 print('before vendor',flush=True);
 for f in ['jszip.min.js','pptxgen.min.js']:page.add_script_tag(content=(root/'vendor'/f).read_text());print('vendor',f,flush=True)
 print('before module,',len(app),flush=True);page.add_script_tag(type='module',content=f"import '{uri(app)}';");print('after module',flush=True)
 page.wait_for_function('window.__v35',timeout=20000);print('v35 booted',flush=True)
 # The library demo project contains a working bar chart.
 page.evaluate("window.__v35.ui.page='visualise';window.__v35.render();");print('visualise rendered',flush=True)
 page.locator('[data-action=publish-open]').first.click(timeout=12000);print('clicked',flush=True)
 page.locator('#publishKind').wait_for(timeout=12000);print('modal opened',flush=True)
 assert page.locator('h2').filter(has_text='Publishing Studio').count()==1
 page.wait_for_function("document.querySelector('#publishStatus')?.textContent.includes('self-contained')",timeout=30000)
 assert page.locator('#publishPreview').count()==1
 assert page.locator('#publishCopy').is_disabled()
 assert page.locator('iframe#publishPreview').get_attribute('sandbox')=='allow-scripts'
 page.screenshot(path=str(root/'v35-publishing-studio.png'),full_page=False)
 print('PASS: chart publishing modal, sandboxed preview, hosted URL required',flush=True)
 # Responsive device previews and preset changes.
 page.locator('[data-action=publish-device][data-id=phone]').click()
 assert page.locator('#publishPreview').evaluate('(el)=>el.style.width')=='375px'
 page.locator('#publishPreset').select_option('article')
 assert page.evaluate('window.__v35.publishUI.preset')=='article'
 page.locator('#publishInteractive').select_option('false')
 page.wait_for_timeout(250)
 assert 'script' not in page.evaluate('window.__v35.publishUI.publication.html').lower()
 page.screenshot(path=str(root/'v35-mobile-preview.png'),full_page=False)
 print('PASS: phone preview, article preset, static chart with no JavaScript',flush=True)
 page.locator('#publishedUrl').fill('javascript:alert(1)')
 assert page.locator('#publishCopy').is_disabled()
 page.locator('#publishedUrl').fill('https://example.org/visualizations/sales.html')
 assert page.locator('#publishCopy').is_enabled()
 assert 'https://example.org/visualizations/sales.html' in page.locator('#publishEmbedCode').input_value()
 # File downloads.
 with page.expect_download(timeout=30000) as x:page.locator('[data-action=publish-download]').click()
 htmlout=x.value
 assert htmlout.suggested_filename.endswith('-publish.html')
 with page.expect_download(timeout=30000) as x:page.locator('[data-action=publish-kit]').click()
 kit=x.value
 payload=kit.path().read_bytes()
 with zipfile.ZipFile(io.BytesIO(payload)) as z:
  assert z.testzip() is None
  assert 'index.html' in z.namelist() and 'PUBLISHING_GUIDE.txt' in z.namelist()
  assert 'HTTPS' in z.read('PUBLISHING_GUIDE.txt').decode()
 print('PASS: HTML and CRC-valid publishing ZIP, sanitized embed snippet',flush=True)
 # Dashboard and story previews with existing dataset source and links.
 page.locator('#publishKind').select_option('dashboard')
 page.wait_for_function("window.__v35.publishUI.kind==='dashboard'",timeout=15000)
 assert page.evaluate('window.__v35.publishUI.publication.kind')=='dashboard'
 page.locator('#publishInteractive').select_option('true')
 dashboard=page.evaluate('window.__v35.publishUI.publication.html')
 assert 'standalone' in dashboard.lower() or 'offline' in dashboard.lower()
 assert 'frame' in dashboard.lower()
 page.evaluate("window.__v35.project.stories=[window.__v35.freshStory(window.__v35.project.charts[0].id)];")
 page.locator('#publishKind').select_option('story')
 page.wait_for_function("window.__v35.publishUI.kind==='story' && window.__v35.publishUI.publication && window.__v35.publishUI.publication.kind==='story'",timeout=45000)
 st=page.evaluate('window.__v35.publishUI.publication.html')
 assert 'Animated data story' in st
 assert 'openviz-publisher-css' in st
 print('PASS: dashboard and visual story reuse existing local renderers',flush=True)
 assert not errors,errors
 print('V3.5 TARGETED CHROMIUM TESTS PASSED',flush=True)
 browser.close()
