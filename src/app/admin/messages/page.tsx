/**
 * FICHIER : src/app/admin/messages/page.tsx
 * RÔLE : Liste les messages reçus via /contact. URL : /admin/messages
 */
import { prisma } from "@/lib/prisma";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-8 pb-24 pt-14">
      <h1 className="font-display text-3xl font-bold">Messages de contact</h1>

      <div className="mt-8 flex flex-col gap-3">
        {messages.length === 0 && <p className="text-ash">Aucun message pour l&apos;instant.</p>}
        {messages.map((m) => (
          <div key={m.id} className="rounded-xl border border-white/10 bg-ink-soft px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{m.name} <span className="text-xs font-normal text-ash">({m.email})</span></p>
              <span className="text-xs text-ash">{m.createdAt.toLocaleDateString("fr-FR")}</span>
            </div>
            <p className="mt-2 text-sm text-paper-dim">{m.message}</p>
          </div>
        ))}
      </div>
    </main>
  );
}