"use client";
import {useEffect,useState} from 'react';
import {Sparkles} from 'lucide-react';
import {toast} from 'sonner';
import {api,Tag} from './workspace';

export function AIAssessment({s,act,busy,retry=false}:any){
 const running=s.ai_state==='running'&&Date.now()-Date.parse(s.ai_checked_time||'')<210000;let details:any=null;try{details=JSON.parse(s.ai_details||'null')}catch{}
 return <div className="ai-panel"><span><Sparkles size={16}/>AI辅助初审</span><Tag tone={s.ai_result==='合格'?'green':s.ai_result==='疑似无效'?'red':'yellow'}>{s.ai_result||'待人工复核'}</Tag>{s.ai_score!=null&&<strong>参考分：{s.ai_score}/100</strong>}{details?.completion!=null&&<strong>可见完成度：{details.completion}%</strong>}<p className="ai-notes">{s.ai_notes||'等待初审或教师复核。'}</p>{details&&<small>{details.provider} · {new Date(details.checked_at).toLocaleString('zh-CN')}</small>}{retry&&s.status==='ai_check'&&<button className="btn blue" disabled={busy||running} onClick={()=>act('ai-review',{id:s.id,force:s.ai_state==='completed'}).catch(()=>{})}>{running?'AI初审中…':s.ai_state==='completed'?'重新初审':'开始 / 重试AI初审'}</button>}</div>
}
export function GrowthPanel({a,semester,configured,onReport}:any){
 const [report,setReport]=useState<any>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const snapshot=JSON.stringify([a.submissions.map((s:any)=>[s.id,s.status,s.update_time]),a.trains.map((t:any)=>t.id)]);
 useEffect(()=>{let active=true;setReport(null);setError('');api(`growth-report?id=${a.student.id}&semester=${encodeURIComponent(semester)}`).then(j=>{if(active)setReport(j)}).catch(()=>{});return()=>{active=false}},[a.student.id,semester,snapshot]);
 async function generate(){setBusy(true);setError('');try{setReport(await api('growth-report',{id:a.student.id,semester}));toast.success('AI成长报告已保存')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 useEffect(()=>{onReport?.(report?.content||null)},[report?.content,onReport]);
 return <div className="panel ai-growth"><h3><Sparkles size={19}/>AI成长报告</h3><p>基于当前学期的任务、教师评语与实训记录整理。统计数字以档案为准，报告需教师核对。</p>{report?.content&&<div className="detail-text">{report.content}</div>}{report?.created&&<small>已保存 · {new Date(report.created).toLocaleString('zh-CN')}</small>}{error&&<p className="error">{error}</p>}<div className="form-actions">{report?.content&&<small>已纳入本次档案PDF导出内容</small>}<button className="btn primary" disabled={busy||!configured} onClick={generate}>{busy?'正在整理…':report?.content?'查看已保存报告':'生成AI成长报告'}</button></div></div>
}
