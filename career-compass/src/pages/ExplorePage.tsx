import { useState } from "react";
import { Link } from "react-router-dom";
import { defaultData } from "../data/defaultData";
import './SharedStyles.css';

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Only show professions that start with the typed letter (case-insensitive)
  const filteredProfessions = defaultData.professions.filter((profession) =>
    profession.name.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  return (
    <div className="page">
      <div className="hero">
        <h1>Explore Professions & Roles</h1>
        <p>Browse through a wide range of professions and roles to find your best fit.</p>
      </div>

      {/* 🔍 Search Bar */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search professions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="featured-section">
        <h2 className="section-title">Popular Professions</h2>
        <div className="cards">
          {filteredProfessions.map((profession) => (
            <Link key={profession.id} to={`/explore/profession/${profession.id}`} className="card">
              <h3>{profession.name}</h3>
              <p>{profession.description}</p>
            </Link>
          ))}
          {filteredProfessions.length === 0 && <p>No professions found.</p>}
        </div>
      </div>
    </div>
  );
}