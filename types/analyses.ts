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

export function computeMemberStatus(member: MemberFinancialData) {
  const pret = member.dernierPret;

  if (!pret) return 'rembourse';

  if (pret.statut === 'en_retard') return 'en_retard';
  if (pret.statut === 'en_cours') return 'en_cours';

  // Si remboursé mais risque élevé
  if (pret.statut === 'rembourse' && member.ratioEndettement > 0.45) {
    return 'en_cours';
  }

  return 'rembourse';
}
