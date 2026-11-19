"""V3.5 isolated Chromium test via Blob URL modules, with in-memory storage.
This tests UI and exports, not external hosting / real file-origin persistence.
"""
from pathlib import Path
import re,io,zipfile
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1530,'height':940},accept_downloads=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 html=(root/'index.html').read_text().replace('<link rel="stylesheet" href="src/styles.css" />','<style>'+(root/'src/styles.css').read_text()+'</style>')
 html=re.sub(r'<script[^>]+src="(?:vendor|src)/[^"]+"[^>]*></script>','',html)
 page.set_content(html,wait_until='domcontentloaded')
 for f in ['jszip.min.js','pptxgen.min.js']:page.add_script_tag(content=(root/'vendor'/f).read_text())
 def blob(code):return page.evaluate("source => URL.createObjectURL(new Blob([source],{type:'text/javascript'}))",code)
 mods={}
 for n in ['data','catalogue','performance','advanced','world-data','themes','natural-motion','gif']:
  code=(root/'src'/f'{n}.js').read_text()
  if n=='advanced':code=code.replace("from './performance.js'",f"from '{mods['performance']}'")
  mods[n]=blob(code)
 mods['storage']=blob('''const db=new Map();export const newId=(p='id')=>p+Math.random().toString(36).slice(2);export const preference=(k,d)=>d;export const setPreference=()=>{};export async function listProjects(){return [...db.values()].map(p=>({id:p.id,name:p.name,updatedAt:p.updatedAt}));}export async function saveProject(p){db.set(p.id,structuredClone(p));}export async function getProject(id){return structuredClone(db.get(id)||null);}export async function saveProjectIfCurrent(p,expected){db.set(p.id,structuredClone(p));}export async function deleteProject(id){db.delete(id);}export async function listCheckpoints(){return [];}export async function createCheckpoint(){return null;}export async function getCheckpoint(){return null;}export async function testLocalStorage(){return {ok:true,usage:0,persisted:false};}''')
 for name,deps in {'dataset-edit':['data'],'geo':['world-data'],'dashboard-links':['geo'],'charts':['data','advanced','geo','performance'],'advisor':['data','geo'],'exports':['charts'],'motion':['natural-motion'],'dashboard-interactive':['charts','dashboard-links'],'video':['motion','gif'],'story':['motion','gif','natural-motion'],'pdf-export':['charts','exports'],'publishing':['charts','exports','dashboard-interactive','story']}.items():
  code=(root/'src'/f'{name}.js').read_text()
  for dep in deps:code=code.replace(f"from './{dep}.js'",f"from '{mods[dep]}'")
  mods[name]=blob(code)
 app=(root/'src/app.js').read_text()
 for dep in ['data','dataset-edit','catalogue','storage','advanced','geo','dashboard-links','charts','advisor','exports','pdf-export','themes','motion','video','dashboard-interactive','story','natural-motion','publishing']:
  app=app.replace(f"from './{dep}.js'",f"from '{mods[dep]}'")
 app+='\nwindow.__v35={get project(){return project},get ui(){return ui},render,openPublishStudio,get publishUI(){return publishUI},createPublication,publicationAssets,embedCode,freshStory};\n'
 app_url=blob(app)
 page.evaluate('async url => {await import(url)}',app_url)
 page.wait_for_function('window.__v35',timeout=16000)
 print('BOOT OK',flush=True)
 page.evaluate("window.__v35.ui.page='visualise';window.__v35.render();")
 page.locator('[data-action=publish-open]').first.click(timeout=10000)
 page.locator('#publishKind').wait_for(timeout=10000)
 page.wait_for_function("document.querySelector('#publishStatus')?.textContent.includes('self-contained')",timeout=12000)
 assert page.locator('#publishCopy').is_disabled()
 assert page.locator('iframe#publishPreview').get_attribute('sandbox')=='allow-scripts'
 page.wait_for_timeout(1200)
 print('Preview SVG count',page.frame_locator('#publishPreview').locator('svg').count(),flush=True)
 page.screenshot(path=str(root/'v35-publishing-studio.png'))
 print('PASS preview and hosted URL guard',flush=True)
 page.locator('[data-action=publish-device][data-id=phone]').click()
 assert page.locator('#publishPreview').evaluate('(el)=>el.style.width')=='375px'
 page.locator('#publishPreset').select_option('article')
 page.locator('#publishInteractive').select_option('false')
 assert '<script' not in page.evaluate('window.__v35.publishUI.publication.html').lower()
 page.screenshot(path=str(root/'v35-mobile-preview.png'))
 print('PASS viewport, preset, static HTML',flush=True)
 page.locator('#publishedUrl').fill('javascript:alert(1)')
 assert page.locator('#publishCopy').is_disabled()
 page.locator('#publishedUrl').fill('https://example.org/charts/region.html')
 assert page.locator('#publishCopy').is_enabled()
 assert 'example.org' in page.locator('#publishEmbedCode').input_value()
 page.locator('#publishPreset').select_option('presentation')
 assert page.locator('#publishCopy').is_disabled(),'changing export content must invalidate previous hosted URL'
 page.locator('#publishedUrl').fill('https://example.org/charts/region.html')
 with page.expect_download(timeout=20000) as x:page.locator('[data-action=publish-download]').click()
 assert x.value.suggested_filename.endswith('.html')
 with page.expect_download(timeout=20000) as x:page.locator('[data-action=publish-kit]').click()
 with zipfile.ZipFile(io.BytesIO(x.value.path().read_bytes())) as z:
  assert z.testzip() is None and 'index.html' in z.namelist() and 'PUBLISHING_GUIDE.txt' in z.namelist()
 print('PASS downloads and ZIP',flush=True)
 page.locator('#publishKind').select_option('dashboard')
 assert page.evaluate('window.__v35.publishUI.publication.kind')=='dashboard'
 page.evaluate("window.__v35.project.stories=[window.__v35.freshStory(window.__v35.project.charts[0].id)];window.__v35.openPublishStudio();")
 page.locator('#publishKind').select_option('story')
 page.wait_for_function("window.__v35.publishUI.publication?.kind==='story'",timeout=20000)
 assert 'Animated data story' in page.evaluate('window.__v35.publishUI.publication.html')
 print('PASS dashboard and story preview',flush=True)
 page.set_viewport_size({'width':660,'height':820})
 page.evaluate('window.__v35.openPublishStudio()')
 page.wait_for_timeout(300)
 bounds=page.locator('.modal:has(.publish-studio)').bounding_box()
 assert bounds and bounds['width']<=660 and bounds['x']>=0,bounds
 print('PASS narrow-screen Publishing Studio modal',flush=True)
 assert not errors,errors
 browser.close();print('V3.5 ALL TARGETED TESTS PASSED',flush=True)
