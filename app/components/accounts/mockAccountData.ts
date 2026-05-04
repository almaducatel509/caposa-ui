import { AccountData } from './validationsaccount';

// ─────────────────────────────────────────────────────────────────────────────
// MODIFICATIONS apportées à ce fichier :
//
// 1. RÉDUCTION à 3 statuts métier (au lieu de 5) :
//    - 'ouvert' : actif, utilisable
//    - 'gelé'   : temporairement bloqué
//    - 'fermé'  : clôturé définitivement (= ce qu'on appelait "archive")
//
//    SUPPRIMÉS :
//    - 'en_attente' : ce n'est pas un statut de COMPTE en banque. C'est un
//                     statut de demande / transaction. Si KYC il y a, il vit
//                     dans une autre entité (demande_ouverture). Un compte
//                     n'existe en base qu'une fois validé → directement 'ouvert'.
//    - 'archive' : redondant avec 'fermé'. Un compte fermé EST archivé.
//
// 2. Le mock 'acc-pending-001' (Jean-Pierre Antoine) est SUPPRIMÉ.
//
// 3. Le mock 'acc-arch-001' (Marie Dupont) garde son existence mais passe
//    de statusAccount: "archive" → statusAccount: "fermé".
//
// 4. enrichAccountData : fallback simplifié — true → 'ouvert', false → 'fermé'.
// ─────────────────────────────────────────────────────────────────────────────

