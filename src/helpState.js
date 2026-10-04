// Whether "?" help mode is on. A tiny shared store (not React context) so the
// toolbar button on every page and the HelpMode overlay stay in step.
let on = false;
const listeners = new Set();

export const getHelp = () => on;
export const toggleHelp = () => {
  on = !on;
  listeners.forEach((l) => l());
};
export const setHelp = (value) => {
  on = value;
  listeners.forEach((l) => l());
};
export const subscribeHelp = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
