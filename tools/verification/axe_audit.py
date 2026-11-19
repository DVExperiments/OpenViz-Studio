import asyncio, json, sys
from playwright.async_api import async_playwright
AXE=open('/tmp/axe/node_modules/axe-core/axe.min.js').read()
URL='http://localhost:8765/'
TAGS=['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']
async def audit(pg,name,results,context='document'):
    if not await pg.evaluate("!!window.axe"): await pg.add_script_tag(content=AXE)
    r=await pg.evaluate("async ([ctx,tags])=>{const res=await axe.run(ctx==='document'?document:document.querySelector(ctx),{runOnly:{type:'tag',values:tags},resultTypes:['violations']});return res.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,n:v.nodes.length,targets:v.nodes.slice(0,40).map(n=>n.target.join(' ')+(v.id==='color-contrast'?' :: '+(n.any[0]?.data?`${n.any[0].data.fgColor} on ${n.any[0].data.bgColor} = ${n.any[0].data.contrastRatio} need ${n.any[0].data.expectedContrastRatio}`:''):'')),summary:v.nodes[0]?.failureSummary?.slice(0,220)}));}",[context,TAGS])
    results[name]=r
async def main():
    only=sys.argv[1:]
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1440,'height':900})
        async def act(n):
            await pg.evaluate("n=>{let el=[...document.querySelectorAll(`[data-action=\"${n}\"]`)].find(e=>!e.disabled);let t=!el;if(t){el=document.createElement('button');el.dataset.action=n;el.hidden=true;document.body.append(el);}el.click();if(t)el.remove();}",n); await pg.wait_for_timeout(500)
        res={}
        await pg.goto(URL,wait_until='networkidle'); await pg.wait_for_timeout(600)
        await audit(pg,'home',res)
        await pg.click('text=Open template library'); await pg.wait_for_timeout(400); await audit(pg,'template library',res)
        await pg.fill('input[placeholder^="Search charts"]','Column chart'); await pg.wait_for_timeout(300)
        await pg.locator('button:has-text("Try example")').first.click(); await pg.wait_for_timeout(900)
        await audit(pg,'chart editor',res)
        await act('to-data'); await pg.wait_for_timeout(500); await audit(pg,'data page',res)
        await act('to-visualise'); await pg.wait_for_timeout(400)
        await act('dashboard-add'); await pg.locator('#modalLayer [data-action="dashboard-add-id"]').first.click(); await pg.wait_for_timeout(400)
        await act('to-dashboard'); await pg.wait_for_timeout(500); await audit(pg,'dashboard',res)
        await act('to-present'); await act('add-text'); await pg.wait_for_timeout(400); await audit(pg,'slides',res)
        await act('story-new'); await pg.wait_for_timeout(500); await audit(pg,'story studio',res)
        await act('to-visualise'); await pg.wait_for_timeout(400)
        await pg.click('#headerExport'); await pg.wait_for_timeout(900); await pg.wait_for_timeout(900); await pg.evaluate("()=>document.querySelector('#modalLayer [data-action=publish-open]')?.click()"); await pg.wait_for_timeout(900); await audit(pg,'publishing studio',res); await act('close-modal')
        await act('parameters-open'); await audit(pg,'parameters dialog',res); await act('close-modal')
        await act('brand-open'); await audit(pg,'organisation theme',res); await act('close-modal')
        await act('live-connect'); await audit(pg,'live data dialog',res); await act('close-modal')
        await act('expression'); await audit(pg,'calculated field dialog',res); await act('close-modal')
        await act('open-storage'); await pg.wait_for_timeout(600); await audit(pg,'storage centre',res); await act('close-modal')
        await pg.keyboard.press('Control+k'); await pg.wait_for_timeout(400); await audit(pg,'command palette',res); await pg.keyboard.press('Escape')
        await act('theme') ; await pg.wait_for_timeout(400); await audit(pg,'chart editor (dark)',res); await act('theme')
        await pg.click('[data-menu="Insert"]'); await pg.click('#menuPopover button:has-text("Browse chart catalogue")'); await pg.wait_for_timeout(500); await audit(pg,'chart catalogue',res); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
        await act('home'); await pg.click('text=Open template library'); await pg.wait_for_timeout(300); await pg.fill('input[placeholder^="Search charts"]','Editorial table'); await pg.wait_for_timeout(300)
        await pg.locator('button:has-text("Try example")').first.click(); await pg.wait_for_timeout(900); await audit(pg,'editorial table editor',res)
        await pg.click('#headerExport'); await pg.wait_for_timeout(800); await pg.wait_for_timeout(800); await pg.evaluate("()=>document.querySelector('#modalLayer [data-action=publish-open]')?.click()"); await pg.wait_for_timeout(800)
        async with pg.expect_download(timeout=20000) as dl: await act('publish-download')
        html=open(await (await dl.value).path(),encoding='utf8').read(); open('/tmp/standalone.html','w').write(html); await act('close-modal')
        # published outputs
        st=await b.new_page(viewport={'width':1280,'height':900}); await st.goto('file:///tmp/standalone.html'); await st.wait_for_timeout(1000); await audit(st,'standalone HTML (editorial table)',res)
        pub=await b.new_page(viewport={'width':1280,'height':900})
        await pub.goto('file:///tmp/live-pub.html'); await pub.wait_for_timeout(1200); await audit(pub,'live publication',res)
        json.dump(res,open('/tmp/axe-results.json','w'),indent=1)
        total={}
        for k,v in res.items():
            print(f'== {k}: {len(v)} rules, {sum(x["n"] for x in v)} nodes')
            for x in v: print(f'   {x["impact"]:9} {x["id"]} ×{x["n"]} — {x["targets"][:2]}')
        await b.close()
asyncio.run(main())
