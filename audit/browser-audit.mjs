import { Browser, sleep } from 'file:///C:/Users/sahil/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve('audit');
fs.mkdirSync(out, { recursive: true });
const origin = 'http://127.0.0.1:3000';
const browser = await Browser.launch();
const report = { routes: [], reproductions: {}, api: [] };
const p = await browser.newPage();
await p.send('Network.enable');
await p.send('Network.setBlockedURLs', { urls: ['*googletagmanager.com*', '*google-analytics.com*', '*maps.google.com*'] });
const networkErrors = [];
browser.on(p.sessionId, 'Network.responseReceived', ({ response }) => {
  if (response.url.startsWith(origin) && response.status >= 400) networkErrors.push({ url: response.url, status: response.status });
});
const metrics = () => {
  const visible = e => { const r=e.getBoundingClientRect(); const s=getComputedStyle(e); return r.width>0 && r.height>0 && s.visibility!=='hidden' && s.display!=='none'; };
  return {
    path: location.pathname, width: innerWidth, title: document.title,
    h1: [...document.querySelectorAll('h1')].map(e=>e.textContent.trim()),
    scrollWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth,
    brokenImages: [...document.images].filter(e=>e.complete && !e.naturalWidth).map(e=>({src:e.currentSrc,alt:e.alt})),
    missingAlt: [...document.images].filter(e=>!e.hasAttribute('alt')).map(e=>e.currentSrc),
    smallTargets: [...document.querySelectorAll('a,button')].filter(visible).filter(e=>e.getBoundingClientRect().height<44).slice(0,18).map(e=>({text:e.textContent.trim().slice(0,65),height:Math.round(e.getBoundingClientRect().height)})),
    text: document.querySelector('main')?.innerText.slice(0,400),
  };
};
try {
  for(const endpoint of ['/api/webDetails/details','/api/project/getAll','/api/post/getActivePosts','/api/vacancy/opens','/api/gallery/getAll']){
    const res = await fetch(origin+endpoint);
    const data=await res.json().catch(()=>null);
    report.api.push({endpoint,status:res.status,count:Array.isArray(data?.data)?data.data.length:null});
  }
  await p.setViewport({width:375,height:812,mobile:true});
  await p.goto(origin, {settleMs:1800});
  report.reproductions.firstVisit = await p.eval(()=>{
    const bar=document.querySelector('.sticky-mobile-bar');
    const cookie=document.querySelector('[aria-label="Privacy & Cookie Preferences"]');
    const r=bar.getBoundingClientRect();
    const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return {bar:{top:r.top,height:r.height},cookie:cookie?{top:cookie.getBoundingClientRect().top,height:cookie.getBoundingClientRect().height}:null,barCoveredByCookie:!!hit?.closest('[aria-label="Privacy & Cookie Preferences"]')};
  });
  await p.screenshot({path:path.join(out,'mobile-first-visit.jpg')});
  await p.eval(()=>[...document.querySelectorAll('button')].find(e=>e.textContent==='Accept')?.click());
  report.reproductions.consentAfterAccept=await p.eval(()=>({stored:localStorage.getItem('yashmeen_consent'),commands:window.dataLayer.filter(e=>e[0]==='consent').map(e=>Array.from(e))}));
  await p.goto(origin, {settleMs:1800});
  report.reproductions.consentAfterReload=await p.eval(()=>({stored:localStorage.getItem('yashmeen_consent'),commands:window.dataLayer.filter(e=>e[0]==='consent').map(e=>Array.from(e))}));

  const routes=['/','/about','/contact','/quote','/projects','/services/architecture','/services/interior-design','/services/construction','/services/office-renovation','/photo-gallery','/video-gallery','/blogs','/faq','/careers','/founders-message','/why-us','/privacy-policy','/login','/forgot-password','/experience','/services/does-not-exist'];
  for (const width of [1440,375]) {
    await p.setViewport({width,height:width===1440?900:812,mobile:width===375});
    for (const route of routes) {
      const before=networkErrors.length;
      p.consoleErrors.length=0;
      await p.goto(origin+route,{settleMs:1600,timeoutMs:15000});
      const m=await p.eval(metrics);
      m.runtimeErrors=[...p.consoleErrors]; m.networkErrors=networkErrors.slice(before);
      report.routes.push(m);
      if (['/','/contact','/quote','/about','/projects','/services/interior-design'].includes(route)) {
        await p.screenshot({path:path.join(out,`${width}-${route==='/'?'home':route.replaceAll('/','_')}.jpg`)});
      }
      console.log(JSON.stringify({route,width,h1:m.h1,overflow:m.scrollWidth>width,broken:m.brokenImages.length,errors:m.runtimeErrors.length,network:m.networkErrors.length}));
    }
  }

  await p.setViewport({width:375,height:812,mobile:true});
  await p.goto(origin,{settleMs:1800});
  await p.eval(()=>document.querySelector('.aperture-cta').click());
  await sleep(400);
  report.reproductions.modalOpened=await p.eval(()=>({active:document.activeElement.outerHTML.slice(0,200),pageScroll:scrollY,dialogHeight:document.querySelector('.modal-card').getBoundingClientRect().height}));
  await p.eval(()=>[...document.querySelectorAll('.modal-footer button')].find(e=>/next|continue/i.test(e.textContent))?.click());
  report.reproductions.modalInvalid=await p.eval(()=>({text:document.querySelector('.modal-card').innerText,alerts:document.querySelectorAll('.modal-card [role="alert"]').length}));
  await p.screenshot({path:path.join(out,'mobile-modal-validation.jpg')});
  await p.eval(()=>document.querySelector('[aria-label="Close modal"]').click());
  await sleep(100);
  report.reproductions.modalClosed=await p.eval(()=>({active:document.activeElement.className}));
  await p.goto(origin+'/quote',{settleMs:1600});
  await p.eval(()=>document.querySelector('form')?.requestSubmit());
  await sleep(100);
  report.reproductions.quoteInvalid=await p.eval(()=>({errors:[...document.querySelectorAll('[role="alert"],.enqpg-error')].map(e=>e.textContent),text:document.querySelector('form')?.innerText.slice(-700)}));

  await p.setViewport({width:1440,height:900});
  await p.goto(origin,{settleMs:1700});
  await p.eval(()=>document.querySelector('.nav-dropdown-wrapper a').focus());
  report.reproductions.servicesKeyboard=await p.eval(()=>({ariaExpanded:document.activeElement.getAttribute('aria-expanded'),submenuVisibility:getComputedStyle(document.querySelector('.nav-dropdown-menu')).visibility}));
  await p.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  report.reproductions.servicesEscape=await p.eval(()=>({ariaExpanded:document.activeElement.getAttribute('aria-expanded'),submenuVisibility:getComputedStyle(document.querySelector('.nav-dropdown-menu')).visibility}));

  const reduced=await browser.newPage({width:375,height:812,mobile:true,reducedMotion:true});
  await reduced.send('Network.enable');
  await reduced.send('Network.setBlockedURLs',{urls:['*googletagmanager.com*','*google-analytics.com*']});
  await reduced.goto(origin,{settleMs:100});
  report.reproductions.reducedMotion=await reduced.eval(()=>({prefersReducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,motionClass:document.documentElement.classList.contains('motion'),lenisActive:document.documentElement.classList.contains('lenis'),wordStyle:document.querySelector('.aperture-word')?.getAttribute('style')}));
  await reduced.close();
} finally {
  fs.writeFileSync(path.join(out,'browser-audit.json'),JSON.stringify(report,null,2));
  await p.close();
  await browser.close();
}
