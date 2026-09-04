"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button, buttonClass } from "@/components/ui/button";
import { Field, Input, SegmentedRadio, Select, Textarea } from "@/components/ui/field";
import {
  bornesDate,
  CRENEAUX,
  DEMANDES_ENREGISTREES,
  ETAT_INITIAL,
  formatDateLongue,
  LIBELLES_CRENEAU,
  VALEURS_VIDES,
  type DemandeValide,
} from "@/lib/demandes";
import { envoyerDemande } from "@/lib/demandes-actions";
import { formatDuree, formatPrix, type Salon } from "@/lib/salons";

/* ─────────────────────────  avertissement  ───────────────────────── */

/* Il est en tête et non en bas de page. La plateforme ne tient pas
   l'agenda du salon : si le visiteur ne comprend qu'après l'envoi que
   rien n'est réservé, il se présentera devant une porte fermée. */
export function EncartPromesse() {
  return (
    <div className="flex gap-3 rounded-md border border-accent bg-[var(--accent-wash)] p-4">
      <span
        aria-hidden="true"
        className="mt-px flex size-[18px] shrink-0 items-center justify-center
                   rounded-full border border-accent text-[11px] font-semibold
                   text-accent-ink"
      >
        i
      </span>
      <div>
        <p className="m-0 text-sm font-medium text-text">
          Ce n&apos;est pas une réservation ferme
        </p>
        <p className="m-0 mt-1 max-w-[52ch] text-[13px] leading-relaxed text-muted-1">
          Le salon reçoit votre demande, vérifie ses disponibilités, puis vous
          recontacte pour confirmer l&apos;horaire. Le rendez-vous n&apos;est fixé
          qu&apos;à ce moment-là.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────  confirmation  ───────────────────────── */

function Etape({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="tabular mt-px grid size-5 shrink-0 place-items-center rounded-full
                   border border-accent text-[11px] text-accent-ink"
      >
        {n}
      </span>
      <span className="text-sm leading-relaxed text-text">{children}</span>
    </li>
  );
}

/* Le titre est un h2 et non un h1 : la page garde le sien, le nom du
   salon. Deux h1 dans un même document, c'est un plan de page où plus
   rien n'est au premier rang. */
function Confirmation({ salon, demande }: { salon: Salon; demande: DemandeValide }) {
  const titre = useRef<HTMLHeadingElement>(null);

  /* Le formulaire disparaît, remplacé par cet écran. Sans déplacement du
     focus, un lecteur d'écran resterait sur un bouton qui n'existe plus
     et n'annoncerait jamais que l'envoi a réussi. */
  useEffect(() => {
    titre.current?.focus();
  }, []);

  const creneau = LIBELLES_CRENEAU[demande.creneau];

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-full border border-accent
                     bg-[var(--accent-wash)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 12.5l5 5L20 6.5"
              stroke="var(--accent)"
              strokeWidth="2.2"
              strokeLinecap="square"
            />
          </svg>
        </span>
        <h2
          ref={titre}
          tabIndex={-1}
          className="m-0 text-[clamp(24px,4vw,30px)] leading-tight outline-none"
        >
          Demande envoyée
        </h2>
        <p className="m-0 max-w-[52ch] text-sm leading-relaxed text-muted-1">
          {salon.name} a reçu votre demande de rendez-vous.
        </p>
      </div>

      <div>
        <h3 className="m-0 mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-2">
          Ce qui se passe ensuite
        </h3>
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          <Etape n={1}>
            Le salon consulte ses disponibilités pour le{" "}
            {formatDateLongue(demande.date)}, {creneau.toLowerCase()}.
          </Etape>
          <Etape n={2}>
            Il vous rappelle au <span className="tabular">{demande.tel}</span>, ou vous
            écrit à {demande.email}.
          </Etape>
          <Etape n={3}>
            Le rendez-vous n&apos;est fixé qu&apos;une fois l&apos;horaire confirmé avec
            vous. Sans réponse du salon, rien n&apos;est réservé.
          </Etape>
        </ol>
      </div>

      <div className="rounded-md bg-surface p-4">
        <h3 className="m-0 mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-2">
          Votre demande
        </h3>
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-sm">
          <dt className="text-muted-2">Prestation</dt>
          <dd className="m-0 text-text">{demande.prestation}</dd>
          <dt className="text-muted-2">Date</dt>
          <dd className="m-0 text-text">{formatDateLongue(demande.date)}</dd>
          <dt className="text-muted-2">Créneau</dt>
          <dd className="m-0 text-text">{creneau}</dd>
          <dt className="text-muted-2">Contact</dt>
          <dd className="m-0 text-text">
            {demande.nom}, <span className="tabular">{demande.tel}</span>
          </dd>
        </dl>
      </div>

      {/* Tant que la base n'est pas branchée, la demande n'est transmise à
          personne. Le dire est le minimum : cet écran affirme qu'un salon
          a reçu quelque chose. Cette note disparaît d'elle-même au
          passage sur Supabase. */}
      {!DEMANDES_ENREGISTREES && (
        <p className="m-0 rounded-md border border-dashed border-[var(--divider)] p-3 text-[13px] leading-relaxed text-muted-2">
          Démonstration : la base de données n&apos;est pas encore branchée, cette
          demande n&apos;a été transmise à personne.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className={buttonClass({ variant: "principal" })}
        >
          Retour à l&apos;annuaire
        </Link>
        <Link
          href={`/salon/${salon.slug}`}
          className={buttonClass({ variant: "secondaire" })}
        >
          Revoir la fiche du salon
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────  le formulaire  ───────────────────────── */

export function FormulaireDemande({ salon }: { salon: Salon }) {
  const [etat, action, enCours] = useActionState(envoyerDemande, ETAT_INITIAL);
  const resume = useRef<HTMLDivElement>(null);
  const { min, max } = bornesDate();

  const erreurs = etat.statut === "erreur" ? etat.erreurs : {};
  const valeurs = etat.statut === "erreur" ? etat.valeurs : VALEURS_VIDES;
  const global = etat.statut === "erreur" ? etat.global : undefined;
  const nbErreurs = Object.keys(erreurs).length;

  /* Même raison que sur la confirmation : après un envoi refusé, le focus
     doit aller sur ce qui explique le refus, pas rester sur le bouton. */
  useEffect(() => {
    if (etat.statut === "erreur") resume.current?.focus();
  }, [etat]);

  if (etat.statut === "succes") {
    return <Confirmation salon={salon} demande={etat.demande} />;
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <EncartPromesse />

      {(nbErreurs > 0 || global) && (
        <div
          ref={resume}
          tabIndex={-1}
          role="alert"
          className="rounded-md border border-accent bg-[var(--accent-wash)] px-4 py-3
                     text-sm text-accent-ink outline-none"
        >
          {global ??
            (nbErreurs === 1
              ? "Un champ est à corriger avant l'envoi."
              : `${nbErreurs} champs sont à corriger avant l'envoi.`)}
        </div>
      )}

      {/* Hors du fieldset, qui se verrouille pendant l'envoi : un champ
          désactivé n'est pas transmis. */}
      <input type="hidden" name="salon" value={salon.slug} />

      {/* Le piège à robots, hors du fieldset pour la même raison.

          Le champ est retiré des trois chemins par lesquels un humain
          pourrait l'atteindre : hors de l'écran pour l'oeil, tabIndex à -1
          pour le clavier, aria-hidden pour les lecteurs d'écran. Et
          autoComplete désactivé, sans quoi un gestionnaire de mots de
          passe le remplirait et ferait passer un vrai visiteur pour un
          automate.

          Le nom est choisi pour appâter : « site web » est exactement le
          genre de champ qu'un automate a envie de remplir. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="site_web">Ne remplissez pas ce champ</label>
        <input
          id="site_web"
          name="site_web"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <fieldset disabled={enCours} className="m-0 flex flex-col gap-4 border-0 p-0">
        <legend className="sr-only">Vos coordonnées et le rendez-vous souhaité</legend>

        <Field label="Votre nom" error={erreurs.nom}>
          {({ id, describedBy }) => (
            <Input
              id={id}
              name="nom"
              type="text"
              autoComplete="name"
              defaultValue={valeurs.nom}
              aria-describedby={describedBy}
              invalid={Boolean(erreurs.nom)}
              required
            />
          )}
        </Field>

        <Field label="E-mail" error={erreurs.email}>
          {({ id, describedBy }) => (
            <Input
              id={id}
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={valeurs.email}
              aria-describedby={describedBy}
              invalid={Boolean(erreurs.email)}
              required
            />
          )}
        </Field>

        <Field
          label="Téléphone"
          help="C'est par là que le salon vous rappellera."
          error={erreurs.tel}
        >
          {({ id, describedBy }) => (
            <Input
              id={id}
              name="tel"
              type="tel"
              autoComplete="tel"
              defaultValue={valeurs.tel}
              aria-describedby={describedBy}
              invalid={Boolean(erreurs.tel)}
              required
            />
          )}
        </Field>

        <Field label="Prestation souhaitée" error={erreurs.prestation}>
          {({ id, describedBy }) => (
            <Select
              id={id}
              name="prestation"
              defaultValue={valeurs.prestation}
              aria-describedby={describedBy}
              invalid={Boolean(erreurs.prestation)}
              required
            >
              <option value="">Choisir une prestation</option>
              {salon.prestations?.map((p) => (
                <option key={p.label} value={p.label}>
                  {p.label} · {formatDuree(p.dureeMin)} · {formatPrix(p.prixCents)}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Date souhaitée" error={erreurs.date}>
          {({ id, describedBy }) => (
            <Input
              id={id}
              name="date"
              type="date"
              min={min}
              max={max}
              defaultValue={valeurs.date}
              aria-describedby={describedBy}
              invalid={Boolean(erreurs.date)}
              required
            />
          )}
        </Field>

        <SegmentedRadio
          legend="Créneau"
          name="creneau"
          options={CRENEAUX}
          defaultValue={valeurs.creneau}
          error={erreurs.creneau}
        />

        <Field
          label="Message"
          optional
          help="Précisez une contrainte d'horaire ou une question pour le salon."
          error={erreurs.message}
        >
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              name="message"
              rows={3}
              defaultValue={valeurs.message}
              aria-describedby={describedBy}
              invalid={Boolean(erreurs.message)}
            />
          )}
        </Field>
      </fieldset>

      <div className="flex flex-col gap-3">
        <Button type="submit" loading={enCours} className="w-full">
          {enCours ? "Envoi de la demande…" : "Envoyer la demande"}
        </Button>
        <p className="m-0 text-center text-[13px] leading-relaxed text-muted-2">
          {enCours
            ? "Ne fermez pas cette page, l'envoi est en cours."
            : "Le salon vous recontacte pour confirmer. Sans sa réponse, rien n'est réservé."}
        </p>
      </div>
    </form>
  );
}
