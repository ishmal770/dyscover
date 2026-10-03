// First slide in the kid app: logo splash hosted by the sloth - tapping him
// starts the adventure (scrolls to Login). Also the only entry point to the
// adult-facing Clinical Overview / Expert Dashboard pages.
import { Link } from "react-router-dom";
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
        {/* No start button: the sloth is the way in. Tapping him begins the adventure. */}
        <GuideBubble
          fixedCharacter="sloth"
          centered
          onAdvance={onNext}
          advanceHint="Tap me to start!"
          instructions="Tap me to start your adventure. Tap the speaker to hear me again. Grown-ups can use the links at the bottom of the page."
          message="Welcome to DysCover! Tap me and I'll take you on a jungle adventure."
        />
        {/* Only way to reach the parent/clinician/expert dashboards - they
            have no other link from inside the kid app */}
        <div className="homepage__adult-links">
          <span>For parents &amp; educators:</span>
          <Link to="/clinical">Clinical Overview</Link>
          <span aria-hidden="true">&middot;</span>
          <Link to="/expert">Expert Dashboard</Link>
        </div>
      </div>
      <div className="homepage__ground">
        <div className="homepage__tree homepage__tree--left" />
        <div className="homepage__tree homepage__tree--right" />
      </div>
    </section>
  );
}

export default Homepage;
