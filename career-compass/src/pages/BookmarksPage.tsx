import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";

export default function BookmarksList() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [scheduledIds, setScheduledIds] = useState<number[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (!user) return;

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
    };

    fetchUserData();
  }, []);

  const removeBookmark = async (bookmarkId: number) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", bookmarkId);
    if (error) {
      alert("Error removing bookmark");
    } else {
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    }
  };

  if (!user) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <Hero title="My Bookmarks" subtitle="Saved opportunities for later" />

      <div className="max-w-7xl mx-auto px-4 pb-14">
        {bookmarks.length === 0 ? (
          <p className="text-center text-gray-600">You have no saved bookmarks.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookmarks.map((b) => {
              const opp = b.opportunities;
              const isScheduled = scheduledIds.includes(opp.id);
              const daysAgo = Math.floor(
                (Date.now() - new Date(opp.created_at).getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={b.id}
                  className="relative group bg-white border rounded-xl shadow-sm p-6 hover:shadow-lg transition flex flex-col justify-between"
                >
                  {/* Inside-corner accent */}
                  <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100 rounded-bl-full" />

                  <div className="mb-4">
                    <Link to={`/shadow/${opp.id}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-700 transition">
                        {opp.title}
                      </h3>
                    </Link>

                    {opp.description && (
                      <p className="text-gray-700 text-sm mb-3">
                        {opp.description.slice(0, 100)}...
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {opp.format && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {opp.format}
                        </span>
                      )}
                      {opp.duration && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {opp.duration}
                        </span>
                      )}
                      <span className="ml-auto">
                        🕓 Posted {daysAgo} day{daysAgo !== 1 ? "s" : ""} ago
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 mt-auto">
                    <Link
                      to={`/shadow/${opp.id}`}
                      className="w-full px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 transition"
                    >
                      View Details
                    </Link>

                    {isScheduled && (
                      <span className="text-green-700 text-xs border border-green-700 px-2 py-1 rounded-full text-center">
                        ✓ Scheduled
                      </span>
                    )}

                    <button
                      onClick={() => removeBookmark(b.id)}
                      className="w-full text-center border border-red-600 text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition"
                    >
                      Remove From Bookmarks
                    </button>
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