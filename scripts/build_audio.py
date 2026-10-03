#!/usr/bin/env python3
"""Records every line the app speaks as an audio clip (Kokoro "Sky" voice).

Clips go to public/audio/<hash>.m4a and the list of available hashes to
src/data/audioManifest.json; src/audio/speech.js plays them and falls back to
the browser voice for anything missing (it warns in the dev console).

Run after adding or changing anything the app says:

    python scripts/build_audio.py --model /path/to/kokoro-v1.0.onnx \
                                  --voices /path/to/voices-v1.0.bin

Needs: pip install kokoro-onnx soundfile numpy (Python 3.10+), the two Kokoro
model files (github.com/thewh1teagle/kokoro-onnx, "model-files-v1.0"), and
macOS's `afconvert` (wav -> m4a). Word lists are read from the game source
files so they cannot drift; the few spoken sentences are listed below and
checked against the source (the script fails loudly if one changes).
"""
import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
OUT = ROOT / "public" / "audio"
MANIFEST = SRC / "data" / "audioManifest.json"
INDEX = ROOT / "scripts" / "audio-index.json"  # hash -> {key, say}, used as a cache

# Voices. "default" reads words, letters, instructions and popups. Each guide
# also has its own character voice for the lines it speaks itself (welcomes,
# "Let's go!", hint-bubble messages). Everything is slow and clear for young
# readers: sentences slower than single words/letters.
#   pitch > 1 = higher and smaller, < 1 = deeper and bigger. It is applied by
#   resampling (so the voice gets a bigger/smaller "body"), with the Kokoro
#   speed pre-compensated so the final pace is still sentence/word below.
VOICES = {
    "default":  dict(voice="af_sky",    lang="en-us", pitch=1.00, sentence=0.76, word=0.85),
    "sloth":    dict(voice="af_heart",  lang="en-us", pitch=1.00, sentence=0.74, word=0.82),
    "monkey":   dict(voice="am_puck",   lang="en-us", pitch=1.08, sentence=0.80, word=0.85),
    "mimi":     dict(voice="bf_lily",   lang="en-gb", pitch=1.20, sentence=0.78, word=0.85),
    "lion":     dict(voice="am_onyx",   lang="en-us", pitch=0.90, sentence=0.72, word=0.80),
    "cheetah":  dict(voice="am_liam",   lang="en-us", pitch=1.06, sentence=0.84, word=0.88),
    "elephant": dict(voice="bf_emma",   lang="en-gb", pitch=0.90, sentence=0.72, word=0.80),
    "gorilla":  dict(voice="am_fenrir", lang="en-us", pitch=0.84, sentence=0.68, word=0.78),
}

# How to say things that TTS gets wrong. Must match src/audio/speech.js clipKey().
LETTER_NAMES = {
    "a": "ay", "b": "bee", "c": "see", "d": "dee", "e": "ee", "f": "eff", "g": "gee",
    "h": "aitch", "i": "eye", "j": "jay", "k": "kay", "l": "el", "m": "em", "n": "en",
    "o": "oh", "p": "pee", "q": "cue", "r": "are", "s": "ess", "t": "tee", "u": "you",
    "v": "vee", "w": "double you", "x": "ex", "y": "why", "z": "zee",
}
# Pieces of words that sound different on their own (key: "syl:<piece>").
SYLLABLE_SAY = {
    "ti": "tie", "ger": "gur", "rab": "rab", "bit": "bit", "mu": "mew", "sic": "sick",
    "hap": "hap", "py": "pee", "gar": "gar", "den": "den", "pen": "pen", "cil": "sill",
    "but": "but", "ter": "tur", "fly": "fly", "el": "el", "e": "eh", "phant": "fant",
    "com": "kom", "pu": "pew", "nan": "nan", "ba": "buh", "a": "uh", "di": "dye",
    "no": "no", "saur": "sore", "ad": "ad", "ven": "ven", "ture": "cher",
}


def hash_key(key: str) -> str:
    """FNV-1a 32-bit, identical to hashKey() in src/audio/speech.js."""
    h = 0x811C9DC5
    for ch in key:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


def clip_key(text: str) -> str:
    """Identical to clipKey() in src/audio/speech.js."""
    text = text.replace("‘", "'").replace("’", "'")
    text = re.sub(r"dyscover", "discover", text, flags=re.I)
    return re.sub(r"\s+", " ", text).strip().lower()


def read(rel: str) -> str:
    return (SRC / rel).read_text()


def require_in_source(rel: str, snippet: str) -> None:
    if snippet not in read(rel):
        raise SystemExit(f"Spoken line no longer found in src/{rel}:\n  {snippet}\nUpdate scripts/build_audio.py.")


