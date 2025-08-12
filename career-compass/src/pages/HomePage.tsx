import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import Container from "../components/Container";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <Hero
        title="Discover Your Future Career Path"
        subtitle="Career Compass helps you explore professions, understand roles, and find the best opportunities tailored for you."
        bgClassName="bg-gray-100"
      />

      {/* How it works */}
      <section className="relative overflow-hidden bg-white">
        <Container>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
            <p className="mt-2 text-gray-600">
              Four simple steps to go from curious to confident.
            </p>
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
        </Container>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-14">
        <Container>
          <h2 className="text-3xl font-bold text-center mb-10">What our users say</h2>
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-sm">
              <p className="text-gray-700 mb-3">
                “Career Compass showed me roles I had never heard of before. It changed my life.”
              </p>
              <p className="text-sm text-gray-500">— Jamie L., Data Analyst</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-sm">
              <p className="text-gray-700 mb-3">
                “I landed a mentorship through this platform that got me into UX research!”
              </p>
              <p className="text-sm text-gray-500">— Chris M., UX Researcher</p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
