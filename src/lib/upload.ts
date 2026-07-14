/**
 * FICHIER : src/lib/upload.ts
 * RÔLE : Upload de fichiers vers Cloudflare R2. Contient maintenant
 * aussi telechargerEtRecadrerCover — récupère une miniature YouTube,
 * détecte automatiquement les bandes noires (letterboxing typique des
 * vidéos "Topic" : image bien plus large que haute), recadre sur le
 * centre carré si besoin, puis stocke le résultat sur R2. Ainsi, plus
 * besoin d'uploader une pochette à la main pour corriger ce cas précis.
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

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

    // Si l'image est nettement plus large que haute (ratio > 1.15),
    // c'est le signe de bandes noires horizontales (letterboxing) —
    // on recadre sur un carré centré, qui correspond à la vraie pochette.
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