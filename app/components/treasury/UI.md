# Écran : Remise de caisse du matin

## 🎯 Objectif
**Créer une preuve numérique immuable** de la remise d'argent entre deux personnes.

> 💡 **Principe clé** : Tu ne gères pas l'argent. Tu gères la preuve.

---

## 📋 Spécifications fonctionnelles

### Champs obligatoires

```ts
interface CashHandover {
  id: string;
  amount: number;
  handed_by: string;        // employee_id
  verified_by: string;      // employee_id
  received_by: string;      // employee_id
  
  // Signatures numériques
  handed_by_signature: string;
  verified_by_signature: string;
  received_by_signature: string;
  
  // Métadonnées
  branch_id: string;
  handover_date: string;
  created_at: string;
  status: "draft" | "confirmed" | "locked";
  
  // Audit
  is_locked: boolean;
}
```

---

## 🔒 Règles métier critiques

### R1 - Séparation des rôles
```ts
// ❌ INTERDIT
handed_by === received_by

// ✅ OBLIGATOIRE
handed_by !== received_by !== verified_by
```

**Validation Zod** :
```ts
.refine(
  (data) => {
    const actors = [data.handed_by, data.verified_by, data.received_by];
    const unique = new Set(actors);
    return unique.size === 3;
  },
  { message: "Les trois rôles doivent être assumés par des personnes différentes" }
)
```

### R2 - Immuabilité après confirmation
```ts
// Une fois status = "confirmed"
is_locked = true

// Toute tentative de modification = REJET
if (is_locked) {
  throw new Error("Cette remise de caisse est verrouillée et ne peut plus être modifiée");
}
```

### R3 - Signatures obligatoires
```ts
// Impossible de confirmer sans les 3 signatures
status = "confirmed" 
  SEULEMENT SI 
    handed_by_signature !== null 
    AND verified_by_signature !== null 
    AND received_by_signature !== null
```

---

## 🎨 Interface utilisateur

### Étape 1 : Saisie initiale (Draft)

```
┌─────────────────────────────────────────┐
│  📝 Nouvelle remise de caisse           │
├─────────────────────────────────────────┤
│                                         │
│  Montant remis                          │
│  [__________] $                         │
│                                         │
│  Remis par                              │
│  [Sélectionner un employé ▼]            │
│                                         │
│  Vérifié par                            │
│  [Sélectionner un employé ▼]            │
│                                         │
│  Reçu par                               │
│  [Sélectionner un employé ▼]            │
│                                         │
│  ⚠️ Les trois personnes doivent être    │
│     différentes                         │
│                                         │
│           [Annuler]  [Suivant →]        │
└─────────────────────────────────────────┘
```

### Étape 2 : Signatures numériques

