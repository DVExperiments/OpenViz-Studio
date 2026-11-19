// Engine-agnostic self-test: run inside the app page (any browser). Returns a JSON report.
window.__ovSelfTest=async function(opts={}){
 const wait=ms=>new Promise(r=>setTimeout(r,ms));const errs=window.__ovErrs||(window.__ovErrs=[]);
 const byText=(sel,t)=>[...document.querySelectorAll(sel)].find(e=>e.textContent.trim().includes(t));
 const act=async n=>{let el=[...document.querySelectorAll(`[data-action="${n}"]`)].find(e=>!e.disabled),tmp=!el;if(tmp){el=document.createElement('button');el.dataset.action=n;el.hidden=true;document.body.append(el);}el.click();if(tmp)el.remove();await wait(350);};
 const out={types:[],steps:{},errors:errs};
 const openLib=async()=>{await act('home');await wait(250);const b=byText('button','Open template library');b?.click();await wait(350);};
 const {CATALOGUE}=await import(new URL('src/catalogue.js',location.href).href);out.total=CATALOGUE.length;const limit=opts.limit||CATALOGUE.length;
 for(const [i,entry] of CATALOGUE.slice(0,limit).entries()){await openLib();const search=document.querySelector('input[placeholder^="Search charts"]');if(search){search.value=entry.name;search.dispatchEvent(new Event('input',{bubbles:true}));await wait(300);}
  const tries=[...document.querySelectorAll('button')].filter(b=>b.textContent.trim()==='Try example'&&(b.closest('.catalogue-card,article,li')?.textContent||'').includes(entry.name));
  if(!tries.length){out.types.push({i,id:entry.id,name:entry.name,marks:-1,note:'no example card'});continue;}
  const before=errs.length;tries[0].click();await wait(700);const svg=document.querySelector('#liveChartSvg svg');const marks=svg?svg.querySelectorAll('[data-viz-part="point"],[data-viz-part="mark"],rect,path,circle,td').length:document.querySelectorAll('#liveChartSvg td, #workspaceContent table td').length;
  const box=svg?svg.getBoundingClientRect():{width:0,height:0};out.types.push({i,id:entry.id,name:entry.name,marks,w:Math.round(box.width),h:Math.round(box.height),errors:errs.length-before});}
 // other screens
 await openLib();{const sr=document.querySelector('input[placeholder^="Search charts"]');if(sr){sr.value='Column chart';sr.dispatchEvent(new Event('input',{bubbles:true}));await wait(300);}}[...document.querySelectorAll('button')].filter(b=>b.textContent.trim()==='Try example')[0]?.click();await wait(700);out.base=document.querySelector('#inspectorContent')?.innerText.slice(0,60);
 const step=async(name,fn)=>{const before=errs.length;try{out.steps[name]=await fn();}catch(e){out.steps[name]='THREW '+e.message;}if(errs.length>before)out.steps[name]+=` (+${errs.length-before} errors)`;};
 await step('data page',async()=>{await act('to-data');await wait(300);return document.querySelectorAll('table tbody tr').length+' rows';});
 await step('publish live preview',async()=>{await act('to-visualise');await wait(300);document.querySelector('#headerExport')?.click();await wait(700);const s=document.querySelector('#publishInteractive');if(s){s.value='live';s.dispatchEvent(new Event('change',{bubbles:true}));}await wait(1500);const f=document.querySelector('#publishPreview');const d=f?.contentDocument;if(!f)return 'no preview; modal: '+(document.querySelector('#modalLayer')?.innerText||'').slice(0,60);const src=f.srcdoc||'';return /OpenVizLive/.test(src)?'live preview built (sandboxed iframe)':d?`${d.querySelectorAll('.ovl-card svg').length} live charts`:'preview without live runtime';});
 await step('close publish',async()=>{await act('close-modal');return 'ok';});
 await step('dashboard',async()=>{await act('to-dashboard');await wait(300);return document.querySelectorAll('.dashboard-card').length+' cards';});
 await step('slides',async()=>{await act('to-present');await act('add-slide');await act('add-text');return document.querySelectorAll('#slideCanvas [data-object-id], #slideCanvas .slide-object').length+' objects';});
 await step('story',async()=>{await act('story-new');await act('story-add-scene');return document.querySelectorAll('[data-action="story-select-scene"]').length+' scenes';});
 await step('close modal',async()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await act('close-modal');return document.querySelector('#modalLayer')?.innerText.trim().length?'still open':'closed';});
 await step('parameters dialog',async()=>{await act('parameters-open');const n=document.querySelectorAll('[data-param-index]').length;await act('close-modal');return n+' rows';});
 await step('png export',async()=>{let got='';const orig=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){got=this.download||this.href.slice(0,30);};try{await act('export-png');await wait(1500);}finally{HTMLAnchorElement.prototype.click=orig;}return got||'no download';});
 return JSON.stringify(out);
};
