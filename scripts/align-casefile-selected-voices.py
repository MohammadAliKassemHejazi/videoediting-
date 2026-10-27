"""Local word timing and transcript sanity checks for selected-voice lines."""
from pathlib import Path
from difflib import SequenceMatcher
import json, re, os
ROOT = Path(__file__).resolve().parents[1]
os.environ['HF_HOME'] = str(ROOT/'.cache/huggingface-voices')
os.environ['HF_HUB_OFFLINE'] = '1'
import torch
import soundfile as sf
from transformers import pipeline
torch.set_num_threads(3)
folder = ROOT/'story-projects/texas-ten-thousand-steps/assets/selected-voices'
asr = pipeline('automatic-speech-recognition', model='openai/whisper-base.en', device='cpu', torch_dtype=torch.float32)
def normal(text):
    text = text.lower()
    numbers = {'8,400':'eight thousand four hundred','8400':'eight thousand four hundred','1,600':'sixteen hundred','1600':'sixteen hundred','10,000':'ten thousand','10000':'ten thousand','1964':'nineteen sixty-four','1965':'nineteen sixty-five','2019':'twenty nineteen','2025':'twenty twenty-five','57':'fifty-seven','7,000':'seven thousand','7000':'seven thousand'}
    for number, spoken in numbers.items(): text = re.sub(r'(?<!\d)'+re.escape(number)+r'(?!\d)',spoken,text)
    return re.sub(r'[^a-z0-9]', '', text)
results = []
for wav in sorted(folder.glob('*.wav')):
    meta = json.loads(wav.with_suffix('.json').read_text(encoding='utf-8'))
    dest = wav.with_suffix('.alignment.json')
    if dest.exists() and json.loads(dest.read_text())['sourceSHA256'] == meta['sha256']:
        cached = json.loads(dest.read_text())
        cached['characterAgreement'] = SequenceMatcher(None,normal(cached['expected']),normal(cached['recognized']),autojunk=False).ratio()
        dest.write_text(json.dumps(cached,indent=2)+'\n',encoding='utf-8')
        results.append(cached); continue
    audio, sr = sf.read(wav, dtype='float32')
    result = asr({'raw':audio,'sampling_rate':sr}, return_timestamps='word')
    expected, actual = meta['text'].split(), result['chunks']
    norm_expected, norm_actual = [normal(w) for w in expected], [normal(w['text']) for w in actual]
    sequence = SequenceMatcher(None,norm_expected,norm_actual,autojunk=False)
    anchors = {}
    for tag, i1, i2, j1, j2 in sequence.get_opcodes():
        if tag == 'equal':
            for i in range(i1,i2): anchors[i] = actual[j1+i-i1]['timestamp']
        elif tag == 'replace' and i2>i1 and j2>j1:
            start = actual[j1]['timestamp'][0] or 0
            end = actual[j2-1]['timestamp'][1] or len(audio)/sr
            for i in range(i1,i2): anchors[i] = [start+(end-start)*(i-i1)/(i2-i1),start+(end-start)*(i-i1+1)/(i2-i1)]
    words = []
    for i, word in enumerate(expected):
        if i in anchors:
            start,end = anchors[i]
        else:
            lo = max((j for j in anchors if j<i), default=-1)
            hi = min((j for j in anchors if j>i), default=len(expected))
            a = (anchors[lo][1] or 0) if lo>=0 else 0
            b = (anchors[hi][0] or len(audio)/sr) if hi<len(expected) else len(audio)/sr
            start = a+(b-a)*(i-lo-1)/max(1,hi-lo-1)
            end = a+(b-a)*(i-lo)/max(1,hi-lo-1)
        start = float(start or 0); end = float(end if end is not None else len(audio)/sr)
        words.append({'text':word,'start':start,'end':max(start+.02,end)})
    ratio = SequenceMatcher(None,normal(meta['text']),normal(result['text']),autojunk=False).ratio()
    record = {'id':wav.stem,'sourceSHA256':meta['sha256'],'expected':meta['text'],'recognized':result['text'].strip(),'characterAgreement':ratio,'words':words,'method':'Local Whisper word estimates mapped to canonical script, including interpolation for ASR differences. Not a phoneme alignment or listening review.'}
    dest.write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8');results.append(record)
    print(wav.stem+' / '+str(round(ratio,3))+' / '+result['text'].strip(),flush=True)
(folder/'ALIGNMENT_SUMMARY.json').write_text(json.dumps({'lines':results,'minimumAgreement':min(r['characterAgreement'] for r in results),'listeningReview':'Pending'},indent=2)+'\n',encoding='utf-8')
if len(results)!=28 or any(r['characterAgreement']<.77 for r in results):
    raise RuntimeError('Incomplete or low-agreement dialogue; inspect/retry flagged line before applying')
print('ALL_28_LINES_ALIGNED',flush=True)
