# 🔧 Alignement contrat API — Branches & OpeningHour

## Contexte
Le frontend utilise une définition Zod/TypeScript stricte pour les branches 
(voir `app/components/branches/validations.ts`). 
Plusieurs champs attendus ne sont pas renvoyés par l'API actuelle.

## Modifications demandées

### 1. `GET /branches/` — ajouter les champs manquants

Actuellement renvoyé :
- id, branch_code, branch_name, branch_address, branch_phone_number, branch_email
- number_of_posts, number_of_tellers, number_of_clerks, number_of_credit_officers  
- opening_date, opening_hour, holidays
- created_at, updated_at

À AJOUTER :
- `statusBranche` → enum `"active" | "inactive" | "archive"` 
  (calculé ou stocké — règle : active si opening_hour + holidays configurés ET status ≠ archive)
- `department_code` → enum des départements d'Haïti (OUEST, SUDEST, NORD, etc.)
- `city` → string

### 2. `GET /opening-hours/` — structure confirmée

Format actuel (OK) :
{
  "id": "uuid",
  "monday": "08:00-17:00",
  "tuesday": "08:00-17:00",
  ...,
  "created_at": "...",
  "updated_at": "..."
}

**Demande** : documenter officiellement que les jours absents = non travaillés, 
et que le format est bien `"HH:MM-HH:MM"`.

### 3. `GET /holidays/` — structure confirmée

Format actuel (OK) :
{
  "id": "uuid",
  "date": "YYYY-MM-DD",
  "description": "string",
  "created_at": "...",
  "updated_at": "..."
}

## Règle métier pour `statusBranche`

Une branche est :
- **`archive`** → action manuelle explicite via endpoint d'archivage
- **`active`** → a un `opening_hour` ET au moins 1 `holiday` configuré
- **`inactive`** → configuration incomplète (manque horaires OU jours fériés)

Suggestion d'implémentation côté Django :

```python
class BranchSerializer(serializers.ModelSerializer):
    statusBranche = serializers.SerializerMethodField()
    
    def get_statusBranche(self, obj):
        if getattr(obj, 'status', None) == 'archive':
            return 'archive'
        if obj.opening_hour_id and obj.holidays.exists():
            return 'active'
        return 'inactive'
    
    class Meta:
        model = Branch
        fields = [
            'id', 'branch_code', 'branch_name', 'branch_address',
            'branch_phone_number', 'branch_email',
            'statusBranche',           # ← NOUVEAU
            'department_code',         # ← NOUVEAU (FK vers Department)
            'city',                    # ← NOUVEAU
            'number_of_posts', 'number_of_tellers', 
            'number_of_clerks', 'number_of_credit_officers',
            'opening_date', 'opening_hour', 'holidays',
            'created_at', 'updated_at',
        ]
```

## Impact frontend si non fait
Le frontend doit actuellement calculer `statusBranche` et inférer le département, 
ce qui duplique la logique métier et risque des incohérences d'audit.