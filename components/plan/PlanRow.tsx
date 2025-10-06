"use client";

import React from "react";
import StatusBadge from "./StatusBadge";

interface PlanRowProps {
  questionId: string;
  status: "skipped" | "pending" | "active" | "completed" | "complete";
  confidence?: number;
  templateId?: string;
  estimatedTimeMinutes?: number;
  onJump: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export default function PlanRow({
  questionId,
  status,
  confidence,
  templateId,
  estimatedTimeMinutes,
  onJump,
  onSkip,
  onComplete,
}: PlanRowProps) {
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-slate-50 rounded-md">
      <div className="flex items-center gap-3 min-w-0">
        <StatusBadge status={status === "completed" ? "completed" : (status as any)} />
        <div className="text-sm text-slate-900 truncate">
          {questionId}
          {templateId && (
            <span className="ml-2 text-xs text-slate-500">({templateId})</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-600">
        {typeof confidence === "number" && (
          <span title="confidence">{Math.round(confidence * 100)}%</span>
        )}
        {typeof estimatedTimeMinutes === "number" && estimatedTimeMinutes > 0 && (
          <span title="ETA">~{estimatedTimeMinutes}m</span>
        )}
        <div className="flex items-center gap-2">
          <button onClick={onJump} className="px-2 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700">
            Open
          </button>
          <button onClick={onSkip} className="px-2 py-1 rounded bg-slate-200 text-slate-800 text-xs hover:bg-slate-300">
            Skip
          </button>
          {status !== "completed" && (
            <button onClick={onComplete} className="px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
