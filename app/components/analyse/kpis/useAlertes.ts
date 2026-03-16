// app/hooks/useAlertes.ts
// Hook de gestion du cycle de vie des alertes institutionnelles
// Résolution : automatique si KPI repassé sous le seuil, manuelle sinon
import { useState, useCallback, useEffect } from 'react';
import {
  AlerteInstitutionnelle,
  AlerteStatut,
  ActionHistorique,
} from '@/app/components/analyse/kpis/AlertePriseEnChargeModal';
import { KpiData } from '@/types/kpis';

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Vérifie si un KPI est revenu dans les normes — utilisé pour la résolution auto.
// En production cette fonction recevrait les données live de l'API.
function kpiEstResolu(alerte: AlerteInstitutionnelle, kpiActuel: KpiData): boolean {
  switch (alerte.id) {
    case 'a1': return kpiActuel.ratioEndettement      <= alerte.seuil;
    case 'a2': return kpiActuel.tauxRecouvrement      >= alerte.seuil;
    case 'a3': return kpiActuel.ratioCreancesDouteuses <= alerte.seuil;
    case 'a4': return kpiActuel.ratioLiquidite        >= alerte.seuil;
    case 'a5': return kpiActuel.reservesObligatoires  >= alerte.seuil;
    case 'a6': return kpiActuel.couvertureRisques      >= alerte.seuil;
    case 'a7': return kpiActuel.scoreStabiliteMoyen   >= alerte.seuil;
    case 'a8': return kpiActuel.tauxActiviteMembres   >= alerte.seuil;
    default:   return false;
  }
}

