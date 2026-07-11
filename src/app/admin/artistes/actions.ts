/**
 * FICHIER : src/app/admin/artistes/actions.ts
 * RÔLE : Server Actions artistes/sons/albums.
 * - creerSon peut créer un album à la volée (albumMode="new").
 * - creerAlbum reste disponible séparément (page /admin/artistes/[id]/albums/nouveau)
 *   pour créer un album vide à l'avance, si tu préfères cette méthode.
 */
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type EtatFormulaire = { erreur?: string } | undefined;

function genererSlug(nom: string) {
  return nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
  stageName: string; country: string; genre?: string; bio?: string; photoUrl?: string;
  instagram?: string; youtube?: string; tiktok?: string; x?: string; contactEmail?: string; contactPhone?: string;
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
  data: { stageName: string; country: string; genre?: string; bio?: string; photoUrl?: string; instagram?: string; youtube?: string; tiktok?: string; x?: string; contactEmail?: string; contactPhone?: string; }
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
  releaseDate: z.string().optional(),
  albumMode: z.enum(["none", "new", "existing"]).default("none"),
  albumId: z.string().optional(),
  newAlbumTitle: z.string().optional(),
  newAlbumType: z.enum(["ALBUM", "EP", "MIXTAPE", "SINGLE"]).optional(),
  featuringNames: z.string().optional(),
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

async function resoudreFeaturing(featuringNames: string | undefined, artistIdPrincipal: string): Promise<string[]> {
  if (!featuringNames?.trim()) return [];

  const noms = featuringNames.split(",").map((n) => n.trim()).filter(Boolean);
  const ids: string[] = [];

  for (const nom of noms) {
    const existant = await prisma.artist.findFirst({
      where: { stageName: { equals: nom, mode: "insensitive" } },
    });

    if (existant) {
      if (existant.id !== artistIdPrincipal) ids.push(existant.id);
      continue;
    }

    const slugBase = genererSlug(nom);
    const slugExistant = await prisma.artist.findUnique({ where: { slug: slugBase } });
    const slug = slugExistant ? `${slugBase}-${Date.now()}` : slugBase;

    const nouvelArtiste = await prisma.artist.create({
      data: { slug, stageName: nom, country: "À renseigner" },
    });
    ids.push(nouvelArtiste.id);
  }

  return ids;
}

export async function creerSon(data: {
  artistId: string; title: string; audioUrl?: string; externalUrl?: string; coverUrl?: string;
  isExclusive?: boolean; releaseDate?: string;
  albumMode?: "none" | "new" | "existing"; albumId?: string; newAlbumTitle?: string; newAlbumType?: "ALBUM" | "EP" | "MIXTAPE" | "SINGLE";
  featuringNames?: string;
}): Promise<EtatFormulaire> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { erreur: "Non autorisé." };

  const resultat = SonSchema.safeParse(data);
  if (!resultat.success) return { erreur: resultat.error.issues[0].message };

  if (!resultat.data.audioUrl && !resultat.data.externalUrl) {
    return { erreur: "Ajoute soit un fichier audio, soit un lien externe." };
  }

  if (resultat.data.albumMode === "new" && !resultat.data.newAlbumTitle?.trim()) {
    return { erreur: "Donne un nom au nouvel album." };
  }

  let coverUrl = resultat.data.coverUrl || null;
  if (!coverUrl && resultat.data.externalUrl) {
    coverUrl = await recupererPochetteAutomatique(resultat.data.externalUrl);
  }

  let albumIdFinal: string | null = null;
  if (resultat.data.albumMode === "new" && resultat.data.newAlbumTitle) {
    const nouvelAlbum = await prisma.album.create({
      data: {
        artistId: resultat.data.artistId,
        title: resultat.data.newAlbumTitle,
        type: resultat.data.newAlbumType || "ALBUM",
        releaseDate: resultat.data.releaseDate ? new Date(resultat.data.releaseDate) : new Date(),
        coverUrl: coverUrl || null,
      },
    });
    albumIdFinal = nouvelAlbum.id;
  } else if (resultat.data.albumMode === "existing" && resultat.data.albumId) {
    albumIdFinal = resultat.data.albumId;
  }

  const featuringIds = await resoudreFeaturing(resultat.data.featuringNames, resultat.data.artistId);

  await prisma.track.create({
    data: {
      artistId: resultat.data.artistId,
      title: resultat.data.title,
      audioUrl: resultat.data.audioUrl || null,
      externalUrl: resultat.data.externalUrl || null,
      coverUrl,
      isExclusive: resultat.data.isExclusive === true,
      releaseDate: resultat.data.releaseDate ? new Date(resultat.data.releaseDate) : new Date(),
      albumId: albumIdFinal,
      featuring: featuringIds.length > 0 ? { connect: featuringIds.map((id) => ({ id })) } : undefined,
    },
  });

  revalidatePath("/admin/artistes");
  revalidatePath(`/admin/artistes/${resultat.data.artistId}`);
  redirect(`/admin/artistes/${resultat.data.artistId}`);
}

