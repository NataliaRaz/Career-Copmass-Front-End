import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Container from "../components/Container";

export default function Layout() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsub: any;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        setRole(profile?.role || null);
      }

      const { data } = supabase.auth.onAuthStateChange((_e, s) => {
        setUser(s?.user ?? null);
        if (s?.user) {
          supabase
            .from("profiles")
            .select("role")
            .eq("user_id", s.user.id)
            .single()
            .then(({ data }) => setRole(data?.role || null));
        } else {
          setRole(null);
        }
      });

      unsub = data?.subscription;
    })();
    return () => unsub?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-2 py-1 transition ${
      isActive
        ? "underline underline-offset-8 decoration-2 decoration-blue-600"
        : "hover:underline hover:underline-offset-8"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header (clamped) */}
      <header className="bg-white shadow">
        <Container>
          <div className="py-3 flex items-center justify-between min-w-0">
            <NavLink to="/" end className="text-lg font-bold">Career Compass</NavLink>
            <nav className="flex items-center gap-4 text-sm">
              <NavLink to="/" end className={navLinkClass}>Home</NavLink>
              <NavLink to="/explore" className={navLinkClass}>Explore</NavLink>
              <NavLink to="/shadow" className={navLinkClass}>My Sessions</NavLink>
              {role === 'host' && (
                <NavLink to="opportunities" className="...">My Opportunities</NavLink>
              )}
              {role !== "host" && (
                <NavLink to="/bookmarks" className={navLinkClass}>My Bookmarks</NavLink>
              )}
              {user ? (
                <>
                  <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
                  <button onClick={handleLogout} className="px-2 py-1">Logout</button>
                </>
              ) : (
                <NavLink to="/login" className={navLinkClass}>Login</NavLink>
              )}
            </nav>
          </div>
        </Container>
      </header>

      {/* Main (NO Container — lets pages do full-bleed sections) */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer (clamped) */}
      <footer className="bg-gray-100">
        <Container>
          <div className="py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
            <div className="flex gap-4">
              <NavLink to="/about" className={navLinkClass}>About</NavLink>
              <NavLink to="/terms" className={navLinkClass}>Terms</NavLink>
              <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
            </div>
            <p>© {new Date().getFullYear()} Career Compass. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