def voice_sig(name: str) -> str:
    """Cache signature: re-record a clip when its voice settings change."""
    v = VOICES[name]
    if name == "default":
        return f"{v['sentence']}/{v['word']}"  # unchanged from before voices existed
    return json.dumps(v, sort_keys=True)


lines: dict[str, tuple[str, str]] = {}  # clip key -> (what to say, voice name)


def add(text: str, say: str | None = None, key: str | None = None, voice: str = "default") -> None:
    key = key or clip_key(text)
    if voice != "default":
        key = f"{voice}|{key}"  # same format speak(text, {voice}) looks up in speech.js
    lines.setdefault(key, (say or text, voice))


# Hint-bubble messages (what each game's guide says when you tap Listen).
HINT_SOURCES = {
    "pages/CheetahChallengeGame.jsx": "Ready, set, go! Say the word out loud as fast as you can.",
    "pages/LionsLettersGame.jsx": "Tap the sound box to hear the letters, then trace them!",
    "pages/ParrotPairsGame.jsx": "Can you find the letters that got mixed up? Tap the speaker to hear the word!",
    "pages/SyllableSafariGame.jsx": "Tap the pieces to hear them, then build the word in order!",
    "pages/MonkeyMixUpGame.jsx": "Amazing! You found the sound. Can you find another one?",
}
MONKEY_TRY = "Tap a vowel to try filling in the word!"

# How-to-play text for each game (read by the guide only when the child asks).
INSTRUCTIONS = {
    "pages/ParrotPairsGame.jsx": "Look at the two words. A few letters got mixed up between them. Tap the letters that are different in each word. Then press Check Answer. You can tap a speaker to hear a word, or tap Hint if you need help.",
    "pages/SyllableSafariGame.jsx": "First, listen to the word. Tap in between the letters where the word splits into parts. Next, tap a piece to hear it, then tap a box to put it in. Put the pieces in order to build the word. Then press Check Word.",
    "pages/MonkeyMixUpGame.jsx": "A vowel is missing from the word. Listen to the sound in the clue. Then tap the vowel from the tray that makes that sound. When you get it right, press Next.",
    "pages/LionsLettersGame.jsx": "Tap the sound box to hear the letter. Then trace the letter with your finger on the lines. For words, tap each number to hear a letter and trace it. Then write the whole word.",
    "pages/LizardLookoutsGame.jsx": "Look for the tricky letter hiding in the words. Tap every one you find. Then look closely at the letter's shape, trace it, and find it again in the paragraph.",
    "pages/CheetahChallengeGame.jsx": "A word will show up. Read it out loud as fast as you can before the time runs out. Tap the microphone and say the word, or tap the card when you have read it.",
}
PINNED_GAMES = {"pages/LionsLettersGame.jsx": "lion", "pages/CheetahChallengeGame.jsx": "cheetah"}
CHEETAH_ONLY = HINT_SOURCES["pages/CheetahChallengeGame.jsx"]
LION_ONLY = HINT_SOURCES["pages/LionsLettersGame.jsx"]


def lizard_hints() -> list[str]:
    return [f"Take your time! A '{l}' can be tricky to spot." for l in "bdpq"]


def hint_say(msg: str) -> str:
    m = re.fullmatch(r"Take your time! A '(\w)' can be tricky to spot\.", msg)
    return f"Take your time! The letter {LETTER_NAMES[m.group(1)]} can be tricky to spot." if m else msg


def all_hint_messages() -> list[str]:
    return [*HINT_SOURCES.values(), MONKEY_TRY, *lizard_hints()]


def hint_messages(guide_id: str) -> list[str]:
    """Hint messages a given guide can be seen saying. Lion and cheetah are
    pinned to their own game (and also appear as a chosen guide elsewhere)."""
    shared = [m for m in all_hint_messages() if m not in (CHEETAH_ONLY, LION_ONLY)]
    if guide_id == "lion":
        return shared + [LION_ONLY]
    if guide_id == "cheetah":
        return shared + [CHEETAH_ONLY]
    return shared


