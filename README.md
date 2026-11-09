# CAPOSA — Caisse Populaire Solidarité Pour l'Avenir

CAPOSA est un système de gestion conçu pour une caisse populaire (coopérative d'épargne et de crédit) en Haïti.
Il couvre les opérations quotidiennes de l'institution — membres, comptes, transactions au guichet, sessions de caisse, prêts et trésorerie — en gourdes (HTG), avec des accès adaptés au rôle de chaque employé.

> Ce dépôt contient l'interface web (`caposa-ui`). L'API backend (Django REST Framework) est développée dans un dépôt séparé.

---

## Modules

| Module | Description |
|---|---|
| **Membres** | Inscription des membres, pièces d'identité, informations personnelles |
| **Comptes** | Ouverture de comptes (épargne, chèques, à terme), approbation, gel et fermeture |
| **Transactions** | Dépôts, retraits et transferts internes entre comptes, avec reçus imprimables |
| **Sessions de caisse** | Ouverture et fermeture de session par le caissier, fond de caisse, remise en fin de journée |
| **Prêts** | Demandes, approbation, suivi des échéances et remboursements |
| **Trésorerie** | Validation des remises, réconciliation (théorique vs réel), suivi du coffre |
| **Rapports** | Relevés de compte et rapports institutionnels (mensuels, annuels) en PDF |

Modules d'administration : succursales, horaires d'ouverture, calendrier des jours fériés, employés et postes.

### Rôles

Caissier · Service à la clientèle · Superviseur · Trésorier · Directeur · Administrateur

Chaque rôle n'a accès qu'aux actions qui le concernent (par exemple, un caissier ne peut pas approuver un prêt ni être son propre responsable cash). Les droits et privilèges sont appliqués côté backend.

---

## Stack technique

**Frontend (ce dépôt)**
- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [NextAuth.js](https://authjs.dev/) v5 — authentification par identifiants, jetons JWT
- Tailwind CSS v4, icônes [lucide-react](https://lucide.dev/)
- Axios pour les appels API, jsPDF pour les documents PDF

**Backend**
- Django REST Framework + SimpleJWT
- PostgreSQL

**Production**
- Serveur Linux, Nginx (reverse proxy), HTTPS Let's Encrypt, PM2

---

## Lancer le projet en local

### Prérequis
- Node.js 20 ou plus récent
- L'API backend CAPOSA lancée en local (ou l'URL d'une API accessible)

### Installation

```bash
git clone https://github.com/almaducatel509/caposa-ui.git
cd caposa-ui
npm install
```

### Configuration

Copier le fichier d'exemple, puis renseigner les valeurs (URL de l'API, secret NextAuth, etc.) :

```bash
# macOS / Linux
cp .env.example .env.local

# Windows
copy .env.example .env.local
```

Ne jamais committer `.env.local`.

### Démarrage

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

### Vérifications avant une Pull Request

```bash
npx tsc --noEmit   # vérification TypeScript
npm run build      # build de production
```

> ⚠️ Le serveur de production est sous Linux, qui distingue majuscules et minuscules dans les noms de fichiers. Les noms de dossiers sont en **minuscules** (`treasury/audit`, `openingHours`…) : vérifier que chaque import respecte exactement la casse du fichier.

---

## Organisation du travail

- Une branche par sujet, créée à partir de `master` à jour (`git pull` avant de commencer)
- Une Pull Request par branche, fusionnée dans `master` après vérification du build
- `master` correspond à la version déployée en production

---

## Documentation

Les contrats entre le frontend et le backend se trouvent dans [`docs/`](./docs) :

- [`api-contract-drf.md`](./docs/api-contract-drf.md) — contrat de l'API (Frontend ↔ Backend DRF)
- [`mapping-frontend-django.md`](./docs/mapping-frontend-django.md) — correspondance des types TypeScript et des modèles Django
- [`caposa-module-prets-contrat.md`](./docs/caposa-module-prets-contrat.md) — contrat du module prêts

---

## Équipe

Projet de fin d'études (PFE) réalisé par :

- **Wildarline**
- **Alma**
- **Rose-Kenflore**

