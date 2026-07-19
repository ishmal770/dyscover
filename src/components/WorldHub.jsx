import { useState } from "react";
import { Search, Volume2, Star, Lock, Info, Trophy, ArrowRight, Play } from "lucide-react";
import TopBar from "./TopBar";
import AccessibilityToolbar from "./AccessibilityToolbar";
import GuideBubble from "./GuideBubble";
import GameIntroModal from "./GameIntroModal";
import "./WorldHub.css";

function ActivityRow({ activity, isOpen, onSelect }) {
  const { name, description, stars, locked, lockNote } = activity;

  return (
    <button
      type="button"
      className={`hub-row${isOpen ? " hub-row--selected" : ""}${locked ? " hub-row--locked" : ""}`}
      onClick={() => !locked && onSelect(activity)}
      disabled={locked}
    >
      <div className="hub-row__top">
        <span className="hub-row__title">{name}</span>
        {locked ? <Lock size={14} /> : <Volume2 size={13} className="hub-row__sound" />}
        <div className="hub-row__stars">
          {[0, 1, 2].map((i) => (
            <Star key={i} size={11} fill={i < stars ? "currentColor" : "none"} />
          ))}
        </div>
      </div>
      <p>{description}</p>
      {locked && lockNote && (
        <span className="hub-row__note">
          <Info size={11} /> {lockNote}
        </span>
      )}
      {isOpen && (
        <span className="hub-row__tab">
          <Play size={11} fill="currentColor" />
        </span>
      )}
    </button>
  );
}

function WorldHub({ worldLabel, title, activities, progressLabel, masteryStars, masteryTotal, onHome, onMap, onStartGame }) {
  const [openActivity, setOpenActivity] = useState(null);

  return (
    <section className="page hub">
      <TopBar label={worldLabel} showLogo onLogoClick={onHome} />
      <div className="hub__body">
        <div className="hub__list-card">
          <div className="hub__list-header">
            <div className="hub__list-icon">
              <Search size={16} />
            </div>
            <h2>{title}</h2>
            <button className="hub__sound-btn" aria-label="Read aloud">
              <Volume2 size={13} />
            </button>
          </div>
          <div className="hub__list">
            {activities.map((activity) => (
              <ActivityRow
                key={activity.name}
                activity={activity}
                isOpen={openActivity?.name === activity.name}
                onSelect={setOpenActivity}
              />
            ))}
          </div>
          <div className="hub__footer">
            <div className="hub__footer-progress">
              <span className="hub__footer-label">{progressLabel}</span>
              <span className="hub__footer-value">
                <Trophy size={13} /> {masteryStars} / {masteryTotal} Stars
              </span>
            </div>
            <button className="hub__map-btn" onClick={onMap}>
              Map <ArrowRight size={13} />
            </button>
          </div>
        </div>

        <div className="hub__preview">
          <div className="hub__preview-scene">
            <div className="hub__preview-topline">
              <span>Game Preview</span>
              <span className="hub__preview-score">Score: 120</span>
            </div>
            <div className="hub__preview-tiles">
              <div className="hub__preview-tile" />
              <div className="hub__preview-tile" />
              <div className="hub__preview-tile" />
            </div>
          </div>
          {openActivity && (
            <GameIntroModal
              activityName={openActivity.name}
              onClose={() => setOpenActivity(null)}
              onStart={() => (onStartGame ? onStartGame(openActivity) : setOpenActivity(null))}
            />
          )}
        </div>
      </div>
      <AccessibilityToolbar />
      <GuideBubble message="Hi! Need help figuring out where to go next?" />
    </section>
  );
}

export default WorldHub;
