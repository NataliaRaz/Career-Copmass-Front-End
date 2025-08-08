// src/pages/UserProfilePage.tsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Hero from "../components/Hero";

type Profile = {
  user_id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  role?: "user" | "host" | null;
  skills?: string[] | null;
  preferences?: string | null; // free text (e.g., interests)
};

export default function UserProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // quick stats
  const [bookmarksCount, setBookmarksCount] = useState<number>(0);
  const [sessionsUpcomingCount, setSessionsUpcomingCount] = useState<number>(0);
  const [sessionsPastCount, setSessionsPastCount] = useState<number>(0);
  const [postedCount, setPostedCount] = useState<number>(0); // host only

  // recent lists
  const [recentUpcoming, setRecentUpcoming] = useState<any[]>([]);
  const [recentBookmarks, setRecentBookmarks] = useState<any[]>([]);
  const [recentMyOpps, setRecentMyOpps] = useState<any[]>([]); // host only

  // editing
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [preferences, setPreferences] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  const isHost = useMemo(() => profile?.role === "host", [profile]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) return;

      // Profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, bio, role, skills, preferences")
        .eq("user_id", user.id)
        .maybeSingle();

      const mergedProfile: Profile = {
        user_id: user.id,
        full_name: prof?.full_name ?? null,
        avatar_url: prof?.avatar_url ?? null,
        bio: prof?.bio ?? null,
        role: (prof?.role as any) ?? "user",
        skills: prof?.skills ?? [],
        preferences: prof?.preferences ?? "",
      };
      setProfile(mergedProfile);

      // seed inputs
      setFullName(mergedProfile.full_name ?? "");
      setBio(mergedProfile.bio ?? "");
      setSkillsInput((mergedProfile.skills || []).join(", "));
      setPreferences(mergedProfile.preferences ?? "");

      // Stats (bookmarks)
      const { count: bmCount } = await supabase
        .from("bookmarks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      setBookmarksCount(bmCount || 0);

      // Sessions (split upcoming/past + recent upcoming list)
      const { data: sessionsData } = await supabase
        .from("shadow_sessions")
        .select("id, opportunity_id, opportunities(id, title, description, format, duration, created_at, date)")
        .eq("user_id", user.id);

      if (sessionsData) {
        const now = new Date();

        const upcoming = sessionsData
          .filter((s: any) => s.opportunities?.date && new Date(s.opportunities.date) >= now)
          .sort((a: any, b: any) => new Date(a.opportunities.date).getTime() - new Date(b.opportunities.date).getTime());

        const past = sessionsData
          .filter((s: any) => s.opportunities?.date && new Date(s.opportunities.date) < now)
          .sort((a: any, b: any) => new Date(b.opportunities.date).getTime() - new Date(a.opportunities.date).getTime());

        setSessionsUpcomingCount(upcoming.length);
        setSessionsPastCount(past.length);
        setRecentUpcoming(upcoming.slice(0, 3));
      }

      // Recent bookmarks (limit 3)
      const { data: bmList } = await supabase
        .from("bookmarks")
        .select("id, opportunity_id, created_at, opportunities(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      setRecentBookmarks(bmList || []);

      // Host stats + recent opps
      if ((prof?.role ?? "user") === "host") {
        const { count: oppCount } = await supabase
          .from("opportunities")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", user.id); // assumes owner_id on opportunities
        setPostedCount(oppCount || 0);

        const { data: myOpps } = await supabase
          .from("opportunities")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);
        setRecentMyOpps(myOpps || []);
      }
    })();
  }, []);

  const saveProfile = async () => {
    if (!user) return;
    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const updates = {
      full_name: fullName || null,
      bio: bio || null,
      skills,
      preferences: preferences || null,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (error) {
      alert("Failed to save profile.");
    } else {
      setProfile((p) => (p ? { ...p, ...updates, skills } : p));
      alert("Profile updated!");
    }
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!user) return;
      if (!e.target.files || e.target.files.length === 0) return;
      setAvatarUploading(true);

      const file = e.target.files[0];
      const ext = file.name.split(".").pop();
      const fileName = `${user.id}.${ext}`;
      const path = fileName;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);
      if (updateErr) throw updateErr;

      setProfile((p) => (p ? { ...p, avatar_url: publicUrl } : p));
    } catch (err: any) {
      alert("Error uploading avatar: " + err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  // Util: shared card shell (Explore-style)
  const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="relative group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100 rounded-bl-full" />
      {children}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Hero
        title="My Profile"
        subtitle="Your info, saved items, and sessions in one place"
      />

      <div className="mx-auto max-w-7xl px-4 pb-16 space-y-10">
        {/* Profile card */}
        <Card>
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex items-center gap-4">
              <img
                src={profile?.avatar_url || "https://placehold.co/96x96?text=Avatar"}
                alt="Avatar"
                className="h-24 w-24 rounded-full object-cover"
              />
              <label className="text-sm text-gray-600 cursor-pointer">
                <span className="underline">Change photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  disabled={avatarUploading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Full name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    value={user?.email || ""}
                    readOnly
                    className="w-full rounded-md border border-gray-200 p-2 bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Role</label>
                  <input
                    value={profile?.role || "user"}
                    readOnly
                    className="w-full rounded-md border border-gray-200 p-2 bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 p-2"
                    placeholder="A short intro about you"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Skills (comma-separated)</label>
                  <input
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2"
                    placeholder="React, UX research, Copywriting"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Preferences</label>
                  <input
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2"
                    placeholder="Interests, schedule, etc."
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={saveProfile}
                  className="rounded-md border border-blue-700 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Bookmarks</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{bookmarksCount}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Upcoming Sessions</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{sessionsUpcomingCount}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Past Sessions</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{sessionsPastCount}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Opportunities Posted</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{isHost ? postedCount : 0}</p>
          </Card>
        </div>

        {/* Upcoming sessions (latest 3) */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
            <Link to="/sessions" className="text-sm text-blue-700 hover:underline">View all</Link>
          </div>

          {recentUpcoming.length === 0 ? (
            <Card><p className="text-gray-600">No upcoming sessions.</p></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentUpcoming.map((s) => {
                const opp = s.opportunities;
                const dateObj = opp?.date ? new Date(opp.date) : null;
                const daysAgo = Math.floor((Date.now() - new Date(opp.created_at).getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <Card key={s.id}>
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

                    <div className="mt-6 flex flex-col gap-2">
                      <Link
                        to={`/shadow/${opp.id}`}
                        className="w-full px-3 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Bookmarks (latest 3) */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Bookmarks</h2>
            <Link to="/bookmarks" className="text-sm text-blue-700 hover:underline">View all</Link>
          </div>

          {recentBookmarks.length === 0 ? (
            <Card><p className="text-gray-600">No bookmarks yet.</p></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentBookmarks.map((b) => {
                const opp = b.opportunities;
                const daysAgo = Math.floor((Date.now() - new Date(opp.created_at).getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <Card key={b.id}>
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
                          <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-1">{opp.format}</span>
                        )}
                        {opp.duration && (
                          <span className="rounded-full bg-green-100 text-green-700 px-2 py-1">{opp.duration}</span>
                        )}
                        <span className="ml-auto">
                          🕓 Posted {daysAgo} day{daysAgo !== 1 ? "s" : ""} ago
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Link
                        to={`/shadow/${opp.id}`}
                        className="w-full px-3 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Host-only: My Opportunities */}
        {isHost && (
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold text-gray-900">My Opportunities</h2>
              <div className="flex gap-3">
                <Link
                  to="/opportunities/new"
                  className="rounded-md border border-blue-700 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
                >
                  + Create Opportunity
                </Link>
                <Link to="/host/opportunities" className="text-sm text-blue-700 hover:underline">
                  View all
                </Link>
              </div>
            </div>

            {recentMyOpps.length === 0 ? (
              <Card><p className="text-gray-600">No opportunities posted yet.</p></Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentMyOpps.map((op) => {
                  const daysAgo = Math.floor(
                    (Date.now() - new Date(op.created_at).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <Card key={op.id}>
                      <div>
                        <Link to={`/shadow/${op.id}`}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 transition group-hover:text-blue-700">
                            {op.title}
                          </h3>
                        </Link>
                        {op.description && (
                          <p className="text-gray-700 text-sm mb-3">
                            {op.description.slice(0, 110)}
                            {op.description.length > 110 ? "..." : ""}
                          </p>
                        )}

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

                      <div className="mt-6">
                        <Link
                          to={`/shadow/${op.id}`}
                          className="w-full px-3 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 transition"
                        >
                          View Details
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
