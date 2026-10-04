// The adventure map: every unit's lesson path stacked on one scrolling page,
// each a winding trail of lesson circles like the main screen of a
// language-learning app. A finished lesson shows a check and its
// stars, the next one glows with START, and later ones stay locked until the
// lesson before them is finished. Tapping a circle opens a small card with
// the lesson's description and a Start button.
import { useEffect, useRef, useState } from "react";
import { Check, Lock, Play, Star, X } from "lucide-react";
import TopBar from "./TopBar";
import GemGate from "./GemGate";
import AccessibilityToolbar from "./AccessibilityToolbar";
import GuideBubble from "./GuideBubble";
import { useProgress } from "../context/ProgressContext";
import { UNITS } from "../data/lessons";
import "./LessonPath.css";

const STEP = 190; // vertical distance between circles
const SIDE = 84; // how far circles swing left/right of center
const WIDTH = 340;

// One unit: its banner and trail of lesson circles
function Unit({ unit, unitIndex, currentId, onOpen }) {
  const { isCompleted, isUnlocked, stars, unitProgress } = useProgress();
  const progress = unitProgress(unit.id);

  // Circle centers zig-zag down the page: center, right, center, left, ...
  const swing = [0, SIDE, 0, -SIDE];
  const points = unit.lessons.map((_, i) => ({ x: WIDTH / 2 + swing[i % 4], y: 70 + i * STEP }));
  const height = points[points.length - 1].y + 120;
  const trail = points
    .map((p, i) => {
      if (i === 0) return `M${p.x} ${p.y}`;
      const prev = points[i - 1];
      const mid = (prev.y + p.y) / 2;
      return `C${prev.x} ${mid} ${p.x} ${mid} ${p.x} ${p.y}`;
    })
    .join(" ");

  return (
    <>
      <div className="path__banner">
        <div>
          <span className="path__unit-num">UNIT {unitIndex + 1}</span>
          <h2>{unit.title}</h2>
          <p>{unit.tagline}</p>
          <span className="path__count">
            {progress.done}/{progress.total} lessons &middot; {progress.stars}/{progress.maxStars} stars
          </span>
        </div>
      </div>

      <div className="path__trail" style={{ width: WIDTH, height }}>
        <svg className="path__line" viewBox={`0 0 ${WIDTH} ${height}`} width={WIDTH} height={height} aria-hidden="true">
          <path d={trail} fill="none" stroke="#d8e9cc" strokeWidth="14" strokeLinecap="round" strokeDasharray="2 22" />
        </svg>

        {unit.lessons.map((lesson, i) => {
          const done = isCompleted(lesson.id);
          const unlocked = isUnlocked(lesson.id);
          const state = done ? "done" : lesson.id === currentId ? "current" : unlocked ? "open" : "locked";
          return (
            <div key={lesson.id} className="path__node-wrap" style={{ left: points[i].x, top: points[i].y }}>
              {state === "current" && <span className="path__start-tag">START</span>}
              <button
                className={`path__node path__node--${state}`}
                data-current={state === "current" ? "true" : undefined}
                onClick={() => onOpen(lesson.id)}
                aria-label={`${lesson.name}: ${state === "locked" ? "locked" : done ? "finished" : "ready"}`}
              >
                {state === "done" ? <Check size={46} strokeWidth={3.5} /> : state === "locked" ? <Lock size={36} /> : <Play size={42} fill="currentColor" />}
              </button>
              <span className="path__node-name">{lesson.name}</span>
              {done && (
                <span className="path__node-stars" aria-label={`${stars(lesson.id)} stars`}>
                  {[1, 2, 3].map((n) => (
                    <Star key={n} size={14} fill={n <= stars(lesson.id) ? "currentColor" : "none"} />
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <GemGate unit={unit} />
    </>
  );
}

function LessonPath({ onHome, onStartLesson, guideMessage, guideInstructions }) {
  const { isCompleted, isUnlocked, stars, pendingGem } = useProgress();
  const [openId, setOpenId] = useState(null);
  const scrollRef = useRef(null);

  const allLessons = UNITS.flatMap((u) => u.lessons);
  const open = allLessons.find((l) => l.id === openId);
  const currentId = allLessons.find((l) => !isCompleted(l.id) && isUnlocked(l.id))?.id;
  const allDone = !currentId && !pendingGem;

  // Bring the glowing lesson into view (scroll only this list, never the page)
  useEffect(() => {
    const box = scrollRef.current;
    const node = box?.querySelector('[data-current="true"]');
    if (!box || !node) return;
    const boxRect = box.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    box.scrollTop += nodeRect.top - boxRect.top - boxRect.height / 3;
  }, [currentId]);

  return (
    <section className="page path">
      <TopBar label="ADVENTURE MAP" showLogo onLogoClick={onHome} />

      <div className="path__scroll" ref={scrollRef}>
        <div className="path__inner">
          {UNITS.map((unit, i) => (
            <Unit key={unit.id} unit={unit} unitIndex={i} currentId={currentId} onOpen={setOpenId} />
          ))}
          {allDone && <p className="path__unit-done">You finished every lesson! Practice any one to earn more stars.</p>}
        </div>
      </div>

      {open && (
        <div className="path__sheet-backdrop" onClick={() => setOpenId(null)}>
          <div className="path__sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={open.name}>
            <button className="path__sheet-close" onClick={() => setOpenId(null)} aria-label="Close">
              <X size={16} />
            </button>
            <span className="path__sheet-skill">{open.skill}</span>
            <h2>{open.name}</h2>
            <p>{open.blurb}</p>
            {isUnlocked(open.id) ? (
              <>
                <p className="path__sheet-reward">
                  Earn up to 35 XP{isCompleted(open.id) ? ` - best so far: ${stars(open.id)} stars` : ""}
                </p>
                <button
                  className="path__sheet-start"
                  onClick={() => {
                    setOpenId(null);
                    onStartLesson(open.id);
                  }}
                >
                  <Play size={18} fill="currentColor" /> {isCompleted(open.id) ? "PRACTICE" : "START"}
                </button>
              </>
            ) : (
              <p className="path__sheet-locked">
                <Lock size={14} /> Finish the lesson before this one to open it.
              </p>
            )}
          </div>
        </div>
      )}

      <AccessibilityToolbar />
      <GuideBubble message={guideMessage} instructions={guideInstructions} />
    </section>
  );
}

export default LessonPath;
