import { generateObject, streamText } from "ai";
import { getAIModel } from "@/lib/ai-provider";
import { aiParseTaskSchema } from "@/lib/validations";

export const aiService = {
  async parseTask(input: string) {
    const today = new Date().toISOString().split("T")[0];
    const { object } = await generateObject({
      model: getAIModel(),
      schema: aiParseTaskSchema,
      prompt: `
        Parse this natural language input into a structured task.
        Today's date is ${today}.
        Resolve relative dates (tomorrow, next Monday, etc).
        Input: "${input}"
      `,
    });
    return object;
  },

  async summarizeTasks(tasks: { title: string; status: string; date: Date }[], date: string) {
    const result = streamText({
      model: getAIModel(),
      prompt: `
        You are a productivity assistant. Summarize the following tasks for ${date}.
        Be concise and actionable. Include counts by status and a suggestion.

        Tasks:
        ${tasks.map((t) => `- ${t.title} (${t.status})`).join("\n")}
      `,
    });

    return result.textStream;
  },
};
