"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  status: string;
}

interface AISuggestion {
  title: string;
  description: string;
  date: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "DONE";
}

const PROMPTS = [
  "Break down: prep BNI BRD review",
  "Plan my week",
  "Draft mentoring session agenda",
];

export function AIAssistant({
  selectedDate,
  tasks,
  onAddTask,
}: {
  selectedDate: string;
  tasks: Task[];
  onAddTask: (suggestion: AISuggestion) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [appliedIdx, setAppliedIdx] = useState<number[]>([]);

  async function run(p: string) {
    if (!p.trim() || loading) return;
    setLoading(true);
    setSuggestions([]);
    setAppliedIdx([]);

    try {
      const res = await fetch("/api/ai/generate-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: p,
          selectedDate,
          existingTasks: tasks,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate suggestions");

      const result = await res.json();
      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error("AI error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          <Sparkles size={14} />
        </div>
        <div>
          <h2 className="text-sm font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
            AI Assistant
          </h2>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Turns a prompt into draft tasks — review before saving
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(prompt);
        }}
        className="flex gap-2"
      >
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI to plan or break down a task…"
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          Generate
        </button>
      </form>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setPrompt(p);
              run(p);
            }}
            className="rounded-full border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 font-mono text-[11px] text-zinc-500 dark:text-zinc-400 transition hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {p}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Loader2 size={13} className="animate-spin" />
          Thinking through your prompt…
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2 animate-in fade-in">
          {suggestions.map((s, i) => {
            const applied = appliedIdx.includes(i);
            return (
              <li
                key={i}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100 truncate">
                      {s.title}
                    </p>
                    {s.description && (
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {s.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`font-medium text-xs px-2 py-0.5 h-5 ${
                          s.status === "DONE"
                            ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                            : s.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {s.status === "DONE"
                          ? "Done"
                          : s.status === "IN_PROGRESS"
                            ? "In Progress"
                            : "Not Started"}
                      </Badge>
                      <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                        {s.date}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onAddTask(s);
                      setAppliedIdx((a) => [...a, i]);
                    }}
                    disabled={applied}
                    className="flex shrink-0 items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-700 px-2 py-1.5 text-xs font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {applied ? <Check size={13} /> : null}
                    {applied ? "Added" : "Add"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
