import asyncio
from playwright.async_api import async_playwright
FOCUS="""(()=>{const e=document.activeElement;if(!e||e===document.body)return {tag:'body'};const cs=getComputedStyle(e);const ring=(cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>0)||cs.boxShadow!=='none';const r=e.getBoundingClientRect();
 return {tag:e.tagName.toLowerCase(),name:(e.getAttribute('aria-label')||e.textContent||e.value||e.placeholder||'').trim().slice(0,40),action:e.dataset.action||e.dataset.menu||e.id||'',ring,visible:r.width>0&&r.height>0,inModal:!!e.closest('#modalLayer, [role=dialog]')};})()"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1440,'height':900})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8765/',wait_until='networkidle'); await pg.wait_for_timeout(600)
        # 1 tab order from load
        stops=[]
        for i in range(25):
            await pg.keyboard.press('Tab'); stops.append(await pg.evaluate(FOCUS))
        print('first stops:', [s.get('name') or s.get('action') for s in stops[:8]])
        print('stops without visible focus ring:', [ (s['tag'],s['name'] or s['action']) for s in stops if s['tag']!='body' and not s['ring']])
        print('stops not visible on screen:', [ (s['tag'],s['name'] or s['action']) for s in stops if s['tag']!='body' and not s['visible']])
        # 2 open template library by keyboard and start an example
        await pg.locator('button:has-text("Open template library")').first.focus(); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(500)
        f=await pg.evaluate(FOCUS); print('focus after opening library:', f)
        await pg.keyboard.type('Column chart'); await pg.wait_for_timeout(300)
        for i in range(30):
            await pg.keyboard.press('Tab'); f=await pg.evaluate(FOCUS)
            if f.get('name')=='Try example': break
        print('reached Try example by Tab:', f.get('name')=='Try example', 'after', i+1, 'tabs')
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(900)
        print('editor open:', 'Column chart' in await pg.inner_text('#inspectorContent'))
        # 3 menu bar keyboard
        await pg.focus('[data-menu="Data"]'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(250)
        f1=await pg.evaluate(FOCUS); await pg.keyboard.press('ArrowDown'); f2=await pg.evaluate(FOCUS)
        print('menu: focus moves into menu:', f1.get('tag'), f1.get('name'), '->', f2.get('name'))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200); f3=await pg.evaluate(FOCUS)
        print('menu: Escape returns focus to', f3.get('action'), '| menu closed:', await pg.evaluate("!document.querySelector('#menuPopover:not([hidden])')||getComputedStyle(document.querySelector('#menuPopover')).display==='none'"))
        # 4 dialog focus management
        await pg.focus('[data-menu="Data"]'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(250)
        await pg.click('#menuPopover button:has-text("What-if parameters")'); await pg.wait_for_timeout(400)
        f=await pg.evaluate(FOCUS); print('dialog: initial focus inside dialog:', f.get('inModal'), f.get('name'))
        out=0
        for i in range(40):
            await pg.keyboard.press('Tab'); f=await pg.evaluate(FOCUS)
            if not f.get('inModal'): out+=1
        print('dialog: Tab left the dialog', out, 'times in 40 presses')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300); f=await pg.evaluate(FOCUS)
        print('dialog: Escape closes:', (await pg.inner_text('#modalLayer')).strip()=='' , '| focus returned to', f.get('action') or f.get('name'))
        # 5 command palette
        await pg.keyboard.press('Control+k'); await pg.wait_for_timeout(300); f=await pg.evaluate(FOCUS); print('palette focus:', f.get('tag'), f.get('inModal'))
        await pg.keyboard.type('dark'); await pg.wait_for_timeout(200); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300)
        print('palette ran command (theme):', await pg.evaluate("document.documentElement.dataset.theme||'light'"))
        await pg.keyboard.press('Control+k'); await pg.keyboard.type('light'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300)
        # 6 slider keyboard (parameters)
        await pg.evaluate("(()=>{const b=document.createElement('button');b.dataset.action='parameters-open';document.body.append(b);b.click();b.remove();})()"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{const b=document.createElement('button');b.dataset.action='param-save';document.body.append(b);b.click();b.remove();})()"); await pg.wait_for_timeout(400)
        await pg.evaluate("[...document.querySelectorAll('details')].forEach(d=>d.open=true)")
        if await pg.locator('[data-param-slider]').count():
            await pg.focus('[data-param-slider]'); v0=await pg.input_value('[data-param-slider]'); await pg.keyboard.press('ArrowRight'); await pg.keyboard.press('ArrowRight'); await pg.wait_for_timeout(300)
            print('slider by keyboard:', v0, '->', await pg.input_value('[data-param-slider]'), '| aria-valuetext', await pg.get_attribute('[data-param-slider]','aria-valuetext'))
        # 7 live publication keyboard drill + filter
        pub=await b.new_page(); await pub.goto('file:///tmp/live-pub.html'); await pub.wait_for_timeout(1000)
        stops=[]
        for i in range(12):
            await pub.keyboard.press('Tab'); stops.append(await pub.evaluate(FOCUS))
        print('live publication tab stops:', [ (s['tag'],s.get('name','')[:18]) for s in stops])
        print('live publication stops without focus ring:', [s.get('name') for s in stops if s['tag']!='body' and not s['ring']])
        print('errors', errs[:4]); await b.close()
asyncio.run(main())
