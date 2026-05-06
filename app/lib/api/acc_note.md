# Note de session — Pré-cycle d'éligibilité

## Le problème

Le wizard d'ouverture de compte laissait passer n'importe quel membre vers la création, sans vérifier ses pré-conditions bancaires. Le cycle `ouvert → opérationnel` n'avait pas de porte d'entrée : on pouvait remplir tout le wizard pour qu'au final le `POST /accounts/` refuse la création — trop tard, mauvaise UX.

## La décision

Ajouter un **pré-cycle d'éligibilité** dans la couche API (`app/lib/api/accounts.ts`), pas dans l'UI ni dans les validations Zod. Deux points de contrôle :

- **Soft check** à la sélection du membre (étape 1 → 2) côté front.
- **Hard check** à la création côté backend dans `POST /accounts/`, non négociable.

L'éligibilité est une **porte d'entrée** au cycle de vie du compte, pas un état du compte. Donc pas de nouveau statut à ajouter dans `statusAccount` (qui reste `ouvert | gelé | fermé`).

## Ce qui a été fait

**`app/lib/api/accounts.ts`**
- Ajout de `checkMemberEligibility(memberId, accountType?)` qui appelle `GET /members/{id}/eligibility/`.
- Ajout d'un feature flag `ELIGIBILITY_CHECK_ENABLED` (à `false` pour l'instant) qui bypasse l'appel tant que le backend n'a pas livré l'endpoint.
- Correction de `parseApiError` : détection du 404 + ne stringify plus le HTML brut (les pages d'erreur Django en mode `DEBUG=True` polluaient l'UI).

**`app/components/accounts/CompteFormFields.tsx`**
- Extraction de la logique de sélection du membre dans `handleMemberSelection`.
- Appel de `checkMemberEligibility` avant le passage à l'étape 2.
- Ajout d'un `eligibilityChecking` state + spinner Lucide pendant l'appel.
- Le bloc "Membre sélectionné" ne s'affiche qu'après une vérif réussie.

**Note backend rédigée** (`note_compte_backn.md`) avec le format de réponse attendu, les cas à gérer, et le rappel de re-valider à la création.

## Ce qui reste à faire

- **Backend :** créer `GET /members/{id}/eligibility/` retournant `{ eligible: boolean, reasons: string[] }` + appliquer la même validation dans `POST /accounts/`.
- **Front :** quand l'endpoint est livré, passer `ELIGIBILITY_CHECK_ENABLED = true` dans `accounts.ts`. Une seule ligne à changer.

## Ce qui ne change pas

- Le cycle de vie du compte (`ouvert → gelé → fermé`).
- Les 3 transitions existantes (`suspendAccount`, `reactivateAccount`, `closeAccount`).
- La structure du wizard (3 étapes : Membre → Type → Confirmation).