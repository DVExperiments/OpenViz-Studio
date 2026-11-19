# V3.60 axe audit: new templates in the editor, map library dialog, and standalone exports of quiz and poll.
import asyncio, json
from playwright.async_api import async_playwright
AXE=open('/tmp/axe/node_modules/axe-core/axe.min.js').read()
TAGS=['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']
async def audit(pg,name):
    if not await pg.evaluate("!!window.axe"): await pg.add_script_tag(content=AXE)
    r=await pg.evaluate("async t=>{const r=await axe.run(document,{runOnly:{type:'tag',values:t},resultTypes:['violations']});return r.violations.map(v=>[v.id,v.nodes.length,v.nodes[0].html.slice(0,160)])}",TAGS)
    print('==',name,r)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1440,'height':900},accept_downloads=True)
        await pg.goto('http://localhost:8765/',wait_until='networkidle'); await pg.wait_for_timeout(500)
        for n in ['Quiz','Poll','Number ticker','Countdown','Profile cards','Tree / org chart','Globe map','Spike map']:
            await pg.click('text=Open template library'); await pg.wait_for_timeout(300)
            await pg.fill('input[placeholder^="Search charts"]',n); await pg.wait_for_timeout(300)
            card=pg.locator('article, .template-card, [class*=card]').filter(has_text=n).filter(has=pg.locator('button:has-text("Try example")')).first
            await card.locator('button:has-text("Try example")').first.click(); await pg.wait_for_timeout(900)
            await audit(pg,'editor '+n)
            if n in ('Quiz','Poll'):
                await pg.click('#headerExport'); await pg.wait_for_timeout(700); await pg.wait_for_timeout(700); await pg.evaluate("()=>document.querySelector('#modalLayer [data-action=publish-open]')?.click()"); await pg.wait_for_timeout(700)
                async with pg.expect_download() as dl:
                    await pg.evaluate("()=>document.querySelector('[data-action=\"publish-download\"]').click()")
                path=str(await (await dl.value).path()); html=open(path,encoding='utf8').read(); f='/tmp/axe_'+n+'.html'; open(f,'w').write(html)
                p2=await b.new_page(); await p2.goto('file://'+f); await p2.wait_for_timeout(700); await audit(p2,'export '+n)
                await p2.keyboard.press('Tab'); await p2.keyboard.press('Tab')
                print('   focus after 2 tabs:',await p2.evaluate("()=>{const a=document.activeElement;return a.tagName+' '+(a.getAttribute('aria-label')||a.id||'')}"))
                await p2.close(); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
            await pg.click('[data-action="home"]'); await pg.wait_for_timeout(400)
        await pg.evaluate("()=>document.querySelector('[data-action=\"map-library-open\"]')?.click()"); await pg.wait_for_timeout(600)
        await pg.locator('[data-action="map-library-tab"]',has_text='Included outlines').click(); await pg.wait_for_timeout(400)
        await audit(pg,'map library outlines')
        await b.close()
asyncio.run(main())
