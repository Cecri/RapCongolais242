/**
 * FICHIER : src/components/SoumissionBanner.tsx
 * RÔLE : Encart incitant à soumettre un artiste ou un son méconnu,
 * affiché sur /sons et /artistes. Pointe vers /soumettre-artiste, qui
 * gère lui-même la demande de connexion puis d'abonnement Premium si
 * nécessaire — cet encart n'a donc aucune logique à porter lui-même.
 */
import Link from "next/link";

export default function SoumissionBanner() {
  return (
    <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-copper/30 bg-copper-dim px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
      <div>
        <p className="font-semibold text-copper">Tu connais un artiste caché, ou juste un son qu&apos;on ignore ?</p>
        <p className="mt-1 text-sm text-paper-dim">Fais-le nous découvrir — abonnés Premium uniquement.</p>
      </div>
      <Link href="/soumettre-artiste" className="shrink-0 rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold">
        Soumettre un artiste / un son
      </Link>
    </div>
  );
}