```
┌─────────────────────────────────────────┐
│  ✍️ Signatures requises                 │
├─────────────────────────────────────────┤
│                                         │
│  Montant : 2 000,00 $                   │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ✅ Remis par : Jean Dupont         │ │
│  │    Signé le 10/02/2026 à 08:45    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ⏳ Vérifié par : Marie Tremblay    │ │
│  │    [Signer maintenant]            │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ⏳ Reçu par : Paul Martin          │ │
│  │    En attente...                  │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Étape 3 : Confirmation finale

```
┌─────────────────────────────────────────┐
│  🔒 Confirmation de remise              │
├─────────────────────────────────────────┤
│                                         │
│  Montant : 2 000,00 $                   │
│                                         │
│  ✅ Remis par : Jean Dupont             │
│  ✅ Vérifié par : Marie Tremblay        │
│  ✅ Reçu par : Paul Martin              │
│                                         │
│  ⚠️ ATTENTION                           │
│  Une fois confirmée, cette opération    │
│  ne pourra plus être modifiée.          │
│                                         │
│  ☑ Je confirme l'exactitude des         │
│    informations                         │
│                                         │
│         [Retour]  [Confirmer 🔒]        │
└─────────────────────────────────────────┘
```

### Étape 4 : Preuve générée

```
┌─────────────────────────────────────────┐
│  ✅ Remise de caisse confirmée          │
├─────────────────────────────────────────┤
│                                         │
│  Référence : #RC-2026-02-10-001         │
│  Statut : Verrouillée 🔒                │
│                                         │
│  Montant : 2 000,00 $                   │
│  Date : 10 février 2026, 08:45          │
│                                         │
│  Remis par : Jean Dupont ✅             │
│  Vérifié par : Marie Tremblay ✅        │
│  Reçu par : Paul Martin ✅              │
│                                         │
│  [Télécharger le reçu PDF]              │
│  [Voir l'audit log]                     │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📊 Audit Log automatique

### Événements tracés

```ts
enum AuditAction {
  HANDOVER_CREATED = "handover_created",
  SIGNATURE_ADDED = "signature_added",
  HANDOVER_CONFIRMED = "handover_confirmed",
  HANDOVER_LOCKED = "handover_locked",
  MODIFICATION_ATTEMPTED = "modification_attempted", // ❌ Rejeté
}
```

### Structure du log

```ts
interface AuditLog {
  id: string;
  entity: "cash_handover";
  entity_id: string;
  action: AuditAction;
  performed_by: string;
  timestamp: string;
  before_state?: object;
  after_state?: object;
  ip_address?: string;
  user_agent?: string;
}
```

### Exemple de log

```json
{
  "id": "audit_001",
  "entity": "cash_handover",
  "entity_id": "handover_123",
  "action": "signature_added",
  "performed_by": "emp_marie",
  "timestamp": "2026-02-10T08:47:32Z",
  "before_state": {
    "verified_by_signature": null
  },
  "after_state": {
    "verified_by_signature": "sig_xyz789"
  }
}
```

---

## 🔐 Système de signatures numériques

### Option 1 : Signature simple (PIN)
```ts
// L'employé entre son code PIN personnel
const signature = await hashPIN(employee_pin + handover_id + timestamp);
```

### Option 2 : Signature biométrique
```ts
// Capture d'empreinte ou signature tactile
const signature = await captureSignature({
  employee_id,
  handover_id,
  device_id
});
```

### Option 3 : Double facteur
```ts
// PIN + code SMS
const signature = await verifyTwoFactor({
  pin: employee_pin,
  sms_code: received_code,
  handover_id
});
```

---

## 🗂️ Architecture fichiers

```
treasury/
├── components/
│   ├── CashHandoverForm.tsx
│   ├── SignatureCapture.tsx
│   ├── HandoverConfirmation.tsx
│   └── HandoverReceipt.tsx
│
├── hooks/
│   ├── useCashHandover.ts
│   └── useAuditLog.ts
│
├── lib/
│   ├── validations.ts        // Zod schemas
│   ├── signatures.ts         // Signature logic
│   └── audit.ts              // Audit logger
│
└── types.ts
```

---

## 🧪 Tests critiques à implémenter

```ts
describe("CashHandover", () => {
  test("Rejette si handed_by === received_by", () => {
    // ❌ Doit échouer
  });

  test("Rejette modification après confirmation", () => {
    // ❌ Doit échouer
  });

  test("Exige 3 signatures avant confirmation", () => {
    // ❌ Doit échouer si < 3 signatures
  });

  test("Crée un audit log à chaque action", () => {
    // ✅ Doit créer 4+ logs
  });

  test("Génère un PDF valide après confirmation", () => {
    // ✅ PDF avec QR code de vérification
  });
});
```

---

## 📄 Format du reçu PDF généré

```
╔═══════════════════════════════════════════╗
║   REÇU DE REMISE DE CAISSE                ║
║   Caisse Populaire Caposa                 ║
╚═══════════════════════════════════════════╝

Référence : #RC-2026-02-10-001
Date : 10 février 2026, 08:45
Agence : Succursale Centre-ville

────────────────────────────────────────────
MONTANT REMIS : 2 000,00 $
────────────────────────────────────────────

✅ Remis par
   Jean Dupont (#EMP-001)
   Signé le 10/02/2026 à 08:45:12

✅ Vérifié par
   Marie Tremblay (#EMP-002)
   Signé le 10/02/2026 à 08:47:32

✅ Reçu par
   Paul Martin (#EMP-003)
   Signé le 10/02/2026 à 08:50:08

────────────────────────────────────────────
Statut : CONFIRMÉ ET VERROUILLÉ 🔒
Ce document ne peut plus être modifié.

[QR Code de vérification]

Hash de vérification :
a3f9c8d2e1b4f7a6c9d8e2f1b3a4c5d6
```

---

## 🚨 Messages d'erreur

```ts
const ERROR_MESSAGES = {
  SAME_PERSON: "❌ La même personne ne peut pas remettre ET recevoir l'argent",
  ALREADY_LOCKED: "🔒 Cette remise est verrouillée et ne peut plus être modifiée",
  MISSING_SIGNATURES: "✍️ Les 3 signatures sont requises avant confirmation",
  INVALID_AMOUNT: "💰 Le montant doit être strictement positif",
  UNAUTHORIZED: "🚫 Vous n'êtes pas autorisé à signer cette remise"
};
```

---

## ✅ Checklist de développement

- [ ] Schéma Zod avec validation des 3 acteurs différents
- [ ] Composant formulaire avec dropdowns employés
- [ ] Système de signatures (choisir PIN/bio/2FA)
- [ ] Blocage automatique après confirmation
- [ ] Audit log automatique sur chaque action
- [ ] Génération PDF avec QR code
- [ ] Tests unitaires (minimum 5 scénarios)
- [ ] Interface de consultation (lecture seule après lock)

---

**Tu ne gères pas l'argent. Tu gères la preuve. 🔒**