def collect() -> None:
    # ---- the guides -------------------------------------------------------
    guides_js = read("data/guides.js")
    animal_names = re.findall(r'name: "(\w+)", label', guides_js)
    sloth_name = re.search(r'SLOTH = \{[^}]*name: "(\w+)"', guides_js).group(1)

    sloth_messages = {
        "pages/Homepage.jsx": "Welcome to DysCover! Tap me and I'll take you on a jungle adventure.",
        "pages/Login.jsx": "Tell me your explorer name and secret code, then tap Log In. New here? Tap Create Account!",
        "pages/AdventureMap.jsx": "Welcome to the jungle, explorer! Tap Start on a world to begin your adventure.",
        "pages/PlacementMission.jsx": "Let's play a few quick games so I can build your perfect map. Tap me when you are ready!",
    }
    world_messages = {
        "pages/JungleGamesDetail.jsx": "Welcome to the Jungle Games! Tap a game to see how to play, then press Start.",
        "pages/CanopyQuestDetail.jsx": "Welcome to Canopy Quest, high up in the trees! Tap a game to see how to play, then press Start.",
    }
    for rel, msg in {**sloth_messages, **world_messages}.items():
        require_in_source(rel, msg)
        add(msg)  # neutral voice (also the fallback)
    # Each guide speaks in its own voice. A guide introduces itself the first
    # time it speaks (GuideBubble.spokenLine). Guide ids/names from guides.js.
    guide_ids = re.findall(r'^  (\w+): \{ id: "\w+", name: "(\w+)"', guides_js, re.M)
    animals = dict(guide_ids)  # id -> name
    for msg in sloth_messages.values():
        add(msg, voice="sloth")
        add(f"Hi, I'm {sloth_name}! {msg}", voice="sloth")
    add("Let's go!", voice="sloth")
    add("Let's go!")
    for gid, name in animals.items():
        for msg in world_messages.values():
            add(msg, voice=gid)
            add(f"Hi, I'm {name}! {msg}", voice=gid)
        for msg in hint_messages(gid):
            add(msg, say=hint_say(msg), voice=gid)
        for rel, text in INSTRUCTIONS.items():
            if rel not in PINNED_GAMES:
                add(text, voice=gid)

    # ---- page titles and info popups -------------------------------------
    games = re.findall(r'"(Parrot Pairs|Syllable Safari|Monkey Mix-Up|Lion\'s Letters|Lizard Lookouts|Cheetah Challenge)"', read("data/mockData.js"))
    games = list(dict.fromkeys(games))
    assert len(games) == 6, games
    add("Jungle Games")
    add("Canopy Quest")
    add("My Trophy Room")
    for w in re.findall(r'world: "([^"]+)"', read("data/mockData.js")):
        add(w)

    intro = "Look closely at the big word on top. Then, find the word below that looks exactly the same!"
    require_in_source("components/GameIntroModal.jsx", intro)
    add("DysCover is a reading adventure game. Explore the map, play games in each world, and collect stars!")
    require_in_source("components/InfoPopover.jsx", "DysCover is a reading adventure game. Explore the map, play games in each world, and collect stars!")
    for g in games:
        add(f"Let's play {g}! {intro}")
        add(f"You're playing {g}! Tap any speaker icon to hear words read aloud, and use the buttons on screen to answer.")

    # ---- letters ---------------------------------------------------------
    for letter, name in LETTER_NAMES.items():
        if letter in "bdpqcmtgraeiou":  # the letters the games actually speak
            add(letter, say=name)

    # ---- words (every game) ----------------------------------------------
    words: set[str] = set()
    for a, b in re.findall(r'word1: "(\w+)", word2: "(\w+)"', read("pages/ParrotPairsGame.jsx")):
        words |= {a, b}
    words |= set(re.findall(r'word: "(\w+)", syllables', read("pages/SyllableSafariGame.jsx")))
    words |= set(re.findall(r'"(\w+)"', re.search(r"const WORDS = \[(.*?)\]", read("pages/CheetahChallengeGame.jsx"), re.S).group(1)))
    words |= set(re.findall(r'"(\w+)"', re.search(r"const WORDS = \[(.*?)\]", read("pages/LionsLettersGame.jsx"), re.S).group(1)))
    monkey = read("pages/MonkeyMixUpGame.jsx")
    for template, answer in re.findall(r"template: \[(.*?)\], answer: \"(\w)\"", monkey):
        parts = [p.strip() for p in template.split(",")]
        words.add("".join(answer if p == "null" else p.strip('"') for p in parts))
    words |= set(w for w in re.findall(r'"(\w+)"', re.search(r"const BONUS_WORDS = \[(.*?)\]", monkey, re.S).group(1)))
    examples = re.search(r"const SOUND_EXAMPLES = \{(.*?)\}", monkey, re.S).group(1)
    sound_words = re.findall(r'\w+: "(\w+)"', examples)
    words |= set(sound_words)
    for w in sorted(words):
        add(w.lower())

    # ---- syllable pieces -------------------------------------------------
    pieces = set()
    for syl in re.findall(r"syllables: \[(.*?)\]", read("pages/SyllableSafariGame.jsx")):
        pieces |= set(p.lower() for p in re.findall(r'"(\w+)"', syl))
    missing = pieces - set(SYLLABLE_SAY)
    if missing:
        raise SystemExit(f"Add pronunciations for syllable pieces: {sorted(missing)}")
    for p in sorted(pieces):
        add(p, say=SYLLABLE_SAY[p], key=f"syl:{p}")

    # ---- game instructions and hint-bubble messages ------------------------
    for sound_word in sound_words:
        add(f'Find the vowel that sounds like the one in "{sound_word}" to complete the word! Tap a vowel from the tray to complete the word.')
    for rel, text in INSTRUCTIONS.items():
        require_in_source(rel, text)
        add(text)  # neutral fallback
        if rel in PINNED_GAMES:
            add(text, voice=PINNED_GAMES[rel])
    for rel, msg in HINT_SOURCES.items():
        require_in_source(rel, msg)
    for msg in all_hint_messages():
        add(msg, say=hint_say(msg))  # neutral fallback

    for letter in "bdpq":
        name = LETTER_NAMES[letter]
        add(f"Tap all the letter {letter}'s hiding in this sentence!", say=f"Tap every letter {name} hiding in this sentence!")
        add(f"Click all the {letter}s in this paragraph", say=f"Click every letter {name} in this paragraph!")


