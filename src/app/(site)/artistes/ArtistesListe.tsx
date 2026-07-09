/**
 * FICHIER : src/app/(site)/artistes/ArtistesListe.tsx
 * RÔLE : Partie interactive de /artistes — recherche, filtre par genre,
 * tri (récent/nom/note/actifs), "voir plus". Reçoit les artistes déjà
 * calculés par page.tsx (Server Component).
 */
"use client";

import { useState } from "react";
import ArtistCard from "@/components/ArtistCard";
import SoumissionBanner from "@/components/SoumissionBanner";

type Artiste = {
  slug: string;
  name: string;
  country: string;
  genre: string | null;
  photoUrl: string | null;
  note: number | null;
  nbSons: number;
  derniereSortie: string;
};

const CRITERES_TRI = { recent: "Dernière sortie", nom: "Nom (A-Z)", note: "Mieux notés", actifs: "Plus actifs" };
const TAILLE_PAGE = 8;

export default function ArtistesListe({ artistes }: { artistes: Artiste[] }) {
  const [recherche, setRecherche] = useState("");
  const [genreFiltre, setGenreFiltre] = useState("Tous les styles");
  const [tri, setTri] = useState<keyof typeof CRITERES_TRI>("recent");
  const [nombreAffiche, setNombreAffiche] = useState(TAILLE_PAGE);

  const genresDisponibles = Array.from(new Set(artistes.map((a) => a.genre).filter(Boolean))) as string[];

  const artistesFiltres = artistes
    .filter((a) => {
      const correspondRecherche = a.name.toLowerCase().includes(recherche.toLowerCase());
      const correspondGenre = genreFiltre === "Tous les styles" || a.genre === genreFiltre;
      return correspondRecherche && correspondGenre;
    })
    .sort((a, b) => {
      if (tri === "nom") return a.name.localeCompare(b.name);
      if (tri === "note") return (b.note ?? -1) - (a.note ?? -1);
      if (tri === "actifs") return b.nbSons - a.nbSons;
      return new Date(b.derniereSortie).getTime() - new Date(a.derniereSortie).getTime();
    });

  const artistesAffiches = artistesFiltres.slice(0, nombreAffiche);
  const ilResteDesArtistes = artistesFiltres.length > nombreAffiche;

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Rechercher un artiste..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="min-w-60 flex-1 rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm placeholder:text-ash focus:border-copper focus:outline-none"
        />
        <select value={genreFiltre} onChange={(e) => setGenreFiltre(e.target.value)} className="rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none">
          <option>Tous les styles</option>
          {genresDisponibles.map((g) => (<option key={g}>{g}</option>))}
        </select>
        <select value={tri} onChange={(e) => setTri(e.target.value as keyof typeof CRITERES_TRI)} className="rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none">
          {Object.entries(CRITERES_TRI).map(([valeur, label]) => (<option key={valeur} value={valeur}>Trier par : {label}</option>))}
        </select>
      </div>

      <section className="mt-8 pb-4">
        {artistesAffiches.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {artistesAffiches.map((a) => (<ArtistCard key={a.slug} {...a} />))}
            </div>
            {ilResteDesArtistes && (
              <div className="mt-10 flex justify-center">
                <button onClick={() => setNombreAffiche((n) => n + TAILLE_PAGE)} className="rounded-lg border border-white/20 px-6 py-2.5 text-sm font-semibold hover:bg-ink-soft">Voir plus d&apos;artistes</button>
              </div>
            )}
          </>
        ) : (
          <p className="py-16 text-center text-ash">Aucun artiste ne correspond à ta recherche.</p>
        )}
      </section>

      <div className="pb-24">
        <SoumissionBanner />
      </div>
    </>
  );
}