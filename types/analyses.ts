// analyses.ts
export interface FinancialHistoryEntry {
  mois: string;
  revenu: number;
  depenses: number;
  isSaisonnier?: boolean;
}

export interface MemberFinancialData {
  id: string;
  nom: string;
  prenom: string;
  photo?: string;

  historique: FinancialHistoryEntry[];

  revenuMensuelMoyen: number;
  depensesMensuellesMoyennes: number;
  capaciteRemboursement: number;
  ratioEndettement: number;
  scoreStabilite: number;

  estSaisonnier: boolean;
  dernierPret?: {  // ⬅️ AJOUTER ? ICI pour rendre optionnel
    montant: number;
    statut: 'rembourse' | 'en_cours' | 'en_retard';
    mensualite: number;
  };

  anciennete: number;
  nombrePrets: number;
  tauxRemboursement: number;
}