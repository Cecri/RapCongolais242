/**
 * FICHIER : src/app/(site)/collaboration/FormulaireCollaboration.tsx
 * RÔLE : Formulaire de demande de collaboration — cases à cocher pour
 * les services souhaités, coordonnées, message libre.
 */
"use client";

import { useState } from "react";
import { envoyerDemandeCollaboration } from "./actions";

const OPTIONS_SERVICES = [
  "Mise en avant (site + réseaux)",
  "Stratégie marketing",
  "Pitch & relations presse",
  "Shooting & visuels",
  "Boost écoutes/vues",
  "Développement artistique",
];

export default function FormulaireCollaboration() {
  const [servicesChoisis, setServicesChoisis] = useState<string[]>([]);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);
  const [enCours, setEnCours] = useState(false);

  function toggleService(service: string) {
    setServicesChoisis((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur("");
    setEnCours(true);

    const formData = new FormData(e.currentTarget);
    const resultat = await envoyerDemandeCollaboration({
      artistName: formData.get("artistName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      services: servicesChoisis,
      message: formData.get("message") as string,
    });

    setEnCours(false);

    if (resultat?.erreur) {
      setErreur(resultat.erreur);
      return;
    }

    setSucces(true);
  }

  if (succes) {
    return (
      <div className="mt-10 rounded-2xl border border-emerald/30 bg-emerald-dim px-6 py-8 text-center">
        <p className="font-display text-lg font-bold text-emerald">Demande envoyée !</p>
        <p className="mt-2 text-sm text-paper-dim">On revient vers vous rapidement pour en discuter.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-10">
      <h2 className="font-display text-xl font-semibold">Faire une demande</h2>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Nom d&apos;artiste *</label>
        <input name="artistName" required className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Email *</label>
        <input type="email" name="email" required className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Téléphone</label>
        <input name="phone" className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-paper-dim">Services souhaités *</label>
        <div className="flex flex-wrap gap-2">
          {OPTIONS_SERVICES.map((service) => (
            <button
              key={service}
              type="button"
              onClick={() => toggleService(service)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold sm:text-sm ${
                servicesChoisis.includes(service) ? "border-copper bg-copper-dim text-copper" : "border-white/20 text-paper-dim"
              }`}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-paper-dim">Message (optionnel)</label>
        <textarea name="message" rows={4} placeholder="Parle-nous un peu de ton projet..." className="w-full rounded-lg border border-white/20 bg-ink-soft px-4 py-3 text-sm focus:border-copper focus:outline-none" />
      </div>

      {erreur && <p className="text-sm text-ember">{erreur}</p>}

      <button type="submit" disabled={enCours} className="mt-2 rounded-lg bg-ember px-5 py-3 text-sm font-semibold disabled:opacity-60">
        {enCours ? "Envoi..." : "Envoyer la demande"}
      </button>
    </form>
  );
}