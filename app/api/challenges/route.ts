import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { todayKey } from "@/lib/plans";
import { generateDailyChallenges } from "@/lib/ai";

export const maxDuration = 60;

export async function GET() {
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

  const today = todayKey();

  if (user.dailyChallengesDate === today && user.dailyChallenges) {
    try {
      const cached = JSON.parse(user.dailyChallenges);
      return NextResponse.json({ challenges: cached, date: today });
    } catch {
      // Si por alguna razón el JSON guardado está corrupto, seguimos y regeneramos abajo.
    }
  }

  const challenges = await generateDailyChallenges(user);

  if (challenges.length === 0) {
    return NextResponse.json(
      { error: "No se pudo generar el reto diario. Intenta de nuevo más tarde." },
      { status: 502 }
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      dailyChallenges: JSON.stringify(challenges),
      dailyChallengesDate: today,
    },
  });

  return NextResponse.json({ challenges, date: today });
}
