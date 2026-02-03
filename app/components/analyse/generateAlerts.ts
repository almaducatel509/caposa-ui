import { MemberFinancialData } from '@/types/analyses';

export type AlertSeverity = 'critique' | 'alerte' | 'attention';

// export interface Alert {
//   id: string;
//   memberId: string;
//   member: MemberFinancialData;
//   type: 'score_faible' | 'endettement_eleve' | 'pret_retard' | 'capacite_insuffisante';
//   severity: AlertSeverity;
//   status: 'a_afficher' | 'a_traiter' | 'a_reflechir' | 'a_decider';
//   title: string;
//   description: string;
//   createdAt: Date;
//   updatedAt: Date;
//   updatedBy?: string;
// }


// Types pour les alertes
interface Alert {
  id: string;
  memberId: string;
  member: MemberFinancialData;
  type: 'score_faible' | 'endettement_eleve' | 'pret_retard' | 'capacite_insuffisante';
  severity: 'critique' | 'alerte' | 'attention';
  status: 'a_afficher' | 'a_traiter' | 'a_reflechir' | 'a_decider';
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}
// ⬇️ COPIÉ-COLLÉ DE TON CODE (inchangé)
// Fonction pour générer les alertes basées sur les critères
export function generateAlerts(members: MemberFinancialData[]): Alert[] {
  const alerts: Alert[] = [];
  const statuses: Array<'a_afficher' | 'a_traiter' | 'a_reflechir' | 'a_decider'> = ['a_afficher', 'a_traiter', 'a_reflechir', 'a_decider'];
  const responsables = ['Alma Tremblay', 'Jean Dubois', 'Marie Roy', 'Pierre Martin'];

  members.forEach((member, index) => {
    // Score de stabilité faible
    if (member.scoreStabilite < 50) {
      alerts.push({
        id: `alert-score-${member.id}`,
        memberId: member.id,
        member: member,
        type: 'score_faible',
        severity: member.scoreStabilite < 30 ? 'critique' : 'alerte',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        title: 'Score de stabilité critique',
        description: `Score à ${member.scoreStabilite}/100, nécessite une évaluation approfondie`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
        updatedBy: Math.random() > 0.5 ? responsables[Math.floor(Math.random() * responsables.length)] : undefined
      });
    }

    // Ratio d'endettement élevé
    if (member.ratioEndettement > 0.45) {
      alerts.push({
        id: `alert-dette-${member.id}`,
        memberId: member.id,
        member: member,
        type: 'endettement_eleve',
        severity: member.ratioEndettement > 0.55 ? 'critique' : 'alerte',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        title: 'Endettement excessif',
        description: `Ratio à ${(member.ratioEndettement * 100).toFixed(0)}%, dépasse largement le seuil de 45%`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
        updatedBy: Math.random() > 0.5 ? responsables[Math.floor(Math.random() * responsables.length)] : undefined
      });
    }

    // Prêt en retard
    if (member.dernierPret && member.dernierPret.statut === 'en_retard') {
      alerts.push({
        id: `alert-retard-${member.id}`,
        memberId: member.id,
        member: member,
        type: 'pret_retard',
        severity: 'alerte',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        title: 'Prêt en retard',
        description: `Paiements en retard sur prêt de ${member.dernierPret.montant.toLocaleString('fr-HT')} HTG`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
        updatedBy: Math.random() > 0.5 ? responsables[Math.floor(Math.random() * responsables.length)] : undefined
      });
    }

    // Capacité insuffisante
    if (member.dernierPret && member.capaciteRemboursement < member.dernierPret.mensualite) {
      alerts.push({
        id: `alert-capacite-${member.id}`,
        memberId: member.id,
        member: member,
        type: 'capacite_insuffisante',
        severity: 'critique',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        title: 'Capacité de remboursement insuffisante',
        description: `Capacité (${member.capaciteRemboursement.toLocaleString('fr-HT')} HTG) < Mensualité (${member.dernierPret.mensualite.toLocaleString('fr-HT')} HTG)`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
        updatedBy: Math.random() > 0.5 ? responsables[Math.floor(Math.random() * responsables.length)] : undefined
      });
    }
  });

  return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};
