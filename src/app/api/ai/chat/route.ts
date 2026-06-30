import { auth } from "@/lib/auth";
import { streamText } from "ai";
import { getAIModel } from "@/lib/ai-provider";
import { AuthError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new AuthError();

    const { messages, selectedDate } = await request.json();
    const lastMessage = messages[messages.length - 1]?.content;

    if (!lastMessage || typeof lastMessage !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const provider = process.env.AI_PROVIDER || "deepseek";
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey && provider === "deepseek") {
      throw new Error("DEEPSEEK_API_KEY not configured");
    }

    // Get user's tasks for context
    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
      take: 50,
    });

    const systemPrompt = `You are Planora AI, a helpful task management assistant with DIRECT ACTION capabilities.

CURRENT CONTEXT:
- User: ${session.user.name} (${session.user.email})
- Selected Date: ${selectedDate}
- User's Tasks (${tasks.length} total): ${JSON.stringify(tasks.slice(0, 20))}

YOUR CAPABILITIES:
1. CREATE TASKS - When user wants to add/create/schedule something
2. QUERY TASKS - When user asks about their schedule, what they have, upcoming tasks
3. UPDATE TASKS - When user wants to mark done, change status, reschedule
4. DELETE TASKS - When user wants to remove/cancel tasks

ACTION FORMAT:
To perform actions, respond with this format EXACTLY:
<ACTION type="CREATE|QUERY|UPDATE|DELETE" data='{"title":"...","date":"...","status":"..."}'>
Brief confirmation message to user
</ACTION>

EXAMPLES:

User: "Add meeting with Budi tomorrow 3pm"
Assistant: <ACTION type="CREATE" data='{"title":"Meeting with Budi","description":"3pm meeting","date":"2026-06-30","status":"NOT_STARTED"}'>
I've added "Meeting with Budi" to your calendar for June 30 at 3pm.
</ACTION>

User: "What do I have tomorrow?"
Assistant: <ACTION type="QUERY" data='{"date":"2026-06-30"}'>
Tomorrow you have 3 tasks:
• Meeting with Budi (3pm) - Not Started
• Project review - In Progress  
• Gym session - Not Started
</ACTION>

User: "Mark all today's tasks as done"
Assistant: <ACTION type="UPDATE" data='{"date":"2026-06-29","status":"DONE"}'>
I've marked all 5 tasks for today as completed. Great job! 🎉
</ACTION>

User: "Delete the meeting with Budi"
Assistant: <ACTION type="DELETE" data='{"titleContains":"Meeting with Budi"}'>
I've removed "Meeting with Budi" from your calendar.
</ACTION>

IMPORTANT RULES:
- ALWAYS use <ACTION> tags when performing any task operation
- Keep responses concise and friendly
- Use emojis sparingly but appropriately
- For queries, summarize the results clearly
- If unsure, ask for clarification before taking action
- Parse relative dates based on selected date: ${selectedDate}
`;

    const result = streamText({
      model: getAIModel(),
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process chat";
    console.error("[AI Chat] Error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
