/**
 * FICHIER : src/app/(site)/contact/FormulaireContact.tsx
 * RÔLE : Formulaire de contact, pré-rempli si connecté.
 */
"use client";

import { useState } from "react";
import { envoyerMessageContact } from "./actions";

export default function FormulaireContact({
  nomInitial,
  emailInitial,
}: {
  nomInitial: string;
  emailInitial: string;
}) {
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);
  const [enCours, setEnCours] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur("");
    setEnCours(true);

    const formData = new FormData(e.currentTarget);
    const resultat = await envoyerMessageContact({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    });

    setEnCours(false);

    if (resultat?.erreur) {
      setErreur(resultat.erreur);
      return;
    }

    setSucces(true);
  }

  if (succes) {
    return (
      <div className="mt-8 rounded-2xl border border-emerald/30 bg-emerald-dim px-6 py-8 text-center">
        <p className="font-display text-lg font-bold text-emerald">Message envoyé !</p>
        <p className="mt-2 text-sm text-paper-dim">On te répond dès que possible.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Nom *</label>
        <input name="name" required defaultValue={nomInitial} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Email *</label>
        <input type="email" name="email" required defaultValue={emailInitial} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Message *</label>
        <textarea name="message" required minLength={10} rows={5} className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      {erreur && <p className="text-sm text-ember">{erreur}</p>}

      <button type="submit" disabled={enCours} className="mt-2 rounded-lg bg-ember px-5 py-3 text-sm font-semibold disabled:opacity-60">
        {enCours ? "Envoi..." : "Envoyer"}
      </button>
    </form>
  );
}