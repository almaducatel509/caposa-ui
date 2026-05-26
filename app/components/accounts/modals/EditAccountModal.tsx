'use client';

import React, { useState } from 'react';
import { X, Pencil } from 'lucide-react';
import { updateAccount } from '@/app/lib/api/accounts';
import type { AccountData } from '../validationsaccount';

interface EditAccountModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  account:   AccountData;          // ⬅️ obligatoire en mode édition
  onSuccess: (account: AccountData) => void;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen, onClose, account, onSuccess,
}) => {
  const [tauxInteret,         setTauxInteret]         = useState<number | null>(account.tauxInteret ?? null);
  const [limiteTrait,         setLimiteTrait]         = useState<number | null>(account.limiteTrait ?? null);
  const [fraisServiceMensuel, setFraisServiceMensuel] = useState<number | null>(account.fraisServiceMensuel ?? null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const isTerme   = account.typeCompte === 'terme';
  const isCheques = account.typeCompte === 'cheques';

  const handleClose = () => {
    if (isSubmitting) return;
    setApiError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setApiError(null);
    try {
      const updated = await updateAccount(account.id, {
        tauxInteret:         isTerme   ? tauxInteret         : undefined,
        limiteTrait:         isCheques ? limiteTrait         : undefined,
        fraisServiceMensuel,
      });
      onSuccess(updated);
      handleClose();
    } catch (e: any) {
      setApiError(e?.message ?? 'Erreur lors de la modification du compte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DDEAD5] flex items-center justify-center">
              <Pencil className="w-4 h-4 text-[#2E7D32]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Modifier le compte</h2>
              <p className="text-xs text-gray-500 font-mono">{account.account_number}</p>
            </div>
          </div>
          <button onClick={handleClose} disabled={isSubmitting}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs font-semibold text-red-700">Erreur</p>
              <p className="text-xs text-red-600 mt-0.5">{apiError}</p>
            </div>
          )}

          {/* Infos verrouillées */}
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Titulaire</span>
              <span className="font-semibold text-gray-700">
                {account.member_details?.full_name ?? account.member_details?.first_name ?? '—'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Type</span>
              <span className="font-semibold text-gray-700 capitalize">{account.typeCompte}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Statut</span>
              <span className="font-semibold text-[#2E7D32]">{account.account_status}</span>
            </div>
          </div>

          {/* Frais mensuels (tous les types) */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Frais mensuels (HTG)
            </label>
            <input
              type="number"
              min={0}
              value={fraisServiceMensuel ?? ''}
              onChange={(e) => setFraisServiceMensuel(e.target.value === '' ? null : Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32]"
            />
          </div>

          {/* Taux : uniquement comptes à terme */}
          {isTerme && (
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Taux d'intérêt (%)
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={tauxInteret ?? ''}
                onChange={(e) => setTauxInteret(e.target.value === '' ? null : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32]"
              />
            </div>
          )}

          {/* Limite : uniquement comptes chèques */}
          {isCheques && (
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Limite de retrait/jour (HTG)
              </label>
              <input
                type="number"
                min={0}
                value={limiteTrait ?? ''}
                onChange={(e) => setLimiteTrait(e.target.value === '' ? null : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32]"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={handleClose} disabled={isSubmitting}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2E7D32] hover:bg-[#1B5E20] rounded-lg disabled:opacity-60">
            {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAccountModal;