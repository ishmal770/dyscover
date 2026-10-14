// Jungle buddies and gems. Finishing a lesson brings that lesson's animal buddy to
// help the rainforest grow; finishing every lesson in a unit wins the unit's gem, and
// putting the gem into the gate at the end of the unit opens the next world.
// `photo` names a picture in data/pictures.js. (Plain data with .js imports only, so
// the audio script can read it too.)
import { UNITS } from "./lessons.js";

export const TREASURES = {
  monkeyMixUpGame: { name: "Momo the Monkey", photo: "monkey", blurb: "Momo swings through the trees and helps the rainforest grow taller." },
  lizardLookoutsGame: { name: "Lizzy the Lizard", photo: "lizard", blurb: "Lizzy spots new green leaves sprouting all over the jungle." },
  lionsLettersGame: { name: "Leo the Lion", photo: "lion", blurb: "Leo keeps the jungle safe so every plant can grow." },
  syllableSafariGame: { name: "Ellie the Elephant", photo: "elephant", blurb: "Ellie waters the baby plants with her long trunk." },
  parrotPairsGame: { name: "Pip the Parrot", photo: "parrot", blurb: "Pip spreads seeds across the whole jungle." },
  cheetahChallengeGame: { name: "Chase the Cheetah", photo: "cheetah", blurb: "Chase races to bring water to every tree." },
};

export const GEMS = {
  jungle: { name: "Emerald Gem", photo: "emerald" },
  canopy: { name: "Sun Gem", photo: "citrine" },
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
