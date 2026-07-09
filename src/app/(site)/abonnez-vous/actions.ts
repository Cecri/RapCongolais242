/**
 * FICHIER : src/app/(site)/abonnez-vous/actions.ts
 * RÔLE : Server Actions pour l'abonnement Premium.
 * - activerAbonnementTest/annulerAbonnement : mode test manuel (dev)
 * - creerCommandePaypalAction/confirmerPaiementPaypalAction : vrai
 *   paiement PayPal, active le Premium seulement après confirmation
 *   réelle de PayPal (paiement effectivement capturé), jamais avant.
 */
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { creerCommandePaypal, capturerCommandePaypal, PRIX_USD_PAR_PLAN } from "@/lib/paypal";

type PremiumPlan = keyof typeof PRIX_USD_PAR_PLAN;

function calculerDateFin(plan: PremiumPlan): Date {
  const maintenant = new Date();
  if (plan === "MONTHLY") return new Date(maintenant.setMonth(maintenant.getMonth() + 1));
  if (plan === "SEMESTRIAL") return new Date(maintenant.setMonth(maintenant.getMonth() + 6));
  return new Date(maintenant.setFullYear(maintenant.getFullYear() + 1));
}

export async function activerAbonnementTest(plan: PremiumPlan) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Connecte-toi d'abord pour t'abonner.");
  }

  const endsAt = calculerDateFin(plan);

  await prisma.premiumSubscription.upsert({
    where: { userId: session.user.id },
    update: { status: "ACTIVE", plan, endsAt },
    create: { userId: session.user.id, plan, status: "ACTIVE", endsAt },
  });

  revalidatePath("/abonnez-vous");
}

export async function annulerAbonnement() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non connecté.");
  }

  await prisma.premiumSubscription.updateMany({
    where: { userId: session.user.id },
    data: { status: "CANCELED" },
  });

  revalidatePath("/abonnez-vous");
}

export async function creerCommandePaypalAction(plan: PremiumPlan): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Connecte-toi d'abord pour t'abonner.");
  }

  return await creerCommandePaypal(plan);
}

export async function confirmerPaiementPaypalAction(orderId: string, plan: PremiumPlan) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Connecte-toi d'abord pour t'abonner.");
  }

  const succes = await capturerCommandePaypal(orderId);

  if (!succes) {
    throw new Error("Le paiement PayPal n'a pas pu être confirmé.");
  }

  const endsAt = calculerDateFin(plan);

  await prisma.premiumSubscription.upsert({
    where: { userId: session.user.id },
    update: { status: "ACTIVE", plan, endsAt },
    create: { userId: session.user.id, plan, status: "ACTIVE", endsAt },
  });

  revalidatePath("/abonnez-vous");
}