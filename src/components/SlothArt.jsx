// The sloth host: a friendly sitting sloth who breathes slowly and wiggles
// when welcoming you.
// (The six choosable animals are handled in GuideArt.jsx.)
import slothImage from "../assets/guides/sloth.png";
import "./SlothArt.css";

function SlothArt({ waving = false, size = 72 }) {
  return (
    <img
      className={`sloth-art${waving ? " sloth-art--waving" : ""}`}
      src={slothImage}
      alt="Sunny the Sloth"
      style={{ width: size * 0.9 }}
      draggable={false}
    />
  );
}

export default SlothArt;
