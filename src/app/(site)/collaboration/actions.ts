/**
 * FICHIER : src/app/(site)/collaboration/actions.ts
 * RÔLE : Enregistre une demande de collaboration artiste (table
 * CollaborationRequest), envoie une notification email à l'admin.
 * Accessible sans être connecté ni Premium — offre B2B distincte de
 * l'abonnement auditeur.
 */
"use server";

import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { z } from "zod";

export type EtatFormulaire = { erreur?: string; succes?: boolean } | undefined;

const resend = new Resend(process.env.RESEND_API_KEY);

const CollabSchema = z.object({
  artistName: z.string().min(1, "Le nom de l'artiste est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  services: z.array(z.string()).min(1, "Sélectionne au moins un service"),
  message: z.string().optional(),
});

export async function envoyerDemandeCollaboration(data: {
  artistName: string;
  email: string;
  phone?: string;
  services: string[];
  message?: string;
}): Promise<EtatFormulaire> {
  const resultat = CollabSchema.safeParse(data);
  if (!resultat.success) {
    return { erreur: resultat.error.issues[0].message };
  }

  await prisma.collaborationRequest.create({
    data: {
      artistName: resultat.data.artistName,
      email: resultat.data.email,
      phone: resultat.data.phone || null,
      services: resultat.data.services.join(", "),
      message: resultat.data.message || null,
    },
  });

  try {
    await resend.emails.send({
      from: "RapCongolais242 <onboarding@resend.dev>",
      to: process.env.ADMIN_NOTIFICATION_EMAIL!,
      subject: "Nouvelle demande de collaboration artiste",
      html: `
        <p><strong>Artiste :</strong> ${resultat.data.artistName}</p>
        <p><strong>Email :</strong> ${resultat.data.email}</p>
        <p><strong>Téléphone :</strong> ${resultat.data.phone || "Non renseigné"}</p>
        <p><strong>Services demandés :</strong> ${resultat.data.services.join(", ")}</p>
        <p><strong>Message :</strong> ${resultat.data.message || "—"}</p>
        <p><a href="http://localhost:3000/admin/collaborations">Voir la demande</a></p>
      `,
    });
  } catch (erreur) {
    console.log("[email] Échec notification collaboration :", erreur);
  }

  return { succes: true };
}