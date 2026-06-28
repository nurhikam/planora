import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  CircleDashed,
  Sun,
  ListTodo,
  Circle,
  Pencil,
  Trash2,
  Clock,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900/30 dark:selection:text-blue-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-white shadow-sm">
            <span className="text-sm font-bold leading-none tracking-tight">
              P
            </span>
          </div>
          <span className="font-semibold text-sm tracking-tight hidden sm:inline-block">
            Planora
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center max-w-md mx-4">
          <div className="relative w-full max-w-[320px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="h-9 w-full bg-zinc-100 dark:bg-zinc-900 border-transparent shadow-none pl-9 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:bg-white dark:focus-visible:bg-zinc-950 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            <Sun className="h-4 w-4" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="relative h-8 w-8 rounded-full cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="@johndoe" />
                  <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-xs">
                    JD
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-zinc-500">
                    john@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto items-start">
        {/* Left Sidebar (25% width on large screens) */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-[#0A0A0A]/50 px-4 py-6 flex flex-col gap-8">
          <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium text-sm h-9">
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Calendar
            </h3>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] p-2 shadow-sm">
              <Calendar
                mode="single"
                selected={new Date()}
                className="pointer-events-none" // Just for visual in mockup
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Overview
            </h3>
            <nav className="flex flex-col space-y-1">
              <Button
                variant="ghost"
                className="justify-start h-8 px-2 w-full text-sm font-medium"
              >
                <ListTodo className="mr-2 h-4 w-4 text-zinc-500" />
                All Tasks
                <span className="ml-auto text-xs text-zinc-500">12</span>
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-8 px-2 w-full text-sm font-normal text-zinc-600 dark:text-zinc-400"
              >
                <Circle className="mr-2 h-4 w-4 text-zinc-400" />
                Not Started
                <span className="ml-auto text-xs text-zinc-400">4</span>
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-8 px-2 w-full text-sm font-normal text-zinc-600 dark:text-zinc-400"
              >
                <CircleDashed className="mr-2 h-4 w-4 text-blue-500" />
                In Progress
                <span className="ml-auto text-xs text-zinc-400">3</span>
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-8 px-2 w-full text-sm font-normal text-zinc-600 dark:text-zinc-400"
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Completed
                <span className="ml-auto text-xs text-zinc-400">5</span>
              </Button>
            </nav>
          </div>
        </aside>

        {/* Right Content Area (75% width) */}
        <main className="flex-1 min-w-0 px-4 py-8 md:px-8 lg:px-12 w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                June 29, 2026
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Monday · 4 active tasks
              </p>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-2">
            {/* Task Card 1 (In Progress) */}
            <div className="group relative flex items-start gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] p-4 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md">
              <div className="mt-1 flex-shrink-0">
                <Checkbox className="h-5 w-5 rounded-full border-zinc-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    Implement AI Daily Summary feature
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 font-normal text-xs px-2 py-0 h-5"
                  >
                    In Progress
                  </Badge>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  Integrate Vercel AI SDK with Gemini 2.0 to generate a concise
                  summary of tasks for the selected date. Ensure streaming
                  response is handled gracefully.
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center text-xs text-zinc-500">
                    <Clock className="mr-1 h-3.5 w-3.5 text-zinc-400" />
                    Due today at 5:00 PM
                  </div>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-red-600 dark:hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Task Card 2 (Not Started) */}
            <div className="group relative flex items-start gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] p-4 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md">
              <div className="mt-1 flex-shrink-0">
                <Checkbox className="h-5 w-5 rounded-full border-zinc-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    Write Architecture.md documentation
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 font-normal text-xs px-2 py-0 h-5"
                  >
                    Not Started
                  </Badge>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  Document the layered architecture, sequence flows for auth,
                  and design tradeoffs for the SQLite vs PostgreSQL decision.
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center text-xs text-zinc-500">
                    <CalendarIcon className="mr-1 h-3.5 w-3.5 text-zinc-400" />
                    Tomorrow
                  </div>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-red-600 dark:hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Task Card 3 (Completed) */}
            <div className="group relative flex items-start gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0C0C0C] p-4 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md opacity-60">
              <div className="mt-1 flex-shrink-0">
                <Checkbox
                  checked
                  className="h-5 w-5 rounded-full border-green-500 bg-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medium text-zinc-500 line-through truncate">
                    Initial Next.js setup & shadcn/ui installation
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200/50 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 font-normal text-xs px-2 py-0 h-5"
                  >
                    Done
                  </Badge>
                </div>
                <p className="text-sm text-zinc-400 mt-1 line-clamp-1">
                  Bootstrap the project with Tailwind, TypeScript, and install
                  base UI components.
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-red-600 dark:hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
