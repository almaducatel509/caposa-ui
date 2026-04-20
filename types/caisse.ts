/**
 * @/types/caisse.ts
 * ─────────────────────────────────────────────────────────────────
 * Source de vérité unique pour tous les types liés aux caisses.
 * Ne jamais redéfinir ces types dans les composants.
 * ─────────────────────────────────────────────────────────────────
 */

// ─── Enums / Littéraux ───────────────────────────────────────────
// Déclarés EN PREMIER — utilisés par les interfaces ci-dessous.

export type CaisseStatus  = 'ouverte' | 'fermée';
export type CaisseDevise  = 'HTG' | 'USD';
export type AlertSeverity = 'error' | 'warning' | 'info';

export type TransactionType =
  | 'depot'
  | 'retrait'
  | 'transfert_entrant'
  | 'transfert_sortant'
  | 'pret_encaisse'
  | 'pret_debourse'
  | 'frais'
  | 'autre';

export type TransactionStatut = 'normal' | 'annulee';

// ─── Caisse (entité physique) ────────────────────────────────────

export interface Caisse {
  id:               string;
  numero_caisse:    string;
  nom_caisse:       string;
  localisation:     string;
  branch:           string;        // UUID → FK vers Branch
  branch_name?:     string;        // annoté par le serializer Django
  devise:           CaisseDevise;
  solde_initial:    number;
  solde_actuel?:    number;        // calculé par le backend (annotate ou property)
  actif:            boolean;
  created_at?:      string;        // ISO — auto_now_add Django
  nb_sessions?:     number;        // Count annoté dans le queryset Django
  derniere_session?: string;       // Max(ouverture_at) annoté dans le queryset
}

// ─── Session de caisse ───────────────────────────────────────────

export interface CaisseSession {
  id: string;

  // ── Identité ──────────────────────────────────────────────────
  username:             string;        // FK → User.username (caissier)
  caissier_nom: string | undefined;       // nom lisible — lecture seule, retourné par l'API
  numero_caisse:        string;        // ex : C-01
  branch:               string;        // UUID agence
  branch_name?:         string;        // nom lisible — retourné par l'API
  devise:               CaisseDevise;  // HTG | USD

  // ── Caisse physique (dénormalisé pour affichage) ──────────────
  nom_caisse?:          string;
  localisation?:        string;
  solde_initial?:       number;
  solde_actuel?:        number;        // calculé en temps réel par le backend
  actif?:               boolean;
  nb_sessions?:         number;        // nombre total de sessions de cette caisse
  derniere_session?:    string;        // ISO — dernière session de cette caisse
  created_at?:          string;        // ISO — date de création de la caisse

  // ── Autorisation ──────────────────────────────────────────────
  superviseur:          string;        // username du superviseur
  id_responsable_cash:  string;        // username qui remet le cash

  // ── Montants ──────────────────────────────────────────────────
  montant_ouverture:    number;
  montant_fermeture?:   number;        // renseigné à la clôture
  montant_theorique?:   number;        // calculé automatiquement par le système
  ecart?:               number;        // montant_fermeture - montant_theorique

  // ── Multi-devises (si devise = USD) ───────────────────────────
  taux_change?:         number;        // taux figé à l'ouverture (immuable pour audit)
  montant_equivalent?:  number;        // équivalent HTG calculé à l'ouverture

  // ── Statut & dates ────────────────────────────────────────────
  statut:               CaisseStatus;
  ouverture_at:         string;        // ISO
  fermeture_at?:        string;        // ISO

  // ── Audit & traçabilité ───────────────────────────────────────
  ip_address?:          string;        // IP lors de l'ouverture
  device_id?:           string;        // terminal / navigateur
  tentatives_ouverture: number;        // tentatives de saisie id_responsable_cash

  // ── Fermeture ─────────────────────────────────────────────────
  note_fermeture?:      string;        // obligatoire si écart ≠ 0

  // ── Sécurité (fermeture forcée par admin) ─────────────────────
  forcee_par?:          string;        // username admin qui a forcé la fermeture
  raison_forcage?:      string;        // raison du forçage (sans accent dans la clé)

  // ── Rapport fin de journée ────────────────────────────────────
  nb_transactions?:         number;    // snapshot figé à la fermeture
  remise_effectuee:         boolean;
  reconciliation_effectuee: boolean;
}

// ─── Transaction de caisse ───────────────────────────────────────

export interface CaisseTransaction {
  id:               string;
  session_id:       string;
  cashier_id:       string;
  cash_register_id: string;
  type:             TransactionType;
  montant:          number;
  solde_apres:      number;
  client?:          string;
  reference?:       string;
  note?:            string;        
  statut:           TransactionStatut;
  motif_annulation?: string;
  ip_address?:      string;
  device_id?:       string;
  effectue_par:     string;
  timestamp:        string;
}

// ─── Alerte caisse ───────────────────────────────────────────────

export interface CaisseAlert {
  id:       string;
  severity: AlertSeverity;
  message:  string;
  time?:    string;
}

// ─── Payload ouverture ───────────────────────────────────────────

export interface OpenSessionPayload {
  caissier_nom: string | undefined;
  username:            string;     // FK User.username (caissier)
  numero_caisse:       string;
  branch:              string;     // UUID agence
  devise:              CaisseDevise;
  superviseur:         string;
  id_responsable_cash: string;
  montant_ouverture:   number;
  ip_address?:         string;     // collecté côté front avant envoi
  device_id?:          string;     // navigator.userAgent ou fingerprintjs
}

// ─── Payload fermeture normale ───────────────────────────────────

export interface CloseSessionPayload {
  montant_fermeture:        number;
  note_fermeture?:          string;
  remise_effectuee:         boolean;
  reconciliation_effectuee: boolean;
}

// ─── Payload fermeture forcée (admin) ────────────────────────────

export interface ForceCloseSessionPayload {
  forcee_par:         string;      // username admin
  raison_forcage:     string;      // obligatoire
  montant_fermeture?: number;      // optionnel si l'admin ne connaît pas le montant
}

// ─── Dashboard ───────────────────────────────────────────────────

export interface DashboardData {
  sessions:       CaisseSession[];
  transactions:   CaisseTransaction[];
  alerts:         CaisseAlert[];
  montant_caisse: number;
}