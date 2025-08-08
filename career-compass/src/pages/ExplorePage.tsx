import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import type { Opportunity } from "../types/types";
import Hero from "../components/Hero";

const FORMATS = ["In-person", "Virtual", "Hybrid"];
const DURATIONS = ["30 min", "60 min", "90 min", "Half-day", "Full-day"];
const DEPARTMENTS = ["General", "Engineering", "Design", "Product", "Marketing", "Sales"];

export default function ExplorePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [format, setFormat] = useState("");
  const [duration, setDuration] = useState("");
  const [department, setDepartment] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [scheduledIds, setScheduledIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const debouncedRef = useRef<number | null>(null);
  const lastReqId = useRef(0);

  // Fetch user + role + bookmarks + scheduled
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();
        setRole(profile?.role ?? null);

        const { data: bookmarks } = await supabase
          .from("bookmarks")
          .select("opportunity_id")
          .eq("user_id", user.id);
        if (bookmarks) setBookmarkedIds(bookmarks.map((b) => b.opportunity_id));

        const { data: sessions } = await supabase
          .from("shadow_sessions")
          .select("opportunity_id")
          .eq("user_id", user.id);
        if (sessions) {
          const dbScheduled = sessions.map((s) => s.opportunity_id);
          const localScheduled = JSON.parse(localStorage.getItem("scheduled") || "[]");
          setScheduledIds(Array.from(new Set([...dbScheduled, ...localScheduled])));
        }
      }
    })();
  }, []);

  // Debounced fetch when search/filters change
  useEffect(() => {
    if (debouncedRef.current) clearTimeout(debouncedRef.current);
    debouncedRef.current = window.setTimeout(() => {
      void fetchOpportunities(searchQuery.trim(), { format, duration, department });
    }, 250);
    return () => {
      if (debouncedRef.current) clearTimeout(debouncedRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, format, duration, department]);

  // Initial fetch
  useEffect(() => {
    void fetchOpportunities("", { format, duration, department });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOpportunities = async (
    q: string,
    filters: { format?: string; duration?: string; department?: string }
  ) => {
    setLoading(true);
    setErrorMsg(null);
    const reqId = ++lastReqId.current;

    let query = supabase
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false });

    if (q) {
      query = query.or(`title.ilike.%${q}%,location.ilike.%${q}%`);
    }
    if (filters.format) query = query.eq("format", filters.format);
    if (filters.duration) query = query.eq("duration", filters.duration);
    if (filters.department) query = query.eq("department", filters.department);

    const { data, error } = await query;

    if (reqId !== lastReqId.current) return;
    if (error) {
      setErrorMsg(error.message || "Failed to load opportunities");
      setOpportunities([]);
    } else {
      setOpportunities(data || []);
    }
    setLoading(false);
  };

  const handleBookmark = async (opportunityId: number) => {
    if (!user) return alert("You need to log in to bookmark.");
    if (bookmarkedIds.includes(opportunityId)) return alert("Already bookmarked.");

    const { error } = await supabase.from("bookmarks").insert([
      { user_id: user.id, opportunity_id: opportunityId },
    ]);
    if (error) alert("Could not bookmark. Try again.");
    else setBookmarkedIds((prev) => [...prev, opportunityId]);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Hero
        title="Explore Opportunities"
        subtitle="Find shadowing sessions by amazing mentors"
      >
        <div className="mx-auto max-w-7xl">
          {/* Top row: search + (host-only) create button */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <input
              type="text"
              placeholder="Search by title or location..."
              className="w-full sm:w-[520px] p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {role === "host" && (
              <Link
                to="/opportunities/new"
                className="inline-flex items-center justify-center rounded-md border border-blue-700 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
              >
                + Create Opportunity
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="p-3 border border-gray-300 rounded-md bg-white"
            >
              <option value="">All formats</option>
              {FORMATS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="p-3 border border-gray-300 rounded-md bg-white"
            >
              <option value="">All durations</option>
              {DURATIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="p-3 border border-gray-300 rounded-md bg-white"
            >
              <option value="">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </Hero>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 pb-14">
        {loading && <p className="text-center text-gray-500">Loading…</p>}
        {errorMsg && <p className="text-center text-red-600">{errorMsg}</p>}

        {!loading && !errorMsg && opportunities.length === 0 ? (
          <p className="text-center text-gray-500">No shadowing opportunities found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {opportunities.map((op) => {
              const daysAgo = Math.floor((Date.now() - new Date(op.created_at).getTime()) / (1000 * 60 * 60 * 24));
              const isBookmarked = bookmarkedIds.includes(op.id);
              const isScheduled = scheduledIds.includes(op.id);

              return (
                <div
                  key={op.id}
                  className="relative group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100 rounded-bl-full" />
                  <div>
                    <Link to={`/shadow/${op.id}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 transition group-hover:text-blue-700">
                        {op.title}
                      </h3>
                    </Link>

                    {op.mentor_name && (
                      <p className="text-sm text-gray-600 mb-1">
                        👤 {op.mentor_name}{op.mentor_title ? `, ${op.mentor_title}` : ""}
                      </p>
                    )}

                    <p className="text-gray-700 text-sm mb-3">
                      {op.description?.slice(0, 110)}
                      {op.description && op.description.length > 110 ? "..." : ""}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      {op.format && (
                        <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-1">{op.format}</span>
                      )}
                      {op.duration && (
                        <span className="rounded-full bg-green-100 text-green-700 px-2 py-1">{op.duration}</span>
                      )}
                      <span className="ml-auto">
                        🕓 Posted {daysAgo} day{daysAgo !== 1 ? "s" : ""} ago
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    <Link
                      to={`/shadow/${op.id}`}
                      className="w-full px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 transition"
                    >
                      View Details
                    </Link>

                    {user ? (
                      <>
                        <button
                          onClick={() => handleBookmark(op.id)}
                          disabled={isBookmarked}
                          className={`w-full px-4 py-2 rounded-md text-sm font-medium transition ${
                            isBookmarked
                              ? "bg-green-50 text-green-700 border border-green-300 cursor-not-allowed"
                              : "border border-blue-700 text-blue-700 hover:bg-blue-50"
                          }`}
                        >
                          {isBookmarked ? "✓ Bookmarked" : "Bookmark"}
                        </button>

                        {isScheduled ? (
                          <button
                            disabled
                            className="w-full px-4 py-2 rounded-md text-sm font-medium bg-green-50 text-green-700 border border-green-300"
                          >
                            ✓ Scheduled
                          </button>
                        ) : (
                          <Link
                            to={`/shadow/${op.id}`}
                            onClick={() => {
                              const current = JSON.parse(localStorage.getItem("scheduled") || "[]");
                              const updated = Array.from(new Set([...current, op.id]));
                              localStorage.setItem("scheduled", JSON.stringify(updated));
                            }}
                            className="w-full px-4 py-2 rounded-md text-sm font-medium border border-blue-700 text-blue-700 text-center hover:bg-blue-50 transition"
                          >
                            Shadow
                          </Link>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 text-center">Log in to bookmark or shadow</p>
                    )}
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
