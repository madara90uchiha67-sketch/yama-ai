import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLAN_LIMITS, todayKey } from "@/lib/plans";
import { callAI, SYSTEM_BASE, buildMemoryBlock, buildToneBlock, extractMemory } from "@/lib/ai";

const MODE_LABEL: Record<string, string> = {
  idea: "Pensar una idea",
  story: "Crear una historia",
  content: "Crear contenido",
  free: "Chat con YAMA",
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { notes: true },
  });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

  // --- Control de uso diario (evita costos descontrolados) ---
  const limits = PLAN_LIMITS[user.plan];
  const date = todayKey();
  const usage = await prisma.usageLog.upsert({
    where: { userId_date: { userId, date } },
    update: {},
    create: { userId, date, messageCount: 0 },
  });

  if (usage.messageCount >= limits.messagesPerDay) {
    return NextResponse.json(
      {
        error:
          user.plan === "FREE"
            ? "Llegaste al límite gratuito de mensajes de hoy. Mejora a Pro para seguir sin límites."
            : "Llegaste al límite diario de tu plan Pro.",
        limitReached: true,
      },
      { status: 429 }
    );
  }

  const { conversationId, mode, content } = await req.json();
  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Falta el mensaje." }, { status: 400 });
  }

  // Recupera o crea la conversación
  let conversation = conversationId
    ? await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      })
    : null;

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { userId, mode: mode || "free" },
      include: { messages: true },
    });
  }

  const history = conversation.messages.map((m) => ({ role: m.role, content: m.content }));
  const nextMessages = [...history, { role: "user", content }];

  const system =
    SYSTEM_BASE +
    `\n\nModo actual: ${MODE_LABEL[mode] || "Chat libre"}` +
    buildMemoryBlock(user) +
    buildToneBlock(user.allowProfanity);

  let reply: string;
  try {
    reply = await callAI({
      system,
      messages: nextMessages,
      maxTokens: limits.maxTokensPerReply,
    });
  } catch (e) {
    console.error("YAMA AI /api/chat — fallo llamando a Gemini:", e);
    return NextResponse.json(
      { error: "Falló la IA. Intenta de nuevo.", debug: String(e) },
      { status: 502 }
    );
  }

  await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: conversation.id, role: "user", content },
    }),
    prisma.message.create({
      data: { conversationId: conversation.id, role: "assistant", content: reply },
    }),
    prisma.usageLog.update({
      where: { userId_date: { userId, date } },
      data: { messageCount: { increment: 1 } },
    }),
  ]);

  // --- Memoria automática (no cuenta como "mensaje" del plan) ---
  // Se hace después de responder al usuario, para no retrasar el chat.
  // Si falla, no afecta la respuesta que ya se envió.
  extractMemory(content)
    .then((fact) => {
      if (fact) {
        return prisma.memoryNote.create({
          data: { userId, content: fact },
        });
      }
    })
    .catch((e) => console.error("YAMA AI — fallo guardando memoria automática:", e));

  return NextResponse.json({
    reply,
    conversationId: conversation.id,
    remaining: limits.messagesPerDay - usage.messageCount - 1,
  });
}
