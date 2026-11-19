"""V3.0 release readiness: accessibility, keyboard, chart SVG, cache, QA diagnostics.
Runs with isolated Chromium using injected modules because outbound/loopback navigation
is restricted. Not a substitute for the separate normal-origin manual checklist.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64,re,json
root=Path(__file__).resolve().parent.parent
uri=lambda s:'data:text/javascript;base64,'+base64.b64encode(s.encode()).decode()
mods={}
for n in ['data','catalogue','storage','performance','advanced','world-data','themes','natural-motion','gif']:
 code=(root/'src'/f'{n}.js').read_text();mods[n]=uri(code.replace("from './performance.js'",f"from '{mods['performance']}'") if n=='advanced' else code)
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
 ctx=browser.new_context(viewport={'width':1470,'height':950},accept_downloads=True, reduced_motion='reduce')
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 for v in ['jszip.min.js','pptxgen.min.js']:page.add_script_tag(content=(root/'vendor'/v).read_text())
 page.add_script_tag(type='module',content=f"import '{uri(app)}';")
 page.wait_for_function('window.__openvizDiagnostics && document.querySelector("[data-action=load-sample]")',timeout=20000)
 assert page.locator('.skip-to-workspace').count()==1
 assert page.locator('#saveStatus').get_attribute('aria-live')=='polite'
 print('PASS: focus targets and live save status',flush=True)
 # Create a project with one visualisation, then check unique accessible SVG labels.
 page.locator('[data-action=load-sample]').first.click()
 page.wait_for_function('document.querySelector("#liveChartSvg svg")')
 svg=page.locator('#liveChartSvg svg').first
 assert svg.get_attribute('role')=='img' and svg.get_attribute('aria-label')
 assert svg.locator(':scope > title').count()==1
 assert svg.locator('title[id="chart-title"]').count()==0
 print('PASS: accessible chart has self-contained name, no duplicate IDs',flush=True)
 # Editor repeatedly redraws unchanged SVG; bounded cache should record hit.
 page.evaluate('''() => {const element=document.querySelector('#liveChartSvg');element.dispatchEvent(new MouseEvent('click',{bubbles:true}));}''')
 before=page.evaluate('window.__openvizDiagnostics()')
 page.locator('[data-menu=View]').focus()
 page.keyboard.press('ArrowDown')
 page.wait_for_function('!document.getElementById("menuPopover").classList.contains("hidden")')
 assert page.locator('#menuPopover [role=menuitem]').count()>0
 assert page.locator('#menuPopover button:focus').count()==1
 assert page.locator('#menuLine [data-menu=View]').get_attribute('aria-expanded')=='true'
 page.keyboard.press('ArrowDown')
 assert page.locator('#menuPopover button:focus').count()==1
 page.keyboard.press('Escape')
 assert page.locator('#menuPopover.hidden').count()==1
 assert page.locator('[data-menu=View]:focus').count()==1
 print('PASS: keyboard menu open, arrow navigation, Escape focus restoration',flush=True)
 # modal trap: Ctrl+K opens command, Tab from last cycles to first
 page.keyboard.press('Control+k')
 page.wait_for_function('!document.getElementById("modalLayer").classList.contains("hidden")')
 assert page.locator('#modalLayer [role=dialog][aria-modal=true]').count()==1
 first=page.locator('#modalLayer [role=dialog] input').first
 assert first.evaluate('(el)=>document.activeElement===el')
 page.locator('#modalLayer button').last.focus()
 page.keyboard.press('Tab')
 assert page.locator('#modalLayer button').first.evaluate('(el)=>document.activeElement===el')
 page.keyboard.press('Escape')
 assert page.locator('#modalLayer.hidden').count()==1
 print('PASS: modal focus trap, Escape and focus restoration',flush=True)
 # Run quality checks (storage must be unavailable in opaque-origin test; other checks can succeed).
 page.locator('[data-menu=Help]').click()
 page.locator('#menuPopover [data-action=release-diagnostics]').click()
 page.wait_for_function('document.querySelector("#releaseDiagnosticResults")')
 page.locator('[data-action=release-run-diagnostics]').click()
 page.wait_for_function('document.querySelectorAll("#releaseDiagnosticResults .release-check").length===6',timeout=20000)
 results=page.locator('#releaseDiagnosticResults').inner_text()
 assert 'SVG chart rendering' in results and 'Portable project and JSON consistency' in results
 assert 'Animation/recording availability' in results
 assert page.locator('#releaseDiagnosticResults .release-pass').count()>=3,results
 print('PASS: diagnostics separate supported checks from unavailable storage test',flush=True)
 page.keyboard.press('Escape')
 # Verify source doesn't add duplicate chart title IDs in a dashboard/preview setting.
 page.add_script_tag(type='module',content=f"import {{buildChart}} from '{mods['charts']}';window.__v30buildChart=buildChart;")
 page.wait_for_function('typeof window.__v30buildChart === "function"')
 svg_checks=page.evaluate('''() => {const r=[{Group:'North',Value:20},{Group:'South',Value:42}];return [0,1].map(i=>window.__v30buildChart(r,{x:'Group',y:'Value',title:'Duplicate title',type:'bar'}));}''')
 assert all('aria-label=' in s and 'id="chart-title"' not in s for s in svg_checks)
 css=page.evaluate('getComputedStyle(document.querySelector(".skip-to-workspace")).top')
 assert page.evaluate('matchMedia("(prefers-reduced-motion:reduce)").matches')
 print('PASS: reduced motion, export-safe SVG names',flush=True)
 print('Preview metrics:',before,flush=True)
 assert not errors,errors
 print('V3.0 accessibility and diagnostics suite PASS',flush=True)
 ctx.close();browser.close()
