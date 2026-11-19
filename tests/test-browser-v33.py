"""V3.3 large-data import and bounded SVG chart UI smoke in isolated Chromium.
Module workers cannot load from data: URLs; this test verifies the synchronous fallback.
Real-origin worker execution remains an owner check.
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
storage_stub='''const db=new Map();export const newId=(p='id')=>p+Math.random().toString(36).slice(2);export const preference=(k,d)=>d;export const setPreference=()=>{};export async function listProjects(){return [...db.values()].map(p=>({id:p.id,name:p.name,updatedAt:p.updatedAt}));}export async function saveProject(p){db.set(p.id,structuredClone(p));}export async function getProject(id){return structuredClone(db.get(id)||null);}export async function saveProjectIfCurrent(p,expected){db.set(p.id,structuredClone(p));}export async function deleteProject(id){db.delete(id);}export async function listCheckpoints(){return [];}export async function createCheckpoint(){return null;}export async function getCheckpoint(){return null;}export async function testLocalStorage(){return {ok:true,usage:0,persisted:false};}'''
mods['storage']=uri(storage_stub)
for name,deps in {'dataset-edit':['data'],'geo':['world-data'],'charts':['data','advanced','geo','performance'],'advisor':['data','geo'],'exports':['charts'],'motion':['natural-motion'],'dashboard-interactive':['charts'],'video':['motion','gif'],'story':['motion','gif','natural-motion'],'pdf-export':['charts','exports']}.items():
 code=(root/'src'/f'{name}.js').read_text()
 for dep in deps:code=code.replace(f"from './{dep}.js'",f"from '{mods[dep]}'")
 mods[name]=uri(code)
app=(root/'src/app.js').read_text()
for dep in ['data','dataset-edit','catalogue','storage','advanced','geo','charts','advisor','exports','pdf-export','themes','motion','video','dashboard-interactive','story','natural-motion']:
 app=app.replace(f"from './{dep}.js'",f"from '{mods[dep]}'")
html=(root/'index.html').read_text().replace('<link rel="stylesheet" href="src/styles.css" />','<style>'+(root/'src/styles.css').read_text()+'</style>')
html=re.sub(r'<script[^>]+src="(?:vendor|src)/[^"]+"[^>]*></script>','',html)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1500,'height':940},accept_downloads=True);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('''() => {const vals=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>vals.get(k)||null,setItem:(k,v)=>vals.set(k,v),removeItem:k=>vals.delete(k)}});}''')
 for file in ['jszip.min.js','pptxgen.min.js']:page.add_script_tag(content=(root/'vendor'/file).read_text())
 page.add_script_tag(type='module',content=f"import '{uri(app)}';")
 page.wait_for_function('document.querySelector("[data-action=load-sample]")',timeout=30000)
 page.locator('[data-action=load-sample]').click()
 page.wait_for_function('document.querySelector("#liveChartSvg svg")',timeout=25000)
 page.locator('[data-menu=View]').click();page.locator('#menuPopover [data-action=to-data]').click()
 page.wait_for_function('document.querySelector("[data-action=import-data]")')
 with page.expect_file_chooser(timeout=10000) as ev:page.locator('[data-action=import-data]').first.click()
 ev.value.set_files(str(root/'examples/performance-demo-30000.csv'))
 page.wait_for_function('document.querySelector(".data-summary")?.textContent?.includes("30,000")',timeout=30000)
 assert '30,000' in page.locator('.data-summary').inner_text()
 print('PASS: 30,000-row CSV imported and profiled via isolated-browser fallback',flush=True)
 page.screenshot(path=str(root/'v33-data-large.png'),full_page=False)
 # Standalone source renderer smoke: the app's compiled chart module processes the
 # same number of observations. Main app navigator interaction remains an owner check.
 page.add_script_tag(type='module',content=f"import {{buildChart,DEFAULT_CHART,chartWarnings}} from '{mods['charts']}';window.__v33Chart={{buildChart,DEFAULT_CHART,chartWarnings}};")
 page.wait_for_function('window.__v33Chart',timeout=12000)
 result=page.evaluate('''() => {const api=window.__v33Chart;const rows=Array.from({length:30000},(_,i)=>({X:i,Y:i===29999?500:Math.sin(i*.012)*55}));const s={...api.DEFAULT_CHART,type:'scatter',x:'X',y:'Y'};const svg=api.buildChart(rows,s,'scatter');const dom=new DOMParser().parseFromString(svg,'image/svg+xml');return {marks:dom.querySelectorAll('circle[data-viz-part=point]').length,desc:dom.querySelector('desc')?.textContent,warnings:api.chartWarnings(rows,s,'scatter')};}''')
 assert result['marks']<=400 and result['marks']>=300,result
 assert 'sampled from 30000 observations' in result['desc'],result
 assert any('sampled observations' in v for v in result['warnings'])
 print('PASS: 30,000-row scatter renders <=400 representative marks; user-facing sampling warning',flush=True)
 assert not errors,errors
 print('V3.3 large data browser fallback workflow PASS',flush=True)
 browser.close()
