// The vine doors: a bonus game that opens after a day of lessons. Your avatar, a whole person
// carrying a backpack, walks up to a door covered in thin, curling vines. Spend XP from your
// lessons to cut the vines on today's door and find a gem - or save the XP for the golden door,
// which has more vines and an even better prize. There are no questions: the choice is the game.
import { useState } from "react";
import { Backpack, Check, PiggyBank, Volume2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import PersonFigure from "../components/PersonFigure";
import WordPicture from "../components/WordPicture";
import VineArt from "../components/VineArt";
import { speak } from "../audio/speech";
import { useProgress } from "../context/ProgressContext";
import { DOORS, DOOR_CONFIRM, DOOR_INTRO, DOOR_NEED_XP, DOOR_OPEN, prizeFor, prizeFoundLine } from "../data/vineDoor";
import "./VineDoor.css";

function VineDoor({ onHome }) {
  const navigate = useNavigate();
  const { avatar, dailyLeft, goldenLeft, spendableXp, doorGems, goldenPrizes, dailyCollected, cutVine, collectDoorGem } = useProgress();
  const [kind, setKind] = useState("daily"); // which door is showing: "daily" or "golden"
  const [pending, setPending] = useState(false); // a vine was tapped: spend XP or save it?
  const [pose, setPose] = useState("idle");
  const [falling, setFalling] = useState(null); // the vine that was just cut (falls before it disappears)
  const [flying, setFlying] = useState(false);
  const [found, setFound] = useState(null);

  const door = DOORS[kind];
  const left = kind === "daily" ? dailyLeft : goldenLeft;
  const removed = door.vines - left;
  const open = left === 0;
  const prize = prizeFor(kind, kind === "daily" ? doorGems.length : goldenPrizes.length);
  const enough = spendableXp >= door.cost;

  function switchDoor(next) {
    setKind(next);
    setPending(false);
    setFound(null);
    setFlying(false);
  }

  function tapVine() {
    if (open || found) return;
    setPending(true);
  }

  function spend() {
    setPending(false);
    const index = removed; // the vine that will fall
    if (cutVine(kind)) {
      setFalling(index);
      setPose("cutting");
      setTimeout(() => setFalling(null), 750);
      setTimeout(() => setPose("idle"), 750);
    }
  }

  function takePrize() {
    if (!open || flying || found) return;
    setFlying(true);
    setTimeout(() => {
      setFound(collectDoorGem(kind));
      setFlying(false);
      setPose("happy");
      setTimeout(() => setPose("idle"), 1500);
    }, 1100);
  }

  // everything is "looking" at the door: the avatar steps closer as vines come down
  const walk = Math.min(1, removed / door.vines);

  return (
    <section className="page vd">
      <TopBar label="VINE DOORS" />
      <div className="vd__scroll">
        <div className="vd__inner">
          <p className="vd__intro">
            <button className="vd__speak" onClick={() => speak(DOOR_INTRO)} aria-label="Read aloud">
              <Volume2 size={18} />
            </button>
            Spend your XP to cut vines, or save it for the golden door!
          </p>

          <div className="vd__tabs" role="tablist">
            <button role="tab" aria-selected={kind === "daily"} className={kind === "daily" ? "is-on" : ""} onClick={() => switchDoor("daily")}>
              Today&rsquo;s door
              <small>{DOORS.daily.vines} vines</small>
            </button>
            <button role="tab" aria-selected={kind === "golden"} className={`vd__tab--gold${kind === "golden" ? " is-on" : ""}`} onClick={() => switchDoor("golden")}>
              Golden door
              <small>{DOORS.golden.vines} vines &middot; rare prize</small>
            </button>
          </div>

          <div className="vd__status">
            <span className="vd__chip">
              <Zap size={16} fill="currentColor" /> {spendableXp} XP to spend
            </span>
            <span className="vd__chip">{door.cost} XP per vine</span>
            <span className="vd__chip">
              {left} of {door.vines} vines left
            </span>
          </div>

          <div className="vd__stage">
            <div className="vd__hero" style={{ "--walk": walk }}>
              <PersonFigure id={avatar} height={230} pose={pose} packCount={doorGems.length + goldenPrizes.length} />
            </div>

            <div className={`vd__door vd__door--${kind}${open ? " is-open" : ""}`}>
              <div className="vd__arch">
                <button className={`vd__gem${open ? " is-ready" : ""}${flying ? " is-flying" : ""}${found ? " is-gone" : ""}`} onClick={takePrize} disabled={!open} aria-label={`Take the ${prize.name}`}>
                  <WordPicture word={prize.id} size={kind === "golden" ? 104 : 92} />
                </button>
                <span className="vd__planks" aria-hidden="true">
                  <span className="vd__plank vd__plank--left" />
                  <span className="vd__plank vd__plank--right" />
                  <span className="vd__band vd__band--top" />
                  <span className="vd__band vd__band--bottom" />
                  <span className="vd__ring" />
                </span>
                {Array.from({ length: door.vines }, (_, i) => {
                  const isFalling = falling === i;
                  if (i < removed && !isFalling) return null;
                  return (
                    <button
                      key={`${kind}-${i}`}
                      className={`vd__vine${isFalling ? " is-falling" : ""}`}
                      style={{ top: `${6 + (i * 84) / Math.max(1, door.vines - 1)}%`, "--tilt": `${i % 2 ? 5 : -6}deg` }}
                      onClick={tapVine}
                      aria-label={`Vine ${i + 1}: tap to cut it`}
                    >
                      <VineArt seed={i} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {pending && (
            <div className="vd__confirm" role="dialog" aria-label="Spend your XP?">
              <p>
                <button className="vd__speak" onClick={() => speak(enough ? DOOR_CONFIRM : DOOR_NEED_XP)} aria-label="Read aloud">
                  <Volume2 size={18} />
                </button>
                {enough ? `Spend ${door.cost} XP to cut this vine, or save your XP for ${kind === "daily" ? "the golden door" : "later"}?` : "You need more XP to cut a vine. Finish more lessons to earn it."}
              </p>
              <div className="vd__confirm-actions">
                {enough && (
                  <button className="btn btn--primary" onClick={spend}>
                    <Check size={18} /> Cut it (&minus;{door.cost} XP)
                  </button>
                )}
                <button className="btn btn--outline" onClick={() => setPending(false)}>
                  <PiggyBank size={18} /> Save my XP
                </button>
              </div>
            </div>
          )}

          {open && !found && (
            <p className="vd__message">
              <button className="vd__speak" onClick={() => speak(DOOR_OPEN)} aria-label="Read aloud">
                <Volume2 size={18} />
              </button>
              The door is open! Tap the prize to put it in your backpack.
            </p>
          )}

          {found && (
            <div className="vd__found">
              <h2>
                <button className="vd__speak" onClick={() => speak(prizeFoundLine(found))} aria-label="Read aloud">
                  <Volume2 size={18} />
                </button>
                You found the {found.name}!
              </h2>
              <p>It is in your backpack.</p>
              <div className="vd__found-actions">
                <button className="btn btn--primary" onClick={() => navigate("/backpack")}>
                  <Backpack size={18} /> See my backpack
                </button>
                {kind === "daily" && (
                  <button className="btn btn--outline" onClick={() => switchDoor("golden")}>
                    Try the golden door
                  </button>
                )}
                <button className="btn btn--outline" onClick={onHome}>
                  Back home
                </button>
              </div>
            </div>
          )}

          {kind === "daily" && dailyCollected && !found && (
            <p className="vd__note">You already found today&rsquo;s gem. Save your XP for the golden door!</p>
          )}
        </div>
      </div>
      <AccessibilityToolbar />
    </section>
  );
}

export default VineDoor;
