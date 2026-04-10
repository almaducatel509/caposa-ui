'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, XCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { AccountData } from '../validationsaccount';
import { updateAccount } from '@/app/lib/api/accounts';
import { Modal } from '../../ui/Modal';

interface CloseAccountModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  account:   AccountData | null;
}

const TYPE_LABEL: Record<string, string> = {
  epargne: 'Épargne',
  cheques: 'Chèques',
  terme:   'Terme',
};

const STATUS_COLORS: Record<string, string> = {
  ouvert:     'bg-[#DDEAD5] text-[#1B5E20]',
  gelé:       'bg-blue-50 text-[#355C7D]',
  en_attente: 'bg-amber-50 text-amber-700',
  fermé:      'bg-gray-100 text-gray-500',
};

export default function CloseAccountModal({ isOpen, onClose, onSuccess, account }: CloseAccountModalProps) {
  const [isClosing,   setIsClosing]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [closureDate, setClosureDate] = useState('');
  const [reason,      setReason]      = useState('');

  useEffect(() => {
    if (isOpen) {
      setClosureDate(new Date().toISOString().split('T')[0]);
      setReason('');
      setError(null);
    }
  }, [isOpen, account]);

  if (!isOpen || !account) return null;

  const solde           = account.soldeActuel ?? parseFloat(account.balance ?? '0');
  const isAlreadyClosed = account.statusAccount === 'fermé';
  const canClose        = solde === 0 && !isAlreadyClosed;

  const blockingReason = isAlreadyClosed
    ? 'Ce compte est déjà fermé.'
    : solde !== 0
      ? `Solde non nul : ${solde.toLocaleString('fr-FR')} HTG. Le solde doit être exactement à 0 HTG avant la fermeture.`
      : null;

  const titulaire =
    account.member_details?.full_name ||
    `${account.member_details?.first_name ?? ''} ${account.member_details?.last_name ?? ''}`.trim() ||
    '—';

  const typeCompte =
    TYPE_LABEL[account.typeCompte ?? ''] ||
    TYPE_LABEL[account.account_type ?? ''] ||
    account.account_type ||
    '—';

  const dateOuverture = account.dateOuverture || account.created_at
    ? new Date(account.dateOuverture ?? account.created_at!).toLocaleDateString('fr-FR')
    : '—';

  const statut = account.statusAccount ?? (account.account_status ? 'ouvert' : 'fermé');

  const details = [
    { label: 'Numéro',        value: account.account_number },
    { label: 'Titulaire',     value: titulaire },
    { label: 'Type',          value: typeCompte },
    { label: 'Solde actuel',  value: `${solde.toLocaleString('fr-FR')} HTG`, danger: solde !== 0 },
    { label: 'Ouvert le',     value: dateOuverture },
    { label: 'Statut actuel', value: statut, chip: true },
  ];

  const handleSubmit = async () => {
    if (!canClose) { setError(blockingReason); return; }

    const openDate  = new Date(account.dateOuverture ?? account.created_at ?? '');
    const closeDate = new Date(closureDate);
    if (closeDate < openDate) {
      setError("La date de fermeture ne peut pas être antérieure à la date d'ouverture.");
      return;
    }

    setIsClosing(true);
    setError(null);
    try {
      await updateAccount(account.id, {
        statutCompte:  'ferme',
        dateFermeture: closureDate,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la fermeture du compte.');
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { if (!isClosing) onClose(); }} size="lg">

      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-red-100 bg-red-50 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Fermer le compte</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Fermeture définitive — données conservées pour la traçabilité
            </p>
          </div>
        </div>
        <button
          onClick={() => { if (!isClosing) onClose(); }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-red-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">

        {/* Blocking alert */}
        {!canClose && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 mb-0.5">Fermeture impossible</p>
              <p className="text-xs text-red-600">{blockingReason}</p>
            </div>
          </div>
        )}

        {/* Legal note */}
        <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>Note importante :</strong> Conformément aux réglementations bancaires, les données
            du compte seront conservées à des fins de traçabilité et d'audit. Le compte restera
            consultable mais ne pourra plus être utilisé.
          </p>
        </div>

        {/* Account details */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <p className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            Détails du compte
          </p>
          {details.map(({ label, value, danger, chip }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-500">{label}</span>
              {chip ? (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[String(value)] ?? 'bg-gray-100 text-gray-500'}`}>
                  {String(value).toUpperCase()}
                </span>
              ) : (
                <span className={`text-xs font-semibold ${danger ? 'text-red-600' : 'text-gray-900'}`}>
                  {value}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Steps if balance ≠ 0 */}
        {!canClose && solde !== 0 && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs font-semibold text-amber-800 mb-2">Étapes à suivre :</p>
            <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
              <li>Effectuez {solde > 0 ? 'un retrait' : 'un dépôt'} pour ramener le solde à 0 HTG</li>
              <li>Vérifiez qu'aucune transaction n'est en attente</li>
              <li>Assurez-vous que tous les chèques ont été compensés</li>
              <li>Revenez fermer le compte</li>
            </ol>
          </div>
        )}

        {/* Closure form */}
        {canClose && (
          <>
            <div className="flex items-center gap-2 p-3 bg-[#DDEAD5]/50 border border-[#2E7D32]/20 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
              <p className="text-xs text-[#1B5E20] font-medium">Solde à 0 HTG — fermeture autorisée</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Date de fermeture <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={closureDate}
                  onChange={e => { setClosureDate(e.target.value); setError(null); }}
                  min={account.dateOuverture ?? account.created_at?.split('T')[0]}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Raison <span className="text-gray-400 font-normal normal-case">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Ex : Demande du client, migration vers autre compte…"
                  maxLength={200}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all"
                />
              </div>
            </div>
          </>
        )}

        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
        <button
          onClick={() => { if (!isClosing) onClose(); }}
          disabled={isClosing}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={isClosing || !canClose}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isClosing
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Fermeture…</>
            : <><XCircle className="w-3.5 h-3.5" /> Confirmer la fermeture</>
          }
        </button>
      </div>

    </Modal>
  );
}