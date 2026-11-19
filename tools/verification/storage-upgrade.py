import asyncio, subprocess, time, shutil
from playwright.async_api import async_playwright
def serve(dir_):
    return subprocess.Popen(['python3','-m','http.server','8774'],cwd=dir_,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
async def main():
    shutil.rmtree('/tmp/upgrade-profile',ignore_errors=True)
    async with async_playwright() as p:
        srv=serve('/tmp/base359'); time.sleep(1)
        ctx=await p.chromium.launch_persistent_context('/tmp/upgrade-profile',executable_path='/usr/bin/google-chrome',args=['--no-sandbox'],viewport={'width':1440,'height':900})
        pg=await ctx.new_page(); await pg.goto('http://localhost:8774/',wait_until='networkidle'); await pg.wait_for_timeout(500)
        await pg.click('text=Open template library'); await pg.wait_for_timeout(300); await pg.locator('button:has-text("Try example")').nth(2).click(); await pg.wait_for_timeout(2500)
        print('old build saved:', await pg.inner_text('#saveStatus'), '| db version', await pg.evaluate("new Promise(r=>{const q=indexedDB.open('openviz-studio-v1');q.onsuccess=()=>{r(q.result.version);q.result.close();}})"))
        await ctx.close(); srv.terminate(); time.sleep(.5)
        shutil.rmtree('/tmp/upgrade-profile/Default/Cache',ignore_errors=True); shutil.rmtree('/tmp/upgrade-profile/Default/Code Cache',ignore_errors=True)
        srv=serve('/home/claude/src'); time.sleep(1)
        ctx=await p.chromium.launch_persistent_context('/tmp/upgrade-profile',executable_path='/usr/bin/google-chrome',args=['--no-sandbox'],viewport={'width':1440,'height':900})
        pg=await ctx.new_page(); cdp=await ctx.new_cdp_session(pg); await cdp.send('Network.setCacheDisabled',{'cacheDisabled':True}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8774/',wait_until='networkidle'); await pg.wait_for_timeout(1500)
        print('new build db version', await pg.evaluate("new Promise(r=>{const q=indexedDB.open('openviz-studio-v1');q.onsuccess=()=>{r([q.result.version,[...q.result.objectStoreNames].join(',')]);q.result.close();}})"))
        print('restored project text:', (await pg.evaluate("document.body.innerText.includes('Column chart')")))
        # edit and save
        await pg.evaluate("(()=>{const b=document.createElement('button');b.dataset.action='to-visualise';document.body.append(b);b.click();b.remove();})()"); await pg.wait_for_timeout(400)
        await pg.evaluate("[...document.querySelectorAll('details')].forEach(d=>d.open=true)")
        await pg.select_option('[data-setting="refLineMode"]','average'); await pg.wait_for_timeout(2500)
        print('save after upgrade:', await pg.inner_text('#saveStatus'))
        await pg.evaluate("(()=>{const b=document.createElement('button');b.dataset.action='home';document.body.append(b);b.click();b.remove();})()"); await pg.wait_for_timeout(800)
        print('project list entries:', await pg.evaluate("document.querySelectorAll('[data-action=open-project], [data-project-id]').length"))
        await pg.reload(wait_until='networkidle'); await pg.wait_for_timeout(1200)
        await pg.evaluate("(()=>{const b=document.createElement('button');b.dataset.action='to-visualise';document.body.append(b);b.click();b.remove();})()"); await pg.wait_for_timeout(600)
        await pg.evaluate("[...document.querySelectorAll('details')].forEach(d=>d.open=true)")
        print('edit persisted:', await pg.input_value('[data-setting="refLineMode"]'))
        print('errors', errs[:3]); await ctx.close(); srv.terminate()
asyncio.run(main())
