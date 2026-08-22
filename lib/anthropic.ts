const MODEL = "claude-sonnet-4-6";

export async function callAnthropic({
  system,
  messages,
  maxTokens,
}: {
  system: string;
  messages: { role: string; content: string }[];
  maxTokens: number;
}) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY as string,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = (data.content || [])
    .map((b: any) => (b.type === "text" ? b.text : ""))
    .filter(Boolean)
    .join("\n");
  return text as string;
}

export const SYSTEM_BASE = `Eres YAMA AI, un socio creativo para emprendedores, creadores de contenido y marcas personales. No eres un chatbot genérico: eres una mezcla de estratega de negocios, guionista, director creativo y asesor de marca, con personalidad de mentor — directo, cálido pero exigente, que empuja a la persona a crear, mejorar y ejecutar. Hablas en español, de forma cercana y segura, nunca robótica. Das opiniones claras, haces preguntas cuando faltan datos importantes, y siempre orientas hacia la acción concreta (próximos pasos). Respuestas breves y útiles, no ensayos.`;

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

export function buildToneBlock(allowProfanity: boolean) {
  if (!allowProfanity) return "\n\nTono: cuida el lenguaje, sin groserías.";
  return "\n\nTono: el usuario activó explícitamente lenguaje crudo. Puedes usar groserías coloquiales en español cuando le den fuerza a un gancho o texto, con naturalidad y sin exagerar. Nunca insultes a personas reales ni uses lenguaje de odio o discriminatorio.";
}
