import {env} from 'cloudflare:workers';
import {HttpError} from './auth';

type AIConfig = {key:string; baseUrl:string; model:string; label:string; provider:'deepseek'|'openai'};

export function aiConfig():AIConfig|null {
  const values=env as unknown as Record<string,string|undefined>;
  if(values.DEEPSEEK_API_KEY?.trim()) return {
    key:values.DEEPSEEK_API_KEY.trim(),
    baseUrl:(values.DEEPSEEK_BASE_URL||'https://api.deepseek.com').replace(/\/+$/,''),
    model:values.DEEPSEEK_MODEL||'deepseek-flash',
    label:'DeepSeek V4.1 Flash',
    provider:'deepseek',
  };
  if(values.OPENAI_API_KEY?.trim()) return {
    key:values.OPENAI_API_KEY.trim(),
    baseUrl:'https://api.openai.com/v1',
    model:values.OPENAI_MODEL||'gpt-4.1-mini',
    label:'OpenAI',
    provider:'openai',
  };
  return null;
}

type AIOptions={json?:boolean;maxTokens?:number};
export async function callJSON(system:string,content:any,maxTokens=1800){
  for(let attempt=0;attempt<2;attempt++){
    const result=await callAI(system+(attempt?' 上次输出无法解析。务必返回严格JSON，字符串换行使用转义，不要Markdown代码块。':''),content,{json:true,maxTokens});
    const raw=result.content.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
    try{return {...result,parsed:JSON.parse(raw)}}catch{if(attempt===1)throw new HttpError(502,'AI 初审结果格式异常，请重试')}
  }
  throw new HttpError(502,'AI 初审结果格式异常，请重试');
}
export async function callAI(system:string,content:any,options:AIOptions={}) {
  const config=aiConfig();
  if(!config) throw new HttpError(503,'尚未配置 AI 服务。');
  let response:Response;
  try {
    response=await fetch(config.baseUrl+'/chat/completions',{
      method:'POST',headers:{Authorization:`Bearer ${config.key}`,'Content-Type':'application/json'},
      signal:AbortSignal.timeout(90000),
      body:JSON.stringify({model:config.model,...(config.provider==='deepseek'?{thinking:{type:'disabled'}}:{}),
        ...(options.json?{response_format:{type:'json_object'}}:{}),
        messages:[{role:'system',content:system},{role:'user',content}],max_tokens:options.maxTokens||3000}),
    });
  } catch {throw new HttpError(502,`${config.label} 连接超时或网络不可用，请稍后重试。`)}
  if(!response.ok){
    const message=response.status===401?'API 密钥无效，请检查本机配置':response.status===402?'API 余额不足，请在服务商控制台充值后重试':response.status===429?'请求过于频繁，请稍后重试':response.status===400||response.status===404?'模型或请求配置无效，请检查 AI 配置':'服务暂时不可用，请稍后重试';
    throw new HttpError(502,`${config.label}：${message}。`);
  }
  let result:any;try{result=await response.json()}catch{throw new HttpError(502,'AI 返回格式异常，请重试。')}
  const output=result.choices?.[0]?.message?.content;
  if(typeof output!=='string'||!output.trim())throw new HttpError(502,'AI 未返回正文，请重试。');
  if(result.choices?.[0]?.finish_reason==='length')throw new HttpError(502,'AI 内容未生成完整，请重试。');
  if(output.length>20000)throw new HttpError(502,'AI 内容超过长度限制，请重试。');
  return {content:output.trim(),model:config.model,provider:config.label};
}
export async function generateTeachingResource(template:string) {
  if(!aiConfig())return {content:template,source:'课标结构化模板'};
  const result=await callAI('你是中小学劳动课程备课助手。根据给定的结构化课标关联、学段、年级、主题和资源类型生成完整、具体、可直接编辑的中文教学资源。严格保留检索依据、安全约束与适用范围；根据年龄调整难度，不安排当前学段不适用的任务群。教案包含目标、材料、安全、活动安排、评价；任务单包含步骤、提交要求、记录栏、反思；实训指导书包含操作顺序、错误纠正、安全检查；评价量表需明确指标、权重、等级描述和证据。内容需教师核对，不声称是课标原文。只返回正文。',template);
  return {content:result.content,source:`${result.provider} 辅助生成 · 需教师核对`};
}
