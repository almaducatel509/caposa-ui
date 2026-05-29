Oui exactement. Le bouton "Voir le rapport" ne crée rien — le rapport est **déjà créé** au moment où `handleSubmit` appelle `POST /api/treasury/reconciliation/submit`. Le bouton fait juste la navigation.

```
handleSubmit()
    │
    ├── POST /api/treasury/reconciliation/submit  ← rapport créé ici
    │        └── backend génère le rapport, retourne rapport_id
    │
    ├── setSubmitted(true)  ← affiche l'écran de confirmation
    │
    └── bouton "Voir le rapport"
             └── router.push(...)  ← navigation seulement, rien de plus
```

Donc quand l'API sera branchée, le seul changement dans `handleSubmit` c'est récupérer l'`id` pour construire l'URL correcte :

```ts
const handleSubmit = async () => {
  setSubmitting(true);
  
  const { rapport_id } = await fetch('/api/treasury/reconciliation/submit', {
    method: 'POST'
  }).then(r => r.json());
  
  setRapportId(rapport_id);  // ← juste stocker l'id pour le bouton
  setSubmitted(true);
  setSubmitting(false);
};
```

Le rapport existe côté backend dès ce moment. Le bouton ne fait que t'y emmener.

**Aujourd'hui** — on envoie juste `?type=reconciliation` pour pré-filtrer la liste. L'utilisateur arrive sur Rapports et voit seulement les rapports de réconciliation. C'est suffisant pour l'instant.

**Plus tard, quand tu veux atterrir sur la ligne exacte**, le flow est :

**1. Au moment de `handleSubmit`, le backend retourne l'ID du rapport créé**
```ts
const response = await fetch('/api/treasury/reconciliation/submit', { method: 'POST' });
const { rapport_id } = await response.json();
// ex: rapport_id = 'RPT-20260529-br-pap'
```

**2. Tu stockes cet ID dans le state après soumission**
```ts
const [rapportId, setRapportId] = useState<string | null>(null);

// Dans handleSubmit :
const { rapport_id } = await response.json();
setRapportId(rapport_id);
setSubmitted(true);
```

**3. Le bouton navigue avec l'ID**
```ts
router.push(`/dashboard/rapports?type=reconciliation&id=${rapportId}`);
// → /dashboard/rapports?type=reconciliation&id=RPT-20260529-br-pap
```

**4. La page Rapports lit les query params au chargement**
```ts
// Dans /dashboard/rapports/page.tsx
const searchParams = useSearchParams();
const type = searchParams.get('type');  // 'reconciliation'
const id   = searchParams.get('id');    // 'RPT-20260529-br-pap'

// Si id présent → scroll ou highlight sur cette ligne
// Si seulement type → pré-filtrer le dropdown
```

**La logique de highlight :**
```ts
useEffect(() => {
  if (!id) return;
  // Option A — scroll vers la ligne
  document.getElementById(`rapport-${id}`)?.scrollIntoView({ behavior: 'smooth' });
  // Option B — ouvrir directement le détail
  setSelectedRapport(id);
}, [id]);
```

En résumé — l'URL est juste un messager entre deux pages. Le vrai travail se fait dans deux endroits : le backend qui retourne l'ID à la soumission, et la page Rapports qui lit l'URL pour savoir quoi mettre en avant.