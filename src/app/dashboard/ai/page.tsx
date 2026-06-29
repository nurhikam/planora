"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Check,
  Brain,
  Lightbulb,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useSWR from "swr";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "DONE";
}

interface AISuggestion {
  title: string;
  description: string;
  date: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "DONE";
}

const PROMPTS = [
  "Break down: prepare project documentation",
  "Plan my week",
  "Draft meeting agenda",
  "Help me prioritize my tasks",
  "Create a study plan for next month",
];

export default function AIAssistantPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [appliedIdx, setAppliedIdx] = useState<number[]>([]);

  const { data: tasksData } = useSWR("/api/tasks", fetcher);
  const tasks = (tasksData?.items || []) as Task[];

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
          selectedDate: new Date().toISOString(),
          existingTasks: tasks,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate suggestions");

      const result = await res.json();
      setSuggestions(result.suggestions || []);
      toast.success("AI suggestions generated!");
    } catch (error) {
      console.error("AI error:", error);
      toast.error(
        "Failed to generate suggestions. Make sure DEEPSEEK_API_KEY is configured.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function addSuggestion(suggestion: AISuggestion, index: number) {
    try {
      const res = await fetch(`/api/tasks?date=${suggestion.date}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: suggestion.title,
          description: suggestion.description,
          date: suggestion.date,
          status: suggestion.status,
        }),
      });

      if (!res.ok) throw new Error("Failed to add task");

      setAppliedIdx((prev) => [...prev, index]);
      toast.success("Task added to your calendar!");
    } catch {
      toast.error("Failed to add task");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-blue-500" size={24} />
          AI Assistant
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Let AI help you plan, organize, and prioritize your tasks
        </p>
      </div>

      {/* Main Input */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] p-5 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(prompt);
          }}
          className="space-y-3"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <Brain size={18} />
            </div>
            <div className="flex-1">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you need help with... (e.g., 'I have a big presentation next week, help me break it down into manageable tasks')"
                className="w-full min-h-[100px] rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              AI will analyze your request and suggest actionable tasks
            </p>
            <Button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Quick Prompts */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <Lightbulb size={14} />
          Quick Prompts
        </h3>
        <div className="flex flex-wrap gap-2">
          {PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setPrompt(p);
                run(p);
              }}
              className="rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 font-mono text-xs text-zinc-600 dark:text-zinc-400 transition hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-8 text-center">
          <Loader2
            size={32}
            className="mx-auto mb-3 text-blue-500 animate-spin"
          />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            AI is analyzing your request and generating suggestions...
          </p>
        </div>
      )}

      {/* Suggestions */}
      {!loading && suggestions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Target size={14} />
            Suggested Tasks
          </h3>
          <div className="grid gap-3">
            {suggestions.map((s, i) => {
              const applied = appliedIdx.includes(i);
              return (
                <div
                  key={i}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {s.title}
                      </p>
                      {s.description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {s.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs px-2 py-0.5 h-6 ${
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
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          📅 {s.date}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => addSuggestion(s, i)}
                      disabled={applied}
                      variant={applied ? "secondary" : "default"}
                      size="sm"
                      className={
                        applied
                          ? ""
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }
                    >
                      {applied ? (
                        <>
                          <Check size={16} className="mr-1" />
                          Added
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} className="mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && suggestions.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <Sparkles className="text-blue-500" size={32} />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Ready to boost your productivity?
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
            Enter a prompt above or click a quick prompt to get AI-powered task
            suggestions tailored to your needs.
          </p>
        </div>
      )}
    </div>
  );
}