export async function modifierSon(
  trackId: string,
  data: { title: string; audioUrl?: string; externalUrl?: string; coverUrl?: string; isExclusive?: boolean; releaseDate?: string; albumId?: string; featuringNames?: string; }
): Promise<EtatFormulaire> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { erreur: "Non autorisé." };

  const track = await prisma.track.findUnique({ where: { id: trackId } });
  if (!track) return { erreur: "Son introuvable." };

  const featuringIds = await resoudreFeaturing(data.featuringNames, track.artistId);

  await prisma.track.update({
    where: { id: trackId },
    data: {
      title: data.title,
      ...(data.audioUrl ? { audioUrl: data.audioUrl } : {}),
      externalUrl: data.externalUrl || null,
      ...(data.coverUrl ? { coverUrl: data.coverUrl } : {}),
      isExclusive: data.isExclusive === true,
      ...(data.releaseDate ? { releaseDate: new Date(data.releaseDate) } : {}),
      albumId: data.albumId || null,
      featuring: { set: featuringIds.map((id) => ({ id })) },
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

const AlbumSchema = z.object({
  artistId: z.string().min(1),
  title: z.string().min(1, "Le titre est requis"),
  type: z.enum(["ALBUM", "EP", "MIXTAPE", "SINGLE"]),
  releaseDate: z.string().min(1, "La date de sortie est requise"),
  coverUrl: z.string().optional(),
});

export async function creerAlbum(data: {
  artistId: string; title: string; type: "ALBUM" | "EP" | "MIXTAPE" | "SINGLE"; releaseDate: string; coverUrl?: string;
}): Promise<EtatFormulaire> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { erreur: "Non autorisé." };

  const resultat = AlbumSchema.safeParse(data);
  if (!resultat.success) return { erreur: resultat.error.issues[0].message };

  await prisma.album.create({
    data: {
      artistId: resultat.data.artistId,
      title: resultat.data.title,
      type: resultat.data.type,
      releaseDate: new Date(resultat.data.releaseDate),
      coverUrl: resultat.data.coverUrl || null,
    },
  });

  revalidatePath(`/admin/artistes/${data.artistId}`);
  redirect(`/admin/artistes/${data.artistId}`);
}

export async function supprimerAlbum(albumId: string, artistId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Non autorisé.");
  await prisma.album.delete({ where: { id: albumId } });
  revalidatePath(`/admin/artistes/${artistId}`);
}

export async function toggleSortieDeLaSemaine(trackId: string, artistId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Non autorisé.");

  const track = await prisma.track.findUnique({ where: { id: trackId } });
  if (!track) return;

  await prisma.track.update({
    where: { id: trackId },
    data: { isReleaseOfWeek: !track.isReleaseOfWeek },
  });

  revalidatePath(`/admin/artistes/${artistId}`);
  revalidatePath("/");
}