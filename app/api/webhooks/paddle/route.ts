import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

function verifySignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  // El header viene así: "ts=1234567890;h1=abcdef123..."
  const parts = Object.fromEntries(
    signatureHeader.split(";").map((p) => p.split("=") as [string, string])
  );
  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  const signedPayload = `${ts}:${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(h1));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signatureHeader = req.headers.get("paddle-signature") || "";
  const secret = process.env.PADDLE_WEBHOOK_SECRET!;

  if (!verifySignature(rawBody, signatureHeader, secret)) {
    console.error("YAMA AI — webhook de Paddle con firma inválida.");
    return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventType = event.event_type as string;
  const data = event.data;

  console.log("YAMA AI — webhook de Paddle recibido:", eventType);

  // Solo nos interesan eventos de suscripción.
  if (!eventType?.startsWith("subscription.")) {
    return NextResponse.json({ ok: true });
  }

  const userId = data?.custom_data?.userId as string | undefined;
  const paddleSubscriptionId = data?.id as string | undefined;
  const paddleCustomerId = data?.customer_id as string | undefined;
  const status = data?.status as string | undefined;

  if (!userId) {
    console.error("YAMA AI — webhook sin userId en custom_data, no se puede actualizar.");
    return NextResponse.json({ ok: true }); // respondemos 200 igual, para que Paddle no reintente infinito
  }

  // El usuario mantiene Pro mientras su suscripción esté activa o en periodo de prueba.
  const isPro = status === "active" || status === "trialing";

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: isPro ? "PRO" : "FREE",
        paddleSubscriptionId,
        paddleCustomerId,
      },
    });
  } catch (e) {
    console.error("YAMA AI — fallo actualizando plan tras webhook de Paddle:", e);
    return NextResponse.json({ error: "Fallo interno." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
    }
