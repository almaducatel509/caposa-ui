# FEUILLE DE ROUTE MIGRATION BACKEND (TRÈS IMPORTANT)
🟢 PHASE 1 — maintenant (safe V1)

✔ garder bankConfig.ts
✔ utiliser partout dans UI
✔ aucun backend change
✔ logique stable

🟡 PHASE 2 — préparation backend (1–2 semaines)

Créer API :

GET /bank-policies

Retour :

{
  "savings": { ... },
  "checking": { ... },
  "term": { ... }
}
🔵 PHASE 3 — abstraction frontend

Créer un service :

// bankPolicy.service.ts

export async function fetchBankPolicies() {
  const res = await fetch("/api/bank-policies");
  return res.json();
}
🟣 PHASE 4 — remplacement du mock

Remplacer :

import { bankConfig } from "./bankConfig";

par :

const bankConfig = await fetchBankPolicies();

👉 sans changer UI

🔴 PHASE 5 — admin panel (IMPORTANT)

Ajouter interface pour direction :

modifier taux
modifier frais
modifier dépôt minimum
⚫ PHASE 6 — version production (FINTECH level)

Ajouter :

versioning des règles
audit log
historique des changements
snapshot par compte

Ex :

loan_policy_snapshot
bank_policy_snapshot

## 📌 4. Architecture finale propre
UI (React)
   ↓
Service Layer
   ↓
Bank Policy API
   ↓
Database (policies versionnées)
   ↓
Engine (calcul intérêts / frais / pénalités)

⚠️ 5. Ce que tu gagnes avec cette approche

✔ plus de code hardcodé
✔ direction autonome
✔ audit complet
✔ évolutif sans casse
✔ prêt pour vraie microfinance

💡 Conclusion simple

👉 Ton bankConfig.ts = parfait pour V1
👉 Mais il doit devenir une API ensuite
👉 Le frontend ne doit jamais contenir les règles finales