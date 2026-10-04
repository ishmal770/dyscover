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
    "bas": "bass", "ket": "ket", "mon": "mun", "key": "key", "flow": "flow", "er": "ur",
    "pup": "pup", "can": "can", "dy": "dee", "ro": "roe", "bot": "bot", "piz": "peet", "za": "sah",
    "um": "um", "brel": "brel", "la": "lah", "to": "toe", "ma": "may", "kan": "kang", "ga": "guh",
    "roo": "roo", "ham": "ham", "bur": "bur", "vol": "vol", "ca": "kay",
    "tel": "tel", "phone": "phone", "hel": "hel", "i": "ih", "cop": "cop", "al": "al", "li": "lih",
    "tor": "tor", "wa": "waw", "mel": "mel", "on": "on", "pine": "pine", "ap": "ap", "ple": "pull",
    "mi": "my", "cro": "crow", "scope": "scope", "as": "as", "tro": "troh", "naut": "not",
    "cat": "cat", "pil": "pil", "lar": "ler", "bi": "by", "cy": "sigh", "cle": "kul",
    "skate": "skate", "board": "board",
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


def node_json(rel: str) -> dict:
    """Load every export of a plain-data JS module (src/<rel>) as JSON, via Node."""
    code = f"import * as m from {json.dumps('file://' + str(SRC / rel))}; console.log(JSON.stringify(m));"
    out = subprocess.run(["node", "--input-type=module", "-e", code], check=True, capture_output=True, text=True)
    return json.loads(out.stdout)


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


def line_sig(voice_name: str, text: str) -> str:
    return voice_sig(voice_name)


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

# How-to-play text (read by a guide only when the child asks). A game can have
# several, one per step; the game picks the right one for where you are.
GAME_HELP = {
    "pages/ParrotPairsGame.jsx": [
        "Look at the two words. A few letters got mixed up between them. Tap the letters that are different in each word. Then press Check Answer. You can tap a speaker to hear a word, or tap Hint if you need help.",
    ],
    "pages/SyllableSafariGame.jsx": [
        "Listen to the word. Then tap in between the letters where the word splits into parts.",
        "Now tap a piece to hear it, then tap a box to put it in. Put the pieces in order to build the word. Then press Check Word.",
    ],
    "pages/MonkeyMixUpGame.jsx": [
        "A vowel is missing from the word. Listen to the sound in the clue. Then tap the vowel from the tray that makes that sound. When you get it right, press Next.",
    ],
    "pages/LionsLettersGame.jsx": [
        "Tap the sound box to hear the letter. Then trace the letter with your finger on the lines. Then press Continue.",
        "Tap each number to hear a letter. Then trace that letter. When every letter is done, press Continue.",
        "Now write the whole word with your finger on the lines. Then press Continue.",
    ],
    "pages/LizardLookoutsGame.jsx": [
        "Look for the tricky letter hiding in the sentence. Tap every one you can find.",
        "Look closely at the letter. Tap Show the Stick and Show the Circle to see its parts. Then press Continue.",
        "Trace the letter with your finger on the lines. Then press Continue.",
        "Now find the same letter again in the paragraph. Tap every one you can find.",
    ],
    "pages/CheetahChallengeGame.jsx": [
        "A word will show up. Read it out loud as fast as you can before the time runs out. Tap the microphone and say the word, or tap the card when you have read it.",
    ],
}

