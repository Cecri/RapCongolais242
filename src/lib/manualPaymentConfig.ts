/**
 * FICHIER : src/lib/manualPaymentConfig.ts
 * RÔLE : Centralise les numéros Mobile Money/Wave de l'admin, lus depuis
 * .env. Utilisé par la page publique de paiement manuel pour afficher
 * les instructions de virement.
 */
export const MOYENS_PAIEMENT_MANUEL = {
  MTN_CONGO: {
    label: "MTN Mobile Money (Congo)",
    numero: process.env.MTN_CONGO_NUMBER || "Non configuré",
    nom: process.env.MTN_CONGO_NOM || "",
  },
  AIRTEL_CONGO: {
    label: "Airtel Money (Congo)",
    numero: process.env.AIRTEL_CONGO_NUMBER || "Non configuré",
    nom: process.env.AIRTEL_CONGO_NOM || "",
  },
  WAVE_SENEGAL: {
    label: "Wave (Sénégal)",
    numero: process.env.WAVE_SENEGAL_NUMBER || "Non configuré",
    nom: process.env.WAVE_SENEGAL_NOM || "",
  },
} as const;

export const PRIX_XOF_PAR_PLAN = {
  MONTHLY: "1 000 XOF",
  SEMESTRIAL: "5 500 XOF",
  YEARLY: "10 000 XOF",
} as const;