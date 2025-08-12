import React from "react";

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
    <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100 rounded-bl-full" />
    {children}
  </div>
);

export default Card;