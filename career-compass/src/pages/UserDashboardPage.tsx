import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Link } from "react-router-dom";

export default function UserDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [bookmarkedOpportunities, setBookmarkedOpportunities] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("skills, preferences, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setSkills(profile.skills || []);
        setPreferences(profile.preferences || "");
        setAvatarUrl(profile.avatar_url || null);
      }

      const { data: bookmarks } = await supabase
        .from("bookmarks")
        .select("id, opportunity_id, opportunities(*)")
        .eq("user_id", user.id);

      if (bookmarks) {
        const seen = new Set();
        const uniqueBookmarks = [];
        for (const b of bookmarks) {
          if (!seen.has(b.opportunity_id)) {
            seen.add(b.opportunity_id);
            uniqueBookmarks.push({
              ...b.opportunities,
              bookmark_id: b.id,
            });
          }
        }
        setBookmarkedOpportunities(uniqueBookmarks);
      }

      const { data: shadowing } = await supabase
        .from("shadow_sessions")
        .select("id, opportunity_id, opportunities(id, title, location, date)")
        .eq("user_id", user.id);

      if (shadowing) {
        const now = new Date();
        const upcoming = shadowing
          .filter((s) => {
            const date = s.opportunities?.date ? new Date(s.opportunities.date) : null;
            return date && date >= now;
          })
          .sort((a, b) =>
            new Date(a.opportunities.date).getTime() - new Date(b.opportunities.date).getTime()
          );

        setSessions(upcoming);
      }
    };

    loadData();
  }, [user]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      alert("Error uploading avatar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeBookmark = async (bookmarkId: number) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", bookmarkId);
    if (error) {
      alert("Failed to remove bookmark.");
    } else {
      setBookmarkedOpportunities((prev) =>
        prev.filter((opp) => opp.bookmark_id !== bookmarkId)
      );
    }
  };

  const handleCancelSession = async (sessionId: number) => {
    const confirmed = window.confirm("Are you sure you want to cancel this session?");
    if (!confirmed) return;

    const { error } = await supabase.from("shadow_sessions").delete().eq("id", sessionId);
    if (error) {
      alert("Failed to cancel session.");
    } else {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    }
  };

  if (!user) {
    return (
      <div className="page">
        <h1>User is not signed in</h1>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* ✅ Profile Card */}
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover mb-4" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mb-4">
              No Avatar
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-800">{user.email}</h2>
          <p className="text-sm text-gray-500">Skills: {skills.length ? skills.join(", ") : "Not set"}</p>
          <p className="text-sm text-gray-500">Preferences: {preferences || "Not set"}</p>

          <label className="block mt-4 text-sm font-medium text-gray-700">
            Upload Profile Picture
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
              className="mt-1 text-sm"
            />
          </label>
          {uploading && <p className="text-sm text-gray-400 mt-2">Uploading...</p>}
        </div>

        {/* 📌 Bookmarked Opportunities */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">📌 Bookmarked Opportunities</h2>
          {bookmarkedOpportunities.length === 0 ? (
            <p className="text-gray-500">No bookmarks yet.</p>
          ) : (
            <ul className="space-y-2">
              {bookmarkedOpportunities.map((opp) => (
                <li key={opp.bookmark_id} className="border p-4 rounded bg-white shadow">
                  <div className="flex justify-between items-center">
                    <Link to={`/shadow/${opp.id}`} className="text-blue-700 font-medium">
                      {opp.title}
                    </Link>
                    <button
                      onClick={() => removeBookmark(opp.bookmark_id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{opp.location || "Remote"}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 📅 Upcoming Sessions */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">📅 Upcoming Shadow Sessions</h2>
          {sessions.length === 0 ? (
            <p className="text-gray-500">No upcoming sessions.</p>
          ) : (
            <ul className="space-y-2">
              {sessions.map((s) => {
                const opp = s.opportunities;
                const rawDate = opp?.date;
                const dateObj = rawDate ? new Date(rawDate) : null;

                return (
                  <li key={s.id} className="border p-4 rounded bg-white shadow">
                    {opp ? (
                      <>
                        <div className="flex justify-between items-center">
                          <div>
                            <Link to={`/shadow/${opp.id}`} className="text-blue-700 font-medium block">
                              {opp.title}
                            </Link>
                            {dateObj ? (
                              <p className="text-sm text-gray-600">
                                {dateObj.toLocaleDateString()} @{" "}
                                {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            ) : (
                              <p className="text-sm text-red-500">Date not set</p>
                            )}
                            <p className="text-sm text-gray-600">{opp.location || "Remote"}</p>
                          </div>
                          <div className="flex flex-col gap-1 sm:items-end">
                            <button
                              onClick={() => handleCancelSession(s.id)}
                              className="text-sm text-red-600 hover:underline"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => alert("Reschedule logic goes here")}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Reschedule
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-red-500">Opportunity details missing.</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}