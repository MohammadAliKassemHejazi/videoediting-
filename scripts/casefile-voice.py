"""Local stock-voice performances with model-derived canonical word timings."""
from pathlib import Path
from dataclasses import asdict
from difflib import SequenceMatcher
import hashlib, json, os, re, sys
import numpy as np
import onnxruntime as rt
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT=Path(__file__).resolve().parents[1]
project=sys.argv[1]
if not re.fullmatch(r'[a-z0-9-]+',project): raise ValueError('Safe project ID required')
folder=ROOT/'projects'/project
out=ROOT/'story-projects'/project/'assets'
out.mkdir(parents=True,exist_ok=True)
script=json.loads((folder/'NARRATION.json').read_text(encoding='utf-8'))
lock=ROOT/'.cache/render.lock'
with lock.open('x',encoding='utf-8') as handle: handle.write(str(os.getpid()))
try:
    options=rt.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
    session=rt.InferenceSession(str(ROOT/'.cache/kokoro-models/kokoro-v1.0.onnx'),sess_options=options,providers=['CPUExecutionProvider'])
    engine=Kokoro.from_session(session,str(ROOT/'.cache/kokoro-models/voices-v1.0.bin'))
    if not engine.has_timings: raise RuntimeError('Voice engine has no timings')
    chunks=[];words=[];segments=[];offset=0.;rate=24000
    for number,segment in enumerate(script['segments']):
        canonical=segment['text'].split()
        spoken=[re.sub('Javelina','Havelina',w) for w in canonical]
        phonemes=' '.join(engine.tokenizer.phonemize(' '.join(spoken),'en-us').split())
        parts=[engine.tokenizer.phonemize(w,'en-us') for w in spoken]
        expected=' '.join(parts);alignment=SequenceMatcher(None,expected,phonemes,autojunk=False)
        if alignment.ratio()<.9: raise RuntimeError('Uncertain alignment for segment '+str(number))
        print('Synthesizing '+segment['speaker']+' / '+segment['voice'],flush=True)
        speed={'banker':1.0,'javelina':1.025,'narrator':1.045}[segment['speaker']]
        samples,rate,timings=engine.create_timed(phonemes,voice=segment['voice'],speed=speed,is_phonemes=True,continuous=True,sentence_pause=.22,clause_pause=.08)
        if ''.join(t.phoneme for t in timings)!=phonemes: raise RuntimeError('Timing coverage differs')
        mapping={}
        for tag,i1,i2,j1,j2 in alignment.get_opcodes():
            if tag=='equal': mapping.update((i,j1+i-i1) for i in range(i1,i2))
            elif tag in ('replace','delete'):
                for i in range(i1,i2): mapping[i]=min(len(phonemes)-1,j1+int((i-i1)*max(0,j2-j1-1)/max(1,i2-i1-1)))
        start_word=len(words);at=0
        for word,part in zip(canonical,parts):
            indices=sorted({mapping[i] for i in range(at,at+len(part)) if i in mapping and phonemes[mapping[i]] not in ' .,!?:;—-'})
            if not indices: raise RuntimeError('No phoneme for '+word)
            words.append({'text':word,'start':offset+timings[indices[0]].start,'end':offset+timings[indices[-1]].end,'speaker':segment['speaker']})
            at+=len(part)+1
        length=len(samples)/rate
        segments.append({**segment,'start':offset,'end':offset+length,'wordFrom':start_word,'wordTo':len(words),'speed':speed,'phonemeAlignmentRatio':alignment.ratio(),'phonemes':[asdict(t) for t in timings]})
        chunks.append(samples);offset+=length
        if number<len(script['segments'])-1:
            pause=np.zeros(round(rate*.14),dtype=np.float32);chunks.append(pause);offset+=len(pause)/rate
    audio=np.concatenate(chunks)
    sf.write(str(out/'narration.raw.wav'),audio,rate,subtype='PCM_16')
    text=' '.join(s['text'] for s in script['segments'])
    metadata={'engine':'kokoro-onnx 0.6.1','voices':{s['speaker']:s['voice'] for s in script['segments']},'sampleRate':rate,'duration':len(audio)/rate,'scriptHash':hashlib.sha256(text.encode()).hexdigest(),'canonicalScript':text,'segments':segments,'words':words,'timingMethod':'Model-predicted phoneme durations mapped to canonical words; listening review separate','synthesizerAlias':{'Javelina':'Havelina'}}
    (out/'narration.raw.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'Saved {len(audio)/rate:.2f}s with {len(words)} canonical timed words.',flush=True)
finally: lock.unlink(missing_ok=True)
