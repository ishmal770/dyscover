// Three big buttons to pick the grade band. The band decides which set of 10
// questions every game uses (see data/questionBanks.js).
import { useProgress } from "../context/ProgressContext";
import { GRADE_BANDS } from "../data/questionBanks";
import "./GradePicker.css";

function GradePicker() {
  const { grade, setGrade } = useProgress();
  return (
    <div className="grade-picker" role="group" aria-label="My grade">
      {GRADE_BANDS.map((band) => (
        <button
          key={band.id}
          className={`grade-picker__btn${grade === band.id ? " is-active" : ""}`}
          onClick={() => setGrade(band.id)}
          aria-pressed={grade === band.id}
          data-help={`grade-${band.id}`}
        >
          <span className="grade-picker__label">Grades</span>
          <strong>{band.short}</strong>
        </button>
      ))}
    </div>
  );
}

export default GradePicker;
