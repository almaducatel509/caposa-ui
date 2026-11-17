"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from "@/app/components/ui/Modal";
import {
  X, TrendingUp, ArrowUpRight, ArrowDownRight,
  Download, History, Banknote, CreditCard, Loader2, AlertCircle, FileSpreadsheet,
} from "lucide-react";
import UserAvatar from '@/app/components/core/UserAvatar';
import { MemberData, accountTypeLabel } from '../validations';
import { fetchAccountTransactions, fetchMemberAccounts, type Transaction, type TxType } from "@/app/lib/api/members";
import { downloadStatement, savePdf } from '@/app/lib/api/reports';
import { exportToXLSXFile } from '@/app/utils/excelExport';

interface MemberTransactionModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  member:   MemberData | null;
}

const TX_CFG: Record<string, { bg: string; iconColor: string; badge: string; label: string; isCredit: boolean }> = {
  depot:          { bg: 'bg-[#DDEAD5]', iconColor: 'text-[#2E7D32]', badge: 'bg-[#DDEAD5] text-[#1B5E20]',   label: 'Dépôt',         isCredit: true  },
  retrait:        { bg: 'bg-red-50',    iconColor: 'text-red-600',   badge: 'bg-red-50 text-red-700',          label: 'Retrait',       isCredit: false },
  transfert:      { bg: 'bg-blue-50',   iconColor: 'text-[#355C7D]', badge: 'bg-blue-50 text-[#355C7D]',      label: 'Transfert',     isCredit: false },
  remboursement:  { bg: 'bg-emerald-50',iconColor: 'text-emerald-700',badge: 'bg-emerald-50 text-emerald-700',label: 'Remboursement', isCredit: false },
  decaissement:   { bg: 'bg-purple-50', iconColor: 'text-purple-700', badge: 'bg-purple-50 text-purple-700',  label: 'Décaissement',  isCredit: true  },
  interet:        { bg: 'bg-indigo-50', iconColor: 'text-indigo-700', badge: 'bg-indigo-50 text-indigo-700',  label: 'Intérêt',       isCredit: true  },
  frais:          { bg: 'bg-yellow-50', iconColor: 'text-yellow-700', badge: 'bg-yellow-50 text-yellow-700',   label: 'Frais',         isCredit: false },
};

function fmtHTG(n: number) {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Math.abs(n)) + ' HTG';
}

function fmtDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const MemberTransactionModal: React.FC<MemberTransactionModalProps> = ({
  isOpen, onClose, member,
}) => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [activeAccount, setActiveAccount] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // ── Charger les comptes du membre à l'ouverture ──
  useEffect(() => {
    if (!isOpen || !member?.id) {
      setAccounts([]);
      setTransactions([]);
      setActiveAccount(0);
      setError(null);
      return;
    }

    let isCancelled = false;
    setLoadingAccounts(true);

    fetchMemberAccounts(member.id)
      .then((accs) => {
        if (isCancelled) return;
        setAccounts(accs);
        setLoadingAccounts(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error("Erreur chargement comptes membre:", err);
        setAccounts([]);
        setLoadingAccounts(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, member?.id]);

  const currentAccount = accounts[activeAccount];
  const activeAccountId = currentAccount?.id;

  // ── Charger les transactions du compte actif ──
  const fetchTransactions = useCallback(async (accountId: string | number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAccountTransactions(accountId);
      setTransactions(data);
    } catch (err) {
      console.error('Erreur lors du chargement des transactions:', err);
      setError("Impossible de charger l'historique des transactions.");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && activeAccountId != null) {
      fetchTransactions(activeAccountId);
    } else if (isOpen && !loadingAccounts && accounts.length === 0) {
      setTransactions([]);
    }
  }, [isOpen, activeAccountId, accounts.length, loadingAccounts, fetchTransactions]);

  if (!member) return null;

  const stats = {
    depot:   transactions.filter(t => t.type === 'depot').reduce((s, t) => s + t.amount, 0),
    retrait: transactions.filter(t => t.type === 'retrait').reduce((s, t) => s + Math.abs(t.amount), 0),
    interet: transactions.filter(t => t.type === 'interet').reduce((s, t) => s + t.amount, 0),
    frais:   transactions.filter(t => t.type === 'frais').reduce((s, t) => s + Math.abs(t.amount), 0),
  };

  // ── Export PDF relevé de compte ──
  const handleExportPDF = async () => {
    if (!currentAccount?.account_number) return;
    setIsExportingPdf(true);
    try {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const startOfYearStr = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);

      const pdf = await downloadStatement({
        account_number: currentAccount.account_number,
        start_date: startOfYearStr,
        end_date: todayStr,
      });
      savePdf(pdf);
    } catch (err: any) {
      console.error('Erreur export PDF relevé:', err);
      alert(err?.message ?? 'Impossible de générer le relevé PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // ── Export Excel / CSV des transactions du compte ──
  const handleExportExcel = () => {
    if (transactions.length === 0) return;
    const headers = ['Date', 'Description', 'Type', 'Montant (HTG)', 'Sens', 'Statut', 'Auteur / Agent'];
    const rows = transactions.map(tx => {
      const cfg = TX_CFG[tx.type] ?? TX_CFG.depot;
      return [
        fmtDate(tx.date),
        tx.description,
        cfg.label,
        tx.amount,
        cfg.isCredit ? 'Crédit (+)' : 'Débit (-)',
        tx.status,
        tx.createdBy,
      ];
    });

    const accNum = currentAccount?.account_number ?? member.id_member ?? 'compte';
    exportToXLSXFile({
      filename: `transactions_${accNum}`,
      documentTitle: `HISTORIQUE DES TRANSACTIONS — ${accNum}`,
      headers,
      rows,
    });
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
              photo_profil: member.photo_profil,
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
      {accounts && accounts.length > 1 && (
        <div className="flex gap-2 px-6 pt-4 overflow-x-auto pb-1">
          {accounts.map((acc, idx) => (
            <button key={acc.id} onClick={() => setActiveAccount(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all shrink-0 ${
                activeAccount === idx
                  ? 'bg-[#DDEAD5] border-[#2E7D32] text-[#1B5E20] shadow-xs'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              <CreditCard className="w-3 h-3" />
              <span>{acc.account_number}</span>
              <span className="text-[10px] opacity-75">({accountTypeLabel(acc.account_type)})</span>
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
      {currentAccount && (
        <div className="px-6 pb-3">
          <div className="bg-[#DDEAD5]/40 rounded-xl border border-[#2E7D32]/20 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">
                Solde — {accountTypeLabel(currentAccount.account_type)} ({currentAccount.account_number})
              </p>
              <p className="text-xl font-bold text-[#2E7D32]">
                {fmtHTG(Number(currentAccount.balance ?? 0))}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/70 text-[#1B5E20] border border-[#2E7D32]/20">
                {currentAccount.account_status ?? 'actif'}
              </span>
              <TrendingUp className="w-5 h-5 text-[#2E7D32]" />
            </div>
          </div>
        </div>
      )}

      {/* ── Aucun compte disponible ── */}
      {!loadingAccounts && accounts.length === 0 && (
        <div className="px-6 py-8 flex flex-col items-center justify-center text-center gap-2">
          <CreditCard className="w-8 h-8 text-gray-300" />
          <p className="text-sm font-semibold text-gray-700">Aucun compte bancaire</p>
          <p className="text-xs text-gray-400">Ce membre ne possède aucun compte bancaire pour le moment.</p>
        </div>
      )}

      {/* ── Liste transactions ── */}
      {accounts.length > 0 && (
        <>
          <div className="px-6 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <Banknote className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Historique des transactions {currentAccount?.account_number ? `(${currentAccount.account_number})` : ''}
              </p>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[35vh] px-6 pb-4 flex flex-col gap-2">
            {(isLoading || loadingAccounts) && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p className="text-xs">Chargement des transactions...</p>
              </div>
            )}

            {!isLoading && !loadingAccounts && error && (
              <div className="flex flex-col items-center justify-center py-10 text-red-500 gap-2">
                <AlertCircle className="w-5 h-5" />
                <p className="text-xs">{error}</p>
                <button
                  onClick={() => activeAccountId != null && fetchTransactions(activeAccountId)}
                  className="text-xs font-medium text-[#2E7D32] hover:underline mt-1"
                >
                  Réessayer
                </button>
              </div>
            )}

            {!isLoading && !loadingAccounts && !error && transactions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <History className="w-5 h-5" />
                <p className="text-xs">Aucune transaction pour ce compte.</p>
              </div>
            )}

            {!isLoading && !loadingAccounts && !error && transactions.map(tx => {
              const cfg = TX_CFG[tx.type] ?? TX_CFG.depot;
              const isCredit = cfg.isCredit;
              return (
                <div key={tx.id}
                  className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all p-4 flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                    {isCredit
                      ? <ArrowUpRight   className={`w-4 h-4 ${cfg.iconColor}`} />
                      : <ArrowDownRight className={`w-4 h-4 ${cfg.iconColor}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{tx.createdBy} · {fmtDate(tx.date)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${isCredit ? 'text-[#2E7D32]' : 'text-red-600'}`}>
                      {isCredit ? '+' : '-'}{fmtHTG(tx.amount)}
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
        <div>
          {transactions.length > 0 && (
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all shadow-xs"
              title="Exporter les transactions vers un fichier CSV compatible Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#2E7D32]" />
              Exporter Excel
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
            Fermer
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf || !currentAccount?.account_number}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Exporter PDF
          </button>
        </div>
      </div>

    </Modal>
  );
};

export default MemberTransactionModal;
