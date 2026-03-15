# 📋 Note d'intégration backend — Module Analyse Financière

> Rédigée le 15 mars 2026 — à relire avant de connecter les composants à l'API

---

## 1. Données mockées à remplacer

### `generateMemberData()` → `MemberDataMock.ts`
Actuellement utilisé dans `FinancialAnalysisDashboard.tsx` :
```ts
const [members] = useState(generateMemberData().filter(Boolean));
```
**À remplacer par :**
```ts
const [members, setMembers] = useState<MemberFinancialData[]>([]);

useEffect(() => {
  fetch('/api/members/financial-summary')
    .then(r => r.json())
    .then(data => setMembers((data ?? []).filter(Boolean)));
}, []);
```
⚠️ Garder le `.filter(Boolean)` — protège contre les `undefined` si l'API renvoie des entrées nulles.

---

### `generateAlerts()` → `generateAlerts.ts`
Actuellement appelée avec les membres mock.
**À remplacer par :**
```ts
fetch('/api/alerts?status=a_traiter')
  .then(r => r.json())
  .then(setAlerts);
```
Les champs `Alert` correspondent déjà au modèle backend — aucune transformation nécessaire si le backend respecte l'interface.

---

## 2. `computeMemberStatus` — attention au typage

```ts
// analyses.ts
export function computeMemberStatus(member: MemberFinancialData | undefined | null)
```
Cette signature accepte `undefined` intentionnellement — le backend peut renvoyer des membres incomplets. **Ne pas retirer ce guard.**

Si le backend garantit toujours un `member` valide, le guard devient no-op et n'a aucun impact.

---

## 3. `AnalyseFinanciereForm` — endpoint manquant

```ts
// Ligne commentée dans AnalyseFinanciereForm.tsx
// TODO: await fetch('/api/analyse', { method: 'POST', body: JSON.stringify(analyse) });
```
**Décommenter et ajuster l'URL** quand le endpoint `/api/analyse` est prêt.

Le payload envoyé au backend :
```ts
{
  id_analyse:            string,   // crypto.randomUUID()
  id_pret:               string,   // loan.id_loan
  revenuMensuel:         number,
  depensesMensuelles:    number,
  capaciteRemboursement: number,
  ratioEndettement:      number,   // 0.00–1.00
  mensualiteEstimee:     number,
}
```
⚠️ `ratioEndettement` est entre `0` et `1` (ex: `0.35` = 35%) — pas un pourcentage entier. Vérifier que le backend attend le même format.

---

## 4. `genererTableauAmortissement` — logique locale vs backend

Cette fonction est purement calculée côté client. Deux options :
- **Garder côté client** (recommandé) — calcul déterministe, pas besoin d'un round-trip réseau.
- **Déléguer au backend** si l'audit trail nécessite de stocker le tableau en base.

Si délégation : `POST /api/prets/{id}/amortissement` → `{ mois, mensualite, capital, interet, solde }[]`

---

## 5. `decisionPret` — logique métier à synchroniser

```ts
// Les seuils actuels dans decisionPret.ts
ratioEndettement > 0.4   // → refus
capaciteRemboursement < mensualiteEstimee  // → refus
revenuMensuel < depensesMensuelles         // → refus
```
Ces seuils doivent être **identiques** à ceux configurés côté backend. Si le backend les rend configurables (table de paramètres), remplacer les constantes hardcodées par une valeur récupérée via `/api/config/credit-policy`.

---

## 6. `FinancialAnalysisDashboard` — états de chargement

Le dashboard n'a pas encore d'état de chargement/erreur. Ajouter avant intégration :

```tsx
const [loading, setLoading] = useState(true);
const [error,   setError]   = useState<string | null>(null);

// Dans le useEffect fetch :
setLoading(true);
fetch('/api/members/financial-summary')
  .then(r => r.json())
  .then(data => { setMembers(data.filter(Boolean)); setLoading(false); })
  .catch(() => { setError('Erreur de chargement'); setLoading(false); });
```

Utiliser le pattern d'état vide/erreur déjà présent dans les autres dashboards CAPOSA (spinner + message centré).

---

## 7. Checklist avant mise en prod

- [ ] Remplacer `generateMemberData()` par appel API réel
- [ ] Remplacer `generateAlerts()` par appel API réel
- [ ] Décommenter le `fetch` dans `AnalyseFinanciereForm`
- [ ] Vérifier que `ratioEndettement` est bien `0–1` et non `0–100` côté backend
- [ ] Synchroniser les seuils de `decisionPret` avec la config backend
- [ ] Ajouter états loading/error dans `FinancialAnalysisDashboard`
- [ ] Tester `computeMemberStatus` avec données réelles — retirer le guard si inutile
- [ ] Supprimer `MemberDataMock.ts` une fois l'API connectée