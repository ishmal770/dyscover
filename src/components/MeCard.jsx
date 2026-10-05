// "Me": the child's avatar, name, level and stats, with a picker to change the
// avatar right on the page. (This used to be a separate profile page.) Avatars
// unlock with levels, stars and treasures - rules in data/avatars.js.
import { useState } from "react";
import { Backpack, Check, Flame, Lock, Pencil, Star, Zap } from "lucide-react";
import Avatar from "./Avatar";
import { useProgress } from "../context/ProgressContext";
import { AVATARS, unlockText } from "../data/avatars";
import { JUNGLES } from "../data/jungleQuiz";
import { GRADE_BANDS } from "../data/questionBanks";
import "./MeCard.css";

function MeCard({ headline }) {
  const { name, setName, avatar, setAvatar, levelInfo, jungle, grade, isAvatarUnlocked, xp, streak, totalStars, maxStars, stats } = useProgress();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [picking, setPicking] = useState(false);
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

  return (
    <section className="me">
      <div className="profile__hero">
        <button className="profile__avatar-wrap me__avatar-btn" onClick={() => setPicking((p) => !p)} aria-label="Change my picture" aria-expanded={picking}>
          <Avatar id={avatar} size={104} />
          <span className="profile__level-badge">Lv {levelInfo.level}</span>
        </button>
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
              Hi, {name}!
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
          <p className="me__headline">{headline}</p>
          <div className="profile__level" role="progressbar" aria-valuenow={levelInfo.into} aria-valuemin={0} aria-valuemax={levelInfo.needed}>
            <div style={{ width: `${levelInfo.percent}%` }} />
          </div>
          <p className="profile__level-text">
            {levelInfo.into}/{levelInfo.needed} XP to level {levelInfo.level + 1}
          </p>
        </div>
      </div>

      <div className="me__chips">
        <span className="dash__chip dash__chip--streak" title="Days in a row">
          <Flame size={18} fill="currentColor" /> {streak}
        </span>
        <span className="dash__chip dash__chip--xp" title="XP">
          <Zap size={18} fill="currentColor" /> {xp}
        </span>
        <span className="dash__chip dash__chip--stars" title="Stars">
          <Star size={18} fill="currentColor" /> {totalStars}/{maxStars}
        </span>
        <span className="dash__chip dash__chip--treasure" title="Treasures">
          <Backpack size={18} /> {stats.treasures}
        </span>
        {jungle && (
          <span className="me__tag" style={{ background: JUNGLES[jungle].color }}>
            {JUNGLES[jungle].emoji} {JUNGLES[jungle].name}
          </span>
        )}
        <span className="me__tag me__tag--grade">{GRADE_BANDS.find((b) => b.id === grade)?.label}</span>
        <button className="me__change" onClick={() => setPicking((p) => !p)} aria-expanded={picking}>
          {picking ? "Done" : "Change picture"}
        </button>
      </div>

      {picking && (
        <div className="me__picker">
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
                  <Avatar id={a.id} size={76} locked={!open} />
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
      )}
    </section>
  );
}

export default MeCard;
