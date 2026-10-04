// The child's backpack: the treasures they have found (one per finished
// lesson) and the gems they have won (one per finished unit). Replaces the old
// trophy room. Treasures not found yet show as dark outlines.
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Volume2, Share2, Star, Play, ArrowLeft, Lock } from "lucide-react";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GuideBubble from "../components/GuideBubble";
import { BackpackArt, GemArt, TreasureArt } from "../components/TreasureArt";
import { speak } from "../audio/speech";
import { useProgress } from "../context/ProgressContext";
import { LESSONS, UNITS } from "../data/lessons";
import { GEMS, TREASURES } from "../data/treasures";
import "./Backpack.css";

function Backpack() {
  const navigate = useNavigate();
  const [shareMessage, setShareMessage] = useState("");
  const { stars, isCompleted, unitDone, stats } = useProgress();

  const found = LESSONS.filter((l) => isCompleted(l.id)).length;
  const gemsWon = UNITS.filter((u) => unitDone(u.id)).length;

  async function handleShare() {
    const summary = `I've found ${found} treasures and ${gemsWon} gems with ${stats.stars} stars on DysCover!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My DysCover Backpack", text: summary });
        return;
      } catch {
        // user cancelled or share failed - fall through to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(summary);
      setShareMessage("Copied your backpack summary to the clipboard!");
      setTimeout(() => setShareMessage(""), 3000);
    } else {
      setShareMessage(summary);
    }
  }

  return (
    <div className="backpack">
      <header className="backpack__header">
        <button className="backpack__back" onClick={() => navigate("/")} aria-label="Back to game">
          <ArrowLeft size={18} />
        </button>
        <BackpackArt size={64} />
        <div className="backpack__heading">
          <h1>
            My Backpack
            <button onClick={() => speak("My Backpack")} aria-label="Read aloud">
              <Volume2 size={16} />
            </button>
          </h1>
          <p>
            {found} of {LESSONS.length} treasures &middot; {gemsWon} of {UNITS.length} gems
          </p>
        </div>
        <button className="backpack__share" onClick={handleShare}>
          <Share2 size={16} /> Share
        </button>
      </header>

      {shareMessage && <p className="backpack__share-message">{shareMessage}</p>}

      {UNITS.map((unit, i) => {
        const gem = GEMS[unit.id];
        const gemWon = unitDone(unit.id);
        return (
          <section key={unit.id} className="backpack__unit">
            <h2>
              Unit {i + 1}: {unit.title}
            </h2>
            <div className="backpack__cards">
              {unit.lessons.map((lesson) => {
                const treasure = TREASURES[lesson.id];
                const has = isCompleted(lesson.id);
                return (
                  <div key={lesson.id} className={`backpack__card${has ? "" : " is-locked"}`}>
                    <div className="backpack__thumb">
                      <TreasureArt icon={treasure.icon} size={84} locked={!has} />
                      {!has && <Lock className="backpack__lock" size={18} />}
                    </div>
                    <h3>{has ? treasure.name : "Hidden treasure"}</h3>
                    <p>{has ? treasure.blurb : `Finish ${lesson.name} to find it.`}</p>
                    {has ? (
                      <>
                        <span className="backpack__stars" aria-label={`${stars(lesson.id)} stars`}>
                          {[1, 2, 3].map((n) => (
                            <Star key={n} size={18} fill={n <= stars(lesson.id) ? "currentColor" : "none"} />
                          ))}
                        </span>
                        <div className="backpack__actions">
                          <button className="backpack__listen" onClick={() => speak(`${treasure.name}. ${treasure.blurb}`)} aria-label={`Read about the ${treasure.name}`}>
                            <Volume2 size={16} />
                          </button>
                          <Link className="btn btn--primary" to={`/?play=${lesson.id}`}>
                            <Play size={14} fill="currentColor" /> Play again
                          </Link>
                        </div>
                      </>
                    ) : (
                      <Link className="btn btn--outline" to={`/?play=${lesson.id}`}>
                        <Play size={14} fill="currentColor" /> Find it
                      </Link>
                    )}
                  </div>
                );
              })}
              <div className={`backpack__card backpack__card--gem${gemWon ? "" : " is-locked"}`}>
                <div className="backpack__thumb">
                  <GemArt color={gem.color} dark={gem.dark} size={84} locked={!gemWon} glow={gemWon} />
                  {!gemWon && <Lock className="backpack__lock" size={18} />}
                </div>
                <h3>{gemWon ? gem.name : "Hidden gem"}</h3>
                <p>{gemWon ? "You won it by finishing every lesson in this unit!" : "Find every treasure in this unit to win it."}</p>
              </div>
            </div>
          </section>
        );
      })}

      <AccessibilityToolbar />
      <GuideBubble
        message="Look at all the treasures in your backpack! Finish lessons to find more."
        instructions="This is your backpack. Every lesson you finish puts a new treasure inside. Finish all the lessons in a unit to win its gem. Tap Play again to practice a lesson, or tap the speaker to hear about a treasure."
      />
    </div>
  );
}

export default Backpack;
