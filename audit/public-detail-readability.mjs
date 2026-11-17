import fs from 'node:fs';
import { Browser, sleep } from 'file:///C:/Users/sahil/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const origin='https://yashmeen-fitout.vercel.app';
const prior=JSON.parse(fs.readFileSync('audit/public-agent-readability.json'));
const routes=prior.pages.filter(p=>p.javascript&&/\/(project|blog)\/details\//.test(p.route)).map(p=>p.route);
const result=[];
const browser=await Browser.launch();
try{const p=await browser.newPage();await p.send('Network.enable');await p.send('Network.setBlockedURLs',{urls:['*googletagmanager.com*','*google-analytics.com*']});
for(const route of routes){const response=await fetch(origin+route,{signal:AbortSignal.timeout(20000)});const raw=await response.text();const network=[];const off=browser.on(p.sessionId,'Network.responseReceived',({response})=>{if(response.url.includes('/api/'))network.push({url:response.url,status:response.status});});
await p.goto(origin+route,{settleMs:1800});await sleep(12000);
const rendered=await p.eval(()=>({title:document.title,main:document.querySelector('main')?.innerText,h1:[...document.querySelectorAll('main h1')].map(e=>e.innerText)}));
result.push({route,status:response.status,rawRootEmpty:/<div id="root"><\/div>/.test(raw),rawTitle:raw.match(/<title>(.*?)<\/title>/s)?.[1],rawContainsNoscript:raw.includes('<noscript>'),rendered,network});off();console.log(JSON.stringify(result.at(-1)));}
await p.close();}finally{fs.writeFileSync('audit/public-detail-readability.json',JSON.stringify(result,null,2));await browser.close();}
