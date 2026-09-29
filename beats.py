"""Beat grid + transient hits from an audio track.

Usage: python beats.py <audio_path> > beats.json
"""
import json
import sys

import numpy as np
import librosa

if len(sys.argv) < 2:
    print("Usage: python beats.py <audio_path>", file=sys.stderr)
    sys.exit(1)

y, sr = librosa.load(sys.argv[1], sr=None, mono=True)

tempo, frames = librosa.beat.beat_track(y=y, sr=sr, units="frames")
beats = librosa.frames_to_time(frames, sr=sr).round(3).tolist()

onset = librosa.onset.onset_strength(y=y, sr=sr)
peaks = librosa.util.peak_pick(onset, pre_max=3, post_max=3, pre_avg=3, post_avg=5, delta=0.5, wait=10)
hits = librosa.frames_to_time(peaks, sr=sr).round(3).tolist()

json.dump(
    {
        "bpm": float(np.atleast_1d(tempo)[0]),
        "beats": beats,
        "downbeats": beats[::4],
        "hits": hits,
    },
    sys.stdout,
    indent=2,
)
