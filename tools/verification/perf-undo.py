import asyncio, sys
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--enable-precise-memory-info','--js-flags=--expose-gc'])
        pg=await b.new_page(viewport={'width':1440,'height':900}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(URL,wait_until='networkidle'); await pg.wait_for_timeout(400)
        async with pg.expect_file_chooser() as fc:
            await pg.evaluate("(()=>{const b=document.createElement('button');b.dataset.action='import-data';document.body.append(b);b.click();b.remove();})()")
        await (await fc.value).set_files('/tmp/perf-100k.csv'); await pg.wait_for_timeout(1500)
        await pg.evaluate("[...document.querySelectorAll('[data-action=add-chart]')].find(x=>x.offsetParent).click()"); await pg.wait_for_timeout(600)
        await pg.fill('#modalLayer input[placeholder^="Search charts"]','Column chart'); await pg.wait_for_timeout(300)
        await pg.locator('#modalLayer [data-action="chooser-select"]').first.click(); await pg.wait_for_timeout(1500)
        await pg.evaluate("[...document.querySelectorAll('details')].forEach(d=>d.open=true)")
        heap=lambda: pg.evaluate("(window.gc&&gc(),Math.round(performance.memory.usedJSHeapSize/1048576))")
        h0=await heap()
        times=await pg.evaluate("""(async()=>{const out=[];for(let i=0;i<20;i++){const s=document.querySelector('[data-setting="refLineMode"]');const a=performance.now();s.value=i%2?'none':'average';s.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));out.push(performance.now()-a);await new Promise(r=>setTimeout(r,50));}return out;})()""")
        h1=await heap()
        times.sort(); print(f'20 edits on a 100k-row project: median {round(times[10])}ms, max {round(times[-1])}ms; heap {h0}MB -> {h1}MB')
        # undo correctness after a cell edit
        await pg.evaluate("(()=>{const b=document.createElement('button');b.dataset.action='to-data';document.body.append(b);b.click();b.remove();})()"); await pg.wait_for_timeout(800)
        cell=pg.locator('[data-cell-row="0"]').nth(3); before=(await cell.inner_text()).strip()
        await cell.dblclick() ; await pg.keyboard.press('Control+a'); await pg.keyboard.type('12345'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(500)
        after=(await pg.locator('[data-cell-row="0"]').nth(3).inner_text()).strip()
        a=performance=None
        await pg.evaluate("(()=>{const b=document.createElement('button');b.dataset.action='undo';document.body.append(b);b.click();b.remove();})()"); await pg.wait_for_timeout(1200)
        undone=(await pg.locator('[data-cell-row="0"]').nth(3).inner_text()).strip()
        await pg.evaluate("(()=>{const b=document.createElement('button');b.dataset.action='redo';document.body.append(b);b.click();b.remove();})()"); await pg.wait_for_timeout(1200)
        redone=(await pg.locator('[data-cell-row="0"]').nth(3).inner_text()).strip()
        print('cell edit', repr(before),'->',repr(after),'| undo ->',repr(undone),'| redo ->',repr(redone))
        print('errors',errs[:3]); await b.close()
asyncio.run(main())
