# 📘 Note technique Backend — Module Session Caisse

> **Pour l'équipe backend Django**
> Document décrivant :
> - ce que le frontend **fait déjà**
> - ce qu'il **attend du backend**
> - le **contrat d'API** entre les deux

Ce document ne contient pas d'implémentation Django — libre à vous de structurer votre code comme vous le jugez le plus pertinent. Il décrit uniquement le **contrat** à respecter pour que le frontend fonctionne.

---

## 1. 🧭 Contexte

Le frontend gère les sessions de caisse pour l'application CAPOSA (caisse populaire haïtienne, conformité BRH).

Le système couvre :
- 🔐 L'ouverture et la fermeture d'une session caissier
- 💰 Les transactions pendant la session
- 📅 Le respect des **horaires d'ouverture** et du **calendrier des jours fériés**
- 📡 La résilience hors ligne (mise en file d'attente automatique)

Tout est déjà implémenté côté frontend. Ce document précise les endpoints dont il a besoin.

---

## 2. ⚙️ Configuration côté frontend

### Variable d'environnement

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

- Si **vide** → le frontend tourne en **mode mock** (aucun appel réseau, données factices)
- Si **renseignée** → tous les appels partent vers cette URL

---

## 3. 🔌 Endpoints attendus

### Sessions

| Méthode | URL | Rôle |
|---|---|---|
| `GET` | `/sessions/` | Liste toutes les sessions |
| `GET` | `/sessions/{id}/` | Détail d'une session |
| `GET` | `/sessions/active/` | Session ouverte du caissier courant |
| `GET` | `/sessions/can-open/` | 🆕 Vérifie si une session peut être ouverte maintenant |
| `POST` | `/sessions/open/` | Ouvre une session |
| `POST` | `/sessions/{id}/close/` | Ferme une session |

### Transactions

| Méthode | URL | Rôle |
|---|---|---|
| `GET` | `/transactions/` | Liste toutes les transactions |
| `GET` | `/sessions/{id}/transactions/` | Transactions d'une session |
| `POST` | `/transactions/` | Crée une transaction |

---

## 4. 📝 Mapping des noms de champs

Le frontend utilise des noms français, le backend utilise des noms anglais. Le mapping est **centralisé côté frontend** — aucune action requise de votre côté.

### Ouverture de session

| Frontend envoie | Backend reçoit |
|---|---|
| `montant_ouverture` | `opening_balance` |
| `caissier_nom` | `caissier_nom` |
| `numero_caisse` | `numero_caisse` |
| `superviseur` | `superviseur` |
| `id_responsable_cash` | `id_responsable_cash` |

### Fermeture de session

| Frontend envoie | Backend reçoit |
|---|---|
| `montant_fermeture` | `counted_amount` |

### Transactions

| Frontend envoie | Backend reçoit |
|---|---|
| `montant` | `amount` |
| `type` | `type` |
| `session_id` | `session` |
| `note` | `note` |

---

## 5. 📅 Règles d'ouverture (Horaires + Calendrier)

### Ce que ça fait

Une session caisse ne peut être ouverte que si **3 conditions** sont réunies simultanément :

1. **Ce n'est pas un jour férié** (vérifié dans l'entité `Calendrier`)
2. **Le jour est marqué comme ouvert** dans l'entité `Horaire`
3. **L'heure actuelle est dans la plage d'ouverture** définie pour ce jour

Si **une seule** condition n'est pas respectée → l'ouverture est refusée.

### Ce qu'attend le frontend

#### 🆕 Endpoint `GET /sessions/can-open/`

Utilisé **au chargement de la page Sessions** pour savoir si la caisse peut être ouverte maintenant.

**Comportement dans l'UI selon la réponse :**

| Réponse | Ce qui s'affiche |
|---|---|
| `canOpen: true` | Bouton « Démarrer une session » actif |
| `canOpen: false` | Bouton grisé + bannière d'information explicative |

#### Format de réponse attendu

##### ✅ Cas 1 : Ouverture autorisée

```json
HTTP 200 OK
{
  "canOpen": true,
  "message": "Caisse ouverte jusqu'à 16h00",
  "currentWindow": {
    "opensAt": "2026-04-20T08:00:00Z",
    "closesAt": "2026-04-20T16:00:00Z"
  }
}
```

##### ❌ Cas 2 : Jour férié

```json
HTTP 200 OK
{
  "canOpen": false,
  "reason": "holiday",
  "message": "Caisse fermée — jour férié",
  "holidayName": "Jour du Drapeau",
  "nextOpeningAt": "2026-05-19T08:00:00Z"
}
```

##### ❌ Cas 3 : Jour fermé dans l'horaire

```json
HTTP 200 OK
{
  "canOpen": false,
  "reason": "closed_day",
  "message": "Caisse fermée le dimanche",
  "nextOpeningAt": "2026-04-21T08:00:00Z"
}
```

##### ❌ Cas 4 : Hors plage horaire

