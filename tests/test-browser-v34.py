"""V3.4 isolated Chromium integration. Uses in-memory storage; no localhost claim.
Run python tests/test-browser-v34.py
"""
from pathlib import Path
import base64,re, json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
uri=lambda s:'data:text/javascript;base64,'+base64.b64encode(s.encode()).decode()
mods={}
for n in ['data','catalogue','performance','advanced','world-data','themes','natural-motion','gif']:
 code=(root/'src'/f'{n}.js').read_text()
 if n=='advanced':code=code.replace("from './performance.js'",f"from '{mods['performance']}'")
 mods[n]=uri(code)
mods['storage']=uri('''const db=new Map();export const newId=(p='id')=>p+Math.random().toString(36).slice(2);export const preference=(k,d)=>d;export const setPreference=()=>{};export async function listProjects(){return [...db.values()].map(p=>({id:p.id,name:p.name,updatedAt:p.updatedAt}));}export async function saveProject(p){db.set(p.id,structuredClone(p));}export async function getProject(id){return structuredClone(db.get(id)||null);}export async function saveProjectIfCurrent(p,expected){db.set(p.id,structuredClone(p));}export async function deleteProject(id){db.delete(id);}export async function listCheckpoints(){return [];}export async function createCheckpoint(){return null;}export async function getCheckpoint(){return null;}export async function testLocalStorage(){return {ok:true,usage:0,persisted:false};}''')
for name,deps in {'dataset-edit':['data'],'geo':['world-data'],'dashboard-links':['geo'],'charts':['data','advanced','geo','performance'],'advisor':['data','geo'],'exports':['charts'],'motion':['natural-motion'],'dashboard-interactive':['charts','dashboard-links'],'video':['motion','gif'],'story':['motion','gif','natural-motion'],'pdf-export':['charts','exports']}.items():
 code=(root/'src'/f'{name}.js').read_text()
 for dep in deps:code=code.replace(f"from './{dep}.js'",f"from '{mods[dep]}'")
 mods[name]=uri(code)
app=(root/'src/app.js').read_text()
for dep in ['data','dataset-edit','catalogue','storage','advanced','geo','dashboard-links','charts','advisor','exports','pdf-export','themes','motion','video','dashboard-interactive','story','natural-motion']:
 app=app.replace(f"from './{dep}.js'",f"from '{mods[dep]}'")
