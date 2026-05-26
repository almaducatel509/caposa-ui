'use client';
import React, { useState, useMemo } from 'react';
import {
  FaLock,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaUniversity,
} from 'react-icons/fa';
import { BiImport } from 'react-icons/bi';

import PageHeader from '../header';
import CashHandoverModal from './CashHandoverModal';
import CashOpeningModal from './Encaisse/CashOpeningModal';

import {
  TreasuryDashboard,
  CurrencyCode,
  TreasuryAlert,
  AlertType,
  CurrencyPosition,
} from '@/types/tresorerie';

// ─── Mock dashboard fixe ─────────────────────────────────────────────────────
const dashboard: TreasuryDashboard = {
  branch_id: 'br-pap',
  branch_name: 'Agence Port-au-Prince',

  cash_balance: {
    cash_physical: 487_500,
    bank_accounts: 3_240_000,
    total_consolidated: 3_727_500,
    reference_currency: 'HTG',
  },

  daily_flow: {
    date: '2026-05-26',
    total_deposits: 142_300,
    total_withdrawals: 87_650,
    total_transfers: 35_000,
    net_variation: 54_650,
  },

  liquidity_forecast: {
    available_today: 487_500,
    required_tomorrow: 620_000,
    gap: -132_500,
  },

  alerts: [
    {
      id: 'ALR-001',
      type: 'RECONCILIATION_DELAY',
      severity: 'critical',
      message: '2 sessions fermées non réconciliées depuis plus de 24h',
      related_entity: 'Sessions #SES-0041, #SES-0043',
      related_entity_id: null,
      branch_id: 'br-pap',
      created_at: '2026-05-26T08:15:00',
      action_url: '/dashboard/treasury/reconciliation',
    },
    {
      id: 'ALR-002',
      type: 'LOW_CASH',
      severity: 'warning',
      message: 'Caisse C-02 sous le seuil minimum',
      related_entity: 'Caisse C-02',
      related_entity_id: 'cashbox-002',
      branch_id: 'br-pap',
      created_at: '2026-05-26T10:42:00',
      action_url: '/dashboard/caisses/cashbox-002',
    },
  ],

  sessions_overview: {
    open_sessions: 4,
    unreconciled_sessions: 2,
    anomaly_sessions: 1,
  },

  currency_positions: [
    {
      currency_code: 'HTG',
      available_amount: 3_727_500,
      internal_rate: 1,
      rate_date: '2026-05-26',
    },
    {
      currency_code: 'USD',
      available_amount: 4_250,
      internal_rate: 132.5,
      rate_date: '2026-05-26',
    },
  ],

  generated_at: '2026-05-26T11:05:00',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatCurrency = (
  value: number,
  currency: CurrencyCode = 'HTG'
) => {
  const locale = currency === 'HTG' ? 'fr-HT' : 'fr-CA';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'HTG' ? 0 : 2,
    maximumFractionDigits: currency === 'HTG' ? 0 : 2,
  }).format(value);
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-CA', {
    hour: '2-digit',
    minute: '2-digit',
  });

const alertStyle = (severity: TreasuryAlert['severity']) => {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        sub: 'text-red-700',
        dot: 'bg-red-500',
      };

    case 'warning':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-900',
        sub: 'text-orange-700',
        dot: 'bg-orange-500',
      };

    default:
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        sub: 'text-blue-700',
        dot: 'bg-blue-500',
      };
  }
};

const alertLabel = (type: AlertType): string => {
  const labels: Record<AlertType, string> = {
    LOW_CASH: 'Caisse basse',
    RECONCILIATION_DELAY: 'Réconciliation',
    ANOMALY: 'Anomalie',
    PENDING_VALIDATION: 'Validation',
    UNCLOSED_SESSION: 'Session ouverte',
  };

  return labels[type];
};

