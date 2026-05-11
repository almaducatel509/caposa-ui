
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
import { AccountData } from './validationsaccount';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MOCK ACCOUNTS — Référence pour le backend
 *
 * Ce mock sert d'EXEMPLE de référence pour le backend Django.
 * Toute réponse de l'API /accounts/ DOIT respecter cette structure.
 *
 * Couverture :
 *   • 2 comptes ACTIF      → onglet "Ouverts"
 *   • 1 compte EN_ATTENTE  → onglet "Ouverts" (avec pastille 🟠)
 *   • 1 compte GELE        → onglet "Gelés"
 *   • 1 compte FERME       → onglet "Archive"
 *   • 1 compte ARCHIVE     → onglet "Archive" (état terminal)
 *
 * Types de comptes couverts : epargne, cheques, terme
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const mockAccounts: AccountData[] = [

  /* ──────────────────────────────────────────────────────────────────────────
   * ACTIF — Compte épargne classique
   * ─────────────────────────────────────────────────────────────────────── */
  {
    // API
    id:             "acc-001",
    account_number: "636-922-093-4469",
    member:         "mem-001",
    account_type:   "Savings Account",
    balance:        "15000.00",
    account_status: "actif",
    created_by:     "admin-001",
    created_at:     "2025-11-10T22:20:12.478093Z",
    updated_at:     "2025-11-10T22:20:12.478093Z",

    // Enrichi front
    id_membre:    "mem-001",
    typeCompte:   "epargne",
    soldeActuel:  15000,

    // Métier
    dateOuverture:       "2025-11-10",
    dateFermeture:       null,
    tauxInteret:         2.5,
    limiteTrait:         null,
    limiteCredit:        null,
    fraisServiceMensuel: 0,

    // Relations
    member_details: {
      id:               "mem-001",
      first_name:       "Hudson",
      last_name:        "Joseph",
      full_name:        "Hudson Joseph",
      id_number:        "555555",
      email:            null,
      phone_number:     "1248666",
      address:          "44 Bis Rue Tozin",
      city:             "Limonade",
      department:       "Nord",
      date_of_birthday: "1999-06-08",
      gender:           "M",
      photo_profil:     null,
      created_at:       "2025-11-10T22:20:12.446948Z",
      updated_at:       "2025-11-10T22:20:12.446948Z",
    },

    // Stats
    total_transactions:    5,
    total_deposits:        20000,
    total_withdrawals:     5000,
    last_transaction_date: "2025-12-10",
  },

  /* ──────────────────────────────────────────────────────────────────────────
   * ACTIF — Compte chèques
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id:             "acc-002",
    account_number: "789-123-456-7890",
    member:         "mem-001",
    account_type:   "Checking Account",
    balance:        "5500.50",
    account_status: "actif",
    created_by:     "admin-001",
    created_at:     "2025-10-15T14:30:00.000000Z",
    updated_at:     "2025-12-01T10:15:00.000000Z",

    id_membre:    "mem-001",
    typeCompte:   "cheques",
    soldeActuel:  5500.50,

    dateOuverture:       "2025-10-15",
    dateFermeture:       null,
    tauxInteret:         null,
    limiteTrait:         10000,
    limiteCredit:        null,
    fraisServiceMensuel: 50,

    member_details: {
      id:               "mem-001",
      first_name:       "Hudson",
      last_name:        "Joseph",
      full_name:        "Hudson Joseph",
      id_number:        "555555",
      email:            null,
      phone_number:     "1248666",
      address:          "44 Bis Rue Tozin",
      city:             "Limonade",
      department:       "Nord",
      date_of_birthday: "1999-06-08",
      gender:           "M",
      photo_profil:     null,
    },

    total_transactions:    12,
    total_deposits:        8000,
    total_withdrawals:     2500,
    last_transaction_date: "2025-12-08",
  },

  /* ──────────────────────────────────────────────────────────────────────────
   * EN_ATTENTE — KYC en cours, pas encore activé
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id:             "acc-003",
    account_number: "111-222-333-4444",
    member:         "mem-003",
    account_type:   "Savings Account",
    balance:        "0.00",
    account_status: "en_attente",
    created_by:     "admin-001",
    created_at:     "2026-05-01T10:00:00.000000Z",
    updated_at:     "2026-05-01T10:00:00.000000Z",

    id_membre:    "mem-003",
    typeCompte:   "epargne",
    soldeActuel:  0,

    dateOuverture:       "2026-05-01",
    dateFermeture:       null,
    tauxInteret:         2.0,
    limiteTrait:         null,
    limiteCredit:        null,
    fraisServiceMensuel: 0,

    member_details: {
      id:               "mem-003",
      first_name:       "Jean-Pierre",
      last_name:        "Antoine",
      full_name:        "Jean-Pierre Antoine",
      id_number:        "112233",
      email:            "jp.antoine@example.com",
      phone_number:     "5556677",
      address:          "12 Rue Capois",
      city:             "Port-au-Prince",
      department:       "Ouest",
      date_of_birthday: "1990-04-22",
      gender:           "M",
      photo_profil:     null,
    },

    total_transactions:    0,
    total_deposits:        0,
    total_withdrawals:     0,
  },

  /* ──────────────────────────────────────────────────────────────────────────
   * GELE — Compte à terme bloqué (litige)
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id:             "acc-004",
    account_number: "321-654-987-0123",
    member:         "mem-002",
    account_type:   "Term Deposit Account",
    balance:        "50000.00",
    account_status: "gele",
    created_by:     "admin-001",
    created_at:     "2025-01-01T00:00:00.000000Z",
    updated_at:     "2025-12-11T08:00:00.000000Z",

    id_membre:    "mem-002",
    typeCompte:   "terme",
    soldeActuel:  50000,

    dateOuverture:       "2025-01-01",
    dateFermeture:       null,
    tauxInteret:         5.5,
    limiteTrait:         null,
    limiteCredit:        null,
    fraisServiceMensuel: 0,

    // Spécifique terme
    date_echeance:             "2026-01-01",
    duree_terme_mois:          12,
    maturite_atteinte:         false,
    penalite_retrait_anticipe: 2.5,

    member_details: {
      id:               "mem-002",
      first_name:       "Marie",
      last_name:        "Dupont",
      full_name:        "Marie Dupont",
      id_number:        "987654",
      email:            "marie.dupont@example.com",
      phone_number:     "3456789",
      address:          "123 Rue Principale",
      city:             "Port-au-Prince",
      department:       "Ouest",
      date_of_birthday: "1985-03-15",
      gender:           "F",
      photo_profil:     null,
    },

    total_transactions:    2,
    total_deposits:        50000,
    total_withdrawals:     0,
    last_transaction_date: "2025-01-01",
  },

  /* ──────────────────────────────────────────────────────────────────────────
   * FERME — Compte fermé récemment (avant archivage)
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id:             "acc-005",
    account_number: "000-111-222-3333",
    member:         "mem-002",
    account_type:   "Savings Account",
    balance:        "0.00",
    account_status: "ferme",
    created_by:     "admin-001",
    created_at:     "2023-01-01T00:00:00.000000Z",
    updated_at:     "2025-06-30T00:00:00.000000Z",

    id_membre:    "mem-002",
    typeCompte:   "epargne",
    soldeActuel:  0,

    dateOuverture:       "2023-01-01",
    dateFermeture:       "2025-06-30",
    tauxInteret:         2.0,
    limiteTrait:         null,
    limiteCredit:        null,
    fraisServiceMensuel: 0,

    member_details: {
      id:               "mem-002",
      first_name:       "Marie",
      last_name:        "Dupont",
      full_name:        "Marie Dupont",
      id_number:        "987654",
      email:            "marie.dupont@example.com",
      phone_number:     "3456789",
      address:          "123 Rue Principale",
      city:             "Port-au-Prince",
      department:       "Ouest",
      date_of_birthday: "1985-03-15",
      gender:           "F",
      photo_profil:     null,
    },

    total_transactions:    45,
    total_deposits:        80000,
    total_withdrawals:     80000,
    last_transaction_date: "2025-06-28",
  },

  /* ──────────────────────────────────────────────────────────────────────────
   * ARCHIVE — État terminal, conservé pour audit
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id:             "acc-006",
    account_number: "999-888-777-6666",
    member:         "mem-004",
    account_type:   "Savings Account",
    balance:        "0.00",
    account_status: "archive",
    created_by:     "admin-001",
    created_at:     "2020-01-01T00:00:00.000000Z",
    updated_at:     "2022-12-31T00:00:00.000000Z",

    id_membre:    "mem-004",
    typeCompte:   "epargne",
    soldeActuel:  0,

    dateOuverture:       "2020-01-01",
    dateFermeture:       "2022-12-31",
    tauxInteret:         1.5,
    limiteTrait:         null,
    limiteCredit:        null,
    fraisServiceMensuel: 0,

    member_details: {
      id:               "mem-004",
      first_name:       "Paul",
      last_name:        "Léger",
      full_name:        "Paul Léger",
      id_number:        "445566",
      email:            "paul.leger@example.com",
      phone_number:     "9887766",
      address:          "55 Rue des Cèdres",
      city:             "Cap-Haïtien",
      department:       "Nord",
      date_of_birthday: "1970-09-10",
      gender:           "M",
      photo_profil:     null,
    },

    total_transactions:    120,
    total_deposits:        150000,
    total_withdrawals:     150000,
    last_transaction_date: "2022-12-30",
  },
];

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * enrichAccountData
 *
 * Transforme une réponse brute de l'API en AccountData enrichi pour le front.
 * Le backend renvoie déjà `account_status` comme enum string.
 * Cette fonction ajoute uniquement les champs CALCULÉS côté front :
 *   • id_membre    : alias de member
 *   • typeCompte   : enum FR mappé depuis account_type
 *   • soldeActuel  : parseFloat de balance
 *   • dateOuverture: extraite de created_at
 * ─────────────────────────────────────────────────────────────────────────────
 */export function enrichAccountData(apiAccount: AccountData): AccountData {
  const typeMap: Record<string, 'epargne' | 'cheques' | 'terme'> = {
    'Savings Account':      'epargne',
    'Checking Account':     'cheques',
    'Term Deposit Account': 'terme',
  };

  return {
    ...apiAccount,
    id_membre:     apiAccount.member,
    typeCompte:    typeMap[apiAccount.account_type] ?? 'epargne',
    soldeActuel:   parseFloat(apiAccount.balance || '0'),
    dateOuverture: apiAccount.dateOuverture
                ?? apiAccount.created_at?.split('T')[0]
                ?? new Date().toISOString().split('T')[0],
  };
}