import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Hero from "../components/Hero";
import Container from "../components/Container";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      alert("Login failed: " + error.message);
    } else {
      navigate("/profile");
    }
  };

  return (
    <>
      {/* Hero (same pattern as Home) */}
      <Hero
        title="Welcome back"
        subtitle="Log in to your account"
        bgClassName="bg-gray-100"
      />

      {/* Section (same structure as Home's sections) */}
      <section className="relative overflow-hidden bg-white">
        <Container>
          {/* Single Home-style card centered */}
          <div className="max-w-md mx-auto">
            <div className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              {/* subtle hover accent like Home cards */}
              <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100 rounded-bl-full" />

              <div className="text-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Log In</h2>
                <p className="mt-1 text-gray-600">Use your email and password</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-400"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-400"
                    placeholder="••••••••"
                  />
                </div>

                {/* Button styled like Home's CTA ("Explore"/"View bookmarks") */}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-md border border-blue-700 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
                >
                  {loading ? "Logging in..." : "Log In"}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-600">
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-blue-700 hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