```json
HTTP 200 OK
{
  "canOpen": false,
  "reason": "outside_hours",
  "message": "Caisse fermée. Ouverture : 8h00 - 16h00",
  "nextOpeningAt": "2026-04-21T08:00:00Z"
}
```

### 🛡️ Defense in depth — `POST /sessions/open/` doit aussi vérifier

Même logique à appliquer sur le POST d'ouverture. Si un utilisateur tente d'ouvrir hors des créneaux, retourner :

```json
HTTP 403 Forbidden
{
  "code": "SESSION_CLOSED_HOLIDAY",
  "reason": "holiday",
  "message": "Caisse fermée — Jour du Drapeau (18 mai)",
  "detail": "La session ne peut pas être ouverte un jour férié."
}
```

#### Codes d'erreur à utiliser

| `code` | Situation |
|---|---|
| `SESSION_CLOSED_HOLIDAY` | Jour férié |
| `SESSION_CLOSED_DAY` | Jour fermé dans l'horaire hebdomadaire |
| `SESSION_CLOSED_HOURS` | Hors plage horaire |

---

## 6. ⚠️ Format des erreurs métier (général)

Le frontend distingue les erreurs par le **code HTTP** :

- **4xx** → erreur métier → affichée dans l'UI, **pas mise en file**
- **5xx ou réseau coupé** → considéré comme panne serveur → **mise en file offline automatique**

### Format JSON attendu pour toute erreur métier

```json
{
  "code": "NO_ACTIVE_SESSION",
  "message": "Aucune session active. Veuillez ouvrir votre caisse."
}
```

### Codes d'erreur utilisés par le front

| Code | Situation |
|---|---|
| `NO_ACTIVE_SESSION` | Aucune session ouverte pour ce caissier |
| `SESSION_ALREADY_OPEN` | Une session est déjà ouverte |
| `SESSION_CLOSED` | La session référencée est fermée |
| `SESSION_NOT_YOURS` | La session appartient à un autre caissier |
| `SESSION_CLOSED_HOLIDAY` | Ouverture refusée — jour férié |
| `SESSION_CLOSED_DAY` | Ouverture refusée — jour fermé |
| `SESSION_CLOSED_HOURS` | Ouverture refusée — hors plage horaire |

---

## 7. 🔄 Mode hors ligne côté frontend

Le frontend gère automatiquement le mode hors ligne :

- Si une requête **POST** échoue à cause du réseau (ou 5xx), la transaction est **mise en file d'attente localement**
- Quand la connexion revient, le frontend **rejoue automatiquement** les requêtes en attente, dans l'ordre
- L'utilisateur voit un badge « X transactions en attente »

**Implication côté backend :**
Les endpoints doivent être **idempotents** ou capables de **détecter les doublons** (ex: via un `client_reference` unique envoyé par le front).

---

## 8. 🧪 Tests recommandés

### Endpoint `/sessions/can-open/`

- [ ] Lundi 10h (jour ouvert, dans plage) → `canOpen: true`
- [ ] Dimanche → `canOpen: false, reason: closed_day`
- [ ] Lundi 17h → `canOpen: false, reason: outside_hours`
- [ ] 1er janvier → `canOpen: false, reason: holiday`

### Endpoint `/sessions/open/`

- [ ] Ouverture refusée quand hors créneau → `403` avec code explicite
- [ ] Ouverture acceptée en créneau valide → `201` avec objet session complet
- [ ] Deuxième ouverture tentée → `SESSION_ALREADY_OPEN`

### Fuseau horaire

- [ ] Toutes les dates sont en heure locale Haïti (UTC-5)
- [ ] Les champs ISO envoyés incluent le fuseau

---

## 9. 📋 Checklist d'implémentation

### Priorité haute (bloquant pour le frontend)

- [ ] `GET /sessions/` — liste
- [ ] `POST /sessions/open/` — ouverture (avec règles horaires)
- [ ] `POST /sessions/{id}/close/` — fermeture
- [ ] `GET /sessions/can-open/` — vérification horaires/calendrier
- [ ] Format d'erreur JSON cohérent avec le tableau section 6

### Priorité moyenne

- [ ] `GET /sessions/active/` — session active du caissier
- [ ] `GET /transactions/` — liste
- [ ] `POST /transactions/` — création

### Priorité basse (amélioration)

- [ ] Logger chaque refus d'ouverture (audit BRH)
- [ ] Gestion des doublons via `client_reference` (pour le mode offline)
- [ ] Métadonnées d'audit : IP, device, timestamp serveur

---

## 10. 💬 Contact

Pour toute question sur :
- Le format exact attendu par le frontend
- Les types TypeScript de référence
- Les scénarios UX spécifiques

→ Se référer au code frontend dans :
- `@/types/caisse.ts` — contrats de données
- `@/types/session-rules.ts` — règles d'ouverture
- `@/app/lib/api/SessionManager.ts` — logique d'appels