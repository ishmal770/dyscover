// A picture for a word, if there is a good photo of it (see data/pictures.js), so
// when a game asks for "tree" the child sees a tree. Words with no good photo
// (was, from, explain...) show no picture.
import { pictureUrl } from "./pictures.js";

export const pictureFor = (word) => pictureUrl(word);
