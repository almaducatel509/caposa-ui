'use client';

import React from 'react';
import {
  ArrowLeft, Clock, CheckCircle2, AlertTriangle,
  Lock, FileText, Printer, TrendingUp, BarChart3,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props { archiveId?: string; }

const C = { green: '#2E7D32', greenDark: '#1B5E20', greenPale: '#DDEAD5', blue: '#355C7D', gold: '#D4AF37' };

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' HTG';
}
function formatPct(n: number) { return n.toFixed(1) + ' %'; }
function formatDateTime(d: Date) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

type ReportStatus = 'conforme' | 'a_surveiller' | 'critique';
const STATUS_CFG: Record<ReportStatus, { label: string; bg: string; border: string; text: string; icon: React.ElementType }> = {
  conforme:     { label: 'Conforme',     bg: C.greenPale, border: '#DDEAD5', text: C.greenDark, icon: CheckCircle2  },
  a_surveiller: { label: 'À surveiller', bg: '#FEF9EC',   border: '#FDE68A', text: '#B45309',   icon: AlertTriangle },
  critique:     { label: 'Critique',     bg: '#FEF2F2',   border: '#FCA5A5', text: '#B91C1C',   icon: AlertTriangle },
};

export default function ArchiveDetailRapport({ archiveId = 'ARC_20260201_00002' }: Props) {
  const router = useRouter();

  const archive = {
    id: 'ARC_20260201_00002', category: 'Réglementaire', type: 'Rapport de liquidité',
    date: new Date('2026-02-01'), createdAt: new Date('2026-02-01T09:00:00'),
    periode: 'Janvier 2026', isLocked: true,
    summary: 'Rapport de liquidité — Janvier 2026 — Statut : Conforme',
    reportData: {
      liquiditeDisponible: 1200000, totalDepotsMembres: 6500000, ratioLiquidite: 18.5,
      evolutionTrimestre: 2.3, evolutionMensuelle: 0.8,
      seuilMinimal: 15, seuilOptimal: 20,
      status: 'conforme' as ReportStatus,
      liquiditeDetail: { cashEnCaisse: 450000, comptesBancaires: 750000 },
      recommendations: [
        'Maintenir le niveau actuel de liquidité.',
        "Surveiller l'évolution des dépôts dans les 30 prochains jours.",
        'Pas d\'action corrective nécessaire.',
      ],
      historique: [
        { mois: 'Novembre 2025', ratio: 16.8, status: 'conforme' as ReportStatus },
        { mois: 'Décembre 2025', ratio: 17.2, status: 'conforme' as ReportStatus },
        { mois: 'Janvier 2026',  ratio: 18.5, status: 'conforme' as ReportStatus },
      ],
    },
    regulatoryMetadata: {
      reportingAuthority:   "Banque de la République d'Haïti (BRH)",
      regulatoryFramework:  'Directive microfinance 2024-03',
      submissionDeadline:   new Date('2026-02-15'),
      submittedAt:          new Date('2026-02-01T09:00:00'),
      submittedBy:          'Système automatique',
      validatedBy:          'Marie Tremblay',
      validatedAt:          new Date('2026-02-01T14:30:00'),
    },
  };

  const sc = STATUS_CFG[archive.reportData.status];
  const StatusIcon = sc.icon;

  // TODO: handleExportPDF — appel API génération PDF officiel BRH
  const handleExportPDF = () => { console.log('Export PDF rapport:', archive.id); };
  const handlePrint     = () => { window.print(); };

  return (
    <div className="min-h-screen bg-[#F9F9F6] p-6 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-5">

        {/* Retour */}
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-[#355C7D] hover:text-[#1E3A5F] text-sm font-semibold transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Retour aux archives
        </button>

        {/* Header carte */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-[#2E7D32]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{archive.type}</h1>
                <p className="text-xs font-mono text-gray-500 mt-0.5">#{archive.id} · {archive.periode}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {archive.isLocked && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] rounded-xl">
                  <Lock className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600">Verrouillée</span>
                </div>
              )}
              <button onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-[#F9F9F6] transition-colors">
                <Printer className="w-4 h-4" /> Imprimer
              </button>
              <button onClick={handleExportPDF}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold hover:shadow-md transition-all">
                <FileText className="w-4 h-4" /> Export PDF
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            {[
              { label: 'Catégorie',       value: archive.category },
              { label: 'Période',         value: archive.periode  },
              { label: 'Généré le',       value: archive.date.toLocaleDateString('fr-FR') },
              { label: 'Archive créée le',value: formatDateTime(archive.createdAt) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-xs font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Statut conformité */}
        <div className="rounded-2xl border-2 p-5 flex items-center justify-between"
          style={{ backgroundColor: sc.bg, borderColor: sc.border }}>
          <div className="flex items-center gap-3">
            <StatusIcon className="w-7 h-7 shrink-0" style={{ color: sc.text }} />
            <div>
              <p className="text-base font-bold" style={{ color: sc.text }}>Statut : {sc.label}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Le ratio de liquidité est {archive.reportData.status === 'conforme' ? 'conforme' : 'non conforme'} aux exigences réglementaires.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500">Ratio actuel</p>
            <p className="text-3xl font-bold mt-0.5" style={{ color: sc.text }}>{formatPct(archive.reportData.ratioLiquidite)}</p>
          </div>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Liquidité disponible */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Liquidité disponible</p>
            <p className="text-2xl font-bold text-[#355C7D]">{formatHTG(archive.reportData.liquiditeDisponible)}</p>
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Cash en caisse</span>
                <span className="font-semibold">{formatHTG(archive.reportData.liquiditeDetail.cashEnCaisse)}</span>
              </div>
              <div className="flex justify-between">
                <span>Comptes bancaires</span>
                <span className="font-semibold">{formatHTG(archive.reportData.liquiditeDetail.comptesBancaires)}</span>
              </div>
            </div>
          </div>

          {/* Total dépôts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Total dépôts membres</p>
            <p className="text-2xl font-bold text-[#2E7D32]">{formatHTG(archive.reportData.totalDepotsMembres)}</p>
            <p className="text-xs text-gray-400 mt-1">Engagements envers les membres</p>
          </div>

          {/* Ratio */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Ratio de liquidité</p>
            <p className="text-2xl font-bold text-[#2E7D32]">{formatPct(archive.reportData.ratioLiquidite)}</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Min : {formatPct(archive.reportData.seuilMinimal)}</span>
                <span>Optimal : {formatPct(archive.reportData.seuilOptimal)}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#2E7D32]"
                  style={{ width: `${Math.min((archive.reportData.ratioLiquidite / archive.reportData.seuilOptimal) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-[#2E7D32]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{formatPct(archive.reportData.evolutionTrimestre)} sur 3 mois</span>
            </div>
          </div>
        </div>

        {/* Historique */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-4">Évolution historique (3 derniers mois)</p>
          <div className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] rounded-xl border border-gray-100 px-4 py-3 mb-2">
            <div className="grid grid-cols-4 gap-3 text-xs font-bold uppercase tracking-widest text-gray-500">
              <div>Mois</div>
              <div className="text-center">Ratio</div>
              <div className="text-center">Statut</div>
              <div className="text-center">Tendance</div>
            </div>
          </div>
          {archive.reportData.historique.map((row, i) => {
            const prev = i > 0 ? archive.reportData.historique[i - 1].ratio : null;
            const evo  = prev ? row.ratio - prev : null;
            const rowSc = STATUS_CFG[row.status];
            const RowIcon = rowSc.icon;
            return (
              <div key={i} className="grid grid-cols-4 gap-3 items-center px-4 py-3 rounded-xl mb-1.5 bg-[#F9F9F6] border border-gray-100">
                <p className="text-xs font-semibold text-gray-800">{row.mois}</p>
                <p className="text-center text-sm font-bold text-[#2E7D32]">{formatPct(row.ratio)}</p>
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold"
                    style={{ backgroundColor: rowSc.bg, color: rowSc.text }}>
                    <RowIcon className="w-3 h-3" />{rowSc.label}
                  </span>
                </div>
                <p className="text-center text-xs font-bold">
                  {evo != null && (
                    <span style={{ color: evo > 0 ? C.green : evo < 0 ? '#EF4444' : '#6B7280' }}>
                      {evo > 0 ? '↗' : evo < 0 ? '↘' : '→'} {evo !== 0 ? formatPct(Math.abs(evo)) : ''}
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>

        {/* Recommandations */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-3">Recommandations</p>
          <div className="flex flex-col gap-2">
            {archive.reportData.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#DDEAD5] flex items-center justify-center shrink-0 text-[#1B5E20] font-bold text-xs">{i + 1}</div>
                <p className="text-xs text-gray-700 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Métadonnées réglementaires */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-4">Informations réglementaires</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col gap-3">
              {[
                { label: 'Autorité de contrôle', value: archive.regulatoryMetadata.reportingAuthority },
                { label: 'Cadre réglementaire',  value: archive.regulatoryMetadata.regulatoryFramework },
                { label: 'Date limite',           value: archive.regulatoryMetadata.submissionDeadline.toLocaleDateString('fr-FR') },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-gray-400 mb-0.5">{label}</p>
                  <p className="font-semibold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-gray-400 mb-0.5">Soumis le</p>
                <p className="font-semibold text-gray-800">{formatDateTime(archive.regulatoryMetadata.submittedAt)}</p>
                <p className="text-gray-400 mt-0.5">Par : {archive.regulatoryMetadata.submittedBy}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Validé le</p>
                <p className="font-semibold text-gray-800">{formatDateTime(archive.regulatoryMetadata.validatedAt)}</p>
                <p className="text-gray-400 mt-0.5">Par : {archive.regulatoryMetadata.validatedBy}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Traçabilité */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#355C7D]" />
            <p className="text-sm font-bold text-gray-800">Traçabilité complète</p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { initiale: '🤖', label: 'Génération automatique', sub: `Le ${formatDateTime(archive.createdAt)} par le système`, color: C.blue  },
              { initiale: archive.regulatoryMetadata.validatedBy.charAt(0), label: `Validé par ${archive.regulatoryMetadata.validatedBy}`, sub: `Le ${formatDateTime(archive.regulatoryMetadata.validatedAt)}`, color: C.green },
            ].map(({ initiale, label, sub, color }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ backgroundColor: color + '0D', borderColor: color + '33' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
                  style={{ backgroundColor: color }}>
                  {initiale}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Immuabilité */}
        <div className="p-4 rounded-2xl border-2 bg-[#FEF2F2] border-[#FCA5A5]">
          <div className="flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#B91C1C] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#B91C1C] mb-1">Rapport réglementaire officiel — Archive immuable</p>
              <ul className="flex flex-col gap-1 text-xs text-[#B91C1C]">
                <li>• Ce rapport a été généré automatiquement et validé par un superviseur.</li>
                <li>• Il fait partie des obligations réglementaires vis-à-vis de la BRH.</li>
                <li>• Aucune modification n'est possible — l'archive est définitivement verrouillée.</li>
                <li>• Ce document fait foi en cas d'inspection ou d'audit externe.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}