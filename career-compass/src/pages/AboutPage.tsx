import './SharedStyles.css';

export default function AboutPage() {
  return (
    <div className="page">
      <div className="hero">
        <h1>About Career Compass</h1>
        <p>
          Career Compass is your personalized guide to discovering meaningful career paths.
          Whether you're a student exploring options or a career changer looking for clarity,
          our platform helps you:
        </p>
        <ul className="about-list">
          <li>📚 <strong>Explore</strong> professions and roles across industries</li>
          <li>👥 <strong>Shadow</strong> real professionals to gain first-hand experience</li>
          <li>🔗 <strong>Connect</strong> with mentors and tailored opportunities</li>
          <li>📌 <strong>Track</strong> your journey with bookmarks and upcoming sessions</li>
        </ul>
      </div>

      <div className="featured-section">
        <h2>Our Mission</h2>
        <p>
          We aim to bridge the gap between curiosity and career confidence. By combining career
          exploration with real-world experiences, we help you make informed, empowered decisions
          about your future.
        </p>

        <h2>What Makes Us Different</h2>
        <ul className="about-list">
          <li>🔍 Curated content for every role</li>
          <li>🤝 Mentorship through shadowing sessions</li>
          <li>🎯 User personalization for focused exploration</li>
          <li>📌 Easy tracking of saved roles and opportunities</li>
        </ul>

        <h2>Meet the Team</h2>
        <p>
          Career Compass is built by a passionate group of educators, designers, and technologists
          who believe career discovery should be accessible, engaging, and authentic.
        </p>
      </div>
    </div>
  );
}