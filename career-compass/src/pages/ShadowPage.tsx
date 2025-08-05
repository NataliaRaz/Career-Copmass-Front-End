import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";


interface Mentor {
  id: string;
  name: string;
  photo_url: string;
}

export default function ShadowPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);

  useEffect(() => {
    async function fetchMentors() {
      const { data, error } = await supabase.from("mentors").select("*");
      if (error) console.error("Error fetching mentors", error);
      else setMentors(data as Mentor[]);
    }

    fetchMentors();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Find a Mentor to Shadow</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {mentors.map((mentor) => (
          <Link
            to={`/mentor/${mentor.id}`}
            key={mentor.id}
            className="border rounded-xl p-4 hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <img
                src={mentor.photo_url}
                alt={mentor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold">{mentor.name}</h2>
                <p className="text-sm text-gray-600">View Profile →</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}