import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Cell } from "recharts";
import { ArrowLeft, ShieldAlert, Search, Play, RefreshCw, Send, AlertTriangle } from "lucide-react";
import HelpButton from "../components/HelpButton";
import { invokeLearningFunction } from "../learningApi";
import "./ExpertDashboard.css";

const GAME_META = {
  parrotPairsGame: { title: "Parrot Pairs", skill: "Letter order" },
  syllableSafariGame: { title: "Syllable Safari", skill: "Syllables" },
  monkeyMixUpGame: { title: "Monkey Mix-Up", skill: "Vowel sounds" },
  cheetahChallengeGame: { title: "Cheetah Challenge", skill: "Reading speed" },
  lizardLookoutsGame: { title: "Lizard Lookouts", skill: "Letter recognition" },
  lionsLettersGame: { title: "Lion's Letters", skill: "Handwriting" },
};
const TABS = ["Overview & Progress", "Diagnostics & Raw Data", "Settings & Practice"];
const mastery = (student) => student.skills.length
  ? Math.round(student.skills.reduce((sum, item) => sum + Number(item.mastery_percent), 0) / student.skills.length)
  : 0;
const weekLabel = (date) => new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });

function ExpertDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [focus, setFocus] = useState("");
  const [saved, setSaved] = useState("");

  async function loadDashboard(studentId) {
    setBusy(true);
    setError("");
    try {
      const result = await invokeLearningFunction({ action: "expert_dashboard", ...(studentId ? { student_id: studentId } : {}) });
      setDashboard(result);
      setSelectedId(studentId || result.students?.[0]?.id || "");
    } catch (err) {
      setError(err.message || "Could not load assigned students.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  const students = dashboard?.students || [];
  const visibleStudents = students.filter((student) =>
    (student.full_name || "Student").toLowerCase().includes(query.toLowerCase())
  );
  const student = students.find((item) => item.id === selectedId) || students[0] || null;
  const currentPlan = student?.plans?.find((plan) => plan.plan_date === new Date().toISOString().slice(0, 10)) || student?.plans?.[0];
  const sortedSkills = useMemo(
    () => [...(student?.skills || [])].sort((a, b) => Number(a.skill_rating) - Number(b.skill_rating)),
    [student?.skills]
  );

  const accuracyTrend = useMemo(() => {
    if (!student) return [];
    const days = new Map();
    for (const session of student.sessions) {
      const key = new Date(session.created_at).toISOString().slice(0, 10);
      const entry = days.get(key) || { date: key, sum: 0, count: 0 };
      entry.sum += Number(session.accuracy);
      entry.count += 1;
      days.set(key, entry);
    }
    return [...days.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-14)
      .map((row) => ({ week: weekLabel(row.date), accuracy: Math.round(100 * row.sum / row.count) }));
  }, [student]);

  async function submitFeedback(event) {
    event.preventDefault();
    if (!student || !notes.trim()) return;
    setBusy(true);
    setError("");
    setSaved("");
    try {
      await invokeLearningFunction({
        action: "expert_feedback",
        student_id: student.id,
        notes: notes.trim(),
        focus_skill: focus || null,
      });
      setNotes("");
      setSaved("Saved. This focus skill now leads the student's daily plan for seven days.");
      await loadDashboard(student.id);
    } catch (err) {
      setError(err.message || "Could not save this expert note.");
      setBusy(false);
    }
  }

  return (
    <div className="expert-dash">
      <div className="expert-dash__banner">
        <ShieldAlert size={16} />
        <p>Student records are visible only to experts assigned to those students. Adaptive recommendations use recent game accuracy and skill ratings.</p>
      </div>
      <header className="expert-dash__header">
        <button className="expert-dash__back" onClick={() => navigate("/")} aria-label="Exit expert dashboard"><ArrowLeft size={16} /></button>
        <h1>Expert Dashboard</h1>
        <span className="expert-dash__restricted">ASSIGNED STUDENTS</span>
        <HelpButton text="Choose an assigned student to see their skill levels, recent game results, daily lesson plan, and any active focus from an expert." />
        <button className="expert-dash__refresh" onClick={() => loadDashboard(selectedId)} disabled={busy}><RefreshCw size={14} /> Refresh</button>
      </header>

      <div className="expert-dash__body">
        <aside className="expert-dash__roster">
          <div className="expert-dash__search"><Search size={14} /><input placeholder="Search students..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
          {busy && !dashboard && <p className="expert-dash__state">Loading assigned students…</p>}
          {dashboard && students.length === 0 && <p className="expert-dash__state">No students are assigned to this expert account yet.</p>}
          <ul>
            {visibleStudents.map((item) => (
              <li key={item.id}>
                <button className={"expert-dash__roster-item" + (item.id === student?.id ? " is-active" : "")} onClick={() => { setSelectedId(item.id); setSaved(""); }}>
                  <span className="expert-dash__avatar">{(item.full_name || "S")[0].toUpperCase()}</span>
                  <span className="expert-dash__roster-info"><strong>{item.full_name || "Student"}</strong><span>{item.grade_tier === "k2" ? "Grades K–2" : "Grades 3–5"} · World {item.current_world}</span></span>
                  <span className="expert-dash__roster-mastery">{mastery(item)}%</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="expert-dash__main">
          {error && <div className="expert-dash__error" role="alert"><AlertTriangle size={16} />{error}</div>}
          {student ? (
            <>
              <div className="expert-dash__student-header">
                <div><h2>{student.full_name || "Student"}</h2><p>{student.grade_tier === "k2" ? "Grades K–2" : "Grades 3–5"} · World {student.current_world} · {student.flagged_for_review ? "Needs review" : student.diagnostic_completed ? "Diagnostic complete" : "Diagnostic not complete"}</p></div>
                <div className="expert-dash__mastery-badge"><span>{mastery(student)}%</span><span>Average skill mastery</span></div>
              </div>

              <div className="expert-dash__tabs">
                {TABS.map((tab) => <button key={tab} className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}
              </div>

              {activeTab === "Overview & Progress" && (
                <>
                  <div className="expert-dash__card">
                    <h3>Adaptive Skill Mastery</h3>
                    <p className="expert-dash__card-sub">Ratings update from the placement diagnostic and completed game sessions.</p>
                    {sortedSkills.length ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={sortedSkills.map((row) => ({ ...row, name: GAME_META[row.game_type]?.skill || row.game_type }))} layout="vertical" margin={{ left: 18 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis type="category" dataKey="name" width={130} />
                          <Tooltip />
                          <Bar dataKey="mastery_percent" name="Mastery" radius={[0, 6, 6, 0]}>
                            {sortedSkills.map((row) => <Cell key={row.game_type} fill={row.needs_intervention ? "#e05555" : "var(--green)"} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <p>No skill ratings yet. The student needs to complete the placement diagnostic.</p>}
                  </div>
                  <div className="expert-dash__card">
                    <h3>Today’s Adaptive Lesson Plan</h3>
                    {currentPlan ? (
                      <>
                        <p className="expert-dash__card-sub">World {currentPlan.world} · {currentPlan.target_minutes} minutes · {currentPlan.status} · {(currentPlan.items || []).filter((item) => item.status === "completed").length}/{(currentPlan.items || []).length} activities done</p>
                        <ol className="expert-dash__plan">
                          {(currentPlan.items || []).map((item) => <li key={item.order + item.game_type} className={item.status === "completed" ? "is-complete" : ""}>
                            <span>{item.status === "completed" ? "✓" : item.order}</span><div><strong>{item.title}</strong><small>{item.reason}</small></div><b>{item.target_minutes} min</b>
                          </li>)}
                        </ol>
                      </>
                    ) : <p>No daily plan yet. The student receives one after completing placement.</p>}
                  </div>
                  <div className="expert-dash__card">
                    <h3>Recent Activity</h3>
                    {student.sessions.length ? <ul className="expert-dash__activity">
                      {student.sessions.slice(0, 6).map((session) => <li key={session.id}>
                        <span className={"expert-dash__activity-dot" + (Number(session.accuracy) < 0.5 ? " expert-dash__activity-dot--struggled" : "")} />
                        <div><p>{GAME_META[session.game_type]?.title || session.game_type}: {Math.round(Number(session.accuracy) * 100)}% accuracy</p><span>{new Date(session.created_at).toLocaleString()}</span></div>
                      </li>)}
                    </ul> : <p>No game sessions recorded yet.</p>}
                  </div>
                </>
              )}

              {activeTab === "Diagnostics & Raw Data" && (
                <>
                  <div className="expert-dash__card">
                    <h3>Accuracy Trend</h3>
                    {accuracyTrend.length ? <ResponsiveContainer width="100%" height={210}>
                      <LineChart data={accuracyTrend}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="week" /><YAxis domain={[0, 100]} /><Tooltip /><Line type="monotone" dataKey="accuracy" stroke="var(--green)" strokeWidth={3} /></LineChart>
                    </ResponsiveContainer> : <p>No sessions yet.</p>}
                  </div>
                  <div className="expert-dash__card">
                    <h3>Session History</h3>
                    {student.sessions.length ? <div className="expert-dash__table-wrap"><table><thead><tr><th>Date</th><th>Game</th><th>Accuracy</th><th>Time</th><th>Attempts</th><th>Error</th></tr></thead>
                      <tbody>{student.sessions.map((session) => <tr key={session.id}>
                        <td>{new Date(session.created_at).toLocaleString()}</td><td>{GAME_META[session.game_type]?.title || session.game_type}</td>
                        <td>{Math.round(Number(session.accuracy) * 100)}%</td><td>{Math.round(Number(session.completion_time_ms) / 1000)} sec</td>
                        <td>{session.attempt_count}</td><td>{session.error_type || "—"}</td>
                      </tr>)}</tbody></table></div> : <p>No sessions yet.</p>}
                  </div>
                  <div className="expert-dash__card">
                    <h3>Recurring Error Patterns</h3>
                    {(student.errors || []).length ? <div className="expert-dash__table-wrap"><table><thead><tr><th>Skill</th><th>Error pattern</th><th>Occurrences</th></tr></thead><tbody>
                      {student.errors.map((item) => <tr key={item.game_type + item.error_type}><td>{GAME_META[item.game_type]?.skill || item.game_type}</td><td>{item.error_type}</td><td>{item.occurrences}</td></tr>)}
                    </tbody></table></div> : <p>No recurring error patterns have been recorded.</p>}
                  </div>
                  <div className="expert-dash__card">
                    <h3>Skill Session Averages</h3>
                    {(student.summaries || []).length ? <div className="expert-dash__table-wrap"><table><thead><tr><th>Skill</th><th>Sessions</th><th>Average accuracy</th><th>Average time</th><th>Last played</th></tr></thead><tbody>
                      {student.summaries.map((item) => <tr key={item.game_type}><td>{GAME_META[item.game_type]?.skill || item.game_type}</td><td>{item.sessions}</td><td>{Math.round(Number(item.avg_accuracy) * 100)}%</td><td>{Math.round(Number(item.avg_time_ms) / 1000)} sec</td><td>{item.last_session_at ? new Date(item.last_session_at).toLocaleDateString() : "—"}</td></tr>)}
                    </tbody></table></div> : <p>Summary metrics will appear after recorded game sessions.</p>}
                  </div>
                </>
              )}

              {activeTab === "Settings & Practice" && (
                <>
                  <div className="expert-dash__card">
                    <h3>Adaptive Recommendations</h3>
                    <p className="expert-dash__card-sub">The weakest current skills are suggested first. Expert focus overrides the automatic rotation.</p>
                    <div className="expert-dash__game-suggestions">
                      {sortedSkills.slice(0, 3).map((skill) => <Link key={skill.game_type} className="expert-dash__game-chip" to={"/?play=" + skill.game_type}>
                        <Play size={11} fill="currentColor" /> {GAME_META[skill.game_type]?.title || skill.game_type} · {skill.mastery_percent}%
                      </Link>)}
                    </div>
                    <form className="expert-dash__feedback-form" onSubmit={submitFeedback}>
                      <label htmlFor="focus-skill">Prioritize a skill for the next 7 days</label>
                      <select id="focus-skill" value={focus} onChange={(event) => setFocus(event.target.value)}>
                        <option value="">Automatic plan only</option>
                        {Object.entries(GAME_META).map(([id, game]) => <option key={id} value={id}>{game.skill} · {game.title}</option>)}
                      </select>
                      <label htmlFor="expert-note">Expert note for this student</label>
                      <textarea id="expert-note" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} rows={4} required />
                      <button className="btn btn--primary" type="submit" disabled={busy || !notes.trim()}><Send size={14} /> Save expert feedback</button>
                      {saved && <p role="status" className="expert-dash__saved">{saved}</p>}
                    </form>
                  </div>
                  <div className="expert-dash__card">
                    <h3>Recent Expert Feedback</h3>
                    {(student.feedback || []).length ? (student.feedback || []).slice(0, 8).map((item) => <article className="expert-dash__note" key={item.id}>
                      <p>{item.notes}</p><small>{item.focus_skill ? "Focus: " + (GAME_META[item.focus_skill]?.skill || item.focus_skill) + " · " : ""}{new Date(item.created_at).toLocaleDateString()}</small>
                    </article>) : <p>No expert notes have been added yet.</p>}
                  </div>
                </>
              )}
            </>
          ) : !busy && !error ? <div className="expert-dash__card"><h2>No assigned students yet</h2><p>Ask the project administrator to set this account as a teacher, therapist, or parent and add a student assignment.</p></div> : null}
        </main>
      </div>
    </div>
  );
}

export default ExpertDashboard;

