import { auth } from "@/lib/auth";
import { generateObject } from "ai";
import { getAIModel } from "@/lib/ai-provider";
import { z } from "zod";
import { AuthError } from "@/lib/errors";

const suggestionSchema = z.array(
  z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    status: z.enum(["NOT_STARTED", "IN_PROGRESS", "DONE"]),
  }),
);

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new AuthError();

    const { prompt, selectedDate, existingTasks } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const provider = process.env.AI_PROVIDER || "deepseek";
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

    console.log("[AI] Provider:", provider);
    console.log("[AI] Model:", model);
    console.log("[AI] API Key exists:", !!apiKey);

    if (!apiKey && provider === "deepseek") {
      throw new Error("DEEPSEEK_API_KEY not configured");
    }

    console.log(
      "[AI] Generating suggestions for prompt:",
      prompt.substring(0, 50) + "...",
    );
    const { object } = await generateObject({
      model: getAIModel(),
      schema: suggestionSchema,
      prompt: `
        You are a smart task planning assistant. 
        Parse this natural language input and generate 1-5 structured task suggestions.
        Today's selected date is ${selectedDate}.
        Existing tasks on this date: ${existingTasks?.length || 0}
        
        If the prompt mentions breaking down or planning something, create multiple sub-tasks.
        If it's a single task, create just one suggestion.
        Resolve relative dates (tomorrow, next Monday, etc.) based on ${selectedDate}.
        
        Input: "${prompt}"
        
        Return an array of task suggestions with:
        - title: concise task title
        - description: brief description or action items
        - date: YYYY-MM-DD format
        - status: NOT_STARTED, IN_PROGRESS, or DONE
      `,
    });

    console.log("[AI] Success, generated", object.length, "suggestions");
    return Response.json({ suggestions: object });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate suggestions";
    console.error("[AI] Error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
