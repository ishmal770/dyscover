// The end-of-lesson screen every game shows when a session is finished:
// stars, XP earned, the day streak, and the daily goal. Finishing a lesson is
// what saves progress (and unlocks the next lesson on the path), so it is
// recorded here, exactly once, when this screen first appears.
import { useEffect, useRef, useState } from "react";
import { Star, Zap, Flame, Target, Lock, ArrowRight, RotateCcw } from "lucide-react";
import GuideArt from "./GuideArt";
import Avatar from "./Avatar";
import { GemArt, TreasureArt } from "./TreasureArt";
import { speak } from "../audio/speech";
import { useGuide } from "../context/GuideContext";
import { useProgress } from "../context/ProgressContext";
import { LESSON_BY_ID, UNITS } from "../data/lessons";
import "./LessonComplete.css";

// What the guide says, by stars (recorded clips - see scripts/build_audio.py)
const CHEER = {
  3: "Lesson complete! Amazing work, you got three stars!",
  2: "Lesson complete! Great job, you got two stars!",
  1: "Lesson complete! Good try, you got one star. Practice makes you stronger!",
};

function LessonComplete({ lessonId, stars, character, onPlayAgain, onBack }) {
  const { completeLesson } = useProgress();
  const { guide } = useGuide();
  const guideId = character || guide.id;
  const lesson = LESSON_BY_ID[lessonId];
  const earned = Math.min(3, Math.max(1, stars)); // finishing always earns at least one star
  const recorded = useRef(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    setResult(completeLesson(lessonId, earned));
    speak(CHEER[earned], { voice: guideId });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!result) return null;

  const unit = UNITS.find((u) => u.id === lesson.unitId);
  const upNext = result.firstTime ? unit.lessons[lesson.indexInUnit + 1] : null;

  return (
    <div className="lesson-complete">
      <div className="lesson-complete__mascot">
        <GuideArt character={guideId} waving size={110} />
      </div>
      <h1>Lesson complete!</h1>
      <p className="lesson-complete__name">{lesson.name}</p>

      <div className="lesson-complete__stars" aria-label={`${earned} out of 3 stars`}>
        {[1, 2, 3].map((n) => (
          <Star
            key={n}
            size={44}
            fill={n <= earned ? "currentColor" : "none"}
            className={n <= earned ? "is-earned" : ""}
            style={{ animationDelay: `${0.2 + n * 0.25}s` }}
          />
        ))}
      </div>

      <div className="lesson-complete__stats">
        <div className="lesson-complete__stat lesson-complete__stat--xp">
          <Zap size={20} fill="currentColor" />
          <strong>+{result.xpGained}</strong>
          <span>XP earned</span>
        </div>
        <div className="lesson-complete__stat lesson-complete__stat--streak">
          <Flame size={20} fill="currentColor" />
          <strong>{result.streak}</strong>
          <span>day streak</span>
        </div>
        <div className="lesson-complete__stat lesson-complete__stat--goal">
          <Target size={20} />
          <strong>
            {Math.min(result.todayXp, result.goal)}/{result.goal}
          </strong>
          <span>daily goal</span>
        </div>
      </div>

      {result.treasure && (
        <p className="lesson-complete__banner lesson-complete__banner--avatar">
          <TreasureArt icon={result.treasure.icon} size={40} /> Treasure found: {result.treasure.name}!
        </p>
      )}
      {result.gem && (
        <p className="lesson-complete__banner lesson-complete__banner--avatar">
          <GemArt color={result.gem.color} dark={result.gem.dark} size={40} glow />
          {result.gem.hasNext ? `You won the ${result.gem.name}! Put it in the gate on the map.` : `You won the ${result.gem.name}!`}
        </p>
      )}
      {result.leveledUp && <p className="lesson-complete__banner">Level up! You are now level {result.level}!</p>}
      {result.newAvatars.map((a) => (
        <p key={a.id} className="lesson-complete__banner lesson-complete__banner--unlock lesson-complete__banner--avatar">
          <Avatar id={a.id} size={34} /> New avatar unlocked: {a.name}! Change it on your home page.
        </p>
      ))}
      {result.goalReached && <p className="lesson-complete__banner">Daily goal reached!</p>}
      {upNext && (
        <p className="lesson-complete__banner lesson-complete__banner--unlock">
          <Lock size={14} /> New lesson unlocked: {upNext.name}
        </p>
      )}

      <div className="lesson-complete__actions">
        <button className="btn btn--primary" onClick={onBack}>
          Continue <ArrowRight size={16} />
        </button>
        <button className="btn btn--outline" onClick={onPlayAgain}>
          <RotateCcw size={14} /> Practice again
        </button>
      </div>
    </div>
  );
}

export default LessonComplete;
