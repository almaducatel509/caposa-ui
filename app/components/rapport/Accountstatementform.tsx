'use client';

// app/components/reports/AccountStatementForm.tsx
//
// Page Rapports minimale : relevé de compte client en PDF.
// Numéro de compte + période → téléchargement du PDF généré par le backend.

import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Download, Loader2, AlertTriangle, CheckCircle2, Calendar, CreditCard } from 'lucide-react';
import { fetchAccounts } from '@/app/lib/api/accounts';
import { downloadStatement, savePdf } from '@/app/lib/api/reports';
import type { AccountData } from '@/app/components/accounts/validationsaccount';

const iso = (d: Date) => d.toISOString().slice(0, 10);

function firstOfMonth(): string {
  const d = new Date();
  return iso(new Date(d.getFullYear(), d.getMonth(), 1));
}

export default function AccountStatementForm() {
  const [accounts,     setAccounts]     = useState<AccountData[]>([]);
  const [accountsErr,  setAccountsErr]  = useState<string | null>(null);
  const [accountNum,   setAccountNum]   = useState('');
  const [startDate,    setStartDate]    = useState(firstOfMonth());
  const [endDate,      setEndDate]      = useState(iso(new Date()));
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts()
      .then(list => setAccounts(list))
      .catch(() => setAccountsErr('Impossible de charger la liste des comptes.'));
  }, []);

  const [open, setOpen] = useState(false);

  // Suggestions : filtre sur le numéro de compte ou le nom du membre (8 max)
  const suggestions = useMemo(() => {
    const q = accountNum.trim().toLowerCase();
    return accounts
      .filter(a =>
        !q ||
        a.account_number?.toLowerCase().includes(q) ||
        a.member_details?.full_name?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [accounts, accountNum]);

  const selected = useMemo(
    () => accounts.find(a => a.account_number === accountNum.trim()),
    [accounts, accountNum],
  );

  const today = iso(new Date());
  const validationError =
    !accountNum.trim()        ? 'Saisissez un numéro de compte.'
    : !startDate || !endDate  ? 'Choisissez une période.'
    : startDate > endDate     ? 'La date de début doit précéder la date de fin.'
    : endDate > today         ? 'La date de fin ne peut pas être dans le futur.'
    : null;

  const handleDownload = async () => {
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const file = await downloadStatement({
        account_number: accountNum.trim(),
        start_date: startDate,
        end_date: endDate,
      });
      savePdf(file);
      setSuccess(`Relevé du compte ${accountNum.trim()} téléchargé.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white outline-none transition-all ' +
    'hover:border-gray-300 focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32]';

  return (
    <div className="min-h-screen bg-[#F9F9F6] p-6 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
          <p className="text-sm text-gray-500">Relevé de compte client au format PDF</p>
        </div>
      </div>

      {/* Carte formulaire */}
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
        <h2 className="text-sm font-semibold text-gray-800">Relevé de compte</h2>

        {/* Compte */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" /> Numéro de compte <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              value={accountNum}
              onChange={e => { setAccountNum(e.target.value); setOpen(true); setError(null); setSuccess(null); }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Tapez un numéro de compte…"
              autoComplete="off"
              className={`${inputCls} font-mono`}
            />
            {open && suggestions.length > 0 && (
              <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg max-h-64 overflow-y-auto divide-y divide-gray-50">
                {suggestions.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { setAccountNum(a.account_number); setOpen(false); setError(null); setSuccess(null); }}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-[#DDEAD5]/40 transition-colors"
                  >
                    <span className="font-mono text-sm font-semibold text-gray-800">{a.account_number}</span>
                    <span className="text-xs text-gray-400 truncate">
                      {a.member_details?.full_name ?? ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selected && (
            <p className="text-xs text-gray-500">
              {selected.member_details?.full_name ?? 'Membre'} · {selected.typeCompte ?? ''} · statut {selected.account_status}
            </p>
          )}
          {accountsErr && <p className="text-xs text-amber-700">{accountsErr} Vous pouvez saisir le numéro manuellement.</p>}
        </div>

        {/* Période */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Du
            </label>
            <input type="date" value={startDate} max={today}
              onChange={e => { setStartDate(e.target.value); setError(null); }}
              className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Au
            </label>
            <input type="date" value={endDate} max={today}
              onChange={e => { setEndDate(e.target.value); setError(null); }}
              className={inputCls} />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-[#81C784] bg-[#DDEAD5]/50 text-[#1B5E20] text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleDownload}
          disabled={loading}
          className="self-end flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-[#2E7D32] to-[#1B5E20] shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération…</>
            : <><Download className="w-4 h-4" /> Télécharger le relevé (PDF)</>}
        </button>
      </div>
    </div>
  );
}