def synthesize(model: str, voices: str, force: bool) -> None:
    import numpy as np
    import soundfile as sf
    from kokoro_onnx import Kokoro

    OUT.mkdir(parents=True, exist_ok=True)
    index = json.loads(INDEX.read_text()) if INDEX.exists() else {}
    kokoro = Kokoro(model, voices)

    hashes: dict[str, str] = {}
    for key in lines:
        h = hash_key(key)
        if h in hashes and hashes[h] != key:
            raise SystemExit(f"Hash collision between {hashes[h]!r} and {key!r}")
        hashes[h] = key

    todo = [
        (h, key)
        for h, key in hashes.items()
        if force
        or index.get(h, {}).get("say") != lines[key][0]
        or index.get(h, {}).get("speed") != voice_sig(lines[key][1])
        or not (OUT / f"{h}.m4a").exists()
    ]
    print(f"{len(lines)} lines, {len(todo)} to record")

    for n, (h, key) in enumerate(todo, 1):
        text, voice_name = lines[key]
        cfg = VOICES[voice_name]
        say = re.sub(r"dyscover", "Discover", text, flags=re.I)
        pace = cfg["sentence"] if " " in say.strip() else cfg["word"]
        # pitch is applied by playing the samples back at a different sample
        # rate, which also changes pace by the same factor - pre-compensate
        samples, rate = kokoro.create(say, voice=cfg["voice"], speed=pace / cfg["pitch"], lang=cfg["lang"])
        rate = int(rate * cfg["pitch"])
        samples = np.asarray(samples)
        loud = np.where(np.abs(samples) > 0.01)[0]  # trim leading/trailing silence
        if len(loud):
            pad = int(0.06 * rate)
            samples = samples[max(0, loud[0] - pad): loud[-1] + pad]
        peak = float(np.max(np.abs(samples))) or 1.0
        samples = samples * (0.9 / peak)
        with tempfile.TemporaryDirectory() as tmp:
            wav = Path(tmp) / "clip.wav"
            sf.write(wav, samples, rate)
            subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "48000", str(wav), str(OUT / f"{h}.m4a")], check=True)
        index[h] = {"key": key, "say": text, "speed": voice_sig(voice_name)}
        if n % 20 == 0:
            print(f"  {n}/{len(todo)}")

    # remove clips for lines that no longer exist
    for f in OUT.glob("*.m4a"):
        if f.stem not in hashes:
            f.unlink()
    index = {h: v for h, v in index.items() if h in hashes}
    INDEX.write_text(json.dumps(index, indent=1, sort_keys=True))
    MANIFEST.write_text(json.dumps(sorted(hashes)) + "\n")
    print(f"Done: {len(hashes)} clips")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True)
    ap.add_argument("--voices", required=True)
    ap.add_argument("--force", action="store_true", help="re-record everything")
    ap.add_argument("--list", action="store_true", help="just print the lines and exit")
    args = ap.parse_args()
    collect()
    if args.list:
        for k, (say, voice) in lines.items():
            print(f"[{voice}] {k!r} -> {say!r}")
        print(len(lines), "lines")
    else:
        synthesize(args.model, args.voices, args.force)
