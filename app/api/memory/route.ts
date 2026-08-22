import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/plans";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { notes: { orderBy: { createdAt: "asc" } } },
  });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

  return NextResponse.json({
    brand: user.brand,
    audience: user.audience,
    style: user.style,
    allowProfanity: user.allowProfanity,
    plan: user.plan,
    notes: user.notes.map((n) => ({ id: n.id, content: n.content })),
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json();
  const { brand, audience, style, allowProfanity, addNote, removeNoteId } = body;

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { notes: true } });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

  const limits = PLAN_LIMITS[user.plan];

  if (addNote) {
    if (user.notes.length >= limits.memoryNotesLimit) {
      return NextResponse.json(
        { error: "Llegaste al límite de notas guardadas de tu plan. Mejora a Pro para más memoria." },
        { status: 429 }
      );
    }
    await prisma.memoryNote.create({ data: { userId, content: addNote } });
  }
  if (removeNoteId) {
    await prisma.memoryNote.deleteMany({ where: { id: removeNoteId, userId } });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(brand !== undefined ? { brand } : {}),
      ...(audience !== undefined ? { audience } : {}),
      ...(style !== undefined ? { style } : {}),
      ...(allowProfanity !== undefined ? { allowProfanity } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
