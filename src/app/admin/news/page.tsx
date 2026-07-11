/**
 * FICHIER : src/app/admin/news/page.tsx
 * RÔLE : Liste et gestion des actualités. URL : /admin/news
 */
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LigneNews from "./LigneNews";

export default async function AdminNewsPage() {
  const news = await prisma.newsPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto max-w-3xl px-8 pb-24 pt-14">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Actualités</h1>
        <Link href="/admin/news/nouveau" className="rounded-lg bg-ember px-5 py-2.5 text-sm font-semibold">+ Nouvelle actu</Link>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {news.length === 0 && <p className="text-ash">Aucune actualité pour l&apos;instant.</p>}
        {news.map((n) => (<LigneNews key={n.id} news={n} />))}
      </div>
    </main>
  );
}