"""Numerical reference analysis; never claims listening or source separation."""
from pathlib import Path
import json
import numpy as np
import soundfile as sf

ROOT=Path(__file__).resolve().parents[1]
project='texas-ten-thousand-steps'
cache=ROOT/'.cache'/project
def load(name):
    a,sr=sf.read(str(cache/name),dtype='float32');assert sr==16000
    return a.mean(axis=1) if a.ndim>1 else a
def features(a):
    result=[];size=1024;step=320
    for start in range(0,len(a)-size,step):
        y=a[start:start+size].astype(np.float64);y-=y.mean()
        rms=float(np.sqrt(np.mean(y*y)))
        if rms<.009: continue
        f=np.fft.rfft(y,n=2048);acf=np.fft.irfft(f*f.conj(),n=2048)[:size]
        power=np.concatenate(([0.],np.cumsum(y*y)));lags=np.arange(1,230)
        diff=power[size-lags]+power[size]-power[lags]-2*acf[lags]
        cmnd=diff*lags/np.maximum(np.cumsum(diff),1e-12)
        candidates=np.where((lags>=39)&(cmnd<.22))[0]
        if not len(candidates):continue
        k=int(candidates[0])
        while k+1<len(cmnd) and cmnd[k+1]<cmnd[k]:k+=1
        result.append((start/16000,16000/float(lags[k]),float(1-cmnd[k]),rms))
    return result
def stats(f,ranges):
    selected=[x for x in f if any(lo<=x[0]<hi for lo,hi in ranges)]
    if not selected:return {'frames':0}
    p=np.array([x[1] for x in selected]);return {'voicedFrames':len(p),'estimatedF0Hz':{'p20':round(float(np.percentile(p,20)),1),'median':round(float(np.median(p)),1),'p80':round(float(np.percentile(p,80)),1)}}
reference=load('reference-analysis.wav');ours=load('v2-voice-analysis.wav')
rf=features(reference);of=features(ours)
base=json.loads((ROOT/'projects'/project/'versions/v2/editorial.json').read_text())
ranges={role:[(s['startFrame']/60,(s['startFrame']+s['durationFrames'])/60) for s in base['shots'] if (s.get('speaker') or 'narrator')==role] for role in ['banker','javelina','narrator']}
# Roles are inferred from script/visual coverage, not machine speaker identification.
roles={'anxious dialogue':[(0,4.05),(5.68,10.88),(16.1,17.5),(22.8,23.7)],'confident dialogue':[(4.12,5.67),(10.88,16.05),(17.54,21.5),(24.8,28)],'main narration':[(28,45)]}
# Low-band transients are candidate foot/body impacts; speech/music can overlap.
f=np.fft.rfft(reference);freq=np.fft.rfftfreq(len(reference),1/16000);f[(freq<45)|(freq>180)]=0
low=np.fft.irfft(f,n=len(reference));hop=320;n=len(low)//hop
energy=np.sqrt(np.mean(low[:n*hop].reshape(n,hop)**2,axis=1));floor=np.array([np.median(energy[max(0,i-15):i+16]) for i in range(n)])
score=energy/np.maximum(.002,floor);peaks=[]
for i in range(1,min(n-1,1400)):
    if score[i]>1.7 and energy[i]>.008 and score[i]>=score[i-1] and score[i]>score[i+1] and (not peaks or i*.02-peaks[-1]['time']>.2):peaks.append({'time':round(i*.02,2),'relativeEnergy':round(float(score[i]),2)})
report={'reference':{k:stats(rf,v) for k,v in roles.items()},'currentV2':{k:stats(of,v) for k,v in ranges.items()},'openingLowBandImpactCandidates':peaks,'method':'16kHz mono, FFT/YIN-style difference, 39–229-sample lags, voiced threshold0.78; low-band45–180Hz energy candidates. Voice-role windows inferred from estimated transcript and visual coverage.','limits':'Mixed recording: pitch may include music or octave errors. Candidates do not prove isolated footsteps. No listening review, exact speaker identification or voice cloning is claimed.'}
if (cache/'v3-voice-analysis.wav').exists():
    current=json.loads((ROOT/'projects'/project/'editorial.json').read_text());new=features(load('v3-voice-analysis.wav'))
    report['currentV3']={role:stats(new,[(s['startFrame']/60,(s['startFrame']+s['durationFrames'])/60) for s in current['shots'] if (s.get('speaker') or 'narrator')==role]) for role in ranges}
out=ROOT/'projects'/project/'REFERENCE_AUDIO_ANALYSIS.json';out.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k in ('reference','currentV2','currentV3')},indent=2))
