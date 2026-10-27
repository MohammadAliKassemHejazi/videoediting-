"""Second local ASR opinion on a disputed word, without claiming listening."""
from pathlib import Path
import os, json
ROOT = Path(__file__).resolve().parents[1]
os.environ['HF_HOME'] = str(ROOT/'.cache/huggingface-voices')
import torch
import soundfile as sf
from transformers import pipeline
torch.set_num_threads(3)
model = pipeline('automatic-speech-recognition',model='openai/whisper-small.en',device='cpu',torch_dtype=torch.float32)
folder=ROOT/'story-projects/texas-ten-thousand-steps/assets/selected-voices'
audio,sr=sf.read(folder/'27.wav',dtype='float32')
result=model({'raw':audio,'sampling_rate':sr},return_timestamps='word')
record={'expected':'The universal rule was the story.','recognized':result['text'].strip(),'asr':result,'method':'Second independent model-size estimate; not listening approval.'}
(folder/'27.secondary-check.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
print(record['recognized'],flush=True)
