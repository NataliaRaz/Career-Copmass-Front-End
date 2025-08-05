import React, { useState } from "react";
import { useParams } from "react-router-dom";

export default function ShadowSessionDetailPage() {
  //const { roleId } = useParams(); // from URL like /shadow/:roleId
  const [confirmed, setConfirmed] = useState(false);

  // Static mock session info (you can load this dynamically from Supabase later)
  const session = {
    role: "Data Analyst",
    format: "Virtual",
    duration: "1 hour",
    date: "August 5, 2025",
    mentor: {
      name: "Jamie L.",
      title: "Senior Analyst",
    },
  };

  const handleConfirm = () => {
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-green-100 rounded-xl text-center">
        <h2 className="text-2xl font-semibold text-green-800 mb-4">
          You’ve successfully booked your session!
        </h2>
        <p className="text-gray-700">
          You’ll shadow {session.mentor.name} on {session.date}.
          <br /> Check your email for details.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow space-y-4">
      <h1 className="text-2xl font-bold">Shadow a {session.role}</h1>

      <div className="text-gray-700 space-y-2">
        <p>📍 <strong>Format:</strong> {session.format}</p>
        <p>🕒 <strong>Duration:</strong> {session.duration}</p>
        <p>🗓️ <strong>Next available:</strong> {session.date}</p>
        <p>👤 <strong>Hosted by:</strong> {session.mentor.name}, {session.mentor.title}</p>
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