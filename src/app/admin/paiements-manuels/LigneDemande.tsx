/**
 * FICHIER : src/app/admin/paiements-manuels/LigneDemande.tsx
 * RÔLE : Carte d'une demande de paiement manuel avec boutons
 * Valider/Rejeter.
 */
"use client";

import { useState, useTransition } from "react";
import { validerPaiementManuel, rejeterPaiementManuel } from "./actions";

export default function LigneDemande({
  id,
  nomUtilisateur,
  provider,
  plan,
  phoneUsed,
  reference,
  screenshotUrl,
  createdAt,
}: {
  id: string;
  nomUtilisateur: string;
  provider: string;
  plan: string;
  phoneUsed: string;
  reference: string;
  screenshotUrl: string | null;
  createdAt: string;
}) {
  const [enCours, startTransition] = useTransition();
  const [motifRejet, setMotifRejet] = useState("");
  const [afficherRejet, setAfficherRejet] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 bg-ink-soft px-5 py-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{nomUtilisateur}</p>
          <p className="text-xs text-ash">{provider} · {plan} · {createdAt}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <p><span className="text-ash">Numéro :</span> {phoneUsed}</p>
        <p><span className="text-ash">Référence :</span> {reference}</p>
      </div>

      {screenshotUrl && (
        <img src={screenshotUrl} alt="Preuve" className="mt-3 max-h-64 rounded-lg border border-white/10" />
      )}

      {!afficherRejet ? (
        <div className="mt-4 flex gap-3">
          <button
            disabled={enCours}
            onClick={() => startTransition(() => validerPaiementManuel(id))}
            className="rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
          >
            {enCours ? "..." : "Valider"}
          </button>
          <button onClick={() => setAfficherRejet(true)} className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-ink-softer">
            Rejeter
          </button>
        </div>
      ) : (
        <div className="mt-4 flex gap-3">
          <input
            value={motifRejet}
            onChange={(e) => setMotifRejet(e.target.value)}
            placeholder="Motif (optionnel)"
            className="flex-1 rounded-lg border border-white/20 bg-ink px-3 py-2 text-sm"
          />
          <button
            disabled={enCours}
            onClick={() => startTransition(() => rejeterPaiementManuel(id, motifRejet))}
            className="rounded-lg bg-ember px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            Confirmer
          </button>
        </div>
      )}
    </div>
  );
}