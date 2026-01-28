'use client';

import React, { useState, useMemo } from 'react';
import { Search, AlertTriangle, XCircle, TrendingDown, Clock, User, ChevronRight, FileWarning } from 'lucide-react';
import Link from 'next/link';
import { MemberFinancialData } from '@/types/analyses';

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

// Génération des données de membres échantillon
const generateSampleMembers = (): MemberFinancialData[] => {
  const membres: MemberFinancialData[] = [];
  const noms = ['Dubois', 'Tremblay', 'Martin', 'Roy', 'Gagnon', 'Côté', 'Lavoie', 'Bergeron', 'Bouchard', 'Morin'];
  const prenoms = ['Marie', 'Jean', 'Sophie', 'Pierre', 'Lucie', 'Marc', 'Annie', 'Luc', 'Isabelle', 'François'];

  for (let i = 0; i < 25; i++) {
    const hasLoan = Math.random() > 0.3;
    const isLate = hasLoan && Math.random() > 0.7;
    const scoreStabilite = Math.floor(Math.random() * 100);
    const ratioEndettement = parseFloat((Math.random() * 0.6).toFixed(2));
    const revenuMoyen = Math.floor(Math.random() * 40000) + 15000;
    const capacite = Math.floor(revenuMoyen * 0.3);
    const mensualite = hasLoan ? Math.floor(Math.random() * 5000) + 1000 : 0;

    membres.push({
      id: `MEM${1000 + i}`,
      nom: noms[Math.floor(Math.random() * noms.length)],
      prenom: prenoms[Math.floor(Math.random() * prenoms.length)],
      historique: [],
      revenuMensuelMoyen: revenuMoyen,
      depensesMensuellesMoyennes: Math.floor(revenuMoyen * 0.6),
      capaciteRemboursement: capacite,
      ratioEndettement: ratioEndettement,
      scoreStabilite: scoreStabilite,
      estSaisonnier: Math.random() > 0.7,
      dernierPret: hasLoan ? {
        montant: Math.floor(Math.random() * 50000) + 10000,
        statut: isLate ? 'en_retard' : Math.random() > 0.5 ? 'en_cours' : 'rembourse',
        mensualite: mensualite
      } : undefined,
      anciennete: Math.floor(Math.random() * 10) + 1,
      nombrePrets: Math.floor(Math.random() * 5),
      tauxRemboursement: parseFloat((Math.random() * 30 + 70).toFixed(1))
    });
  }

  return membres;
};

