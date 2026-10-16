from pathlib import Path
import json,subprocess,sys
P=Path('/home/matteo/Documentos/ChatGPT-Codex/GOAL-21-evolucao-animacoes-2026-10-16');revision=int(sys.argv[1]);condition=sys.argv[2];suffix='-'+sys.argv[3] if len(sys.argv)>3 else '';manifestfile=f'render-cycle{revision}-{condition}{suffix}.json';manifest=json.loads((P/'EVIDENCIAS'/manifestfile).read_text());out=P/'VIDEOS'/f'cycle{revision}-{condition}{suffix}';out.mkdir(exist_ok=True,parents=True);rows=[]
for clip in dict.fromkeys(x['clip'] for x in manifest['clips']):
 streams=[next(x for x in manifest['clips'] if x['clip']==clip and x['view']==view) for view in ['front','profile','three-quarter']]
 assert all([f['index'] for f in x['frames']]==list(range(len(x['frames']))) for x in streams),'Need full sequential renders, not stills'
 args=['ffmpeg','-y','-loglevel','error']
 for s in streams:args+=['-framerate',str(manifest['fps']),'-i',str((P/s['frames'][0]['path']).parent/'%04d.png')]
 file=out/f'{clip}-1x.mp4';subprocess.run(args+['-filter_complex','hstack=inputs=3','-c:v','libx264','-threads','2','-pix_fmt','yuv420p','-movflags','+faststart',str(file)],check=True)
 slow=out/f'{clip}-0.5x.mp4';subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(file),'-vf','setpts=2*PTS','-c:v','libx264','-threads','2','-pix_fmt','yuv420p','-movflags','+faststart',str(slow)],check=True)
 for rate,f in [(1,file),(.5,slow)]:
  subprocess.run(['ffmpeg','-v','error','-i',str(f),'-f','null','-'],check=True);meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size','-show_entries','stream=codec_name,width,height,nb_frames','-of','json',str(f)]));rows.append({'clip':clip,'rate':rate,'file':str(f.relative_to(P)),'metadata':meta,'decoded':True,'sourceManifest':'EVIDENCIAS/'+manifestfile})
(P/'EVIDENCIAS'/f'videos-cycle{revision}-{condition}{suffix}.json').write_text(json.dumps(rows,indent=2)+'\n');print('VIDEOS_OK',revision,condition,len(rows))
