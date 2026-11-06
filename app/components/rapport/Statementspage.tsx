'use client';

// app/components/rapport/StatementsPage.tsx
//
// Page Rapports : tableau des relevés de compte déjà générés (archivés par le backend)
// + bouton « Nouveau relevé » qui ouvre GenerateStatementModal.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, Plus, RefreshCw, Download, Loader2, AlertTriangle, Search, Eye } from 'lucide-react';
import { fetchStatements, downloadStatementPdf, savePdf, AccountStatementData, PdfFile } from '@/app/lib/api/reports';
import { Modal } from '@/app/components/ui/Modal';
import GenerateStatementModal from './modals/Generatestatementmodal';

const formatHTG = (n: number) =>
  new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 2 }).format(n) + ' HTG';

const formatDate = (iso?: string) =>
  iso ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('fr-FR') : '—';

export default function StatementsPage() {
  const [statements,  setStatements]  = useState<AccountStatementData[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [search,      setSearch]      = useState('');
  const [showModal,   setShowModal]   = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [rowError,    setRowError]    = useState<string | null>(null);

  // Aperçu PDF dans un modal
  const [previewing,  setPreviewing]  = useState<string | null>(null);
  const [preview,     setPreview]     = useState<{ url: string; file: PdfFile; title: string } | null>(null);

  const closePreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const handlePreview = async (s: AccountStatementData) => {
    setPreviewing(s.id);
    setRowError(null);
    try {
      const file = await downloadStatementPdf(s.id, s.reference);
      // Forcer le type pour que le navigateur affiche le PDF dans l'iframe
      const pdfBlob = file.blob.type === 'application/pdf' ? file.blob : new Blob([file.blob], { type: 'application/pdf' });
      setPreview({ url: URL.createObjectURL(pdfBlob), file, title: s.reference });
    } catch (e) {
      setRowError(e instanceof Error ? e.message : 'Aperçu impossible.');
    } finally {
      setPreviewing(null);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStatements(await fetchStatements());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger les relevés.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...statements].sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (!q) return list;
    return list.filter(s =>
      s.account_number.toLowerCase().includes(q) ||
      (s.member_name ?? '').toLowerCase().includes(q) ||
      s.reference.toLowerCase().includes(q),
    );
  }, [statements, search]);

  const handleDownload = async (s: AccountStatementData) => {
    setDownloading(s.id);
    setRowError(null);
    try {
      savePdf(await downloadStatementPdf(s.id, s.reference));
    } catch (e) {
      setRowError(e instanceof Error ? e.message : 'Téléchargement impossible.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] p-6 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
            <p className="text-sm text-gray-500">Relevés de compte générés</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={load} disabled={loading} title="Actualiser"
            className="p-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button type="button" onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-[#2E7D32] to-[#1B5E20] shadow-md hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" /> Nouveau relevé
          </button>
        </div>
      </div>

      {/* Erreurs */}
      {(error || rowError) && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{error ?? rowError}</span>
          {error && (
            <button type="button" onClick={load} className="text-xs font-semibold underline hover:no-underline">
              Réessayer
            </button>
          )}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-100">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="N° compte, membre, référence…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#DDEAD5] focus:border-[#2E7D32]" />
          </div>
          <span className="text-xs text-gray-500 shrink-0">
            <span className="font-semibold text-gray-700">{filtered.length}</span> relevé{filtered.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Compte / Membre</th>
                <th className="px-4 py-3">Période</th>
                <th className="px-4 py-3 text-right">Solde final</th>
                <th className="px-4 py-3">Généré par</th>
                <th className="px-4 py-3">Généré le</th>
                <th className="px-4 py-3 text-right">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Chargement…
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <p className="text-sm font-medium text-gray-700">Aucun relevé</p>
                  <p className="text-xs text-gray-400 mt-1">Cliquez sur « Nouveau relevé » pour en générer un.</p>
                </td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="hover:bg-[#F9F9F6]">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{s.reference}</td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-semibold text-[#7a1f1f]">{s.account_number}</p>
                    <p className="text-xs text-gray-500">{s.member_name ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {formatDate(s.date_debut)} → {formatDate(s.date_fin)}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${
                    s.solde_final > 0 ? 'text-[#2E7D32]' : s.solde_final < 0 ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {formatHTG(s.solde_final)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.genere_par_nom}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{formatDate(s.created_at)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button type="button" onClick={() => handlePreview(s)}
                      disabled={!s.hasPdf || previewing === s.id}
                      title={s.hasPdf ? 'Voir le relevé' : 'PDF indisponible'}
                      className="p-2 rounded-lg text-gray-500 hover:text-[#2E7D32] hover:bg-[#DDEAD5] disabled:text-gray-300 disabled:hover:bg-transparent">
                      {previewing === s.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Eye className="w-4 h-4" />}
                    </button>
                    <button type="button" onClick={() => handleDownload(s)}
                      disabled={!s.hasPdf || downloading === s.id}
                      title={s.hasPdf ? 'Télécharger le PDF' : 'PDF indisponible'}
                      className="p-2 rounded-lg text-[#2E7D32] hover:bg-[#DDEAD5] disabled:text-gray-300 disabled:hover:bg-transparent">
                      {downloading === s.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Download className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {preview && (
        <Modal
          isOpen
          onClose={closePreview}
          size="4xl"
          title={
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Relevé de compte</h2>
                <p className="text-xs text-gray-400 font-mono">{preview.title}</p>
              </div>
              <button type="button" onClick={() => savePdf(preview.file)}
                className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-linear-to-r from-[#2E7D32] to-[#1B5E20] hover:shadow-md">
                <Download className="w-3.5 h-3.5" /> Télécharger
              </button>
            </div>
          }
        >
          <iframe src={preview.url} title={preview.title} className="w-full h-[75vh] rounded-b-2xl" />
        </Modal>
      )}

      {showModal && (
        <GenerateStatementModal
          onClose={() => setShowModal(false)}
          onGenerated={load}
        />
      )}
    </div>
  );
}