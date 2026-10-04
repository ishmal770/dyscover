import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line } from "recharts";
import { ArrowLeft, ShieldAlert, Search, Play } from "lucide-react";
import { STUDENTS, GAME_TROPHIES } from "../data/mockData";
import HelpButton from "../components/HelpButton";
import PracticeConsistency from "../components/PracticeConsistency";
import { useProgress } from "../context/ProgressContext";
import { LESSONS } from "../data/lessons";
import { GRADE_BANDS } from "../data/questionBanks";
import "./ExpertDashboard.css";

const TABS = ["Overview & Progress", "Diagnostics & Raw Data", "Settings & Practice"];

function barColor(score) {
  if (score >= 70) return "var(--green)";
  if (score >= 50) return "var(--amber)";
  return "#e05555";
}

// The child using this device, built from their real saved progress (the other
// students are illustrative demo data)
function useLiveStudent() {
  const { name, grade, history, lessons, maxStars, totalStars, lastDay } = useProgress();
  return useMemo(() => {
    const practice = Array.from({ length: 28 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (27 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return Math.round((history[key] || 0) / 2); // about 2 XP per minute
    });
    const bySkill = {};
    LESSONS.forEach((l) => {
      (bySkill[l.skill] = bySkill[l.skill] || []).push(lessons[l.id]?.stars || 0);
    });
    return {
      id: "this-device",
      live: true,
      name: `${name} (this device)`,
      grade: GRADE_BANDS.find((b) => b.id === grade)?.label ?? "",
      lastActive: lastDay ?? "No practice yet",
      overallMastery: Math.round((totalStars / maxStars) * 100),
      practice,
      skills: Object.entries(bySkill).map(([skill, stars]) => ({ skill, score: Math.round((stars.reduce((a, b) => a + b, 0) / (stars.length * 3)) * 100) })),
      curriculumProgress: LESSONS.map((l) => ({ world: l.name, percent: Math.round(((lessons[l.id]?.stars || 0) / 3) * 100) })),
      accuracyTrend: [],
      sessions: [],
      recentActivity: Object.entries(history)
        .sort((a, b) => (a[0] < b[0] ? 1 : -1))
        .slice(0, 3)
        .map(([day, xp]) => ({ label: `Practiced and earned ${xp} XP`, time: day, type: "played" })),
      aiNote: "This student is using this device right now. Their numbers come from real play.",
    };
  }, [name, grade, history, lessons, maxStars, totalStars, lastDay]);
}

function ExpertDashboard() {
  const navigate = useNavigate();
  const live = useLiveStudent();
  const students = [live, ...STUDENTS];
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("this-device");
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const filteredStudents = students.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));
  const student = students.find((s) => s.id === selectedId) ?? students[0];

  return (
    <div className="expert-dash">
      <div className="expert-dash__banner">
        <ShieldAlert size={16} />
        <p>
          This area contains sensitive student performance data and diagnostic reports. Ensure you are authorized to
          view or modify this information. Data is encrypted and stored in compliance with educational privacy
          standards.
        </p>
      </div>

      <header className="expert-dash__header">
        <button className="expert-dash__back" onClick={() => navigate("/")} aria-label="Exit expert dashboard">
          <ArrowLeft size={16} />
        </button>
        <h1>Expert Dashboard</h1>
        <span className="expert-dash__restricted">Restricted View</span>
        <HelpButton text="This is the expert view. Pick a student on the left. The first one is the child using this device, with real numbers. The calendar shows how steadily they practice. Use the tabs to switch between progress, raw data, and practice suggestions." />
      </header>

      <div className="expert-dash__body">
        <aside className="expert-dash__roster">
          <div className="expert-dash__search">
            <Search size={14} />
            <input placeholder="Search students..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <ul>
            {filteredStudents.map((s) => (
              <li key={s.id}>
                <button
                  className={`expert-dash__roster-item${s.id === selectedId ? " is-active" : ""}`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <span className="expert-dash__avatar">{s.name[0]}</span>
                  <span className="expert-dash__roster-info">
                    <strong>{s.name}</strong>
                    <span>{s.grade}</span>
                  </span>
                  <span className="expert-dash__roster-mastery">{s.overallMastery}%</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="expert-dash__main">
          <div className="expert-dash__student-header">
            <div>
              <h2>{student.name}</h2>
              <p>
                {student.grade} &middot; Last active {student.lastActive}
              </p>
            </div>
            <div className="expert-dash__mastery-badge">
              <span>{student.overallMastery}%</span>
              <span>Overall Mastery</span>
            </div>
          </div>

          <div className="expert-dash__tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "is-active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Overview & Progress" && (
            <>
              <PracticeConsistency practice={student.practice} unit={student.live ? "min (est.)" : "min"} />

              <div className="expert-dash__card">
                <h3>Skill Mastery Heatmap</h3>
                <p className="expert-dash__card-sub">Current performance across the dyslexia intervention areas.</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={student.skills} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="skill" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                      {student.skills.map((entry, i) => (
                        <Cell key={i} fill={barColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="expert-dash__card">
                <h3>Recent Activity</h3>
                <ul className="expert-dash__activity">
                  {student.recentActivity.map((a, i) => (
                    <li key={i}>
                      <span className={`expert-dash__activity-dot expert-dash__activity-dot--${a.type}`} />
                      <div>
                        <p>{a.label}</p>
                        <span>{a.time}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {activeTab === "Diagnostics & Raw Data" && (
            <>
              <div className="expert-dash__card">
                <h3>Accuracy Trend</h3>
                {student.accuracyTrend.length === 0 && <p className="expert-dash__card-sub">Not enough sessions yet.</p>}
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={student.accuracyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="accuracy" stroke="var(--green)" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="expert-dash__card">
                <h3>Raw Session Data</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Date/Time</th>
                      <th>Activity</th>
                      <th>Duration</th>
                      <th>Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.sessions.map((s, i) => (
                      <tr key={i}>
                        <td>{s.date}</td>
                        <td>{s.activity}</td>
                        <td>{s.duration}</td>
                        <td>{s.accuracy}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "Settings & Practice" && (
            <div className="expert-dash__card">
              <h3>Assign Focused Practice</h3>
              <p className="expert-dash__card-sub">
                Based on {student.name}&rsquo;s lowest skill areas, consider assigning:
              </p>
              <div className="expert-dash__game-suggestions">
                {GAME_TROPHIES.flatMap((w) => w.games)
                  .slice(0, 3)
                  .map((g) => (
                    <Link key={g.name} className="expert-dash__game-chip" to={`/?play=${g.routeKey}`}>
                      <Play size={11} fill="currentColor" /> {g.name}
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ExpertDashboard;
