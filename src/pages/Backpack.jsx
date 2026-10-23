// The child's backpack of jungle buddies: one animal buddy for every finished
// lesson (they help the rainforest grow), and one gem for every finished unit. Buddies
// not met yet show as grey photos.
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Backpack as BackpackIcon, Volume2, Share2, Star, Play, ArrowLeft, Lock } from "lucide-react";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GuideBubble from "../components/GuideBubble";
import WordPicture from "../components/WordPicture";
import { speak } from "../audio/speech";
import { useProgress } from "../context/ProgressContext";
import { LESSONS, UNITS } from "../data/lessons";
import { GEMS, TREASURES } from "../data/treasures";
import { DOOR_GEMS } from "../data/vineDoor";
import "./Backpack.css";

function Backpack() {
  const navigate = useNavigate();
  const [shareMessage, setShareMessage] = useState("");
  const { stars, isCompleted, unitDone, stats, doorGems } = useProgress();

  const found = LESSONS.filter((l) => isCompleted(l.id)).length;
  const gemsWon = UNITS.filter((u) => unitDone(u.id)).length;
  const growth = Math.round((found / LESSONS.length) * 100);

  async function handleShare() {
    const summary = `I've met ${found} jungle buddies and won ${gemsWon} gems with ${stats.stars} stars on DysCover!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My DysCover Jungle Buddies", text: summary });
        return;
      } catch {
        // user cancelled or share failed - fall through to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(summary);
      setShareMessage("Copied your summary to the clipboard!");
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
        <span className="backpack__icon">
          <BackpackIcon size={34} />
        </span>
        <div className="backpack__heading">
          <h1>
            My Jungle Buddies
            <button onClick={() => speak("My Jungle Buddies")} aria-label="Read aloud">
              <Volume2 size={16} />
            </button>
          </h1>
          <p>
            {found} of {LESSONS.length} buddies &middot; {gemsWon} of {UNITS.length} gems
          </p>
          <div className="backpack__growth" role="progressbar" aria-valuenow={growth} aria-valuemin={0} aria-valuemax={100} aria-label="How much the rainforest has grown">
            <div style={{ width: `${growth}%` }} />
          </div>
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
                const buddy = TREASURES[lesson.id];
                const has = isCompleted(lesson.id);
                return (
                  <div key={lesson.id} className={`backpack__card${has ? "" : " is-locked"}`}>
                    <div className="backpack__thumb">
                      <WordPicture word={buddy.photo} size={110} />
                      {!has && <Lock className="backpack__lock" size={18} />}
                    </div>
                    <h3>{has ? buddy.name : "Hidden buddy"}</h3>
                    <p>{has ? buddy.blurb : `Finish ${lesson.name} to meet this buddy.`}</p>
                    {has ? (
                      <>
                        <span className="backpack__stars" aria-label={`${stars(lesson.id)} stars`}>
                          {[1, 2, 3].map((n) => (
                            <Star key={n} size={18} fill={n <= stars(lesson.id) ? "currentColor" : "none"} />
                          ))}
                        </span>
                        <div className="backpack__actions">
                          <button className="backpack__listen" onClick={() => speak(`${buddy.name}. ${buddy.blurb}`)} aria-label={`Read about ${buddy.name}`}>
                            <Volume2 size={16} />
                          </button>
                          <Link className="btn btn--primary" to={`/?play=${lesson.id}`}>
                            <Play size={14} fill="currentColor" /> Play again
                          </Link>
                        </div>
                      </>
                    ) : (
                      <Link className="btn btn--outline" to={`/?play=${lesson.id}`}>
                        <Play size={14} fill="currentColor" /> Meet them
                      </Link>
                    )}
                  </div>
                );
              })}
              <div className={`backpack__card backpack__card--gem${gemWon ? "" : " is-locked"}`}>
                <div className="backpack__thumb">
                  <WordPicture word={gem.photo} size={110} />
                  {!gemWon && <Lock className="backpack__lock" size={18} />}
                </div>
                <h3>{gemWon ? gem.name : "Hidden gem"}</h3>
                <p>{gemWon ? "You won it by finishing every lesson in this unit!" : "Meet every buddy in this unit to win it."}</p>
              </div>
            </div>
          </section>
        );
      })}

      <section className="backpack__unit">
        <h2>Vine door gems</h2>
        <div className="backpack__cards">
          {DOOR_GEMS.map((gem) => {
            const has = doorGems.includes(gem.id);
            return (
              <div key={gem.id} className={`backpack__card backpack__card--gem${has ? "" : " is-locked"}`}>
                <div className="backpack__thumb">
                  <WordPicture word={gem.id} size={110} />
                  {!has && <Lock className="backpack__lock" size={18} />}
                </div>
                <h3>{has ? gem.name : "Hidden gem"}</h3>
                <p>{has ? "Found behind a vine door!" : "Open a vine door after a day of lessons to find it."}</p>
              </div>
            );
          })}
        </div>
      </section>

      <AccessibilityToolbar />
      <GuideBubble
        message="Look at all your jungle buddies! Finish lessons to meet more."
        instructions="This is your backpack of jungle buddies. Every lesson you finish brings a new animal buddy to help the rainforest grow. Finish all the lessons in a unit to win its gem. Tap Play again to practice a lesson, or tap the speaker to hear about a buddy."
      />
    </div>
  );
}

export default Backpack;