// Fonction pour générer les alertes basées sur les critères
const generateAlerts = (members: MemberFinancialData[]): Alert[] => {
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

export default function AlertesPage() {
  const members = useMemo(() => generateSampleMembers(), []);
  const allAlerts = useMemo(() => generateAlerts(members), [members]);

  const [periodFilter, setPeriodFilter] = useState<'jour' | 'semaine' | 'mois' | 'trimestre' | 'annee'>('mois');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrage des alertes
  const filteredAlerts = useMemo(() => {
    const now = new Date();
    const periods = {
      jour: 1,
      semaine: 7,
      mois: 30,
      trimestre: 90,
      annee: 365
    };
    const daysBack = periods[periodFilter];

    return allAlerts.filter(alert => {
      const daysDiff = (now.getTime() - alert.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const matchesPeriod = daysDiff <= daysBack;
      const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
      const matchesSearch = searchTerm === '' || 
        alert.member.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.member.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.member.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesPeriod && matchesStatus && matchesSeverity && matchesSearch;
    });
  }, [allAlerts, periodFilter, statusFilter, severityFilter, searchTerm]);

  // Configuration des types d'alerte
  const getAlertTypeConfig = (type: Alert['type']) => {
    switch (type) {
      case 'score_faible':
        return { icon: TrendingDown, label: 'Score faible', color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'endettement_eleve':
        return { icon: AlertTriangle, label: 'Endettement élevé', color: 'text-red-600', bg: 'bg-red-100' };
      case 'pret_retard':
        return { icon: Clock, label: 'Retard de paiement', color: 'text-amber-600', bg: 'bg-amber-100' };
      case 'capacite_insuffisante':
        return { icon: XCircle, label: 'Capacité insuffisante', color: 'text-rose-600', bg: 'bg-rose-100' };
    }
  };

  const getSeverityConfig = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critique':
        return { label: 'Critique', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300' };
      case 'alerte':
        return { label: 'Alerte', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300' };
      case 'attention':
        return { label: 'Attention', color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-300' };
    }
  };

  const getStatusConfig = (status: Alert['status']) => {
    switch (status) {
      case 'a_afficher':
        return { label: 'À afficher', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300' };
      case 'a_traiter':
        return { label: 'À traiter', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300' };
      case 'a_reflechir':
        return { label: 'À réfléchir', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300' };
      case 'a_decider':
        return { label: 'À décider', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300' };
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-HT', {
      style: 'currency',
      currency: 'HTG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <FileWarning className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alertes Membres</h1>
            <p className="text-gray-600">Suivi et gestion des membres nécessitant une attention particulière</p>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total alertes</p>
            <p className="text-2xl font-bold text-gray-900">{allAlerts.length}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-red-600 mb-1">Critiques</p>
            <p className="text-2xl font-bold text-red-700">{allAlerts.filter(a => a.severity === 'critique').length}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-orange-600 mb-1">Alertes</p>
            <p className="text-2xl font-bold text-orange-700">{allAlerts.filter(a => a.severity === 'alerte').length}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600 mb-1">En traitement</p>
            <p className="text-2xl font-bold text-blue-700">{allAlerts.filter(a => a.status !== 'a_afficher').length}</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
        {/* Filtre de période */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Période</label>
          <div className="flex gap-3">
            {(['jour', 'semaine', 'mois', 'trimestre', 'annee'] as const).map(period => (
              <button
                key={period}
                onClick={() => setPeriodFilter(period)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  periodFilter === period
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Recherche et filtres supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="all">Tous les statuts</option>
            <option value="a_afficher">À afficher</option>
            <option value="a_traiter">À traiter</option>
            <option value="a_reflechir">À réfléchir</option>
            <option value="a_decider">À décider</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="all">Toutes les criticités</option>
            <option value="critique">Critique</option>
            <option value="alerte">Alerte</option>
            <option value="attention">Attention</option>
          </select>
        </div>
      </div>

      {/* Tableau des alertes */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header du tableau */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
          <div className="grid grid-cols-12 gap-4 items-center text-xs font-semibold text-slate-600 uppercase tracking-wide">
            <div className="col-span-3">Membre</div>
            <div className="col-span-2">Type d'alerte</div>
            <div className="col-span-2">Criticité</div>
            <div className="col-span-2">Statut</div>
            <div className="col-span-2">Dernière mise à jour</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
        </div>

        {/* Corps du tableau */}
        <div className="divide-y divide-slate-100">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center">
              <FileWarning className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-700 text-lg font-semibold mb-2">Aucune alerte trouvée</p>
              <p className="text-gray-500 text-sm">Modifiez vos filtres pour voir plus de résultats</p>
            </div>
          ) : (
            filteredAlerts.map((alert, index) => {
              const typeConfig = getAlertTypeConfig(alert.type);
              const severityConfig = getSeverityConfig(alert.severity);
              const statusConfig = getStatusConfig(alert.status);
              const TypeIcon = typeConfig.icon;

              return (
                <div
                  key={alert.id}
                  className={`grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-indigo-50/50 transition-all ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                  }`}
                >
                  {/* Membre */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {alert.member.prenom[0]}{alert.member.nom[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {alert.member.prenom} {alert.member.nom}
                      </p>
                      <p className="text-xs text-gray-500">#{alert.member.id}</p>
                    </div>
                  </div>

                  {/* Type d'alerte */}
                  <div className="col-span-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${typeConfig.bg}`}>
                      <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
                      <span className={`text-xs font-semibold ${typeConfig.color}`}>{typeConfig.label}</span>
                    </div>
                  </div>

                  {/* Criticité */}
                  <div className="col-span-2">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${severityConfig.bg} ${severityConfig.color} border-2 ${severityConfig.border}`}>
                      {severityConfig.label}
                    </span>
                  </div>

                  {/* Statut */}
                  <div className="col-span-2">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                      {statusConfig.label}
                    </span>
                    {alert.updatedBy && (
                      <p className="text-xs text-gray-500 mt-1">par {alert.updatedBy}</p>
                    )}
                  </div>

                  {/* Dernière mise à jour */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-700">
                      {alert.updatedAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {alert.updatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-center">
                    <Link href={`/membres/alertes/${alert.id}`}>
                      <button className="w-9 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center transition-colors group">
                        <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer avec résumé */}
      <div className="mt-6 text-center text-sm text-gray-600">
        Affichage de <span className="font-semibold text-gray-900">{filteredAlerts.length}</span> alerte{filteredAlerts.length > 1 ? 's' : ''} sur <span className="font-semibold text-gray-900">{allAlerts.length}</span> au total
      </div>
    </div>
  );
}