// The home-page host: the sleepy sloth from the DysCover logo, cut out so he
// can greet you. He breathes slowly and wiggles when welcoming.
// (The six choosable animals are handled in GuideArt.jsx.)
import slothImage from "../assets/guides/sloth.png";
import "./SlothArt.css";

function SlothArt({ waving = false, size = 72 }) {
  return (
    <img
      className={`sloth-art${waving ? " sloth-art--waving" : ""}`}
      src={slothImage}
      alt="Sunny the Sloth"
      style={{ width: size * 2 }}
      draggable={false}
    />
  );
}

export default SlothArt;
