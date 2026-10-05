#!/usr/bin/env python3
"""Finds where the real word starts in every single-word clip and writes
scripts/audio-cuts.json (clip hash -> seconds to cut from the front).

Why: Kokoro adds a short "uh/ee" sound before most single words ("cat" comes out
as "a ... cat"). Speech-to-text word timings show where that stray sound ends.
Run after build_audio.py has recorded the clips (with no cuts), then run
build_audio.py again to apply them:

    pip install faster-whisper
    python scripts/measure_cuts.py
"""
import json
import re
import subprocess
import tempfile
from pathlib import Path

from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parent.parent
INDEX = json.loads((ROOT / "scripts" / "audio-index.json").read_text())
OUT = ROOT / "scripts" / "audio-cuts.json"

# stray sounds the model hears in front of a word
JUNK = {"a", "i", "and", "it's", "i'm", "say", "any", "aye", "uh", "eh", "z", "the", "of", "in", "to", "at", "as", "he", "hey"}
MAX_BURST = 0.30  # the stray sound is always shorter than this


def norm(text: str) -> str:
    return re.sub(r"[^a-z']", "", text.lower())


model = WhisperModel("base.en", device="cpu", compute_type="int8")
cuts: dict[str, float] = {}
items = [(h, m) for h, m in sorted(INDEX.items()) if " " not in m["say"].strip()]
print(f"{len(items)} single-word clips")

for n, (h, meta) in enumerate(items, 1):
    src = ROOT / "public" / "audio" / f"{h}.m4a"
    if not src.exists():
        continue
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "c.wav"
        subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@16000", "-c", "1", str(src), str(wav)], check=True)
        segs, _ = model.transcribe(str(wav), language="en", beam_size=1, word_timestamps=True, condition_on_previous_text=False)
        words = [w for s in segs for w in s.words]
    if len(words) < 2:
        continue  # nothing separate to cut (or the stray sound is fused with the word)
    first = words[0]
    first_text = norm(first.word)
    expected = norm(meta["say"])
    if first.end > MAX_BURST:
        continue
    # a real first syllable ("bas" of basket) is a prefix of the word - keep it
    if first_text not in JUNK and expected.startswith(first_text):
        continue
    cuts[h] = round(max(0.0, first.end - 0.03), 2)
    if n % 50 == 0:
        print(n, len(items), flush=True)

OUT.write_text(json.dumps(cuts, indent=0, sort_keys=True))
print(f"cuts for {len(cuts)} of {len(items)} clips -> {OUT}")
