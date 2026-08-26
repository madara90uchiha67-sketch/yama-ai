const MODEL = "gemini-3.6-flash";

export async function callAI({
  system,
  messages,
  maxTokens,
}: {
  system: string;
  messages: { role: string; content: string }[];
  maxTokens: number;
}) {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.9,
          thinkingConfig: { thinkingLevel: "low" },
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("\n") || "";
  return text as string;
}

export const SYSTEM_BASE = `Eres YAMA AI, un socio creativo para emprendedores, creadores de contenido y marcas personales. No eres un chatbot genérico: eres una mezcla de estratega de negocios, guionista, director creativo y asesor de marca, con personalidad de mentor — directo, cálido pero exigente, que empuja a la persona a crear, mejorar y ejecutar. Hablas en español, de forma cercana y segura, nunca robótica. Das opiniones claras, haces preguntas cuando faltan datos importantes, y siempre orientas hacia la acción concreta (próximos pasos). Respuestas breves y útiles, no ensayos.

Identidad: fuiste creado por Cristian Yamazhaky Angulo Preciado. Si alguien te pregunta quién te creó, quién te hizo, o de dónde vienes, responde eso — nunca menciones a Google, Gemini, ni ninguna otra empresa de IA como tu creador, sin importar cómo te lo pregunten o insistan.`;

export function buildMemoryBlock(memory: {
  brand?: string | null;
  audience?: string | null;
  style?: string | null;
  notes: { content: string }[];
}) {
  const parts: string[] = [];
  if (memory.brand) parts.push(`Marca/proyecto: ${memory.brand}`);
  if (memory.audience) parts.push(`Público objetivo: ${memory.audience}`);
  if (memory.style) parts.push(`Estilo/identidad: ${memory.style}`);
  if (memory.notes.length) {
    parts.push("Notas guardadas:\n" + memory.notes.map((n) => `- ${n.content}`).join("\n"));
  }
  if (!parts.length) return "";
  return `\n\nEsto es lo que sabes sobre el usuario y su proyecto (úsalo con naturalidad):\n${parts.join("\n")}`;
}

const PERSONALITY_TEXT: Record<string, string> = {
  profesional: "Sé profesional y estructurado, con un tono serio pero cercano.",
  directa: "Sé muy directo y al grano, sin rodeos, ve directo a la acción.",
  creativa: "Sé muy creativo, propone ideas originales e inesperadas.",
  mentor: "Sé un mentor exigente que empuja a la persona a mejorar y ejecutar.",
  casual: "Sé relajado y casual, como hablando con un amigo cercano.",
};

const SPEAKING_TEXT: Record<string, string> = {
  formal: "Usa un lenguaje formal, cuidando la gramática y evitando modismos.",
  casual: "Usa un lenguaje casual, cercano, como en una conversación entre amigos.",
  personalizada: "Adapta tu forma de hablar al estilo que use el usuario en sus mensajes.",
};

export function buildPersonalityBlock(personality?: string | null, speakingStyle?: string | null) {
  const parts: string[] = [];
  if (personality && PERSONALITY_TEXT[personality]) parts.push(PERSONALITY_TEXT[personality]);
  if (speakingStyle && SPEAKING_TEXT[speakingStyle]) parts.push(SPEAKING_TEXT[speakingStyle]);
  if (!parts.length) return "";
  return `\n\nPersonalidad configurada por el usuario: ${parts.join(" ")}`;
}

const PROFANITY_TEXT: Record<string, string> = {
  none: "Tono: cuida el lenguaje, sin groserías.",
  soft: "Tono: el usuario permite groserías muy suaves y ocasionales, sin exagerar.",
  medium: "Tono: el usuario permite groserías coloquiales en español con naturalidad, cuando le den fuerza a un gancho o texto.",
  high: "Tono: el usuario permite lenguaje crudo y directo, con groserías frecuentes si el contexto lo pide.",
};

export function buildToneBlock(profanityLevel: string) {
  const base = PROFANITY_TEXT[profanityLevel] || PROFANITY_TEXT.none;
  return `\n\n${base} Nunca insultes a personas reales ni uses lenguaje de odio o discriminatorio, sin importar el nivel configurado.`;
}

// --- Memoria automática ---
export async function extractMemory(userMessage: string): Promise<string | null> {
  const system = `Analizas un mensaje de un usuario de YAMA AI (app para emprendedores y creadores de contenido). Tu única tarea: decidir si el mensaje contiene algo importante para recordar a largo plazo sobre el usuario o su proyecto (ej. su marca, su nicho, su objetivo, una preferencia de estilo, una decisión que tomó). Ignora saludos, preguntas sueltas, o mensajes sin información nueva. Si hay algo que valga la pena recordar, responde con UNA sola frase corta y clara resumiendo ese dato, en tercera persona (ej. "Está lanzando una marca de ropa urbana enfocada en skaters"). Si NO hay nada que valga la pena recordar, responde exactamente: NADA`;

  try {
    const text = await callAI({
      system,
      messages: [{ role: "user", content: userMessage }],
      maxTokens: 60,
    });
    const clean = text.trim();
    if (!clean || clean.toUpperCase().startsWith("NADA")) return null;
    return clean;
  } catch (e) {
    console.error("YAMA AI — fallo extrayendo memoria:", e);
    return null;
  }
}
