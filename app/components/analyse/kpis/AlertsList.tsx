'use client';

import React, { useState, useMemo } from 'react';
import { Search, AlertTriangle, XCircle, TrendingDown, Clock, User, ChevronRight, FileWarning, DollarSign, Bell, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { MemberFinancialData } from '@/types/analyses';
import { generateAlerts } from '../generateAlerts';

type AlertType = "total" | "critique" | "alerte" | "traitement";

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
interface AlertCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number;
  color: string;
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



export default function AlertesPage() {
  const members = useMemo(() => generateSampleMembers(), []);
  const allAlerts = useMemo(() => generateAlerts(members), [members]);

  const [periodFilter, setPeriodFilter] = useState<'jour' | 'semaine' | 'mois' | 'trimestre' | 'annee'>('mois');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrage des alertes par période uniquement (pour les stats)
  const alertsByPeriod = useMemo(() => {
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
      return daysDiff <= daysBack;
    });
  }, [allAlerts, periodFilter]);

  // Calcul des statistiques basées sur la période
  const stats = useMemo(() => {
    const critiques = alertsByPeriod.filter(a => a.severity === 'critique');
    const alertes = alertsByPeriod.filter(a => a.severity === 'alerte');
    const enTraitement = alertsByPeriod.filter(a => a.status === 'a_traiter');
    const nouvelles = alertsByPeriod.filter(a => {
      const daysDiff = (new Date().getTime() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7; // Nouvelles = derniers 7 jours
    });

    // Calcul des tendances (comparaison avec période précédente)
    const getPreviousPeriodAlerts = () => {
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
        return daysDiff > daysBack && daysDiff <= daysBack * 2;
      });
    };

    const previousAlerts = getPreviousPeriodAlerts();
    const previousCritiques = previousAlerts.filter(a => a.severity === 'critique').length;
    const previousAlertes = previousAlerts.filter(a => a.severity === 'alerte').length;

    const critiqueTrend = previousCritiques > 0 
      ? Math.round(((critiques.length - previousCritiques) / previousCritiques) * 100)
      : 0;
    const alerteTrend = previousAlertes > 0
      ? Math.round(((alertes.length - previousAlertes) / previousAlertes) * 100)
      : 0;

    // Performance globale (basée sur le nombre d'alertes résolues vs créées)
    const resolues = enTraitement.filter(a => a.status === 'a_decider').length;
    const performanceScore = alertsByPeriod.length > 0
      ? Math.round((1 - (critiques.length / alertsByPeriod.length)) * 100)
      : 100;
    const previousPerformance = previousAlerts.length > 0
      ? Math.round((1 - (previousCritiques / previousAlerts.length)) * 100)
      : 100;
    const performanceTrend = performanceScore - previousPerformance;

    return {
      critiques: critiques.length,
      critiquesEnCours: critiques.filter(a => a.status === 'a_traiter').length,
      critiqueTrend,
      alertes: alertes.length,
      nouvellesAlertes: nouvelles.length,
      alerteTrend,
      enTraitement: enTraitement.length,
      resolues,
      performanceScore,
      performanceTrend
    };
  }, [alertsByPeriod, allAlerts, periodFilter]);

  // Filtrage des alertes avec tous les filtres (pour le tableau)
  const filteredAlerts = useMemo(() => {
    return alertsByPeriod.filter(alert => {
      const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
      const matchesSearch = searchTerm === '' || 
        alert.member.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.member.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.member.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSeverity && matchesSearch;
    });
  }, [alertsByPeriod, statusFilter, severityFilter, searchTerm]);

  // Groupement des alertes par date (comme le tableau des prêts)
  const groupedAlerts = useMemo(() => {
    const sorted = [...filteredAlerts].sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );

    return sorted.reduce((acc, alert) => {
      const date = alert.createdAt;
      const key = date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!acc[key]) acc[key] = [];
      acc[key].push(alert);
      return acc;
    }, {} as Record<string, Alert[]>);
  }, [filteredAlerts]);

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


const AlertCard = ({ icon: Icon, label, value, subValue, trend, color }: AlertCardProps) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend !== undefined && (
        <span className={`text-sm font-semibold ${trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-gray-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-sm text-gray-600">{label}</p>
    {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
  </div>
);



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-8">
      {/* Header */}
      <div className="mb-8">
        
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
        
        {/* Stats rapides - MAINTENANT DYNAMIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
           <AlertCard
            icon={AlertTriangle}
            label="Critiques"
            value={stats.critiques}
            subValue={`${stats.critiquesEnCours} en cours`}
            trend={stats.critiqueTrend}
            color="bg-red-600"
          />

          <AlertCard
            icon={Bell}
            label="Alertes"
            value={stats.alertes}
            subValue={`${stats.nouvellesAlertes} nouvelles`}
            trend={stats.alerteTrend}
            color="bg-orange-500"
          />

          <AlertCard
            icon={Clock}
            label="En traitement"
            value={stats.enTraitement}
            subValue={`${stats.resolues} résolues`}
            color="bg-blue-600"
          />
          
          <AlertCard
            icon={TrendingUp}
            label="Performance globale"
            value={`${stats.performanceScore} / 100`}
            subValue={stats.performanceScore >= 75 ? "Bon niveau" : stats.performanceScore >= 50 ? "Moyen" : "À améliorer"}
            trend={stats.performanceTrend}
            color="bg-purple-600"
          />
         </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
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
          {Object.keys(groupedAlerts).length === 0 ? (
            <div className="p-12 text-center">
              <FileWarning className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-700 text-lg font-semibold mb-2">Aucune alerte trouvée</p>
              <p className="text-gray-500 text-sm">Modifiez vos filtres pour voir plus de résultats</p>
            </div>
          ) : (
            Object.entries(groupedAlerts).map(([date, alerts]) => (
              <div key={date}>
                {/* Séparateur de date */}
                <div className="bg-slate-50 px-6 py-2 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{date}</p>
                </div>

                {/* Lignes d'alertes */}
                {alerts.map((alert, index) => {
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
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer avec résumé */}
      <div className="mt-6 text-center text-sm text-gray-600">
        Affichage de <span className="font-semibold text-gray-900">{filteredAlerts.length}</span> alerte{filteredAlerts.length > 1 ? 's' : ''} sur <span className="font-semibold text-gray-900">{alertsByPeriod.length}</span> pour cette période
      </div>
    </div>
  );
}

