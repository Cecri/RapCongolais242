/**
 * FICHIER : src/app/admin/collaborations/LigneCollaboration.tsx
 * RÔLE : Carte d'une demande de collaboration, avec changement de statut.
 */
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { changerStatutCollaboration } from "./actions";

type Demande = {
  id: string; artistName: string; email: string; phone: string | null;
  services: string; message: string | null; status: string; createdAt: Date;
};

export default function LigneCollaboration({ demande }: { demande: Demande }) {
  const router = useRouter();
  const [enCours, startTransition] = useTransition();

  const couleurs: Record<string, string> = {
    PENDING: "bg-copper-dim text-copper",
    CONTACTED: "bg-emerald-dim text-emerald",
    CLOSED: "bg-white/10 text-ash",
  };
  const labels: Record<string, string> = { PENDING: "En attente", CONTACTED: "Contacté", CLOSED: "Clôturé" };

  return (
    <div className="rounded-xl border border-white/10 bg-ink-soft px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{demande.artistName}</p>
          <p className="text-xs text-ash">{demande.email} {demande.phone && `· ${demande.phone}`}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${couleurs[demande.status]}`}>
          {labels[demande.status]}
        </span>
      </div>
      <p className="mt-2 text-sm text-paper-dim"><strong className="text-paper">Services :</strong> {demande.services}</p>
      {demande.message && <p className="mt-1 text-sm text-paper-dim">{demande.message}</p>}
      <p className="mt-2 text-xs text-ash">{demande.createdAt.toLocaleDateString("fr-FR")}</p>

      <div className="mt-3 flex gap-2">
        {["PENDING", "CONTACTED", "CLOSED"].filter((s) => s !== demande.status).map((statut) => (
          <button
            key={statut}
            disabled={enCours}
            onClick={() => startTransition(async () => { await changerStatutCollaboration(demande.id, statut as "PENDING" | "CONTACTED" | "CLOSED"); router.refresh(); })}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-ink-softer disabled:opacity-60"
          >
            → {labels[statut]}
          </button>
        ))}
      </div>
    </div>
  );
}