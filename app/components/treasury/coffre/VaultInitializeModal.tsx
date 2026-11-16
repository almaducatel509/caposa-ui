'use client';
import React, { useState } from 'react';
import {
  XCircle,
  Calculator,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Building2,
  FileText,
  Banknote,
  Loader2,
} from 'lucide-react';
import AxiosInstance from '@/app/lib/axiosInstance';

interface BranchOption {
  id: string;
  name: string;
}

interface VaultInitializeModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: BranchOption[];
  currentBranchId?: string;
  onSuccess?: () => void;
}

const DENOMINATIONS = [1000, 500, 250, 100, 50, 25, 20, 10];

export const VaultInitializeModal: React.FC<VaultInitializeModalProps> = ({
  isOpen,
  onClose,
  branches,
  currentBranchId,
  onSuccess,
}) => {
  const [branchId, setBranchId] = useState(currentBranchId || (branches[0]?.id ?? ''));
  const [origin, setOrigin] = useState('FONDS_EXISTANTS');
  const [pvReference, setPvReference] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [useBilletage, setUseBilletage] = useState(false);
  const [denominations, setDenominations] = useState<Record<string, number>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (currentBranchId) {
      setBranchId(currentBranchId);
    } else if (branches.length > 0) {
      setBranchId(branches[0].id);
    }
  }, [currentBranchId, branches]);

  if (!isOpen) return null;

  // Calcul du total issu du billetage
  const billetageTotal = Object.entries(denominations).reduce((acc, [denom, count]) => {
    return acc + Number(denom) * (Number(count) || 0);
  }, 0);

  const handleDenomChange = (denom: number, countStr: string) => {
    const count = parseInt(countStr, 10);
    const updated = { ...denominations, [String(denom)]: isNaN(count) || count < 0 ? 0 : count };
    setDenominations(updated);

    // Mettre à jour automatiquement le montant si mode billetage activé
    const newTotal = Object.entries(updated).reduce((acc, [d, c]) => acc + Number(d) * (Number(c) || 0), 0);
    setAmount(newTotal > 0 ? String(newTotal) : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError('Veuillez saisir un montant valide (≥ 0).');
      return;
    }

    if (!pvReference.trim()) {
      setError('Le numéro ou référence du Procès-Verbal (PV) est obligatoire.');
      return;
    }

    if (!branchId) {
      setError('Veuillez sélectionner une succursale.');
      return;
    }

    if (useBilletage && billetageTotal !== parsedAmount) {
      setError(
        `Le total du billetage (${billetageTotal.toLocaleString('fr-HT')} HTG) ne correspond pas au montant déclaré (${parsedAmount.toLocaleString('fr-HT')} HTG).`
      );
      return;
    }

    // Filtrer coupures nulles
    const cleanDenominations: Record<string, number> = {};
    if (useBilletage) {
      Object.entries(denominations).forEach(([k, v]) => {
        if (v > 0) cleanDenominations[k] = v;
      });
    }

    setLoading(true);
    try {
      await AxiosInstance.post('/treasury/vault/initialize/', {
        branch: branchId,
        currency: 'HTG',
        amount: parsedAmount,
        origin,
        pv_reference: pvReference.trim(),
        denominations: cleanDenominations,
        notes: notes.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
    } catch (err: any) {
      console.error("Erreur initialisation coffre:", err);
      const detail =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        err?.message ??
        "Impossible d'initialiser le coffre.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    setAmount('');
    setPvReference('');
    setNotes('');
    setDenominations({});
    setUseBilletage(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-linear-to-r from-[#F9F9F6] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Initialiser le Coffre-Fort</h2>
              <p className="text-xs text-gray-500">Saisie unique du solde de départ certifié</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm">
          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#DDEAD5] flex items-center justify-center text-[#2E7D32]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Coffre initialisé avec succès !</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Le solde de départ est enregistré et définitivement verrouillé. Les sessions peuvent désormais être approvisionnées.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Bannière information règle bancaire */}
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-semibold mb-0.5">Opération unique et inaltérable</p>
                  Ce solde initial servira de base inviolable à tous les mouvements coffre ↔ caisse. Il sera verrouillé dès validation par le superviseur.
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Succursale */}
              {branches.length > 1 ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Succursale *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:bg-white focus:border-[#2E7D32] outline-none transition-all text-sm font-medium"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}

              {/* Origine des fonds */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Origine des fonds de départ *
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:bg-white focus:border-[#2E7D32] outline-none transition-all text-sm font-medium"
                >
                  <option value="FONDS_EXISTANTS">
                    Fonds physiques déjà en coffre avant le système
                  </option>
                  <option value="APPORTS_FONDATEURS">
                    Apport des membres fondateurs / capital social
                  </option>
                  <option value="COMPTE_BANCAIRE">
                    Retrait depuis un compte bancaire
                  </option>
                  <option value="AUTRE">Autre provenance</option>
                </select>
              </div>

              {/* Référence PV & Montant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Référence du PV *
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ex: PV-INIT-2026-001"
                      value={pvReference}
                      onChange={(e) => setPvReference(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-[#2E7D32] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Montant physique total *
                  </label>
                  <div className="relative">
                    <Banknote className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full pl-9 pr-14 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 focus:border-[#2E7D32] outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      HTG
                    </span>
                  </div>
                </div>
              </div>

              {/* Billetage (Optionnel / Dépliable) */}
              <div className="border border-gray-200/80 rounded-xl p-3 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={useBilletage}
                      onChange={(e) => setUseBilletage(e.target.checked)}
                      className="rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]"
                    />
                    <span>Saisir le détail du billetage (coupures)</span>
                  </label>
                  {useBilletage && (
                    <span className="text-xs font-bold text-[#2E7D32]">
                      Total: {billetageTotal.toLocaleString('fr-HT')} HTG
                    </span>
                  )}
                </div>

                {useBilletage && (
                  <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DENOMINATIONS.map((denom) => (
                      <div key={denom} className="flex flex-col">
                        <span className="text-[11px] font-medium text-gray-500 mb-0.5">
                          {denom} G
                        </span>
                        <input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={denominations[String(denom)] ?? ''}
                          onChange={(e) => handleDenomChange(denom, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-center focus:border-[#2E7D32] outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Observations / Signataires
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Compté en présence du Superviseur et du Trésorier..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#2E7D32] outline-none resize-none"
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Certifier et verrouiller
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
