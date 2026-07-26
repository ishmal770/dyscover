import { Link, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { ArrowLeft, Users, Target, Clock, Award, Download } from "lucide-react";
import { STUDENTS, getAggregateMetrics, getAggregateAccuracyTrend, getAggregateSkillBreakdown } from "../data/mockData";
import "./ClinicalOverview.css";

function statusFor(mastery) {
  if (mastery >= 85) return { label: "Excellent", className: "excellent" };
  if (mastery >= 70) return { label: "On Track", className: "on-track" };
  return { label: "At Risk", className: "at-risk" };
}

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

function ClinicalOverview() {
  const navigate = useNavigate();
  const metrics = getAggregateMetrics();
  const accuracyTrend = getAggregateAccuracyTrend();
  const skillBreakdown = getAggregateSkillBreakdown();
  const recentActivity = STUDENTS.flatMap((s) => s.recentActivity.map((a) => ({ ...a, student: s.name }))).slice(0, 5);

  function handleExport() {
    const rows = [
      ["Student", "Grade", "Overall Mastery", "Status"],
      ...STUDENTS.map((s) => [s.name, s.grade, `${s.overallMastery}%`, statusFor(s.overallMastery).label]),
    ];
    downloadCsv("clinical-overview-export.csv", rows);
  }

  return (
    <div className="clinical">
      <header className="clinical__header">
        <button className="clinical__back" onClick={() => navigate("/")} aria-label="Exit clinical view">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1>Clinical Overview</h1>
          <p>Real-time performance metrics and student progress tracking.</p>
        </div>
        <button className="btn btn--outline" onClick={handleExport}>
          <Download size={14} /> Export Report
        </button>
      </header>

      <div className="clinical__metrics">
        <div className="clinical__metric-card">
          <Users size={18} />
          <span className="clinical__metric-value">{metrics.totalStudents.toLocaleString()}</span>
          <span className="clinical__metric-label">Total Students</span>
        </div>
        <div className="clinical__metric-card">
          <Target size={18} />
          <span className="clinical__metric-value">{metrics.avgAccuracy}%</span>
          <span className="clinical__metric-label">Avg Accuracy</span>
        </div>
        <div className="clinical__metric-card">
          <Clock size={18} />
          <span className="clinical__metric-value">{metrics.avgTimePerCase}</span>
          <span className="clinical__metric-label">Avg Time/Case</span>
        </div>
        <div className="clinical__metric-card">
          <Award size={18} />
          <span className="clinical__metric-value">{metrics.certifications}</span>
          <span className="clinical__metric-label">Certifications</span>
        </div>
      </div>

      <div className="clinical__charts">
        <div className="clinical__chart-card">
          <h2>Accuracy Over Time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={accuracyTrend}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--ink-soft)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--ink-soft)" domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="accuracy" stroke="var(--green)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="clinical__chart-card">
          <h2>Skill Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={skillBreakdown}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar dataKey="score" stroke="var(--green)" fill="var(--green)" fillOpacity={0.35} isAnimationActive={false} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="clinical__lower">
        <div className="clinical__activity-card">
          <h2>Recent Activity</h2>
          <ul>
            {recentActivity.map((a, i) => (
              <li key={i}>
                <span className={`clinical__activity-dot clinical__activity-dot--${a.type}`} />
                <div>
                  <p>{a.label}</p>
                  <span>
                    {a.student} &middot; {a.time}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="clinical__table-card">
          <h2>Student Progress</h2>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {STUDENTS.map((s) => {
                const status = statusFor(s.overallMastery);
                return (
                  <tr key={s.id}>
                    <td>
                      <Link to={`/clinical/${s.id}`} className="clinical__student-link">
                        {s.name}
                      </Link>
                    </td>
                    <td>
                      <div className="clinical__progress-bar">
                        <div className="clinical__progress-fill" style={{ width: `${s.overallMastery}%` }} />
                      </div>
                    </td>
                    <td>
                      <span className={`clinical__status clinical__status--${status.className}`}>{status.label}</span>
                    </td>
                    <td>{s.overallMastery}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ClinicalOverview;
