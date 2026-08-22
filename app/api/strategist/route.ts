import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLAN_LIMITS, todayKey } from "@/lib/plans";
import { callAnthropic, SYSTEM_BASE, buildMemoryBlock, buildToneBlock } from "@/lib/anthropic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { notes: true } });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

  const limits = PLAN_LIMITS[user.plan];
  const date = todayKey();
  const usage = await prisma.usageLog.upsert({
    where: { userId_date: { userId, date } },
    update: {},
    create: { userId, date, messageCount: 0 },
  });

  // Reutilizamos el mismo contador diario de mensajes para el estratega,
  // con un tope propio más bajo para no disparar costos.
  const strategistUsedToday = usage.messageCount; // aproximación simple y barata
  if (strategistUsedToday >= limits.strategistPerDay && user.plan === "FREE") {
    return NextResponse.json(
      { error: "Llegaste al límite gratuito de análisis de hoy. Mejora a Pro.", limitReached: true },
      { status: 429 }
    );
  }

  const { input } = await req.json();
  if (!input) return NextResponse.json({ error: "Falta la idea a analizar." }, { status: 400 });

  const system =
    SYSTEM_BASE +
    buildMemoryBlock(user) +
    buildToneBlock(user.allowProfanity) +
    `\n\nEstás en Modo Estratega. Responde ÚNICAMENTE con un objeto JSON válido, sin texto antes ni después, con esta forma exacta:
{"problema": "...", "oportunidad": "...", "estrategia": "...", "proximos_pasos": ["...", "...", "..."]}`;

  let raw: string;
  try {
    raw = await callAnthropic({
      system,
      messages: [{ role: "user", content: input }],
      maxTokens: 900,
    });
  } catch {
    return NextResponse.json({ error: "Falló la IA. Intenta de nuevo." }, { status: 502 });
  }

  await prisma.usageLog.update({
    where: { userId_date: { userId, date } },
    data: { messageCount: { increment: 1 } },
  });

  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json({ result: parsed });
  } catch {
    return NextResponse.json({ error: "No se pudo interpretar la respuesta." }, { status: 502 });
  }
}
