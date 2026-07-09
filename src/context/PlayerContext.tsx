/**
 * FICHIER : src/context/PlayerContext.tsx
 * RÔLE : État global du lecteur. CORRECTIF de comportement : le bouton
 * "suivant" cliqué manuellement boucle TOUJOURS vers le premier son en
 * fin de playlist (peu importe le mode boucle) — comportement naturel
 * de navigation. Le mode "boucle" (🔁/🔂), lui, ne contrôle que ce qui
 * se passe quand un son se termine TOUT SEUL (fin naturelle) : off =
 * s'arrête au dernier son, file = reboucle automatiquement.
 */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { recupererSonLocal } from "@/lib/offlineStorage";

export type PlayerTrack = {
  id: string;
  title: string;
  artistName: string;
  audioUrl: string;
  coverUrl: string | null;
};

type ModeBoucle = "off" | "file" | "un-son";

type PlayerContextType = {
  currentTrack: PlayerTrack | null;
  queue: PlayerTrack[];
  indexActuel: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  aleatoire: boolean;
  boucle: ModeBoucle;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playTrack: (track: PlayerTrack) => void;
  playQueue: (tracks: PlayerTrack[], startIndex?: number) => void;
  suivant: () => void;
  precedent: () => void;
  togglePlay: () => void;
  seek: (secondes: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleAleatoire: () => void;
  toggleBoucle: () => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

function melanger<T>(tableau: T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [queueOriginale, setQueueOriginale] = useState<PlayerTrack[]>([]);
  const [indexActuel, setIndexActuel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [aleatoire, setAleatoire] = useState(false);
  const [boucle, setBoucle] = useState<ModeBoucle>("off");

  const currentTrack = queue[indexActuel] ?? null;

  const playTrack = useCallback((track: PlayerTrack) => {
    if (currentTrack?.id === track.id) {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) audio.play(); else audio.pause();
      return;
    }
    setQueue([track]);
    setQueueOriginale([track]);
    setIndexActuel(0);
  }, [currentTrack]);

  const playQueue = useCallback((tracks: PlayerTrack[], startIndex = 0) => {
    const trackVise = tracks[startIndex];
    if (currentTrack?.id === trackVise?.id) {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) audio.play(); else audio.pause();
      return;
    }
    setQueueOriginale(tracks);
    setQueue(aleatoire ? melanger(tracks) : tracks);
    setIndexActuel(startIndex);
  }, [aleatoire, currentTrack]);

  // Navigation MANUELLE (clic sur ⏭) : boucle toujours vers le début
  const suivant = useCallback(() => {
    setIndexActuel((i) => (i + 1 < queue.length ? i + 1 : 0));
  }, [queue.length]);

  // Navigation MANUELLE (clic sur ⏮) : boucle toujours vers la fin
  const precedent = useCallback(() => {
    setIndexActuel((i) => (i > 0 ? i - 1 : queue.length - 1));
  }, [queue.length]);

  // Avance AUTOMATIQUE (fin naturelle d'un son) : respecte le mode boucle
  const avancerAutomatiquement = useCallback(() => {
    setIndexActuel((i) => {
      if (i + 1 < queue.length) return i + 1;
      return boucle === "file" ? 0 : i;
    });
  }, [queue.length, boucle]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play(); else audio.pause();
  }, []);

  const seek = useCallback((secondes: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = secondes;
  }, []);

  const setVolume = useCallback((v: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = v;
    audio.muted = v === 0;
    setVolumeState(v);
    setIsMuted(v === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  }, []);

  const toggleAleatoire = useCallback(() => {
    setAleatoire((actif) => {
      const nouvelEtat = !actif;
      const track = queue[indexActuel];
      const nouvelleQueue = nouvelEtat ? melanger(queueOriginale) : queueOriginale;
      setQueue(nouvelleQueue);
      const nouvelIndex = track ? nouvelleQueue.findIndex((t) => t.id === track.id) : 0;
      setIndexActuel(nouvelIndex >= 0 ? nouvelIndex : 0);
      return nouvelEtat;
    });
  }, [queue, indexActuel, queueOriginale]);

  const toggleBoucle = useCallback(() => {
    setBoucle((m) => (m === "off" ? "file" : m === "file" ? "un-son" : "off"));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    let urlLocaleTemporaire: string | null = null;

    recupererSonLocal(currentTrack.id).then((urlLocale) => {
      audio.src = urlLocale || currentTrack.audioUrl;
      urlLocaleTemporaire = urlLocale;
      audio.volume = volume;
      audio.play().catch(() => {});
    });

    return () => {
      if (urlLocaleTemporaire) URL.revokeObjectURL(urlLocaleTemporaire);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  function handleFin() {
    setIsPlaying(false);
    if (boucle === "un-son") {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
      return;
    }
    avancerAutomatiquement();
  }

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        indexActuel,
        isPlaying,
        progress,
        duration,
        volume,
        isMuted,
        aleatoire,
        boucle,
        audioRef,
        playTrack,
        playQueue,
        suivant,
        precedent,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        toggleAleatoire,
        toggleBoucle,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={handleFin}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const contexte = useContext(PlayerContext);
  if (!contexte) {
    throw new Error("usePlayer() doit être utilisé à l'intérieur de <PlayerProvider>");
  }
  return contexte;
}