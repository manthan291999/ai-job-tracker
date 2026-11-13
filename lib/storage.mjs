import { get, put } from '@vercel/blob';
const PATH='ai-job-tracker/jobs-feed.json';
export function configured(env=process.env){return Boolean(env.BLOB_READ_WRITE_TOKEN&&env.GEMINI_API_KEY&&env.CRON_SECRET?.length>=24);}
export async function readFeed(){
  const result=await get(PATH,{access:'private',useCache:false,abortSignal:AbortSignal.timeout(5000)});
  if(!result)return {state:null,etag:null};
  if(result.statusCode!==200||!result.stream)throw Error('Feed storage unavailable');
  const state=await new Response(result.stream).json();
  if(state.schemaVersion!==1||!Array.isArray(state.jobs))throw Error('Feed storage schema mismatch');
  return {state,etag:result.blob.etag};
}
export async function writeFeed(state,etag){return put(PATH,JSON.stringify(state),{access:'private',addRandomSuffix:false,allowOverwrite:Boolean(etag),...(etag?{ifMatch:etag}:{}),contentType:'application/json',cacheControlMaxAge:60,abortSignal:AbortSignal.timeout(5000)});}
