// src/pages/UserProfilePage.tsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Hero from "../components/Hero";
import Container from "../components/Container";
import Card from "../components/Card";

type Profile = {
  user_id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  role?: "user" | "host" | null;
  skills?: string[] | null;
  preferences?: string | null;
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

  // host-only: deleting state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const isHost = useMemo(() => profile?.role === "host", [profile]);

  // shared “button look” classes so <a> and <button> match exactly
  const buttonLike =
    "flex-1 inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium border border-gray-300 bg-white text-center hover:bg-gray-50 transition";
  const viewBtn = `${buttonLike} text-gray-700`;
  const deleteBtn = `${buttonLike} text-red-600`;

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
        .select(
          "id, opportunity_id, opportunities(id, title, description, format, duration, created_at, date)"
        )
        .eq("user_id", user.id);

      if (sessionsData) {
        const now = new Date();

        const upcoming = sessionsData
          .filter(
            (s: any) => s.opportunities?.date && new Date(s.opportunities.date) >= now
          )
          .sort(
            (a: any, b: any) =>
              new Date(a.opportunities.date).getTime() -
              new Date(b.opportunities.date).getTime()
          );

        const past = sessionsData
          .filter(
            (s: any) => s.opportunities?.date && new Date(s.opportunities.date) < now
          )
          .sort(
            (a: any, b: any) =>
              new Date(b.opportunities.date).getTime() -
              new Date(a.opportunities.date).getTime()
          );

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
          .eq("user_id", user.id);
        setPostedCount(oppCount || 0);

        const { data: myOpps } = await supabase
          .from("opportunities")
          .select("*")
          .eq("user_id", user.id)
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
      user_id: user.id,
      full_name: fullName || null,
      bio: bio || null,
      skills,
      preferences: preferences || null,
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(updates, { onConflict: "user_id" });

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

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;

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

  // HOST: Delete an opportunity
  const handleDeleteOpportunity = async (id: number) => {
    if (!user) return;
    const ok = window.confirm(
      "Delete this opportunity? This will also remove all shadow sessions and bookmarks for it. This cannot be undone."
    );
    if (!ok) return;

    try {
      setDeletingId(id);

      // 1) Delete all shadow sessions for this opportunity
      const { error: ssErr } = await supabase
        .from("shadow_sessions")
        .delete()
        .eq("opportunity_id", id);
      if (ssErr) {
        alert("Failed to delete related shadow sessions: " + ssErr.message);
        return;
      }

      // 2) Delete all bookmarks for this opportunity
      const { error: bmErr } = await supabase
        .from("bookmarks")
        .delete()
        .eq("opportunity_id", id);
      if (bmErr) {
        alert("Failed to delete related bookmarks: " + bmErr.message);
        return;
      }

      // 3) Delete the opportunity (extra guard by user_id)
      const { error: oppErr } = await supabase
        .from("opportunities")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (oppErr) {
        alert("Failed to delete opportunity: " + oppErr.message);
        return;
      }

      // Optimistically update UI
      setRecentMyOpps((prev) => prev.filter((o) => o.id !== id));
      setPostedCount((c) => Math.max(0, (c || 0) - 1));
    } finally {
      setDeletingId(null);
    }
  };

  const formatChip = (format?: string | null) =>
    format ? (
      <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-1">
        {String(format).charAt(0).toUpperCase() + String(format).slice(1)}
      </span>
    ) : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Hero
        title="My Profile"
        subtitle="Your info, saved items, and sessions in one place"
        bgClassName="bg-gray-100"
      />

      <Container className="pb-16 space-y-10">
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
                  <label className="block text-sm text-gray-600 mb-1">
                    Skills (comma-separated)
                  </label>
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
          {!isHost && (
            <Card>
              <p className="text-sm text-gray-500">Bookmarks</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{bookmarksCount}</p>
            </Card>
          )}
          <Card>
            <p className="text-sm text-gray-500">Upcoming Sessions</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{sessionsUpcomingCount}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Past Sessions</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{sessionsPastCount}</p>
          </Card>

          {/* Host-only: Opportunities Posted stat */}
          {isHost && (
            <Card>
              <p className="text-sm text-gray-500">Opportunities Posted</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{postedCount}</p>
            </Card>
          )}
        </div>

        {/* Upcoming sessions (latest 3) */}
        {!isHost && (
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
              <Link to="/sessions" className="text-sm text-blue-700 hover:underline">
                View all
              </Link>
            </div>

            {recentUpcoming.length === 0 ? (
              <Card>
                <p className="text-gray-600">No upcoming sessions.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentUpcoming.map((s) => {
                  const opp = s.opportunities;
                  const dateObj = opp?.date ? new Date(opp.date) : null;
                  const daysAgo = Math.floor(
                    (Date.now() - new Date(opp.created_at).getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <Card key={s.id}>
                      <div className="flex h-full flex-col group">
                        {/* Top content */}
                        <div>
                          <Link to={`/shadow/${opp.id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 transition group-hover:text-blue-700">
                              {opp.title}
                            </h3>
                          </Link>

                          {opp.description && (
                            <p className="text-gray-700 text-sm">
                              {opp.description.slice(0, 160)}
                              {opp.description.length > 160 ? "..." : ""}
                            </p>
                          )}
                        </div>

                        {/* Footer pinned to bottom */}
                        <div className="mt-auto pt-4">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            {formatChip(opp.format)}
                            {opp.duration && (
                              <span className="rounded-full bg-green-100 text-green-700 px-2 py-1">
                                {opp.duration}
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
                            <Link to={`/shadow/${opp.id}`} className={viewBtn}>
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Bookmarks (latest 3) */}
        {!isHost && (
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Bookmarks</h2>
              <Link to="/bookmarks" className="text-sm text-blue-700 hover:underline">
                View all
              </Link>
            </div>

            {recentBookmarks.length === 0 ? (
              <Card>
                <p className="text-gray-600">No bookmarks yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentBookmarks.map((b) => {
                  const opp = b.opportunities;
                  const daysAgo = Math.floor(
                    (Date.now() - new Date(opp.created_at).getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <Card key={b.id}>
                      <div className="flex h-full flex-col group">
                        {/* Top content */}
                        <div>
                          <Link to={`/shadow/${opp.id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 transition group-hover:text-blue-700">
                              {opp.title}
                            </h3>
                          </Link>

                          {opp.description && (
                            <p className="text-gray-700 text-sm">
                              {opp.description.slice(0, 160)}
                              {opp.description.length > 160 ? "..." : ""}
                            </p>
                          )}
                        </div>

                        {/* Footer pinned */}
                        <div className="mt-auto pt-4">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            {formatChip(opp.format)}
                            {opp.duration && (
                              <span className="rounded-full bg-green-100 text-green-700 px-2 py-1">
                                {opp.duration}
                              </span>
                            )}
                            <span className="ml-auto">
                              🕓 Posted {daysAgo} day{daysAgo !== 1 ? "s" : ""} ago
                            </span>
                          </div>

                          {/* Make the button full width like other sections */}
                          <div className="mt-3 flex gap-2">
                            <Link to={`/shadow/${opp.id}`} className={viewBtn}>
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Host-only: My Opportunities */}
        {isHost && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              {/* Title + Button grouped */}
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">My Opportunities</h2>
                <Link
                  to="/opportunities/new"
                  className="rounded-md border border-blue-700 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
                >
                  + Post Opportunity
                </Link>
              </div>

              <Link to="/opportunities" className="text-sm text-blue-700 hover:underline">
                View all
              </Link>
            </div>

            {recentMyOpps.length === 0 ? (
              <Card>
                <p className="text-gray-600">No opportunities posted yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentMyOpps.map((op) => {
                  const daysAgo = Math.floor(
                    (Date.now() - new Date(op.created_at).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const isDeleting = deletingId === op.id;

                  return (
                    <Card key={op.id}>
                      <div className="flex h-full flex-col group">
                        {/* Top content */}
                        <div>
                          <Link to={`/shadow/${op.id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 transition group-hover:text-blue-700">
                              {op.title}
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
                            {formatChip(op.format)}
                            {op.duration && (
                              <span className="rounded-full bg-green-100 text-green-700 px-2 py-1">
                                {op.duration}
                              </span>
                            )}
                            <span className="ml-auto">
                              🕓 Posted {daysAgo} day{daysAgo !== 1 ? "s" : ""} ago
                            </span>
                          </div>

                          <div className="mt-3 flex gap-2">
                            <Link to={`/shadow/${op.id}`} className={viewBtn}>
                              View Details
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDeleteOpportunity(op.id)}
                              disabled={isDeleting}
                              className={`${deleteBtn} ${
                                isDeleting ? "opacity-50 cursor-not-allowed" : ""
                              }`}
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
          </section>
        )}
      </Container>
    </div>
  );
}
