import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import type { Opportunity } from "../types/types";

export default function PostOpportunityPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("You must be logged in as a host to post.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("opportunities").insert({
      title,
      description,
      user_id: user.id,
    });

    if (insertError) {
      alert("Error posting opportunity: " + insertError.message);
    } else {
      alert("Opportunity posted!");
      navigate("/host-dashboard"); // Change route if needed
    }

    setLoading(false);
  };

  return (
    <div className="page">
      <h2>Post New Opportunity</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
          />
        </label>
        <br />
        <label>
          Description:
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post Opportunity"}
        </button>
      </form>
    </div>
  );
}