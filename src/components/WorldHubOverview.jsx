import { Volume2, Star, Lock, Play } from "lucide-react";
import TopBar from "./TopBar";
import AccessibilityToolbar from "./AccessibilityToolbar";
import GuideBubble from "./GuideBubble";
import "./WorldHubOverview.css";

function ActivityCard({ activity, onPlay }) {
  const { name, description, stars, locked } = activity;

  return (
    <div className={`hubov-card${locked ? " hubov-card--locked" : ""}`}>
      <div className="hubov-card__top">
        <span className="hubov-card__title">
          {name}
          {locked ? <Lock size={13} /> : <Volume2 size={12} />}
        </span>
        <div className="hubov-card__stars">
          {[0, 1, 2].map((i) => (
            <Star key={i} size={12} fill={i < stars ? "currentColor" : "none"} />
          ))}
        </div>
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

function WorldHubOverview({ worldLabel, badgeIcon: BadgeIcon, title, subtitle, masteryStars, masteryTotal, activities, onPlay, onHome }) {
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
        <div className="hubov__mastery-group">
          <div className="hubov__badge">
            <BadgeIcon size={22} />
          </div>
          <div className="hubov__mastery">
            <span className="hubov__mastery-label">World Mastery</span>
            <span className="hubov__mastery-value">
              <Star size={12} fill="currentColor" /> {masteryStars} / {masteryTotal} Stars
            </span>
          </div>
        </div>
      </div>
      <div className="hubov__cards">
        {activities.map((activity) => (
          <ActivityCard key={activity.name} activity={activity} onPlay={onPlay} />
        ))}
      </div>
      <AccessibilityToolbar />
      <GuideBubble message="Hi! Need help figuring out where to go next?" />
    </section>
  );
}

export default WorldHubOverview;
