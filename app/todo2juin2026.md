Bonne priorité. On touche le minimum, on sécurise le maximum.

---

## Entités touchées

| Entité | Ce qui change |
|---|---|
| **Session** | + `statut: interrompue` + `last_activity` |
| **Transaction** | + `transaction_date` + `saisi_par` + `motif_saisie_differee` |
| **Rien d'autre** | Membres, Comptes, Employés → intacts |

---

## Ce que tu fais côté frontend — minimum viable

### 1. Session — rien à afficher, juste informer

Ta page `/dashboard/sessions` existe déjà. Tu ajoutes juste un badge visuel pour le statut `interrompue` — comme tu as déjà `actif`, `fermee`, etc.

```tsx
// Dans ton composant de statut de session — déjà existant
const statusBadge = {
  ouverte: <Badge color="green">Ouverte</Badge>,
  fermee: <Badge color="gray">Fermée</Badge>,
  interrompue: <Badge color="red">Interrompue</Badge>, // ← ajouter
}
```

C'est tout côté session frontend. La détection se passe 100% backend.

---

### 2. Transaction — saisie différée

Sur ta page Dépôts (screenshot), tu ajoutes **un seul bouton** à côté de "Nouveau dépôt" :

```
[ + Nouveau dépôt ]  [ ⚠ Saisie différée ]   [ ↓ Exporter tout ]
```

Ce bouton ouvre un modal identique à "Nouveau dépôt" mais avec :
- Champ `transaction_date` → date/heure modifiable (pas bloquée à aujourd'hui)
- Champ `motif_saisie_differee` → texte obligatoire
- Champ `saisi_par` → auto-rempli avec l'utilisateur connecté

**Visible uniquement si rôle = `superviseur` ou `admin`.**

---

### 3. Zod — ajout minimal à ton schéma existant

Ton fichier `sessionValidation.ts` reste intact. Tu ajoutes dans ton schéma de transaction :

```ts
// transactionValidation.ts — nouveau fichier
export const TransactionDiffereSchema = z.object({
  ...TransactionSchema.shape, // tout ce qui existe déjà
  transaction_date: z.string().datetime("Date invalide"),
  motif_saisie_differee: z.string().min(10, "Motif requis (min 10 caractères)"),
  saisi_par: z.string().uuid(), // auto-rempli, pas visible par l'user
})
```

---

## Ce que tu passes au dev Django

Un seul message clair :

> **Session :** ajouter `last_activity` (auto-update) + statut `interrompue` + tâche cron toutes les 30 min.
>
> **Transaction :** ajouter `transaction_date` (nullable, défaut = now), `saisi_par` (FK Employe), `motif_saisie_differee` (text nullable). Endpoint saisie différée réservé au rôle superviseur.

---

## Ce que tu NE touches pas

- Tes composants existants de dépôts/retraits/transferts
- Ta navigation (`links.ts`) — aucun nouveau lien
- Tes pages membres, comptes, prêts
- Ton `sessionValidation.ts` existant

---

**Résumé de l'effort réel**

| Tâche | Temps estimé |
|---|---|
| Badge `interrompue` dans SessionTable | 15 min |
| Bouton + modal Saisie différée | 1h–1h30 |
| Schéma Zod `TransactionDiffereSchema` | 20 min |
| Brief pour le dev Django | 15 min |

**Total : ~2h30 pour une version soutenable et défendable.**