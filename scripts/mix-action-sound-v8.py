from pathlib import Path
import json, hashlib, subprocess
import numpy as np
import soundfile as sf
ROOT=Path(__file__).resolve().parents[1]
P=ROOT/'projects/texas-ten-thousand-steps'
spec=json.loads((P/'editorial.json').read_text(encoding='utf-8'))
if spec['performanceVersion']!=8: raise RuntimeError('Expected V8')
ffmpeg=ROOT/'node_modules/ffmpeg-static/ffmpeg.exe'
def decode(path,speed=1):
    args=[str(ffmpeg),'-hide_banner','-loglevel','error','-i',str(path)]
    if speed!=1: args+=['-af','atempo='+str(speed)]
    out=subprocess.check_output(args+['-f','f32le','-ar','48000','-ac','2','pipe:1'])
    return np.frombuffer(out,dtype='<f4').reshape(-1,2).copy()
assets=ROOT/'story-projects/texas-ten-thousand-steps/assets'
n=round(spec['duration']*48000)
mix=np.zeros((n,2),dtype=np.float32)
base=decode(assets/'mix.wav',1.1);take=min(n,len(base));mix[:take]+=base[:take]*.88
foley=decode(assets/'foley.wav',1.1);a=15*48000;b=min(n-15*48000,len(foley));mix[a:b]+=foley[a:b]*.6
cache={}
for cue in spec['actionSound']['events']:
    name=cue['source']
    if name not in cache: cache[name]=decode(ROOT/'remotion/public'/name)
    sample=cache[name];length=min(len(sample),round(cue['frames']/60*48000))
    sample=sample[:length].copy()*cue['volume']
    tail=min(length,3200);sample[-tail:]*=np.linspace(1,0,tail,dtype=np.float32)[:,None]
    start=round(cue['frame']/60*48000);length=min(length,n-start)
    if length>0: mix[start:start+length]+=sample[:length]
peak=float(np.max(np.abs(mix)));gain=min(1,.85/max(peak,1e-9));mix*=gain
target=assets/'action-mix-v8.wav';sf.write(target,mix,48000,subtype='PCM_24')
dest='texas-ten-thousand-steps/action-sound/action-mix-v8.wav'
(ROOT/'remotion/public'/dest).write_bytes(target.read_bytes())
spec['actionSound']['master']=dest
spec['actionSound']['masterVersion']=hashlib.sha256(target.read_bytes()).hexdigest()[:16]
spec['actionSound']['mixReview']={'seconds':n/48000,'samplePeakBeforeGain':peak,'safetyGain':gain,'samplePeakAfterGain':peak*gain,'voiceSpeed':1.1,'eventCount':len(spec['actionSound']['events']),'listening':'User review pending; no listening claim.'}
(P/'editorial.json').write_text(json.dumps(spec,indent=2)+'\n',encoding='utf-8')
print('Prepared connected V8 action soundtrack:',spec['actionSound']['mixReview'])
