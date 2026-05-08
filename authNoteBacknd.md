# Note pour Backend
─────────────────

## Contexte : Front Next.js + NextAuth (Credentials provider). 
Login OK via POST /token/ → reçoit { access, refresh }.

## Problème :
Aucun endpoint pour récupérer le profil de l'utilisateur connecté.
Le JWT contient uniquement user_id / username — pas de first_name,
last_name, email. Impossible d'afficher le nom complet dans la sidenav
ou ailleurs sans faire une requête custom à chaque fois.

## Demande :
Ajouter un endpoint GET /employees/me/

  - Auth : Bearer token (IsAuthenticated)
  - Retourne l'Employee lié à request.user
  - Format identique à GET /employees/{id}/ (user imbriqué + 
    first_name, last_name, email, branch, posts, etc.)
  - 404 si l'utilisateur connecté n'a pas de profil Employee

Exemple de réponse attendue :
```python
{
  "id": "...",
  "user": { "username": "Aluser", "email": "al@example.com" },
  "first_name": "Alma",
  "last_name": "Ducatel",
  "branch": "...",
  "posts": [...]
}
```
Une fois dispo, je l'appelle dans authorize() au login pour
hydrater la session NextAuth.