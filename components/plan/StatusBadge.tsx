"use client";

import React from "react";

type Status = "pending" | "active" | "completed" | "skipped" | "complete";

interface StatusBadgeProps {
  status: Status;
}

const colorMap: Record<Status, string> = {
  pending: "bg-gray-100 text-gray-700",
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  skipped: "bg-slate-100 text-slate-600",
  complete: "bg-green-100 text-green-700",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[status]}`}>
      {status}
    </span>
  );
}
