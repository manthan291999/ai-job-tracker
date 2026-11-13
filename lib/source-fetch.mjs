import https from 'node:https';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
export function publicAddress(ip) {
  if(isIP(ip)===6) return /^[23][0-9a-f]{3}:/i.test(ip)&&!/^2001:db8:/i.test(ip);
  if(isIP(ip)!==4) return false;
  const [a,b,c]=ip.split('.').map(Number);
  return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0||b===2)||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19||b===51&&c===100)||a===203&&b===0&&c===113);
}
export function sourceURL(input) {
  const u=new URL(input);
  if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443'||u.hostname==='localhost'||u.hostname.endsWith('.local')||!u.hostname.includes('.')) throw Error('Unsafe source URL');
  u.hash='';return u;
}
export async function fetchSource(input, redirects=0, deadline=Date.now()+5000) {
  if(Date.now()>=deadline)throw Error('Source timeout');
  const u=sourceURL(input);let timer;const records=await Promise.race([lookup(u.hostname,{all:true}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('DNS timeout')),Math.min(2500,Math.max(1,deadline-Date.now())));})]).finally(()=>clearTimeout(timer));
  if(!records.length||records.some(r=>!publicAddress(r.address))) throw Error('Non-public source');
  const chosen=records[0];
  const response=await new Promise((resolve,reject)=>{
    const req=https.get(u,{lookup:(_host,opts,cb)=>opts.all?cb(null,[chosen]):cb(null,chosen.address,chosen.family),signal:AbortSignal.timeout(Math.max(1,deadline-Date.now())),headers:{'User-Agent':'AIJobTracker/1.1 (job listing verification)','Accept':'text/html,application/ld+json'},timeout:4500},res=>{
      if([301,302,303,307,308].includes(res.statusCode)){res.resume();resolve({redirect:res.headers.location});return;}
      if(res.statusCode!==200){res.resume();reject(Error('Source status '+res.statusCode));return;}
      if(!/html|json/i.test(res.headers['content-type']||'')){res.resume();reject(Error('Unsupported source content'));return;}
      let html='',size=0;res.setEncoding('utf8');res.on('data',chunk=>{size+=Buffer.byteLength(chunk);if(size>1500000){res.destroy();reject(Error('Source too large'));return;}html+=chunk;});res.on('end',()=>resolve({html,url:u.href}));res.on('error',reject);
    });req.on('timeout',()=>req.destroy(Error('Source timeout')));req.on('error',reject);
  });
  if(response.redirect){if(redirects>=3)throw Error('Too many redirects');return fetchSource(new URL(response.redirect,u).href,redirects+1,deadline);}
  return response;
}
