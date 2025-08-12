import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

interface Session {
  id: number;
  date: string;
  time: string;
  location: string;
}

interface Mentor {
  id: string;
  name: string;
  photo_url: string;
  bio: string;
  specialties: string[];
  sessions: Session[];
}

export default function MentorProfilePage() {
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState<Mentor | null>(null);

  useEffect(() => {
    async function fetchMentor() {
      const { data, error } = await supabase
        .from("mentors")
        .select("*, sessions(*)")
        .eq("id", mentorId)
        .single();

      if (error) console.error("Error fetching mentor:", error);
      else setMentor(data as Mentor);
    }

    fetchMentor();
  }, [mentorId]);

  if (!mentor) return <p>Loading mentor...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <img
          src={mentor.photo_url}
          alt={mentor.name}
          className="w-40 h-40 rounded-full object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">{mentor.name}</h1>
          <p className="text-gray-700 mb-4">{mentor.bio}</p>
          <div className="mb-2">
            <h2 className="font-semibold">Specialties:</h2>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {mentor.specialties.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Available Shadowing Sessions</h2>
        {mentor.sessions.length === 0 ? (
          <p>No sessions available right now.</p>
        ) : (
          <div className="space-y-4">
            {mentor.sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {new Date(session.date).toLocaleDateString()} — {session.time}
                    </p>
                    <p className="text-sm text-gray-600">{session.location}</p>
                  </div>
                  <Button onClick={() => console.log("Book", session.id)}>
                    Book
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
