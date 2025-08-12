import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import type { Opportunity } from "../types/types";
import Hero from "../components/Hero";
import Container from "../components/Container";

export default function ShadowSessionDetailPage() {
  const { roleId } = useParams(); // expects route like /shadow/:roleId
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [user, setUser] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false); // ← added
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
        setOpportunity(data as Opportunity);
      }
      setLoading(false);
    };

    fetchOpportunity();
  }, [roleId]);

  // Check if already scheduled for this user/opportunity (hide confirm button if so)
  useEffect(() => {
    const checkScheduled = async () => {
      if (!user || !roleId) return;
      const oppId = Number(roleId);
      if (!Number.isFinite(oppId)) return;

      const { data, error } = await supabase
        .from("shadow_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("opportunity_id", oppId)
        .maybeSingle();

      if (error) {
        console.error("Error checking scheduled:", error.message);
        return;
      }
      setIsScheduled(!!data);
    };
    checkScheduled();
  }, [user, roleId]);

  // Handle booking confirmation
  const handleConfirm = async () => {
    if (!user || !opportunity) {
      alert("Missing user or opportunity.");
      return;
    }

    // optional safety: avoid duplicate insert
    if (isScheduled) return;

    const { error } = await supabase.from("shadow_sessions").insert([
      {
        user_id: user.id,
        opportunity_id: opportunity.id,
      },
    ]);

    if (error) {
      console.error("Error booking session:", error.message);
      alert("Could not book session.");
    } else {
      setConfirmed(true);
      setIsScheduled(true); // reflect immediately
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

  // Format helpers
  const dateObj = opportunity.date ? new Date(opportunity.date) : null;
  const postedDaysAgo = opportunity.created_at
    ? Math.floor((Date.now() - new Date(opportunity.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Hero
        title={opportunity.title ? `Shadow a ${opportunity.title}` : "Shadow Session"}
        subtitle={
          opportunity.mentor_name
            ? `Hosted by ${opportunity.mentor_name}${opportunity.mentor_title ? `, ${opportunity.mentor_title}` : ""}`
            : "Learn by observing a professional"
        }
        bgClassName="bg-gray-100"
      >
        {/* Quick meta badges under title */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-600">
          {opportunity.format && (
            <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-1">{opportunity.format}</span>
          )}
          {opportunity.duration && (
            <span className="rounded-full bg-green-100 text-green-700 px-2 py-1">{opportunity.duration}</span>
          )}
          {postedDaysAgo !== null && (
            <span className="rounded-full bg-gray-100 text-gray-700 px-2 py-1">
              Posted {postedDaysAgo} day{postedDaysAgo !== 1 ? "s" : ""} ago
            </span>
          )}
        </div>
      </Hero>

      <Container className="pb-14">
        {confirmed ? (
          <div className="relative group rounded-2xl border border-green-300 bg-green-50 p-6 shadow-sm">
            <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 bg-green-100 opacity-0 transition-opacity group-hover:opacity-100 rounded-bl-full" />
            <h2 className="text-2xl font-semibold text-green-800 mb-2">
              Your shadowing session is confirmed!
            </h2>
            <p className="text-gray-800">
              You’ll be shadowing {opportunity.mentor_name || "your mentor"}
              {opportunity.date ? (
                <> on {new Date(opportunity.date).toLocaleString()}</>
              ) : null}
              .<br />
              You can review this session on your Sessions page.
            </p>
            <div className="mt-4">
              <Link
                to="/shadow" // updated route
                className="inline-flex items-center justify-center rounded-md border border-green-700 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition"
              >
                Go to My Sessions
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Details card */}
            <div className="relative group lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100 rounded-bl-full" />
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this session</h2>

              <div className="space-y-2 text-gray-700">
                {opportunity.description && (
                  <p className="text-gray-700">{opportunity.description}</p>
                )}
                <p>📍 <strong>Location:</strong> {opportunity.location || "TBD"}</p>
                <p>🕒 <strong>Duration:</strong> {opportunity.duration || "—"}</p>
                <p>🧭 <strong>Format:</strong> {opportunity.format || "—"}</p>
                {opportunity.requirements && (
                  <p>📝 <strong>Requirements:</strong> {opportunity.requirements}</p>
                )}
                {opportunity.mentor_name && (
                  <p>👤 <strong>Host:</strong> {opportunity.mentor_name}{opportunity.mentor_title ? `, ${opportunity.mentor_title}` : ""}</p>
                )}
                {dateObj && (
                  <p>
                    📅 <strong>Next available:</strong>{" "}
                    {dateObj.toLocaleDateString()} @{" "}
                    {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
            </div>

            {/* Action card */}
<div className="relative group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm h-fit">
  <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100 rounded-bl-full" />

  {(isScheduled || confirmed) ? (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">You’re booked</h3>
      <p className="text-sm text-gray-600 mb-4">
        This session is already scheduled
        {dateObj ? <> for <strong>{dateObj.toLocaleDateString()}</strong></> : ""}.  
        Manage it from{" "}
        <Link to="/sessions" className="underline">My Sessions</Link>.
      </p>
      <span className="w-full inline-flex items-center justify-center rounded-md border border-green-700 px-3 py-2 text-sm font-medium text-green-700">
        ✓ Scheduled
      </span>
    </>
  ) : (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to book?</h3>
      <p className="text-sm text-gray-600 mb-4">
        Confirm your spot{dateObj ? <> for <strong>{dateObj.toLocaleDateString()}</strong></> : ""}.
      </p>
      <button
        onClick={handleConfirm}
        className="w-full inline-flex items-center justify-center rounded-md border border-blue-700 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
      >
        Confirm Session
      </button>
    </>
  )}

  <div className="mt-3 text-xs text-gray-500">
    By confirming, you agree to the host’s attendance and communication guidelines.
  </div>
</div>

          </div>
        )}
      </Container>
    </div>
  );
}
