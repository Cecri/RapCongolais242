/**
 * FICHIER : src/app/(site)/abonnez-vous/BoutonAbonnement.tsx
 * RÔLE : Affiche les 3 paliers Premium, avec 2 vrais moyens de paiement :
 * PayPal (carte/compte PayPal) et Mobile Money/Wave (paiement manuel).
 */
"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { annulerAbonnement } from "./actions";
import BoutonPaypal from "./BoutonPaypal";

const PALIERS = [
  { id: "MONTHLY" as const, label: "1 mois", prixXof: "1 000 XOF", prixUsd: "$2" },
  { id: "SEMESTRIAL" as const, label: "6 mois", prixXof: "5 500 XOF", prixUsd: "$9" },
  { id: "YEARLY" as const, label: "1 an", prixXof: "10 000 XOF", prixUsd: "$16" },
];

export default function BoutonAbonnement({
  estConnecte,
  estDejaPremium,
}: {
  estConnecte: boolean;
  estDejaPremium: boolean;
}) {
  const router = useRouter();
  const [enCours, startTransition] = useTransition();
  const [palierChoisi, setPalierChoisi] = useState<(typeof PALIERS)[number]["id"] | null>(null);

  if (!estConnecte) {
    return <a href="/connexion" className="inline-block rounded-lg bg-ember px-6 py-3 text-sm font-semibold">Se connecter pour s&apos;abonner</a>;
  }

  if (estDejaPremium) {
    return (
      <button
        disabled={enCours}
        onClick={() => startTransition(async () => { await annulerAbonnement(); router.refresh(); })}
        className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-ink-soft disabled:opacity-60"
      >
        {enCours ? "..." : "Annuler mon abonnement"}
      </button>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {PALIERS.map((palier) => (
          <button
            key={palier.id}
            onClick={() => setPalierChoisi(palier.id === palierChoisi ? null : palier.id)}
            className={`rounded-xl border px-5 py-5 text-left transition-colors ${palierChoisi === palier.id ? "border-copper bg-copper-dim" : "border-white/15 bg-ink-soft hover:border-copper"}`}
          >
            <p className="font-mono text-xs uppercase tracking-wide text-ash">{palier.label}</p>
            <p className="mt-1 font-display text-xl font-bold text-copper">{palier.prixXof}</p>
            <p className="mt-1 text-xs text-paper-dim">~{palier.prixUsd} (carte/PayPal)</p>
          </button>
        ))}
      </div>

      {palierChoisi && (
        <div className="mt-6 flex flex-col gap-4">
          <div className="rounded-xl border border-white/10 bg-ink-soft p-5">
            <p className="mb-3 text-sm text-paper-dim">Payer par carte ou compte PayPal :</p>
            <BoutonPaypal plan={palierChoisi} />
          </div>

          <div className="rounded-xl border border-white/10 bg-ink-soft p-5">
            <p className="mb-3 text-sm text-paper-dim">Payer par Mobile Money (Congo) ou Wave (Sénégal) :</p>
            <a href={`/paiement-manuel?plan=${palierChoisi}`} className="inline-block rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold hover:bg-ink-softer">Continuer avec Mobile Money / Wave</a>
          </div>
        </div>
      )}
    </div>
  );
}