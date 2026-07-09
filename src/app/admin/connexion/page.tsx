"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function ConnexionAdmin() {
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

    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-8">
      <h1 className="font-display text-2xl font-bold">Connexion admin</h1>
      <p className="mt-1.5 text-sm text-ash">Espace réservé à l&apos;équipe RapCongolais242.</p>

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
      </form>
    </main>
  );
}