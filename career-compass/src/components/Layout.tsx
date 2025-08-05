import { Link, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import "./Layout.css";

export default function Layout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="logo">Career Compass</Link>
        </div>
        <div className="navbar-right">
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/shadow">Book Shadow</Link>
          <Link to="/bookmarks">My Bookmarks</Link>
          {user ? (
                <Link to="/profile">Profile</Link>
            ) : (
                <Link to="/profile">Sign In</Link>
            )}
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} Career Compass. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
