/**
 * FICHIER : src/lib/upload.ts
 * RÔLE : Génère des URLs signées temporaires permettant au NAVIGATEUR
 * d'uploader un fichier DIRECTEMENT vers Cloudflare R2, sans jamais
 * transiter par notre serveur Next.js.
 *
 * Pourquoi cette approche (et pas un simple upload via Server Action) :
 * une fois hébergé (ex: Vercel), les fonctions serveur ont une limite
 * stricte de taille de requête (~4,5 Mo) qu'aucune configuration ne peut
 * dépasser. Un fichier WAV ou un audio de plusieurs dizaines de Mo la
 * dépasserait systématiquement. En passant par une URL signée, le fichier
 * va du navigateur vers R2 directement — notre serveur ne fait que
 * délivrer une "autorisation temporaire" (quelques octets), jamais le
 * fichier lui-même.
 *
 * Utilisée par : src/app/api/upload/route.ts (le point d'entrée appelé
 * par les formulaires admin avant l'upload réel).
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function genererUrlUploadSignee(
  nomFichierOriginal: string,
  typeMime: string,
  dossier: "photos-artistes" | "sons" | "pochettes"
): Promise<{ urlUpload: string; urlPublique: string }> {
  const extension = nomFichierOriginal.split(".").pop();
  const cle = `${dossier}/${crypto.randomUUID()}.${extension}`;

  const commande = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: cle,
    ContentType: typeMime,
  });

  // L'URL générée n'est valide que 5 minutes — largement suffisant pour
  // un upload, et empêche qu'elle traîne indéfiniment si interceptée.
  const urlUpload = await getSignedUrl(s3, commande, { expiresIn: 300 });
  const urlPublique = `${process.env.R2_PUBLIC_URL}/${cle}`;

  return { urlUpload, urlPublique };
}