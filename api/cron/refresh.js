import { authorized } from '../../lib/job-feed.mjs';
import { configured, readFeed, writeFeed } from '../../lib/storage.mjs';
import { refresh, discover } from '../../lib/refresh.mjs';
import { fetchSource } from '../../lib/source-fetch.mjs';
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(!authorized(req.headers.authorization,process.env.CRON_SECRET))return res.status(401).json({error:'Unauthorized'});
  if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed'});}
  if(!configured())return res.status(503).json({error:'Configure GEMINI_API_KEY, a private Blob store and CRON_SECRET first.'});
  try{return res.status(200).json(await refresh({env:process.env,read:readFeed,write:writeFeed,search:discover,source:fetchSource}));}
  catch(error){return res.status(502).json({error:error.message});}
}
