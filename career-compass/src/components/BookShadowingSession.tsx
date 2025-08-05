import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

type Mentor = {
  name: string;
  bio: string;
  photoUrl?: string;
};

type Props = {
  roleTitle: string;
  company: string;
  mentor?: Mentor;
};

export default function BookShadowingSession({ roleTitle, company, mentor }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [format, setFormat] = useState<"In-person" | "Virtual">("Virtual");
  const [confirmed, setConfirmed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user && !error) {
        setUserEmail(user.email);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmed(true);
    // You could also store the session info to Supabase here
  };

  if (!userEmail) {
    return (
      <div className="p-6 bg-yellow-100 rounded-xl shadow-md text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold text-yellow-800">Please log in to book a session.</h2>
        <p className="mt-4 text-gray-700">You need an account to schedule shadowing sessions.</p>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="p-6 bg-green-100 rounded-xl shadow-md text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold text-green-800">You’ve successfully booked your session!</h2>
        <p className="mt-4 text-gray-700">
          You’re all set to shadow {mentor?.name || "your mentor"} on <strong>{date}</strong> at <strong>{time}</strong> ({format}).
          <br />
          A confirmation has been sent to <strong>{userEmail}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-xl space-y-6">
      <h1 className="text-3xl font-bold text-center">Book a Shadowing Session</h1>

      <div className="text-center text-gray-600">
        <p className="text-lg font-medium">{roleTitle} at {company}</p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium text-gray-700">Date</span>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full border rounded-md px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-gray-700">Time</span>
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 block w-full border rounded-md px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-gray-700">Session Format</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as "In-person" | "Virtual")}
            className="mt-1 block w-full border rounded-md px-3 py-2"
          >
            <option value="In-person">In-person</option>
            <option value="Virtual">Virtual</option>
          </select>
        </label>

        {mentor && (
          <div className="flex items-center gap-4 border rounded-md p-4 bg-gray-50">
            {mentor.photoUrl && (
              <img
                src={mentor.photoUrl}
                alt={mentor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-semibold">{mentor.name}</p>
              <p className="text-sm text-gray-600">{mentor.bio}</p>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
      >
        Confirm
      </button>
    </form>
  );
}