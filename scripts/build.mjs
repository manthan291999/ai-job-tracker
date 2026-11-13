import { access, readFile } from 'node:fs/promises';
for (const path of ['dist/index.html','dist/resume.html','dist/resume-core.js','dist/jobs-feed.js','api/jobs.js','api/cron/refresh.js']) await access(path);
for (const path of ['dist/index.html','dist/resume.html']) {
  const html=await readFile(path,'utf8');
  for (const [,src] of html.matchAll(/<script[^>]+src="\.\/([^"?]+)"/g)) await access('dist/'+src);
  const script=html.split('<script>')[1]?.split('</script>')[0];
  if(script) new Function(script);
}
console.log('Static assets and Vercel function entrypoints are ready.');
