// app/components/account/mockAccountData.ts
import { AccountData, MemberData } from './validationsaccount';

// ============= MOCK MEMBERS =============
export const mockMembers: MemberData[] = [
  {
    id: 'M001',
    first_name: 'Marie',
    last_name: 'Dubois',
    full_name: 'Marie Dubois',
    id_number: 'M001',
    phone_number: '514-555-0001',
    email: 'marie.dubois@email.com',
    address: '123 Rue Saint-Denis',
    city: 'Montreal',
    department_code: 'QC',
    gender: 'F',
    date_of_birthday: '1985-03-15',
    status: 'active',
    initial_balance: 1000,
    created_at: '2023-01-15T10:00:00Z',
  },
  {
    id: 'M002',
    first_name: 'Jean',
    last_name: 'Tremblay',
    full_name: 'Jean Tremblay',
    id_number: 'M002',
    phone_number: '514-555-0002',
    email: 'jean.tremblay@email.com',
    address: '456 Avenue du Parc',
    city: 'Montreal',
    department_code: 'QC',
    gender: 'M',
    date_of_birthday: '1978-07-22',
    status: 'active',
    initial_balance: 2500,
    created_at: '2023-02-10T14:30:00Z',
  },
  {
    id: 'M003',
    first_name: 'Sophie',
    last_name: 'Gagnon',
    full_name: 'Sophie Gagnon',
    id_number: 'M003',
    phone_number: '514-555-0003',
    email: 'sophie.gagnon@email.com',
    address: '789 Rue Sherbrooke',
    city: 'Montreal',
    department_code: 'QC',
    gender: 'F',
    date_of_birthday: '1992-11-08',
    status: 'active',
    initial_balance: 500,
    created_at: '2023-03-20T09:15:00Z',
  },
  {
    id: 'M004',
    first_name: 'Pierre',
    last_name: 'Lavoie',
    full_name: 'Pierre Lavoie',
    id_number: 'M004',
    phone_number: '514-555-0004',
    email: 'pierre.lavoie@email.com',
    address: '321 Boulevard René-Lévesque',
    city: 'Montreal',
    department_code: 'QC',
    gender: 'M',
    date_of_birthday: '1980-05-30',
    status: 'inactive',
    initial_balance: 0,
    created_at: '2023-01-05T11:45:00Z',
  },
  {
    id: 'M005',
    first_name: 'Isabelle',
    last_name: 'Roy',
    full_name: 'Isabelle Roy',
    id_number: 'M005',
    phone_number: '514-555-0005',
    email: 'isabelle.roy@email.com',
    address: '555 Rue Notre-Dame',
    city: 'Montreal',
    department_code: 'QC',
    gender: 'F',
    date_of_birthday: '1995-09-12',
    status: 'active',
    initial_balance: 1500,
    created_at: '2023-04-01T16:20:00Z',
  },
];

