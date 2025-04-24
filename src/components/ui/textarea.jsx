import React from "react";

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`p-2 border rounded w-full ${className}`}
      {...props}
    />
  );
}
