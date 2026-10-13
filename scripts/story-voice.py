"""Generate scene narration with free Edge neural voices; preserve boundary metadata."""
import asyncio, json, pathlib, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.cache'/'python-deps'))
import edge_tts

async def main():
    folder=pathlib.Path(sys.argv[1]).resolve()
    if ROOT not in folder.parents: raise ValueError('Project must stay in workspace')
    config=json.loads((folder/'story.json').read_text(encoding='utf8'))
    voice=config['voice']
    available=await edge_tts.list_voices()
    if '--check-voices' in sys.argv:
        chosen=['en-US-AriaNeural','en-US-GuyNeural','ar-SA-ZariyahNeural','ar-SA-HamedNeural']
        print(json.dumps([{'voice':v['ShortName'],'locale':v['Locale']} for v in available if v['ShortName'] in chosen],ensure_ascii=False));return
    if voice not in {v['ShortName'] for v in available}: raise ValueError(f'Voice unavailable: {voice}')
    out=folder/'assets'/'voice';out.mkdir(parents=True,exist_ok=True)
    for i,scene in enumerate(config['scenes']):
        audio=out/f'{i:02}.mp3';metadata=out/f'{i:02}.json'
        signature={'voice':voice,'rate':config.get('rate','+0%'),'text':scene['narration']}
        if audio.exists() and metadata.exists() and json.loads(metadata.read_text(encoding='utf8')).get('input')==signature:
            continue
        print(f'Neural voice: scene {i+1}/{len(config["scenes"])} ({voice})',flush=True)
        boundaries=[]
        stream=edge_tts.Communicate(scene['narration'],voice,rate=signature['rate'],boundary='WordBoundary')
        pending=audio.with_suffix('.pending.mp3')
        with pending.open('wb') as target:
            async for chunk in stream.stream():
                if chunk['type']=='audio': target.write(chunk['data'])
                elif chunk['type']=='WordBoundary': boundaries.append({'start':chunk['offset']/10000000,'duration':chunk['duration']/10000000,'text':chunk['text']})
        if pending.stat().st_size==0: raise RuntimeError('No voice audio generated')
        pending.replace(audio)
        metadata.write_text(json.dumps({'input':signature,'words':boundaries},ensure_ascii=False,indent=2)+'\n',encoding='utf8')

asyncio.run(main())
