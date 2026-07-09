/**
 * FICHIER : src/app/(site)/sons/SonsListe.tsx
 * RÔLE : Partie interactive de /sons — recherche, filtre, tri, "voir plus".
 */
"use client";

import { useState } from "react";
import SonCard from "@/components/SonCard";

type Son = {
  id: string;
  title: string;
  coverUrl: string | null;
  isExclusive: boolean;
  publishedAt: string;
  artistName: string;
  artistSlug: string;
  audioUrl: string | null;
  externalUrl: string | null;
  verrouille: boolean;
  estPremium: boolean;
  estConnecte: boolean;
};

const CRITERES_TRI = { recent: "Plus récent", ancien: "Plus ancien", nom: "Titre (A-Z)" };
const TAILLE_PAGE = 12;

export default function SonsListe({ sons }: { sons: Son[] }) {
  const [recherche, setRecherche] = useState("");
  const [exclusifsUniquement, setExclusifsUniquement] = useState(false);
  const [tri, setTri] = useState<keyof typeof CRITERES_TRI>("recent");
  const [nombreAffiche, setNombreAffiche] = useState(TAILLE_PAGE);

  const sonsFiltres = sons
    .filter((son) => {
      const correspondRecherche = son.title.toLowerCase().includes(recherche.toLowerCase()) || son.artistName.toLowerCase().includes(recherche.toLowerCase());
      const correspondExclusif = !exclusifsUniquement || son.isExclusive;
      return correspondRecherche && correspondExclusif;
    })
    .sort((a, b) => {
      if (tri === "nom") return a.title.localeCompare(b.title);
      if (tri === "ancien") return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

  const sonsAffiches = sonsFiltres.slice(0, nombreAffiche);
  const ilResteDesSons = sonsFiltres.length > nombreAffiche;

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <input type="text" placeholder="Rechercher un son ou un artiste..." value={recherche} onChange={(e) => setRecherche(e.target.value)} className="min-w-60 flex-1 rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm placeholder:text-ash focus:border-copper focus:outline-none" />
        <select value={tri} onChange={(e) => setTri(e.target.value as keyof typeof CRITERES_TRI)} className="rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none">
          {Object.entries(CRITERES_TRI).map(([valeur, label]) => (<option key={valeur} value={valeur}>Trier par : {label}</option>))}
        </select>
        <label className="flex items-center gap-2 rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm">
          <input type="checkbox" checked={exclusifsUniquement} onChange={(e) => setExclusifsUniquement(e.target.checked)} />
          Exclusifs uniquement
        </label>
      </div>

      <section className="mt-8 pb-24">
        {sonsAffiches.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {sonsAffiches.map((son) => (<SonCard key={son.id} {...son} />))}
            </div>
            {ilResteDesSons && (
              <div className="mt-10 flex justify-center">
                <button onClick={() => setNombreAffiche((n) => n + TAILLE_PAGE)} className="rounded-lg border border-white/20 px-6 py-2.5 text-sm font-semibold hover:bg-ink-soft">Voir plus de sons</button>
              </div>
            )}
          </>
        ) : (
          <p className="py-16 text-center text-ash">Aucun son ne correspond à ta recherche.</p>
        )}
      </section>
    </>
  );
}