L'hébergement 

**1. Sécurité (bloquant)**
- `created_by` reste à null sur les comptes créés via `POST /accounts/`, donc le principe des 4 yeux ne s'applique jamais. À remplir côté serveur dans `perform_create` (employé lié à `request.user`) et à passer en `read_only` dans le serializer.
- Vérifier que le `PATCH account_status: "actif"` est refusé sur un compte `en_attente` (sinon on contourne l'approbation).

**2. Configuration de production Django**
- `DEBUG = False`
- `SECRET_KEY` dans une variable d'environnement (pas dans le code)
- `ALLOWED_HOSTS` avec le domaine du serveur
- `CORS_ALLOWED_ORIGINS` et `CSRF_TRUSTED_ORIGINS` avec l'URL du front
- Base de données : on part sur PostgreSQL ou on reste sur SQLite ? (`settings.py` est encore en SQLite par défaut)
- Fichiers statiques (`collectstatic`) si l'admin Django doit être accessible
- Durée de vie des tokens JWT (access/refresh) adaptée à une journée de travail

**3. Données de départ**
- On repart d'une base propre ou on garde les données de test ? (ex. ACC-001 a encore `account_type: "SAVINGS"`, plusieurs comptes de test à 0 HTG)
- Superuser de production + comptes employés de démo (un par rôle : caissier, conseiller, superviseur, trésorier, directeur, admin) pour la présentation au jury
- Au moins une succursale active avec horaire par défaut et jours fériés assignés (sinon elle reste « À activer »)
- Au moins une caisse configurée pour pouvoir ouvrir une session

**4. Modules encore ouverts**
- Rapports : tes endpoints PDF (relevé de compte + rapport mensuel/annuel) sont-ils prêts ? Si oui, envoie-moi les URLs et les paramètres attendus, je branche une page minimale ce soir.
- Trésorerie : est-ce que la `Remise` est bien créée automatiquement (`en_attente`) à la fermeture de session ? Si le module n'est pas prêt côté backend, je le masque du menu pour l'hébergement plutôt que d'afficher une page cassée.

**5. Infos dont j'ai besoin pour le front**
- URL publique de l'API (pour `NEXT_PUBLIC_API_URL` ou équivalent)
- Qui déploie quoi, et sur quel hébergeur ?
- HTTPS actif des deux côtés (NextAuth en a besoin en production)

De mon côté : je lance le build de production du front ce soir, je corrige les erreurs TypeScript et la casse des noms de fichiers (Linux est sensible à la casse), je retire les `console.log` qui affichent des données de comptes, et je prépare les variables d'environnement.

Merci !