// ─── Composant principal ────────────────────────────────────────────────────
const TreasuryOverview: React.FC = () => {
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [showOpeningModal, setShowOpeningModal] = useState(false);

  const criticalCount = useMemo(
    () =>
      dashboard.alerts.filter((a) => a.severity === 'critical').length,
    []
  );

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-start gap-4 flex-wrap">
          <PageHeader
            title="Trésorerie"
            subtitle={`${dashboard.branch_name} · Mis à jour à ${formatTime(
              dashboard.generated_at
            )}`}
          />

          {criticalCount > 0 && (
            <span className="mt-1 flex items-center gap-1.5 px-3 py-1 bg-red-100 border border-red-200 rounded-full text-xs font-semibold text-red-700">
              <FaExclamationTriangle className="w-3 h-3" />
              {criticalCount} alerte
              {criticalCount > 1 ? 's' : ''} critique
              {criticalCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowHandoverModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <BiImport className="w-4 h-4" />
            Remise de Caisse
          </button>
        </div>
      </div>

      {/* Bandeau solde consolidé */}
      <div className="bg-linear-to-br from-[#2E7D32] to-[#1B5E20] rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x md:divide-white/15">
          <div className="md:pr-6">
            <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-2">
              Solde Total Consolidé
            </p>

            <p className="text-4xl font-bold text-white">
              {formatCurrency(
                dashboard.cash_balance.total_consolidated,
                dashboard.cash_balance.reference_currency
              )}
            </p>

            <p className="text-white/60 text-xs mt-2">
              Caisses physiques + comptes bancaires
            </p>
          </div>

          <div className="md:px-6">
            <div className="flex items-center gap-2 mb-2">
              <FaLock className="w-3 h-3 text-white/70" />

              <p className="text-white/70 text-xs font-medium uppercase tracking-widest">
                Encaisse Physique
              </p>
            </div>

            <p className="text-2xl font-semibold text-white">
              {formatCurrency(
                dashboard.cash_balance.cash_physical,
                dashboard.cash_balance.reference_currency
              )}
            </p>
          </div>

          <div className="md:pl-6">
            <div className="flex items-center gap-2 mb-2">
              <FaUniversity className="w-3 h-3 text-white/70" />

              <p className="text-white/70 text-xs font-medium uppercase tracking-widest">
                Comptes Bancaires
              </p>
            </div>

            <p className="text-2xl font-semibold text-white">
              {formatCurrency(
                dashboard.cash_balance.bank_accounts,
                dashboard.cash_balance.reference_currency
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Santé financière */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
          Santé financière
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FaArrowDown className="w-3.5 h-3.5 text-[#2E7D32]" />

              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                Dépôts
              </p>
            </div>

            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(
                dashboard.daily_flow.total_deposits,
                dashboard.cash_balance.reference_currency
              )}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FaArrowUp className="w-3.5 h-3.5 text-red-500" />

              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                Retraits
              </p>
            </div>

            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(
                dashboard.daily_flow.total_withdrawals,
                dashboard.cash_balance.reference_currency
              )}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FaShieldAlt className="w-3.5 h-3.5 text-[#355C7D]" />

              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                Transferts
              </p>
            </div>

            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(
                dashboard.daily_flow.total_transfers,
                dashboard.cash_balance.reference_currency
              )}
            </p>
          </div>

          <div className="rounded-2xl p-5 border shadow-sm bg-[#DDEAD5] border-[#2E7D32]/20">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">
              Variation nette
            </p>

            <p className="text-xl font-bold text-[#1B5E20]">
              +
              {formatCurrency(
                dashboard.daily_flow.net_variation,
                dashboard.cash_balance.reference_currency
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Alertes */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Alertes
          </h3>
        </div>

        <div className="space-y-3">
          {dashboard.alerts.map((alert) => {
            const s = alertStyle(alert.severity);

            return (
              <div
                key={alert.id}
                className={`p-4 ${s.bg} ${s.border} border rounded-xl`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${s.dot} mt-1.5 shrink-0`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${s.sub}`}
                      >
                        {alertLabel(alert.type)}
                      </span>

                      <span className={`text-xs ${s.sub}`}>
                        · {formatTime(alert.created_at)}
                      </span>
                    </div>

                    <p className={`text-sm font-semibold ${s.text}`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modals */}
      <CashHandoverModal
        isOpen={showHandoverModal}
        onClose={() => setShowHandoverModal(false)}
      />

      <CashOpeningModal
        isOpen={showOpeningModal}
        onClose={() => setShowOpeningModal(false)}
      />
    </div>
  );
};

export default TreasuryOverview;