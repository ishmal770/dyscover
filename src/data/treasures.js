// Treasures and gems. Finishing a lesson puts that lesson's treasure in the
// child's backpack; finishing every lesson in a unit wins the unit's gem, and
// putting the gem into the gate at the end of the unit opens the next world.
// (Plain data with .js imports only, so the audio script can read it too.)
import { UNITS } from "./lessons.js";

export const TREASURES = {
  parrotPairsGame: { name: "Golden Compass", icon: "compass", blurb: "It always points to your next adventure." },
  syllableSafariGame: { name: "Glow Lantern", icon: "lantern", blurb: "It lights up the darkest part of the jungle." },
  monkeyMixUpGame: { name: "Treasure Map", icon: "map", blurb: "X marks the spot where the best treasure hides." },
  lionsLettersGame: { name: "Explorer Binoculars", icon: "binoculars", blurb: "See far across the whole jungle." },
  lizardLookoutsGame: { name: "Magic Magnifier", icon: "magnifier", blurb: "It shows tiny details nobody else can see." },
  cheetahChallengeGame: { name: "Speedy Boots", icon: "boots", blurb: "Run through the trees as fast as a cheetah." },
};

export const GEMS = {
  jungle: { name: "Emerald Gem", color: "#2fbf71", dark: "#1c8c50" },
  canopy: { name: "Sun Gem", color: "#f5b301", dark: "#c98f00" },
};

// What is said at a unit's gate, by its state
export function gateText(unit, state) {
  const gem = GEMS[unit.id].name;
  const hasNext = UNITS.findIndex((u) => u.id === unit.id) < UNITS.length - 1;
  if (state === "locked") return `Finish every lesson in ${unit.title} to win the ${gem}.`;
  if (state === "ready") return hasNext ? `You found the ${gem}! Tap it to put it in the gate.` : `You found the ${gem}! You have found every gem.`;
  return hasNext ? "The gate is open! A new world is waiting for you." : "More jungles are coming soon!";
}

export const GATE_TEXT_LINES = UNITS.flatMap((u) => ["locked", "ready", "open"].map((s) => gateText(u, s)));
