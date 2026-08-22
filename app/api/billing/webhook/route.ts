import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription | Stripe.Checkout.Session;
      const customerId =
        typeof (sub as any).customer === "string" ? (sub as any).customer : (sub as any).customer?.id;
      if (customerId) {
        const isActive =
          "status" in sub ? sub.status === "active" || sub.status === "trialing" : true;
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: isActive ? "PRO" : "FREE",
            stripeSubscriptionId: "id" in sub ? sub.id : undefined,
          },
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: { plan: "FREE" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
