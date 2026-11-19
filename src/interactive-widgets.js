// V3.60 runtime for interactive templates (number ticker, countdown, quiz, poll). Self-contained so its
// source can be inlined into published HTML (see chart-interactions.js and live-runtime.js).
// Respects prefers-reduced-motion and works with the keyboard (Enter/Space on answers).
export function installInteractiveWidgets(root){
 if(!root||!root.querySelectorAll)return;const doc=root.ownerDocument||root,win=doc.defaultView||window;
 const reduce=!!(win.matchMedia&&win.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const parse=v=>{try{return JSON.parse(v);}catch(e){return null;}};
 let live=doc.getElementById('ov-widget-live');if(!live&&doc.body){live=doc.createElement('div');live.id='ov-widget-live';live.setAttribute('aria-live','polite');live.setAttribute('role','status');live.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';doc.body.appendChild(live);}
 const say=t=>{if(live){live.textContent='';setTimeout(()=>{live.textContent=t;},30);}};
 // Number tickers: count up once when visible.
 const tickers=[...root.querySelectorAll('[data-ov-ticker]')].filter(el=>!el.__ovDone);
 const run=el=>{if(el.__ovDone)return;el.__ovDone=true;const o=parse(el.getAttribute('data-ov-ticker'));if(!o)return;const fmt=v=>(o.prefix||'')+Number(v).toLocaleString(undefined,{minimumFractionDigits:o.places||0,maximumFractionDigits:o.places||0})+(o.suffix||'');const dur=(Number(o.duration)||0)*1000;if(reduce||dur<=0){el.textContent=fmt(o.to);return;}const t0=performance.now(),from=Number(o.from)||0,to=Number(o.to)||0;const step=t=>{const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=fmt(from+(to-from)*e);if(k<1)win.requestAnimationFrame(step);};el.textContent=fmt(from);win.requestAnimationFrame(step);};
 if(tickers.length){if('IntersectionObserver' in win){const io=new win.IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){io.unobserve(e.target);run(e.target);}},{threshold:.4});tickers.forEach(el=>io.observe(el));}else tickers.forEach(run);}
 // Countdowns: update every second while the page is open.
 const cds=[...root.querySelectorAll('[data-ov-countdown]')].filter(el=>!el.__ovTimer);
 for(const el of cds){const o=parse(el.getAttribute('data-ov-countdown'));if(!o)continue;const asof=el.ownerSVGElement?.querySelector?.('[data-ov-asof]')||root.querySelector('[data-ov-asof]');if(asof)asof.setAttribute('visibility','hidden');
  const name=(el.querySelector('[data-ov-caption]')?.textContent||'').replace(/^(until|since|Now)\s+/,'');
  const tick=()=>{if(!el.isConnected){clearInterval(el.__ovTimer);return;}let ms=o.target-Date.now();const past=ms<0;if(past&&o.after==='zero')ms=0;const a=Math.abs(ms),vals={days:Math.floor(a/864e5),hours:Math.floor(a%864e5/36e5),minutes:Math.floor(a%36e5/6e4),seconds:Math.floor(a%6e4/1e3)};if(o.units==='d')vals.days=Math.round(a/864e5);
   el.querySelectorAll('[data-ov-unit]').forEach(t=>{const u=t.getAttribute('data-ov-unit'),v=vals[u];t.textContent=u==='days'?String(v):String(v).padStart(2,'0');});const cap=el.querySelector('[data-ov-caption]');if(cap)cap.textContent=(past?(o.after==='zero'?'Now · ':'since '):'until ')+name;};
  tick();el.__ovTimer=setInterval(tick,1000);}
 // Quizzes: mark answers, reveal the correct one and the explanation, keep score.
 for(const quiz of root.querySelectorAll('[data-ov-quiz]')){if(quiz.__ovQuiz)continue;quiz.__ovQuiz=true;const total=quiz.querySelectorAll('[data-ov-question]').length;let score=0,answered=0;const scoreEl=quiz.querySelector('[data-ov-score]');
  const choose=opt=>{const q=opt.closest('[data-ov-question]');if(!q||q.getAttribute('data-ov-answered')==='true')return;q.setAttribute('data-ov-answered','true');const right=opt.getAttribute('data-ov-correct')==='1';answered++;if(right)score++;
   q.querySelectorAll('[data-ov-option]').forEach(o=>{const c=o.getAttribute('data-ov-correct')==='1',rect=o.querySelector('rect'),mark=o.querySelector('[data-ov-mark]');o.setAttribute('aria-disabled','true');o.style.cursor='default';if(c){rect.setAttribute('fill','#e3f4ec');rect.setAttribute('stroke','#1a7f4b');if(mark){mark.textContent='✓';mark.setAttribute('fill','#1a7f4b');}}else if(o===opt){rect.setAttribute('fill','#fdecea');rect.setAttribute('stroke','#b42318');if(mark){mark.textContent='✗';mark.setAttribute('fill','#b42318');}}else rect.setAttribute('fill-opacity','.55');});
   const ex=q.querySelector('[data-ov-explanation]');if(ex)ex.removeAttribute('visibility');if(scoreEl)scoreEl.textContent=`Score: ${score} / ${total}`+(answered===total?(score===total?' · Perfect!':' · Done'):'');say((right?'Correct. ':'Not quite. ')+(ex?.textContent||'')+` Score ${score} of ${total}.`);};
  quiz.addEventListener('click',e=>{const o=e.target.closest&&e.target.closest('[data-ov-option]');if(o)choose(o);});
  quiz.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const o=e.target.closest&&e.target.closest('[data-ov-option]');if(o){e.preventDefault();choose(o);}});}
 // Polls (guess and reveal): the reader's pick is highlighted and the published results appear. Nothing is sent anywhere.
 for(const poll of root.querySelectorAll('[data-ov-poll]')){if(poll.__ovPoll)continue;poll.__ovPoll=true;let chosen=null;
  const reveal=()=>{poll.setAttribute('data-ov-revealed','true');poll.querySelectorAll('[data-ov-choice]').forEach(c=>{const bar=c.querySelector('[data-ov-bar]'),val=c.querySelector('[data-ov-value]');if(!bar)return;const w=Number(bar.getAttribute('data-ov-bar'))||0;if(reduce){bar.setAttribute('width',w);}else{const t0=performance.now();const step=t=>{const k=Math.min(1,(t-t0)/600),e=1-Math.pow(1-k,3);bar.setAttribute('width',(w*e).toFixed(1));if(k<1)win.requestAnimationFrame(step);};win.requestAnimationFrame(step);}if(val){val.setAttribute('x',val.getAttribute('data-ov-x'));val.removeAttribute('visibility');}});};
  const choose=c=>{if(chosen)return;chosen=c;poll.querySelectorAll('[data-ov-choice]').forEach(o=>{o.setAttribute('aria-disabled','true');o.style.cursor='default';const bg=o.querySelector('[data-ov-choice-bg]');if(o===c&&bg){bg.setAttribute('stroke','#0f766e');bg.setAttribute('stroke-width','2');bg.setAttribute('fill','#e6f4f2');}});const note=poll.querySelector('[data-ov-poll-note]');const label=(c.getAttribute('aria-label')||'').replace(/^Choose:\s*/,'');if(note)note.textContent='You chose “'+label+'” · published results shown';if(poll.getAttribute('data-ov-revealed')!=='true')reveal();say('You chose '+label+'. Published results are now shown.');};
  poll.addEventListener('click',e=>{const c=e.target.closest&&e.target.closest('[data-ov-choice]');if(c)choose(c);});
  poll.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const c=e.target.closest&&e.target.closest('[data-ov-choice]');if(c){e.preventDefault();choose(c);}});}
}
// V3.60 fullscreen button for published pages and embeds (iframes need allowfullscreen, which the
// embed code now includes). Hidden when the browser or host page does not allow fullscreen.
export function installFullscreenButton(doc){
 doc=doc||document;if(!doc.body||doc.getElementById('ov-fullscreen')||!doc.fullscreenEnabled)return;
 const b=doc.createElement('button');b.id='ov-fullscreen';b.type='button';b.setAttribute('aria-label','Show full screen');b.title='Full screen';
 b.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
 b.style.cssText='position:fixed;top:10px;right:10px;z-index:50;display:grid;place-items:center;width:34px;height:34px;border:1px solid #c9d2dc;border-radius:8px;background:rgba(255,255,255,.92);color:#1b2733;cursor:pointer;opacity:.55;transition:opacity .15s';
 if(doc.documentElement.getAttribute('dir')==='rtl'){b.style.right='auto';b.style.left='10px';}
 b.addEventListener('mouseenter',()=>b.style.opacity='1');b.addEventListener('mouseleave',()=>b.style.opacity='.55');b.addEventListener('focus',()=>b.style.opacity='1');b.addEventListener('blur',()=>b.style.opacity='.55');
 const sync=()=>{const on=!!doc.fullscreenElement;b.setAttribute('aria-label',on?'Exit full screen':'Show full screen');b.title=on?'Exit full screen':'Full screen';doc.documentElement.style.background=on?'#ffffff':'';};
 b.addEventListener('click',()=>{if(doc.fullscreenElement)doc.exitFullscreen?.();else doc.documentElement.requestFullscreen?.().catch(()=>{});});
 doc.addEventListener('fullscreenchange',sync);
 const style=doc.createElement('style');style.textContent='@media print{#ov-fullscreen{display:none!important}}';doc.head?.appendChild(style);doc.body.appendChild(b);
}
