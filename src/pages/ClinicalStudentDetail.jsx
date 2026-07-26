import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { ArrowLeft, FileDown, MessageSquare, ListChecks, Sparkles, Download } from "lucide-react";
import { STUDENTS } from "../data/mockData";
import "./ClinicalStudentDetail.css";

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ClinicalStudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const student = STUDENTS.find((s) => s.id === studentId);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [messageNotice, setMessageNotice] = useState("");
  const [exportMode, setExportMode] = useState(false);

  if (!student) {
    return (
      <div className="clinical-detail">
        <p>Student not found.</p>
        <Link to="/clinical">Back to Clinical Overview</Link>
      </div>
    );
  }

  function handleDownloadLogs() {
    const rows = [
      ["Date/Time", "Activity", "Duration", "Accuracy", "Clinical Observation"],
      ...student.sessions.map((s) => [s.date, s.activity, s.duration, `${s.accuracy}%`, s.observation]),
    ];
    downloadCsv(`${student.name.replace(/\s+/g, "-").toLowerCase()}-sessions.csv`, rows);
  }

  return (
    <div className="clinical-detail">
      <header className="clinical-detail__header">
        <button className="clinical-detail__back" onClick={() => navigate("/clinical")} aria-label="Back">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1>Clinical Overview</h1>
          <p>
            Expert analysis for <strong>{student.name}</strong> &middot; Last active {student.lastActive}
          </p>
        </div>
        <button className="btn btn--outline" onClick={() => window.print()}>
          <FileDown size={14} /> Export Clinical PDF
        </button>
      </header>

      <div className="clinical-detail__grid">
        <main className="clinical-detail__main">
          <div className="clinical-detail__card">
            <h2>Neuro-Cognitive Profile</h2>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={student.skills}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar dataKey="score" stroke="var(--green)" fill="var(--green)" fillOpacity={0.35} isAnimationActive={false} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="clinical-detail__card">
            <h2>Curriculum Progress</h2>
            <div className="clinical-detail__progress-list">
              {student.curriculumProgress.map((c) => (
                <div key={c.world} className="clinical-detail__progress-row">
                  <span>{c.world}</span>
                  <div className="clinical-detail__progress-bar">
                    <div className="clinical-detail__progress-fill" style={{ width: `${c.percent}%` }} />
                  </div>
                  <span className="clinical-detail__progress-pct">{c.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="clinical-detail__card">
            <h2>Session Observations</h2>
            <textarea
              placeholder="Add a clinical note about today's progress..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button
              className="btn btn--primary"
              onClick={() => {
                setSavedNote(note);
                setNote("");
              }}
              disabled={!note.trim()}
            >
              Save Clinical Note
            </button>
            {savedNote && (
              <p className="clinical-detail__saved-note">
                <strong>Saved note:</strong> {savedNote}
              </p>
            )}
          </div>

          <div className="clinical-detail__card" id="session-logs">
            <div className="clinical-detail__logs-header">
              <h2>Granular Session Logs</h2>
              <label className="clinical-detail__export-toggle">
                <input type="checkbox" checked={exportMode} onChange={(e) => setExportMode(e.target.checked)} />
                Export Mode
              </label>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date/Time</th>
                  <th>Therapeutic Activity</th>
                  <th>Duration</th>
                  <th>Accuracy</th>
                  {exportMode && <th>Clinical Observation</th>}
                </tr>
              </thead>
              <tbody>
                {student.sessions.map((s, i) => (
                  <tr key={i}>
                    <td>{s.date}</td>
                    <td>{s.activity}</td>
                    <td>{s.duration}</td>
                    <td>{s.accuracy}%</td>
                    {exportMode && <td>{s.observation}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn--outline" onClick={handleDownloadLogs}>
              <Download size={14} /> Download Full Dataset (CSV)
            </button>
          </div>
        </main>

        <aside className="clinical-detail__sidebar">
          <div className="clinical-detail__card">
            <h2>Expert Actions</h2>
            <button className="btn btn--outline btn--block" onClick={() => window.print()}>
              <FileDown size={14} /> Export Clinical PDF
            </button>
            <button
              className="btn btn--outline btn--block"
              onClick={() => {
                setMessageNotice("Messaging isn't connected yet - this would notify the family in a full deployment.");
                setTimeout(() => setMessageNotice(""), 4000);
              }}
            >
              <MessageSquare size={14} /> Message Parents
            </button>
            <a className="btn btn--outline btn--block" href="#session-logs">
              <ListChecks size={14} /> View All Logs
            </a>
            {messageNotice && <p className="clinical-detail__notice">{messageNotice}</p>}
          </div>

          <div className="clinical-detail__ai-note">
            <Sparkles size={16} />
            <p>{student.aiNote}</p>
            <a href="#session-logs" className="btn btn--primary btn--block">
              Assign Practice
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ClinicalStudentDetail;
