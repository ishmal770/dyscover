// Three big buttons to say which grades you are in. This is only where the
// placement mission starts; the mission then finds the real level.
import { useProgress } from "../context/ProgressContext";
import { GRADE_BANDS } from "../data/questionBanks";
import "./GradePicker.css";

function GradePicker() {
  const { grade, chooseGrade, placed } = useProgress();
  return (
    <div className="grade-picker" role="group" aria-label="My grade">
      {GRADE_BANDS.map((band) => (
        <button
          key={band.id}
          className={`grade-picker__btn${grade === band.id ? " is-active" : ""}`}
          onClick={() => chooseGrade(band.id)}
          disabled={placed}
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
