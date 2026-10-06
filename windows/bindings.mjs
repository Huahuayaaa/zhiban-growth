import {DatabaseSync} from 'node:sqlite';
import {mkdir,readFile,writeFile,unlink,readdir,rename} from 'node:fs/promises';
import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
export const env={};
let database;
const types={'.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff','.txt':'text/plain; charset=utf-8','.html':'text/html; charset=utf-8'};
const value=v=>v==null?null:typeof v==='boolean'?Number(v):v;
class Statement{
 constructor(sql,params=[]){this.sql=sql;this.params=params}
 bind(...params){return new Statement(this.sql,params.map(value))}
 async all(){return {success:true,results:database.prepare(this.sql).all(...this.params),meta:{}}}
 async first(column){const row=database.prepare(this.sql).get(...this.params)||null;return column&&row?row[column]:row}
 async run(){const result=database.prepare(this.sql).run(...this.params);return {success:true,results:[],meta:{changes:Number(result.changes),last_row_id:Number(result.lastInsertRowid)}}}
}
export async function initialize(root){
 const data=path.join(root,'data');await mkdir(data,{recursive:true});const uploads=path.join(data,'uploads');await mkdir(uploads,{recursive:true});
 database=new DatabaseSync(path.join(data,'zhiban.sqlite'));database.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 database.exec('CREATE TABLE IF NOT EXISTS desktop_migration(name TEXT PRIMARY KEY, hash TEXT NOT NULL)');
 const migrations=(await readdir(path.join(root,'app','migrations'))).filter(x=>x.endsWith('.sql')).sort();
 for(const name of migrations){const sql=await readFile(path.join(root,'app','migrations',name),'utf8'),hash=createHash('sha256').update(sql).digest('hex');const prev=database.prepare('SELECT hash FROM desktop_migration WHERE name=?').get(name);if(prev){if(prev.hash!==hash)throw Error('Database migration changed: '+name);continue}database.exec('BEGIN IMMEDIATE');try{database.exec(sql);database.prepare('INSERT INTO desktop_migration(name,hash) VALUES(?,?)').run(name,hash);database.exec('COMMIT')}catch(e){database.exec('ROLLBACK');throw e}}
 env.DB={prepare:sql=>new Statement(sql),async batch(statements){database.exec('BEGIN IMMEDIATE');try{const result=[];for(const statement of statements)result.push(await statement.run());database.exec('COMMIT');return result}catch(e){database.exec('ROLLBACK');throw e}}};
 const mediaPath=key=>{if(!/^[a-zA-Z0-9_/-]+$/.test(key)||key.includes('..')||key.startsWith('/'))throw Error('Invalid file key');return path.join(uploads,createHash('sha256').update(key).digest('hex')+'.blob')};
 env.BUCKET={async put(key,input,options={}){const dest=mediaPath(key);await mkdir(path.dirname(dest),{recursive:true});const bytes=input instanceof ReadableStream?new Uint8Array(await new Response(input).arrayBuffer()):input;const tmp=dest+'.'+crypto.randomUUID()+'.tmp';await writeFile(tmp,bytes);await rename(tmp,dest);return {key}},async get(key){const src=mediaPath(key);let bytes;try{bytes=await readFile(src)}catch(e){if(e.code==='ENOENT')return null;throw e}return {key,body:new Blob([bytes]).stream(),size:bytes.length,async arrayBuffer(){return bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)} }},async delete(key){try{await unlink(mediaPath(key))}catch(e){if(e.code!=='ENOENT')throw e}}};
 const assets=path.join(root,'app','client');
 env.ASSETS={async fetch(request){const url=new URL(typeof request==='string'?request:request.url);let pathname;try{pathname=decodeURIComponent(url.pathname)}catch{return new Response(null,{status:400})}const dest=path.resolve(assets,'.'+pathname);if(!dest.startsWith(assets+path.sep))return new Response(null,{status:404});let bytes;try{bytes=await readFile(dest)}catch(e){if(['ENOENT','EISDIR','ENOTDIR'].includes(e.code))return new Response(null,{status:404});throw e}const headers={'Content-Type':types[path.extname(dest)]||'application/octet-stream','Cache-Control':pathname.startsWith('/_next/static/')?'public, max-age=31536000, immutable':'no-cache','X-Content-Type-Options':'nosniff'};return new Response(request.method==='HEAD'?null:bytes,{headers})}};
 // Deliberately read only application AI settings. Never log secret values.
 const secretFile=path.join(root,'config','ai.env');if(existsSync(secretFile))for(const line of readFileSync(secretFile,'utf8').replace(/^\uFEFF/,'').split(/\r?\n/)){const match=line.match(/^\s*(DEEPSEEK_API_KEY|DEEPSEEK_BASE_URL|DEEPSEEK_MODEL)\s*=\s*(.*?)\s*$/);if(match)env[match[1]]=match[2]}
 return {close(){database.exec('PRAGMA wal_checkpoint(TRUNCATE)');database.close()}};
}
