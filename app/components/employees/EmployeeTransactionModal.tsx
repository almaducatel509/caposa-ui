"use client";

import React, { useState } from 'react';
import { Modal } from "@/app/components/ui/Modal";
import {
  X, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Download, History, Banknote, Clock, UserCheck,
} from "lucide-react";
import UserAvatar from '@/app/components/core/UserAvatar';

// ─── Types ───────────────────────────────────────────────────────────────────

type TxType   = 'payment' | 'bonus' | 'deduction' | 'reimbursement';
type TxStatus = 'completed' | 'pending' | 'cancelled';

interface Transaction {
  id: string; type: TxType; amount: number; currency: string;
  description: string; date: string; status: TxStatus; createdBy: string;
}

interface ActivityLog {
  id: string; action: string; field?: string;
  oldValue?: string; newValue?: string;
  date: string; modifiedBy: string;
}

interface EmployeeTransactionModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  employee: {
    id: string; first_name: string; last_name: string;
    photo_profil: string | null; payment_ref: string;
  } | null;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_TX = (): Transaction[] => [
  { id:'1', type:'payment',       amount:2500,  currency:'USD', description:'Salaire mensuel — Janvier 2025',    date:'2025-01-15T14:30:00', status:'completed', createdBy:'Système RH'             },
  { id:'2', type:'bonus',         amount:500,   currency:'USD', description:'Prime de performance Q4 2024',      date:'2025-01-10T10:00:00', status:'completed', createdBy:'Marie Martin (Manager)' },
  { id:'3', type:'reimbursement', amount:150,   currency:'USD', description:'Remboursement frais de transport',  date:'2025-01-08T16:45:00', status:'completed', createdBy:'Comptabilité'           },
  { id:'4', type:'deduction',     amount:-50,   currency:'USD', description:'Cotisation assurance santé',        date:'2025-01-05T09:00:00', status:'completed', createdBy:'Système RH'             },
  { id:'5', type:'payment',       amount:2500,  currency:'USD', description:'Salaire mensuel — Décembre 2024',   date:'2024-12-15T14:30:00', status:'completed', createdBy:'Système RH'             },
];

const MOCK_LOGS = (): ActivityLog[] => [
  { id:'1', action:'update', field:'phone_number', oldValue:'+1234567890', newValue:'+0987654321', date:'2025-01-12T11:20:00', modifiedBy:'Jean Dupont (Admin)'   },
  { id:'2', action:'update', field:'address',      oldValue:'123 Rue Principale', newValue:'456 Avenue Centrale', date:'2025-01-10T15:30:00', modifiedBy:'Marie Martin (RH)'    },
  { id:'3', action:'update', field:'posts',        oldValue:'Developer',   newValue:'Senior Developer', date:'2025-01-05T09:15:00', modifiedBy:'Pierre Durand (Manager)'},
  { id:'4', action:'create',                                                                             date:'2024-06-15T10:00:00', modifiedBy:'Admin Système'             },
];

// ─── Config types de transaction ─────────────────────────────────────────────

