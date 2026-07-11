/**
 * FICHIER : src/app/admin/news/actions.ts
 * RÔLE : Server Actions pour gérer les actualités affichées sur
 * l'accueil (sorties à venir, clashs, concerts...).
 */
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type EtatFormulaire = { erreur?: string } | undefined;

const NewsSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  content: z.string().min(10, "Le contenu doit faire au moins 10 caractères"),
  imageUrl: z.string().optional(),
});

export async function creerNews(data: { title: string; content: string; imageUrl?: string }): Promise<EtatFormulaire> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { erreur: "Non autorisé." };

  const resultat = NewsSchema.safeParse(data);
  if (!resultat.success) return { erreur: resultat.error.issues[0].message };

  await prisma.newsPost.create({
    data: { title: resultat.data.title, content: resultat.data.content, imageUrl: resultat.data.imageUrl || null },
  });

  revalidatePath("/admin/news");
  revalidatePath("/");
  redirect("/admin/news");
}

export async function modifierNews(id: string, data: { title: string; content: string; imageUrl?: string }): Promise<EtatFormulaire> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { erreur: "Non autorisé." };

  const resultat = NewsSchema.safeParse(data);
  if (!resultat.success) return { erreur: resultat.error.issues[0].message };

  await prisma.newsPost.update({
    where: { id },
    data: { title: resultat.data.title, content: resultat.data.content, ...(resultat.data.imageUrl ? { imageUrl: resultat.data.imageUrl } : {}) },
  });

  revalidatePath("/admin/news");
  revalidatePath("/");
  redirect("/admin/news");
}

export async function togglePublishNews(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Non autorisé.");

  const news = await prisma.newsPost.findUnique({ where: { id } });
  if (!news) return;

  await prisma.newsPost.update({ where: { id }, data: { isPublished: !news.isPublished } });
  revalidatePath("/admin/news");
  revalidatePath("/");
}

export async function supprimerNews(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Non autorisé.");

  await prisma.newsPost.delete({ where: { id } });
  revalidatePath("/admin/news");
  revalidatePath("/");
}