/**
 * FICHIER : src/app/(site)/paiement-manuel/actions.ts
 * RÔLE : Enregistre une demande de paiement manuel (Mobile Money/Wave),
 * envoie une notification email à l'admin. Ne active PAS le Premium —
 * ça reste la décision de l'admin depuis /admin/paiements-manuels.
 */
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { envoyerNotificationAdminNouvelleDemande } from "@/lib/email";
import { z } from "zod";

export type EtatFormulaire = { erreur?: string; succes?: boolean } | undefined;

const Schema = z.object({
  provider: z.enum(["MTN_CONGO", "AIRTEL_CONGO", "WAVE_SENEGAL"]),
  plan: z.enum(["MONTHLY", "SEMESTRIAL", "YEARLY"]),
  phoneUsed: z.string().min(1, "Le numéro utilisé est requis"),
  reference: z.string().min(1, "La référence de transaction est requise"),
  screenshotUrl: z.string().optional(),
});

export async function soumettrePaiementManuel(data: {
  provider: "MTN_CONGO" | "AIRTEL_CONGO" | "WAVE_SENEGAL";
  plan: "MONTHLY" | "SEMESTRIAL" | "YEARLY";
  phoneUsed: string;
  reference: string;
  screenshotUrl?: string;
}): Promise<EtatFormulaire> {
  const session = await auth();
  if (!session?.user?.id) {
    return { erreur: "Connecte-toi d'abord." };
  }

  const resultat = Schema.safeParse(data);
  if (!resultat.success) {
    return { erreur: resultat.error.issues[0].message };
  }

  await prisma.manualPaymentRequest.create({
    data: {
      userId: session.user.id,
      provider: resultat.data.provider,
      plan: resultat.data.plan,
      phoneUsed: resultat.data.phoneUsed,
      reference: resultat.data.reference,
      screenshotUrl: resultat.data.screenshotUrl || null,
    },
  });

  await envoyerNotificationAdminNouvelleDemande({
    nomUtilisateur: session.user.name || session.user.email || "Utilisateur",
    provider: resultat.data.provider,
    plan: resultat.data.plan,
    reference: resultat.data.reference,
  });

  return { succes: true };
}