/**
 * FICHIER : src/app/inscription/page.tsx
 * RÔLE : Page publique d'inscription pour les auditeurs (fans de musique),
 * distincte de /admin/connexion (réservée à l'équipe RapCongolais242).
 * URL : /inscription
 */
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { creerCompteAuditeur, type EtatFormulaire } from "./actions";

const etatInitial: EtatFormulaire = undefined;

export default function InscriptionPage() {
  const [etat, formAction, enCours] = useActionState(creerCompteAuditeur, etatInitial);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-8">
      <h1 className="font-display text-2xl font-bold">Créer un compte</h1>
      <p className="mt-1.5 text-sm text-ash">
        Sauvegarde tes sons préférés, crée des playlists, et bien plus.
      </p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">
            Nom
          </label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">
            Mot de passe
          </label>
          <input
            type="password"
            name="password"
            required
            className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none"
          />
        </div>

        {etat?.erreur && <p className="text-sm text-ember">{etat.erreur}</p>}

        <button
          type="submit"
          disabled={enCours}
          className="mt-2 rounded-lg bg-ember px-5 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {enCours ? "Création..." : "Créer mon compte"}
        </button>

        <p className="text-center text-sm text-ash">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-copper">
            Se connecter
          </Link>
        </p>
      </form>
    </main>
  );
}