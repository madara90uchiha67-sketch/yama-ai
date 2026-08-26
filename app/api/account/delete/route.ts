import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  // Gracias a "onDelete: Cascade" en el schema, esto borra automáticamente
  // también las conversaciones, mensajes, notas de memoria y logs de uso
  // de este usuario. Es permanente e irreversible.
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ ok: true });
}
