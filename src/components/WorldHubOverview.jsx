import { Volume2, Star, Lock, Play, KeyRound } from "lucide-react";
import TopBar from "./TopBar";
import AccessibilityToolbar from "./AccessibilityToolbar";
import GuideBubble from "./GuideBubble";
import "./WorldHubOverview.css";

function ActivityCard({ activity, onPlay }) {
  const { name, description, stars, locked } = activity;

  return (
    <div className={`hubov-card${locked ? " hubov-card--locked" : ""}`}>
      <div className="hubov-card__top">
        {locked ? (
          <div className="hubov-card__key">
            <KeyRound size={15} />
          </div>
        ) : (
          <div className="hubov-card__stars">
            {[0, 1, 2].map((i) => (
              <Star key={i} size={14} fill={i < stars ? "currentColor" : "none"} />
            ))}
          </div>
        )}
        {locked && (
          <span className="hubov-card__lock-badge">
            <Lock size={11} />
          </span>
        )}
      </div>
      <div className="hubov-card__title">
        {name}
        <Volume2 size={12} />
      </div>
      <p>{description}</p>
      {locked ? (
        <button className="btn btn--locked" disabled>
          Locked
        </button>
      ) : (
        <button className="btn btn--primary btn--block" onClick={() => onPlay(activity)}>
          Play Now <Play size={12} fill="currentColor" />
        </button>
      )}
    </div>
  );
}

function WorldHubOverview({
  worldLabel,
  pinIcon: PinIcon,
  title,
  subtitle,
  masteryStars,
  masteryTotal,
  activities,
  onPlay,
  onHome,
}) {
  return (
    <section className="page hubov">
      <TopBar label={worldLabel} showLogo onLogoClick={onHome} />
      <div className="hubov__header">
        <div>
          <h1>
            {title}
            <button className="hubov__sound-btn" aria-label="Read aloud">
              <Volume2 size={16} />
            </button>
          </h1>
          <p className="hubov__subtitle">{subtitle}</p>
        </div>
        <div className="hubov__pin">
          <PinIcon size={20} />
        </div>
        <div className="hubov__mastery">
          <span className="hubov__mastery-label">World Mastery</span>
          <span className="hubov__mastery-value">
            {masteryStars} / {masteryTotal} Stars
          </span>
          <span className="hubov__mastery-star">
            <Star size={13} fill="currentColor" />
          </span>
        </div>
      </div>
      <div className="hubov__cards">
        {activities.map((activity) => (
          <ActivityCard key={activity.name} activity={activity} onPlay={onPlay} />
        ))}
      </div>
      <AccessibilityToolbar />
      <GuideBubble
        message="Hi! Need help figuring out where to go next?"
        avatarIcon={PinIcon}
        avatarLabel="EXPLORE"
      />
    </section>
  );
}

export default WorldHubOverview;
