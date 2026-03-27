export type CaisseStatus  = 'fermée' | 'ouverte';
export type AlertSeverity = 'error' | 'warning' | 'info';

export interface CaisseAlert {
  id:       string;
  severity: AlertSeverity;
  message:  string;
  time?:    string;
}

export interface CaisseTransaction {
  id:     number;
  type:   'deposit' | 'withdrawal' | 'transfer' | 'loan';
  amount: number;
  time?:  string;
  note?:  string;
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
  caissier_nom:        string;
  numero_caisse:       string;
  superviseur:         string;
  montant_ouverture:   number;
  id_responsable_cash: string;
}

export interface CloseSessionPayload {
  montant_fermeture: number;
}

export interface DashboardData {
  sessions:      CaisseSession[];
  transactions:  CaisseTransaction[];
  alerts:        CaisseAlert[];
  montant_caisse: number;
}