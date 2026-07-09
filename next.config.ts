/**
 * FICHIER : next.config.ts
 * RÔLE : Configuration globale Next.js.
 * - serverActions.bodySizeLimit : conservé par sécurité (même si on
 *   passe maintenant par upload direct R2 pour les gros fichiers).
 * - turbopackFileSystemCacheForDev à false : désactive le cache disque
 *   persistant de Turbopack, responsable d'erreurs d'hydratation
 *   récurrentes (Navbar affichant une ancienne version après des
 *   changements de structure). Rechargements un peu plus lents, mais
 *   toujours à jour — préférable à des bugs fantômes difficiles à tracer.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;