// The vine door: a bonus game that opens after a day of lessons. A door is covered in vines.
// Tap a vine, answer a question, and spend XP from your lessons to cut it down. Cut them all
// and the gem behind the door goes into the backpack your avatar is carrying.
import { useState } from "react";
import { Backpack, Scissors, Volume2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import Avatar from "../components/Avatar";
import WordPicture from "../components/WordPicture";
import { speak } from "../audio/speech";
import { useProgress, dayKey } from "../context/ProgressContext";
import { PLACEMENT_PROMPT, PLACEMENT_VOWEL_PROMPT, VOWELS } from "../data/placement";
import { DOOR_INTRO, DOOR_NEED_XP, DOOR_OPEN, VINES, VINE_COST, gemFoundLine, gemFor, vineQuestion } from "../data/vineDoor";
import "./VineDoor.css";

// which day of the year it is, to spread the questions out from day to day
const dayNumber = () => Math.floor(new Date(dayKey()).getTime() / 86400000);

function VineDoor({ onHome }) {
  const navigate = useNavigate();
  const { avatar, grade, vinesLeft, spendableXp, doorGems, cutVine, collectDoorGem } = useProgress();
  const [asking, setAsking] = useState(null); // the question being answered, or null
  const [chosen, setChosen] = useState(null);
  const [wrong, setWrong] = useState(false);
  const [message, setMessage] = useState("");
  const [cutting, setCutting] = useState(false); // the avatar is swinging
  const [flying, setFlying] = useState(false); // the gem is on its way into the backpack
  const [found, setFound] = useState(null); // the gem that went in the backpack

  const removed = VINES - vinesLeft;
  const open = vinesLeft === 0;
  const nextGem = gemFor(doorGems.length);

  function tapVine() {
    if (asking || open) return;
    if (spendableXp < VINE_COST) {
      setMessage(DOOR_NEED_XP);
      return;
    }
    setMessage("");
    setChosen(null);
    setWrong(false);
    setAsking(vineQuestion(grade, removed, dayNumber()));
  }

  function answer(choice) {
    if (!asking || chosen) return;
    const right = choice === (asking.type === "vowel" ? asking.answer : asking.word);
    setChosen(choice);
    if (!right) {
      setWrong(true);
      setTimeout(() => {
        setChosen(null);
        setWrong(false);
      }, 700);
      return;
    }
    setTimeout(() => {
      setAsking(null);
      if (cutVine()) {
        setCutting(true);
        setTimeout(() => setCutting(false), 700);
      }
    }, 600);
  }

  function takeGem() {
    if (!open || flying || found) return;
    setFlying(true);
    setTimeout(() => {
      const gem = collectDoorGem();
      setFound(gem);
      setFlying(false);
    }, 1100);
  }

  // the avatar walks toward the door as vines come down
  const walk = Math.min(1, removed / VINES);

  return (
    <section className="page vd">
      <TopBar label="VINE DOOR" />
      <div className="vd__scroll">
        <div className="vd__inner">
          <p className="vd__intro">
            <button className="vd__speak" onClick={() => speak(DOOR_INTRO)} aria-label="Read aloud">
              <Volume2 size={18} />
            </button>
            Cut every vine to get the gem behind the door!
          </p>

          <div className="vd__status">
            <span className="vd__chip">
              <Zap size={16} fill="currentColor" /> {spendableXp} XP to spend
            </span>
            <span className="vd__chip">
              <Scissors size={16} /> Each vine costs {VINE_COST} XP
            </span>
            <span className="vd__chip">
              Vines left: {vinesLeft} of {VINES}
            </span>
          </div>

          <div className="vd__stage">
            {/* your avatar, carrying the backpack, walks up to the door */}
            <div className={`vd__hero${cutting ? " is-cutting" : ""}${wrong ? " is-wrong" : ""}${found ? " is-happy" : ""}`} style={{ "--walk": walk }}>
              <Avatar id={avatar} size={110} />
              <span className="vd__pack" aria-label="Your backpack">
                <Backpack size={30} />
                <span className="vd__pack-count">{doorGems.length}</span>
              </span>
              {cutting && (
                <span className="vd__snip" aria-hidden="true">
                  <Scissors size={30} />
                </span>
              )}
            </div>

            <div className={`vd__door${open ? " is-open" : ""}`}>
              <div className="vd__arch">
                {/* the gem hides behind the door */}
                <button className={`vd__gem${open ? " is-ready" : ""}${flying ? " is-flying" : ""}${found ? " is-gone" : ""}`} onClick={takeGem} disabled={!open} aria-label={`Take the ${nextGem.name}`}>
                  <WordPicture word={nextGem.id} size={92} />
                </button>
                <span className="vd__doors" aria-hidden="true">
                  <span className="vd__leaf vd__leaf--left" />
                  <span className="vd__leaf vd__leaf--right" />
                </span>
                {/* the vines */}
                {Array.from({ length: VINES }, (_, i) => i >= removed && (
                  <button key={i} className={`vd__vine vd__vine--${i}`} onClick={tapVine} aria-label={`Vine ${i + 1}: tap to cut it`}>
                    <span className="vd__leafy vd__leafy--a" />
                    <span className="vd__leafy vd__leafy--b" />
                    <span className="vd__leafy vd__leafy--c" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {message && <p className="vd__message">{message}</p>}

          {open && !found && (
            <p className="vd__message vd__message--good">
              <button className="vd__speak" onClick={() => speak(DOOR_OPEN)} aria-label="Read aloud">
                <Volume2 size={18} />
              </button>
              The door is open! Tap the gem to put it in your backpack.
            </p>
          )}

          {found && (
            <div className="vd__found">
              <h2>
                <button className="vd__speak" onClick={() => speak(gemFoundLine(found))} aria-label="Read aloud">
                  <Volume2 size={18} />
                </button>
                You found the {found.name}!
              </h2>
              <p>It is in your backpack.</p>
              <div className="vd__found-actions">
                <button className="btn btn--primary" onClick={() => navigate("/backpack")}>
                  <Backpack size={18} /> See my backpack
                </button>
                <button className="btn btn--outline" onClick={onHome}>
                  Back home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {asking && (
        <div className="vd__ask" role="dialog" aria-label="Answer to cut the vine">
          <div className="vd__card">
            <h2>{asking.type === "vowel" ? PLACEMENT_VOWEL_PROMPT : PLACEMENT_PROMPT}</h2>
            {asking.type === "vowel" && (
              <>
                <WordPicture word={asking.word} size={84} />
                <div className="vd__puzzle" aria-label="The word with a missing vowel">
                  {asking.template.map((letter, i) => (
                    <span key={i} className={`vd__tile${letter ? "" : " is-blank"}`}>
                      {letter ?? "?"}
                    </span>
                  ))}
                </div>
              </>
            )}
            <button className="vd__hear" onClick={() => speak(asking.word)} aria-label="Hear the word">
              <Volume2 size={26} /> Hear it
            </button>
            <div className={`vd__choices${asking.type === "vowel" ? " vd__choices--vowels" : ""}`}>
              {(asking.type === "vowel" ? VOWELS : asking.choices).map((c) => (
                <button key={c} className={`vd__choice${chosen === c ? (wrong ? " is-wrong" : " is-right") : ""}`} onClick={() => answer(c)} disabled={Boolean(chosen)}>
                  {c}
                </button>
              ))}
            </div>
            <button className="vd__cancel" onClick={() => setAsking(null)}>
              Not now
            </button>
          </div>
        </div>
      )}

      <AccessibilityToolbar />
    </section>
  );
}

export default VineDoor;
