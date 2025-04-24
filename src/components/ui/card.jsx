import React from "react";

export function Card({ children }) {
  return <div className="border rounded-xl shadow bg-white">{children}</div>;
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
