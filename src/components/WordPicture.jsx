// A round photo for a word or a picture name (see data/pictures.js). Shows
// nothing for words that have no photo.
import { pictureUrl } from "../data/pictures";
import "./WordPicture.css";

function WordPicture({ word, size = 72 }) {
  const url = pictureUrl(word);
  if (!url) return null;
  return (
    <span className="word-picture" style={{ width: size, height: size }}>
      <img src={url} alt="" draggable={false} loading="lazy" />
    </span>
  );
}

export default WordPicture;