// Génère les alertes initiales à partir des KpiData
function genererAlertesInitiales(d: KpiData): AlerteInstitutionnelle[] {
  const now = new Date();

  const defs: Omit<AlerteInstitutionnelle, 'statut' | 'historique'>[] = [
    { id: 'a1', type: d.ratioEndettement > 40 ? 'critique' : 'alerte',       category: 'financier', title: "Ratio d'endettement élevé",           description: "Le ratio d'endettement dépasse le seuil recommandé.",               valeur: d.ratioEndettement,       seuil: 35,  unite: '%',  action: 'Réviser les politiques de crédit.',                             responsable: 'Direction Financière',  echeance: new Date(now.getTime() + 7  * 86400000) },
    { id: 'a2', type: d.tauxRecouvrement < 90 ? 'critique' : 'alerte',        category: 'financier', title: "Taux de recouvrement sous l'objectif",  description: "Le taux de remboursement est inférieur à l'objectif de 95%.",     valeur: d.tauxRecouvrement,       seuil: 95,  unite: '%',  action: 'Intensifier le suivi des remboursements.',                     responsable: 'Service Recouvrement',  echeance: new Date(now.getTime() + 3  * 86400000) },
    { id: 'a3', type: d.ratioCreancesDouteuses > 8 ? 'critique' : 'alerte',   category: 'financier', title: 'Créances douteuses en hausse',          description: 'Le ratio de créances à risque nécessite attention.',              valeur: d.ratioCreancesDouteuses, seuil: 5,   unite: '%',  action: 'Analyser les prêts à risque.',                                 responsable: 'Comité de Crédit',      echeance: new Date(now.getTime() + 5  * 86400000) },
    { id: 'a4', type: d.ratioLiquidite < 1.2 ? 'critique' : 'alerte',         category: 'liquidite', title: 'Ratio de liquidité faible',             description: 'Les réserves de liquidité sont sous le seuil prudentiel.',        valeur: d.ratioLiquidite,         seuil: 1.5, unite: '',   action: 'Augmenter les réserves liquides.',                             responsable: 'Trésorier',             echeance: new Date(now.getTime() + 2  * 86400000) },
    { id: 'a5', type: d.reservesObligatoires < 8 ? 'critique' : 'alerte',     category: 'liquidite', title: 'Réserves obligatoires insuffisantes',   description: 'Les réserves réglementaires sont sous le minimum requis.',        valeur: d.reservesObligatoires,   seuil: 10,  unite: '%',  action: 'Constituer les réserves conformément à la réglementation.',   responsable: 'Direction Générale',    echeance: new Date(now.getTime() + 14 * 86400000) },
    { id: 'a6', type: d.couvertureRisques < 80 ? 'critique' : 'alerte',       category: 'liquidite', title: 'Couverture des risques insuffisante',   description: 'Les provisions ne couvrent pas suffisamment les risques.',        valeur: d.couvertureRisques,      seuil: 90,  unite: '%',  action: 'Augmenter les provisions pour risques.',                       responsable: 'Comité des Risques',    echeance: new Date(now.getTime() + 10 * 86400000) },
    { id: 'a7', type: d.scoreStabiliteMoyen < 65 ? 'critique' : 'alerte',     category: 'membres',   title: 'Score de stabilité moyen faible',       description: 'La qualité moyenne du portefeuille membres nécessite amélioration.', valeur: d.scoreStabiliteMoyen, seuil: 75,  unite: '/100',action: "Renforcer les critères d'admission.",                         responsable: 'Service Membres',       echeance: new Date(now.getTime() + 30 * 86400000) },
    { id: 'a8', type: d.tauxActiviteMembres < 75 ? 'critique' : 'alerte',     category: 'membres',   title: "Taux d'activité des membres faible",    description: 'Trop de membres sont inactifs.',                                  valeur: d.tauxActiviteMembres,    seuil: 85,  unite: '%',  action: 'Campagne de réactivation des membres inactifs.',               responsable: 'Service Communication', echeance: new Date(now.getTime() + 21 * 86400000) },
  ];

  // Ne retourner que les alertes actives (valeur hors seuil)
  return defs
    .filter(def => {
      if (['a2', 'a4', 'a5', 'a6', 'a7', 'a8'].includes(def.id)) return def.valeur < def.seuil;
      return def.valeur > def.seuil;
    })
    .map(def => ({ ...def, statut: 'nouvelle' as AlerteStatut, historique: [] }));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAlertes(kpiData: KpiData) {
  const [alertes, setAlertes] = useState<AlerteInstitutionnelle[]>(() =>
    genererAlertesInitiales(kpiData)
  );
  const [alerteSelectionnee, setAlerteSelectionnee] = useState<AlerteInstitutionnelle | null>(null);

  // ── Résolution automatique ────────────────────────────────────────────────
  // Surveille les changements de KPI et résout/rouvre les alertes automatiquement.
  // En production : ce useEffect serait remplacé par un webhook ou polling API.
  useEffect(() => {
    setAlertes(prev => prev.map(alerte => {
      const estResolu = kpiEstResolu(alerte, kpiData);
      const estDejaResolu = alerte.statut.startsWith('resolue');

      // KPI revenu à la normale → résolution automatique
      if (estResolu && !estDejaResolu) {
        const action: ActionHistorique = {
          id:            `auto-${Date.now()}-${alerte.id}`,
          date:          new Date(),
          auteur:        'Système',
          role:          'Automatique',
          type:          'resolution',
          note:          `Résolution automatique — le KPI est revenu sous le seuil cible (${alerte.valeur.toFixed(1)}${alerte.unite} → objectif ${alerte.seuil}${alerte.unite}).`,
          ancienStatut:  alerte.statut,
          nouveauStatut: 'resolue_auto',
        };
        return { ...alerte, statut: 'resolue_auto' as AlerteStatut, historique: [...alerte.historique, action] };
      }

      // KPI dégradé à nouveau sur une alerte résolue → réouverture
      if (!estResolu && estDejaResolu) {
        const action: ActionHistorique = {
          id:            `reopen-${Date.now()}-${alerte.id}`,
          date:          new Date(),
          auteur:        'Système',
          role:          'Automatique',
          type:          'reouverture',
          note:          `Réouverture automatique — le KPI a redégradé (valeur actuelle : ${alerte.valeur.toFixed(1)}${alerte.unite}).`,
          ancienStatut:  alerte.statut,
          nouveauStatut: 'rouverte',
        };
        return { ...alerte, statut: 'rouverte' as AlerteStatut, historique: [...alerte.historique, action] };
      }

      return alerte;
    }));
  }, [kpiData]);

  // ── Mise à jour manuelle ─────────────────────────────────────────────────
  const mettreAJour = useCallback((alerteId: string, newStatut: AlerteStatut, action: ActionHistorique) => {
    setAlertes(prev => prev.map(a =>
      a.id !== alerteId ? a : {
        ...a,
        statut:     newStatut,
        assigneA:   action.type === 'prise_en_charge' ? action.auteur   : a.assigneA,
        assigneRole:action.type === 'prise_en_charge' ? action.role     : a.assigneRole,
        historique: [...a.historique, action],
      }
    ));
    // Mettre à jour l'alerte sélectionnée si c'est elle
    setAlerteSelectionnee(prev =>
      prev?.id === alerteId
        ? { ...prev, statut: newStatut, historique: [...prev.historique, action] }
        : prev
    );
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total:       alertes.length,
    critiques:   alertes.filter(a => a.type === 'critique' && !a.statut.startsWith('resolue')).length,
    alertes:     alertes.filter(a => a.type === 'alerte'   && !a.statut.startsWith('resolue')).length,
    enTraitement:alertes.filter(a => a.statut === 'en_traitement' || a.statut === 'escaladee').length,
    resolues:    alertes.filter(a => a.statut.startsWith('resolue')).length,
  };

  return {
    alertes,
    alerteSelectionnee,
    setAlerteSelectionnee,
    mettreAJour,
    stats,
  };
}