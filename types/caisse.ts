import { ReactNode } from "react";

export type CaisseStatus  = 'fermée' | 'ouverte';
export type AlertSeverity = 'error' | 'warning' | 'info';
export type CaisseDevise = 'HTG' | 'USD';

// l'interface ci-dessous et décommenter la ligne ci-dessus.

export interface Caisse {
  id:                string;
  numero_caisse:     string;
  nom_caisse:        string;
  localisation:      string;
  branch:            string;      // UUID → FK vers Branch
  branch_name?:      string;      // champ annoté par le serializer Django (__str__ ou SerializerMethodField)
  devise:            'HTG' | 'USD';
  solde_initial:     number;
  solde_actuel?:     number;      // calculé par le backend (annotate ou property)
  actif:             boolean;
  created_at?:       string;      // ISO — auto_now_add Django
  nb_sessions?:      number;      // Count annoté dans le queryset Django
  derniere_session?: string;      // Max(ouverture_at) annoté dans le queryset
}

export interface CaisseAlert {
  id:       string;
  severity: AlertSeverity;
  message:  string;
  time?:    string;
}

export interface CaisseTransaction {
  id?: string | number;  
  transactionId: string;  // ← plus explicite que 'id'
  type:          'deposit' | 'withdrawal' | 'transfer' | 'loan';
  amount:        number;
  time:          string;
  note:          string;
  sessionId:     string;
}

export interface CaisseSession {
  caissier_nom: string;
  actif: any;
  nom_caisse: string;
  localisation: string;
  branch_name: string;
  solde_actuel: any;
  solde_initial: any;
  nb_sessions: string;
  derniere_session(derniere_session: any): unknown;
  created_at(created_at: any): unknown;
  id:                       string;
 
  // ── Identité ────────────────────────────────────────────────────
  username:                 string;       // FK → User.username (caissier)
  numero_caisse:            string;       // ex : C-01
  branch:                   string;       // UUID → agence
  devise:                   CaisseDevise; // HTG | USD
 
  // ── Autorisation ────────────────────────────────────────────────
  superviseur:              string;       // username du superviseur
  id_responsable_cash:      string;       // username qui remet le cash
 
  // ── Montants ────────────────────────────────────────────────────
  montant_ouverture:        number;
  montant_fermeture?:       number;       // renseigné à la clôture
  montant_theorique?:       number;       // calculé par le système
  ecart?:                   number;       // montant_fermeture - montant_theorique
 
  // ── Statut & dates ──────────────────────────────────────────────
  statut:                   CaisseStatus;
  ouverture_at:             string;       // ISO
  fermeture_at?:            string;       // ISO
 
  // ── Audit & traçabilité ──────────────────────────────────────────
  ip_address?:              string;       // IP d'ouverture
  device_id?:               string;       // terminal/poste
  tentatives_ouverture:     number;       // nb tentatives ID responsable cash
  note_fermeture?:          string;       // commentaire clôture
 
  // ── Sécurité ────────────────────────────────────────────────────
  forcee_par?:              string;       // username admin si fermeture forcée
  raison_forçage?:          string;       // pourquoi l'admin a forcé
 
  // ── Rapport de fin de journée ────────────────────────────────────
  nb_transactions?:         number;       // snapshot à la fermeture
  remise_effectuee:         boolean;
  reconciliation_effectuee: boolean;
}

export interface OpenSessionPayload {
  username:            string;
  numero_caisse:       string;
  superviseur:         string;
  montant_ouverture:   number;
  id_responsable_cash: string;
  branch:              string;       // ← cette ligne doit être présente
  devise:              CaisseDevise; // ← cette ligne aussi
}

export interface CloseSessionPayload {
  montant_fermeture: number;
}
// @/types/caisse.ts


export interface DashboardData {
  sessions:      CaisseSession[];
  transactions:  CaisseTransaction[];
  alerts:        CaisseAlert[];
  montant_caisse: number;
}