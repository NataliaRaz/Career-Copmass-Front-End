import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

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
            emailRedirectTo: "http://localhost:3000/profile" 
        },
     });

    if (error) {
      alert("Signup error: " + error.message);
      return;
    }

    //alert("Check your email to confirm your account. Then log in.");

    const user = data.user;
    if (user) {
      const { error: insertError } = await supabase.from("profiles").insert({
        user_id: user.id,
        name: fullName,
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
    <div className="page" style={{ maxWidth: "500px", margin: "2rem auto" }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Sign Up</h2>

      <label className="block">
        Full Name:
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input"
          type="text"
          required
        />
      </label>

      <label className="block">
        Email:
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          type="email"
          required
        />
      </label>

      <label className="block">
        Password:
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          type="password"
          required
        />
      </label>

      <label className="block">
        Confirm Password:
        <input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input"
          type="password"
          required
        />
      </label>

      <div style={{ margin: "1rem 0" }}>
        <p><strong>Select Account Type:</strong></p>
        <label style={{ marginRight: "1rem" }}>
          <input
            type="radio"
            value="user"
            checked={role === "user"}
            onChange={(e) => setRole(e.target.value)}
          />{" "}
          Regular User
        </label>
        <label>
          <input
            type="radio"
            value="host"
            checked={role === "host"}
            onChange={(e) => setRole(e.target.value)}
          />{" "}
          Host
        </label>
      </div>

      <button onClick={handleSignUp} className="button" style={{ padding: "0.5rem 1rem" }}>
        Sign Up
      </button>
    </div>
  );
}