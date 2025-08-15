// src/pages/OpportunitiesPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Hero from "../components/Hero";
import Container from "../components/Container";
import Card from "../components/Card";

type Opportunity = {
  id: number;
  user_id: string;
  title: string | null;
  description: string | null;
  format: string | null;
  duration: string | null;
  date: string | null;        // ISO datetime
  created_at: string | null;
};

type Profile = {
  user_id: string;
  role?: "user" | "host" | null;
};

export default function OpportunitiesPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allOpps, setAllOpps] = useState<Opportunity[]>([]);
  const [tab, setTab] = useState<"all" | "upcoming" | "past">("all"); // default = All
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const navigate = useNavigate();

  // shared “button look” classes so <a> and <button> match exactly (copied from Profile page)
  const buttonLike =
    "flex-1 inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium border border-gray-300 bg-white text-center hover:bg-gray-50 transition";
  const viewBtn = `${buttonLike} text-gray-700`;
  const deleteBtn = `${buttonLike} text-red-600`;

  const isHost = profile?.role === "host";

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      // Get profile (for role)
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_id, role")
        .eq("user_id", user.id)
        .maybeSingle();

      const mergedProfile: Profile = {
        user_id: user.id,
        role: (prof?.role as any) ?? "user",
      };
      setProfile(mergedProfile);

      // Gate non-hosts
      if ((prof?.role ?? "user") !== "host") {
        setLoading(false);
        return;
      }

      // Fetch host's opportunities
      const { data: opps } = await supabase
        .from("opportunities")
        .select("id, user_id, title, description, format, duration, date, created_at")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      setAllOpps((opps as Opportunity[]) || []);
      setLoading(false);
    })();
  }, []);

  const now = new Date();
  const { upcoming, past } = useMemo(() => {
    const u: Opportunity[] = [];
    const p: Opportunity[] = [];
    for (const opp of allOpps) {
      if (!opp.date) {
        // No date → treat as upcoming/draft-like
        u.push(opp);
        continue;
      }
      (new Date(opp.date) >= now ? u : p).push(opp);
    }
    // sort upcoming asc by date (undefined last), past desc
    u.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
      const db = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;
      return da - db;
    });
    p.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });
    return { upcoming: u, past: p };
  }, [allOpps]);

  const list =
    tab === "all"
      ? [...upcoming, ...past].sort((a, b) => {
          const da = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
          const db = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;
          return da - db;
        })
      : tab === "upcoming"
      ? upcoming
      : past;

  // Delete cascade to match Profile page behavior:
  // 1) delete shadow_sessions for opp
  // 2) delete bookmarks for opp
  // 3) delete opportunity
  const handleDeleteOpportunity = async (id: number) => {
    if (!user) return;
    const ok = window.confirm(
      "Delete this opportunity? This will also remove all shadow sessions and bookmarks for it. This cannot be undone."
    );
    if (!ok) return;

    try {
      setDeletingId(id);

      const { error: ssErr } = await supabase
        .from("shadow_sessions")
        .delete()
        .eq("opportunity_id", id);
      if (ssErr) {
        alert("Failed to delete related shadow sessions: " + ssErr.message);
        return;
      }

      const { error: bmErr } = await supabase
        .from("bookmarks")
        .delete()
        .eq("opportunity_id", id);
      if (bmErr) {
        alert("Failed to delete related bookmarks: " + bmErr.message);
        return;
      }

      const { error: oppErr } = await supabase
        .from("opportunities")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id); // extra guard
      if (oppErr) {
        alert("Failed to delete opportunity: " + oppErr.message);
        return;
      }

      setAllOpps((prev) => prev.filter((o) => o.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <>
        <Hero
          title="My Opportunities"
          subtitle="Create, edit, and track your hosted shadowing opportunities"
          bgClassName="bg-gray-100"
        />
        <section className="relative overflow-hidden bg-white">
          <Container className="py-14">
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
          title="My Opportunities"
          subtitle="Create, edit, and track your hosted shadowing opportunities"
          bgClassName="bg-gray-100"
        />
        <section className="relative overflow-hidden bg-white">
          <Container className="py-14">
            <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <p className="text-gray-700 mb-4">
                Please log in to view and manage your opportunities.
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

  if (!isHost) {
    return (
      <>
        <Hero
          title="My Opportunities"
          subtitle="Hosts can view and manage their posted opportunities here"
          bgClassName="bg-gray-100"
        />
        <section className="relative overflow-hidden bg-white">
          <Container className="py-14">
            <div className="mx-auto max-w-md rounded-2xl border border-amber-300 bg-amber-50 p-6 text-center shadow-sm">
              <p className="text-gray-700">
                This page is for hosts only. Switch your profile to host to post and manage opportunities.
              </p>
            </div>
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      <Hero
        title="My Opportunities"
        subtitle="Create, edit, and track your hosted shadowing opportunities"
        bgClassName="bg-gray-100"
      />

      <section className="relative overflow-hidden bg-white">
        <Container className="py-14">
          {/* Tabs + New button (kept consistent with your pattern) */}
          <div className="mb-6 flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold text-gray-900">
                {tab === "all"
                  ? "All Opportunities"
                  : tab === "upcoming"
                  ? "Upcoming Opportunities"
                  : "Past Opportunities"}
              </h2>
              <p className="mt-1 text-gray-600">
                {tab === "all"
                  ? "Browse everything you've posted."
                  : tab === "upcoming"
                  ? "See what’s scheduled next and fine-tune details."
                  : "Review completed opportunities and their engagement."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTab("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium border transition ${
                  tab === "all"
                    ? "border-blue-700 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                All
              </button>
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

              <Link
                to="/post-opportunity"
                className="ml-2 inline-flex items-center justify-center rounded-md border border-blue-700 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
              >
                + Post Opportunity
              </Link>
            </div>
          </div>

          {/* Cards EXACTLY like Profile page’s “My Opportunities” */}
          {list.length === 0 ? (
            <Card><p className="text-gray-600 text-center">No opportunities to show.</p></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((op) => {
                const daysAgo = op.created_at
                  ? Math.floor((Date.now() - new Date(op.created_at).getTime()) / (1000 * 60 * 60 * 24))
                  : 0;
                const dateObj = op.date ? new Date(op.date) : null;
                const isDeleting = deletingId === op.id;

                return (
                  <Card key={op.id}>
                    <div className="flex h-full flex-col">
                      {/* Top content */}
                      <div>
                        <Link to={`/shadow/${op.id}`}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 transition group-hover:text-blue-700">
                            {op.title || "Untitled Opportunity"}
                          </h3>
                        </Link>

                        {op.description && (
                          <p className="text-gray-700 text-sm">
                            {op.description.slice(0, 160)}
                            {op.description.length > 160 ? "..." : ""}
                          </p>
                        )}
                      </div>

                      {/* Footer pinned */}
                      <div className="mt-auto pt-4">
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
                            🕓 Posted {daysAgo} day{daysAgo !== 1 ? "s" : ""} ago
                          </span>
                        </div>

                        {dateObj && (
                          <p className="text-sm text-gray-600 mt-2">
                            📅 {dateObj.toLocaleDateString()} @{" "}
                            {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}

                        <div className="mt-3 flex gap-2">
                          <Link to={`/shadow/${op.id}`} className={viewBtn}>
                            View Details
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteOpportunity(op.id)}
                            disabled={isDeleting}
                            className={deleteBtn}
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
