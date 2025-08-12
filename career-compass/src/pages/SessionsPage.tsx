import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Hero from "../components/Hero";
import Container from "../components/Container";

export default function SessionsPage() {
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("shadow_sessions")
        .select(
          "id, opportunity_id, opportunities(id, title, date, description, format, duration, created_at)"
        )
        .eq("user_id", user.id);

      if (!error && data) setAllSessions(data);
      setLoading(false);
    })();
  }, []);

  const now = new Date();
  const upcoming = allSessions
    .filter((s) => s.opportunities?.date && new Date(s.opportunities.date) >= now)
    .sort(
      (a, b) =>
        new Date(a.opportunities.date).getTime() -
        new Date(b.opportunities.date).getTime()
    );

  const past = allSessions
    .filter((s) => s.opportunities?.date && new Date(s.opportunities.date) < now)
    .sort(
      (a, b) =>
        new Date(b.opportunities.date).getTime() -
        new Date(a.opportunities.date).getTime()
    );

  const list = tab === "upcoming" ? upcoming : past;

  const handleCancel = async (sessionId: number) => {
    if (!confirm("Cancel this session?")) return;
    const { error } = await supabase.from("shadow_sessions").delete().eq("id", sessionId);
    if (!error) setAllSessions((prev) => prev.filter((s) => s.id !== sessionId));
    else alert("Failed to cancel session.");
  };

  const handleReschedule = (oppId?: number) => {
    if (!oppId) return;
    alert("Reschedule logic goes here for opportunity ID: " + oppId);
  };

  if (loading) {
    return (
      <>
        <Hero
          title="My Sessions"
          subtitle="Track and manage your shadowing sessions"
          bgClassName="bg-gray-100"
        />
        <section className="relative overflow-hidden bg-white">
          <Container>
            <p className="text-center text-gray-600">Loading…</p>
          </Container>
        </section>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Hero
          title="My Sessions"
          subtitle="Track and manage your shadowing sessions"
          bgClassName="bg-gray-100"
        />
        <section className="bg-gray-50 min-h-screen">
          <Container className="pb-14"></Container>
          <Container>
            <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <p className="text-gray-700 mb-4">
                Please log in to view and manage your sessions.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-md border border-blue-700 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
              >
                Log In
              </Link>
            </div>
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Hero (matches Home) */}
      <Hero
        title="My Sessions"
        subtitle="Track and manage your shadowing sessions"
        bgClassName="bg-gray-100"
      />

      {/* Section (matches Home’s “How it works” section structure) */}
      <section className="relative overflow-hidden bg-white">
        <Container>
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              {tab === "upcoming" ? "Your Upcoming Sessions" : "Your Past Sessions"}
            </h2>
            <p className="mt-2 text-gray-600">
              {tab === "upcoming"
                ? "See what’s coming up and manage your plans."
                : "Look back at what you’ve completed."}
            </p>

            {/* Tabs styled simply above the grid */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setTab("upcoming")}
                className={`px-4 py-2 rounded-md text-sm font-medium border transition ${
                  tab === "upcoming"
                    ? "border-blue-700 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setTab("past")}
                className={`px-4 py-2 rounded-md text-sm font-medium border transition ${
                  tab === "past"
                    ? "border-blue-700 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Past
              </button>
            </div>
          </div>

          {/* Grid of Home-style cards */}
          {list.length === 0 ? (
            <p className="text-center text-gray-600">
              {tab === "upcoming" ? "No upcoming sessions." : "No past sessions."}
            </p>
          ) : (
            <ol className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
              {list.map((s, i) => {
                const opp = s.opportunities;
                const dateObj = opp?.date ? new Date(opp.date) : null;
                const daysAgo = opp?.created_at
                  ? Math.floor(
                      (Date.now() - new Date(opp.created_at).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0;

                return (
                  <li
                    key={s.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-600 text-blue-700 font-semibold">
                          {i + 1}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition">
                          {opp?.title || "Session"}
                        </h3>
                      </div>

                      {opp?.description && (
                        <p className="text-sm text-gray-600">
                          {opp.description.slice(0, 110)}
                          {opp.description.length > 110 ? "..." : ""}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        {opp?.format && (
                          <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-1">
                            {opp.format}
                          </span>
                        )}
                        {opp?.duration && (
                          <span className="rounded-full bg-green-100 text-green-700 px-2 py-1">
                            {opp.duration}
                          </span>
                        )}
                        {opp?.created_at && (
                          <span className="ml-auto">
                            🕓 {daysAgo} day{daysAgo !== 1 ? "s" : ""} ago
                          </span>
                        )}
                      </div>

                      {dateObj && (
                        <p className="text-sm text-gray-600 mt-2">
                          📅 {dateObj.toLocaleDateString()} @{" "}
                          {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                      {opp?.id ? (
                        <Link
                          to={`/shadow/${opp.id}`}
                          className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          View Details
                        </Link>
                      ) : (
                        <span className="inline-flex w-full items-center justify-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed">
                          View Details
                        </span>
                      )}

                      {tab === "upcoming" ? (
                        <>
                          <button
                            onClick={() => handleCancel(s.id)}
                            className="inline-flex w-full items-center justify-center rounded-md border border-red-600 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReschedule(opp?.id)}
                            className="inline-flex w-full items-center justify-center rounded-md border border-yellow-500 px-3 py-2 text-sm font-medium text-yellow-600 hover:bg-yellow-50 transition"
                          >
                            Reschedule
                          </button>
                        </>
                      ) : null}
                    </div>

                    {/* subtle hover accent (same as Home) */}
                    <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100 rounded-bl-full" />
                  </li>
                );
              })}
            </ol>
          )}
        </Container>
      </section>
    </>
  );
}
