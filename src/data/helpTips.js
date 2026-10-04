// What each kind of button does, in words a child can follow. In help mode
// (the "?" in the toolbar) tapping any button reads its tip aloud instead of
// pressing it. A button's tip is found from its `data-help` name, or its label,
// by the first matching rule below. Plain data, read by the audio script too.

export const HELP_ON = "Help is on! Tap any button with a question mark to hear what it does.";
export const HELP_FALLBACK = "Tap this button to use it.";

export const HELP_RULES = [
  [/^avatar$/, "Tap a picture to make it your avatar. Pictures with a lock need more levels, stars, or treasures."],
  [/check answer/, "Press this to check if your answer is right."],
  [/check word/, "Press this to check if you built the word right."],
  [/^hint/, "Press this to see a hint. It uses up one star."],
  [/next word|^next$/, "Press this to go to the next question."],
  [/^finish/, "Press this to finish the lesson."],
  [/continue/, "Press this to keep going."],
  [/: (ready|finished)$/, "Press this circle to read about the lesson and start it."],
  [/: locked$/, "This lesson is locked. Finish the lesson before it to open it."],
  [/^start$|^practice$|^find it$/, "Press this to start the lesson."],
  [/^listen/, "Press this to hear it read out loud."],
  [/how to play|how to use/, "Press this and your guide tells you how to play."],
  [/watch demo|watch how|watch again/, "Press this to watch a short demo that shows how to play."],
  [/ask .* how to play|tap me/, "Tap your guide to hear how to play."],
  [/speaker|read aloud|hear this|read about|hear the/, "Press the speaker to hear it read out loud."],
  [/play again|practice again/, "Press this to play the lesson once more."],
  [/back to|go to homepage|^games$/, "Press this to go back."],
  [/profile/, "Press this to see your profile and change your picture."],
  [/adventure map|^map$/, "Press this to open the adventure map with all your lessons."],
  [/backpack/, "Press this to see the treasures in your backpack."],
  [/^share/, "Press this to share how many treasures you found."],
  [/^info$/, "Press this to learn about DysCover."],
  [/^settings$/, "Press this to change the text size, colors, and sound."],
  [/^mute|^unmute/, "Press this to turn the sound on or off."],
  [/readable spacing|^font$/, "Press this to make the letters easier to read."],
  [/text size|^size$|^lg$|^xl$/, "Press this to make the words bigger or smaller."],
  [/contrast/, "Press this to make the colors stronger so they are easier to see."],
  [/^help$/, "Press this to turn help on or off."],
  [/^print$/, "Press this to practice print letters, the kind in books."],
  [/cursive/, "Press this to practice cursive, where the letters connect."],
  [/^clear$/, "Press this to erase what you wrote and try again."],
  [/choose color/, "Press this to pick a color for your pencil."],
  [/^\d+$/, "Press the number to hear that letter."],
  [/^grades/, "Press this to pick your grade. Your questions match your grade."],
  [/change my name/, "Press the pencil to change your name."],
  [/^save$/, "Press this to save your new name."],
  [/retake quiz|take quiz|take the quiz again/, "Press this to answer the jungle quiz questions."],
  [/let's go/, "Press this to start your adventure."],
  [/log in/, "Press this to enter the jungle."],
  [/create account/, "Press this to make a new explorer account."],
  [/to the gate/, "Press this to go to the gate and put your gem in."],
  [/put the .* in the gate/, "Press the gem to put it in the gate and open the next world."],
  [/close|got it/, "Press this to close it."],
  [/split after letter/, "Tap here to split the word into parts."],
  [/say it|microphone/, "Press this and say the word out loud."],
];

export function tipFor(label) {
  const key = label.trim().toLowerCase();
  const hit = HELP_RULES.find(([re]) => re.test(key));
  return hit ? hit[1] : HELP_FALLBACK;
}

export const HELP_TIP_LINES = [HELP_ON, HELP_FALLBACK, ...HELP_RULES.map(([, tip]) => tip)];
