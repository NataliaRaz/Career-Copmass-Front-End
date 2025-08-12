import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import Container from "../components/Container";

export default function UnifiedSignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, fullName },
        emailRedirectTo: `${window.location.origin}/profile`,
      },
    });

    if (error) {
      alert("Signup error: " + error.message);
      return;
    }

    const user = data.user;
    if (user) {
      const { error: insertError } = await supabase.from("profiles").insert({
        user_id: user.id,
        full_name: fullName,
        role: role,
      });

      if (insertError) {
        alert("Profile creation error: " + insertError.message);
      } else {
        alert(`${role === "host" ? "Host" : "User"} account created!`);
        navigate(role === "host" ? "/host-dashboard" : "/profile");
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Hero title="Create Your Account" subtitle="Sign up to start your journey" />

      <Container className="pb-16">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sign Up</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                required
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                required
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Select Account Type</p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    value="user"
                    checked={role === "user"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  Regular User
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    value="host"
                    checked={role === "host"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  Host
                </label>
              </div>
            </div>

            <button
              onClick={handleSignUp}
              className="w-full px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
