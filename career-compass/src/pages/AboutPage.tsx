export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Hero section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">About Career Compass</h1>
        <p className="text-gray-600 text-lg">
          Career Compass is your personalized guide to discovering meaningful career paths.
          Whether you're a student exploring options or a career changer looking for clarity,
          our platform helps you:
        </p>
        <ul className="mt-6 text-left space-y-3">
          <li className="flex items-start">
            <span className="mr-2">📚</span>
            <span><strong>Explore</strong> professions and roles across industries</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">👥</span>
            <span><strong>Shadow</strong> real professionals to gain first-hand experience</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🔗</span>
            <span><strong>Connect</strong> with mentors and tailored opportunities</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">📌</span>
            <span><strong>Track</strong> your journey with bookmarks and upcoming sessions</span>
          </li>
        </ul>
      </div>

      {/* Mission and Features */}
      <div className="space-y-10">
        <section>
          <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
          <p className="text-gray-700">
            We aim to bridge the gap between curiosity and career confidence. By combining career
            exploration with real-world experiences, we help you make informed, empowered decisions
            about your future.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">What Makes Us Different</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>🔍 Curated content for every role</li>
            <li>🤝 Mentorship through shadowing sessions</li>
            <li>🎯 User personalization for focused exploration</li>
            <li>📌 Easy tracking of saved roles and opportunities</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Meet the Team</h2>
          <p className="text-gray-700">
            Career Compass is built by a passionate group of educators, designers, and technologists
            who believe career discovery should be accessible, engaging, and authentic.
          </p>
        </section>
      </div>
    </div>
  );
}