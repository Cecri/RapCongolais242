/**
 * FICHIER : src/components/PlayerBar.tsx
 * RÔLE : Barre de lecture fixe. Utilise maintenant un "portail" React
 * (createPortal) pour s'afficher directement à la racine du document
 * (document.body), plutôt que d'être imbriquée dans la structure du
 * site — règle définitivement les bugs de "position: fixed" cassée
 * par un parent (transform/filter quelconque), quelle qu'en soit la
 * cause exacte, en contournant complètement le problème.
 */
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePlayer } from "@/context/PlayerContext";

function formaterTemps(secondes: number) {
  if (!isFinite(secondes)) return "0:00";
  const min = Math.floor(secondes / 60);
  const sec = Math.floor(secondes % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function IconShuffle() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4">
      <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}
function IconSkipBack() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="sm:w-[17px] sm:h-[17px]"><polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" /></svg>;
}
function IconSkipForward() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="sm:w-[17px] sm:h-[17px]"><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" /></svg>;
}
function IconPlay() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="sm:w-[14px] sm:h-[14px]"><polygon points="6 3 20 12 6 21 6 3" /></svg>;
}
function IconPause() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="sm:w-[14px] sm:h-[14px]"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>;
}
function IconRepeat({ un_son }: { un_son: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4">
      <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
      {un_son && <text x="12" y="15" fontSize="8" fill="currentColor" stroke="none" textAnchor="middle">1</text>}
    </svg>
  );
}
function IconVolume({ niveau }: { niveau: "off" | "bas" | "haut" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
      {niveau !== "off" && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />}
      {niveau === "haut" && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />}
      {niveau === "off" && <line x1="23" y1="9" x2="17" y2="15" />}
      {niveau === "off" && <line x1="17" y1="9" x2="23" y2="15" />}
    </svg>
  );
}

function ContenuLecteur() {
  const {
    currentTrack, queue, isPlaying, progress, duration,
    togglePlay, seek, suivant, precedent, aleatoire, boucle,
    toggleAleatoire, toggleBoucle, volume, isMuted, setVolume, toggleMute,
  } = usePlayer();

  if (!currentTrack) return null;

  const enFileDattente = queue.length > 1;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] w-full max-w-full overflow-hidden border-t border-white/15 bg-ink-soft px-2 py-2 sm:px-6 sm:py-0">
      <div className="flex h-14 min-w-0 items-center gap-1.5 sm:h-21 sm:gap-5">
        <div className="flex w-16 shrink-0 items-center gap-1.5 sm:w-60 sm:gap-3">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-ink-softer sm:h-13 sm:w-13">
            {currentTrack.coverUrl && (
              <img src={currentTrack.coverUrl} alt="" className="h-full w-full scale-135 object-cover" />
            )}
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold">{currentTrack.title}</p>
            <p className="truncate text-xs text-ash">{currentTrack.artistName}</p>
          </div>
        </div>

        <div className="mx-auto flex max-w-xl flex-1 flex-col items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2.5">
            <button
              onClick={toggleAleatoire}
              aria-label="Lecture aléatoire"
              className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors sm:h-8 sm:w-8 ${
                aleatoire ? "bg-copper-dim text-copper" : "text-ash hover:bg-ink-softer hover:text-paper"
              }`}
            >
              <IconShuffle />
            </button>

            {enFileDattente && (
              <button onClick={precedent} aria-label="Précédent" className="flex h-6 w-6 items-center justify-center rounded-full text-paper hover:bg-ink-softer sm:h-8 sm:w-8">
                <IconSkipBack />
              </button>
            )}

            <button
              aria-label={isPlaying ? "Mettre en pause" : "Lire"}
              onClick={togglePlay}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-paper text-ink sm:h-9 sm:w-9"
            >
              {isPlaying ? <IconPause /> : <IconPlay />}
            </button>

            {enFileDattente && (
              <button onClick={suivant} aria-label="Suivant" className="flex h-6 w-6 items-center justify-center rounded-full text-paper hover:bg-ink-softer sm:h-8 sm:w-8">
                <IconSkipForward />
              </button>
            )}

            <button
              onClick={toggleBoucle}
              aria-label="Mode boucle"
              title={boucle === "off" ? "Boucle désactivée" : boucle === "file" ? "Boucle sur la file" : "Boucle sur ce son"}
              className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors sm:h-8 sm:w-8 ${
                boucle !== "off" ? "bg-copper-dim text-copper" : "text-ash hover:bg-ink-softer hover:text-paper"
              }`}
            >
              <IconRepeat un_son={boucle === "un-son"} />
            </button>
          </div>

          <div className="flex w-full items-center gap-1.5 font-mono text-[9px] text-ash sm:gap-2.5 sm:text-[11px]">
            <span className="hidden sm:inline">{formaterTemps(progress)}</span>
            <input
              type="range" min={0} max={duration || 0} value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="h-[3px] flex-1 accent-copper"
            />
            <span className="hidden sm:inline">{formaterTemps(duration)}</span>
          </div>
        </div>

        <div className="w-9 shrink-0 sm:w-50">
          <VolumeControl volume={volume} isMuted={isMuted} setVolume={setVolume} toggleMute={toggleMute} />
        </div>
      </div>
    </div>
  );
}

function VolumeControl({
  volume, isMuted, setVolume, toggleMute,
}: {
  volume: number; isMuted: boolean; setVolume: (v: number) => void; toggleMute: () => void;
}) {
  const niveau = isMuted || volume === 0 ? "off" : volume < 0.5 ? "bas" : "haut";

  return (
    <div className="group flex items-center justify-end gap-2 sm:w-full">
      <div className="hidden w-0 overflow-hidden opacity-0 transition-all sm:block sm:group-hover:w-20 sm:group-hover:opacity-100">
        <input
          type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="h-[3px] w-full accent-copper"
        />
      </div>
      <button aria-label={isMuted ? "Réactiver le son" : "Couper le son"} onClick={toggleMute} className="flex h-6 w-6 items-center justify-center rounded-full text-ash hover:bg-ink-softer hover:text-paper sm:h-8 sm:w-8">
        <IconVolume niveau={niveau} />
      </button>
    </div>
  );
}

export default function PlayerBar() {
  const [monte, setMonte] = useState(false);

  useEffect(() => {
    setMonte(true);
  }, []);

  if (!monte) return null;

  return createPortal(<ContenuLecteur />, document.body);
}