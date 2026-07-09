/**
 * FICHIER : src/app/inscription/actions.ts
 * RÔLE : Server Action pour la création d'un compte auditeur public
 * (différent des comptes admin, créés uniquement via scripts/create-admin.ts).
 * Rôle attribué automatiquement : USER (jamais ADMIN depuis ce formulaire).
 * Appelée par src/app/inscription/page.tsx.
 */
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";

export type EtatFormulaire = { erreur?: string } | undefined;

const InscriptionSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
});

export async function creerCompteAuditeur(
  _etatPrecedent: EtatFormulaire,
  formData: FormData
): Promise<EtatFormulaire> {
  const resultat = InscriptionSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!resultat.success) {
    return { erreur: resultat.error.issues[0].message };
  }

  const emailExistant = await prisma.user.findUnique({
    where: { email: resultat.data.email },
  });

  if (emailExistant) {
    return { erreur: "Un compte existe déjà avec cet email." };
  }

  const motDePasseHache = await bcrypt.hash(resultat.data.password, 10);

  await prisma.user.create({
    data: {
      name: resultat.data.name,
      email: resultat.data.email,
      password: motDePasseHache,
      role: "USER",
    },
  });

  redirect("/connexion");
}