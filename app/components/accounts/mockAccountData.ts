import { AccountData } from './validationsaccount';

/**
 * Mock data qui correspond EXACTEMENT à la structure de l'API
 */
export const mockAccounts: AccountData[] = [
  {
    // ⬇️ Champs API exacts
    id: "ec1bbed7-1ebe-4490-a326-1a60e615cc30",
    account_number: "636-922-093-4469",
    member: "dcb21971-a6bd-475b-ae60-792f78aa1a14",
    account_type: "Savings Account",
    balance: "15000.00",
    account_status: true,
    created_by: "50d3cbe9-bc0b-407c-ae16-e2615f60cbab",
    created_at: "2025-11-10T22:20:12.478093Z",
    updated_at: "2025-11-10T22:20:12.478093Z",

    // ⬇️ Champs calculés pour l'UI
    id_membre: "dcb21971-a6bd-475b-ae60-792f78aa1a14",
    typeCompte: "epargne",
    soldeActuel: 15000,
    statutCompte: "actif",
    dateOuverture: "2025-11-10",
    tauxInteret: 2.5,
    fraisServiceMensuel: 0,

    // ⬇️ Détails du membre
    member_details: {
      id: "dcb21971-a6bd-475b-ae60-792f78aa1a14",
      first_name: "Hudson",
      last_name: "Joseph",
      full_name: "Hudson Joseph",
      id_number: "555555",
      phone_number: "1248666",
      email: null,
      address: "44 Bis Rue Tozin, Limonade",
      city: "Limonade",
      department: "Nord",
      date_of_birthday: "1999-06-08",
      gender: "M",
      status: true,
      created_at: "2025-11-10T22:20:12.446948Z",
      updated_at: "2025-11-10T22:20:12.446948Z",
    },

    // ⬇️ Stats
    total_transactions: 5,
    total_deposits: 20000,
    total_withdrawals: 5000,
    last_transaction_date: "2025-12-10",
  },
  
  {
    id: "a1b2c3d4-e5f6-4789-a1b2-c3d4e5f67890",
    account_number: "789-123-456-7890",
    member: "dcb21971-a6bd-475b-ae60-792f78aa1a14",
    account_type: "Checking Account",
    balance: "5500.50",
    account_status: true,
    created_by: "50d3cbe9-bc0b-407c-ae16-e2615f60cbab",
    created_at: "2025-10-15T14:30:00.000000Z",
    updated_at: "2025-12-01T10:15:00.000000Z",

    id_membre: "dcb21971-a6bd-475b-ae60-792f78aa1a14",
    typeCompte: "cheques",
    soldeActuel: 5500.50,
    statutCompte: "actif",
    dateOuverture: "2025-10-15",
    limiteTrait: 10000,
    fraisServiceMensuel: 50,

    member_details: {
      id: "dcb21971-a6bd-475b-ae60-792f78aa1a14",
      first_name: "Hudson",
      last_name: "Joseph",
      full_name: "Hudson Joseph",
      id_number: "555555",
      phone_number: "1248666",
      email: null,
      address: "44 Bis Rue Tozin, Limonade",
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

  {
    id: "f1e2d3c4-b5a6-4321-9876-543210fedcba",
    account_number: "321-654-987-0123",
    member: "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67891",
    account_type: "Term Deposit Account",
    balance: "50000.00",
    account_status: true,
    created_by: "50d3cbe9-bc0b-407c-ae16-e2615f60cbab",
    created_at: "2025-01-01T00:00:00.000000Z",
    updated_at: "2025-12-11T08:00:00.000000Z",

    id_membre: "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67891",
    typeCompte: "terme",
    soldeActuel: 50000,
    statutCompte: "actif",
    dateOuverture: "2025-01-01",
    tauxInteret: 5.5,
    fraisServiceMensuel: 0,

    member_details: {
      id: "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67891",
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

  {
    id: "suspended-account-1234",
    account_number: "111-222-333-4444",
    member: "dcb21971-a6bd-475b-ae60-792f78aa1a14",
    account_type: "Savings Account",
    balance: "1200.00",
    account_status: false,  // ← Compte suspendu
    created_by: "50d3cbe9-bc0b-407c-ae16-e2615f60cbab",
    created_at: "2024-06-01T00:00:00.000000Z",
    updated_at: "2025-11-15T12:00:00.000000Z",

    id_membre: "dcb21971-a6bd-475b-ae60-792f78aa1a14",
    typeCompte: "epargne",
    soldeActuel: 1200,
    statutCompte: "suspendu",
    dateOuverture: "2024-06-01",
    tauxInteret: 2.0,
    fraisServiceMensuel: 0,

    member_details: {
      id: "dcb21971-a6bd-475b-ae60-792f78aa1a14",
      first_name: "Hudson",
      last_name: "Joseph",
      full_name: "Hudson Joseph",
      id_number: "555555",
      phone_number: "1248666",
      email: null,
    },

    total_transactions: 8,
    total_deposits: 3000,
    total_withdrawals: 1800,
    last_transaction_date: "2025-11-10",
  },
];

/**
 * Helper pour enrichir les données API avec les champs calculés
 */
export function enrichAccountData(apiAccount: any): AccountData {
  const typeMap: Record<string, 'epargne' | 'cheques' | 'terme'> = {
    'Savings Account': 'epargne',
    'Checking Account': 'cheques',
    'Term Deposit Account': 'terme',
  };

  return {
    ...apiAccount,
    id_membre: apiAccount.member,
    typeCompte: typeMap[apiAccount.account_type] || 'epargne',
    soldeActuel: parseFloat(apiAccount.balance || '0'),
    statutCompte: apiAccount.account_status ? 'actif' : 'suspendu',
    dateOuverture: apiAccount.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
  };
}