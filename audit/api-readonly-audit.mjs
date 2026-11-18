const origin='http://127.0.0.1:8000';
const reads=['/api/project/getAll','/api/webDetails/details','/api/post/getActivePosts','/api/vacancy/opens'];
for(const endpoint of reads){const r=await fetch(origin+endpoint);const j=await r.json();console.log(JSON.stringify({endpoint,status:r.status,count:Array.isArray(j.data)?j.data.length:null,keys:Object.keys(j),message:j.message}));}
const paths=['/api/project/create','/api/banner/create','/api/gallery/create','/api/popup/create','/api/video/create','/api/vacancy/create','/api/category/create','/api/account/create','/api/upload'];
for(const endpoint of paths){const r=await fetch(origin+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});console.log(JSON.stringify({endpoint,status:r.status}));}
for(const endpoint of ['/api/quote/create','/api/enquiry/create']){const r=await fetch(origin+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});console.log(JSON.stringify({endpoint,status:r.status,body:await r.json()}));}
