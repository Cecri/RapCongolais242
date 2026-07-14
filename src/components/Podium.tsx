/**
 * FICHIER : src/components/Podium.tsx
 * RÔLE : Podium visuel. Icônes play/pause en SVG (plus de caractères
 * texte "▶"/"⏸" qui s'affichaient en emoji coloré sur certains
 * appareils/navigateurs).
 */
"use client";

import Link from "next/link";
import { usePlayer, type PlayerTrack } from "@/context/PlayerContext";
import { IconPlaySmall, IconPauseSmall, IconLock } from "@/components/PlayPauseIcon";

type SonAffichage = {
  id: string;
  title: string;
  coverUrl: string | null;
  isExclusive: boolean;
  artistName: string;
  artistSlug: string;
  audioUrl: string | null;
  externalUrl: string | null;
  verrouille: boolean;
  estPremium: boolean;
  estConnecte: boolean;
  playsCount?: number;
};

export default function Podium({ sons, queueContext }: { sons: SonAffichage[]; queueContext: PlayerTrack[] }) {
  const [premier, deuxieme, troisieme, ...reste] = sons;
  if (!premier) return null;

  return (
    <div>
      <div className="flex items-end justify-center gap-2 sm:gap-4">
        {deuxieme && <PodiumMarche son={deuxieme} rang={2} hauteur="h-24 sm:h-32" queueContext={queueContext} />}
        <PodiumMarche son={premier} rang={1} hauteur="h-32 sm:h-44" queueContext={queueContext} />
        {troisieme && <PodiumMarche son={troisieme} rang={3} hauteur="h-20 sm:h-28" queueContext={queueContext} />}
      </div>

      {reste.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
          {reste.map((son) => (
            <PodiumResteItem key={son.id} son={son} queueContext={queueContext} />
          ))}
        </div>
      )}
    </div>
  );
}

function PodiumMarche({
  son,
  rang,
  hauteur,
  queueContext,
}: {
  son: SonAffichage;
  rang: 1 | 2 | 3;
  hauteur: string;
  queueContext: PlayerTrack[];
}) {
  const { playQueue, currentTrack, isPlaying } = usePlayer();
  const medailles = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const largeurs = { 1: "w-24 sm:w-32", 2: "w-20 sm:w-28", 3: "w-20 sm:w-28" };
  const estEnCours = currentTrack?.id === son.id && isPlaying;

  function handleClic() {
    if (son.verrouille || !son.audioUrl) return;
    const index = queueContext.findIndex((t) => t.id === son.id);
    if (index >= 0) playQueue(queueContext, index);
  }

  if (son.verrouille) {
    return (
      <Link href="/abonnez-vous" className={`flex flex-col items-center ${largeurs[rang]}`}>
        <span className="text-lg sm:text-2xl">{medailles[rang]}</span>
        <div className="relative mt-1 aspect-square w-full overflow-hidden rounded-xl bg-ink-softer">
          {son.coverUrl && <img src={son.coverUrl} alt="" className="h-full w-full object-cover" />}
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-paper"><IconLock /></span>
        </div>
        <p className="mt-1.5 w-full truncate text-center text-[11px] font-semibold sm:text-xs">{son.title}</p>
        <p className="w-full truncate text-center text-[10px] text-ash">{son.artistName}</p>
        <div className={`mt-1.5 w-full rounded-t-lg bg-copper-dim ${hauteur} flex items-start justify-center pt-1.5`}>
          <span className="font-display text-lg font-bold text-copper sm:text-xl">{rang}</span>
        </div>
      </Link>
    );
  }

  return (
    <button onClick={handleClic} className={`flex flex-col items-center ${largeurs[rang]}`}>
      <span className="text-lg sm:text-2xl">{medailles[rang]}</span>
      <div className="group relative mt-1 aspect-square w-full overflow-hidden rounded-xl bg-ink-softer">
        {son.coverUrl ? (
          <img src={son.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-lg text-white/15">♪</div>
        )}
        <span className={`absolute inset-0 flex items-center justify-center bg-black/40 text-paper transition-opacity ${estEnCours ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"}`}>
          {estEnCours ? <IconPauseSmall /> : <IconPlaySmall />}
        </span>
      </div>
      <p className="mt-1.5 w-full truncate text-center text-[11px] font-semibold sm:text-xs">{son.title}</p>
      <p className="w-full truncate text-center text-[10px] text-ash">{son.artistName}</p>
      <div className={`mt-1.5 w-full rounded-t-lg bg-copper-dim ${hauteur} flex items-start justify-center pt-1.5`}>
        <span className="font-display text-lg font-bold text-copper sm:text-xl">{rang}</span>
      </div>
      {son.playsCount !== undefined && (
        <p className="mt-1 font-mono text-[9px] text-ash">{son.playsCount} écoutes</p>
      )}
    </button>
  );
}

function PodiumResteItem({ son, queueContext }: { son: SonAffichage; queueContext: PlayerTrack[] }) {
  const { playQueue, currentTrack, isPlaying } = usePlayer();
  const estEnCours = currentTrack?.id === son.id && isPlaying;

  function handleClic() {
    if (son.verrouille || !son.audioUrl) return;
    const index = queueContext.findIndex((t) => t.id === son.id);
    if (index >= 0) playQueue(queueContext, index);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-soft transition-colors hover:border-white/20">
      {son.verrouille ? (
        <Link href="/abonnez-vous" className="relative block aspect-square overflow-hidden rounded-t-2xl bg-ink-softer">
          {son.coverUrl && <img src={son.coverUrl} alt="" className="h-full w-full object-cover" />}
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-paper"><IconLock /></span>
        </Link>
      ) : (
        <button onClick={handleClic} className="group relative block aspect-square w-full overflow-hidden rounded-t-2xl bg-ink-softer">
          {son.coverUrl ? (
            <img src={son.coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-3xl text-white/15">♪</div>
          )}
          <span className={`absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-ember text-paper transition-opacity ${estEnCours ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"}`}>
            {estEnCours ? <IconPauseSmall /> : <IconPlaySmall />}
          </span>
        </button>
      )}
      <div className="px-4 py-3.5">
        <p className="truncate text-sm font-semibold">{son.title}</p>
        <p className="truncate text-xs text-ash">{son.artistName}</p>
      </div>
    </div>
  );
}