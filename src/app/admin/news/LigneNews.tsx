/**
 * FICHIER : src/app/admin/news/LigneNews.tsx
 * RÔLE : Carte d'une actualité en liste admin, avec publier/dépublier
 * et supprimer.
 */
"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { togglePublishNews, supprimerNews } from "./actions";

type News = { id: string; title: string; content: string; isPublished: boolean; createdAt: Date };

export default function LigneNews({ news }: { news: News }) {
  const router = useRouter();
  const [enCours, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-white/10 bg-ink-soft px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold">{news.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-ash">{news.content}</p>
          <p className="mt-1.5 text-xs text-ash">{news.createdAt.toLocaleDateString("fr-FR")}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${news.isPublished ? "bg-emerald-dim text-emerald" : "bg-white/10 text-ash"}`}>
          {news.isPublished ? "Publié" : "Masqué"}
        </span>
      </div>
      <div className="mt-3 flex gap-3">
        <Link href={`/admin/news/${news.id}/modifier`} className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-ink-softer">Modifier</Link>
        <button
          disabled={enCours}
          onClick={() => startTransition(async () => { await togglePublishNews(news.id); router.refresh(); })}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-ink-softer disabled:opacity-60"
        >
          {news.isPublished ? "Masquer" : "Publier"}
        </button>
        <button
          disabled={enCours}
          onClick={() => { if (confirm("Supprimer cette actualité ?")) startTransition(async () => { await supprimerNews(news.id); router.refresh(); }); }}
          className="rounded-lg border border-ember/40 px-3 py-1.5 text-xs font-semibold text-ember hover:bg-ember/10 disabled:opacity-60"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}