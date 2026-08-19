import { LoadingAnnounce, SkeletonRows } from "@/components/ui/states";

/* L'état de chargement de l'annuaire.

   Le squelette reprend la forme de ce qui arrive, deux groupes de lignes,
   plutôt qu'un rond qui tourne : la page ne se réorganise pas quand les
   données remplacent le gabarit.

   Il devient visible dès que la source de données prend du temps, c'est à
   dire au passage sur Supabase. En local il ne s'affiche presque jamais,
   ce qui est le comportement voulu, pas un oubli.

   PIÈGE, ne pas remonter ce fichier à la racine de app/. Un loading.tsx
   ouvre une frontière Suspense sur son segment ET tous ses enfants. La
   réponse part alors en flux, l'entête HTTP est émis avant que le corps
   soit rendu, et un notFound() appelé ensuite ne peut plus changer le
   statut : les slugs inconnus de /salon et /reclamer répondaient 200 au
   lieu de 404. D'où le groupe (annuaire), qui n'apparaît pas dans l'URL
   mais limite la frontière à cette seule page. */
export default function Chargement() {
  return (
    <div className="flex min-h-[100svh] flex-col">
      <div className="h-18 shrink-0 border-b border-[var(--hairline)]" />
      <div className="border-b border-[var(--hairline)] px-5 py-4 md:px-6">
        <span
          aria-hidden="true"
          className="block h-10 w-full max-w-md rounded-sm bg-surface"
          style={{ animation: "coiff-pulse 1.4s ease-in-out infinite" }}
        />
      </div>
      <main className="flex-1 px-5 py-6 md:px-6">
        <LoadingAnnounce label="Chargement de l'annuaire" />
        <div className="flex flex-col gap-8">
          <SkeletonRows rows={4} />
          <SkeletonRows rows={3} />
        </div>
      </main>
    </div>
  );
}
