/**
 * FICHIER : src/app/(site)/artistes/[slug]/page.tsx
 * RÔLE : Profil public d'un artiste. Discographie en liste verticale
 * (SonListItem), avec les mêmes fonctionnalités que partout ailleurs
 * sur le site (lecture réelle, favoris, playlist).
 */
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { estUtilisateurPremium } from "@/lib/premium";
import { notFound } from "next/navigation";
import RatingStars from "@/components/RatingStars";
import SonListItem from "@/components/SonListItem";

export default async function ArtisteProfil({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const artiste = await prisma.artist.findUnique({
    where: { slug },
    include: { tracks: { orderBy: { publishedAt: "desc" } }, ratings: true },
  });

  if (!artiste) notFound();

  const session = await auth();
  const estPremium = session?.user?.id ? await estUtilisateurPremium(session.user.id) : false;
  const estConnecte = !!session?.user;

  const note = artiste.ratings.length > 0
    ? artiste.ratings.reduce((somme, r) => somme + r.score, 0) / artiste.ratings.length
    : null;

  const initiales = artiste.stageName.split(" ").map((m) => m[0]).slice(0, 2).join("").toUpperCase();

  const reseaux = [
    { label: "Instagram", url: artiste.instagram },
    { label: "YouTube", url: artiste.youtube },
    { label: "TikTok", url: artiste.tiktok },
    { label: "X", url: artiste.x },
  ].filter((r) => r.url);

  const aDesInfosContact = artiste.contactEmail || artiste.contactPhone;

  const sons = artiste.tracks.map((track) => {
    const verrouille = track.isExclusive && !estPremium;
    return {
      id: track.id,
      title: track.title,
      coverUrl: track.coverUrl,
      isExclusive: track.isExclusive,
      artistName: artiste.stageName,
      audioUrl: verrouille ? null : track.audioUrl,
      externalUrl: track.externalUrl,
      verrouille,
      estConnecte,
    };
  });

  return (
    <main className="mx-auto max-w-6xl px-8 pb-24">
      <header className="flex flex-col gap-8 pt-14 md:flex-row md:items-end">
        <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-ink-softer font-display text-4xl">
          {artiste.photoUrl ? (
            <img src={artiste.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : initiales}
        </div>
        <div className="flex-1">
          {note !== null && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-copper-dim px-3 py-1 font-mono text-xs font-semibold text-copper">★ {note.toFixed(1)} / 5 ({artiste.ratings.length} avis)</span>
          )}
          <h1 className="mt-3.5 font-display text-4xl font-bold">{artiste.stageName}</h1>
          <p className="mt-1.5 text-paper-dim">{artiste.country} · {artiste.genre ?? "—"} · {artiste.tracks.length} titre{artiste.tracks.length !== 1 ? "s" : ""}</p>
          <div className="mt-3">
            <RatingStars artistId={artiste.id} slug={artiste.slug} estConnecte={estConnecte} />
          </div>
        </div>
      </header>

      <div className="mt-14 grid gap-12 md:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-display text-xl font-semibold">Discographie</h2>
          <div className="mt-5 flex flex-col gap-3">
            {sons.length === 0 && <p className="text-sm text-ash">Aucun titre pour l&apos;instant.</p>}
            {sons.map((son, i) => (<SonListItem key={son.id} {...son} numero={i + 1} />))}
          </div>

          {artiste.bio && (
            <>
              <h2 className="mt-14 font-display text-xl font-semibold">À propos</h2>
              <p className="mt-4 max-w-xl text-paper-dim">{artiste.bio}</p>
            </>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-white/10 bg-ink-soft p-6">
          <h3 className="font-semibold">Informations</h3>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <div className="flex justify-between border-b border-white/10 pb-3"><dt className="text-ash">Pays</dt><dd>{artiste.country}</dd></div>
            <div className="flex justify-between border-b border-white/10 pb-3"><dt className="text-ash">Style</dt><dd>{artiste.genre ?? "—"}</dd></div>
            {note !== null && <div className="flex justify-between"><dt className="text-ash">Note moyenne</dt><dd>{note.toFixed(1)} / 5</dd></div>}
          </dl>

          {reseaux.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-5">
              {reseaux.map((r) => (
                <a key={r.label} href={r.url!} target="_blank" rel="noopener noreferrer" className="text-sm text-copper hover:text-copper/80">
                  {r.label}
                </a>
              ))}
            </div>
          )}

          {aDesInfosContact && (
            <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-5 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-ash">Contact</p>
              {artiste.contactEmail && <a href={`mailto:${artiste.contactEmail}`} className="text-paper-dim hover:text-paper">{artiste.contactEmail}</a>}
              {artiste.contactPhone && <a href={`tel:${artiste.contactPhone}`} className="text-paper-dim hover:text-paper">{artiste.contactPhone}</a>}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}