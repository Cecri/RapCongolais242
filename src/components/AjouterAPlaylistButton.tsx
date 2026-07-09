/**
 * FICHIER : src/components/AjouterAPlaylistButton.tsx
 * RÔLE : Bouton "+" pour ajouter un son à une playlist. Après un clic
 * sur une playlist :
 * - si le son n'y était pas encore → ajout, coche verte affichée
 * - si le son y était déjà → message "déjà dans cette playlist"
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ajouterSonAPlaylist } from "@/app/(site)/mes-playlists/actions";
import { sonDejaDansPlaylist } from "@/lib/playlistHelpers";

type Playlist = { id: string; name: string };

export default function AjouterAPlaylistButton({ trackId, estConnecte }: { trackId: string; estConnecte: boolean }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[] | null>(null);
  const [message, setMessage] = useState<{ texte: string; type: "succes" | "info" } | null>(null);
  const conteneurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fermerSiClicDehors(e: MouseEvent) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) {
        setOuvert(false);
        setMessage(null);
      }
    }
    document.addEventListener("mousedown", fermerSiClicDehors);
    return () => document.removeEventListener("mousedown", fermerSiClicDehors);
  }, []);

  async function handleClic(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!estConnecte) {
      router.push("/connexion");
      return;
    }

    setMessage(null);
    const reponse = await fetch(`/api/mes-playlists-liste`);
    const data: Playlist[] = await reponse.json();
    setPlaylists(data);

    if (data.length === 0) {
      router.push("/mes-playlists");
      return;
    }

    setOuvert((o) => !o);
  }

  async function choisir(playlistId: string) {
    const dejaPresent = await sonDejaDansPlaylist(playlistId, trackId);

    if (dejaPresent) {
      setMessage({ texte: "Déjà dans cette playlist", type: "info" });
      return;
    }

    await ajouterSonAPlaylist(playlistId, trackId);
    setMessage({ texte: "✓ Ajouté", type: "succes" });
    router.refresh();

    setTimeout(() => {
      setOuvert(false);
      setMessage(null);
    }, 1200);
  }

  return (
    <div className="relative" ref={conteneurRef}>
      <button onClick={handleClic} aria-label="Ajouter à une playlist" className="text-sm text-ash hover:text-paper">+</button>

      {ouvert && playlists && playlists.length > 0 && (
        <div className="absolute bottom-full right-0 z-20 mb-2 w-48 rounded-lg border border-white/10 bg-ink-soft py-2 shadow-lg">
          {message ? (
            <p className={`px-3 py-2 text-sm ${message.type === "succes" ? "text-emerald" : "text-ash"}`}>{message.texte}</p>
          ) : (
            playlists.map((p) => (
              <button key={p.id} onClick={() => choisir(p.id)} className="block w-full px-3 py-2 text-left text-sm hover:bg-ink-softer">
                {p.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}