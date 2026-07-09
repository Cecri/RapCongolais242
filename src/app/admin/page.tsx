import { auth } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await auth();

  return (
    <main className="mx-auto max-w-6xl px-8 pt-14">
      <h1 className="font-display text-3xl font-bold">
        Bienvenue, {session?.user?.name || session?.user?.email}
      </h1>
      <p className="mt-2 text-paper-dim">
        Tableau de bord admin — gestion des artistes et des sons à venir.
      </p>
    </main>
  );
}