// app/components/analyse/kpis/KpiAlertsSection.tsx
// Alertes INSTITUTIONNELLES (niveau macro) — distinct des alertes membres individuels
'use client';

import React, { useState } from 'react';
import {
  AlertTriangle, XCircle, CheckCircle2, Bell,
  ChevronRight, Clock, User, FileText,
} from 'lucide-react';
import { KpiData } from '@/types/kpis';
import AlertePriseEnChargeModal, {
  AlerteInstitutionnelle, AlerteStatut, ActionHistorique,
} from './AlertePriseEnChargeModal';
import { useAlertes } from './useAlertes';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatusCounts { bon: number; alerte: number; critique: number; total: number; }
interface Props { data: KpiData; statusCounts: StatusCounts; }

type AlertCategory = 'financier' | 'liquidite' | 'membres';

// ─── Config ───────────────────────────────────────────────────────────────────
const C = { green: '#2E7D32', greenDark: '#1B5E20', greenPale: '#DDEAD5', blue: '#355C7D', gold: '#D4AF37' };

const CATEGORY_CFG: Record<AlertCategory, { label: string; bg: string; text: string }> = {
  financier: { label: 'Financier', bg: '#EBF2F8',   text: C.blue      },
  liquidite: { label: 'Liquidité', bg: C.greenPale, text: C.greenDark },
  membres:   { label: 'Membres',   bg: '#FEF9EC',   text: '#B45309'   },
};

// ─── Section ─────────────────────────────────────────────────────────────────
export default function KpiAlertsSection({ data, statusCounts }: Props) {
  const [filter, setFilter] = useState<'all' | 'critique' | 'alerte'>('all');

  const { alertes, alerteSelectionnee, setAlerteSelectionnee, mettreAJour, stats } = useAlertes(data);

  const visible = filter === 'all'
    ? alertes
    : alertes.filter((a: AlerteInstitutionnelle) => a.type === filter);

  // Utilisateur connecté — en prod, vient du contexte d'auth
  const currentUser = { nom: 'Marie Dupont', role: 'Agent de crédit' };

  const alertesActives = alertes.filter((a: AlerteInstitutionnelle) => !a.statut.startsWith('resolue'));

  return (
    <>
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#EF4444] to-[#B91C1C] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Alertes institutionnelles</p>
              <p className="text-xs text-gray-500">KPIs nécessitant une action corrective — niveau caisse</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {stats.enTraitement > 0 && (
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#EBF2F8] text-[#355C7D]">
                {stats.enTraitement} en traitement
              </span>
            )}
            {alertesActives.length > 0 && (
              <span className="px-3 py-1.5 rounded-xl text-sm font-bold bg-[#FEF2F2] text-[#B91C1C]">
                {alertesActives.length} active{alertesActives.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-5">
          {([
            { key: 'all',      label: `Toutes (${alertes.length})` },
            { key: 'critique', label: `Critiques (${alertes.filter((a: AlerteInstitutionnelle) => a.type === 'critique').length})` },
            { key: 'alerte',   label: `Alertes (${alertes.filter((a: AlerteInstitutionnelle) => a.type === 'alerte').length})` },
          ] as const).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f.key
                  ? f.key === 'critique'
                    ? 'bg-[#EF4444] text-white'
                    : f.key === 'alerte'
                    ? 'bg-[#D4AF37] text-white'
                    : 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white'
                  : 'bg-[#F9F9F6] border border-gray-200 text-gray-600 hover:bg-[#DDEAD5]/40'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-[#2E7D32]" />
            </div>
            <p className="text-sm font-bold text-gray-700">Aucune alerte active</p>
            <p className="text-xs text-gray-400">Tous les KPIs institutionnels sont dans les normes.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {visible.map((alerte: AlerteInstitutionnelle) => {
              const catCfg   = CATEGORY_CFG[alerte.category as AlertCategory];
              const isCrit   = alerte.type === 'critique';
              const estResolu = alerte.statut.startsWith('resolue');

              return (
                <div key={alerte.id}
                  className={`rounded-2xl border-2 p-5 transition-all hover:shadow-md ${
                    estResolu ? 'bg-[#DDEAD5]/20 border-[#DDEAD5] opacity-70'
                    : isCrit   ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                    : 'bg-[#FEF9EC] border-[#FDE68A]'
                  }`}>

                  {/* Top row */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      estResolu ? 'bg-[#DDEAD5]' : isCrit ? 'bg-[#EF4444]' : 'bg-[#D4AF37]'
                    }`}>
                      {estResolu
                        ? <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                        : isCrit
                        ? <XCircle className="w-5 h-5 text-white" />
                        : <AlertTriangle className="w-5 h-5 text-white" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-bold text-gray-800">{alerte.title}</p>
                        <span className="px-2 py-0.5 rounded-lg text-xs font-semibold"
                          style={{ backgroundColor: catCfg.bg, color: catCfg.text }}>
                          {catCfg.label}
                        </span>
                        {alerte.statut === 'en_traitement' && (
                          <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-[#EBF2F8] text-[#355C7D]">
                            En traitement · {alerte.assigneA}
                          </span>
                        )}
                        {alerte.statut === 'escaladee' && (
                          <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-[#FEF2F2] text-[#B91C1C]">
                            Escaladée
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{alerte.description}</p>
                    </div>
                  </div>

                  {/* Valeur vs seuil */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="px-3 py-2 bg-white rounded-xl border border-gray-200 text-center">
                      <p className="text-xs text-gray-500">Valeur actuelle</p>
                      <p className={`text-base font-bold ${isCrit ? 'text-[#B91C1C]' : 'text-[#B45309]'}`}>
                        {alerte.valeur.toFixed(1)}{alerte.unite}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="px-3 py-2 bg-white rounded-xl border border-gray-200 text-center">
                      <p className="text-xs text-gray-500">Seuil cible</p>
                      <p className="text-base font-bold text-[#2E7D32]">{alerte.seuil.toFixed(1)}{alerte.unite}</p>
                    </div>
                  </div>

                  {/* Action recommandée */}
                  <div className="flex items-start gap-2 p-3 bg-white rounded-xl border border-gray-200 mb-4">
                    <FileText className="w-4 h-4 text-[#355C7D] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-0.5">Action recommandée</p>
                      <p className="text-xs text-gray-600">{alerte.action}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200/60">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{alerte.responsable}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {alerte.echeance.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                      {alerte.historique.length > 0 && (
                        <span className="text-[#355C7D]">
                          {alerte.historique.length} action{alerte.historique.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {!estResolu ? (
                      <button onClick={() => setAlerteSelectionnee(alerte)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-xs font-semibold hover:shadow-md transition-all">
                        Prendre en charge <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#1B5E20]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {alerte.statut === 'resolue_auto' ? 'Résolue automatiquement' : 'Résolue manuellement'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal prise en charge */}
      <AlertePriseEnChargeModal
        alerte={alerteSelectionnee}
        onClose={() => setAlerteSelectionnee(null)}
        onUpdate={mettreAJour}
        currentUser={currentUser}
      />
    </>
  );
}