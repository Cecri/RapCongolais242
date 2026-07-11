/**
 * FICHIER : src/app/admin/collaborations/actions.ts
 * RÔLE : Change le statut d'une demande de collaboration.
 */
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function changerStatutCollaboration(id: string, status: "PENDING" | "CONTACTED" | "CLOSED") {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Non autorisé.");

  await prisma.collaborationRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin/collaborations");
}