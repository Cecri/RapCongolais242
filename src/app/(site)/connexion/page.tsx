/**
 * FICHIER : src/app/connexion/page.tsx
 * RÔLE : Page publique de connexion pour les auditeurs. Distincte de
 * /admin/connexion : redirige vers l'accueil après connexion (pas /admin),
 * et n'importe pas de vérification de rôle ADMIN.
 * URL : /connexion
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    const resultat = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setChargement(false);

    if (resultat?.error) {
      setErreur("Email ou mot de passe incorrect.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-8">
      <h1 className="font-display text-2xl font-bold">Connexion</h1>
      <p className="mt-1.5 text-sm text-ash">Content de te revoir.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-paper-dim">
            Mot de passe
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none"
          />
        </div>

        {erreur && <p className="text-sm text-ember">{erreur}</p>}

        <button
          type="submit"
          disabled={chargement}
          className="mt-2 rounded-lg bg-ember px-5 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {chargement ? "Connexion..." : "Se connecter"}
        </button>

        <p className="text-center text-sm text-ash">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-copper">
            S&apos;inscrire
          </Link>
        </p>
      </form>
    </main>
  );
}