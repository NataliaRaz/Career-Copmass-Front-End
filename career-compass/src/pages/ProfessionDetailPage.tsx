import { useParams, useNavigate } from "react-router-dom";
import { defaultData } from "../data/defaultData";
import { supabase } from "../utils/supabaseClient";
import { useState } from "react";
import type { Profession, Role } from "../types/types";
import './SharedStyles.css';

export default function ProfessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const professionId = Number(id);

  const profession: Profession | undefined = defaultData.professions.find(
    (p) => p.id === professionId
  );

  const relatedRoles: Role[] = defaultData.roles.filter(
    (r) => r.professionId === professionId
  );

  const [loading, setLoading] = useState<number | null>(null);

  // Shadow a role
  const handleShadow = (roleId: number) => {
    navigate(`/shadow/${roleId}`);
  };

  // Toggle bookmark: add if not exists, remove if exists
  const handleBookmark = async (roleId: number) => {
    setLoading(roleId);

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      alert("Please log in to bookmark roles.");
      setLoading(null);
      return;
    }

    // Check if this role is already bookmarked
    const { data: existing, error: fetchError } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("role_id", roleId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") { // ignore "not found"
      console.error("Bookmark check failed:", fetchError.message);
      alert("Error checking bookmark.");
      setLoading(null);
      return;
    }

    if (existing) {
      // Role already bookmarked -> remove it
      const { error: deleteError } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", existing.id);

      if (deleteError) {
        console.error("Failed to remove bookmark:", deleteError.message);
        alert("Could not remove bookmark.");
      } else {
        alert("Bookmark removed!");
      }
    } else {
      // Add new bookmark
      const { error: insertError } = await supabase.from("bookmarks").insert({
        user_id: user.id,
        role_id: roleId,
      });

      if (insertError) {
        console.error("Bookmark failed:", insertError.message);
        alert("Could not bookmark this role.");
      } else {
        alert("Role bookmarked!");
      }
    }

    setLoading(null);
  };

  const handleApply = (roleId: number) => {
    console.log("Apply clicked for role", roleId);
  };

  if (!profession) return <p>Profession not found.</p>;

  return (
    <div className="page">
      <div className="hero">
        <h1>{profession.name}</h1>
        <p>{profession.description}</p>
      </div>

      <div className="featured-section">
        <h2 className="section-title">Roles under {profession.name}</h2>
        <div className="cards">
          {relatedRoles.map((role) => (
            <div key={role.id} className="card">
              <h3>{role.title}</h3>
              <p>{role.description}</p>
              <div className="buttons">
                <button onClick={() => handleShadow(role.id)}>Shadow</button>
                <button onClick={() => handleBookmark(role.id)} disabled={loading === role.id}>
                  {loading === role.id ? "Saving..." : "Bookmark"}
                </button>
                <button onClick={() => handleApply(role.id)}>Apply</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}