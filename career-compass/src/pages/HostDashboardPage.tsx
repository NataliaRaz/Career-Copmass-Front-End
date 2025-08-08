import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import type { Opportunity, ShadowSession } from "../types/types";

export default function HostDashboardPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [sessions, setSessions] = useState<ShadowSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const navigate = useNavigate();

  const handleDeleteOpportunity = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this opportunity?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("opportunities").delete().eq("id", id);

    if (error) {
      alert("Failed to delete: " + error.message);
    } else {
      setOpportunities((prev) => prev.filter((opp) => opp.id !== id));
      alert("Opportunity deleted.");
    }
  };

  const handleEditOpportunity = (id: number) => {
    navigate(`/edit-opportunity/${id}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        navigate("/profile");
        return;
      }

      const userId = userData.user.id;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (profileError || profile?.role !== "host") {
        navigate("/");
        return;
      }

      setIsHost(true);

      const { data: opps, error: oppsError } = await supabase
        .from("opportunities")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const { data: sess, error: sessError } = await supabase
        .from("shadow_sessions")
        .select(`
          id,
          date_time,
          user_id,
          opportunity_id,
          opportunities (
            title
          )
        `)
        .gt("date_time", new Date().toISOString())
        .order("date_time");

      if (!oppsError) setOpportunities(opps || []);
      if (!sessError) {
        const filteredSessions = (sess as ShadowSession[]).filter((s) =>
          opps?.some((o) => o.id === s.opportunity_id)
        );
        setSessions(filteredSessions);
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handlePost = () => navigate("/post-opportunity");

  if (loading) return <p className="text-center text-gray-500">Loading dashboard...</p>;
  if (!isHost) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header without Logout */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">👋 Welcome, Host</h2>
      </div>

      <button
        onClick={handlePost}
        className="bg-blue-600 text-white px-4 py-2 rounded-md mb-8 hover:bg-blue-700 transition"
      >
        ➕ Post New Opportunity
      </button>

      {/* Posted Opportunities */}
      <section className="mb-10">
        <h3 className="text-2xl font-semibold mb-4">📋 Posted Opportunities</h3>
        {opportunities.length === 0 ? (
          <p className="text-gray-600">No opportunities posted yet.</p>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-start"
              >
                <div>
                  <h4 className="text-lg font-medium text-blue-700">{opp.title}</h4>
                  <p className="text-gray-600">{opp.description}</p>
                </div>
                <div className="flex-shrink-0 ml-4 space-x-2">
                  <button
                    onClick={() => handleEditOpportunity(opp.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteOpportunity(opp.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Shadow Sessions */}
      <section>
        <h3 className="text-2xl font-semibold mb-4">📅 Upcoming Shadow Sessions</h3>
        {sessions.length === 0 ? (
          <p className="text-gray-600">No upcoming sessions yet.</p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="border border-gray-100 p-4 rounded-lg bg-gray-50 shadow-sm"
              >
                <p className="text-gray-700">
                  <strong>{new Date(s.date_time).toLocaleString()}</strong> — Mentee ID:{" "}
                  <span className="text-blue-700 font-semibold">{s.mentee_id}</span> for{" "}
                  <span className="text-gray-800 font-medium">
                    {s.opportunities?.title}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}