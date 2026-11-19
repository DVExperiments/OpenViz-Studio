"""V3.6 focused usability interactions, isolated Chromium modules.
Does not certify real local-origin storage / Firefox / Safari.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1600,'height':1000},accept_downloads=True)
 errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
 html=(root/'index.html').read_text().replace('<link rel="stylesheet" href="src/styles.css" />','<style>'+(root/'src/styles.css').read_text()+'</style>')
 html=re.sub(r'<script[^>]+src="(?:vendor|src)/[^"]+"[^>]*></script>','',html)
 page.set_content(html,wait_until='domcontentloaded')
 for file in ['jszip.min.js','pptxgen.min.js']:page.add_script_tag(content=(root/'vendor'/file).read_text())
 def blob(code):return page.evaluate("src=>URL.createObjectURL(new Blob([src],{type:'text/javascript'}))",code)
 mods={}
 for n in ['data','catalogue','performance','advanced','world-data','themes','natural-motion','gif']:
  code=(root/'src'/f'{n}.js').read_text()
  if n=='advanced':code=code.replace("from './performance.js'",f"from '{mods['performance']}'")
  mods[n]=blob(code)
 mods['storage']=blob('''const db=new Map();export const newId=(p='id')=>p+Math.random().toString(36).slice(2);export const preference=(k,d)=>d;export const setPreference=()=>{};export async function listProjects(){return [...db.values()].map(p=>({id:p.id,name:p.name,updatedAt:p.updatedAt,datasets:p.datasets?.length||0,charts:p.charts?.length||0}));}export async function saveProject(p){db.set(p.id,structuredClone(p));}export async function getProject(id){return structuredClone(db.get(id)||null);}export async function saveProjectIfCurrent(p,expected){db.set(p.id,structuredClone(p));}export async function deleteProject(id){db.delete(id);}export async function listCheckpoints(){return [];}export async function createCheckpoint(){return null;}export async function getCheckpoint(){return null;}export async function testLocalStorage(){return {ok:true,usage:0,persisted:false};}''')
 for name,deps in {'dataset-edit':['data'],'geo':['world-data'],'dashboard-links':['geo'],'charts':['data','advanced','geo','performance'],'advisor':['data','geo'],'exports':['charts'],'motion':['natural-motion'],'dashboard-interactive':['charts','dashboard-links'],'video':['motion','gif'],'story':['motion','gif','natural-motion'],'pdf-export':['charts','exports'],'publishing':['charts','exports','dashboard-interactive','story']}.items():
  code=(root/'src'/f'{name}.js').read_text()
  for dep in deps:code=code.replace(f"from './{dep}.js'",f"from '{mods[dep]}'")
  mods[name]=blob(code)
 app=(root/'src/app.js').read_text()
 for dep in ['data','dataset-edit','catalogue','storage','advanced','geo','dashboard-links','charts','advisor','exports','pdf-export','themes','motion','video','dashboard-interactive','story','natural-motion','publishing']:
  app=app.replace(f"from './{dep}.js'",f"from '{mods[dep]}'")
 app+='\nwindow.__v36={get project(){return project},get ui(){return ui},render,openChartChooser};\n'
 page.evaluate('async url=>await import(url)',blob(app))
 page.wait_for_function('window.__v36',timeout=16000)
 print('BOOT',page.locator('.home-action').count(),flush=True)
 print('mobile tests beginning',flush=True)
 page.set_viewport_size({'width':940,'height':800})
 page.evaluate("window.__v36.ui.page='visualise';window.__v36.ui.rightOpen=false;window.__v36.render()")
 assert page.locator('.v36-mobile-edit').is_visible()
 page.locator('.v36-mobile-edit').click()
 assert page.evaluate('window.__v36.ui.rightOpen') is True
 assert not page.locator('#inspector').evaluate('(e)=>e.classList.contains("collapsed")')
 page.set_viewport_size({'width':660,'height':820})
 assert page.locator('.v36-mobile-project').is_visible()
 page.evaluate('window.__v36.ui.leftOpen=false;window.__v36.render()')
 page.locator('.v36-mobile-project').click()
 assert page.evaluate('window.__v36.ui.leftOpen') is True
 print('PASS narrow-screen contextual editor and project toggles',flush=True)

 page.set_viewport_size({'width':1600,'height':1000})
 page.evaluate("window.__v36.ui.page='home';window.__v36.ui.leftOpen=true;window.__v36.ui.rightOpen=true;window.__v36.render();")
 assert page.locator('.home-action-featured b').inner_text()=='Start with your data'
 page.screenshot(path=str(root/'v36-home.png'))
 assert page.locator('[data-action=home-explore-gallery]').count()==1
 original=page.evaluate('window.__v36.project.id')
 page.locator('[data-action=home-explore-gallery]').click(timeout=3000)
 print('gallery opened',flush=True)
 page.locator('#catalogueCards').wait_for()
 assert page.locator('.v36-catalogue-popular').is_visible()
 page.screenshot(path=str(root/'v36-template-gallery.png'))
 assert page.locator('.catalogue-item').count()==12
 assert page.locator('[data-action=v36-show-all-charts]').count()==1
 assert page.locator('.catalogue-item').first.locator('details.v36-card-details').count()==1
 page.locator('[data-action=v36-catalogue-filter][data-type=line]').click(timeout=3000)
 print('filtered line',flush=True)
 assert page.locator('.catalogue-item').count()==1
 page.locator('[data-action=v36-catalogue-reset]').click()
 assert page.locator('.catalogue-item').count()==12
 page.locator('[data-action=v36-show-all-charts]').click()
 assert page.locator('.catalogue-item').count()>=20
 print('PASS catalogue browsing and suggested categories',flush=True)
 # Examples chosen from Home must not be injected into an existing project.
 page.locator('.catalogue-item').filter(has=page.locator('h3:text-is("Line chart")')).locator('[data-action=catalogue-demo-create]').click()
 page.wait_for_function('window.__v36.ui.page==="visualise"')
 assert page.evaluate('window.__v36.project.id')!=original
 assert page.evaluate('window.__v36.project.charts.length')==1
 assert page.locator('.v36-mode-bar .active').inner_text()=='Essentials'
 assert not page.locator('.editor-bottom').count() and not page.locator('.chart-layers').count()
 page.screenshot(path=str(root/'v36-editor-essentials.png'))
 print('PASS create example project and simple canvas',flush=True)
 before=page.evaluate('JSON.stringify(window.__v36.project.datasets[0].rows)')
 page.locator('[data-action=v36-apply-style][data-id=boardroom-navy]').click()
 assert page.evaluate('window.__v36.project.charts[0].color')=='#255b92'
 assert page.evaluate('JSON.stringify(window.__v36.project.datasets[0].rows)')==before
 page.locator('[data-action=editor-mode-advanced]').first.click()
 assert page.locator('.v36-mode-bar .active').inner_text()=='Advanced'
 assert page.locator('.inspector-tabs button').count()>=4
 page.locator('[data-inspector=axes]').click()
 assert page.locator('.inspector-tabs .active').inner_text()=='Axes'
 page.locator('[data-action=editor-mode-essentials]').first.click()
 assert page.locator('.v36-mode-bar .active').inner_text()=='Essentials'
 assert page.evaluate('window.__v36.project.charts[0].color')=='#255b92'
 print('PASS style and advanced roundtrip preserving data/style',flush=True)
 page.locator('#chartElementPicker').select_option('title')
 assert page.locator('.v36-back').is_visible()
 page.locator('.v36-back').click()
 assert page.locator('.v36-essentials').is_visible()
 print('PASS direct editing return path',flush=True)
 page.screenshot(path=str(root/'v36-advanced-switch.png'))
 # Published workflows should remain functional.
 page.locator('[data-action=publish-open]').first.click()
 page.locator('#publishKind').wait_for()
 assert page.locator('#publishKind').input_value()=='chart'
 print('PASS publishing entrypoint',flush=True)
 # A template chosen before uploading data should create that chart in a fresh project.
 print('BEGIN import flow',flush=True)
 page.locator('[data-action=close-modal]').first.click(timeout=3000)
 print('closed publish',flush=True)
 prior=page.evaluate('window.__v36.project.id')
 page.evaluate("window.__v36.ui.page='home';window.__v36.render();")
 print('home opened',flush=True)
 page.locator('[data-action=home-explore-gallery]').click(timeout=3000)
 print('gallery opened',flush=True)
 page.locator('[data-action=v36-catalogue-filter][data-type=line]').click()
 page.locator('[data-action=chooser-select][data-type=line]').click(timeout=3000)
 print('line chosen',flush=True)
 with page.expect_file_chooser(timeout=6000) as chooser:
  page.locator('[data-action=import-data][data-type=line]').click(timeout=3000)
 chooser.value.set_files({'name':'revenue.csv','mimeType':'text/csv','buffer':b'Year,Revenue\n2024,45\n2025,79\n2026,100\n'})
 print('file chooser completed',flush=True)
 page.wait_for_function("window.__v36.ui.page==='visualise' && window.__v36.project.charts?.[0]?.type==='line'",timeout=15000)
 assert page.evaluate('window.__v36.project.id')!=prior
 assert page.evaluate('window.__v36.project.datasets[0].rows.length')==3
 print('PASS chart-first import creates the chosen chart in a new project',flush=True)
 assert not errors,errors
 browser.close()
 print('V3.6 ALL UX TESTS PASSED',flush=True)
