"""Isolated Chromium UI tests for V3.3.1. Uses the existing app source with in-memory storage stub.
Run: python tests/test-browser-v331.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64,re
root=Path(__file__).resolve().parent.parent
uri=lambda c:'data:text/javascript;base64,'+base64.b64encode(c.encode()).decode()
mods={}
for n in ['data','catalogue','performance','advanced','world-data','themes','natural-motion','gif']:
 code=(root/'src'/f'{n}.js').read_text()
 if n=='advanced':code=code.replace("from './performance.js'",f"from '{mods['performance']}'")
 mods[n]=uri(code)
mods['storage']=uri('''const db=new Map();export const newId=(p='id')=>p+Math.random().toString(36).slice(2);export const preference=(k,d)=>d;export const setPreference=()=>{};export async function listProjects(){return [...db.values()].map(p=>({id:p.id,name:p.name,updatedAt:p.updatedAt}));}export async function saveProject(p){db.set(p.id,structuredClone(p));}export async function getProject(id){return structuredClone(db.get(id)||null);}export async function saveProjectIfCurrent(p,expected){db.set(p.id,structuredClone(p));}export async function deleteProject(id){db.delete(id);}export async function listCheckpoints(){return [];}export async function createCheckpoint(){return null;}export async function getCheckpoint(){return null;}export async function testLocalStorage(){return {ok:true,usage:0,persisted:false};}''')
for name,deps in {'dataset-edit':['data'],'geo':['world-data'],'charts':['data','advanced','geo','performance'],'advisor':['data','geo'],'exports':['charts'],'motion':['natural-motion'],'dashboard-interactive':['charts'],'video':['motion','gif'],'story':['motion','gif','natural-motion'],'pdf-export':['charts','exports']}.items():
 code=(root/'src'/f'{name}.js').read_text()
 for dep in deps:code=code.replace(f"from './{dep}.js'",f"from '{mods[dep]}'")
 mods[name]=uri(code)
app=(root/'src/app.js').read_text()
for dep in ['data','dataset-edit','catalogue','storage','advanced','geo','charts','advisor','exports','pdf-export','themes','motion','video','dashboard-interactive','story','natural-motion']:
 app=app.replace(f"from './{dep}.js'",f"from '{mods[dep]}'")
# Testing-only hooks. The delivered app does not expose these.
app+='\nwindow.__v331={get project(){return project},get storyUI(){return storyUI},newStory,storyAddScene,storyFrame,storySvgAt,get sources(){return storyFrameSources},story,storyScene,storyLayout,renderStory};\n'
html=(root/'index.html').read_text().replace('<link rel="stylesheet" href="src/styles.css" />','<style>'+(root/'src/styles.css').read_text()+'</style>')
html=re.sub(r'<script[^>]+src="(?:vendor|src)/[^"]+"[^>]*></script>','',html)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1600,'height':920},accept_downloads=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('''() => {const vals=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>vals.get(k)||null,setItem:(k,v)=>vals.set(k,v),removeItem:k=>vals.delete(k)}});}''')
 for f in ['jszip.min.js','pptxgen.min.js']:page.add_script_tag(content=(root/'vendor'/f).read_text())
 page.add_script_tag(type='module',content=f"import '{uri(app)}';")
 page.wait_for_function('window.__v331 && document.querySelector("[data-action=load-sample]")',timeout=30000)
 page.locator('[data-action=load-sample]').click()
 page.wait_for_function('document.querySelector("#liveChartSvg svg")',timeout=30000)
 page.locator('[data-menu=View]').click()
 page.locator('#menuPopover [data-action=to-data]').click()
 page.locator('[data-action=dataset-rename-column-request]').first.wait_for()
 page.locator('[data-action=dataset-rename-column-request]').first.click()
 assert page.locator('#renameColumnName').input_value()=='Year'
 page.locator('#renameColumnName').fill('Fiscal Year')
 page.locator('[data-action=dataset-rename-column-confirm]').click()
 assert page.locator('[aria-label="Rename column Fiscal Year"]').count()==1
 cols=page.evaluate('''() => {let p=window.__v331.project;return {cols:p.datasets[0].columns,first:p.datasets[0].rows[0],raw:p.datasets[0].rawRows[0],mapping:p.charts[0].x,log:p.datasets[0].log.at(-1).summary};}''')
 assert 'Fiscal Year' in cols['cols'] and cols['mapping']=='Fiscal Year',cols
 assert 'Fiscal Year' in cols['first'] and 'Year' in cols['raw'],cols
 assert 'Renamed column' in cols['log']
 page.screenshot(path=str(root/'v331-dataset-rename.png'),full_page=False)
 print('PASS: column rename in UI updates data rows and linked chart, preserves original import and audit',flush=True)
 # Create a two-scene Story Studio and verify timeline interactions.
 page.evaluate('window.__v331.newStory()')
 page.locator('.story-overview-block').first.wait_for()
 page.evaluate('window.__v331.storyAddScene()')
 assert page.locator('.story-overview-block').count()==2
 state=page.evaluate('''() => {const v=window.__v331;return {dur:v.story().scenes.map(s=>s.duration),anim:v.story().scenes.map(s=>s.animationMs),total:v.storyLayout(v.story()).duration};}''')
 assert state['dur']==[5400,5400] and state['anim']==[2600,2600],state
 scene_1=page.locator('.story-scene-select').first
 scene_1.click()
 assert page.evaluate('window.__v331.storyUI.sceneId===window.__v331.story().scenes[0].id')
 initial_ms=page.evaluate('window.__v331.storyUI.ms')
 assert 200 <= initial_ms < 1000
 print('PASS: clicking scene in green timeline selects it and seeks its preview',flush=True)
 # Preview at late animation versus hold: same source SVG after the animation finishes.
 holds=page.evaluate('''() => {const v=window.__v331,s=v.story();return [v.storySvgAt(s,v.sources,3000),v.storySvgAt(s,v.sources,4000)];}''')
 assert holds[0]==holds[1], 'Animation does not hold final state' 
 start=page.evaluate('''() => {const v=window.__v331;return v.storySvgAt(v.story(),v.sources,200);}''')
 assert start!=holds[0]
 print('PASS: keyframe motion reaches completed geometry then holds for reading',flush=True)
 page.locator('.story-keyframe[data-track=title]').last.click()
 selected=page.evaluate('''() => {const v=window.__v331;return {keyAt:v.storyScene().tracks[v.storyUI.track][v.storyUI.keyIndex].at,ms:v.storyUI.ms,animationMs:v.storyScene().animationMs};}''')
 assert abs(selected['ms']-selected['keyAt']*selected['animationMs'])<3,selected
 print('PASS: clicking keyframe moves playhead to show its visual effect',flush=True)
 # Directly adjust a selected title keyframe, then inspect the preview.
 page.locator('[data-story-key-prop=opacity]').fill('0.45')
 page.locator('[data-story-key-prop=opacity]').dispatch_event('change')
 assert abs(page.evaluate('window.__v331.storyScene().tracks.title[window.__v331.storyUI.keyIndex].opacity')-.45)<.001
 print('PASS: keyframe property edit updates persistent scene track',flush=True)
 # Resize first clip by dragging edge.
 before=page.evaluate('window.__v331.story().scenes[0].duration')
 handle=page.locator('[data-story-scene-resize]').first
 rect=handle.bounding_box();assert rect
 page.mouse.move(rect['x']+rect['width']/2,rect['y']+rect['height']/2)
 page.mouse.down();page.mouse.move(rect['x']+110,rect['y']+rect['height']/2,steps=8);page.mouse.up()
 after=page.evaluate('window.__v331.story().scenes[0].duration')
 assert after>before,(before,after)
 print('PASS: dragging green clip edge changes stored scene duration',before,after,flush=True)
 page.locator('[data-story-scene-resize]').first.focus()
 page.keyboard.press('ArrowLeft')
 assert page.evaluate('window.__v331.story().scenes[0].duration')==after-100
 print('PASS: timeline duration handles support keyboard adjustment',flush=True)
 assert not errors,errors
 page.screenshot(path=str(root/'v331-story-editor.png'),full_page=False)
 print('V3.3.1 STORY + DATA EDITOR BROWSER TESTS PASSED',flush=True)
 browser.close()
