// Isolated browser QA server. Uses in-memory fixtures and never connects to MongoDB or SMTP.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, preview } from 'vite';
import WebDetailsModel from '../../../api/models/webDetails.model.js';
import { getWebDetails, getAdminWebDetails, updateWebDetails } from '../../../api/controllers/webDetails.controller.js';
import { DEFAULT_WEBSITE_CONTENT, mergeWebsiteContent } from '../../../../shared/siteContent.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = process.env.CMS_QA_DATA_FILE ? JSON.parse(fs.readFileSync(path.resolve(process.env.CMS_QA_DATA_FILE), 'utf8')) : null;
let content = mergeWebsiteContent(fixture?.webDetails || DEFAULT_WEBSITE_CONTENT);
WebDetailsModel.findOne = () => ({lean: async () => content});
WebDetailsModel.findOneAndUpdate = (_filter, update) => ({lean: async () => {
  for(const [name,value] of Object.entries(update.$set)) {
    const parts=name.split('.');let target=content;
    for(const key of parts.slice(0,-1))target=target[key] ||= {};
    target[parts.at(-1)]=value;
  }
  return content;
}});
const account={_id:'fixture-admin',name:'Browser QA',email:'fixture@example.test',usertype:'admin',emailVerified:true};
const projects=fixture?.projects || [{_id:'fixture-project',title:'Fixture commission',categoryId:{_id:'fixture-category',categoryName:'Residential'},sector:'Residential',location:'Dubai',size:'Fixture area',scope:'Fixture scope',duration:'Fixture duration',images:['/static/studio.jpg','/static/why-us.jpg'],description:'Local browser test project.'}];
const gallery=Array.from({length:12},(_,i)=>({_id:`fixture-gallery-${i}`,title:`Fixture gallery ${i+1}`,categoryId:{_id:'fixture-category',categoryName:'Residential'},photo:i%2?'/static/why-us.jpg':'/static/studio.jpg',status:true}));
const api=http.createServer(async (request,response)=>{
  const url=new URL(request.url,'http://localhost');
  const reply={status(code){response.statusCode=code;return this;},json(body){response.setHeader('Content-Type','application/json');response.end(JSON.stringify(body));return this;}};
  const chunks=[];for await(const chunk of request)chunks.push(chunk);
  let body={};try{body=JSON.parse(Buffer.concat(chunks).toString()||'{}');}catch{return reply.status(400).json({success:false,message:'Invalid JSON'});}
  if(url.pathname==='/api/webDetails/details')return getWebDetails({},reply);
  if(url.pathname==='/api/webDetails/admin-details')return getAdminWebDetails({},reply);
  if(url.pathname==='/api/webDetails/update')return updateWebDetails({body},reply);
  if(url.pathname==='/api/account/login')return reply.json({success:true,data:account,token:'local-fixture-only'});
  if(url.pathname.startsWith('/api/account'))return reply.json({success:true,data:account});
  if(url.pathname.includes('/getVersion'))return reply.json({success:true,version:'fixture-v1'});
  if(url.pathname==='/api/project/getAll')return reply.json({success:true,data:projects});
  if(url.pathname.includes('/project/getById/'))return reply.json({success:true,data:projects[0]});
  if(url.pathname==='/api/post/getActivePosts')return reply.json({success:true,data:fixture?.posts || []});
  if(url.pathname.startsWith('/api/post/getById/'))return reply.json({success:true,data:fixture?.posts?.[0] || null});
  if(url.pathname==='/api/category/getAll')return reply.json({success:true,data:[{_id:'fixture-category',categoryName:'Residential',status:true}]});
  if(url.pathname.includes('/gallery/'))return reply.json({success:true,data:gallery});
  return reply.json({success:true,data:[]});
});
await new Promise(resolve=>api.listen(18000,'127.0.0.1',resolve));
const previewPort = Number(process.env.CMS_QA_PORT || 3001);
const options={host:'127.0.0.1',port:previewPort,strictPort:true,proxy:{'/api':{target:'http://127.0.0.1:18000',changeOrigin:true}}};
const built = process.env.CMS_QA_BUILD === 'true';
const vite=built ? await preview({root,preview:options}) : await createServer({root,server:options});
if (!built) await vite.listen();
console.log(`Fixture preview: http://127.0.0.1:${previewPort}/login (any local test password). No business database is connected.`);
const close=async()=>{if(built)await new Promise(resolve=>vite.httpServer.close(resolve));else await vite.close();api.close();process.exit(0);};
process.once('SIGINT',close);process.once('SIGTERM',close);
