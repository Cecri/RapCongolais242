/**
 * FICHIER : src/app/(site)/paiement-manuel/FormulairePaiementManuel.tsx
 * RÔLE : Formulaire de déclaration de paiement. N'affiche plus le nom
 * du titulaire du compte, seulement le numéro à qui envoyer l'argent.
 */
"use client";

import { useState } from "react";
import { soumettrePaiementManuel } from "./actions";
import { useUpload } from "@/lib/useUpload";

type Provider = "MTN_CONGO" | "AIRTEL_CONGO" | "WAVE_SENEGAL";
type Plan = "MONTHLY" | "SEMESTRIAL" | "YEARLY";

type Moyen = { label: string; numero: string; nom: string };

export default function FormulairePaiementManuel({
  planInitial,
  moyens,
  prix,
}: {
  planInitial: Plan;
  moyens: Record<Provider, Moyen>;
  prix: Record<Plan, string>;
}) {
  const { uploaderVersR2 } = useUpload();
  const [provider, setProvider] = useState<Provider>("MTN_CONGO");
  const [plan] = useState<Plan>(planInitial);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);
  const [enCours, setEnCours] = useState(false);

  const moyen = moyens[provider];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur("");
    setEnCours(true);

    try {
      const formData = new FormData(e.currentTarget);
      const fichier = formData.get("screenshot") as File;

      let screenshotUrl: string | undefined;
      if (fichier && fichier.size > 0) {
        screenshotUrl = await uploaderVersR2(fichier, "photos-artistes");
      }

      const resultat = await soumettrePaiementManuel({
        provider,
        plan,
        phoneUsed: formData.get("phoneUsed") as string,
        reference: formData.get("reference") as string,
        screenshotUrl,
      });

      setEnCours(false);

      if (resultat?.erreur) {
        setErreur(resultat.erreur);
        return;
      }

      setSucces(true);
    } catch {
      setErreur("Une erreur est survenue.");
      setEnCours(false);
    }
  }

  if (succes) {
    return (
      <div className="mt-8 rounded-2xl border border-emerald/30 bg-emerald-dim px-6 py-8 text-center">
        <p className="font-display text-lg font-bold text-emerald">Demande envoyée !</p>
        <p className="mt-2 text-sm text-paper-dim">On vérifie ton paiement et on active ton Premium sous 24h. Tu recevras un email de confirmation.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex gap-2">
        {(Object.keys(moyens) as Provider[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setProvider(p)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${provider === p ? "border-copper bg-copper-dim text-copper" : "border-white/20 text-paper-dim"}`}
          >
            {moyens[p].label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-copper/30 bg-copper-dim px-5 py-4">
        <p className="text-sm text-paper-dim">Envoie <strong className="text-copper">{prix[plan]}</strong> à :</p>
        <p className="mt-1 font-display text-lg font-bold">{moyen.numero}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Ton numéro (celui qui a payé) *</label>
          <input name="phoneUsed" required className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Référence de transaction *</label>
          <input name="reference" required placeholder="Le code donné après le transfert" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Capture d&apos;écran (optionnel mais recommandé)</label>
          <input type="file" name="screenshot" accept="image/*" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-copper file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink" />
        </div>

        {erreur && <p className="text-sm text-ember">{erreur}</p>}

        <button type="submit" disabled={enCours} className="mt-2 rounded-lg bg-ember px-5 py-3 text-sm font-semibold disabled:opacity-60">
          {enCours ? "Envoi..." : "J'ai payé, valider ma demande"}
        </button>
      </form>
    </div>
  );
}