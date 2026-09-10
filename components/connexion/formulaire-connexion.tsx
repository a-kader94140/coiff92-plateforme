"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { CONNEXION_VIERGE } from "@/lib/connexion";
import { envoyerLienConnexion } from "@/lib/connexion-actions";

/* Le formulaire d'envoi du lien, partagé par l'écran de connexion et
   par celui de réclamation. Seuls le titre, l'introduction et le
   libellé du champ changent : la mécanique est la même, et la
   dupliquer ferait diverger les deux écrans à la première correction. */

type Props = {
  titre: string;
  intro: string;
  libelleEmail: string;
  /* Où revenir après le clic sur le lien. Revalidé côté serveur, où
     seul un chemin interne est accepté. */
  suite: string;
};

export function FormulaireConnexion({ titre, intro, libelleEmail, suite }: Props) {
  const [etat, envoyer, enCours] = useActionState(
    envoyerLienConnexion,
    CONNEXION_VIERGE,
  );

  if (etat.statut === "envoye") {
    return <Attente email={etat.email} suite={suite} />;
  }

  return (
    <form action={envoyer} className="flex flex-col gap-6">
      <div>
        <h1 className="font-display m-0 mb-2.5 text-[clamp(24px,4vw,26px)] leading-tight">
          {titre}
        </h1>
        <p className="m-0 max-w-[46ch] text-sm leading-relaxed text-muted-1">{intro}</p>
      </div>

      <input type="hidden" name="suite" value={suite} />

      <Field
        label={libelleEmail}
        error={etat.statut === "erreur" ? etat.message : undefined}
      >
        {({ id, describedBy }) => (
          <Input
            id={id}
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={etat.statut === "erreur" ? etat.email : ""}
            invalid={etat.statut === "erreur"}
            aria-describedby={describedBy}
          />
        )}
      </Field>

      {/* Le piège à robots, hors de l'écran et hors du parcours au
          clavier. Voir lib/connexion-actions.ts pour la raison. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="site_web_connexion">Ne remplissez pas ce champ</label>
        <input
          id="site_web_connexion"
          name="site_web"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <Button type="submit" size="lg" disabled={enCours} className="w-full justify-center">
        {enCours ? "Envoi en cours…" : "Recevoir mon lien de connexion"}
      </Button>

      <p className="m-0 text-center text-[13px] text-muted-2">
        Aucun mot de passe à retenir. Un lien vous suffit à chaque connexion.
      </p>
    </form>
  );
}

/* ─────────────────────────  après l'envoi  ───────────────────────── */

function Attente({ email, suite }: { email: string; suite: string }) {
  return (
    <div className="flex flex-col gap-4">
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-md border
                   border-accent text-accent-ink"
      >
        {/* Une enveloppe dessinée plutôt qu'un caractère : le rendu
            d'un émoji dépend du système, et certains l'affichent en
            couleurs, ce qui ferait entrer une teinte de plus. */}
        <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="4.5" width="16" height="11" rx="1.5" />
          <path d="M2.5 5.5 10 11l7.5-5.5" />
        </svg>
      </span>

      <h1 className="font-display m-0 text-[clamp(22px,4vw,24px)] leading-tight">
        Vérifiez votre boîte mail
      </h1>

      <p className="m-0 max-w-[46ch] text-sm leading-relaxed text-muted-1">
        Nous avons envoyé un lien de connexion à{" "}
        <span className="tabular text-text">{email}</span>. Ouvrez cet e-mail et
        cliquez sur le lien pour continuer, aucun mot de passe n&apos;est nécessaire.
      </p>

      <p className="m-0 rounded-md bg-surface p-4 text-[13px] leading-relaxed text-muted-1">
        Si l&apos;e-mail n&apos;arrive pas, regardez dans les indésirables, puis
        recommencez.
      </p>

      {/* Un rechargement plutôt qu'un bouton qui remet l'état à zéro :
          l'action a déjà été jouée, et repartir de la page propre évite
          d'avoir à inventer une transition inverse. */}
      <a
        href={`/connexion?suite=${encodeURIComponent(suite)}`}
        className="self-start rounded-md border border-[var(--divider)] bg-surface-2
                   px-3.5 py-2.5 text-[13px] font-medium text-text
                   hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)]"
      >
        Utiliser une autre adresse
      </a>
    </div>
  );
}
