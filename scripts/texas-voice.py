"""Local narrated episode with model-derived phoneme/word timing.

Kokoro inference is CPU-only and separate from H3. Canonical script text remains
the caption source; pronunciation aliases only affect the synthesizer input.
"""
from pathlib import Path
from dataclasses import asdict
from difflib import SequenceMatcher
import hashlib
import json
import os
import re
import numpy as np
import onnxruntime as rt
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / 'projects' / 'texas-cinema-myth'
OUT = ROOT / 'story-projects' / 'texas-cinema-myth' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)
lock = ROOT / '.cache' / 'render.lock'
with lock.open('x', encoding='utf-8') as handle:
    handle.write(str(os.getpid()))
try:
    document = (FOLDER / 'VOICEOVER_DRAFT.md').read_text(encoding='utf-8')
    script = document.split('VOICEOVER SCRIPT (English approval draft):')[1].split('EDITING NOTES:')[0].strip()
    words = script.split()
    speech_words = [re.sub('Javelina', 'Havelina', word) for word in words]
    spoken = ' '.join(speech_words)
    options = rt.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    session = rt.InferenceSession(str(ROOT / '.cache/kokoro-models/kokoro-v1.0.onnx'), sess_options=options, providers=['CPUExecutionProvider'])
    engine = Kokoro.from_session(session, str(ROOT / '.cache/kokoro-models/voices-v1.0.bin'))
    if not engine.has_timings:
        raise RuntimeError('This voice export cannot provide real phoneme timings')
    phonemes = ' '.join(engine.tokenizer.phonemize(spoken, 'en-us').split())
    expected_parts = [engine.tokenizer.phonemize(word, 'en-us') for word in speech_words]
    expected = ' '.join(expected_parts)
    alignment = SequenceMatcher(None, expected, phonemes, autojunk=False)
    if alignment.ratio() < .9:
        raise RuntimeError('Canonical word to contextual phoneme alignment is too uncertain')
    print('Synthesizing full English story locally with am_michael; no hosted voice API.', flush=True)
    samples, rate, timings = engine.create_timed(phonemes, voice='am_michael', speed=1.06, is_phonemes=True, continuous=True, sentence_pause=.2, clause_pause=.07)
    sf.write(str(OUT / 'narration.raw.wav'), samples, rate, subtype='PCM_16')
    actual = ''.join(t.phoneme for t in timings)
    if actual != phonemes:
        (OUT / 'phoneme-alignment-debug.json').write_text(json.dumps({'expected':phonemes, 'actual':actual}, ensure_ascii=False, indent=2), encoding='utf-8')
        raise RuntimeError('Duration output does not cover the requested phoneme sequence exactly')
    mapping = {}
    for tag, i1, i2, j1, j2 in alignment.get_opcodes():
        if tag == 'equal':
            mapping.update((i, j1 + i - i1) for i in range(i1, i2))
        elif tag in ('replace', 'delete'):
            for i in range(i1, i2):
                mapping[i] = min(len(phonemes)-1, j1 + int((i-i1) * max(0,j2-j1-1) / max(1,i2-i1-1)))
    caption_words, at = [], 0
    for word, part in zip(words, expected_parts):
        indices = sorted({mapping[i] for i in range(at, at+len(part)) if i in mapping and phonemes[mapping[i]] not in ' .,!?:;—-'})
        if not indices:
            raise RuntimeError('No real phoneme duration for '+word)
        caption_words.append({'text':word,'start':timings[indices[0]].start,'end':timings[indices[-1]].end})
        at += len(part)+1
    for previous, current in zip(caption_words, caption_words[1:]):
        if current['start'] < previous['start']:
            raise RuntimeError('Word timings are out of order')
    metadata = {'engine':'kokoro-onnx 0.6.1','voice':'am_michael','sampleRate':rate,'duration':len(samples)/rate,'speed':1.06,'scriptHash':hashlib.sha256(script.encode()).hexdigest(),'canonicalScript':script,'synthesizerAlias':{'Javelina':'Havelina'},'phonemeAlignmentRatio':alignment.ratio(),'timingMethod':'Model-predicted phoneme durations mapped to canonical script words; not an independent listening review','words':caption_words,'phonemes':[asdict(t) for t in timings]}
    (OUT / 'narration.raw.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(f"Saved {len(samples)/rate:.2f}s raw narration with {len(caption_words)} timed words; listening review pending.", flush=True)
finally:
    lock.unlink(missing_ok=True)