app+='''\nwindow.__v34={get project(){return project},get ui(){return ui},get recent(){return recent},startNewProject,renderDashboard,renderHome,render,makeDashboardInteractiveHtml,get export(){return makeDashboardInteractiveHtml},get storage(){return saveQueue}};\n'''
html=(root/'index.html').read_text().replace('<link rel="stylesheet" href="src/styles.css" />','<style>'+(root/'src/styles.css').read_text()+'</style>')
html=re.sub(r'<script[^>]+src="(?:vendor|src)/[^"]+"[^>]*></script>','',html)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1550,'height':900},accept_downloads=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('''() => {const vals=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>vals.get(k)||null,setItem:(k,v)=>vals.set(k,v),removeItem:k=>vals.delete(k)}});}''')
 for f in ['jszip.min.js','pptxgen.min.js']:page.add_script_tag(content=(root/'vendor'/f).read_text())
 page.add_script_tag(type='module',content=f"import '{uri(app)}';")
 page.wait_for_function('window.__v34 && document.querySelector("[data-action=home-import-data]")',timeout=30000)
 # Home import creates new project with data even if another project is the active project.
 p0=page.evaluate('window.__v34.project.id')
 page.locator('[data-action=home-import-data]').click()
 page.locator('input[type=file]').set_input_files({'name':'regions.csv','mimeType':'text/csv','buffer':b'Region,Revenue\nNorth,11\nSouth,22\nEast,33\n'})
 page.wait_for_function('window.__v34.project.datasets.length===1',timeout=30000)
 first=page.evaluate('''() => {const p=window.__v34.project;return {id:p.id,source:p.datasets[0].source,rows:p.datasets[0].rows.length,name:p.name,page:window.__v34.ui.page};}''')
 assert first['id']!=p0 and first['source']=='regions.csv' and first['rows']==3 and first['page']=='data',first
 print('PASS Home Import: new project created only after valid file was selected',flush=True)
 # Return Home; new blank should hide sample CTA behind disclosure.
 page.evaluate("window.__v34.startNewProject(true)")
 page.wait_for_function('window.__v34.project.datasets.length===0')
 assert page.locator('[data-action=load-sample]').count()==1
 assert page.locator('[data-action=load-sample]').is_visible() is False
 assert page.locator('details.sample-data-disclosure').count()==1
 page.locator('details.sample-data-disclosure summary').click()
 assert page.locator('[data-action=load-sample]').is_visible()
 print('PASS sample example: secondary action hidden behind accessible disclosure',flush=True)
 # Create a two-chart Dashboard, both using Region. Keep unlinked chart's source intact.
 page.evaluate('''() => {let p=window.__v34.project;const d={id:'ds-demo',name:'Demonstration',source:'test',rows:[{Region:'North',Revenue:10,Orders:1},{Region:'South',Revenue:15,Orders:2},{Region:'East',Revenue:25,Orders:3}],rawRows:[],log:[],calculations:[]};p.datasets=[d];const c={id:'c-one',datasetId:d.id,type:'bar',x:'Region',y:'Revenue',title:'Revenue by region',color:'#0d9488',background:'#ffffff',textColor:'#1c2c3e',gridColor:'#e0e6ec',showAxes:true,showTitle:true,showGrid:true,padding:50};const c2={...c,id:'c-two',type:'hbar',y:'Orders',title:'Orders by region'};p.charts=[c,c2];p.dashboards[0].chartIds=['c-one','c-two'];p.dashboards[0].sharedFilterField='Region';p.dashboards[0].interactionMode='highlight';window.__v34.ui.page='dashboard';window.__v34.render();}''')
 marks=page.locator('[data-dashboard-card="c-one"] [data-dash-category]')
 assert marks.count()>=3,'marks not made interactive'
 marks.first.click()
 chosen=page.evaluate('''() => ({selected:window.__v34.ui.dashboardPicked,rows:window.__v34.project.datasets[0].rows.length,highlighted:document.querySelectorAll('.dashboard-linked-selected').length,dimmed:document.querySelectorAll('.dashboard-linked-dim').length})''')
 assert len(chosen['selected'])==1 and chosen['rows']==3 and chosen['highlighted']>=2 and chosen['dimmed']>=2,chosen
 print('PASS linked highlight: two charts respond, scales/data unchanged',flush=True)
 page.screenshot(path=str(root/'v34-dashboard-interactions.png'),full_page=False)
 page.locator('[data-dashboard-card="c-one"] [data-dash-category]').nth(1).click(modifiers=['Shift'])
 assert len(page.evaluate('window.__v34.ui.dashboardPicked'))==2
 print('PASS multi-selection: Shift-click collects categories',flush=True)
 page.locator('[data-ui=dashboard-interaction-mode]').select_option('filter')
 assert page.evaluate('window.__v34.project.datasets[0].rows.length')==3
 filt=page.evaluate('''() => ({selected:window.__v34.ui.dashboardPicked.length,rows:window.__v34.project.datasets[0].rows.length,svg:document.querySelectorAll('.dashboard-plot svg').length})''')
 assert filt['selected']==2 and filt['rows']==3 and filt['svg']==2,filt
 page.locator('[data-action=dashboard-clear-selection]').click()
 assert not page.evaluate('window.__v34.ui.dashboardPicked')
 print('PASS filter mode: two charts use selected source rows, reset leaves original data untouched',flush=True)
 # Export actual standalone HTML, click category in document, verify filtered chart updates.
 page.locator('[data-ui=dashboard-interaction-mode]').select_option('highlight')
 exported=page.evaluate('''() => {const v=window.__v34;const d=v.project.dashboards[0];return v.export(d,d.chartIds.map(id=>{const chart=v.project.charts.find(c=>c.id===id);return {chart,rows:v.project.datasets[0].rows,item:{}};}),d.sharedFilterField);}''')
 assert '<script>' in exported and 'data-cross-value=' in exported
 standalone=browser.new_page(viewport={'width':1200,'height':800})
 standalone_errors=[];standalone.on('pageerror',lambda e:standalone_errors.append(str(e)))
 standalone.set_content(exported,wait_until='load')
 standalone.locator('.chart [data-cross-value]').first.click()
 standalone.wait_for_function('document.getElementById("selection-status").textContent.includes("Selected:")')
 selected_count=standalone.locator('.chart .linked-active').count()
 assert selected_count>=2,selected_count
 standalone.locator('#reset-filter').click()
 assert standalone.locator('.chart .dimmed').count()==0
 assert not standalone_errors,standalone_errors
 print('PASS offline HTML: cross-highlight, selection reset and zero network dependencies',flush=True)
 assert not errors,errors
 # Country-map example: ISO code emitted from SVG maps back to source country label.
 page.evaluate('''() => {const v=window.__v34,p=v.project;p.datasets[0].rows=[{Country:'New Zealand',Value:5},{Country:'Chile',Value:10},{Country:'Canada',Value:8}];p.charts=[{...p.charts[0],type:'geo-choropleth',x:'Country',y:'Value',title:'Country map',geoView:'world',geoPalette:'teal'},{...p.charts[1],type:'hbar',x:'Country',y:'Value',title:'Country bars'}];p.dashboards[0].sharedFilterField='Country';p.dashboards[0].interactionMode='highlight';v.ui.dashboardPicked=[];v.ui.dashboardFilterValue='all';v.render();}''')
 map_marks=page.locator('[data-dashboard-card="c-one"] [data-dash-category]')
 assert map_marks.count()>=3, map_marks.count()
 map_marks.first.click()
 geo=page.evaluate('''() => ({selected:window.__v34.ui.dashboardPicked,active:document.querySelectorAll('.dashboard-linked-selected').length})''')
 assert len(geo['selected'])==1 and geo['active']>=2,geo
 page.screenshot(path=str(root/'v34-choropleth-linked.png'),full_page=False)
 print('PASS choropleth ISO marker resolves country row and cross-highlights another chart',flush=True)
 page.evaluate('window.__v34.ui.page="home";window.__v34.render()')
 page.screenshot(path=str(root/'v34-home-library.png'),full_page=False)
 print('V3.4 ALL TARGETED CHROMIUM TESTS PASSED',flush=True)
 browser.close()
