// A round picture for a word (see data/wordPictures.js). Shows nothing for
// words that have no picture.
import { pictureFor } from "../data/wordPictures";
import "./WordPicture.css";

function WordPicture({ word, size = 72 }) {
  const picture = pictureFor(word);
  if (!picture) return null;
  return (
    <span className="word-picture" style={{ width: size, height: size, fontSize: size * 0.58 }} aria-hidden="true">
      {picture}
    </span>
  );
}

export default WordPicture;
