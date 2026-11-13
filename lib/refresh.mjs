import { day, discoveryPrompt, parseDiscovery, verifyFromHTML, mergeFeed } from './job-feed.mjs';
export async function discover(env,fetcher=fetch,now=new Date()){
  const model=env.GEMINI_MODEL||'gemini-3.8-flash';
  if(!/^[a-zA-Z0-9.-]+$/.test(model))throw Error('Invalid Gemini model configuration');
  const r=await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},signal:AbortSignal.timeout(30000),body:JSON.stringify({contents:[{role:'user',parts:[{text:discoveryPrompt(now)}]}],tools:[{google_search:{}}],generationConfig:{temperature:0.2,maxOutputTokens:7000,responseMimeType:'application/json'}})});
  if(!r.ok)throw Error(r.status===429?'Google Search quota reached':r.status===401||r.status===403?'Google API authorization failed':'Google discovery unavailable');
  return parseDiscovery(await r.json());
}
export async function refresh({env,read,write,search,source,now=new Date()}){
  const {state,etag}=await read();
  if(state?.lastSuccessAt&&day(state.lastSuccessAt)===day(now))return {status:'already_refreshed',newCount:state.newCount||0};
  if(state?.runState==='running'&&Date.parse(state.lastAttemptAt)>now.getTime()-120000)return {status:'in_progress'};
  const initial={schemaVersion:1,jobs:[],...state,lastAttemptAt:now.toISOString(),runState:'running'};
  let lock;try{lock=await write(initial,etag);}catch{throw Error('Refresh already running or storage unavailable');}
  try{
    const discovery=await search(env,undefined,now),jobs=new Array(discovery.jobs.length);let index=0;
    await Promise.all(Array.from({length:Math.min(6,discovery.jobs.length)},async()=>{while(index<discovery.jobs.length){const i=index++,j=discovery.jobs[i];try{jobs[i]=verifyFromHTML(j,await source(j.url),now);}catch{jobs[i]={...j,lastCheckedAt:now.toISOString(),verified:false,checked:'',note:'Source could not be checked directly; treat details as unverified.'};}}}));
    const next=mergeFeed(state,{...discovery,jobs},now);
    await write(next,lock.etag);
    return {status:'updated',newCount:next.newCount,total:next.jobs.length,verified:jobs.filter(j=>j.verified&&!j.closed).length,lastSuccessAt:next.lastSuccessAt};
  }catch(error){
    const allowed=['Google Search quota reached','Google API authorization failed','Google discovery unavailable','Incomplete discovery response','Discovery returned invalid JSON','Discovery did not return jobs','Search grounding was not returned'];
    const message=allowed.includes(error.message)?error.message:'Daily refresh failed. The previous feed has been kept.';
    await write({...initial,runState:'error',lastError:message},lock.etag).catch(()=>{});
    throw Error(message);
  }
}
