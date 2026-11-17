import { Browser, sleep } from 'file:///C:/Users/sahil/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import fs from 'node:fs';
const origin='http://127.0.0.1:3000';
const browser=await Browser.launch();
const p=await browser.newPage({width:375,height:812,mobile:true});
const result={};
try{
await p.send('Network.enable');
await p.send('Network.setBlockedURLs',{urls:['*googletagmanager.com*','*google-analytics.com*','*maps.google.com*']});
for(const route of ['/reset-password?token=audit-invalid-token','/verify-email?token=audit-invalid-token']){
await p.goto(origin+route,{settleMs:1400});result[route]=await p.eval(()=>({h1:document.querySelector('h1')?.textContent,title:document.title}));}
await p.goto(origin+'/quote',{settleMs:1400});
result.quote=await p.eval(()=>({hours:[...document.querySelectorAll('main small,main p')].map(e=>e.textContent).filter(t=>/Sat|Mon|Thu|Fri/.test(t)),contactLinks:[...document.querySelectorAll('main a')].map(e=>e.getAttribute('href')).filter(h=>/^tel:|^mailto:/.test(h))}));
await p.wheel(950);await sleep(700);await p.screenshot({path:'audit/mobile-quote-details.jpg'});
await p.goto(origin,{settleMs:1600});await p.wheel(6600);await sleep(900);
result.testimonial=await p.eval(()=>{const e=document.querySelector('.testimonial-quote-text');const s=getComputedStyle(e);return{height:e.clientHeight,scrollHeight:e.scrollHeight,clipPath:s.clipPath,color:s.color,parentOverflow:getComputedStyle(e.parentElement).overflow};});
await p.goto(origin,{settleMs:1600});
result.tokens=await p.eval(()=>({accent:getComputedStyle(document.documentElement).getPropertyValue('--accent'),base:getComputedStyle(document.documentElement).getPropertyValue('--text-base')}));
await p.send('Fetch.enable',{patterns:[{urlPattern:origin+'/api/post/getBy/audit-html'}]});
const off=browser.on(p.sessionId,'Fetch.requestPaused',async({requestId})=>{
const body=JSON.stringify({data:{_id:'audit-html',status:true,title:'Audit HTML fixture',content:'<p>Isolated audit fixture.</p><img src="/static/__audit_missing.png" onerror="window.__auditHtmlExecuted=true">',createdAt:'2026-11-14'}});
await p.send('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(body).toString('base64')});});
await p.goto(origin+'/blog/details/audit-html',{settleMs:1400});
result.unsanitizedBlogHtml=await p.eval(()=>({executed:window.__auditHtmlExecuted===true,h1:document.querySelector('h1')?.textContent}));off();
}finally{fs.writeFileSync('audit/targeted-audit.json',JSON.stringify(result,null,2));await p.close();await browser.close();}
console.log(JSON.stringify(result,null,2));
