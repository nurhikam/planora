import { CalendarDays } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0D1117] p-10 text-[#E6E6E6] md:flex">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.2), transparent 40%), radial-gradient(circle at 80% 70%, rgba(147,51,234,0.15), transparent 45%)",
          }}
        />
        <div className="relative z-10 flex items-center gap-2">
          <img src="/planora_logo.png" alt="Planora" className="h-8 w-auto" />
        </div>

        <div className="relative z-10">
          <CalendarDays size={28} className="mb-5 text-blue-500" />
          <p className="font-display text-2xl font-semibold leading-snug tracking-tight">
            Your day, mapped before it starts.
          </p>
          <p className="mt-3 max-w-sm text-sm text-[#8B949E]">
            Pick a date, drop in what needs doing, and watch the calendar fill
            in with where every task actually stands.
          </p>
        </div>

        <div className="relative z-10 flex gap-6 font-mono text-[11px] text-[#8B949E]">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#8B949E]" /> Not Started
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-blue-400" /> In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-green-500" /> Done
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A] px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
