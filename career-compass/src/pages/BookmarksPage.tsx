import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import Container from "../components/Container";

export default function BookmarksList() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [scheduledIds, setScheduledIds] = useState<number[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: bookmarks } = await supabase
        .from("bookmarks")
        .select("id, opportunity_id, opportunities(*)")
        .eq("user_id", user.id);

      const { data: sessions } = await supabase
        .from("shadow_sessions")
        .select("opportunity_id")
        .eq("user_id", user.id);

      const scheduled = sessions?.map((s) => s.opportunity_id) || [];

      if (bookmarks) {
        setBookmarks(bookmarks);
        setScheduledIds(scheduled);
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  const removeBookmark = async (bookmarkId: number) => {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmarkId);

    if (error) {
      console.error("Error removing bookmark:", error.message);
      return;
    }

    // Update local state
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  };

  if (loading) return <p className="text-gray-500 p-6">Loading...</p>;

  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Hero
          title="My Bookmarks"
          subtitle="Saved opportunities for later"
          bgClassName="bg-gray-100"
        />
        <Container className="py-14">
          <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-gray-700 mb-4">
              Please log in to view your bookmarks.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md border border-blue-700 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
            >
              Log In
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Hero
        title="My Bookmarks"
        subtitle="Saved opportunities for later"
        bgClassName="bg-gray-100"
      />

      <Container className="pb-14">
        {bookmarks.length === 0 ? (
          <p className="text-center text-gray-600">
            You have no saved bookmarks.
          </p>
        ) : (
          <ol className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {bookmarks.map((b) => {
              const opp = b.opportunities;
              const isScheduled = scheduledIds.includes(opp.id);
              const daysAgo = Math.floor(
                (Date.now() - new Date(opp.created_at).getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <li
                  key={b.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100 rounded-bl-full" />

                  <div>
                    <Link to={`/shadow/${opp.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 transition group-hover:text-blue-700">
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
                        <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-1">
                          {opp.format}
                        </span>
                      )}
                      {opp.duration && (
                        <span className="rounded-full bg-green-100 text-green-700 px-2 py-1">
                          {opp.duration}
                        </span>
                      )}
                      <span className="ml-auto">
                        🕓 Posted {daysAgo} day{daysAgo !== 1 ? "s" : ""} ago
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    <Link
                      to={`/shadow/${opp.id}`}
                      className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      View Details
                    </Link>

                    {isScheduled ? (
                      <span className="inline-flex w-full items-center justify-center text-green-700 text-xs border border-green-700 px-2 py-1 rounded-full">
                        ✓ Scheduled
                      </span>
                    ) : (
                      <Link
                        to={`/shadow/${opp.id}`}
                        className="inline-flex w-full items-center justify-center rounded-md border border-blue-700 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
                      >
                        Shadow
                      </Link>
                    )}

                    <button
                      onClick={() => removeBookmark(b.id)}
                      className="inline-flex w-full items-center justify-center border border-red-600 text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition"
                    >
                      Remove From Bookmarks
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Container>
    </div>
  );
}
