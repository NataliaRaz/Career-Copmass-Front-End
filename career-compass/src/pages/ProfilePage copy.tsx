import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import HostDashboardPage from "./HostDashboardPage";
import UserDashboardPage from "./UserDashboardPage";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);       // ✅ auth/profile loading
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // login form state (only used when not signed in)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 1) Watch auth; load role if signed in
  useEffect(() => {
    let unsub: { subscription: { unsubscribe: () => void } } | null = null;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);

      if (user) {
        await loadRole(user.id);
      } else {
        setUserRole(null);
        setChecking(false);
      }

      const { data } = supabase.auth.onAuthStateChange(async (_evt, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          setChecking(true);
          await loadRole(u.id);
        } else {
          setUserRole(null);
          setChecking(false);
        }
      });

      unsub = data;
    })();

    return () => unsub?.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load role from profiles
  const loadRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", userId)     // 👈 if your key is 'id' instead, change to .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching role:", error.message);
        setUserRole(null);
      } else {
        setUserRole(data?.role ?? "user"); // default to 'user' if missing
      }
    } finally {
      setChecking(false);
    }
  };

  // 2) Login handler (simple)
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Login failed: " + error.message);
    }
    // onAuthStateChange will take care of the view switch
  };

  // 3) Logout (useful for testing)
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 4) Render logic
  if (checking) {
    return <div className="py-16 text-center text-gray-500">Loading…</div>;
  }

  if (user && userRole === "host") {
    return <HostDashboardPage />;
  }

  if (user && userRole === "user") {
    return <UserDashboardPage />;
  }

  // Not signed in → show login form (as you had before)
  return (
    <div className="page">
      <h1>Login to Your Account</h1>

      <div style={{ maxWidth: 360 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3"
        />

        <button
          onClick={handleLogin}
          className="w-full border border-blue-700 text-blue-700 rounded px-3 py-2 hover:bg-blue-50 transition"
        >
          Login
        </button>

        <p className="mt-3 text-sm">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="underline text-blue-700"
          >
            Sign Up
          </button>
        </p>

        {/* Optional for testing */}
        {/* <button onClick={handleLogout} className="mt-3 text-sm underline">Log out</button> */}
      </div>
    </div>
  );
}