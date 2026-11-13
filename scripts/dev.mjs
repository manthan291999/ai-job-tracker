import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve,extname } from 'node:path';
const root=resolve('dist'),types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.ttf':'font/ttf','.pdf':'application/pdf','.css':'text/css'};
const handlers={'/api/jobs':(await import('../api/jobs.js')).default,'/api/cron/refresh':(await import('../api/cron/refresh.js')).default};
createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(handlers[url.pathname]){res.status=code=>(res.statusCode=code,res);res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};return await handlers[url.pathname](req,res);}const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!path.startsWith(root+'/')){res.writeHead(403);return res.end();}res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end('Not found');}}).listen(3000,'0.0.0.0',()=>console.log('AI Job Tracker at http://localhost:3000'));
