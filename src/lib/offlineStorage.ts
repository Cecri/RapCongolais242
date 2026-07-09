/**
 * FICHIER : src/lib/offlineStorage.ts
 * RÔLE : Gère le stockage local des sons téléchargés, via IndexedDB.
 * Mis de côté pour l'instant (le vrai hors-ligne est prévu pour la
 * future app mobile), mais utilisé quand même par PlayerContext.tsx
 * pour vérifier si un son est disponible en local avant de le
 * télécharger depuis le réseau — pour l'instant, recupererSonLocal
 * renvoie toujours null puisque rien n'est jamais stocké côté site web.
 */
"use client";

const NOM_BASE = "rapcongolais242-offline";
const NOM_TABLE = "sons-telecharges";

function ouvrirBase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const requete = indexedDB.open(NOM_BASE, 1);

    requete.onupgradeneeded = () => {
      const base = requete.result;
      if (!base.objectStoreNames.contains(NOM_TABLE)) {
        base.createObjectStore(NOM_TABLE);
      }
    };

    requete.onsuccess = () => resolve(requete.result);
    requete.onerror = () => reject(requete.error);
  });
}

export async function telechargerEtStocker(trackId: string, audioUrl: string): Promise<void> {
  const reponse = await fetch(audioUrl);
  const donnees = await reponse.blob();

  const base = await ouvrirBase();
  await new Promise<void>((resolve, reject) => {
    const transaction = base.transaction(NOM_TABLE, "readwrite");
    transaction.objectStore(NOM_TABLE).put(donnees, trackId);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function recupererSonLocal(trackId: string): Promise<string | null> {
  try {
    const base = await ouvrirBase();
    const donnees = await new Promise<Blob | undefined>((resolve, reject) => {
      const transaction = base.transaction(NOM_TABLE, "readonly");
      const requete = transaction.objectStore(NOM_TABLE).get(trackId);
      requete.onsuccess = () => resolve(requete.result);
      requete.onerror = () => reject(requete.error);
    });

    if (!donnees) return null;
    return URL.createObjectURL(donnees);
  } catch {
    return null;
  }
}

export async function estTelechargeLocalement(trackId: string): Promise<boolean> {
  const base = await ouvrirBase();
  return new Promise((resolve, reject) => {
    const transaction = base.transaction(NOM_TABLE, "readonly");
    const requete = transaction.objectStore(NOM_TABLE).count(trackId);
    requete.onsuccess = () => resolve(requete.result > 0);
    requete.onerror = () => reject(requete.error);
  });
}

export async function supprimerSonLocal(trackId: string): Promise<void> {
  const base = await ouvrirBase();
  await new Promise<void>((resolve, reject) => {
    const transaction = base.transaction(NOM_TABLE, "readwrite");
    transaction.objectStore(NOM_TABLE).delete(trackId);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}