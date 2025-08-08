import { Link } from "react-router-dom";
import "./SharedStyles.css";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <div className="hero">
        <h1>Discover Your Future Career Path</h1>
        <p>
          Career Compass helps you explore professions, understand roles, and find the best opportunities tailored for you.
        </p>
      </div>

      {/* How it works */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />
        <div className="relative mx-auto max-w-6xl px-4 py-14">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
            <p className="mt-2 text-gray-600">Four simple steps to go from curious to confident.</p>
          </div>

          <ol className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Explore opportunities",
                desc: "Browse roles and mentors. Filter by location, format, and interests.",
                to: "/explore",
                label: "Explore",
              },
              {
                title: "Bookmark favorites",
                desc: "Save opportunities to compare and revisit later.",
                to: "/bookmarks",
                label: "View bookmarks",
              },
              {
                title: "Schedule a shadow",
                desc: "Pick a time that works and confirm with the host.",
                to: "/shadow",
                label: "Find a session",
              },
              {
                title: "Track & learn",
                desc: "See upcoming sessions and saved items in your dashboard.",
                to: "/profile",
                label: "Go to dashboard",
              },
            ].map((s, i) => (
              <li
                key={s.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-600 text-blue-700 font-semibold">
                      {i + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition">
                      {s.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600">{s.desc}</p>
                </div>

                <div className="mt-6">
                  <Link
                    to={s.to}
                    className="inline-flex w-full items-center justify-center rounded-md border border-blue-700 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                  >
                    {s.label}
                  </Link>
                </div>

                {/* subtle hover accent */}
                <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100 rounded-bl-full" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Testimonials */}
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