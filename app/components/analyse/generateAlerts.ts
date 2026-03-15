import { MemberFinancialData } from '@/types/analyses';

// ─── Types ────────────────────────────────────────────────────────────────────
export type AlertSeverity = 'critique' | 'alerte' | 'attention';

export interface Alert {
  id:          string;
  memberId:    string;
  member:      MemberFinancialData;
  type:        'score_faible' | 'endettement_eleve' | 'pret_retard' | 'capacite_insuffisante';
  severity:    AlertSeverity;
  status:      'a_afficher' | 'a_traiter' | 'a_reflechir' | 'a_decider';
  title:       string;
  description: string;
  createdAt:   Date;
  updatedAt:   Date;
  updatedBy?:  string;
}

// ─── Génération des alertes ────────────────────────────────────────────────────
export function generateAlerts(members: MemberFinancialData[]): Alert[] {
  const alerts: Alert[] = [];
  const statuses: Alert['status'][] = ['a_afficher', 'a_traiter', 'a_reflechir', 'a_decider'];
  const responsables = ['Alma Tremblay', 'Jean Dubois', 'Marie Roy', 'Pierre Martin'];

  const randomStatus  = () => statuses[Math.floor(Math.random() * statuses.length)];
  const randomAuthor  = () => Math.random() > 0.5 ? responsables[Math.floor(Math.random() * responsables.length)] : undefined;
  const randomDate    = (daysBack: number) => new Date(Date.now() - Math.random() * daysBack * 86400000);

  members.forEach(member => {
    // Score faible
    if (member.scoreStabilite < 50) {
      alerts.push({
        id:          `alert-score-${member.id}`,
        memberId:    member.id,
        member,
        type:        'score_faible',
        severity:    member.scoreStabilite < 30 ? 'critique' : 'alerte',
        status:      randomStatus(),
        title:       'Score de stabilité critique',
        description: `Score à ${member.scoreStabilite}/100, nécessite une évaluation approfondie`,
        createdAt:   randomDate(30),
        updatedAt:   randomDate(5),
        updatedBy:   randomAuthor(),
      });
    }

    // Endettement élevé
    if (member.ratioEndettement > 0.45) {
      alerts.push({
        id:          `alert-dette-${member.id}`,
        memberId:    member.id,
        member,
        type:        'endettement_eleve',
        severity:    member.ratioEndettement > 0.55 ? 'critique' : 'alerte',
        status:      randomStatus(),
        title:       'Endettement excessif',
        description: `Ratio à ${(member.ratioEndettement * 100).toFixed(0)}%, dépasse le seuil de 45%`,
        createdAt:   randomDate(30),
        updatedAt:   randomDate(5),
        updatedBy:   randomAuthor(),
      });
    }

    // Prêt en retard
    if (member.dernierPret?.statut === 'en_retard') {
      alerts.push({
        id:          `alert-retard-${member.id}`,
        memberId:    member.id,
        member,
        type:        'pret_retard',
        severity:    'alerte',
        status:      randomStatus(),
        title:       'Prêt en retard',
        description: `Paiements en retard sur prêt de ${member.dernierPret.montant.toLocaleString('fr-HT')} HTG`,
        createdAt:   randomDate(30),
        updatedAt:   randomDate(5),
        updatedBy:   randomAuthor(),
      });
    }

    // Capacité insuffisante
    if (member.dernierPret && member.capaciteRemboursement < member.dernierPret.mensualite) {
      alerts.push({
        id:          `alert-capacite-${member.id}`,
        memberId:    member.id,
        member,
        type:        'capacite_insuffisante',
        severity:    'critique',
        status:      randomStatus(),
        title:       'Capacité de remboursement insuffisante',
        description: `Capacité (${member.capaciteRemboursement.toLocaleString('fr-HT')} HTG) < Mensualité (${member.dernierPret.mensualite.toLocaleString('fr-HT')} HTG)`,
        createdAt:   randomDate(30),
        updatedAt:   randomDate(5),
        updatedBy:   randomAuthor(),
      });
    }
  });

  return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}