# How-to-use text for each page. Onboarding pages are hosted by the sloth; the
# world pages and Trophy Room by whichever animal the child picked; the adult
# dashboards have no guide (neutral voice).
PAGE_HELP_SLOTH = {
    "pages/Homepage.jsx": "Tap me to start your adventure. Tap the speaker to hear me again. Grown-ups can use the links at the bottom of the page.",
    "pages/Login.jsx": "Type your explorer name and your secret code. Then tap Log In. If you are new, tap Create Account.",
    "pages/PlacementMission.jsx": "We will play a few short games so I can build your perfect map. Tap me when you are ready to begin.",
    "pages/Dashboard.jsx": "This is your home base. The flame counts the days in a row that you play. The bar shows today's goal. Tap Start to begin your next lesson, or open the map to choose a world. Tap your picture to open your profile.",
    "pages/Profile.jsx": "This is your profile. Tap a picture to make it your avatar. Pictures with a lock need more levels, stars or treasures. Tap the pencil to change your name.",
}
PAGE_HELP_ANIMALS = {
    "pages/AdventureMap.jsx": "This is your adventure map. Each circle is a lesson. Finish one to open the next. Tap the glowing circle, then press Start. Tap the logo to go back home.",
    "pages/Backpack.jsx": "This is your backpack. Every lesson you finish puts a new treasure inside. Finish all the lessons in a unit to win its gem. Tap Play again to practice a lesson, or tap the speaker to hear about a treasure.",
}
# What a guide asks after reading a game step's instructions
ASK_MORE = "Do you want to hear the other instructions? Tap one to listen."
TROPHY_MESSAGE = "Look at all the treasures in your backpack! Finish lessons to find more."
# Said by the game's guide on the "Lesson complete" screen (by stars earned)
LESSON_CHEERS = [
    "Lesson complete! Amazing work, you got three stars!",
    "Lesson complete! Great job, you got two stars!",
    "Lesson complete! Good try, you got one star. Practice makes you stronger!",
]
DASHBOARD_HELP = {
    "pages/ClinicalOverview.jsx": "This page shows how all students are doing. The cards at the top give totals. The charts show accuracy over time and each skill's strength. Tap a student's name in the table to see their full report.",
    "pages/ClinicalStudentDetail.jsx": "This is one student's full report. The chart shows their skills, and the bars show progress in each game. Write notes in the box, and use the buttons to export the report or download their data.",
    "pages/ExpertDashboard.jsx": "This is the expert view. Pick a student on the left. The first one is the child using this device, with real numbers. The calendar shows how steadily they practice. Use the tabs to switch between progress, raw data, and practice suggestions.",
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
        "pages/PlacementMission.jsx": "Let's play a few quick games so I can build your perfect map. Tap me when you are ready!",
        "pages/Dashboard.jsx": "Welcome back, explorer! Tap Start to keep learning.",
        "pages/Profile.jsx": "This is your profile! Pick a picture to be your avatar. Play more lessons to unlock new ones.",
    }
    world_messages = {
        "pages/AdventureMap.jsx": "Welcome to the Adventure Map! Follow the path and tap the glowing circle to start your next lesson.",
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
    for text in PAGE_HELP_SLOTH.values():
        add(text, voice="sloth")
        add(text)
    for gid, name in animals.items():
        for msg in world_messages.values():
            add(msg, voice=gid)
            add(f"Hi, I'm {name}! {msg}", voice=gid)
        for msg in hint_messages(gid):
            add(msg, say=hint_say(msg), voice=gid)
        for rel, texts in GAME_HELP.items():
            if rel not in PINNED_GAMES:
                for text in texts:
                    add(text, voice=gid)
        for text in PAGE_HELP_ANIMALS.values():
            add(text, voice=gid)
        add(TROPHY_MESSAGE, voice=gid)
        add(f"Hi, I'm {name}! {TROPHY_MESSAGE}", voice=gid)
        add(ASK_MORE, voice=gid)
        for cheer in LESSON_CHEERS:
            add(cheer, voice=gid)

    # ---- page titles and info popups -------------------------------------
    games = re.findall(r'"(Parrot Pairs|Syllable Safari|Monkey Mix-Up|Lion\'s Letters|Lizard Lookouts|Cheetah Challenge)"', read("data/mockData.js"))
    games = list(dict.fromkeys(games))
    assert len(games) == 6, games
    add("Jungle Games")
    add("Canopy Quest")
    for w in re.findall(r'world: "([^"]+)"', read("data/mockData.js")):
        add(w)

    add("DysCover is a reading adventure game. Explore the map, play games in each world, and collect stars!")
    require_in_source("components/InfoPopover.jsx", "DysCover is a reading adventure game. Explore the map, play games in each world, and collect stars!")
    for g in games:
        add(f"You're playing {g}! Tap any speaker icon to hear words read aloud, and use the buttons on screen to answer.")

    # ---- data-driven lines: gates, treasures, demos, help tips, quiz, banks ----
    spoken = node_json("data/spoken.js")
    for text in spoken["NEUTRAL_LINES"]:
        add(text)
    for text in spoken["SLOTH_LINES"]:
        add(text, voice="sloth")

    # letters (the games speak them by name)
    for letter, name in LETTER_NAMES.items():
        add(letter, say=name)

    # words (every game, every grade band)
    words = set(spoken["WORDS"])
    monkey = read("pages/MonkeyMixUpGame.jsx")
    words |= set(w.lower() for w in re.findall(r'"(\w+)"', re.search(r"const BONUS_WORDS = \[(.*?)\]", monkey, re.S).group(1)))
    examples = re.search(r"const SOUND_EXAMPLES = \{(.*?)\}", monkey, re.S).group(1)
    sound_words = re.findall(r'\w+: "(\w+)"', examples)
    words |= set(sound_words)
    for w in sorted(words):
        add(w.lower())

    # syllable pieces
    pieces = set(spoken["PIECES"])
    missing = pieces - set(SYLLABLE_SAY)
    if missing:
        raise SystemExit(f"Add pronunciations for syllable pieces: {sorted(missing)}")
    for p in sorted(pieces):
        add(p, say=SYLLABLE_SAY[p], key=f"syl:{p}")

    # ---- game instructions and hint-bubble messages ------------------------
    for sound_word in sound_words:
        add(f'Find the vowel that sounds like the one in "{sound_word}" to complete the word! Tap a vowel from the tray to complete the word.')
    for rel, texts in GAME_HELP.items():
        for text in texts:
            require_in_source(rel, text)
            add(text)  # neutral fallback
            if rel in PINNED_GAMES:
                add(text, voice=PINNED_GAMES[rel])
    for table in (PAGE_HELP_SLOTH, PAGE_HELP_ANIMALS, DASHBOARD_HELP):
        for rel, text in table.items():
            require_in_source(rel, text)
            add(text)  # neutral voice / fallback (dashboards use only this)
    require_in_source("components/GameHintBubble.jsx", ASK_MORE)
    add(ASK_MORE)
    require_in_source("pages/Backpack.jsx", TROPHY_MESSAGE)
    add(TROPHY_MESSAGE)
    for cheer in LESSON_CHEERS:
        require_in_source("components/LessonComplete.jsx", cheer)
        add(cheer)
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
        or index.get(h, {}).get("speed") != line_sig(lines[key][1], lines[key][0])
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
        index[h] = {"key": key, "say": text, "speed": line_sig(voice_name, text)}
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