export const mockAccounts: AccountData[] = [

  // ── Ouverts ───────────────────────────────────────────────────────────────
  {
    id: "acc-open-001",
    account_number: "636-922-093-4469",
    member: "mem-001",
    account_type: "Savings Account",
    balance: "15000.00",
    account_status: true,
    created_by: "admin-001",
    created_at: "2025-11-10T22:20:12.478093Z",
    updated_at: "2025-11-10T22:20:12.478093Z",

    id_membre: "mem-001",
    typeCompte: "epargne",
    soldeActuel: 15000,
    statusAccount: "ouvert",

    dateOuverture: "2025-11-10",
    tauxInteret: 2.5,
    fraisServiceMensuel: 0,
    limiteCredit: null,

    member_details: {
      id: "mem-001",
      first_name: "Hudson",
      last_name: "Joseph",
      full_name: "Hudson Joseph",
      id_number: "555555",
      phone_number: "1248666",
      email: null,
      address: "44 Bis Rue Tozin",
      city: "Limonade",
      department: "Nord",
      date_of_birthday: "1999-06-08",
      gender: "M",
      status: true,
      created_at: "2025-11-10T22:20:12.446948Z",
      updated_at: "2025-11-10T22:20:12.446948Z",
    },

    total_transactions: 5,
    total_deposits: 20000,
    total_withdrawals: 5000,
    last_transaction_date: "2025-12-10",
  },

  {
    id: "acc-open-002",
    account_number: "789-123-456-7890",
    member: "mem-001",
    account_type: "Checking Account",
    balance: "5500.50",
    account_status: true,
    created_by: "admin-001",
    created_at: "2025-10-15T14:30:00.000000Z",
    updated_at: "2025-12-01T10:15:00.000000Z",

    id_membre: "mem-001",
    typeCompte: "cheques",
    soldeActuel: 5500.50,
    statusAccount: "ouvert",

    dateOuverture: "2025-10-15",
    limiteTrait: 10000,
    fraisServiceMensuel: 50,
    limiteCredit: null,

    member_details: {
      id: "mem-001",
      first_name: "Hudson",
      last_name: "Joseph",
      full_name: "Hudson Joseph",
      id_number: "555555",
      phone_number: "1248666",
      email: null,
      address: "44 Bis Rue Tozin",
      city: "Limonade",
      department: "Nord",
      date_of_birthday: "1999-06-08",
      gender: "M",
      status: true,
    },

    total_transactions: 12,
    total_deposits: 8000,
    total_withdrawals: 2500,
    last_transaction_date: "2025-12-08",
  },

  // ── Gelés ─────────────────────────────────────────────────────────────────
  {
    id: "acc-frozen-001",
    account_number: "321-654-987-0123",
    member: "mem-002",
    account_type: "Term Deposit Account",
    balance: "50000.00",
    account_status: true,
    created_by: "admin-001",
    created_at: "2025-01-01T00:00:00.000000Z",
    updated_at: "2025-12-11T08:00:00.000000Z",

    id_membre: "mem-002",
    typeCompte: "terme",
    soldeActuel: 50000,
    statusAccount: "gelé",

    dateOuverture: "2025-01-01",
    tauxInteret: 5.5,
    fraisServiceMensuel: 0,
    limiteCredit: null,

    member_details: {
      id: "mem-002",
      first_name: "Marie",
      last_name: "Dupont",
      full_name: "Marie Dupont",
      id_number: "987654",
      phone_number: "3456789",
      email: "marie.dupont@example.com",
      address: "123 Rue Principale",
      city: "Port-au-Prince",
      department: "Ouest",
      date_of_birthday: "1985-03-15",
      gender: "F",
      status: true,
    },

    total_transactions: 2,
    total_deposits: 50000,
    total_withdrawals: 0,
    last_transaction_date: "2025-01-01",
  },

  // ── Fermés (= archivés) ───────────────────────────────────────────────────
  // Avant : statusAccount: "archive" → renommé "fermé" (un seul état terminal)
  {
    id: "acc-arch-001",
    account_number: "000-111-222-3333",
    member: "mem-002",
    account_type: "Savings Account",
    balance: "0.00",
    account_status: false,
    created_by: "admin-001",
    created_at: "2023-01-01T00:00:00.000000Z",
    updated_at: "2025-06-30T00:00:00.000000Z",

    id_membre: "mem-002",
    typeCompte: "epargne",
    soldeActuel: 0,
    statusAccount: "fermé",

    dateOuverture: "2023-01-01",
    dateFermeture: "2025-06-30",
    tauxInteret: 2.0,
    fraisServiceMensuel: 0,
    limiteCredit: null,

    member_details: {
      id: "mem-002",
      first_name: "Marie",
      last_name: "Dupont",
      full_name: "Marie Dupont",
      id_number: "987654",
      phone_number: "3456789",
      email: "marie.dupont@example.com",
      city: "Port-au-Prince",
      department: "Ouest",
      gender: "F",
      status: true,
    },

    total_transactions: 45,
    total_deposits: 80000,
    total_withdrawals: 80000,
    last_transaction_date: "2025-06-28",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// enrichAccountData
//
// MODIFICATIONS :
// - Le type de retour `statusAccount` est désormais 'ouvert' | 'gelé' | 'fermé'.
// - Si l'API renvoie déjà `statusAccount` → on le garde tel quel.
// - Sinon fallback minimal sur `account_status` (booléen) :
//     true  → 'ouvert'
//     false → 'fermé'
// ─────────────────────────────────────────────────────────────────────────────
export function enrichAccountData(apiAccount: any): AccountData {
  const typeMap: Record<string, 'epargne' | 'cheques' | 'terme'> = {
    'Savings Account': 'epargne',
    'Checking Account': 'cheques',
    'Term Deposit Account': 'terme',
  };

  const status: AccountData['statusAccount'] =
    apiAccount.statusAccount
    ?? (apiAccount.account_status ? 'ouvert' : 'fermé');

  return {
    ...apiAccount,
    id_membre: apiAccount.member,
    typeCompte: typeMap[apiAccount.account_type] || 'epargne',
    soldeActuel: parseFloat(apiAccount.balance || '0'),
    statusAccount: status,
    dateOuverture: apiAccount.created_at?.split('T')[0]
                || new Date().toISOString().split('T')[0],
    limiteCredit: apiAccount.limiteCredit ?? null,
  };
}