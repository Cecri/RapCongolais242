/**
 * FICHIER : src/components/AjouterAPlaylistButton.tsx
 * RÔLE : Bouton "+" qui ouvre un petit menu pour ajouter le son à une
 * playlist existante. N'apparaît que si le son a un vrai audioUrl
 * (droits acquis) — cohérent avec la règle de ajouterSonAPlaylist.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ajouterSonAPlaylist } from "@/app/(site)/mes-playlists/actions";

type Playlist = { id: string; name: string };

export default function AjouterAPlaylistButton({ trackId, estConnecte }: { trackId: string; estConnecte: boolean }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[] | null>(null);
  const conteneurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fermerSiClicDehors(e: MouseEvent) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) setOuvert(false);
    }
    document.addEventListener("mousedown", fermerSiClicDehors);
    return () => document.removeEventListener("mousedown", fermerSiClicDehors);
  }, []);

  async function ouvrirMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!ouvert && playlists === null) {
      const reponse = await fetch(`/api/mes-playlists-liste`);
      const data = await reponse.json();
      setPlaylists(data);
    }
    setOuvert((o) => !o);
  }

  async function choisir(playlistId: string) {
    await ajouterSonAPlaylist(playlistId, trackId);
    setOuvert(false);
    router.refresh();
  }

  if (!estConnecte) return null;

  return (
    <div className="relative" ref={conteneurRef}>
      <button onClick={ouvrirMenu} aria-label="Ajouter à une playlist" className="text-sm text-ash hover:text-paper">+</button>

      {ouvert && (
        <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border border-white/10 bg-ink-soft py-2 shadow-lg">
          {playlists === null && <p className="px-3 py-2 text-xs text-ash">Chargement...</p>}
          {playlists?.length === 0 && <p className="px-3 py-2 text-xs text-ash">Aucune playlist — crée-en une depuis &quot;Mes playlists&quot;.</p>}
          {playlists?.map((p) => (
            <button key={p.id} onClick={() => choisir(p.id)} className="block w-full px-3 py-2 text-left text-sm hover:bg-ink-softer">
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}