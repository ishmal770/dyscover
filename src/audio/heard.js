// Remembers which automatic welcomes and instructions have already been said,
// so they play the first time a child reaches a page and then stay quiet. The
// child can always tap a speaker, the guide, or "How to play" to hear them
// again. Stored in localStorage so it survives reloads.
const KEY = "dyscover-heard";
let heard = null;

function load() {
  if (heard) return heard;
  try {
    heard = new Set(JSON.parse(localStorage.getItem(KEY)) || []);
  } catch {
    heard = new Set();
  }
  return heard;
}

export const hasHeard = (id) => load().has(id);

export function markHeard(id) {
  const set = load();
  if (set.has(id)) return;
  set.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    // storage unavailable - it will just repeat next visit
  }
}
