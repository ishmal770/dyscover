import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import TopBar from "../components/TopBar";
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
