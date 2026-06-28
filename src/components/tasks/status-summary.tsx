import { TaskStatus } from "@prisma/client";

interface Task {
  status: TaskStatus;
}

const STATUS_META = {
  NOT_STARTED: { label: "Not Started", color: "bg-zinc-400" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-500" },
  DONE: { label: "Done", color: "bg-green-500" },
};

export default function StatusSummary({ tasks }: { tasks: Task[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.keys(STATUS_META) as TaskStatus[]).map((status) => {
        const meta = STATUS_META[status as keyof typeof STATUS_META];
        const count = tasks.filter((t) => t.status === status).length;
        return (
          <div
            key={status}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] px-3 py-3"
          >
            <p className="font-display text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {count}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-mono uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {meta.label}
            </p>
            <div className={`mt-1.5 h-0.5 w-6 rounded-full ${meta.color}`} />
          </div>
        );
      })}
    </div>
  );
}
