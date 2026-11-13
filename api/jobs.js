import { configured, readFeed } from '../lib/storage.mjs';
import { publicFeed } from '../lib/job-feed.mjs';
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const ready=configured();
  if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(200).json(publicFeed(null,ready));
  try{const {state}=await readFeed();return res.status(200).json(publicFeed(state,ready));}
  catch{return res.status(503).json({error:'Feed storage unavailable. Your saved jobs are unchanged.'});}
}
