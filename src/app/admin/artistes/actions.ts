/**
 * FICHIER : src/app/admin/artistes/actions.ts
 * RÔLE : Server Actions complètes pour la gestion des artistes et des
 * sons — création (déjà existante), et maintenant modification et
 * suppression. La suppression d'un artiste supprime automatiquement
 * tous ses sons (onDelete: Cascade défini dans schema.prisma).
 */
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type EtatFormulaire = { erreur?: string } | undefined;

function genererSlug(nom: string) {
  return nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ArtisteSchema = z.object({
  stageName: z.string().min(1, "Le nom de scène est requis"),
  country: z.string().min(1, "Le pays est requis"),
  genre: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  tiktok: z.string().optional(),
  x: z.string().optional(),
  contactEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
});

export async function creerArtiste(data: {
  stageName: string;
  country: string;
  genre?: string;
  bio?: string;
  photoUrl?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  x?: string;
  contactEmail?: string;
  contactPhone?: string;
}): Promise<EtatFormulaire> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { erreur: "Non autorisé." };

  const resultat = ArtisteSchema.safeParse(data);
  if (!resultat.success) return { erreur: resultat.error.issues[0].message };

  const slugBase = genererSlug(resultat.data.stageName);
  const slugExistant = await prisma.artist.findUnique({ where: { slug: slugBase } });
  const slug = slugExistant ? `${slugBase}-${Date.now()}` : slugBase;

  await prisma.artist.create({
    data: {
      slug,
      stageName: resultat.data.stageName,
      country: resultat.data.country,
      genre: resultat.data.genre || null,
      bio: resultat.data.bio || null,
      photoUrl: resultat.data.photoUrl || null,
      instagram: resultat.data.instagram || null,
      youtube: resultat.data.youtube || null,
      tiktok: resultat.data.tiktok || null,
      x: resultat.data.x || null,
      contactEmail: resultat.data.contactEmail || null,
      contactPhone: resultat.data.contactPhone || null,
    },
  });

  revalidatePath("/admin/artistes");
  redirect("/admin/artistes");
}

export async function modifierArtiste(
  artistId: string,
  data: {
    stageName: string;
    country: string;
    genre?: string;
    bio?: string;
    photoUrl?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    x?: string;
    contactEmail?: string;
    contactPhone?: string;
  }
): Promise<EtatFormulaire> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { erreur: "Non autorisé." };

  const resultat = ArtisteSchema.safeParse(data);
  if (!resultat.success) return { erreur: resultat.error.issues[0].message };

  await prisma.artist.update({
    where: { id: artistId },
    data: {
      stageName: resultat.data.stageName,
      country: resultat.data.country,
      genre: resultat.data.genre || null,
      bio: resultat.data.bio || null,
      ...(resultat.data.photoUrl ? { photoUrl: resultat.data.photoUrl } : {}),
      instagram: resultat.data.instagram || null,
      youtube: resultat.data.youtube || null,
      tiktok: resultat.data.tiktok || null,
      x: resultat.data.x || null,
      contactEmail: resultat.data.contactEmail || null,
      contactPhone: resultat.data.contactPhone || null,
    },
  });

  revalidatePath("/admin/artistes");
  revalidatePath(`/admin/artistes/${artistId}`);
  redirect(`/admin/artistes/${artistId}`);
}

export async function supprimerArtiste(artistId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Non autorisé.");

  await prisma.artist.delete({ where: { id: artistId } });

  revalidatePath("/admin/artistes");
  redirect("/admin/artistes");
}

const SonSchema = z.object({
  artistId: z.string().min(1),
  title: z.string().min(1, "Le titre est requis"),
  audioUrl: z.string().optional(),
  externalUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  coverUrl: z.string().optional(),
  isExclusive: z.boolean().optional(),
});

async function recupererPochetteAutomatique(url: string): Promise<string | null> {
  try {
    let oembedUrl: string | null = null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    } else if (url.includes("soundcloud.com")) {
      oembedUrl = `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    } else if (url.includes("open.spotify.com")) {
      oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
    }
    if (!oembedUrl) return null;
    const reponse = await fetch(oembedUrl);
    if (!reponse.ok) return null;
    const data = await reponse.json();
    return data.thumbnail_url || null;
  } catch {
    return null;
  }
}

export async function creerSon(data: {
  artistId: string;
  title: string;
  audioUrl?: string;
  externalUrl?: string;
  coverUrl?: string;
  isExclusive?: boolean;
}): Promise<EtatFormulaire> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { erreur: "Non autorisé." };

  const resultat = SonSchema.safeParse(data);
  if (!resultat.success) return { erreur: resultat.error.issues[0].message };

  if (!resultat.data.audioUrl && !resultat.data.externalUrl) {
    return { erreur: "Ajoute soit un fichier audio, soit un lien externe." };
  }

  let coverUrl = resultat.data.coverUrl || null;
  if (!coverUrl && resultat.data.externalUrl) {
    coverUrl = await recupererPochetteAutomatique(resultat.data.externalUrl);
  }

  await prisma.track.create({
    data: {
      artistId: resultat.data.artistId,
      title: resultat.data.title,
      audioUrl: resultat.data.audioUrl || null,
      externalUrl: resultat.data.externalUrl || null,
      coverUrl,
      isExclusive: resultat.data.isExclusive === true,
    },
  });

  revalidatePath("/admin/artistes");
  revalidatePath(`/admin/artistes/${resultat.data.artistId}`);
  redirect(`/admin/artistes/${resultat.data.artistId}`);
}

export async function modifierSon(
  trackId: string,
  data: {
    title: string;
    audioUrl?: string;
    externalUrl?: string;
    coverUrl?: string;
    isExclusive?: boolean;
  }
): Promise<EtatFormulaire> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { erreur: "Non autorisé." };

  const track = await prisma.track.findUnique({ where: { id: trackId } });
  if (!track) return { erreur: "Son introuvable." };

  await prisma.track.update({
    where: { id: trackId },
    data: {
      title: data.title,
      ...(data.audioUrl ? { audioUrl: data.audioUrl } : {}),
      externalUrl: data.externalUrl || null,
      ...(data.coverUrl ? { coverUrl: data.coverUrl } : {}),
      isExclusive: data.isExclusive === true,
    },
  });

  revalidatePath(`/admin/artistes/${track.artistId}`);
  redirect(`/admin/artistes/${track.artistId}`);
}

export async function supprimerSon(trackId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Non autorisé.");

  const track = await prisma.track.findUnique({ where: { id: trackId } });
  if (!track) return;

  await prisma.track.delete({ where: { id: trackId } });

  revalidatePath(`/admin/artistes/${track.artistId}`);
}