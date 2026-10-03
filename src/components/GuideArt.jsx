// A jungle guide's illustration. Animation is pure CSS (see GuideArt.css):
// a gentle idle bob, plus a hop-and-wiggle when `waving` (the welcome).
// The swinging monkey sways from his vine instead of bobbing.
import { GUIDES, DEFAULT_GUIDE } from "../data/guides";
import SlothArt from "./SlothArt";
import "./GuideArt.css";

function GuideArt({ character = DEFAULT_GUIDE, waving = false, size = 72 }) {
  if (character === "sloth") return <SlothArt waving={waving} size={size} />;
  const guide = GUIDES[character] || GUIDES[DEFAULT_GUIDE];
  return (
    <img
      className={`guide-art guide-art--${guide.id}${waving ? " guide-art--waving" : ""}`}
      src={guide.image}
      alt={guide.label}
      style={{ width: size * 1.6 }}
      draggable={false}
    />
  );
}

export default GuideArt;
