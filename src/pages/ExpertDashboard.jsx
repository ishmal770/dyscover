import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line } from "recharts";
import { ArrowLeft, ShieldAlert, Search, Play } from "lucide-react";
import { STUDENTS, GAME_TROPHIES } from "../data/mockData";
import "./ExpertDashboard.css";

const TABS = ["Overview & Progress", "Diagnostics & Raw Data", "Settings & Practice"];

function barColor(score) {
  if (score >= 70) return "var(--green)";
  if (score >= 50) return "var(--amber)";
  return "#e05555";
}

function ExpertDashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(STUDENTS[0].id);
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const filteredStudents = STUDENTS.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));
  const student = STUDENTS.find((s) => s.id === selectedId) ?? STUDENTS[0];

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
