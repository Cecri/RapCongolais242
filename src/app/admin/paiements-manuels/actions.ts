/**
 * FICHIER : src/app/admin/paiements-manuels/actions.ts
 * RÔLE : Server Actions admin pour valider/rejeter une demande de
 * paiement manuel. La validation active réellement le Premium et
 * envoie l'email de confirmation à l'utilisateur.
 */
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { envoyerConfirmationPremium } from "@/lib/email";
import { revalidatePath } from "next/cache";

function calculerDateFin(plan: "MONTHLY" | "SEMESTRIAL" | "YEARLY"): Date {
  const maintenant = new Date();
  if (plan === "MONTHLY") return new Date(maintenant.setMonth(maintenant.getMonth() + 1));
  if (plan === "SEMESTRIAL") return new Date(maintenant.setMonth(maintenant.getMonth() + 6));
  return new Date(maintenant.setFullYear(maintenant.getFullYear() + 1));
}

export async function validerPaiementManuel(demandeId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Non autorisé.");

  const demande = await prisma.manualPaymentRequest.update({
    where: { id: demandeId },
    data: { status: "APPROVED", reviewedAt: new Date() },
    include: { user: true },
  });

  const endsAt = calculerDateFin(demande.plan);

  await prisma.premiumSubscription.upsert({
    where: { userId: demande.userId },
    update: { status: "ACTIVE", plan: demande.plan, endsAt },
    create: { userId: demande.userId, plan: demande.plan, status: "ACTIVE", endsAt },
  });

  if (demande.user.email) {
    await envoyerConfirmationPremium(demande.user.email);
  }

  revalidatePath("/admin/paiements-manuels");
}

export async function rejeterPaiementManuel(demandeId: string, motif: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Non autorisé.");

  await prisma.manualPaymentRequest.update({
    where: { id: demandeId },
    data: { status: "REJECTED", reviewedAt: new Date(), rejectReason: motif || null },
  });

  revalidatePath("/admin/paiements-manuels");
}