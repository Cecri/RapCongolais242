/**
 * FICHIER : src/components/NavbarMobileMenu.tsx
 * RÔLE : Menu mobile. Lien "Collaboration" renommé en "Collaborons",
 * cohérent avec la navbar bureau.
 */
"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function NavbarMobileMenu({ estPremium }: { estPremium: boolean }) {
  const [ouvert, setOuvert] = useState(false);
  const panneauRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return;

    function fermerSiClicDehors(e: MouseEvent | TouchEvent) {
      if (panneauRef.current && !panneauRef.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    }

    document.addEventListener("mousedown", fermerSiClicDehors);
    document.addEventListener("touchstart", fermerSiClicDehors);
    return () => {
      document.removeEventListener("mousedown", fermerSiClicDehors);
      document.removeEventListener("touchstart", fermerSiClicDehors);
    };
  }, [ouvert]);

  const liens = [
    { href: "/", label: "Accueil" },
    { href: "/artistes", label: "Artistes" },
    { href: "/sons", label: "Sons" },
    { href: "/clips", label: "Clips" },
    { href: "/collaboration", label: "Collaborons" },
    ...(estPremium ? [] : [{ href: "/abonnez-vous", label: "Abonnez-vous", accent: true }]),
    { href: "/contact", label: "Contact" },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOuvert(true)}
        aria-label="Ouvrir le menu"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-paper hover:bg-ink-soft"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {ouvert && (
        <div className="fixed inset-0 z-[999] bg-ink">
          <div ref={panneauRef} className="mx-4 mt-16 rounded-2xl border border-white/10 bg-ink-soft p-2 shadow-2xl">
            {liens.map((lien) => (
              <Link
                key={lien.href}
                href={lien.href}
                onClick={() => setOuvert(false)}
                className={`block rounded-xl px-4 py-3 text-base font-semibold ${
                  lien.accent ? "text-copper" : "text-paper"
                } hover:bg-ink-softer`}
              >
                {lien.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}