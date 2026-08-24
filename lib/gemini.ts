import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const SYSTEM_BASE = `
Eres YAMA, un asistente de inteligencia artificial.
Ayudas al usuario con ideas, creatividad, aprendizaje y resolución de problemas.
`;

export async function callGemini({
  system,
  messages,
  maxTokens,
}: {
  system: string;
  messages: { role: string; content: string }[];
  maxTokens: number;
}) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: system,
  });

  const chat = model.startChat({
    history: messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  });

  const lastMessage = messages[messages.length - 1].content;

  const result = await chat.sendMessage(lastMessage);

  return result.response.text();
}
