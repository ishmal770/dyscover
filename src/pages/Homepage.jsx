import { Play } from "lucide-react";
import TopBar from "../components/TopBar";
import SlothMascot from "../components/SlothMascot";
import "./Homepage.css";

function Homepage({ onNext }) {
  return (
    <section className="page homepage">
      <TopBar label="DYSCOVER HOMEPAGE" />
      <div className="homepage__hero">
        <div className="homepage__wordmark">
          <span className="homepage__word homepage__word--dys">Dys</span>
          <span className="homepage__word homepage__word--cover">Cover</span>
          <SlothMascot className="homepage__sloth" />
        </div>
        <button className="btn btn--primary" onClick={onNext}>
          <Play size={14} fill="currentColor" /> Ready Begin
        </button>
      </div>
      <div className="homepage__ground">
        <div className="homepage__tree homepage__tree--left" />
        <div className="homepage__tree homepage__tree--right" />
      </div>
    </section>
  );
}

export default Homepage;
