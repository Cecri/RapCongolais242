/**
 * FICHIER : src/app/(site)/soumettre-artiste/actions.ts
 * RÔLE : Enregistre la soumission d'un artiste/son par un auditeur
 * Premium. Accepte maintenant soit un lien, soit un vrai fichier audio
 * uploadé (via useUpload.ts, stocké sur R2 dans le dossier
 * "soumissions" — distinct de "sons", car pas encore validé par l'admin).
 */
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { estUtilisateurPremium } from "@/lib/premium";
import { z } from "zod";

export type EtatFormulaire = { erreur?: string; succes?: boolean } | undefined;

const SoumissionSchema = z.object({
  artistName: z.string().min(1, "Le nom de l'artiste ou du titre est requis"),
  links: z.string().optional(),
  fichierUrl: z.string().optional(),
  message: z.string().min(10, "Dis-nous en un peu plus (10 caractères minimum)"),
});

export async function soumettreArtiste(data: {
  artistName: string;
  links?: string;
  fichierUrl?: string;
  message: string;
}): Promise<EtatFormulaire> {
  const session = await auth();
  if (!session?.user?.id) {
    return { erreur: "Connecte-toi d'abord." };
  }

  const estPremium = await estUtilisateurPremium(session.user.id);
  if (!estPremium) {
    return { erreur: "Réservé aux abonnés Premium." };
  }

  const resultat = SoumissionSchema.safeParse(data);
  if (!resultat.success) {
    return { erreur: resultat.error.issues[0].message };
  }

  if (!resultat.data.links && !resultat.data.fichierUrl) {
    return { erreur: "Ajoute soit un lien, soit un fichier audio." };
  }

  const liensCombines = [resultat.data.links, resultat.data.fichierUrl].filter(Boolean).join(" | ");

  await prisma.artistRecommendation.create({
    data: {
      userId: session.user.id,
      artistName: resultat.data.artistName,
      links: liensCombines,
      message: resultat.data.message,
    },
  });

  return { succes: true };
}