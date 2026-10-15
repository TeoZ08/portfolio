import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.env.QA_OUT||'qa-results/goal19');
await mkdir(path.join(root,'EVIDENCIAS'),{recursive:true});
const report={startedAt:new Date().toISOString(),jobs:[]};
const jobs=[
 ['journeys','JOURNEY.DESKTOP,JOURNEY.TOUCH,MAP.DESKTOP,MAP.TOUCH.LOW'],
 ['controls'],['surfaces'],['content'],['interiors'],['completion','COMPLETE.NAVIGATION.LINKS,COMPLETE.HOUSE.DETAILS,COMPLETE.GALLERY.LINKS.EXITS'],
 ['performance']
];
for(const [suite,only] of jobs){
 const job={suite,only,startedAt:new Date().toISOString()};report.jobs.push(job);
 const out=path.join(root,suite),log=createWriteStream(path.join(root,'EVIDENCIAS',suite+'.log'));
 const args=suite==='performance'?['qa/performance.mjs']:['qa/run-functional.mjs'];
 const env={...process.env,QA_OUT:out,QA_BASE_URL:'http://localhost:3156',QA_SUITE:suite,QA_ONLY:only||'',QA_PHASE:'goal19',QA_BASELINE_URL:'http://localhost:3157',QA_CANDIDATE_URL:'http://localhost:3156'};
 const child=spawn(process.execPath,args,{env,stdio:['ignore','pipe','pipe']});job.pid=child.pid;child.stdout.pipe(log);child.stderr.pipe(log);
 await writeFile(path.join(root,'EVIDENCIAS/pipeline.json'),JSON.stringify(report,null,2));
 job.exitCode=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve);});job.finishedAt=new Date().toISOString();log.end();
 console.log(suite,job.exitCode);await writeFile(path.join(root,'EVIDENCIAS/pipeline.json'),JSON.stringify(report,null,2));
}
report.finishedAt=new Date().toISOString();await writeFile(path.join(root,'EVIDENCIAS/pipeline.json'),JSON.stringify(report,null,2));
process.exitCode=report.jobs.some(j=>j.exitCode!==0)?1:0;
