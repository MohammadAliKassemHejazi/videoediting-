"""Generate episode lines locally from the two user-selected voice references.

Audio-only; never exports video or starts a render/ComfyUI service.
"""
from pathlib import Path
import hashlib, json, os, time, gc, sys, shutil
ROOT = Path(__file__).resolve().parents[1]
os.environ['HF_HOME'] = str(ROOT/'.cache/huggingface-voices')
os.environ['HF_HUB_OFFLINE'] = '1'
import torch
import numpy as np
import soundfile as sf
from qwen_tts import Qwen3TTSModel

torch.set_num_threads(3)
META = ROOT/'series/texas-casefiles/voice-casting'
OUT = ROOT/'story-projects/texas-ten-thousand-steps/assets/selected-voices'
OUT.mkdir(parents=True, exist_ok=True)
spec = json.loads((ROOT/'projects/texas-ten-thousand-steps/editorial.json').read_text(encoding='utf-8'))
only = next((arg.split('=',1)[1].split(',') for arg in sys.argv if arg.startswith('--only=')), None)
attempt = int(next((arg.split('=',1)[1] for arg in sys.argv if arg.startswith('--retry=')), '0'))
refs = json.loads((META/'SELECTED.json').read_text(encoding='utf-8'))['references']
record = json.loads((META/'LOCAL_MODEL.json').read_text(encoding='utf-8'))
lock = ROOT/'.cache/selected-voice-generation.lock'
with lock.open('x') as f: f.write(str(os.getpid()))
try:
    model = Qwen3TTSModel.from_pretrained(record['localPath'], device_map='cuda:0', dtype=torch.bfloat16, attn_implementation='sdpa')
    prompts = {}
    for role, ref in refs.items():
        prompts[role] = model.create_voice_clone_prompt(ref_audio=str(ROOT/ref['file']), ref_text=ref['transcript'], x_vector_only_mode=False)
        print('Reference encoded: '+role, flush=True)
    for shot in spec['shots']:
        if only and shot['id'] not in only: continue
        role = 'javelina' if shot.get('speaker') == 'javelina' else 'banker'
        text = shot['voiceover']
        key = hashlib.sha256((text+refs[role]['sha256']+record['revision']+('retry'+str(attempt) if attempt else '')).encode()).hexdigest()
        wav, metadata = OUT/(shot['id']+'.wav'), OUT/(shot['id']+'.json')
        if wav.exists() and metadata.exists():
            previous = json.loads(metadata.read_text())
            same_source = previous.get('text') == text and previous.get('referenceSHA256') == refs[role]['sha256'] and previous.get('revision') == record['revision']
            if same_source and (not attempt or previous['generationKey'] == key):
                print('Reuse '+shot['id'], flush=True)
                continue
        if attempt and wav.exists():
            backup = OUT/('before-retry-'+str(attempt)); backup.mkdir(exist_ok=True)
            for prior in [wav,metadata,wav.with_suffix('.alignment.json')]:
                if prior.exists() and not (backup/prior.name).exists(): shutil.copy2(prior,backup/prior.name)
        torch.manual_seed(1965+int(shot['id'])+attempt*101)
        started = time.time()
        print('Generating '+shot['id']+' / '+role+' / '+text, flush=True)
        with torch.inference_mode():
            audio, sr = model.generate_voice_clone(text=text, language='English', voice_clone_prompt=prompts[role], non_streaming_mode=True, max_new_tokens=400, temperature=.65 if attempt else .75, top_p=.9, repetition_penalty=1.05)
        samples = np.asarray(audio[0], dtype=np.float32)
        if not np.isfinite(samples).all() or len(samples)/sr < .25:
            raise RuntimeError('Invalid generated audio '+shot['id'])
        sf.write(wav, samples, sr, subtype='PCM_24')
        metadata.write_text(json.dumps({'generationKey':key, 'model':record['model'], 'revision':record['revision'], 'license':'Apache-2.0', 'role':role, 'referenceSHA256':refs[role]['sha256'], 'text':text, 'duration':len(samples)/sr, 'sampleRate':sr, 'sha256':hashlib.sha256(wav.read_bytes()).hexdigest(), 'secondsToGenerate':round(time.time()-started,2), 'review':'Generated; local ASR and user listening review follow.'}, indent=2)+'\n', encoding='utf-8')
        print('Saved '+shot['id']+' / '+str(round(len(samples)/sr,2))+'s / '+str(round(time.time()-started,1))+'s compute', flush=True)
        torch.cuda.empty_cache()
    del model
    gc.collect()
    torch.cuda.empty_cache()
    print('ALL_28_SELECTED_VOICE_LINES_GENERATED', flush=True)
finally:
    lock.unlink(missing_ok=True)
