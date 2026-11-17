import fs from 'node:fs';
import path from 'node:path';
const ignored=new Set(['node_modules','dist','.git','uploads']);
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?(ignored.has(e.name)?[]:files(p)):[p];});}
const code=files('apps').filter(p=>/\.(js|jsx|ts|tsx|mjs)$/.test(p));
const used=new Map();
const imports=[];
for(const file of code){const text=fs.readFileSync(file,'utf8');for(const m of text.matchAll(/(?:from\s+|import\s*\(\s*|import\s+|require\s*\(\s*)['"]([^'"]+)['"]/g)){const name=m[1];imports.push({file,import:name});if(!name.startsWith('.')&&!name.startsWith('@/')&&!name.startsWith('node:')){const pkg=name.startsWith('@')?name.split('/').slice(0,2).join('/'):name.split('/')[0];if(!used.has(pkg))used.set(pkg,[]);used.get(pkg).push(file);}}}
const results={files:code.length,packages:{}};
for(const app of ['web','api']){const pkg=JSON.parse(fs.readFileSync(`apps/${app}/package.json`));results.packages[app]={declaredDependencies:Object.keys(pkg.dependencies).length,candidatesWithoutDirectSourceImports:Object.keys(pkg.dependencies).filter(name=>!used.has(name))};}
results.sourceFilesWithoutInboundImport=code.filter(file=>/\.(js|jsx|ts|tsx)$/.test(file)).filter(file=>!/(tests|scripts|config|main\.jsx|server\.js|vite\.config|eslint\.config|vite-env)/.test(file)).filter(file=>!imports.some(entry=>{let target=entry.import.startsWith('@/')?path.resolve('apps/web/src',entry.import.slice(2)):path.resolve(path.dirname(entry.file),entry.import);return ['','.js','.jsx','.ts','.tsx','/index.js','/index.jsx'].some(suffix=>path.resolve(target+suffix)===path.resolve(file));}));
fs.writeFileSync('audit/structure-inventory.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
