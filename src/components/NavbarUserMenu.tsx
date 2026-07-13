/**
 * FICHIER : src/components/NavbarUserMenu.tsx
 * RÔLE : Partie droite de la Navbar. Bascule mobile→bureau à md: (768px)
 * au lieu de sm:, cohérent avec Navbar.tsx.
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
      <div className="flex shrink-0 gap-1.5 md:gap-3">
        <Link
          href="/connexion"
          className="rounded-lg border border-white/20 px-2 py-1 text-[11px] font-semibold hover:bg-ink-soft md:px-4 md:py-2 md:text-sm"
        >
          Connexion
        </Link>
        <Link
          href="/inscription"
          className="rounded-lg bg-ember px-2 py-1 text-[11px] font-semibold text-paper hover:bg-ember/90 md:px-4 md:py-2 md:text-sm"
        >
          Inscription
        </Link>
      </div>
    );
  }

  return (
    <div className="relative shrink-0" ref={conteneurRef}>
      <button
        onClick={() => setOuvert((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-xs font-semibold hover:bg-ink-soft md:h-auto md:w-auto md:gap-1.5 md:rounded-lg md:px-4 md:py-2"
      >
        <span className={`md:hidden ${estPremium ? "text-gold" : "text-ash"}`}>★</span>
        <span className="hidden items-center gap-1.5 md:flex">
          <span className={estPremium ? "text-gold" : "text-ash"}>★</span>
          Mon compte
          <span className="text-xs text-ash">{ouvert ? "▲" : "▼"}</span>
        </span>
      </button>

      {ouvert && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-ink-soft py-2 shadow-lg">
          <p className="truncate border-b border-white/10 px-4 pb-2 text-xs text-ash">{nom}</p>
          <Link href="/mes-favoris" onClick={() => setOuvert(false)} className="block px-4 py-2.5 text-sm hover:bg-ink-softer">Mes favoris</Link>
          <Link href="/mes-playlists" onClick={() => setOuvert(false)} className="block px-4 py-2.5 text-sm hover:bg-ink-softer">Mes playlists</Link>
          <Link href="/soumettre-artiste" onClick={() => setOuvert(false)} className="block px-4 py-2.5 text-sm hover:bg-ink-softer">Soumettre un son</Link>
          <Link href="/abonnez-vous" onClick={() => setOuvert(false)} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-ink-softer">
            Mon abonnement
            {estPremium && <span className="text-xs text-gold">★ Premium</span>}
          </Link>
          <div className="mt-1 border-t border-white/10 pt-1">
            <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full px-4 py-2.5 text-left text-sm text-ember hover:bg-ink-softer">Déconnexion</button>
          </div>
        </div>
      )}
    </div>
  );
}