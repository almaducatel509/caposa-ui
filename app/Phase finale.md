# Plan CAPOSA — Phase finale

Objectif : mettre en ligne un MVP stable, puis préparer la soutenance. Rapports et Trésorerie ne sont faits que s'il reste du temps.

Les jours sont comptés après l'hébergement (J0 = ven. 6 nov.). La date de soutenance reste à confirmer pour fixer les dates réelles.

---

## Ce soir (jeu. 5 nov.) — Préparer l'hébergement

- [ ] `npm run build` sans erreur
- [ ] Casse des noms de fichiers corrigée (Linux)
- [ ] `console.log` de données sensibles retirés
- [ ] Variables d'environnement prêtes (`API_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
- [ ] Rapports et Trésorerie masqués du menu
- [ ] Mémo envoyé à CS

**Livrable :** un build propre, prêt à déployer.

---

## J0 (ven. 6 nov.) — Hébergement

- [ ] Déploiement front + back
- [ ] Test de fumée en production, un compte par rôle : connexion → ouverture de session → dépôt → retrait → transfert → création de compte → approbation → prêt
- [ ] Tout bug trouvé va sur une liste, sans correction à chaud sauf s'il est bloquant

**Livrable :** CAPOSA en ligne, avec les parcours critiques vérifiés.

---

## J+1 à J+3 — Stabilisation

- [ ] **Prêts de bout en bout** : création → approbation (pas par le caissier) → changement de statut → remboursement
- [ ] **Audit log minimal** : `created_by` corrigé par CS, et pouvoir montrer « qui a fait quoi, quand » sur transactions, comptes et sessions
- [ ] Correction des bugs de la liste du J0
- [ ] Données de démo propres : une succursale active, une caisse, un employé par rôle, quelques membres et comptes réalistes

**Livrable :** un système stable, démontrable sans surprise.

---

## J+4 à J+5 — Optionnel (go/no-go)

Cette phase ne démarre que si la stabilisation est terminée.

- [ ] **Rapports** : relevé de compte PDF uniquement (numéro de compte + dates → téléchargement), si l'endpoint de CS est prêt
- [ ] **Trésorerie** : validation des remises en lecture/validation simple, si la création automatique à la fermeture de session fonctionne

Si c'est « no-go », ces deux modules restent masqués et deviennent des « perspectives » dans les slides.

---

## J+6 jusqu'à la soutenance — Présentation

- [ ] **Scénario de démo écrit** : le parcours exact montré au jury, avec les comptes à utiliser
- [ ] **Vidéo de 3 minutes** : filet de sécurité si le serveur tombe pendant la soutenance
- [ ] **Slides** : problème → solution → architecture → démo → limites et perspectives → conclusion
- [ ] **README + schéma de base de données** : réutiliser les diagrammes UML déjà produits
- [ ] Au moins une répétition complète, chronométrée

**Livrable :** soutenance prête, avec un plan B.

---

## Règles

- **Gel du code 48 h avant la soutenance** : après, seulement des corrections bloquantes.
- **Pas de nouvelle fonctionnalité** après J+3, sauf la phase optionnelle.
- **Les limites assumées** (audit partiel, Rapports, Trésorerie) vont dans les slides comme perspectives : un jury apprécie un périmètre maîtrisé.