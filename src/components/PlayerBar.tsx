/**
 * FICHIER : src/components/PlayerBar.tsx
 * RÔLE : Barre de lecture fixe. Refonte visuelle : icônes SVG (au lieu
 * d'émojis), boutons actifs (aléatoire/boucle) avec fond cuivré en
 * surbrillance plutôt qu'un simple changement de couleur de texte.
 */
"use client";

import { usePlayer } from "@/context/PlayerContext";

function formaterTemps(secondes: number) {
  if (!isFinite(secondes)) return "0:00";
  const min = Math.floor(secondes / 60);
  const sec = Math.floor(secondes % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function IconShuffle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}
function IconSkipBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" /></svg>
  );
}
function IconSkipForward() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" /></svg>
  );
}
function IconPlay() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3" /></svg>;
}
function IconPause() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>;
}
function IconRepeat({ un_son }: { un_son: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
      {un_son && <text x="12" y="15" fontSize="8" fill="currentColor" stroke="none" textAnchor="middle">1</text>}
    </svg>
  );
}
function IconVolume({ niveau }: { niveau: "off" | "bas" | "haut" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
      {niveau !== "off" && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />}
      {niveau === "haut" && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />}
      {niveau === "off" && <line x1="23" y1="9" x2="17" y2="15" />}
      {niveau === "off" && <line x1="17" y1="9" x2="23" y2="15" />}
    </svg>
  );
}

export default function PlayerBar() {
  const {
    currentTrack,
    queue,
    indexActuel,
    isPlaying,
    progress,
    duration,
    togglePlay,
    seek,
    suivant,
    precedent,
    aleatoire,
    boucle,
    toggleAleatoire,
    toggleBoucle,
    volume,
    isMuted,
    setVolume,
    toggleMute,
  } = usePlayer();

  if (!currentTrack) return null;

  const enFileDattente = queue.length > 1;

  return (
    <div className="fixed inset-x-0 bottom-0 z-100 flex h-21 items-center gap-5 border-t border-white/15 bg-ink-soft px-6">
      <div className="flex w-60 shrink-0 items-center gap-3">
        <div className="h-13 w-13 shrink-0 overflow-hidden rounded-lg bg-ink-softer">
          {currentTrack.coverUrl && (
            <img src={currentTrack.coverUrl} alt="" className="h-full w-full scale-140 object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{currentTrack.title}</p>
          <p className="truncate text-xs text-ash">{currentTrack.artistName}</p>
        </div>
      </div>

      <div className="mx-auto flex max-w-xl flex-1 flex-col items-center gap-2">
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleAleatoire}
            aria-label="Lecture aléatoire"
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              aleatoire ? "bg-copper-dim text-copper" : "text-ash hover:bg-ink-softer hover:text-paper"
            }`}
          >
            <IconShuffle />
          </button>

          {enFileDattente && (
            <button onClick={precedent} aria-label="Précédent" className="flex h-8 w-8 items-center justify-center rounded-full text-paper hover:bg-ink-softer">
              <IconSkipBack />
            </button>
          )}

          <button
            aria-label={isPlaying ? "Mettre en pause" : "Lire"}
            onClick={togglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink"
          >
            {isPlaying ? <IconPause /> : <IconPlay />}
          </button>

          {enFileDattente && (
            <button onClick={suivant} aria-label="Suivant" className="flex h-8 w-8 items-center justify-center rounded-full text-paper hover:bg-ink-softer">
              <IconSkipForward />
            </button>
          )}

          <button
            onClick={toggleBoucle}
            aria-label="Mode boucle"
            title={boucle === "off" ? "Boucle désactivée" : boucle === "file" ? "Boucle sur la file" : "Boucle sur ce son"}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              boucle !== "off" ? "bg-copper-dim text-copper" : "text-ash hover:bg-ink-softer hover:text-paper"
            }`}
          >
            <IconRepeat un_son={boucle === "un-son"} />
          </button>
        </div>

        <div className="flex w-full items-center gap-2.5 font-mono text-[11px] text-ash">
          <span>{formaterTemps(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={(e) => seek(Number(e.target.value))}
            className="h-[3px] flex-1 accent-copper"
          />
          <span>{formaterTemps(duration)}</span>
        </div>
      </div>

      <VolumeControl volume={volume} isMuted={isMuted} setVolume={setVolume} toggleMute={toggleMute} />
    </div>
  );
}

function VolumeControl({
  volume,
  isMuted,
  setVolume,
  toggleMute,
}: {
  volume: number;
  isMuted: boolean;
  setVolume: (v: number) => void;
  toggleMute: () => void;
}) {
  const niveau = isMuted || volume === 0 ? "off" : volume < 0.5 ? "bas" : "haut";

  return (
    <div className="group flex w-50 shrink-0 items-center justify-end gap-2">
      <div className="w-0 overflow-hidden opacity-0 transition-all group-hover:w-20 group-hover:opacity-100">
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="h-[3px] w-full accent-copper"
        />
      </div>
      <button
        aria-label={isMuted ? "Réactiver le son" : "Couper le son"}
        onClick={toggleMute}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ash hover:bg-ink-softer hover:text-paper"
      >
        <IconVolume niveau={niveau} />
      </button>
    </div>
  );
}