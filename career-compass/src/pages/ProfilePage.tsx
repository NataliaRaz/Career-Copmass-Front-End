import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { defaultData } from "../data/defaultData";
import type { Role } from "../types/types";
import { Link, useNavigate } from "react-router-dom";
import HostDashboardPage from "./HostDashboardPage";
import UserDashboardPage from "./UserDashboardPage";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // ✅ added
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

    // const loadData = async () => {
    //   const { data: bookmarkRows } = await supabase
    //     .from("bookmarks")
    //     .select("role_id, id")
    //     .eq("user_id", user.id);

    //   const roles = defaultData.roles.filter((r) =>
    //     bookmarkRows?.some((b) => b.role_id === r.id)
    //   );

    //   const rolesWithBookmarkId = roles.map((role) => {
    //     const match = bookmarkRows.find((b) => b.role_id === role.id);
    //     return { ...role, bookmark_id: match?.id };
    //   });

    //   setBookmarkedRoles(rolesWithBookmarkId as any);

    //   const { data: shadowing } = await supabase
    //     .from("shadow_sessions")
    //     .select("*")
    //     .eq("user_id", user.id);

    //   setSessions(shadowing ?? []);
    // };

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

    // loadData();
    fetchUserRole();
  }, [user]);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Login failed: " + error.message);
    else window.location.reload();
  };

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

  if (userRole==="host") {
    return <HostDashboardPage />;
  }
  else if (userRole==="user"){
    return <UserDashboardPage />;
  }

  return (
    <div className="page">
      <h1>Login to Your Account</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br />

      {/* ✅ Added confirm password field */}
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      /><br />

      <button onClick={handleLogin}>Login</button>

      <p>
        Don't have an account?{" "}
        <button onClick={() => navigate("/signup")}>Sign Up</button>
      </p>
    </div>
  );
}