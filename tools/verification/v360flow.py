import asyncio, sys, json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
SHOT='/tmp/v360shots/'
async def main():
    import os; os.makedirs(SHOT,exist_ok=True)
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1440,'height':950},accept_downloads=True)
        errs=[]; pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e))); pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        res={}
        async def act(name,extra=''):
            ok=await pg.evaluate("([n,x])=>{const el=[...document.querySelectorAll(`[data-action=\"${n}\"]${x}`)].find(e=>!e.disabled);if(!el)return false;el.click();return true;}",[name,extra])
            await pg.wait_for_timeout(600); return ok
        async def demo(name):
            await pg.click('text=Open template library'); await pg.wait_for_timeout(300)
            await pg.fill('input[placeholder^="Search charts"]', name); await pg.wait_for_timeout(300)
            card=pg.locator('article, .template-card, [class*=card]').filter(has_text=name).filter(has=pg.locator('button:has-text("Try example")')).first
            await card.locator('button:has-text("Try example")').first.click(timeout=4000); await pg.wait_for_timeout(900)
        svg=lambda: pg.locator('#liveChartSvg > svg').first
        async def home(): await pg.click('[data-action="home"]'); await pg.wait_for_timeout(400)
        await pg.goto(URL,wait_until='networkidle'); await pg.wait_for_timeout(500)
        await pg.evaluate("localStorage.setItem('openviz-all-settings','1')")

        # ---- templates and their interactivity inside the editor ----
        await demo('Quiz')
        opts=svg().locator('[data-ov-option]'); res['quiz options']=await opts.count()
        await opts.nth(1).click(); await pg.wait_for_timeout(300)
        res['quiz score']=await svg().locator('[data-ov-score]').text_content()
        res['quiz explanation shown']=await svg().locator('[data-ov-question="0"] [data-ov-explanation]').get_attribute('visibility') is None
        await opts.nth(4).focus(); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300)
        res['quiz keyboard answer']=await svg().locator('[data-ov-question="1"]').get_attribute('data-ov-answered')
        await svg().screenshot(path=SHOT+'quiz.png'); await home()

        await demo('Poll')
        poll=svg().locator('[data-ov-poll]'); res['poll hidden before']=await poll.get_attribute('data-ov-revealed')
        await svg().locator('[data-ov-choice]').nth(1).click(); await pg.wait_for_timeout(900)
        res['poll revealed']=await poll.get_attribute('data-ov-revealed')
        res['poll note']=await svg().locator('[data-ov-poll-note]').text_content()
        await svg().screenshot(path=SHOT+'poll.png'); await home()

        await demo('Number ticker')
        await pg.wait_for_timeout(2500)
        res['ticker type']=await svg().get_attribute('data-viz-chart-type')
        res['ticker values']=await svg().locator('[data-ov-ticker]').all_text_contents()
        res['ticker in page']=await pg.locator('[data-ov-ticker]').count()
        await svg().screenshot(path=SHOT+'ticker.png'); await home()

        await demo('Countdown')
        t1=await svg().locator('[data-ov-unit="seconds"]').first.text_content(); await pg.wait_for_timeout(1300)
        t2=await svg().locator('[data-ov-unit="seconds"]').first.text_content(); res['countdown ticks']=t1!=t2
        await svg().screenshot(path=SHOT+'countdown.png'); await home()

        for n,f in [('Profile cards','cards'),('Tree / org chart','tree')]:
            await demo(n); res[n+' marks']=await svg().locator('[data-viz-part="point"]').count(); await svg().screenshot(path=SHOT+f+'.png'); await home()

        # ---- globe ----
        await demo('Globe map')
        before=await svg().inner_html()
        rng=pg.locator('[data-setting="globeLon"]')
        res['globe control']=await rng.count()
        if await rng.count():
            await rng.evaluate("el=>{el.value='100';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}"); await pg.wait_for_timeout(800)
        res['globe turned']=before!=await svg().inner_html()
        det=pg.locator('[data-setting="geoDetail"]')
        if await det.count():
            await det.evaluate("el=>{el.value='detailed';el.dispatchEvent(new Event('change',{bubbles:true}))}"); await pg.wait_for_timeout(2500)
            res['detailed borders bigger']=len(await svg().inner_html())>len(before)
        await svg().screenshot(path=SHOT+'globe.png'); await home()

        # ---- spikes, dots, icons ----
        await demo('Spike map'); res['spikes']=await svg().locator('path[data-viz-part="point"]').count(); await svg().screenshot(path=SHOT+'spike.png')
        ms=pg.locator('[data-setting="geoMarkerStyle"]')
        if await ms.count():
            await ms.evaluate("el=>{el.value='icon';el.dispatchEvent(new Event('change',{bubbles:true}))}"); await pg.wait_for_timeout(800)
            res['icon grid']=await pg.locator('[data-action="marker-icon"]').count()
            await pg.locator('[data-action="marker-icon"]').nth(3).evaluate('el=>el.click()'); await pg.wait_for_timeout(800)
            res['icon markers']=await svg().locator('[data-viz-part="point"]').count()
            await svg().screenshot(path=SHOT+'icons.png')
        await home()
        await demo('Dot density map'); res['dot paths']=await svg().locator('path').count(); await svg().screenshot(path=SHOT+'dots.png'); await home()

        # ---- boundary library ----
        await pg.click('text=Open template library'); await pg.wait_for_timeout(300); await pg.keyboard.press('Escape')
        await act('map-library-open')
        if await pg.locator('#mapLibraryQuery').count():
            await pg.locator('[data-action="map-library-tab"]', has_text='Included outlines').click(); await pg.wait_for_timeout(400)
            await pg.fill('#mapLibraryQuery','California'); await pg.wait_for_timeout(400)
            res['library county hits']=await pg.locator('#mapLibraryCards [data-action]').count()
            res['library first card']=(await pg.locator('#mapLibraryCards').inner_text())[:300]
            res['library actions']=await pg.evaluate("()=>[...new Set([...document.querySelectorAll('#mapLibraryCards [data-action]')].map(e=>e.dataset.action))]")
            await pg.locator('#mapLibraryCards [data-action="map-resource-details"]').first.click(); await pg.wait_for_timeout(1500)
            res['details text']=(await pg.locator('#modalLayer').inner_text())[:160].replace('\n',' | ')
            await pg.locator('[data-action="map-resource-create"]').first.click(timeout=5000); await pg.wait_for_timeout(2500)
            res['county map shapes']=await svg().locator('path[data-viz-part="point"], path[data-region-id], path').count()
            await svg().screenshot(path=SHOT+'california.png')
        else: res['library open']=False
        await home()

        # ---- RTL + suggested description + newsroom styles on a bar chart ----
        await demo('Column chart')
        res['title inputs']=await pg.locator('[data-setting="title"]').count()
        await pg.evaluate("()=>{const el=document.querySelector('[data-setting=\"title\"]');el.value='المبيعات حسب المنطقة';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}"); await pg.wait_for_timeout(900)
        res['rtl svg']=await svg().get_attribute('data-rtl')
        await svg().screenshot(path=SHOT+'rtl.png')
        res['description button']=await act('use-auto-description')
        res['description filled']=await pg.evaluate("()=>{const el=document.querySelector('[data-setting=\"description\"],[data-setting=\"altText\"]');return el?el.value.slice(0,80):null}")
        await act('open-style-library'); txt=await pg.locator('#modalLayer').inner_text()
        res['newsroom styles']=sum(n in txt for n in ['Financial paper','Weekly briefing','Wire service','Public broadcaster','Data desk serif','Tabloid bold','Statistics office','Night desk'])
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)

        # ---- exported page: fullscreen button and RTL direction ----
        await pg.click('#headerExport'); await pg.wait_for_timeout(800); await pg.wait_for_timeout(800); await pg.evaluate("()=>document.querySelector('#modalLayer [data-action=publish-open]')?.click()"); await pg.wait_for_timeout(800)
        try:
            async with pg.expect_download(timeout=8000) as dl: await act('publish-download')
            path=await (await dl.value).path(); html=open(path,encoding='utf8').read(); open('/tmp/v360export.html','w').write(html)
            res['export dir rtl']='dir="rtl"' in html
            p2=await b.new_page(); await p2.goto('file:///tmp/v360export.html'); await p2.wait_for_timeout(800)
            res['export fullscreen button']=await p2.locator('#ov-fullscreen').count()
            await p2.close()
        except Exception as e: res['export']='ERR '+str(e)[:120]
        await pg.keyboard.press('Escape')
        print(json.dumps(res,ensure_ascii=False,indent=1)); print('ERRORS',errs[:20])
        await b.close()
asyncio.run(main())
