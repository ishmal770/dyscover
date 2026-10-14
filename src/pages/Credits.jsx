// Picture credits: the photos in the game come from Wikipedia / Wikimedia
// Commons. Most are free to use if the photographer is credited, so every
// photo is listed here with who took it, its license, and where it came from.
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import credits from "../data/pictureCredits.json";
import { pictureUrl } from "../data/pictures";
import "./Credits.css";

function Credits() {
  const navigate = useNavigate();
  const rows = Object.entries(credits).sort(([a], [b]) => a.localeCompare(b));
  return (
    <div className="credits">
      <header className="credits__header">
        <button className="credits__back" onClick={() => navigate("/")} aria-label="Back to the game">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1>Picture credits</h1>
          <p>The photos in DysCover come from Wikipedia and Wikimedia Commons. Thank you to everyone who shared them.</p>
        </div>
      </header>
      <ul className="credits__list">
        {rows.map(([slug, c]) => (
          <li key={slug}>
            {pictureUrl(slug) && <img src={pictureUrl(slug)} alt="" loading="lazy" />}
            <div>
              <strong>{slug.replace(/-/g, " ")}</strong>
              <span>
                {c.artist} &middot; {c.license}
              </span>
              <a href={c.source} target="_blank" rel="noreferrer">
                Original photo
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Credits;
