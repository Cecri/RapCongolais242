/**
 * FICHIER : src/app/(site)/contact/actions.ts
 * RÔLE : Enregistre un message de contact (table ContactMessage).
 * Fonctionne aussi bien connecté que non connecté (userId optionnel).
 * Envoie une notification email à l'admin, comme pour les demandes
 * de paiement manuel.
 */
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Resend } from "resend";
import { z } from "zod";

export type EtatFormulaire = { erreur?: string; succes?: boolean } | undefined;

const resend = new Resend(process.env.RESEND_API_KEY);

const ContactSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  message: z.string().min(10, "Le message doit faire au moins 10 caractères"),
});

export async function envoyerMessageContact(data: {
  name: string;
  email: string;
  message: string;
}): Promise<EtatFormulaire> {
  const session = await auth();

  const resultat = ContactSchema.safeParse(data);
  if (!resultat.success) {
    return { erreur: resultat.error.issues[0].message };
  }

  await prisma.contactMessage.create({
    data: {
      userId: session?.user?.id || null,
      name: resultat.data.name,
      email: resultat.data.email,
      message: resultat.data.message,
    },
  });

  try {
    await resend.emails.send({
      from: "RapCongolais242 <onboarding@resend.dev>",
      to: process.env.ADMIN_NOTIFICATION_EMAIL!,
      subject: "Nouveau message de contact",
      html: `
        <p><strong>De :</strong> ${resultat.data.name} (${resultat.data.email})</p>
        <p><strong>Message :</strong></p>
        <p>${resultat.data.message}</p>
      `,
    });
  } catch (erreur) {
    console.log("[email] Échec notification contact :", erreur);
  }

  return { succes: true };
}