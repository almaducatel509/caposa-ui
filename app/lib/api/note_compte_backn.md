# Note pour le backend — Endpoint d'éligibilité

## Contexte

On a un wizard d'ouverture de compte en 3 étapes (Membre → Type → Confirmation). Aujourd'hui, le front laisse passer n'importe quel membre vers la création, sans vérifier ses pré-conditions bancaires. Résultat : on peut tenter de créer un compte pour un membre inéligible, et l'erreur ne tombe qu'au `POST /accounts/`, trop tard dans le flow.

## Ce qu'on a décidé côté front

On ajoute un appel d'éligibilité dans la couche API (`app/lib/api/accounts.ts`), pas dans l'UI ni dans les validations Zod. Deux points de contrôle :

1. **Soft check** à la sélection du membre (étape 1 → 2) : vérifier que le membre est éligible *en général* (existe, actif, non bloqué).
2. **Hard check** à la création : re-validation côté backend dans `POST /accounts/`, non négociable, car on ne fait jamais confiance au front.

L'éligibilité peut dépendre du type de compte (un membre peut être OK pour épargne mais pas pour terme), donc l'endpoint accepte un `account_type` optionnel.

## Ce qu'il manque côté backend

**Endpoint à créer :** `GET /members/{id}/eligibility/`

**Query param optionnel :** `?account_type=epargne|cheques|terme`

**Réponse attendue :**
```json
{
  "eligible": true | false,
  "reasons": ["string", ...]
}
```

- Sans `account_type` : éligibilité générale du membre.
- Avec `account_type` : éligibilité pour ce type spécifique (seuils, ancienneté, etc.).
- `reasons` est vide si éligible, sinon contient les motifs lisibles à afficher à l'utilisateur (ex. `"Membre inactif depuis plus de 90 jours"`, `"KYC incomplet"`, `"Limite de comptes atteinte"`).

**À définir côté métier :** la liste exacte des règles d'éligibilité (KYC, ancienneté, statut membre, nombre max de comptes par type, etc.). Le front ne les connaît pas et ne doit pas les connaître.

**Important :** la validation doit aussi être appliquée dans `POST /accounts/`. Si un membre inéligible arrive jusque-là (contournement front, race condition), la création doit être refusée avec le même format d'erreur.

## Ce qui ne change pas

Le cycle de vie du compte reste `ouvert → gelé → fermé` (champ `statusAccount`). L'éligibilité est une **porte d'entrée** au cycle, pas un état du compte — donc pas de nouveau statut à ajouter.