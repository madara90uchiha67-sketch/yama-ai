import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1, // solo el primer mensaje, para armar el título/resumen
      },
    },
  });

  const list = conversations
    .filter((c) => c.messages.length > 0) // oculta conversaciones vacías (creadas pero nunca usadas)
    .map((c) => ({
      id: c.id,
      mode: c.mode,
      updatedAt: c.updatedAt,
      preview: c.messages[0]?.content.slice(0, 80) || "",
    }));

  return NextResponse.json({ conversations: list });
}
