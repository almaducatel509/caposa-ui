parfait — on cale un plan d’attaque clair pour demain, en bossant **sans dépendre du backend** mais prêt à **switcher** quand l’API arrive.

# To-do list (jour J)

## 0) Décision technique (5 min)

* [ ] **Mode data** via feature flag : `NEXT_PUBLIC_API_MODE=mock | api`
* [ ] Repo pattern : même interface pour **mock** et **api** → switch par flag

```ts
// app/data/contracts.ts
export interface Paginated<T> { items: T[]; total: number; }
export interface Repository<T, Create, Update> {
  list(params?: { q?: string; page?: number; pageSize?: number }): Promise<Paginated<T>>;
  get(id: string): Promise<T>;
  create(payload: Create): Promise<T>;
  update(id: string, payload: Update): Promise<T>;
  remove(id: string): Promise<void>;
}
```

---

## 1) Types & validations (30–45 min)

* [ ] **Member types** (presque comme Employee)

  * `Member`: id, first_name, last_name, email, phone, address, dob, gender, branch_id, status, created_at, updated_at
  * `MemberCreate`, `MemberUpdate`
* [ ] **Account types**

  * `Account`: id, member_id, employee_id?, account_number, type (`"saving" | "checking" | ...`), balance, currency, status, opened_at
  * `AccountCreate`, `AccountUpdate`
* [ ] **Zod** schemas pour les deux (réutiliser validations d’Employee)

---

## 2) Mock data layer (1h)

* [ ] **Fixtures** : `app/data/mock/members.json`, `app/data/mock/accounts.json`
* [ ] **InMemory store** (avec persistence localStorage)

  * `mockStorage.ts`: read/write JSON + versioning
* [ ] **Repositories mock** (implémentent `Repository<>`)

  * `MembersMockRepository.ts` : CRUD, recherche, tri, pagination
  * `AccountsMockRepository.ts` : idem + contrainte **unique** sur `account_number`
* [ ] **Factory** pour choisir implémentation

  ```ts
  // app/data/index.ts
  import { MembersMockRepository } from "./mock/MembersMockRepository";
  import { MembersApiRepository } from "./remote/MembersApiRepository";
  const MODE = process.env.NEXT_PUBLIC_API_MODE ?? "mock";
  export const membersRepo = MODE === "api" ? new MembersApiRepository() : new MembersMockRepository();
  export const accountsRepo = MODE === "api" ? new AccountsApiRepository() : new AccountsMockRepository();
  ```

---

## 3) API layer (skeleton prêt pour le switch) (30 min)

* [ ] **Repositories API** vides mais signés

  * `MembersApiRepository.ts` (utilise `AxiosInstance`)
  * `AccountsApiRepository.ts`
* [ ] Chaque méthode `throw new Error("Not implemented in API mode today")`
  (on les remplira quand l’API sera prête)

---

## 4) Hooks de données (45–60 min)

> Option simple (pas besoin de React Query) : Zustand ou hooks maison.

* [ ] **useMembers()**

  * `useMembersList({ q, page, pageSize })`
  * `useCreateMember()`, `useUpdateMember()`, `useDeleteMember()`
  * Optimistic update + rollback sur erreur
* [ ] **useAccounts()** (mêmes signatures)
* [ ] Persistance UI : garder derniers filtres dans querystring (ou localStorage)

---

## 5) UI Member (intégration au clone d’Employee) (1–1h30)

* [ ] **Brancher** `MemberGrid`, `MemberFilterBar`, `CreateMemberForm`, `EditMemberModal`, `DeleteMemberModal` sur **hooks mock**
* [ ] **Search + filtres + pagination** (coté repo mock)
* [ ] **Validations Zod** dans les forms
* [ ] **Toasts** succès/erreur
* [ ] **Empty states** + loaders

---

## 6) UI Account (nouveau) (1–2h)

* [ ] **Pages /dashboard/accounts**

  * `AccountGrid.tsx` (liste + filtres + pagination)
  * `CreateAccountForm.tsx` (choix `member_id`, `type`, `account_number` unique, `currency`)
  * `EditAccountModal.tsx`, `DeleteAccountModal.tsx`
  * (Option) `AccountDetailModal.tsx` avec timeline des opérations (placeholder pour l’instant)
* [ ] **Règles** :

  * `account_number` **unique** (vérifié par repo mock)
  * `balance` >= 0
  * `member_id` **existant** → dropdown depuis `membersRepo.list()`
* [ ] **Empty states** + loaders

---

## 7) Navigation & garde (15 min)

* [ ] Ajouter entrée “Comptes” dans le side-nav
* [ ] Re-usage du **guard serveur** (NextAuth `auth()` + `redirect`)

---

## 8) Qualité & DX (30 min)

* [ ] **Feature flag**: `.env.local` → `NEXT_PUBLIC_API_MODE=mock`
* [ ] **E2E manuels**:

  * Créer/éditer/supprimer Member
  * Créer/éditer/supprimer Account
  * Chercher/filtrer/paginer
  * Refresh page → données persistent (localStorage)
* [ ] **Docs dev** : 1 page `README-members-accounts.md`

  * Comment changer mock → api
  * Contrats de repos & signatures

---

## 9) Tâches bonus si temps

* [ ] **Import CSV** Members/Accounts (parser → repo.create batch)
* [ ] **Export CSV** depuis grilles
* [ ] **Index recherche** simple (fuse.js) côté mock pour recherche floue
* [ ] Préparer mapping API (DTO) dans `remote/*Repository.ts`

---

## Livrables attendus demain

* ✅ **Members** 100% fonctionnels en mode **mock** (CRUD + filtres + pagination + validations)
* ✅ **Accounts** debout en **mock** (CRUD + contraintes de base)
* ✅ **Switch** instantané `mock` → `api` via `NEXT_PUBLIC_API_MODE`
* ✅ **Doc** courte (commentaire en tête des repos + README)

---

### Mini-snippets utiles

**Mock base helper**

```ts
// app/data/mock/base.ts
export function uid() { return crypto.randomUUID(); }
export function nowIso() { return new Date().toISOString(); }
export function save(key: string, data: any) { localStorage.setItem(key, JSON.stringify(data)); }
export function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || "") ?? fallback; }
  catch { return fallback; }
}
```

**Unique account number check (mock)**

```ts
// in AccountsMockRepository.create
if (db.accounts.some(a => a.account_number === payload.account_number)) {
  throw new Error("Account number already exists");
}
```

**Env**

```
NEXT_PUBLIC_API_MODE=mock
```

---

si tu veux, je peux te générer les **squelettes de fichiers** (repos + hooks + pages) pour accélérer, puis tu plug les composants existants.
