import {env} from 'cloudflare:workers';
export function db(){if(!env.DB)throw Error('数据服务暂时不可用');return env.DB}
export async function rows(sql:string,...p:any[]){return (await db().prepare(sql).bind(...p).all()).results as any[]}
export async function one(sql:string,...p:any[]){return await db().prepare(sql).bind(...p).first() as any}
export async function exec(sql:string,...p:any[]){return db().prepare(sql).bind(...p).run()}
export function batch(items:[string,...any[]][]){return db().batch(items.map(([sql,...p])=>db().prepare(sql).bind(...p)))}
export const now=()=>new Date().toISOString();
export function bucket(){if(!env.BUCKET)throw Error('文件服务暂时不可用');return env.BUCKET}
