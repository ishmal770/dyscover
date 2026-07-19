import { Volume2, Star, Lock, Play } from "lucide-react";
import TopBar from "./TopBar";
import AccessibilityToolbar from "./AccessibilityToolbar";
import GuideBubble from "./GuideBubble";
import "./WorldHub.css";

function ActivityCard({ activity, onPlay }) {
  const { name, description, icon: Icon, stars, locked } = activity;

  return (
    <div className={`hub-card${locked ? " hub-card--locked" : ""}`}>
      <div className="hub-card__top">
        <div className="hub-card__icon">
          <Icon size={18} />
        </div>
        <div className="hub-card__stars">
          {[0, 1, 2].map((i) => (
            <Star key={i} size={12} fill={i < stars ? "currentColor" : "none"} />
          ))}
        </div>
      </div>
      <h3>{name}</h3>
      <p>{description}</p>
      {locked ? (
        <button className="btn btn--locked" disabled>
          <Lock size={14} /> Locked
        </button>
      ) : (
        <button className="btn btn--primary btn--block" onClick={() => onPlay(activity)}>
          <Play size={12} fill="currentColor" /> Play Now
        </button>
      )}
    </div>
  );
}

function WorldHub({ worldLabel, badgeIcon: BadgeIcon, title, subtitle, masteryStars, masteryTotal, activities, onPlay }) {
  return (
    <section className="page hub">
      <TopBar label={worldLabel} showLogo />
      <div className="hub__header">
        <div>
          <h1>
            {title}
            <button className="hub__sound-btn" aria-label="Read aloud">
              <Volume2 size={16} />
            </button>
          </h1>
          <p className="hub__subtitle">{subtitle}</p>
        </div>
        <div className="hub__mastery-group">
          <div className="hub__badge">
            <BadgeIcon size={22} />
          </div>
          <div className="hub__mastery">
            <span className="hub__mastery-label">World Mastery</span>
            <span className="hub__mastery-value">
              <Star size={12} fill="currentColor" /> {masteryStars} / {masteryTotal} Stars
            </span>
          </div>
        </div>
      </div>
      <div className="hub__cards">
        {activities.map((activity) => (
          <ActivityCard key={activity.name} activity={activity} onPlay={onPlay} />
        ))}
      </div>
      <AccessibilityToolbar />
      <GuideBubble message="Hi! Need help figuring out where to go next?" />
    </section>
  );
}

export default WorldHub;
