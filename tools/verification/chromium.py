import asyncio, json, sys
from playwright.async_api import async_playwright
ERR="window.__ovErrs=[];addEventListener('error',e=>__ovErrs.push(String(e.message||e)));addEventListener('unhandledrejection',e=>__ovErrs.push('rejection: '+String(e.reason&&e.reason.message||e.reason)));"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1440,'height':900}); await pg.add_init_script(ERR)
        cons=[]; pg.on('console',lambda m:cons.append(m.text) if m.type=='error' else None)
        await pg.goto('http://localhost:8765/',wait_until='networkidle'); await pg.wait_for_timeout(500)
        await pg.add_script_tag(path='tools/verification/selftest.js')
        r=json.loads(await pg.evaluate("__ovSelfTest()")); r['console']=cons[:10]
        json.dump(r,open('/tmp/xb-chromium.json','w'),indent=1); await b.close()
asyncio.run(main())