const TX_CFG: Record<TxType, { bg: string; iconColor: string; badge: string; label: string }> = {
  payment:       { bg: 'bg-[#DDEAD5]', iconColor: 'text-[#2E7D32]', badge: 'bg-[#DDEAD5] text-[#1B5E20]',  label: 'Paiement'        },
  bonus:         { bg: 'bg-blue-50',   iconColor: 'text-[#355C7D]', badge: 'bg-blue-50 text-[#355C7D]',     label: 'Bonus'           },
  deduction:     { bg: 'bg-red-50',    iconColor: 'text-red-600',   badge: 'bg-red-50 text-red-700',         label: 'Déduction'       },
  reimbursement: { bg: 'bg-yellow-50', iconColor: 'text-yellow-700',badge: 'bg-yellow-50 text-yellow-700',  label: 'Remboursement'   },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtUSD(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const EmployeeTransactionModal: React.FC<EmployeeTransactionModalProps> = ({
  isOpen, onClose, employee,
}) => {
  const [tab, setTab] = useState<'transactions' | 'activity'>('transactions');

  if (!employee) return null;

  const transactions = MOCK_TX();
  const logs         = MOCK_LOGS();

  const stats = {
    payment:       transactions.filter(t => t.type === 'payment'       && t.status === 'completed').reduce((s,t) => s+t.amount, 0),
    bonus:         transactions.filter(t => t.type === 'bonus'                                     ).reduce((s,t) => s+t.amount, 0),
    deduction:     Math.abs(transactions.filter(t => t.type === 'deduction'                        ).reduce((s,t) => s+t.amount, 0)),
    reimbursement: transactions.filter(t => t.type === 'reimbursement'                             ).reduce((s,t) => s+t.amount, 0),
    total:         transactions.filter(t => t.status === 'completed'                               ).reduce((s,t) => s+t.amount, 0),
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
            <Banknote className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Transactions & Historique</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {employee.first_name} {employee.last_name} · Réf: {employee.payment_ref}
            </p>
          </div>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* ── KPI cards ── */}
      <div className="px-6 pt-5 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: 'Paiements',      value: stats.payment,       color: 'text-[#2E7D32]'  },
          { label: 'Bonus',          value: stats.bonus,         color: 'text-[#355C7D]'  },
          { label: 'Déductions',     value: stats.deduction,     color: 'text-red-600'    },
          { label: 'Remboursements', value: stats.reimbursement, color: 'text-yellow-700' },
        ] as const).map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-sm font-bold ${s.color}`}>{fmtUSD(s.value)}</p>
          </div>
        ))}
      </div>

      {/* ── Total balance card ── */}
      <div className="px-6 pb-3">
        <div className="bg-[#DDEAD5]/40 rounded-xl border border-[#2E7D32]/20 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Solde total</p>
            <p className="text-xl font-bold text-[#2E7D32]">{fmtUSD(stats.total)}</p>
          </div>
          <TrendingUp className="w-5 h-5 text-[#2E7D32]" />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 px-6 border-b border-gray-100">
        {([
          { key: 'transactions', label: 'Transactions', count: transactions.length, Icon: Banknote },
          { key: 'activity',     label: 'Historique',   count: logs.length,         Icon: History  },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={[
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2',
              tab === t.key
                ? 'border-[#2E7D32] text-[#1B5E20] bg-[#DDEAD5]/30'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
            ].join(' ')}>
            <t.Icon className="w-3.5 h-3.5" />
            {t.label}
            <span className={['px-2 py-0.5 rounded-lg text-xs font-bold',
              tab === t.key ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-500',
            ].join(' ')}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="overflow-y-auto max-h-[40vh] px-6 py-4 flex flex-col gap-2">

        {tab === 'transactions' ? transactions.map(tx => {
          const cfg = TX_CFG[tx.type];
          return (
            <div key={tx.id} className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all p-4 flex items-center gap-4">
              <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                {tx.amount > 0
                  ? <ArrowUpRight className={`w-4 h-4 ${cfg.iconColor}`} />
                  : <ArrowDownRight className={`w-4 h-4 ${cfg.iconColor}`} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{tx.createdBy} · {fmtDate(tx.date)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-[#2E7D32]' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : ''}{fmtUSD(tx.amount)}
                </p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        }) : logs.map(log => (
          <div key={log.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4 text-[#355C7D]" />
            </div>
            <div className="flex-1 min-w-0">
              {log.action === 'create' ? (
                <p className="text-sm font-medium text-gray-900">Création du profil employé</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900">
                    Modification du champ <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{log.field}</span>
                  </p>
                  {log.oldValue && log.newValue && (
                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded line-through">{log.oldValue}</span>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-0.5 bg-[#DDEAD5] text-[#1B5E20] rounded font-medium">{log.newValue}</span>
                    </div>
                  )}
                </>
              )}
              <p className="text-xs text-gray-400 mt-1.5">{log.modifiedBy} · {fmtDate(log.date)}</p>
            </div>
          </div>
        ))}

      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
        <button onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
          Fermer
        </button>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all">
          <Download className="w-4 h-4" /> Exporter PDF
        </button>
      </div>

    </Modal>
  );
};

export default EmployeeTransactionModal;