# Runs the in-page self-test in WebKitGTK (same engine family as Safari) via WebKitWebDriver.
import json, sys, time
from selenium import webdriver
from selenium.webdriver.webkitgtk.options import Options
from selenium.webdriver.webkitgtk.service import Service
url=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
limit=int(sys.argv[2]) if len(sys.argv)>2 else 0
o=Options(); o.binary_location='/usr/bin/MiniBrowser' if False else o.binary_location
o.set_capability('webkitgtk:browserOptions',{'args':['--automation','--headless'],'binary':'/usr/lib/x86_64-linux-gnu/webkit2gtk-4.1/MiniBrowser'})
d=webdriver.WebKitGTK(options=o,service=Service('/usr/bin/WebKitWebDriver'))
try:
    d.set_window_size(1440,900); d.get(url); time.sleep(2)
    d.execute_script("window.__ovErrs=[];addEventListener('error',e=>__ovErrs.push(String(e.message||e)));addEventListener('unhandledrejection',e=>__ovErrs.push('rejection: '+String(e.reason&&e.reason.message||e.reason)));")
    booted=d.execute_script("return !!document.querySelector('[data-menu]') && !!document.querySelector('#workspaceContent')")
    d.execute_script(open('tools/verification/selftest.js').read())
    d.set_script_timeout(1200)
    r=json.loads(d.execute_async_script("const done=arguments[arguments.length-1];__ovSelfTest({limit:%d}).then(done).catch(e=>done(JSON.stringify({fatal:String(e)})));"%limit))
    r['booted']=booted; r['ua']=d.execute_script('return navigator.userAgent')
    json.dump(r,open('/tmp/xb-webkit.json','w'),indent=1); print('ok')
finally:
    d.quit()
