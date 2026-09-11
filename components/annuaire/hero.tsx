import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import "./hero.css";

/* Le héro et la bande éditoriale de l'accueil, portés depuis le site
   statique livrables/ia/annuaire-coiffeurs-92/ qui reste la référence
   visuelle de la marque.

   Images en <img> ordinaire, pas en next/image : ce sont des photos
   d'ambiance de 46 à 68 Ko déjà légères, et l'optimisation à la volée
   ajoute une dépendance (sharp) pour un gain marginal ici. C'est aussi
   ce que faisait le site d'origine, hors ligne et sans build.

   Les compteurs affichent le relevé RÉEL (les 136 salons vérifiés),
   pas les 142 fiches publiées : les 6 salons de démonstration sont
   fictifs, et « adresses relevées » ne doit pas les compter. Le pied
   de page, plus bas sur la même page, tient exactement ce langage. */

export function Hero({
  adressesReleves,
  nbCommunes,
}: {
  adressesReleves: number;
  nbCommunes: number;
}) {
  return (
    <div className="band-editorial">
      {/* Un <link> rendu ici est remonté dans le <head> par Next : le
          navigateur lance le téléchargement de la photo du héro avant
          même d'avoir fini de parser le reste de la page. Sans ça, une
          image chargée par le réseau (contrairement au site statique,
          servi en local) peut encore être en train de se décoder au
          moment où l'utilisateur commence à défiler, ce qui fait sauter
          des frames de l'animation liée au scroll. */}
      <link rel="preload" as="image" href="/annuaire/barbe.jpg" fetchPriority="high" />
      <section className="hero">
        <div className="hero-media">
          {/* alt vide : l'image est décorative, l'information qu'elle
              porte (136 adresses, 32 communes) est déjà dans le texte
              qui la recouvre. */}
          <img
            src="/annuaire/barbe.jpg"
            alt=""
            fetchPriority="high"
            className="hero-media-img"
          />
        </div>
        <div className="hero-scrim" aria-hidden="true" />

        <div className="hero-topbar">
          <Link href="/" className="hero-brand">
            Coiff&apos;<span>92</span>
          </Link>
          <nav className="hero-nav" aria-label="Navigation principale">
            <a className="hero-kicker" href="#annuaire">
              Annuaire
            </a>
            <a className="hero-kicker" href="#filtres">
              Villes
            </a>
            <a className="hero-kicker" href="#apropos">
              À propos
            </a>
            <ThemeToggle variant="hero" />
          </nav>
        </div>

        <div className="hero-inner">
          {/* Seul h1 de la page : le titre sr-only qui existait avant
              le héro est retiré, deux h1 feraient double emploi. Le
              suffixe caché porte la description que le wordmark seul
              ne donne pas. */}
          <h1 className="hero-title">
            Coiff&apos;<span>92</span>
            <span className="sr-only">
              , annuaire des coiffeurs et barbers des Hauts-de-Seine
            </span>
          </h1>
          <p className="hero-sub">
            <b className="tabular">{adressesReleves}</b> adresses de coiffeurs et
            barbers, relevées dans <b className="tabular">{nbCommunes}</b> communes
            des Hauts-de-Seine.
          </p>
          <a className="hero-cta" href="#annuaire">
            Ouvrir l&apos;annuaire <span className="hero-rule" aria-hidden="true" />
          </a>
        </div>
      </section>

      <div className="scroll-cursor" aria-hidden="true" />

      <section className="about" id="apropos">
        <div className="about-inner">
          <div className="about-row">
            <div className="about-figure">
              <img
                src="/annuaire/profil.jpg"
                alt="Taille de barbe à la tondeuse, vue rapprochée"
                loading="lazy"
                className="about-figure-img"
              />
            </div>
            <div className="about-text">
              <h2>Barbers et coiffeurs, une seule liste</h2>
              <div className="about-body">
                <span className="about-mark" aria-hidden="true" />
                <p>
                  Du barbier de quartier au salon mixte,{" "}
                  <span className="tabular">{adressesReleves}</span> adresses
                  relevées dans <span className="tabular">{nbCommunes}</span> communes
                  du département. Pas de classement, pas de publicité :
                  l&apos;ordre est alphabétique.
                </p>
              </div>
            </div>
          </div>

          <div className="about-row reverse">
            <div className="about-text">
              <h2>Cherchez par ville ou par nom</h2>
              <div className="about-body">
                <span className="about-mark" aria-hidden="true" />
                <p>
                  La recherche filtre en direct, et les menus restreignent à
                  une commune ou à un type d&apos;établissement.
                </p>
              </div>
            </div>
            <div className="about-figure">
              <img
                src="/annuaire/degrade.jpg"
                alt="Dégradé net sur les tempes, vu de profil"
                loading="lazy"
                className="about-figure-img"
              />
            </div>
          </div>

          <div className="about-band">
            <img
              src="/annuaire/outils.jpg"
              alt="Peigne, ciseaux et tondeuse posés sur le plan de travail d'un barbier"
              loading="lazy"
              className="about-band-img"
            />
            <div className="about-band-text">
              <h2>Des adresses relevées à la source</h2>
              <p>
                Chaque fiche vient d&apos;annuaires publics consultés en août
                2026. Le lien vers la carte, sur chaque fiche, ouvre
                l&apos;itinéraire directement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
