import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const VALID_PROFANITY = ["none", "soft", "medium", "high"];
const VALID_PERSONALITY = ["profesional", "directa", "creativa", "mentor", "casual"];
const VALID_SPEAKING = ["formal", "casual", "personalizada"];
const VALID_PROFILE = ["creador", "emprendedor", "marca", "freelancer", "estudiante"];

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const body = await req.json();
  const data: Record<string, string> = {};

  if (body.profanityLevel !== undefined) {
    if (!VALID_PROFANITY.includes(body.profanityLevel)) {
      return NextResponse.json({ error: "Nivel de lenguaje inválido." }, { status: 400 });
    }
    data.profanityLevel = body.profanityLevel;
  }
  if (body.personality !== undefined) {
    if (!VALID_PERSONALITY.includes(body.personality)) {
      return NextResponse.json({ error: "Personalidad inválida." }, { status: 400 });
    }
    data.personality = body.personality;
  }
  if (body.speakingStyle !== undefined) {
    if (!VALID_SPEAKING.includes(body.speakingStyle)) {
      return NextResponse.json({ error: "Forma de hablar inválida." }, { status: 400 });
    }
    data.speakingStyle = body.speakingStyle;
  }
  if (body.userProfile !== undefined) {
    if (!VALID_PROFILE.includes(body.userProfile)) {
      return NextResponse.json({ error: "Perfil inválido." }, { status: 400 });
    }
    data.userProfile = body.userProfile;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
  }

  await prisma.user.update({ where: { id: userId }, data });
  return NextResponse.json({ ok: true });
}
