"use client";

import React, { useState } from 'react';
import { Modal } from "@/app/components/ui/Modal";
import {
  X, TrendingUp, ArrowUpRight, ArrowDownRight,
  Download, History, Banknote, CreditCard,
} from "lucide-react";
import UserAvatar from '@/app/components/core/UserAvatar';
import { MemberData, accountTypeLabel, formatMoney } from '../validations';

type TxType   = 'depot' | 'retrait' | 'interet' | 'frais';
type TxStatus = 'completed' | 'pending' | 'cancelled';

interface Transaction {
  id: string; type: TxType; amount: number;
  description: string; date: string; status: TxStatus; createdBy: string;
}

interface MemberTransactionModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  member:   MemberData | null;
}

const TX_CFG: Record<TxType, { bg: string; iconColor: string; badge: string; label: string }> = {
  depot:   { bg: 'bg-[#DDEAD5]', iconColor: 'text-[#2E7D32]', badge: 'bg-[#DDEAD5] text-[#1B5E20]',  label: 'Dépôt'    },
  retrait: { bg: 'bg-red-50',    iconColor: 'text-red-600',   badge: 'bg-red-50 text-red-700',         label: 'Retrait'  },
  interet: { bg: 'bg-blue-50',   iconColor: 'text-[#355C7D]', badge: 'bg-blue-50 text-[#355C7D]',     label: 'Intérêt'  },
  frais:   { bg: 'bg-yellow-50', iconColor: 'text-yellow-700',badge: 'bg-yellow-50 text-yellow-700',  label: 'Frais'    },
};

const MOCK_TX = (): Transaction[] => [
  { id:'1', type:'depot',   amount: 50000, description:'Dépôt initial',           date:'2025-01-15T14:30:00', status:'completed', createdBy:'Caissier A' },
  { id:'2', type:'interet', amount: 1250,  description:'Intérêt mensuel Jan 2025', date:'2025-01-31T10:00:00', status:'completed', createdBy:'Système'    },
  { id:'3', type:'retrait', amount:-15000, description:'Retrait guichet',          date:'2025-02-05T09:15:00', status:'completed', createdBy:'Caissier B' },
  { id:'4', type:'frais',   amount:-500,   description:'Frais de service mensuel', date:'2025-02-28T08:00:00', status:'completed', createdBy:'Système'    },
];

function fmtHTG(n: number) {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Math.abs(n)) + ' HTG';
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const MemberTransactionModal: React.FC<MemberTransactionModalProps> = ({
  isOpen, onClose, member,
}) => {
  const [activeAccount, setActiveAccount] = useState(0);
  if (!member) return null;

  const transactions = MOCK_TX();
  const stats = {
    depot:   transactions.filter(t => t.type === 'depot').reduce((s,t)  => s + t.amount, 0),
    retrait: transactions.filter(t => t.type === 'retrait').reduce((s,t) => s + Math.abs(t.amount), 0),
    interet: transactions.filter(t => t.type === 'interet').reduce((s,t) => s + t.amount, 0),
    frais:   transactions.filter(t => t.type === 'frais').reduce((s,t)   => s + Math.abs(t.amount), 0),
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <UserAvatar
            user={{
              first_name: member.first_name ?? '',
              last_name:  member.last_name  ?? '',
              photo_profil:      member.photo_profil,
            }}
            size="md"
          />
          <div>
            <h3 className="text-base font-bold text-gray-900">Transactions du membre</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {member.first_name} {member.last_name} · #{member.id_member}
            </p>
          </div>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* ── Sélecteur de compte ── */}
      {member.accounts && member.accounts.length > 1 && (
        <div className="flex gap-2 px-6 pt-4">
          {member.accounts.map((acc, idx) => (
            <button key={acc.id} onClick={() => setActiveAccount(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                activeAccount === idx
                  ? 'bg-[#DDEAD5] border-[#2E7D32] text-[#1B5E20]'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              <CreditCard className="w-3 h-3" />
              {acc.account_number}
            </button>
          ))}
        </div>
      )}

      {/* ── KPI cards ── */}
      <div className="px-6 pt-4 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: 'Dépôts',   value: stats.depot,   color: 'text-[#2E7D32]'  },
          { label: 'Retraits', value: stats.retrait, color: 'text-red-600'    },
          { label: 'Intérêts', value: stats.interet, color: 'text-[#355C7D]'  },
          { label: 'Frais',    value: stats.frais,   color: 'text-yellow-700' },
        ]).map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-sm font-bold ${s.color}`}>{fmtHTG(s.value)}</p>
          </div>
        ))}
      </div>

      {/* ── Solde compte actif ── */}
      {member.accounts?.[activeAccount] && (
        <div className="px-6 pb-3">
          <div className="bg-[#DDEAD5]/40 rounded-xl border border-[#2E7D32]/20 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">
                Solde — {accountTypeLabel(member.accounts[activeAccount].account_type)}
              </p>
              <p className="text-xl font-bold text-[#2E7D32]">
                {fmtHTG(Number(member.accounts[activeAccount].balance ?? 0))}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-[#2E7D32]" />
          </div>
        </div>
      )}

      {/* ── Liste transactions ── */}
      <div className="px-6 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <Banknote className="w-3.5 h-3.5 text-gray-400" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Historique des transactions
          </p>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[35vh] px-6 pb-4 flex flex-col gap-2">
        {transactions.map(tx => {
          const cfg = TX_CFG[tx.type];
          return (
            <div key={tx.id}
              className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all p-4 flex items-center gap-4">
              <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                {tx.amount > 0
                  ? <ArrowUpRight   className={`w-4 h-4 ${cfg.iconColor}`} />
                  : <ArrowDownRight className={`w-4 h-4 ${cfg.iconColor}`} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{tx.createdBy} · {fmtDate(tx.date)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-[#2E7D32]' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : '-'}{fmtHTG(tx.amount)}
                </p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
        <button onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
          Fermer
        </button>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all">
          <Download className="w-4 h-4" /> Exporter PDF
        </button>
      </div>

    </Modal>
  );
};

export default MemberTransactionModal;