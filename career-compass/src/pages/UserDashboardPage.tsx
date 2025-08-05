import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { defaultData } from "../data/defaultData";
import type { Role } from "../types/types";
import { Link, useNavigate } from "react-router-dom";

export default function UserDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [bookmarkedRoles, setBookmarkedRoles] = useState<Role[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string>("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const { data: bookmarkRows } = await supabase
        .from("bookmarks")
        .select("role_id, id")
        .eq("user_id", user.id);

      const roles = defaultData.roles.filter((r) =>
        bookmarkRows?.some((b) => b.role_id === r.id)
      );

      const rolesWithBookmarkId = roles.map((role) => {
        const match = bookmarkRows.find((b) => b.role_id === role.id);
        return { ...role, bookmark_id: match?.id };
      });

      setBookmarkedRoles(rolesWithBookmarkId as any);

      const { data: shadowing } = await supabase
        .from("shadow_sessions")
        .select("*")
        .eq("user_id", user.id);

      setSessions(shadowing ?? []);
    };

    const fetchUserRole = async () => {
        const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

        if (error) {
            console.error("Error fetching role:", error.message);
        } else {
            setUserRole(data.role);
        }
    };

    loadData();
    fetchUserRole();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const removeBookmark = async (bookmarkId: number) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", bookmarkId);
    if (error) {
      alert("Failed to remove bookmark.");
    } else {
      setBookmarkedRoles((prev) => prev.filter((r) => r.bookmark_id !== bookmarkId));
    }
  };

  if (user) {
    return (
      <div className="page">
        <h1>Welcome, {user.email}</h1>
        <button onClick={handleLogout}>Log out</button>

        <div className="profile-section">
          <h2>👤 Profile</h2>
          <img
            src="https://via.placeholder.com/100"
            alt="Profile"
            style={{ borderRadius: "50%", marginBottom: "1rem" }}
          />
          <p><strong>Skills:</strong> {skills.join(", ") || "Not set"}</p>
          <p><strong>Preferences:</strong> {preferences || "Not set"}</p>
        </div>

        <div className="dashboard-section">
          <h2>📌 Bookmarked Roles</h2>
          {bookmarkedRoles.length === 0 ? (
            <p>No bookmarks yet.</p>
          ) : (
            <ul>
              {bookmarkedRoles.map((r) => (
                <li key={r.id}>
                  <Link to={`/shadow/${r.id}`}>{r.title}</Link>{" "}
                  <button onClick={() => removeBookmark(r.bookmark_id)}>Remove</button>
                </li>
              ))}
            </ul>
          )}

          <h2>📅 Upcoming Shadowing Sessions</h2>
          {sessions.length === 0 ? (
            <p>No upcoming sessions.</p>
          ) : (
            <ul>
              {sessions.map((s) => (
                <li key={s.id}>
                  <Link to={`/shadow/${s.role_id}`}>
                    {new Date(s.date).toLocaleDateString()} – {s.time} @ {s.location}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>User is not signed in</h1>
    </div>
  );
}