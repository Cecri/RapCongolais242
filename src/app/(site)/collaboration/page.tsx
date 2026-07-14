/**
 * FICHIER : src/app/(site)/collaboration/page.tsx
 * RÔLE : Page publique présentant l'offre de collaboration pour
 * artistes (accompagnement marketing, D.A, boost, etc.), avec
 * formulaire de demande. Accessible sans compte ni abonnement.
 * URL : /collaboration
 */
import FormulaireCollaboration from "./FormulaireCollaboration";

const SERVICES = [
  { icone: "📣", titre: "Mise en avant", description: "Sur le site et nos réseaux sociaux (Instagram, YouTube, TikTok)." },
  { icone: "🎯", titre: "Stratégie marketing", description: "Accompagnement dans le positionnement et le plan de sortie." },
  { icone: "🎤", titre: "Pitch & presse", description: "Aide à la présentation de votre projet, relations presse." },
  { icone: "📸", titre: "Shooting & visuels", description: "Production de photos et visuels pour vos sorties." },
  { icone: "🎧", titre: "Boost écoutes/vues", description: "Mise en avant via nos playlists et notre réseau." },
  { icone: "🧭", titre: "Développement artistique", description: "Accompagnement D.A. sur le long terme." },
];

export default function CollaborationPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-8 sm:pt-14">
      <span className="block font-mono text-[10px] uppercase tracking-wider text-ash sm:text-xs">
        Pour les artistes
      </span>
      <h1 className="mt-2.5 font-display text-3xl font-bold sm:text-4xl">
        Collaborons ensemble
      </h1>
      <p className="mt-4 text-sm text-paper-dim sm:text-base">
        RapCongolais242 accompagne les artistes du Congo, de la diaspora et d&apos;ailleurs en Afrique
        pour faire grandir leur carrière. Pas besoin d&apos;être abonné — cette offre s&apos;adresse
        directement aux artistes.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5">
        {SERVICES.map((s) => (
          <div key={s.titre} className="rounded-2xl border border-white/10 bg-ink-soft p-5">
            <div className="text-2xl">{s.icone}</div>
            <h3 className="mt-3 font-semibold">{s.titre}</h3>
            <p className="mt-1.5 text-sm text-paper-dim">{s.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-copper/30 bg-copper-dim px-6 py-5 text-center">
        <p className="text-sm text-paper-dim">
          Chaque accompagnement est <span className="font-semibold text-copper">adapté à votre projet</span> —
          formules et tarifs se discutent ensemble, selon vos besoins et vos objectifs.
        </p>
      </div>

      <div className="mt-10 flex items-center justify-center gap-5 text-ash">
        <a href="https://www.instagram.com/rap_congolais_242" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-paper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>
        </a>
        <a href="https://youtube.com/@rapcongolais242" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-paper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22.5 6.5s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.4-1C15.9 3 12 3 12 3h0s-3.9 0-7.2.2c-.5.1-1.5.1-2.4 1-.7.7-.9 2.3-.9 2.3S1.3 8.4 1.3 10.3v1.4c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2.1.9 2.6 1 1.9.2 8 .2 8 .2s3.9 0 7.2-.3c.5-.1 1.5-.1 2.4-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8v-1.4c0-1.9-.2-3.8-.2-3.8z" /><polygon points="10 8 10 15 16 11.5" fill="currentColor" stroke="none" /></svg>
        </a>
        <a href="https://www.tiktok.com/@rap.congolais.242" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-paper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 2h-3v14.2c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3 1-2.3 2.3-2.3c.3 0 .5 0 .8.1v-3.1c-.3 0-.5-.1-.8-.1-3 0-5.4 2.4-5.4 5.4s2.4 5.4 5.4 5.4 5.4-2.4 5.4-5.4V8.4c1.2.9 2.6 1.4 4.1 1.4V6.7c-2.2 0-4-1.8-4-4V2z" /></svg>
        </a>
      </div>

      <FormulaireCollaboration />
    </main>
  );
}