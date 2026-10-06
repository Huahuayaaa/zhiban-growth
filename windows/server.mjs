import http from 'node:http';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {env,initialize} from './bindings.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.ZHIBAN_DESKTOP_PORT||5173),host='127.0.0.1',url=`http://${host}:${port}/`;
function openBrowser(){if(process.env.ZHIBAN_NO_BROWSER==='1')return;const cmd=process.platform==='win32'?['cmd',['/d','/c','start','',url]]:process.platform==='darwin'?['open',[url]]:['xdg-open',[url]];const child=spawn(cmd[0],cmd[1],{stdio:'ignore',detached:true});child.on('error',()=>{});child.unref()}
// Starting twice opens the existing copy instead of launching a second database writer.
try{const response=await fetch(url+'desktop-health',{signal:AbortSignal.timeout(1200)});if(response.headers.get('X-Zhiban-Desktop')==='1'){console.log('Website is already running: '+url);openBrowser();process.exit(0)}else{throw Error('Port is occupied by another application')}}catch(e){if(e.message==='Port is occupied by another application')throw e}
const data=await initialize(root);const {default:worker}=await import('../app/server/index.js');
const pending=new Set();const ctx={props:{},waitUntil(promise){pending.add(promise);promise.finally(()=>pending.delete(promise)).catch(()=>{})},passThroughOnException(){}};
const server=http.createServer(async(req,res)=>{try{
 if(req.url==='/desktop-health'){res.writeHead(200,{'X-Zhiban-Desktop':'1','Content-Type':'application/json'});res.end('{"ok":true}');return}
 if(![`${host}:${port}`,`localhost:${port}`].includes(req.headers.host)){res.writeHead(403);res.end();return}
 if(Number(req.headers['content-length']||0)>32*1024*1024){res.writeHead(413);res.end('File too large');return}
 const headers=new Headers();for(const [key,value] of Object.entries(req.headers))if(value!=null)headers.set(key,Array.isArray(value)?value.join(','):value);
 const request=new Request(new URL(req.url,`http://${req.headers.host}`),{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Readable.toWeb(req),duplex:'half'}:{})});
 const asset=['GET','HEAD'].includes(req.method)?await env.ASSETS.fetch(request):null;const result=asset&&asset.status!==404?asset:await worker.fetch(request,env,ctx),out={};result.headers.forEach((v,k)=>{if(k!=='set-cookie')out[k]=v});const cookies=result.headers.getSetCookie();if(cookies.length)out['set-cookie']=cookies;res.writeHead(result.status,out);if(result.body&&req.method!=='HEAD')await pipeline(Readable.fromWeb(result.body),res);else res.end();
 }catch(error){console.error('Local request failed:',error.message);if(!res.headersSent)res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});res.end('服务暂时不可用，请查看启动窗口或重试。')}});
server.requestTimeout=300000;
server.on('error',error=>{console.error('Startup failed:',error.message);data.close();process.exitCode=1});
server.listen(port,host,()=>{console.log('智伴成长已启动：'+url);console.log('使用期间请保持此窗口打开；按 Ctrl+C 停止。');openBrowser()});
let stopping=false;async function stop(){if(stopping)return;stopping=true;console.log('Saving data and stopping…');server.close();await Promise.race([Promise.allSettled([...pending]),new Promise(r=>setTimeout(r,5000))]);server.closeAllConnections();data.close();process.exit(0)}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
