// services/groq.ts
import { Groq } from "groq-sdk";

function getGroqClient(): Groq {
  const token = process.env.GROQ_TOKEN;
  if (!token) throw new Error("No Groq token found");
  return new Groq({ apiKey: token });
}

export async function summarizeRepo(
  content: string,
  question?: string
): Promise<string | null> {
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: question
          ? `Repo Context: ${content}\n\n Prompt: ${question} \n\nNB: - Answer based on the repo context only. \n\n- If you do not know, just say so in a polite way. \n\n- Your response format should be in plain text, not markdown or markdown related content. just plain text.`
          : `Summarize this GitHub repo in 3-5 sentences:\n\n${content}`,
      },
    ],
    model: "openai/gpt-oss-20b",
    temperature: 0.7,
    max_completion_tokens: 500,
    top_p: 1,
    reasoning_effort: "medium",
    stream: false,
  });

  return completion.choices[0].message.content;
}
