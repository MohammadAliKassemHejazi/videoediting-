"""Generate isolated native stock-voice samples; no render daemon or video export."""
from pathlib import Path
from dataclasses import asdict
import hashlib,json,os
import numpy as np
import onnxruntime as rt
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT=Path(__file__).resolve().parents[1]
folder=ROOT/'series/texas-casefiles/voice-casting'
request=json.loads((folder/'REQUEST.json').read_text())
out=ROOT/'out/texas-casefiles-voices';out.mkdir(parents=True,exist_ok=True)
lock=ROOT/'.cache/voice-casting.lock'
if (ROOT/'.cache/render.lock').exists():raise RuntimeError('A production job is active; do not compete with it')
with lock.open('x') as f:f.write(str(os.getpid()))
try:
    options=rt.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
    session=rt.InferenceSession(str(ROOT/request['model']),sess_options=options,providers=['CPUExecutionProvider'])
    engine=Kokoro.from_session(session,str(ROOT/request['voices']))
    records=[]
    for c in request['candidates']:
        text=request['texts'][c['role']]
        samples,rate,timings=engine.create_timed(text,voice=c['voice'],speed=c['speed'],lang=c['lang'],continuous=True,sentence_pause=.18,clause_pause=.075)
        samples=np.asarray(samples,dtype=np.float32)
        if not np.isfinite(samples).all() or len(samples)<rate:raise RuntimeError('Invalid voice '+c['id'])
        raw=out/(c['id']+'-raw.wav');sf.write(raw,samples,rate,subtype='FLOAT')
        hop=round(rate*.02);energy=np.sqrt(np.mean(samples[:len(samples)//hop*hop].reshape(-1,hop)**2,axis=1))
        active=energy[energy>max(.002,float(energy.max())*.06)]
        rms=float(np.sqrt(np.mean(active**2)));peak=float(np.max(np.abs(samples)))
        gain=min(10**(-20/20)/max(rms,1e-8),.88/max(peak,1e-8));clean=samples*gain
        file=out/(c['id']+'.wav');sf.write(file,clean,rate,subtype='PCM_16')
        digest=hashlib.sha256(file.read_bytes()).hexdigest()
        record={**c,'text':text,'file':file.name,'raw':raw.name,'sampleRate':rate,'duration':len(samples)/rate,'constantGain':gain,'samplePeakDbfs':20*np.log10(max(float(np.max(np.abs(clean))),1e-8)),'sha256':digest,'phonemes':[asdict(t) for t in timings],'review':'Generated and finite/peak checked. Listening and character-casting approval pending.'}
        records.append(record);print('Native voice: '+c['id']+' / '+str(round(record['duration'],2))+'s',flush=True)
    report={'series':'texas-casefiles','engine':'Existing Kokoro ONNX; CPU only','modelSHA256':hashlib.sha256((ROOT/request['model']).read_bytes()).hexdigest(),'voicesSHA256':hashlib.sha256((ROOT/request['voices']).read_bytes()).hexdigest(),'processing':request['processing'],'emotionalLimit':request['emotionalLimit'],'candidates':records,'pairs':request['pairs'],'castApproved':False,'videoExportStarted':False}
    (folder/'AUDITIONS.json').write_text(json.dumps(report,indent=2)+'\n')
    print('Five clean voice auditions ready; no video/export job started.',flush=True)
finally:lock.unlink(missing_ok=True)
