import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Hero from "../components/Hero";

export default function SessionsPage() {
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) return;

      const { data, error } = await supabase
        .from("shadow_sessions")
        .select("id, opportunity_id, opportunities(id, title, date, description, format, duration, created_at)")
        .eq("user_id", user.id);

      if (!error && data) setAllSessions(data);
    })();
  }, []);

  const now = new Date();
  const upcoming = allSessions
    .filter((s) => s.opportunities?.date && new Date(s.opportunities.date) >= now)
    .sort((a, b) => new Date(a.opportunities.date).getTime() - new Date(b.opportunities.date).getTime());

  const past = allSessions
    .filter((s) => s.opportunities?.date && new Date(s.opportunities.date) < now)
    .sort((a, b) => new Date(b.opportunities.date).getTime() - new Date(a.opportunities.date).getTime());

  const list = tab === "upcoming" ? upcoming : past;

  const handleCancel = async (sessionId: number) => {
    if (!confirm("Cancel this session?")) return;
    const { error } = await supabase.from("shadow_sessions").delete().eq("id", sessionId);
    if (!error) {
      setAllSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } else {
      alert("Failed to cancel session.");
    }
  };

  const handleReschedule = (oppId: number) => {
    alert("Reschedule logic goes here for opportunity ID: " + oppId);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Hero
        title="My Sessions"
        subtitle="Track and manage your shadowing sessions"
      >
        {/* Tabs */}
        <div className="flex items-center justify-center gap-2">
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
      </Hero>

      <div className="mx-auto max-w-7xl px-4 pb-14">
        {list.length === 0 ? (
          <p className="text-center text-gray-600">
            {tab === "upcoming" ? "No upcoming sessions." : "No past sessions."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {list.map((s) => {
              const opp = s.opportunities;
              const dateObj = opp?.date ? new Date(opp.date) : null;
              const daysAgo = Math.floor((Date.now() - new Date(opp.created_at).getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={s.id}
                  className="relative group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100 rounded-bl-full" />
                  <div>
                    <Link to={`/shadow/${opp.id}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 transition group-hover:text-blue-700">
                        {opp.title}
                      </h3>
                    </Link>

                    {opp.description && (
                      <p className="text-gray-700 text-sm mb-3">
                        {opp.description.slice(0, 110)}
                        {opp.description.length > 110 ? "..." : ""}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      {opp.format && (
                        <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-1">{opp.format}</span>
                      )}
                      {opp.duration && (
                        <span className="rounded-full bg-green-100 text-green-700 px-2 py-1">{opp.duration}</span>
                      )}
                      <span className="ml-auto">
                        🕓 Posted {daysAgo} day{daysAgo !== 1 ? "s" : ""} ago
                      </span>
                    </div>

                    {dateObj && (
                      <p className="text-sm text-gray-600 mt-2">
                        📅 {dateObj.toLocaleDateString()} @{" "}
                        {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    <Link
                      to={`/shadow/${opp.id}`}
                      className="w-full px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 transition"
                    >
                      View Details
                    </Link>

                    {tab === "upcoming" ? (
                      <>
                        <button
                          onClick={() => handleCancel(s.id)}
                          className="w-full text-center border border-red-600 text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReschedule(opp.id)}
                          className="w-full text-center border border-yellow-500 text-yellow-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-50 transition"
                        >
                          Reschedule
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}