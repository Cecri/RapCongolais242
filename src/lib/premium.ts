/**
 * FICHIER : src/lib/premium.ts
 * RÔLE : Fonction utilitaire centralisée pour vérifier si un utilisateur
 * a un abonnement Premium actif. Utilisée partout où on doit restreindre
 * une fonctionnalité (écoute des exclusivités, téléchargement hors-ligne,
 * soumission d'artiste) : pages, Server Actions, composants serveur.
 *
 * Ne jamais dupliquer cette logique ailleurs — si les règles Premium
 * changent un jour (ex: période d'essai), on ne les modifie qu'ici.
 */
import { prisma } from "@/lib/prisma";

export async function estUtilisateurPremium(userId: string): Promise<boolean> {
  const abonnement = await prisma.premiumSubscription.findUnique({
    where: { userId },
  });

  if (!abonnement) return false;
  if (abonnement.status !== "ACTIVE") return false;
  if (abonnement.endsAt && abonnement.endsAt < new Date()) return false;

  return true;
}