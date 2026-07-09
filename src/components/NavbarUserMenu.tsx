/**
 * FICHIER : src/components/NavbarUserMenu.tsx
 * RÔLE : Partie droite de la Navbar. Si connecté : nom + badge Premium
 * toujours visibles, à côté d'un bouton "Mon compte" séparé qui ouvre
 * un menu déroulant (Favoris, Playlists, Soumettre un son, Abonnement,
 * Déconnexion). "Soumettre un son" pointe vers /soumettre-artiste, qui
 * gère déjà lui-même la redirection vers l'abonnement si non-Premium.
 */
"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

export default function NavbarUserMenu({
  estConnecte,
  nom,
  estPremium,
}: {
  estConnecte: boolean;
  nom: string;
  estPremium: boolean;
}) {
  const [ouvert, setOuvert] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fermerSiClicDehors(e: MouseEvent) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    }
    document.addEventListener("mousedown", fermerSiClicDehors);
    return () => document.removeEventListener("mousedown", fermerSiClicDehors);
  }, []);

  if (!estConnecte) {
    return (
      <div className="flex gap-3">
        <Link href="/connexion" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-ink-soft">Connexion</Link>
        <Link href="/inscription" className="rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-paper hover:bg-ember/90">Inscription</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-32 items-center gap-1.5 truncate text-sm text-paper-dim sm:flex">
        {estPremium && <span className="text-copper">★</span>}
        {nom}
      </span>

      <div className="relative" ref={conteneurRef}>
        <button
          onClick={() => setOuvert((o) => !o)}
          className="flex items-center gap-1.5 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-ink-soft"
        >
          Mon compte
          <span className="text-xs text-ash">{ouvert ? "▲" : "▼"}</span>
        </button>

        {ouvert && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-ink-soft py-2 shadow-lg">
            <Link href="/mes-favoris" onClick={() => setOuvert(false)} className="block px-4 py-2.5 text-sm hover:bg-ink-softer">Mes favoris</Link>
            <Link href="/mes-playlists" onClick={() => setOuvert(false)} className="block px-4 py-2.5 text-sm hover:bg-ink-softer">Mes playlists</Link>
            <Link href="/soumettre-artiste" onClick={() => setOuvert(false)} className="block px-4 py-2.5 text-sm hover:bg-ink-softer">Soumettre un son</Link>
            <Link href="/abonnez-vous" onClick={() => setOuvert(false)} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-ink-softer">
              Mon abonnement
              {estPremium && <span className="text-xs text-copper">★ Premium</span>}
            </Link>

            <div className="mt-1 border-t border-white/10 pt-1">
              <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full px-4 py-2.5 text-left text-sm text-ember hover:bg-ink-softer">
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}