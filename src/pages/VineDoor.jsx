// The vine doors: a bonus game that opens after a day of lessons. Your avatar, a whole person
// carrying a backpack, walks up to a door covered in painted, curling vines. YOU choose which vines
// to cut and how many: each one costs 10 XP from your lessons, and any XP you don't spend is saved
// (for today's door, or for the golden door with its better prize). No questions - the choice is the game.
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
import { DOORS, DOOR_CHOOSE, DOOR_INTRO, DOOR_NEED_XP, DOOR_OPEN, prizeFor, prizeFoundLine } from "../data/vineDoor";
import "./VineDoor.css";

function VineDoor({ onHome }) {
  const navigate = useNavigate();
  const { avatar, dailyLeft, goldenLeft, spendableXp, doorGems, goldenPrizes, dailyCollected, cutVine, collectDoorGem } = useProgress();
  const [kind, setKind] = useState("daily"); // which door is showing: "daily" or "golden"
  const [picked, setPicked] = useState([]); // the vines chosen to cut (their numbers)
  const [gone, setGone] = useState({ daily: [], golden: [] }); // which vines have been cut, per door
  const [falling, setFalling] = useState([]); // vines that were just cut (they fall before disappearing)
  const [message, setMessage] = useState("");
  const [pose, setPose] = useState("idle");
  const [flying, setFlying] = useState(false);
  const [found, setFound] = useState(null);

  const door = DOORS[kind];
  const left = kind === "daily" ? dailyLeft : goldenLeft;
  const removed = door.vines - left;
  const open = left === 0;
  const prize = prizeFor(kind, kind === "daily" ? doorGems.length : goldenPrizes.length);
  const canAfford = Math.floor(spendableXp / door.cost); // how many vines their XP can cut

  // which vines are gone: the ones cut this visit, or (after a reload) the first few
  const goneNow = gone[kind].length === removed ? gone[kind] : Array.from({ length: removed }, (_, i) => i);

  function switchDoor(next) {
    setKind(next);
    setPicked([]);
    setMessage("");
    setFound(null);
    setFlying(false);
  }

  // tap a vine to choose it (tap again to un-choose it), as long as there is XP for it
  function toggleVine(i) {
    if (open || found) return;
    setMessage("");
    if (picked.includes(i)) {
      setPicked(picked.filter((p) => p !== i));
    } else if (picked.length + 1 > canAfford) {
      setMessage(DOOR_NEED_XP);
    } else {
      setPicked([...picked, i]);
    }
  }

  function cutChosen() {
    if (!picked.length) return;
    const chosen = picked;
    if (cutVine(kind, chosen.length)) {
      setGone((g) => ({ ...g, [kind]: [...goneNow, ...chosen] }));
      setFalling(chosen);
      setPicked([]);
      setPose("cutting");
      setTimeout(() => setFalling([]), 1100);
      setTimeout(() => setPose("idle"), 800);
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

  // the avatar steps closer as vines come down
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
            Choose the vines to cut, or save your XP for the golden door!
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
                  const isFalling = falling.includes(i);
                  if (goneNow.includes(i) && !isFalling) return null;
                  const isPicked = picked.includes(i);
                  return (
                    <button
                      key={`${kind}-${i}`}
                      className={`vd__vine${isPicked ? " is-picked" : ""}${isFalling ? " is-falling" : ""}`}
                      style={{ top: `${3 + (i * 88) / Math.max(1, door.vines - 1)}%`, "--tilt": `${i % 2 ? 4 : -5}deg`, "--sway": `${i % 2 ? 1 : -1}` }}
                      onClick={() => toggleVine(i)}
                      aria-pressed={isPicked}
                      aria-label={`Vine ${i + 1}: ${isPicked ? "chosen, tap to un-choose" : "tap to choose it"}`}
                    >
                      <VineArt seed={i} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {!open && !found && picked.length === 0 && (
            <p className="vd__message vd__message--hint">
              <button className="vd__speak" onClick={() => speak(DOOR_CHOOSE)} aria-label="Read aloud">
                <Volume2 size={18} />
              </button>
              Tap the vines you want to cut. You can choose as many as you like!
            </p>
          )}

          {message && <p className="vd__message">{message}</p>}

          {picked.length > 0 && !open && (
            <div className="vd__confirm" role="group" aria-label="Spend your XP?">
              <p>
                You chose {picked.length} {picked.length === 1 ? "vine" : "vines"}: that costs {picked.length * door.cost} XP.
                {" "}You will have {spendableXp - picked.length * door.cost} XP left.
              </p>
              <div className="vd__confirm-actions">
                <button className="btn btn--primary" onClick={cutChosen}>
                  <Check size={18} /> Cut them (&minus;{picked.length * door.cost} XP)
                </button>
                <button className="btn btn--outline" onClick={() => setPicked([])}>
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
