import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import type { Opportunity } from "../types/types";
import Hero from "../components/Hero";
import Container from "../components/Container";

const FORMATS = ["In-person", "Virtual", "Hybrid"];
const DURATIONS = ["30 min", "60 min", "90 min", "Half-day", "Full-day"];

export default function ExplorePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [format, setFormat] = useState("");
  const [duration, setDuration] = useState("");
  const [profession, setProfession] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [scheduledIds, setScheduledIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const debouncedRef = useRef<number | null>(null);
  const lastReqId = useRef(0);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: bookmarks } = await supabase
          .from("bookmarks")
          .select("opportunity_id")
          .eq("user_id", user.id);

        if (bookmarks) {
          setBookmarkedIds(bookmarks.map((b: any) => b.opportunity_id));
        }

        const { data: sessions } = await supabase
          .from("shadow_sessions")
          .select("opportunity_id")
          .eq("user_id", user.id);

        if (sessions) {
          const dbScheduled = sessions.map((s: any) => s.opportunity_id);
          setScheduledIds(Array.from(new Set(dbScheduled)));
        }
      } else {
        setBookmarkedIds([]);
        setScheduledIds([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (debouncedRef.current) clearTimeout(debouncedRef.current);
    debouncedRef.current = window.setTimeout(() => {
      void fetchOpportunities(searchQuery.trim(), { format, duration });
    }, 250);
    return () => {
      if (debouncedRef.current) clearTimeout(debouncedRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, format, duration]);

  useEffect(() => {
    void fetchOpportunities("", { format, duration });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOpportunities = async (
    q: string,
    filters: { format?: string; duration?: string
    }
  ) => {
    setLoading(true);
    setErrorMsg(null);
    const reqId = ++lastReqId.current;

    let query = supabase
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false });

    if (q) query = query.or(`title.ilike.%${q}%,location.ilike.%${q}%`);
    if (filters.format) query = query.eq("format", filters.format);
    if (filters.duration) query = query.eq("duration", filters.duration);

    const { data, error } = await query;

    if (reqId !== lastReqId.current) return;
    if (error) {
      setErrorMsg(error.message || "Failed to load opportunities");
      setOpportunities([]);
    } else {
      setOpportunities((data as Opportunity[]) || []);
    }
    setLoading(false);
  };

  const handleBookmark = async (opportunityId: number) => {
    if (!user) {
      alert("You need to log in to bookmark.");
      return;
    }
    if (bookmarkedIds.includes(opportunityId)) {
      alert("Already bookmarked.");
      return;
    }

    const { error } = await supabase.from("bookmarks").insert([
      { user_id: user.id, opportunity_id: opportunityId },
    ]);

    if (error) {
      alert("Could not bookmark. Try again.");
    } else {
      setBookmarkedIds((prev) => [...prev, opportunityId]);
    }
  };

  return (
    <div className="bg-gray-50">
      <Hero
        title="Explore Opportunities"
        subtitle="Find shadowing sessions by amazing mentors"
        bgClassName="bg-gray-100"
      >
        {/* Search */}
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search by title or location..."
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="p-3 border border-gray-300 rounded-md bg-white"
          >
            <option value="">All formats</option>
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="p-3 border border-gray-300 rounded-md bg-white"
          >
            <option value="">All durations</option>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </Hero>

      {/* Results */}
      <Container className="pb-14">
        {loading && <p className="text-center text-gray-500">Loading…</p>}
        {errorMsg && <p className="text-center text-red-600">{errorMsg}</p>}

        {!loading && !errorMsg && opportunities.length === 0 ? (
          <p className="text-center text-gray-500">No shadowing opportunities found.</p>
        ) : (
          <ol className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {opportunities.map((op, i) => {
              const daysAgo = Math.floor(
                (Date.now() - new Date(op.created_at).getTime()) / (1000 * 60 * 60 * 24)
              );
              const isBookmarked = bookmarkedIds.includes(op.id);
              const isScheduled = scheduledIds.includes(op.id);

              return (
                <li
                  key={op.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-600 text-blue-700 font-semibold">
                        {i + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition">
                        {op.title}
                      </h3>
                    </div>

                    {op.mentor_name && (
                      <p className="text-sm text-gray-600 mb-1">
                        👤 {op.mentor_name}
                        {op.mentor_title ? `, ${op.mentor_title}` : ""}
                      </p>
                    )}

                    <p className="text-sm text-gray-600 mb-3">
                      {op.description?.slice(0, 110)}
                      {op.description && op.description.length > 110 ? "..." : ""}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      {op.format && (
                        <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-1">
                          {op.format}
                        </span>
                      )}
                      {op.duration && (
                        <span className="rounded-full bg-green-100 text-green-700 px-2 py-1">
                          {op.duration}
                        </span>
                      )}
                      <span className="ml-auto">
                        🕓 {daysAgo} day{daysAgo !== 1 ? "s" : ""} ago
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    <Link
                      to={`/shadow/${op.id}`}
                      className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      View Details
                    </Link>

                    {user ? (
                      <>
                        <button
                          onClick={() => handleBookmark(op.id)}
                          disabled={isBookmarked}
                          className={`inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition ${
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
                            className="inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-green-50 text-green-700 border border-green-300"
                          >
                            ✓ Scheduled
                          </button>
                        ) : (
                          <Link
                            to={`/shadow/${op.id}`}
                            className="inline-flex w-full items-center justify-center rounded-md border border-blue-700 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
                          >
                            Shadow
                          </Link>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 text-center">
                        Log in to bookmark or shadow
                      </p>
                    )}
                  </div>

                  {/* Subtle hover accent */}
                  <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100 rounded-bl-full" />
                </li>
              );
            })}
          </ol>
        )}
      </Container>
    </div>
  );
}
