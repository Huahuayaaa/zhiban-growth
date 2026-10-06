import {one,exec} from './store';
export class HttpError extends Error{constructor(public status:number,message:string){super(message)}}
export function ensure(ok:any,message='无权访问此内容',status=403):asserts ok{if(!ok)throw new HttpError(status,message)}
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
async function derive(password:string,salt:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256))}
export async function hash(password:string){const salt=crypto.randomUUID();return salt+':'+await derive(password,salt)}
export async function verify(password:string,stored:string){const [s,h]=stored.split(':');const check=await derive(password,s);let diff=check.length^h.length;for(let i=0;i<check.length;i++)diff|=check.charCodeAt(i)^h.charCodeAt(i);return diff===0}
export async function current(req:Request){const token=req.headers.get('cookie')?.match(/(?:^|;\s*)zb_session=([^;]+)/)?.[1];if(!token)return null;return one('SELECT u.* FROM user u JOIN session s ON s.user_id=u.id WHERE s.token=? AND s.expires>? AND u.is_deleted=0',token,Date.now())}
export async function requireUser(req:Request){const u=await current(req);ensure(u,'请先登录',401);return u}
export async function session(u:any,req:Request){const token=crypto.randomUUID()+crypto.randomUUID();await exec('INSERT INTO session (token,user_id,expires) VALUES (?,?,?)',token,u.id,Date.now()+86400000*7);return `zb_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${new URL(req.url).protocol==='https:'?'; Secure':''}`}
export const safeUser=(u:any)=>({id:u.id,username:u.username,real_name:u.real_name,role:u.role,phone:u.phone,avatar:u.avatar,child_user_id:u.child_user_id,is_demo:u.is_demo});
