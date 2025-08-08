import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type { Opportunity } from "../types/types";
import { Link } from "react-router-dom";

export default function BookmarksList() {
  const [bookmarkedOpportunities, setBookmarkedOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarks() {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not logged in.");
        setLoading(false);
        return;
      }

      const { data: bookmarks, error: bookmarksError } = await supabase
        .from("bookmarks")
        .select("id, opportunity_id, opportunities(*)")
        .eq("user_id", user.id);

      if (bookmarksError) {
        console.error("Failed to load bookmarks:", bookmarksError);
        setLoading(false);
        return;
      }

      const opportunities = bookmarks.map((b) => ({
        ...b.opportunities,
        bookmark_id: b.id, // Needed to delete later
      }));

      setBookmarkedOpportunities(opportunities);
      setLoading(false);
    }

    fetchBookmarks();
  }, []);

  const handleRemove = async (bookmarkId: number) => {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmarkId);

    if (error) {
      console.error("Error removing bookmark:", error.message);
      alert("Failed to remove bookmark");
      return;
    }

    setBookmarkedOpportunities((prev) =>
      prev.filter((opp) => opp.bookmark_id !== bookmarkId)
    );
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : bookmarkedOpportunities.length === 0 ? (
        <p className="text-gray-600">You have no bookmarks yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {bookmarkedOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white p-4 border border-gray-200 rounded-lg shadow hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-1">{opp.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {opp.location || "Remote"} · {opp.department || "General"}
              </p>
              <p className="text-sm text-gray-700">
                {opp.description?.slice(0, 100)}...
              </p>
              <div className="flex items-center justify-between mt-3">
                <Link
                  to={`/shadow/${opp.id}`}
                  className="text-blue-600 underline text-sm"
                >
                  View
                </Link>
                <button
                  onClick={() => handleRemove(opp.bookmark_id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}