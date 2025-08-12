import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function PostOpportunityPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mentorName, setMentorName] = useState("");
  const [mentorTitle, setMentorTitle] = useState("");
  const [format, setFormat] = useState("Virtual"); // default
  const [duration, setDuration] = useState("1 hour"); // default
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  // Treat "/opportunities/new" as create mode
  const isEdit = !!id && id !== "new";
  const oppId = isEdit ? Number(id) : null;

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!isEdit || oppId == null || Number.isNaN(oppId)) return;

      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("id", oppId)
        .single();

      if (error) {
        console.error("Error fetching opportunity:", error.message);
        return;
      }

      setTitle(data.title || "");
      setDescription(data.description || "");
      setMentorName(data.mentor_name || "");
      setMentorTitle(data.mentor_title || "");
      setFormat(data.format || "Virtual");
      setDuration(data.duration || "1 hour");
      setDate(data.date || "");
      setLocation(data.location || "");
      setRequirements(data.requirements || "");
    };

    void fetchOpportunity();
  }, [isEdit, oppId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("You must be logged in.");
      setLoading(false);
      return;
    }

    const opportunityData = {
      title,
      description,
      mentor_name: mentorName,
      mentor_title: mentorTitle,
      format,
      duration,
      date,
      location,
      requirements,
      user_id: user.id, // <-- using user_id everywhere
    };

    let error;
    if (isEdit && oppId != null && !Number.isNaN(oppId)) {
      ({ error } = await supabase
        .from("opportunities")
        .update(opportunityData)
        .eq("id", oppId)
        .eq("user_id", user.id)); // make sure only the owner can update
    } else {
      ({ error } = await supabase.from("opportunities").insert(opportunityData));
    }

    if (error) {
      console.error("Error saving opportunity:", error);
      alert("Error saving opportunity: " + (error.message || "Unknown error"));
    } else {
      alert(`Opportunity ${isEdit ? "updated" : "posted"}!`);
      navigate("/profile");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">
        {isEdit ? "Edit Opportunity" : "Post New Opportunity"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          Title:
          <input
            required
            className="w-full border px-3 py-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="block">
          Description:
          <textarea
            required
            className="w-full border px-3 py-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label className="block">
          Mentor Name:
          <input
            className="w-full border px-3 py-2 rounded"
            value={mentorName}
            onChange={(e) => setMentorName(e.target.value)}
          />
        </label>

        <label className="block">
          Mentor Title:
          <input
            className="w-full border px-3 py-2 rounded"
            value={mentorTitle}
            onChange={(e) => setMentorTitle(e.target.value)}
          />
        </label>

        <label className="block">
          Format:
          <select
            className="w-full border px-3 py-2 rounded"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="Virtual">Virtual</option>
            <option value="In-person">In-person</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </label>

        <label className="block">
          Duration:
          <select
            className="w-full border px-3 py-2 rounded"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="30 minutes">30 minutes</option>
            <option value="1 hour">1 hour</option>
            <option value="1.5 hours">1.5 hours</option>
            <option value="2 hours">2 hours</option>
            <option value="Half-day">Half-day</option>
            <option value="Full-day">Full-day</option>
          </select>
        </label>

        <label className="block">
          Next Available Date:
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label className="block">
          Location:
          <input
            className="w-full border px-3 py-2 rounded"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>

        <label className="block">
          Requirements:
          <textarea
            className="w-full border px-3 py-2 rounded"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 transition disabled:opacity-50"
        >
          {loading ? (isEdit ? "Updating..." : "Posting...") : isEdit ? "Update Opportunity" : "Post Opportunity"}
        </button>
      </form>
    </div>
  );
}
