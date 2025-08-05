import { Link } from "react-router-dom";
import './SharedStyles.css';

export default function HomePage() {
  return (
    <>
      <div className="hero">
        <h1>Discover Your Future Career Path</h1>
        <p>
          Career Compass helps you explore professions, understand roles, and find the best opportunities tailored for you.
        </p>

        <div className="button-group">
          <Link to="/explore" className="cta-button">
            Start Exploring
          </Link>

          <Link to="/shadow" className="cta-button secondary">
            Book a Shadowing Session
          </Link>
        </div>
      </div>

      <div className="featured-section">
        <h2 className="section-title">What our users say</h2>
        <div className="cards">
          <div className="card">
            <p className="testimonial-text">
              “Career Compass showed me roles I had never heard of before. It changed my life.”
            </p>
            <p className="testimonial-author">— Jamie L., Data Analyst</p>
          </div>
          <div className="card">
            <p className="testimonial-text">
              “I landed a mentorship through this platform that got me into UX research!”
            </p>
            <p className="testimonial-author">— Chris M., UX Researcher</p>
          </div>
        </div>
      </div>
    </>
  );
}