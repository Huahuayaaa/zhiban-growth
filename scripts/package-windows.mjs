import {mkdir,rm,cp,readFile,writeFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.join(project,'desktop-build','ZhibanGrowth');
// Only built application files and launchers; never read or copy private config/data.
await rm(target,{recursive:true,force:true});
await mkdir(path.join(target,'app','migrations'),{recursive:true});
await cp(path.join(project,'dist','server'),path.join(target,'app','server'),{recursive:true});
await cp(path.join(project,'dist','client'),path.join(target,'app','client'),{recursive:true});
async function clean(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory()){if(entry.name.startsWith('.'))await rm(p,{recursive:true});else await clean(p)}else if(entry.name.startsWith('.')||entry.name.endsWith('.map')||entry.name==='wrangler.json')await rm(p)}}
await clean(path.join(target,'app'));
for(const f of await readdir(path.join(project,'drizzle')))if(f.endsWith('.sql'))await cp(path.join(project,'drizzle',f),path.join(target,'app','migrations',f));
await mkdir(path.join(target,'launcher'),{recursive:true});
for(const f of await readdir(path.join(project,'windows'))){const p=path.join(project,'windows',f);if(f.endsWith('.bat'))await writeFile(path.join(target,f),(await readFile(p,'utf8')).replace(/\r?\n/g,'\r\n'));else if(f==='ReadMe.txt')await writeFile(path.join(target,'使用说明.txt'),'\uFEFF'+(await readFile(p,'utf8')).replace(/\r?\n/g,'\r\n'));else if(f.endsWith('.ps1'))await writeFile(path.join(target,'launcher',f),'\uFEFF'+await readFile(p,'utf8'));else await cp(p,path.join(target,'launcher',f))}
await writeFile(path.join(target,'package.json'),JSON.stringify({name:'zhiban-growth-desktop',version:'1.0.0',private:true,type:'module'},null,2));
await cp(path.join(project,'LICENSE'),path.join(target,'LICENSE'));
console.log('Prepared desktop-build/ZhibanGrowth. No API config or personal data included.');
