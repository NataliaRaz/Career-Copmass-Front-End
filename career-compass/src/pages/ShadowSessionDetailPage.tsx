import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import type { Opportunity } from "../types/types";

export default function ShadowSessionDetailPage() {
  const { roleId } = useParams(); // expects route like /shadow/:roleId
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [user, setUser] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user on load
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  // Fetch opportunity
  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!roleId) return;

      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("id", roleId)
        .single();

      if (error || !data) {
        console.error("Error fetching opportunity:", error?.message);
        setOpportunity(null);
      } else {
        setOpportunity(data);
      }

      setLoading(false);
    };

    fetchOpportunity();
  }, [roleId]);

  // Handle booking confirmation
  const handleConfirm = async () => {
    if (!user || !opportunity) {
      alert("Missing user or opportunity.");
      return;
    }

    const { error } = await supabase.from("shadow_sessions").insert([
      {
        user_id: user.id,
        opportunity_id: opportunity.id
      }
    ]);

    if (error) {
      console.error("Error booking session:", error.message);
      alert("Could not book session.");
    } else {
      setConfirmed(true);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!opportunity) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        Opportunity not found.
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-green-100 rounded-xl text-center">
        <h2 className="text-2xl font-semibold text-green-800 mb-4">
          Your shadowing session is confirmed!
        </h2>
        <p className="text-gray-700">
          You’ll be shadowing {opportunity.mentor_name} on {opportunity.date}.
          <br /> You can review this session in your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow space-y-4">
      <h1 className="text-2xl font-bold">Shadow a {opportunity.title}</h1>

      <div className="text-gray-700 space-y-2">
        <p>📍 <strong>Format:</strong> {opportunity.format}</p>
        <p>🕒 <strong>Duration:</strong> {opportunity.duration}</p>
        <p>🗓️ <strong>Next available:</strong> {opportunity.date}</p>
        <p>👤 <strong>Hosted by:</strong> {opportunity.mentor_name}, {opportunity.mentor_title}</p>
        <p>📍 <strong>Location:</strong> {opportunity.location}</p>
        {opportunity.requirements && (
          <p>📝 <strong>Requirements:</strong> {opportunity.requirements}</p>
        )}
        {opportunity.description && (
          <p>💬 <strong>Description:</strong> {opportunity.description}</p>
        )}
      </div>

      <button
        onClick={handleConfirm}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded"
      >
        Confirm Session
      </button>
    </div>
  );
}