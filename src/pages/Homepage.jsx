// First slide in the kid app: logo splash + "Ready Begin" button that
// scrolls to Login. Also the only entry point to the adult-facing
// Clinical Overview / Expert Dashboard pages.
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import TopBar from "../components/TopBar";
import GuideBubble from "../components/GuideBubble";
import logo from "../assets/dyscover-logo.png";
import "./Homepage.css";

function Homepage({ onNext }) {
  return (
    <section className="page homepage">
      <TopBar label="DYSCOVER HOMEPAGE" />
      <div className="homepage__hero">
        <img className="homepage__logo" src={logo} alt="DysCover" />
        <button className="btn btn--primary" onClick={onNext}>
          <Play size={14} fill="currentColor" /> Ready Begin
        </button>
        {/* Only way to reach the parent/clinician/expert dashboards - they
            have no other link from inside the kid app */}
        <div className="homepage__adult-links">
          <span>For parents &amp; educators:</span>
          <Link to="/clinical">Clinical Overview</Link>
          <span aria-hidden="true">&middot;</span>
          <Link to="/expert">Expert Dashboard</Link>
        </div>
      </div>
      <GuideBubble
        fixedCharacter="sloth"
        message="Welcome to DysCover! Press Ready Begin to start your jungle adventure."
      />
      <div className="homepage__ground">
        <div className="homepage__tree homepage__tree--left" />
        <div className="homepage__tree homepage__tree--right" />
      </div>
    </section>
  );
}

export default Homepage;
