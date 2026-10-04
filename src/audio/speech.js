// All spoken audio in the app goes through speak().
//
// Preferred path: play a pre-recorded natural-voice clip from public/audio
// (made by scripts/build_audio.py with the Kokoro "Sky" voice). The clip for a
// line is found by hashing its normalized text - see clipKey()/hashKey().
// Fallback: if a line has no clip, the browser's built-in voice reads it.

import manifest from "../data/audioManifest.json";

const clips = new Set(manifest);

// speak() is a plain function imported all over the app (not a component),
// so the mute toggle can't reach it through React context/props - this
// module-level flag lets AccessibilityContext turn audio on/off everywhere.
let muted = false;
let audio = null;

// FNV-1a 32-bit hash, as 8 hex chars. scripts/build_audio.py uses the same
// function so file names line up - keep the two in sync.
function hashKey(key) {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

// What a line is looked up by: lowercase, "DysCover" -> "discover" (how it is
// said), curly quotes straightened, whitespace collapsed. Case never changes
// how a word sounds, so "SUN", "Sun" and "sun" share one clip.
function clipKey(text) {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/dyscover/gi, "discover")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function stopAudio() {
  if (audio) {
    audio.pause();
    audio = null;
  }
}

function setSpeechMuted(value) {
  muted = value;
  if (value) cancelSpeech();
}

// Stops anything currently being said (used when a page scrolls out of view).
function cancelSpeech() {
  stopAudio();
  clearTimeout(speakTimer);
  window.speechSynthesis?.cancel();
}

// Browsers refuse to play sound until the person has clicked/tapped the page
// at least once. Callers use this to show a "tap to hear" prompt instead of
// failing silently.
function audioUnlocked() {
  return navigator.userActivation ? navigator.userActivation.hasBeenActive : true;
}

// ---- Browser-voice fallback -------------------------------------------------

let speakTimer;
let currentUtterance = null; // keep a reference so Chrome doesn't GC it mid-sentence

function pickFallbackVoice() {
  const english = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang && v.lang.toLowerCase().startsWith("en"));
  return english.find((v) => v.name.includes("Samantha")) || english.find((v) => v.lang === "en-US") || english[0] || null;
}

function speakWithBrowserVoice(text, onEnd) {
  if (!("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  // All-caps short strings get read as spelled-out acronyms by most TTS
  // voices ("SUN" -> "S U N"), so normalize to title case for real words.
  // Single letters are lowercased outright so no voice announces "capital C".
  const cleaned = text.replace(/dyscover/gi, "discover");
  const normalized =
    cleaned.length === 1
      ? cleaned.toLowerCase()
      : cleaned === cleaned.toUpperCase()
      ? cleaned[0] + cleaned.slice(1).toLowerCase()
      : cleaned;
  const utterance = new SpeechSynthesisUtterance(normalized);
  utterance.rate = 0.9;
  utterance.lang = "en-US";
  const voice = pickFallbackVoice();
  if (voice) utterance.voice = voice;
  currentUtterance = utterance;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  clearTimeout(speakTimer);
  // Chrome can silently drop speech that starts right after cancel(), so wait
  // a beat when something was already being said.
  const wasBusy = synth.speaking || synth.pending;
  if (wasBusy) synth.cancel();
  speakTimer = setTimeout(
    () => {
      synth.resume();
      synth.speak(utterance);
    },
    wasBusy ? 90 : 0
  );
}

// ---- Public API -------------------------------------------------------------

// speak("some text")               - plays that line's clip (the neutral voice)
// speak(text, { voice: "lion" })   - plays the line in that guide's own voice
//                                    if recorded, else the neutral voice
// speak(chunk, { clip: "syl:ti" }) - looks the clip up under a different key
//                                    (for pieces that sound different alone)
// speak(text, { onEnd }) - calls onEnd when the line has finished (or at once if
//                          nothing will be said, e.g. muted), but not if something
//                          else cuts it off
function speak(text, options = {}) {
  let ended = false;
  const finish = () => {
    if (ended) return;
    ended = true;
    options.onEnd?.();
  };
  if (muted || !text) {
    if (options.onEnd) setTimeout(finish, 0);
    return;
  }
  cancelSpeech();

  const plainKey = options.clip || clipKey(text);
  const voicedKey = options.voice ? `${options.voice}|${plainKey}` : null;
  const key = voicedKey && clips.has(hashKey(voicedKey)) ? voicedKey : plainKey;
  const id = hashKey(key);
  if (!clips.has(id)) {
    if (import.meta.env.DEV) console.warn(`[audio] no recorded clip for "${key}" - using browser voice`);
    speakWithBrowserVoice(text, options.onEnd ? finish : undefined);
    return;
  }

  const el = new Audio(`${import.meta.env.BASE_URL}audio/${id}.m4a`);
  audio = el;
  el.addEventListener("ended", finish);
  el.addEventListener("error", () => {
    if (audio === el) speakWithBrowserVoice(text, options.onEnd ? finish : undefined);
  });
  el.play().catch((err) => {
    // NotAllowedError = no click yet; stay quiet rather than talk over the page later
    if (err && err.name !== "NotAllowedError" && audio === el) speakWithBrowserVoice(text, options.onEnd ? finish : undefined);
    else if (err && err.name === "NotAllowedError") finish(); // nothing will play, so do not wait for it
  });
}

export { speak, setSpeechMuted, cancelSpeech, audioUnlocked, clipKey, hashKey };
