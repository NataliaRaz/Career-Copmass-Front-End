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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        navigate("/profile"); // redirect to login
        return;
      }

      const userId = userData.user.id;

      // Get user role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (profileError || profile?.role !== "host") {
        navigate("/"); // Not authorized
        return;
      }

      setIsHost(true);

      // Fetch host's opportunities
      const { data: opps, error: oppsError } = await supabase
        .from("opportunities")
        .select("*")
        .eq("host_id", userId)
        .order("created_at", { ascending: false });

      // Fetch upcoming shadow sessions related to this host’s opportunities
      const { data: sess, error: sessError } = await supabase
        .from("shadow_sessions")
        .select(`
          id,
          date_time,
          mentee_id,
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

  if (loading) return <p>Loading dashboard...</p>;
  if (!isHost) return null;

  return (
    <div className="page">
      <h2>👋 Welcome, Host</h2>

      <button onClick={handlePost} className="button">
        ➕ Post New Opportunity
      </button>

      <div className="dashboard-section">
        <h3>📋 Posted Opportunities</h3>
        {opportunities.length === 0 ? (
          <p>No opportunities posted yet.</p>
        ) : (
          <ul>
            {opportunities.map((opp) => (
              <li key={opp.id}>
                <strong>{opp.title}</strong> — {opp.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dashboard-section">
        <h3>📅 Upcoming Shadow Sessions</h3>
        {sessions.length === 0 ? (
          <p>No upcoming sessions yet.</p>
        ) : (
          <ul>
            {sessions.map((s) => (
              <li key={s.id}>
                <span>{new Date(s.date_time).toLocaleString()}</span> — Mentee ID:{" "}
                <strong>{s.mentee_id}</strong> for{" "}
                <strong>{s.opportunities?.title}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}