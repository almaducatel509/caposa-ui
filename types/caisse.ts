export type CaisseStatus  = 'fermée' | 'ouverte';
export type AlertSeverity = 'error' | 'warning' | 'info';

export interface CaisseAlert {
  id:       string;
  severity: AlertSeverity;
  message:  string;
  time?:    string;
}

export interface CaisseTransaction {
  [x: string]: string;
  id:     string;
  type:   'deposit' | 'withdrawal' | 'transfer' | 'loan';
  amount: string;
  time:  string;
  note:  string; // a corriger
}

export interface CaisseSession {
  id:                string;
  caissier_nom:      string;
  numero_caisse:     string;
  superviseur:       string;
  montant_ouverture: number;
  id_responsable_cash: string;
  ouverture_at:      string;
  fermeture_at?:     string;
  montant_fermeture?: number;
  statut:            'ouverte' | 'fermée';
}

export interface OpenSessionPayload {
  username:            string;  // ← était caissier_nom
  numero_caisse:       string;
  superviseur:         string;
  montant_ouverture:   number;
  id_responsable_cash: string;
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