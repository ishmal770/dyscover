// The six choosable jungle guides. Artwork lives in src/assets/guides.
import cheetah from "../assets/guides/cheetah.png";
import lion from "../assets/guides/lion.png";
import elephant from "../assets/guides/elephant.png";
import gorilla from "../assets/guides/gorilla.png";
import monkey from "../assets/guides/monkey-swing.png";
import mimi from "../assets/guides/monkey-sit.png";

export const GUIDES = {
  monkey: { id: "monkey", name: "Momo", label: "Momo the Monkey", image: monkey },
  lion: { id: "lion", name: "Leo", label: "Leo the Lion", image: lion },
  cheetah: { id: "cheetah", name: "Chase", label: "Chase the Cheetah", image: cheetah },
  elephant: { id: "elephant", name: "Ellie", label: "Ellie the Elephant", image: elephant },
  gorilla: { id: "gorilla", name: "Gus", label: "Gus the Gorilla", image: gorilla },
  mimi: { id: "mimi", name: "Mimi", label: "Mimi the Monkey", image: mimi },
};

export const DEFAULT_GUIDE = "monkey";

// The home-page host. Fixed (not in the chooser) and drawn in SlothArt.jsx.
export const SLOTH = { id: "sloth", name: "Sunny", label: "Sunny the Sloth" };
