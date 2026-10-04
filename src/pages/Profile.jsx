// The child's account page: their name, level and stats, and a picker for the
// avatar. Avatars unlock as the child earns levels, stars and treasures
// (rules in data/avatars.js); locked ones show what is needed.
import { useState } from "react";
import { ArrowLeft, Check, Flame, Lock, Pencil, Star, Backpack, Zap } from "lucide-react";
import TopBar from "../components/TopBar";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import GuideBubble from "../components/GuideBubble";
import Avatar from "../components/Avatar";
import { GRADE_BANDS } from "../data/questionBanks";
import { useProgress } from "../context/ProgressContext";
import { AVATARS, unlockText } from "../data/avatars";
import { JUNGLES } from "../data/jungleQuiz";
import "./Profile.css";

function Profile({ onBack, onQuiz, onPlacement }) {
  const { grade, jungle, name, setName, avatar, setAvatar, levelInfo, xp, streak, bestStreak, stats, maxStars, isAvatarUnlocked } = useProgress();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [notice, setNotice] = useState("");

  function saveName(event) {
    event.preventDefault();
    setName(draft);
    setEditing(false);
  }

  function pick(a) {
    if (isAvatarUnlocked(a)) {
      setAvatar(a.id);
      setNotice(`You are now ${a.name}!`);
    } else {
      setNotice(`${a.name} unlocks when you ${unlockText(a).toLowerCase()}.`);
    }
  }

  const unlockedCount = AVATARS.filter((a) => isAvatarUnlocked(a)).length;

  return (
    <section className="page profile">
      <TopBar label="MY PROFILE" />
      <div className="profile__scroll">
        <div className="profile__inner">
          <button className="profile__back" onClick={onBack}>
            <ArrowLeft size={16} /> Back to dashboard
          </button>

          <header className="profile__hero">
            <div className="profile__avatar-wrap">
              <Avatar id={avatar} size={116} />
              <span className="profile__level-badge">Lv {levelInfo.level}</span>
            </div>
            <div className="profile__who">
              {editing ? (
                <form className="profile__name-form" onSubmit={saveName}>
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={16} autoFocus aria-label="Your name" />
                  <button type="submit" className="btn btn--primary">
                    Save
                  </button>
                </form>
              ) : (
                <h1>
                  {name}
                  <button
                    className="profile__edit"
                    onClick={() => {
                      setDraft(name);
                      setEditing(true);
                    }}
                    aria-label="Change my name"
                  >
                    <Pencil size={14} />
                  </button>
                </h1>
              )}
              <div className="profile__level" role="progressbar" aria-valuenow={levelInfo.into} aria-valuemin={0} aria-valuemax={levelInfo.needed}>
                <div style={{ width: `${levelInfo.percent}%` }} />
              </div>
              <p className="profile__level-text">
                {levelInfo.into}/{levelInfo.needed} XP to level {levelInfo.level + 1}
              </p>
            </div>
          </header>

          <div className="profile__stats">
            <div className="profile__stat profile__stat--xp">
              <Zap size={20} fill="currentColor" />
              <strong>{xp}</strong>
              <span>total XP</span>
            </div>
            <div className="profile__stat profile__stat--streak">
              <Flame size={20} fill="currentColor" />
              <strong>{streak}</strong>
              <span>day streak (best {bestStreak})</span>
            </div>
            <div className="profile__stat profile__stat--stars">
              <Star size={20} fill="currentColor" />
              <strong>
                {stats.stars}/{maxStars}
              </strong>
              <span>stars</span>
            </div>
            <div className="profile__stat profile__stat--trophies">
              <Backpack size={20} />
              <strong>{stats.treasures}</strong>
              <span>treasures</span>
            </div>
          </div>

          <div className="profile__jungle" style={jungle ? { borderColor: JUNGLES[jungle].color } : undefined}>
            <span className="profile__jungle-emoji" aria-hidden="true">
              {jungle ? JUNGLES[jungle].emoji : "🌴"}
            </span>
            <div>
              <strong>{jungle ? JUNGLES[jungle].name : "Which jungle are you joining?"}</strong>
              <span>{jungle ? "This is your jungle!" : "Take the picture quiz to find out."}</span>
            </div>
            <button className="btn btn--outline" onClick={onQuiz}>
              {jungle ? "Retake quiz" : "Take quiz"}
            </button>
          </div>

          <div className="profile__jungle">
            <span className="profile__jungle-emoji" aria-hidden="true">
              🎯
            </span>
            <div>
              <strong>{GRADE_BANDS.find((b) => b.id === grade)?.label}</strong>
              <span>Picked for you by your placement mission.</span>
            </div>
            <button className="btn btn--outline" onClick={onPlacement}>
              Play placement again
            </button>
          </div>

          <h2 className="profile__heading">
            Choose my avatar{" "}
            <span>
              {unlockedCount}/{AVATARS.length} unlocked
            </span>
          </h2>
          <div className="profile__grid">
            {AVATARS.map((a) => {
              const open = isAvatarUnlocked(a);
              const chosen = a.id === avatar;
              return (
                <button
                  key={a.id}
                  className={`profile__avatar${chosen ? " is-chosen" : ""}${open ? "" : " is-locked"}`}
                  onClick={() => pick(a)}
                  data-help="avatar"
                  aria-pressed={chosen}
                  aria-label={open ? `${a.name}${chosen ? ", chosen" : ""}` : `${a.name}, locked. ${unlockText(a)}`}
                >
                  <Avatar id={a.id} size={84} locked={!open} />
                  <strong>{open ? a.name : "???"}</strong>
                  {chosen ? (
                    <span className="profile__avatar-tag profile__avatar-tag--on">
                      <Check size={12} strokeWidth={3} /> Chosen
                    </span>
                  ) : open ? (
                    <span className="profile__avatar-tag">Tap to use</span>
                  ) : (
                    <span className="profile__avatar-tag profile__avatar-tag--lock">
                      <Lock size={11} /> {unlockText(a)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="profile__notice" role="status">
            {notice || "Play lessons to earn levels, stars and treasures and unlock more avatars!"}
          </p>
        </div>
      </div>

      <AccessibilityToolbar />
      <GuideBubble
        fixedCharacter="sloth"
        message="This is your profile! Pick a picture to be your avatar. Play more lessons to unlock new ones."
        instructions="This is your profile. Tap a picture to make it your avatar. Pictures with a lock need more levels, stars or treasures. Tap the pencil to change your name."
      />
    </section>
  );
}

export default Profile;
