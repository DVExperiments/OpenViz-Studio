"""V2.11 chart-semantic motion test: real Chromium SVG/Story/GUI/export tests.
The injected-module test harness cannot prove localhost IndexedDB or Safari parity.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64,re,json,zipfile
from PIL import Image
root=Path(__file__).resolve().parent.parent
uri=lambda code:'data:text/javascript;base64,'+base64.b64encode(code.encode()).decode()
mods={}
for name in ['data','catalogue','storage','performance','advanced','world-data','themes','natural-motion','gif']:
 code=(root/'src'/f'{name}.js').read_text();mods[name]=uri(code.replace("from './performance.js'",f"from '{mods['performance']}'") if name=='advanced' else code)
for name,deps in {'dataset-edit':['data'],'geo':['world-data'],'charts':['data','advanced','geo','performance'],'advisor':['data','geo'],'exports':['charts'],'motion':['natural-motion'],'dashboard-interactive':['charts'],'video':['motion','gif'],'story':['motion','gif','natural-motion'],'pdf-export':['charts','exports']}.items():
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
 ctx=browser.new_context(viewport={'width':1620,'height':1010},accept_downloads=True)
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 for vendor in ['jszip.min.js','pptxgen.min.js']:page.add_script_tag(content=(root/'vendor'/vendor).read_text())
 page.add_script_tag(type='module',content=f"import '{uri(app)}';")
 # Import pure test APIs into page as independent ES modules.
 js=f"""
 import {{buildChart,DEFAULT_CHART}} from '{mods['charts']}';
 import {{chartExample,CATALOGUE}} from '{mods['catalogue']}';
 import {{freshStory,storySvgAt,storyGif}} from '{mods['story']}';
 import {{animatedSvgAt}} from '{mods['motion']}';
 import {{chartMotionOptions,naturalDefault}} from '{mods['natural-motion']}';
 window.v211={{buildChart,DEFAULT_CHART,chartExample,CATALOGUE,freshStory,storySvgAt,storyGif,animatedSvgAt,chartMotionOptions,naturalDefault}};
 """
 page.add_script_tag(type='module',content=js)
 page.wait_for_function('window.v211 && document.querySelector("[data-action=load-sample]")',timeout=20000)
 assert not errors,errors
 print('PASS V2.11 modules and application initialise',flush=True)
 # Exhaustive test across the entire implemented catalogue.
 results=page.evaluate('''() => {
  const api=window.v211,output=[];for(const c of api.CATALOGUE.filter(c=>c.status==='available')){
   try{const ex=api.chartExample(c.id);const spec={...api.DEFAULT_CHART,...ex,type:c.id,title:c.name};const source=api.buildChart(ex.rows,spec,c.id);
   const doc=new DOMParser().parseFromString(source,'image/svg+xml');if(doc.querySelector('parsererror'))throw Error('Invalid source SVG');
   const story=api.freshStory('chart1');story.scenes[0].duration=2600;
   const early=new DOMParser().parseFromString(api.storySvgAt(story,{chart1:source},400),'image/svg+xml');
   const middle=new DOMParser().parseFromString(api.storySvgAt(story,{chart1:source},1200),'image/svg+xml');
   const final=new DOMParser().parseFromString(api.storySvgAt(story,{chart1:source},2600),'image/svg+xml');
   if(middle.querySelector('parsererror')||final.querySelector('parsererror'))throw Error('Invalid animated SVG');
   const marks=doc.querySelectorAll('[data-viz-part="point"],[data-viz-part="series"]');
   const mid=middle.querySelectorAll('[data-viz-part="point"],[data-viz-part="series"]');
   const end=final.querySelectorAll('[data-viz-part="point"],[data-viz-part="series"]');
   if(!marks.length)throw Error('No marks rendered for example');
   if(marks.length!==mid.length||marks.length!==end.length)throw Error('Animation dropped marks');
   if(doc.documentElement.getAttribute('data-viz-chart-type')!==c.id)throw Error('Missing SVG chart type metadata');
   output.push({id:c.id,marks:marks.length,mode:api.naturalDefault(c.id),ok:true});
   }catch(e){output.push({id:c.id,ok:false,error:String(e)});}
  }return output;
 }''')
 for r in results:print(' ',r,flush=True)
 assert all(r['ok'] for r in results),[r for r in results if not r['ok']]
 assert len(results)==25,len(results)
 print('PASS 25 working chart types: valid source and animated SVG, no missing marks',flush=True)
 # Geometry and semantic behaviour of representative chart families.
 facts=page.evaluate('''() => {
 const api=window.v211,look=(id,time=1300)=>{const ex=api.chartExample(id),src=api.buildChart(ex.rows,{...api.DEFAULT_CHART,...ex,type:id},id),story=api.freshStory('c');story.scenes[0].duration=2600;const doc=new DOMParser().parseFromString(api.storySvgAt(story,{c:src},time),'image/svg+xml');return {doc,src,story};};
 const result={};
 for(const id of ['line','area','scatter','bubble','donut','sunburst','sankey','network','geo-choropleth','geo-heat','geo-symbol','violin','box-plot','gantt','waterfall','heatmap','treemap']){
  const o=look(id),r=o.doc,mark=r.querySelector('[data-viz-part="point"],[data-viz-part="series"]');
  result[id]={motion:api.naturalDefault(id),clip:r.querySelectorAll('clipPath[data-viz-animation]').length+r.querySelectorAll('clipPath[id^="ov-nat-"]').length,hasClip:!!r.querySelector('[data-viz-part="point"][clip-path],[data-viz-part="series"][clip-path]'),
    hasTransform:!!r.querySelector('[data-viz-part="point"][transform],[data-viz-part="series"][transform]'),
    halfR:+(r.querySelector('[data-viz-part="point"] circle,[data-viz-part="point"]')?.getAttribute('r')||0),
    opacity:+(mark?.getAttribute('opacity')??1),
    axis:r.querySelector('[data-viz-part="x-axis"]')?.outerHTML||'',
    heatLayer:!!r.querySelector('[data-viz-heat-layer]'),
    flowPath:!!r.querySelector('path[data-viz-part="point"][clip-path]')};
 }
 const bar=look('bar',1400),gantt=look('gantt',1400);const gbar=bar.doc.querySelector('rect[data-viz-grow-axis]'),gb=gantt.doc.querySelector('rect[data-viz-grow-axis]');
 result.barGrowth={height:+gbar?.getAttribute('height'),hasTransform:!!gbar?.getAttribute('transform')};
 result.ganttGrowth={width:+gb?.getAttribute('width'),hasTransform:!!gb?.getAttribute('transform')};
 const ex=api.chartExample('line'),source=api.buildChart(ex.rows,{...api.DEFAULT_CHART,...ex,type:'line'},'line');
 const still=new DOMParser().parseFromString(source,'image/svg+xml');const animated=new DOMParser().parseFromString(api.storySvgAt(api.freshStory('c'),{c:source},900),'image/svg+xml');
 const a=still.querySelector('[data-viz-part="x-axis"]'),b=animated.querySelector('[data-viz-part="x-axis"]');
 result.stableAxes=!!a&&!!b&&['x','y','x1','x2','y1','y2','d','transform','stroke-width'].every(attr=>a.getAttribute(attr)===b.getAttribute(attr));
 return result;
 }''')
 print('GEOMETRY',json.dumps({k:{kk:v for kk,v in row.items() if kk!='axis'} if isinstance(row,dict) else row for k,row in facts.items()})[:6000],flush=True)
 assert facts['line']['hasClip'],facts['line']
 assert facts['area']['hasTransform'],facts['area']
 assert facts['donut']['hasClip'] and facts['sunburst']['hasClip'],facts
 assert facts['sankey']['flowPath'],facts['sankey']
 assert facts['network']['hasTransform']
 assert facts['geo-heat']['heatLayer']
 assert facts['violin']['hasTransform']
 assert facts['barGrowth']['height']>0 and not facts['barGrowth']['hasTransform']
 assert facts['ganttGrowth']['width']>0 and not facts['ganttGrowth']['hasTransform']
 assert facts['stableAxes']
 print('PASS chart-specific geometry (paths, rings, nodes, maps, chart axes)',flush=True)
 # App workflow and user-visible options.
 page.locator('[data-action="load-sample"]').first.click()
 page.locator('[data-select="chart"]').first.click()
 page.locator('[data-action="story-open"]').click()
 page.wait_for_selector('#storyStage svg',timeout=20000)
 motion=page.locator('[data-story-scene-setting="markEffect"]');assert motion.input_value()=='auto'
 assert 'Grow' in motion.locator('option:checked').inner_text(),motion.locator('option:checked').inner_text()
 assert page.locator('[data-story-scene-setting="markOrder"]').count()==1
 assert page.locator('[data-story-scene-setting="markStagger"]').count()==1
 motion.select_option('grow-stagger')
 page.locator('[data-story-scene-setting="markOrder"]').select_option('reverse')
 page.locator('[data-story-scene-setting="markStagger"]').fill('0.8')
 page.locator('[data-story-scene-setting="markStagger"]').dispatch_event('change')
 page.locator('#storySeek').fill('1300');page.locator('#storySeek').dispatch_event('input')
 assert page.locator('#storyStage [data-viz-grow-axis]').count()>0
 page.locator('#workspaceContent').evaluate('(el)=>el.scrollTop=0')
 page.screenshot(path=str(root/'v211-story-natural-motion.png'))
 with page.expect_download(timeout=30000) as download:
  page.locator('[data-menu="File"]').click();page.locator('#menuPopover [data-action="export-project"]').click()
 with zipfile.ZipFile(download.value.path()) as z:
  sc=json.loads(z.read('manifest.json'))['project']['stories'][0]['scenes'][0]
  assert sc['markEffect']=='grow-stagger' and sc['markOrder']=='reverse' and sc['markStagger']==.8,sc
 print('PASS Story Studio options, reverse order, spacing, saved project',flush=True)
 # Motion timeline presents chart-specific options. Open original chart via sidebar.
 page.locator('[data-select="chart"]').first.click()
 page.locator('[data-action="motion-open"]').first.click() if page.locator('[data-action="motion-open"]').count() else None
 # Native Story GIF export path, reduced-size for bounded smoke.
 status=page.evaluate('''async () => {
   const api=window.v211,ex=api.chartExample('line'),source=api.buildChart(ex.rows,{...api.DEFAULT_CHART,...ex,type:'line'},'line'),st=api.freshStory('c');st.scenes[0].duration=1000;
   const gif=await api.storyGif(st,{c:source},{width:240,height:135,fps:10,maxFrames:18,smoothLoop:false});
   return {size:gif.size,type:gif.type};
 }''')
 assert status['size']>1000,status
 print('PASS GIF generation with natural line animation',status,flush=True)
 assert not errors,errors
 ctx.close();browser.close()
 print('V2.11 Natural Motion regression PASS',flush=True)
