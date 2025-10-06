"use client";

import React, { useMemo, useState } from "react";
import PlanRow from "./plan/PlanRow";
import StatusBadge from "./plan/StatusBadge";
import { useProgress } from "./context/ProgressContext";
import { SWEPhase } from "../types/progress";

const PHASE_ORDER: SWEPhase[] = [
  "problemDefinition",
  "solutionApproach",
  "scope",
  "technical",
  "execution",
];

const PHASE_LABEL: Record<SWEPhase, string> = {
  problemDefinition: "Problem",
  solutionApproach: "Solution",
  scope: "Scope",
  technical: "Technical",
  execution: "Execution",
};

export default function PlanSheet() {
  const { progressState, setCurrentQuestion, updateQuestionProgress } = useProgress();
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "completed" | "skipped">("all");

  const sections = useMemo(() => {
    const result = [] as Array<{
      id: SWEPhase;
      label: string;
      status: string;
      completed: number;
      total: number;
      items: Array<{
        questionId: string;
        status: string;
        confidence?: number;
        templateId?: string;
        estimatedTimeMinutes?: number;
      }>;
    }>;

    for (const phase of PHASE_ORDER) {
      const p = progressState.phases[phase];
      const rows = Object.values(progressState.questions)
        .filter((q) => q.phase === phase)
        .map((q) => ({
          questionId: q.questionId,
          status: q.status,
          confidence: q.confidence,
          templateId: q.templateId,
          estimatedTimeMinutes: q.timeSpent,
        }));

      result.push({
        id: phase,
        label: PHASE_LABEL[phase],
        status: p.status,
        completed: p.completedQuestions,
        total: p.totalQuestions,
        items: rows,
      });
    }

    return result;
  }, [progressState]);

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-4 border-b flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Plan</h2>
          <p className="text-xs text-slate-600">Concise overview of phases and questions</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {(["all", "pending", "active", "completed", "skipped"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-2 py-1 rounded border ${
                filter === key ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y">
        {sections.map((section) => {
          const rows = section.items.filter((row) =>
            filter === "all" ? true : row.status === filter
          );

          const openByDefault = section.status !== "complete"; // expand incomplete phases

          return (
            <details key={section.id} className="p-4" open={openByDefault}>
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-slate-900">
                    {section.label}
                  </div>
                  <StatusBadge status={section.status as any} />
                </div>
                <div className="text-xs text-slate-600">
                  {section.completed}/{section.total} complete
                </div>
              </summary>

              <div className="mt-3 space-y-1">
                {rows.length === 0 ? (
                  <div className="text-xs text-slate-500">No questions</div>
                ) : (
                  rows.map((row) => (
                    <PlanRow
                      key={row.questionId}
                      questionId={row.questionId}
                      status={row.status as any}
                      confidence={row.confidence}
                      templateId={row.templateId}
                      estimatedTimeMinutes={row.estimatedTimeMinutes}
                      onJump={() => setCurrentQuestion(row.questionId)}
                      onSkip={() => updateQuestionProgress(row.questionId, { status: "skipped" })}
                      onComplete={() => updateQuestionProgress(row.questionId, { status: "completed" })}
                    />
                  ))
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
