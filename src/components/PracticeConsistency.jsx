// Expert dashboard card: is this student practicing steadily? A 4-week
// calendar (each square is a day, darker = more minutes), weekly practice days
// against the goal, and the streaks.
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import { Flame, CalendarCheck, Timer, Target } from "lucide-react";
import { GOAL_DAYS_PER_WEEK, summarize } from "../data/consistency";
import "./PracticeConsistency.css";

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function level(minutes) {
  if (minutes === 0) return 0;
  if (minutes < 10) return 1;
  if (minutes < 16) return 2;
  return 3;
}

function PracticeConsistency({ practice, unit = "min" }) {
  const s = summarize(practice);
  const today = new Date();
  // the weekday of each of the 28 days, so the grid lines up with real weekdays
  const dayLetter = (i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (27 - i));
    return DAY_LETTERS[d.getDay()];
  };
  const startPad = (() => {
    const d = new Date(today);
    d.setDate(today.getDate() - 27);
    return d.getDay();
  })();

  return (
    <div className="expert-dash__card consistency">
      <div className="consistency__head">
        <div>
          <h3>Practice Consistency</h3>
          <p className="expert-dash__card-sub">
            Practiced {s.active} of the last 28 days. The goal is {GOAL_DAYS_PER_WEEK} days a week.
          </p>
        </div>
        <span className={`consistency__status consistency__status--${s.weeksOnGoal >= 3 ? "good" : s.weeksOnGoal >= 2 ? "ok" : "low"}`}>
          {s.status}
        </span>
      </div>

      <div className="consistency__stats">
        <div>
          <Flame size={18} />
          <strong>{s.streakNow}</strong>
          <span>day streak now</span>
        </div>
        <div>
          <CalendarCheck size={18} />
          <strong>{s.streakBest}</strong>
          <span>best streak</span>
        </div>
        <div>
          <Target size={18} />
          <strong>{s.weeksOnGoal}/4</strong>
          <span>weeks on goal</span>
        </div>
        <div>
          <Timer size={18} />
          <strong>
            {s.avgMinutes} {unit}
          </strong>
          <span>per practice day</span>
        </div>
      </div>

      <div className="consistency__body">
        <div>
          <div className="consistency__weekdays" aria-hidden="true">
            {DAY_LETTERS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="consistency__grid" role="img" aria-label={`Practice calendar: ${s.active} of the last 28 days`}>
            {Array.from({ length: startPad }).map((_, i) => (
              <span key={`pad${i}`} className="consistency__day consistency__day--pad" />
            ))}
            {practice.map((m, i) => (
              <span
                key={i}
                className={`consistency__day consistency__day--l${level(m)}${i === practice.length - 1 ? " is-today" : ""}`}
                title={`${dayLetter(i)}: ${m ? `${m} ${unit}` : "no practice"}`}
              />
            ))}
          </div>
          <div className="consistency__legend" aria-hidden="true">
            Less <span className="consistency__day consistency__day--l0" />
            <span className="consistency__day consistency__day--l1" />
            <span className="consistency__day consistency__day--l2" />
            <span className="consistency__day consistency__day--l3" /> More
          </div>
        </div>

        <div className="consistency__chart">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={s.weeks} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 7]} allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} days`, "Practiced"]} />
              <ReferenceLine y={GOAL_DAYS_PER_WEEK} stroke="#d98c1f" strokeDasharray="5 4" label={{ value: "goal", fontSize: 11, fill: "#d98c1f", position: "insideTopRight" }} />
              <Bar dataKey="days" fill="var(--green)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
          <p className="consistency__chart-note">Days practiced each week</p>
        </div>
      </div>
    </div>
  );
}

export default PracticeConsistency;
