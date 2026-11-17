import fs from 'node:fs';
import { Browser, sleep } from 'file:///C:/Users/sahil/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const origin='https://yashmeen-fitout.vercel.app';
const report={origin,checkedAt:new Date().toISOString(),bots:[],api:[],pages:[]};
for(const ua of ['GPTBot','OAI-SearchBot','ClaudeBot']){const r=await fetch(origin,{headers:{'User-Agent':ua},signal:AbortSignal.timeout(15000)});report.bots.push({agent:ua,status:r.status,robotsHeader:r.headers.get('x-robots-tag')});}
let projectId,blogId;
for(const endpoint of ['/api/project/getAll','/api/post/getActivePosts']){const r=await fetch(origin+endpoint,{signal:AbortSignal.timeout(20000)});const j=await r.json().catch(()=>null);report.api.push({endpoint,status:r.status,count:Array.isArray(j?.data)?j.data.length:null});if(endpoint.includes('project'))projectId=j?.data?.[0]?._id;else blogId=j?.data?.[0]?._id;}
const sitemap=fs.readFileSync('audit/crawl-sitemap.xml','utf8');
report.sitemap={urls:(sitemap.match(/<loc>/g)||[]).length,containsExperience:sitemap.includes('/experience<'),projectDetailUrls:(sitemap.match(/\/project\/details\//g)||[]).length,blogDetailUrls:(sitemap.match(/\/blog\/details\//g)||[]).length};
const browser=await Browser.launch();
try{
for(const javascript of [true,false]){
const p=await browser.newPage({width:1440,height:900});
await p.send('Network.enable');await p.send('Network.setBlockedURLs',{urls:['*googletagmanager.com*','*google-analytics.com*','*maps.google.com*']});
if(!javascript)await p.send('Emulation.setScriptExecutionDisabled',{value:true});
const routes=javascript?['/','/services/interior-design',...(projectId?['/project/details/'+projectId]:[]),...(blogId?['/blog/details/'+blogId]:[])]:['/','/services/interior-design'];
for(const route of routes){p.consoleErrors.length=0;await p.goto(origin+route,{settleMs:javascript?2200:300,timeoutMs:20000});if(javascript){for(let n=0;n<12;n++){const loading=await p.eval(()=>/Loading projects|Loading\.\.\./i.test(document.body.innerText));if(!loading)break;await sleep(700);} }
const result=await p.eval(()=>{const text=document.body.innerText;return{title:document.title,h1:[...document.querySelectorAll('h1')].map(e=>e.innerText),text,words:text.trim().split(/\s+/).length,linkCount:document.querySelectorAll('a[href]').length,rootPopulated:!!document.getElementById('root')?.children.length,structuredData:[...document.querySelectorAll('script[type="application/ld+json"]')].map(e=>JSON.parse(e.textContent)['@type'])};});
result.route=route;result.javascript=javascript;result.exceptions=[...p.consoleErrors];report.pages.push(result);console.log(JSON.stringify({route,javascript,words:result.words,h1:result.h1,links:result.linkCount,rootPopulated:result.rootPopulated}));}
await p.close();}
}finally{fs.writeFileSync('audit/public-agent-readability.json',JSON.stringify(report,null,2));await browser.close();}