// ============= MOCK ACCOUNTS =============
export const mockAccounts: AccountData[] = [
  {
    id: 'A001',
    idCompte: 'A001',
    noCompte: '001-123456',
    idMembre: 'M001',
    typeCompte: 'epargne',
    soldeActuel: 2500.75,
    statutCompte: 'actif',
    dateOuverture: '2024-01-14',
    tauxInteret: 2.5,
    fraisServiceMensuel: 5,
    created_at: '2024-01-14T10:00:00Z',
    updated_at: '2024-01-14T10:00:00Z',
    member_details: mockMembers[0],
    member_name: 'Marie Dubois',
    total_transactions: 15,
    total_deposits: 3500,
    total_withdrawals: 1000,
    last_transaction_date: '2024-10-25',
  },
  {
    id: 'A002',
    idCompte: 'A002',
    noCompte: '002-789012',
    idMembre: 'M002',
    typeCompte: 'cheques',
    soldeActuel: 5800.50,
    statutCompte: 'actif',
    dateOuverture: '2024-02-20',
    limiteTrait: 10000,
    fraisServiceMensuel: 10,
    created_at: '2024-02-20T14:30:00Z',
    updated_at: '2024-02-20T14:30:00Z',
    member_details: mockMembers[1],
    member_name: 'Jean Tremblay',
    total_transactions: 42,
    total_deposits: 12000,
    total_withdrawals: 6200,
    last_transaction_date: '2024-10-27',
  },
  {
    id: 'A003',
    idCompte: 'A003',
    noCompte: '003-345678',
    idMembre: 'M003',
    typeCompte: 'terme',
    soldeActuel: 10400.00,
    statutCompte: 'actif',
    dateOuverture: '2024-03-10',
    tauxInteret: 4.5,
    fraisServiceMensuel: 0,
    created_at: '2024-03-10T09:15:00Z',
    updated_at: '2024-03-10T09:15:00Z',
    member_details: mockMembers[2],
    member_name: 'Sophie Gagnon',
    total_transactions: 5,
    total_deposits: 10000,
    total_withdrawals: 0,
    last_transaction_date: '2024-09-10',
  },
  {
    id: 'A004',
    idCompte: 'A004',
    noCompte: '001-987654',
    idMembre: 'M004',
    typeCompte: 'epargne',
    soldeActuel: 150.25,
    statutCompte: 'suspendu',
    dateOuverture: '2023-06-15',
    tauxInteret: 2.5,
    fraisServiceMensuel: 5,
    created_at: '2023-06-15T11:45:00Z',
    updated_at: '2024-08-20T16:30:00Z',
    member_details: mockMembers[3],
    member_name: 'Pierre Lavoie',
    total_transactions: 8,
    total_deposits: 500,
    total_withdrawals: 350,
    last_transaction_date: '2024-08-20',
  },
  {
    id: 'A005',
    idCompte: 'A005',
    noCompte: '002-456789',
    idMembre: 'M005',
    typeCompte: 'cheques',
    soldeActuel: 0,
    statutCompte: 'ferme',
    dateOuverture: '2023-04-01',
    dateFermeture: '2024-09-30',
    limiteTrait: 5000,
    fraisServiceMensuel: 10,
    created_at: '2023-04-01T16:20:00Z',
    updated_at: '2024-09-30T10:00:00Z',
    member_details: mockMembers[4],
    member_name: 'Isabelle Roy',
    total_transactions: 28,
    total_deposits: 5000,
    total_withdrawals: 5000,
    last_transaction_date: '2024-09-30',
  },
  {
    id: 'A006',
    idCompte: 'A006',
    noCompte: '001-246810',
    idMembre: 'M001',
    typeCompte: 'cheques',
    soldeActuel: 3200.00,
    statutCompte: 'actif',
    dateOuverture: '2024-05-10',
    limiteTrait: 15000,
    fraisServiceMensuel: 10,
    created_at: '2024-05-10T08:00:00Z',
    updated_at: '2024-05-10T08:00:00Z',
    member_details: mockMembers[0],
    member_name: 'Marie Dubois',
    total_transactions: 12,
    total_deposits: 4000,
    total_withdrawals: 800,
    last_transaction_date: '2024-10-28',
  },
  {
    id: 'A007',
    idCompte: 'A007',
    noCompte: '003-135790',
    idMembre: 'M002',
    typeCompte: 'terme',
    soldeActuel: 25000.00,
    statutCompte: 'actif',
    dateOuverture: '2024-01-05',
    tauxInteret: 5.0,
    fraisServiceMensuel: 0,
    created_at: '2024-01-05T12:00:00Z',
    updated_at: '2024-01-05T12:00:00Z',
    member_details: mockMembers[1],
    member_name: 'Jean Tremblay',
    total_transactions: 2,
    total_deposits: 25000,
    total_withdrawals: 0,
    last_transaction_date: '2024-01-05',
  },
  {
    id: 'A008',
    idCompte: 'A008',
    noCompte: '001-864201',
    idMembre: 'M003',
    typeCompte: 'epargne',
    soldeActuel: 1850.40,
    statutCompte: 'actif',
    dateOuverture: '2024-06-20',
    tauxInteret: 2.5,
    fraisServiceMensuel: 5,
    created_at: '2024-06-20T14:00:00Z',
    updated_at: '2024-06-20T14:00:00Z',
    member_details: mockMembers[2],
    member_name: 'Sophie Gagnon',
    total_transactions: 18,
    total_deposits: 2500,
    total_withdrawals: 650,
    last_transaction_date: '2024-10-26',
  },
];

// ============= HELPER FUNCTIONS =============

// Get accounts by member
export const getAccountsByMember = (memberId: string): AccountData[] => {
  return mockAccounts.filter(account => account.idMembre === memberId);
};

// Get accounts by type
export const getAccountsByType = (type: 'epargne' | 'cheques' | 'terme'): AccountData[] => {
  return mockAccounts.filter(account => account.typeCompte === type);
};

// Get accounts by status
export const getAccountsByStatus = (status: 'actif' | 'ferme' | 'suspendu'): AccountData[] => {
  return mockAccounts.filter(account => account.statutCompte === status);
};

// Get active accounts
export const getActiveAccounts = (): AccountData[] => {
  return mockAccounts.filter(account => account.statutCompte === 'actif');
};

// Calculate total balance
export const getTotalBalance = (): number => {
  return mockAccounts.reduce((sum, account) => sum + account.soldeActuel, 0);
};

// Get stats
export const getAccountStats = () => {
  const total = mockAccounts.length;
  const actifs = mockAccounts.filter(a => a.statutCompte === 'actif').length;
  const fermes = mockAccounts.filter(a => a.statutCompte === 'ferme').length;
  const suspendus = mockAccounts.filter(a => a.statutCompte === 'suspendu').length;
  const totalBalance = getTotalBalance();

  return {
    total,
    actifs,
    fermes,
    suspendus,
    totalBalance,
  };
};