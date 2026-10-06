import {existsSync} from 'node:fs';import {mkdir,cp} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
try{const r=await fetch('http://127.0.0.1:5173/desktop-health',{signal:AbortSignal.timeout(1000)});if(r.headers.get('X-Zhiban-Desktop')==='1'){console.log('请先关闭网站启动窗口，再双击 Backup.bat 备份。');process.exit(1)}}catch{}
if(!existsSync(path.join(root,'data','zhiban.sqlite'))){console.log('尚未生成数据，无需备份。');process.exit(0)}
const name=new Date().toISOString().replace(/[:.]/g,'-');const dest=path.join(root,'backups',name);await mkdir(dest,{recursive:true});await cp(path.join(root,'data'),path.join(dest,'data'),{recursive:true});console.log('数据和上传文件已备份到：'+dest);console.log('备份不包含AI密钥。恢复前停止网站，再用备份中的data替换当前data。');
