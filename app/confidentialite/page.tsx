import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Wordmark } from "@/components/ui/wordmark";

export const metadata: Metadata = {
  title: "Confidentialité et mentions légales",
  description:
    "Données collectées sur Coiff'92, durée de conservation, droits d'accès et d'effacement, mentions légales.",
};

const titre = "mt-10 mb-3 text-xl";
const paragraphe = "m-0 max-w-[68ch] text-[15px] leading-relaxed text-muted-1";

export default function Confidentialite() {
  return (
    <div className="flex min-h-[100svh] flex-col">
      <header
        className="flex h-18 shrink-0 items-center justify-between border-b
                   border-[var(--hairline)] px-5 md:px-6"
      >
        <Link href="/" className="font-display text-[22px]">
          <Wordmark n92ClassName="text-accent-ink" />
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-[720px] flex-1 px-5 py-10 pb-20 md:px-8">
        <p className="m-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
          Dernière mise à jour : septembre 2026
        </p>
        <h1 className="m-0 mt-2 text-[clamp(28px,4vw,36px)] leading-tight">
          Confidentialité et mentions légales
        </h1>

        <h2 className={titre}>Éditeur du site</h2>
        <p className={paragraphe}>
          Coiff&apos;92 est un projet personnel édité par Kader Diarassouba. Pour
          toute question, une demande d&apos;accès, de rectification ou
          d&apos;effacement de données, écrivez à{" "}
          <a href="mailto:kdr.drb94@gmail.com" className="underline underline-offset-2">
            kdr.drb94@gmail.com
          </a>
          . Réponse sous un mois, délai légal.
        </p>

        <h2 className={titre}>Hébergement</h2>
        <p className={paragraphe}>
          Le site est hébergé par Vercel Inc. La base de données est hébergée
          par Supabase Inc. Aucune des deux ne voit les données autrement
          qu&apos;en tant que prestataire technique.
        </p>

        <h2 className={titre}>Données collectées</h2>
        <p className={paragraphe}>
          Coiff&apos;92 ne vend ni ne partage aucune donnée à des tiers
          publicitaires. Les données recueillies servent uniquement à faire
          fonctionner le site :
        </p>
        <ul className="m-0 mt-3 max-w-[68ch] list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted-1">
          <li>
            <b className="text-text">Demande de rendez-vous</b> : nom, e-mail,
            téléphone, prestation souhaitée, date et créneau, message
            facultatif. Transmis uniquement au salon visé, pour qu&apos;il
            recontacte le demandeur.
          </li>
          <li>
            <b className="text-text">Signalement de fiche déjà réclamée</b> :
            e-mail et description de la situation. Lu uniquement par
            l&apos;éditeur du site pour trancher le litige.
          </li>
          <li>
            <b className="text-text">Connexion à l&apos;espace gérant</b> :
            e-mail, utilisé pour un lien de connexion à usage unique. Aucun
            mot de passe n&apos;est stocké.
          </li>
          <li>
            <b className="text-text">Préférence de thème clair/sombre</b> :
            enregistrée uniquement dans le navigateur (localStorage), jamais
            transmise au serveur.
          </li>
        </ul>

        <h2 className={titre}>Durée de conservation</h2>
        <p className={paragraphe}>
          Les demandes de rendez-vous et les signalements de litige sont
          supprimés automatiquement 12 mois après leur envoi, qu&apos;ils aient
          été traités ou non. Cette purge tourne chaque jour, sans
          intervention manuelle.
        </p>

        <h2 className={titre}>Vos droits</h2>
        <p className={paragraphe}>
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de
          rectification, d&apos;effacement et d&apos;opposition sur vos données.
          Écrivez à{" "}
          <a href="mailto:kdr.drb94@gmail.com" className="underline underline-offset-2">
            kdr.drb94@gmail.com
          </a>{" "}
          en précisant l&apos;e-mail utilisé lors de votre demande ou de votre
          signalement : la donnée correspondante est retrouvée et effacée
          sous un mois.
        </p>

        <h2 className={titre}>Cookies et traceurs</h2>
        <p className={paragraphe}>
          Coiff&apos;92 ne dépose aucun cookie de mesure d&apos;audience ni de
          publicité. Seuls des cookies techniques, nécessaires à la connexion
          de l&apos;espace gérant, sont utilisés.
        </p>
      </main>
    </div>
  );
}
