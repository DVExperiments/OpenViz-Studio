# Builds one project with several chart types on slides and downloads every export format.
import asyncio, os, shutil
from playwright.async_api import async_playwright
OUT='/tmp/exports'
async def main():
    shutil.rmtree(OUT,ignore_errors=True); os.makedirs(OUT)
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1440,'height':900},accept_downloads=True); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        async def act(n,extra=None):
            await pg.evaluate("([n,id])=>{const b=document.createElement('button');b.dataset.action=n;if(id)b.dataset.id=id;document.body.append(b);b.click();b.remove();}",[n,extra]); await pg.wait_for_timeout(600)
        async def dl(action,name,timeout=40000,before=None):
            async with pg.expect_download(timeout=timeout) as d:
                if before: await before()
                await act(action)
            f=await d.value; path=os.path.join(OUT,name+os.path.splitext(f.suggested_filename)[1]); await f.save_as(path); return path
        await pg.goto('http://localhost:8765/',wait_until='networkidle'); await pg.wait_for_timeout(500)
        types=['bar','combo','pie','line','bar-race','geo-choropleth','sankey','editorial-table','kpi']
        await pg.click('text=Open template library'); await pg.wait_for_timeout(300)
        await pg.fill('input[placeholder^="Search charts"]','Column chart'); await pg.wait_for_timeout(300)
        await pg.locator('button:has-text("Try example")').first.click(); await pg.wait_for_timeout(900)
        for t in types[1:]:
            await act('to-visualise')
            await pg.click('[data-menu="Insert"]'); await pg.click('#menuPopover button:has-text("Browse chart catalogue")'); await pg.wait_for_timeout(500)
            btn=pg.locator(f'#modalLayer [data-action="catalogue-demo-create"][data-type="{t}"]')
            if not await btn.count():
                await pg.fill('#catalogueQuery', t.replace('-',' ')); await pg.wait_for_timeout(300)
            if await btn.count(): await btn.first.click(); await pg.wait_for_timeout(1000)
            else: print('no demo button', t)
            await act('close-modal')
        n=await pg.evaluate("document.querySelectorAll('[data-action=select-chart], .project-tree [data-chart-id], [data-action=\"open-chart\"]').length")
        charts=await pg.evaluate("JSON.stringify([...document.querySelectorAll('[data-chart-id]')].map(e=>e.dataset.chartId).filter((v,i,a)=>a.indexOf(v)===i))")
        print('charts in project (tree items):', n, charts[:120])
        # brand logo for slides
        await act('brand-open'); await act('brand-example'); await pg.set_input_files('#brandLogoInput','examples/logo.svg'); await pg.wait_for_timeout(600); await act('brand-apply-all'); await pg.wait_for_timeout(600); await act('close-modal')
        # a slide per chart
        ids=await pg.evaluate("(()=>{try{return JSON.parse(localStorage.getItem('__noop')||'null')}catch(e){return null}})()")
        await act('to-present'); await pg.wait_for_timeout(400)
        chart_ids=await pg.evaluate("[...new Set([...document.querySelectorAll('[data-chart-id],[data-id]')].map(e=>e.dataset.chartId||'').filter(Boolean))]")
        await act('add-chart-slide'); await pg.wait_for_timeout(400)
        choices=await pg.evaluate("[...document.querySelectorAll('#modalLayer [data-action=add-chart-slide-id]')].map(b=>b.dataset.id)")
        await act('close-modal')
        print('chart choices for slides:', len(choices))
        for k,cid in enumerate(choices):
            if k>0: await act('add-slide')
            await act('add-chart-slide-id',cid); await pg.wait_for_timeout(500)
        await act('add-slide'); await act('add-text'); await pg.wait_for_timeout(300)
        # logo on all slides
        await pg.click('#slideCanvas',position={'x':4,'y':4}); await pg.wait_for_timeout(300)
        if await pg.locator('[data-slide-logo="position"]').count(): await pg.select_option('[data-slide-logo="position"]','bottom-right'); await pg.wait_for_timeout(400)
        paths={}
        paths['pptx']=await dl('export-pptx','deck',60000)
        # second deck: every slide chart set to "Editable" (native PowerPoint charts where supported)
        thumbs=await pg.locator('.slide-thumb').count(); set_editable=0
        for k in range(thumbs):
            await pg.locator('.slide-thumb').nth(k).click(); await pg.wait_for_timeout(300)
            objs=pg.locator('#slideCanvas .slide-object.chart')
            for j in range(await objs.count()):
                await objs.nth(j).click(); await pg.wait_for_timeout(250)
                sel=pg.locator('[data-object-setting="pptxMode"]')
                if await sel.count(): await sel.select_option('editable'); set_editable+=1; await pg.wait_for_timeout(250)
        print('chart objects set to editable:', set_editable)
        paths['pptx-editable']=await dl('export-pptx','deck-editable',60000)
        async def pdfopen(): await act('export-pdf-dialog')
        paths['pdf']=await dl('export-pdf-start','deck',60000,pdfopen); await act('close-modal')
        await act('to-visualise'); await pg.wait_for_timeout(500)
        paths['png']=await dl('export-png','chart')
        paths['svg']=await dl('export-svg','chart')
        paths['openviz']=await dl('export-project','project')
        await pg.click('#headerExport'); await pg.wait_for_timeout(800); paths['html']=await dl('publish-download','publication'); await act('close-modal')
        for k,v in paths.items(): print(k, v, os.path.getsize(v))
        print('errors', errs[:4]); await b.close()
asyncio.run(main())
