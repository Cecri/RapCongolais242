/**
 * FICHIER : src/lib/upload.ts
 * RÔLE : Deux fonctions distinctes.
 * - genererUrlUploadSignee : génère une URL signée temporaire pour que
 *   le navigateur envoie un fichier DIRECTEMENT à R2 (utilisée par
 *   useUpload.ts pour tous les uploads manuels — photos, audio, pochettes).
 * - telechargerEtRecadrerCover : télécharge une miniature YouTube côté
 *   serveur, détecte et corrige les bandes noires, stocke le résultat
 *   sur R2 (utilisée uniquement pour la récupération automatique de
 *   pochette depuis un lien externe).
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";

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

  const urlUpload = await getSignedUrl(s3, commande, { expiresIn: 300 });
  const urlPublique = `${process.env.R2_PUBLIC_URL}/${cle}`;

  return { urlUpload, urlPublique };
}

export async function telechargerEtRecadrerCover(
  urlSource: string,
  dossier: "pochettes"
): Promise<string | null> {
  try {
    const reponse = await fetch(urlSource);
    if (!reponse.ok) return null;

    const bufferOriginal = Buffer.from(await reponse.arrayBuffer());
    const image = sharp(bufferOriginal);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) return null;

    let imageFinale = image;

    const ratio = metadata.width / metadata.height;
    if (ratio > 1.15) {
      const taille = metadata.height;
      const decalageGauche = Math.round((metadata.width - taille) / 2);
      imageFinale = image.extract({
        left: decalageGauche,
        top: 0,
        width: taille,
        height: taille,
      });
    }

    const bufferFinal = await imageFinale.jpeg({ quality: 85 }).toBuffer();

    const cle = `${dossier}/${crypto.randomUUID()}.jpg`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: cle,
        Body: bufferFinal,
        ContentType: "image/jpeg",
      })
    );

    return `${process.env.R2_PUBLIC_URL}/${cle}`;
  } catch (erreur) {
    console.log("[cover] Échec du recadrage automatique :", erreur);
    return null;
  }
}