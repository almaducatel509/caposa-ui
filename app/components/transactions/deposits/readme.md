## Note Backend — Règle métier : Modification d’un dépôt
Cette note décrit les règles backend concernant la modification d’un dépôt dans CAPOSA. Elle s’applique à toutes les opérations PATCH/PUT sur l’objet Deposit.

## Condition principale
Un dépôt peut être modifié uniquement si la session de caisse associée est encore ouverte.

## Définition
Une session est considérée ouverte si session.status == "open".

Une session est considérée fermée si session.status == "closed" ou session.closed_at != null.

## Justification métier # type: ignore
Une session fermée représente une période comptable finalisée.

## Modifier un dépôt après fermeture créerait des incohérences dans : # pyright: ignore[reportUndefinedVariable]

les rapports de caisse,

les écarts,

la réconciliation,

les audits financiers.

Cette règle protège le caissier, le superviseur et l’entreprise.

## Comportement attendu côté backend
**1. Vérification obligatoire avant toute modification**
Dans la view Django (APIView, ViewSet ou Serializer), vérifier :

python
if deposit.session.status != "open":
    return Response(
        {"detail": "La session de caisse est fermée. Modification impossible."},
        status=403
    )
Cette vérification doit être systématique, même si le front désactive l’édition.

**2. Exceptions autorisées**
Seuls les rôles suivants peuvent contourner la règle :

Superviseur

Administrateur

Mais même eux ne peuvent pas modifier directement un dépôt d’une session fermée.

Ils doivent passer par :

Annulation du dépôt (audit obligatoire)

Création d’un nouveau dépôt (transaction corrective)

Aucune modification silencieuse n’est permise.

**3. Audit obligatoire pour chaque modification**
Chaque modification doit créer une entrée dans DepositAudit :

before_value (JSON)

after_value (JSON)

modified_by (User)

role

ip_address

device

reason (obligatoire)

timestamp

deposit_id

session_id

Aucune modification ne doit être acceptée sans audit.

## Exemple de logique Django (ViewSet)
python
def partial_update(self, request, *args, **kwargs):
    deposit = self.get_object()

    # Vérification session ouverte
    if deposit.session.status != "open":
        return Response(
            {"detail": "La session de caisse est fermée. Modification impossible."},
            status=403
        )

    # Capture before
    before = DepositSerializer(deposit).data

    response = super().partial_update(request, *args, **kwargs)

    # Capture after
    after = DepositSerializer(deposit).data

    # Audit
    DepositAudit.objects.create(
        deposit=deposit,
        before_value=before,
        after_value=after,
        modified_by=request.user,
        role=request.user.role,
        ip_address=request.META.get("REMOTE_ADDR"),
        device=request.headers.get("User-Agent"),
        reason=request.data.get("reason", "Non spécifié")
    )

    return response
## Résumé opérationnel
Session ouverte → modification autorisée (caissier, superviseur, admin).

Session fermée → modification interdite (403).

Superviseur/Admin → peuvent annuler mais pas modifier directement.

Audit obligatoire pour chaque modification.

Le backend doit toujours valider, même si le front désactive l’édition.
```python
const LOCKED_STATUSES = ['encaisse', 'annule', 'echoue'] as const;
const isLocked = LOCKED_STATUSES.includes(deposit.status);
```