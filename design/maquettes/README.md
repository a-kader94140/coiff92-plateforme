# Les planches

Les exports d'écrans renvoyés par Claude Design, rangés ici avant portage.

Les planches des prompts 1 à 4 n'ont pas été archivées : elles ont transité par
le chat et ont disparu avec les sessions. On ne peut donc plus vérifier après
coup ce qui a été porté fidèlement et ce qui a dérivé. À partir du prompt 5, on
les garde.

## Nommage

`prompt<n>-<ecran>-<largeur>-<theme>.png`

```
prompt5-connexion-1440-sombre.png
prompt5-connexion-390-clair.png
prompt5-reclamer-1440-sombre.png
prompt6-mes-demandes-1440-sombre.png
prompt6-mes-demandes-vide-390-clair.png
prompt6-ma-fiche-1440-clair.png
```

## Comment les récupérer

**Télécharge-les depuis l'interface claude.ai/design, pas par le MCP
DesignSync.** `get_file` renvoie une version fortement réduite d'une image, et
retransférer ce base64 vers le disque corrompt le fichier : en-tête et fin de
JPEG corrects, mais contenu illisible. Vérifié en août 2026 sur ce projet.

## Avant de me les renvoyer

La liste de contrôle est en bas de `../PROMPTS-CLAUDE-DESIGN.md`. Elle existe
pour éviter de porter en code des défauts qu'on paierait ensuite.
