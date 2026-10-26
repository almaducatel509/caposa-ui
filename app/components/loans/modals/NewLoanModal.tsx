'use client';

/**
 * NewLoanModal.tsx — modale de création d'une demande de prêt
 * ─────────────────────────────────────────────────────────────────
 * Charge la liste des membres à l'ouverture (API réelle, pas de mock),
 * puis délègue tout le flux à LoanForm.
 *
 * Le modal ne se ferme PAS après la création : l'utilisateur voit le
 * reçu, peut l'imprimer, puis ferme lui-même. Comme il retourne `null`
 * quand il est fermé, LoanForm est démonté et repart vierge à chaque ouverture.
 * ─────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import { X, Landmark, Loader2, AlertTriangle } from 'lucide-react';
import LoanForm from '../LoanFormFields';
import { MemberOption } from '../../members/validations';
import { fetchMembers } from '@/app/lib/api/members';
import type { LoanData } from '../../transactions/validation/loanSchema';

interface NewLoanModalProps {
  isOpen:     boolean;
  onClose:    () => void;
  /** Appelé après création réussie — le parent recharge sa liste. */
  onCreated?: (loan: LoanData) => void;
}

const NewLoanModal: React.FC<NewLoanModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMembers();
      setMembers(data.map(m => ({
        id:           m.id,
        member_name:  `${m.first_name} ${m.last_name}`.trim(),
        id_number:    m.id_number ?? '',
        phone_number: m.phone_number,
      })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger les membres.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadMembers();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 backdrop-blur-sm p-4 pt-10">
      <div className="w-full max-w-2xl bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Nouvelle demande de prêt</p>
              <p className="text-xs text-gray-400">Remplissez les informations du prêt</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer"
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[80vh]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Chargement des membres…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />{error}
              </div>
              <button onClick={loadMembers}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white">
                Réessayer
              </button>
            </div>
          ) : (
            <LoanForm members={members} onCancel={onClose} onCreated={onCreated} />
          )}
        </div>
      </div>
    </div>
  );
};

export default NewLoanModal;