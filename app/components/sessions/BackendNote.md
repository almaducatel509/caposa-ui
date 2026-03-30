# Guide d'intégration — SessionManager, OfflineQueue & caisse.ts

## Structure des fichiers

```
app/lib/api/
  ├── caisse.ts          ← Remplace votre ancien fichier api/caisse.ts
  ├── SessionManager.ts  ← Nouveau : cache + multi-sessions + fallback
  └── OfflineQueue.ts    ← Nouveau : file d'attente offline + sync auto
```

---

## 1. Variable d'environnement

```env
# .env.local
# Laissez vide pour travailler en mode mock (sans API Django)
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# En production :
NEXT_PUBLIC_API_URL=https://api.caposa.com/api
```

Tant que cette variable est vide → **tout fonctionne en mode mock**, rien ne plante.

---

## 2. Endpoints Django utilisés (réels)

| Méthode | URL                               | Payload envoyé                        |
|---------|-----------------------------------|---------------------------------------|
| GET     | `/sessions/`                      | —                                     |
| GET     | `/sessions/{id}/`                 | —                                     |
| POST    | `/sessions/open/`                 | `{ opening_balance, caissier_nom… }`  |
| POST    | `/sessions/{id}/close/`           | `{ counted_amount }`                  |
| GET     | `/transactions/`                  | —                                     |
| GET     | `/sessions/{id}/transactions/`    | —                                     |
| POST    | `/transactions/`                  | `{ type, amount, session, note… }`    |

---

## 3. Mapping champs front ↔ Django

Le front utilise des noms français. Le `SessionManager` fait le mapping automatiquement.

| Front (`OpenSessionPayload`) | Django (`opening payload`) |
|------------------------------|----------------------------|
| `montant_ouverture`          | `opening_balance`          |
| `caissier_nom`               | `caissier_nom`             |
| `numero_caisse`              | `numero_caisse`            |
| `superviseur`                | `superviseur`              |
| `id_responsable_cash`        | `id_responsable_cash`      |

| Front (`closeSession`)       | Django (`close payload`)   |
|------------------------------|----------------------------|
| `montant_fermeture`          | `counted_amount`           |

**Vous n'avez rien à changer dans vos composants.** Le mapping est centralisé dans `SessionManager.ts`.

---

## 4. Démarrer la sync offline (layout.tsx)

```tsx
// app/layout.tsx ou app/dashboard/layout.tsx
'use client';
import { useEffect } from 'react';
import { OfflineQueue } from '@/app/lib/api/OfflineQueue';

export default function Layout({ children }) {
  useEffect(() => {
    OfflineQueue.startSync();
    return () => OfflineQueue.stopSync();
  }, []);

  return <>{children}</>;
}
```

---

## 5. Gérer le résultat d'une transaction dans l'UI

```tsx
import { createTransaction } from '@/app/lib/api/caisse';

const handleDepot = async () => {
  try {
    const result = await createTransaction({
      type:   'deposit',
      amount: 5000,
      note:   'Dépôt client',
    });

    if ('_offline' in result) {
      toast.warning('Hors ligne : transaction mise en attente de synchronisation');
    } else {
      toast.success('Transaction créée avec succès');
    }

  } catch (err) {
    if (err.message.startsWith('NO_ACTIVE_SESSION')) {
      setShowOpenModal(true);   // Ouvrir le modal session
    } else {
      toast.error(err.message);
    }
  }
};
```

---

## 6. Badge "transactions en attente" dans l'UI

```tsx
import { OfflineQueue } from '@/app/lib/api/OfflineQueue';
import { useState, useEffect } from 'react';

export function OfflineBadge() {
  const [count, setCount] = useState(OfflineQueue.count());

  useEffect(() => {
    const unsub = OfflineQueue.onSync(() => setCount(OfflineQueue.count()));
    return unsub;
  }, []);

  if (count === 0) return null;

  return (
    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
      {count} en attente
    </span>
  );
}
```

---

## 7. Note backend Django — format de réponse d'erreur attendu

Le frontend distingue les erreurs par code HTTP :
- **4xx** → erreur métier → remontée à l'UI comme toast d'erreur, PAS mise en queue
- **5xx / réseau** → panne serveur → mise en queue offline automatique

Format d'erreur JSON attendu :

```json
{
  "error": "NO_ACTIVE_SESSION",
  "message": "Aucune session active. Veuillez ouvrir votre caisse."
}
```

Codes d'erreur utilisés par le front :

| Code                   | Situation                                      |
|------------------------|------------------------------------------------|
| `NO_ACTIVE_SESSION`    | Aucune session ouverte pour ce caissier        |
| `SESSION_ALREADY_OPEN` | Une session est déjà ouverte                   |
| `SESSION_CLOSED`       | La session référencée est fermée               |
| `SESSION_NOT_YOURS`    | La session appartient à un autre caissier      |