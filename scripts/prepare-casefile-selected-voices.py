"""Prepare user-selected voice references and a pinned local cloning model."""
from pathlib import Path
import hashlib, json, os

ROOT = Path(__file__).resolve().parents[1]
os.environ['HF_HOME'] = str(ROOT / '.cache/huggingface-voices')
import torch
import soundfile as sf
from huggingface_hub import HfApi, snapshot_download
from transformers import pipeline

torch.set_num_threads(3)
OUT = ROOT / 'series/texas-casefiles/voice-casting'
CACHE = ROOT / '.cache/texas-ten-thousand-steps/selected-voices'
CACHE.mkdir(parents=True, exist_ok=True)
asr = pipeline('automatic-speech-recognition', model='openai/whisper-base.en', device='cpu', torch_dtype=torch.float32)
refs = {}
for role, filename in [('banker', 'audio.wav'), ('javelina', 'audio (1).wav')]:
    path = ROOT / 'series/texas-casefiles' / filename
    audio, sr = sf.read(path, dtype='float32')
    if audio.ndim > 1: audio = audio.mean(axis=1)
    result = asr({'raw': audio, 'sampling_rate': sr}, return_timestamps='word')
    refs[role] = {'file': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'duration': len(audio)/sr, 'sampleRate': sr, 'transcript': result['text'].strip(), 'asr': result, 'selection': 'User explicitly assigned this recording to the recurring character.', 'rights': 'User-supplied for this commercial series; source service/license not independently documented.'}
    print(role + ': ' + refs[role]['transcript'], flush=True)
(OUT/'SELECTED.json').write_text(json.dumps({'status': 'User-selected references; synthesized episode listening approval pending', 'references': refs, 'transcription': 'Local Whisper estimate, not a listening review.'}, indent=2)+'\n', encoding='utf-8')
del asr
model_id = 'Qwen/Qwen3-TTS-12Hz-1.7B-Base'
revision = HfApi().model_info(model_id).sha
print('Downloading pinned local clone model ' + revision, flush=True)
path = snapshot_download(model_id, revision=revision, ignore_patterns=['*.bin', '*.onnx', '*.md'])
record = {'model': model_id, 'revision': revision, 'localPath': path, 'license': 'Apache-2.0', 'source': 'https://huggingface.co/'+model_id, 'runtime': 'qwen-tts==0.1.1, transformers==4.57.3; isolated environment reuses existing read-only torch install'}
(OUT/'LOCAL_MODEL.json').write_text(json.dumps(record, indent=2)+'\n', encoding='utf-8')
print('SELECTED_VOICES_READY', flush=True)
