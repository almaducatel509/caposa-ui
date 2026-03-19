// app/dashboard/rapports/page.tsx
// Table centrale de tous les rapports générés — Vue d'ensemble, Voir, Archiver.
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, Plus, Eye, Archive, Lock, Filter,
  CheckCircle2, AlertTriangle, X, Loader2, Clock,
  ChevronDown,
} from 'lucide-react';
import {
  RapportGenere, RapportType, RapportPeriodeType,
  TYPE_LABELS, STATUT_CFG, ETAT_CFG,
  estArchivable, raisonNonArchivable,
  periodesMensuelles, periodesTrimestrielles, periodeAnnuelle,
} from '@/types/rapports';
import { generateMockRapports } from '@/app/lib/mockRapports';

// ─── Modal archivage ──────────────────────────────────────────────────────────
function ModalArchivage({ rapport, onConfirm, onClose }: {
  rapport:   RapportGenere;
  onConfirm: () => void;
  onClose:   () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700)); // TODO: PATCH /api/rapports/:id/archiver
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EBF2F8] flex items-center justify-center shrink-0">
              <Archive className="w-5 h-5 text-[#355C7D]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Archiver le rapport</p>
              <p className="text-xs text-gray-500">Cette action est irréversible</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="p-3 rounded-xl border border-gray-100 bg-white">
            <p className="text-xs font-semibold text-gray-500 mb-1">Rapport concerné</p>
            <p className="text-xs font-semibold text-gray-800">{TYPE_LABELS[rapport.type]}</p>
            <p className="text-xs text-gray-500 mt-0.5">{rapport.periode.label} · Généré le {rapport.genereLeDate.toLocaleDateString('fr-FR')}</p>
          </div>

          <div className="p-3 rounded-xl border border-[#BFDBFE] bg-[#EBF2F8]">
            <p className="text-xs text-[#355C7D] leading-relaxed">
              Le rapport sera figé en lecture seule et déplacé dans les archives. Il restera consultable indéfiniment pour les audits BRH.
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button onClick={handle} disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-[#355C7D] to-[#1E3A5F] text-white text-sm font-semibold hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Archivage…</>
                : <><Archive className="w-4 h-4" /> Confirmer l'archivage</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal génération nouveau rapport ─────────────────────────────────────────
function ModalGeneration({ onConfirm, onClose }: {
  onConfirm: (type: RapportType, periodeLabel: string, periodeType: RapportPeriodeType) => void;
  onClose:   () => void;
}) {
  const [type,         setType]         = useState<RapportType>('liquidite');
  const [periodeType,  setPeriodeType]  = useState<RapportPeriodeType>('mensuel');
  const [periodeLabel, setPeriodeLabel] = useState('');
  const [loading,      setLoading]      = useState(false);

  const optionsPeriodes = useMemo(() => {
    const now = new Date();
    if (periodeType === 'mensuel')      return periodesMensuelles(now.getFullYear()).map(p => p.label);
    if (periodeType === 'trimestriel')  return periodesTrimestrielles(now.getFullYear()).map(p => p.label);
    return [periodeAnnuelle(now.getFullYear() - 1).label, periodeAnnuelle(now.getFullYear()).label];
  }, [periodeType]);

  const handle = async () => {
    if (!periodeLabel) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // TODO: POST /api/rapports
    onConfirm(type, periodeLabel, periodeType);
  };

  const selectCls = "w-full px-4 py-2 rounded-xl border border-gray-200 bg-[#F9F9F6] text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Générer un rapport</p>
              <p className="text-xs text-gray-500">Superviseur uniquement</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Type */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">
              Type de rapport
            </label>
            <select value={type} onChange={e => setType(e.target.value as RapportType)} className={selectCls}>
              {(Object.entries(TYPE_LABELS) as [RapportType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Périodicité */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">
              Périodicité
            </label>
            <div className="flex gap-2">
              {(['mensuel', 'trimestriel', 'annuel'] as RapportPeriodeType[]).map(p => (
                <button key={p} onClick={() => { setPeriodeType(p); setPeriodeLabel(''); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    periodeType === p
                      ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-[#DDEAD5]/20'
                  }`}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Période */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">
              Période <span className="text-[#EF4444]">*</span>
            </label>
            <select value={periodeLabel} onChange={e => setPeriodeLabel(e.target.value)} className={selectCls}>
              <option value="">Sélectionner une période…</option>
              {optionsPeriodes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="p-3 rounded-xl border border-[#FDE68A] bg-[#FEF9EC]">
            <p className="text-xs text-[#B45309]">
              Le rapport sera généré avec les données actuelles de la caisse pour la période sélectionnée.
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button onClick={handle} disabled={!periodeLabel || loading}
              className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération…</>
                : <><Plus className="w-4 h-4" /> Générer</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function RapportsTablePage() {
  const router = useRouter();

  const [rapports,       setRapports]       = useState<RapportGenere[]>(generateMockRapports);
  const [filtreType,     setFiltreType]      = useState<RapportType | 'all'>('all');
  const [filtreEtat,     setFiltreEtat]      = useState<'all' | 'actif' | 'archive'>('all');
  const [filtrePeriode,  setFiltrePeriode]   = useState<RapportPeriodeType | 'all'>('all');
  const [archiveCible,   setArchiveCible]    = useState<RapportGenere | null>(null);
  const [showGeneration, setShowGeneration]  = useState(false);

  const filtered = useMemo(() => rapports.filter(r => {
    if (filtreType    !== 'all' && r.type             !== filtreType)    return false;
    if (filtreEtat    !== 'all' && r.etat             !== filtreEtat)    return false;
    if (filtrePeriode !== 'all' && r.periode.type     !== filtrePeriode) return false;
    return true;
  }), [rapports, filtreType, filtreEtat, filtrePeriode]);

  const stats = useMemo(() => ({
    total:    rapports.length,
    actifs:   rapports.filter(r => r.etat === 'actif').length,
    archives: rapports.filter(r => r.etat === 'archive').length,
    nonConformes: rapports.filter(r => r.etat === 'actif' && (r.statut === 'non_conforme' || r.statut === 'critique')).length,
  }), [rapports]);

  const handleArchiver = () => {
    if (!archiveCible) return;
    // TODO: PATCH /api/rapports/:id/archiver
    setRapports(prev => prev.map(r =>
      r.id !== archiveCible.id ? r : {
        ...r, etat: 'archive', archiveLe: new Date(), archivePar: 'Utilisateur actuel',
      }
    ));
    setArchiveCible(null);
  };

  const handleGenerer = (type: RapportType, periodeLabel: string, periodeType: RapportPeriodeType) => {
    // TODO: POST /api/rapports — le serveur génère le rapport avec les vraies données
    const now  = new Date();
    const year = now.getFullYear();
    const periodes =
      periodeType === 'mensuel'     ? periodesMensuelles(year) :
      periodeType === 'trimestriel' ? periodesTrimestrielles(year) :
      [periodeAnnuelle(year - 1), periodeAnnuelle(year)];
    const periode = periodes.find(p => p.label === periodeLabel) ?? periodes[0];

    const valeurs = { liquidite: 16.2, solvabilite: 12.1, portefeuille: 3.8, endettement: 31.5, conformite: 6 };
    const nouveau: RapportGenere = {
      id:            `RPT-NEW-${Date.now()}`,
      type,
      periode,
      genereLeDate:  now,
      generePar:     'Utilisateur actuel',
      genereParRole: 'Superviseur',
      statut:        'conforme',
      etat:          'actif',
      kpiSnapshot: {
        label:            type === 'liquidite' ? 'Ratio de liquidité' : type,
        unite:            type === 'conformite' ? '/7' : '%',
        valeurPrincipale: valeurs[type],
      },
    };
    setRapports(prev => [nouveau, ...prev]);
    setShowGeneration(false);
  };

  const handleVoir = (rapport: RapportGenere) => {
    // TODO: Route vers la page de détail du rapport avec l'ID
    router.push(`/dashboard/rapports/${rapport.type}?id=${rapport.id}&periode=${encodeURIComponent(rapport.periode.label)}`);
  };

  const selectCls = "px-3 py-1.5 rounded-xl border border-gray-200 bg-[#F9F9F6] text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]";

  return (
    <div className="min-h-screen bg-[#F9F9F6] p-6 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Rapports Réglementaires</h1>
                <p className="text-sm text-gray-500 mt-0.5">Documents périodiques — conformité BRH</p>
              </div>
            </div>
            <button onClick={() => setShowGeneration(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all shrink-0">
              <Plus className="w-4 h-4" /> Générer un rapport
            </button>
          </div>
        </div>

        {/* ── KPIs ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total rapports',  value: stats.total,        accent: '#355C7D', bg: '#EBF2F8' },
            { label: 'Actifs',          value: stats.actifs,       accent: '#2E7D32', bg: '#DDEAD5' },
            { label: 'Archivés',        value: stats.archives,     accent: '#6B7280', bg: '#F3F4F6' },
            { label: 'Non conformes',   value: stats.nonConformes, accent: stats.nonConformes > 0 ? '#B91C1C' : '#2E7D32', bg: stats.nonConformes > 0 ? '#FEF2F2' : '#DDEAD5' },
          ].map(({ label, value, accent, bg }) => (
            <div key={label} className="rounded-2xl border border-gray-100 p-5 shadow-sm"
              style={{ backgroundColor: bg }}>
              <p className="text-2xl font-bold" style={{ color: accent }}>{value}</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Filtres ────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <Filter className="w-3.5 h-3.5" /> Filtres
            </div>
            <select value={filtreType} onChange={e => setFiltreType(e.target.value as any)} className={selectCls}>
              <option value="all">Tous les types</option>
              {(Object.entries(TYPE_LABELS) as [RapportType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select value={filtrePeriode} onChange={e => setFiltrePeriode(e.target.value as any)} className={selectCls}>
              <option value="all">Toutes les périodes</option>
              <option value="mensuel">Mensuel</option>
              <option value="trimestriel">Trimestriel</option>
              <option value="annuel">Annuel</option>
            </select>
            <select value={filtreEtat} onChange={e => setFiltreEtat(e.target.value as any)} className={selectCls}>
              <option value="all">Tous les états</option>
              <option value="actif">Actifs</option>
              <option value="archive">Archivés</option>
            </select>
            {(filtreType !== 'all' || filtreEtat !== 'all' || filtrePeriode !== 'all') && (
              <button onClick={() => { setFiltreType('all'); setFiltreEtat('all'); setFiltrePeriode('all'); }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-3 h-3" /> Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Header colonnes */}
          <div className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-100 px-5 py-3">
            <div className="grid grid-cols-12 gap-3 text-xs font-bold uppercase tracking-widest text-gray-500">
              <div className="col-span-3">Type de rapport</div>
              <div className="col-span-2">Période</div>
              <div className="col-span-2">Généré le</div>
              <div className="col-span-1">KPI principal</div>
              <div className="col-span-1">Statut</div>
              <div className="col-span-1">État</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>
          </div>

          {/* Lignes */}
          <div className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
                  <FileText className="w-7 h-7 text-[#2E7D32]" />
                </div>
                <p className="text-sm font-semibold text-gray-600">Aucun rapport trouvé</p>
                <p className="text-xs text-gray-400">Modifiez les filtres ou générez un nouveau rapport.</p>
              </div>
            ) : (
              filtered.map((rapport, idx) => {
                const sc      = STATUT_CFG[rapport.statut];
                const ec      = ETAT_CFG[rapport.etat];
                const peutArchiver = estArchivable(rapport);
                const raisonNA    = raisonNonArchivable(rapport);
                const archive     = rapport.etat === 'archive';

                return (
                  <div key={rapport.id}
                    className={`grid grid-cols-12 gap-3 items-center px-5 py-4 transition-all ${
                      archive
                        ? 'bg-[#F9F9F6]/60 opacity-75'
                        : idx % 2 === 0 ? 'bg-white hover:bg-[#F9F9F6]' : 'bg-[#F9F9F6]/30 hover:bg-[#F9F9F6]'
                    }`}>

                    {/* Type */}
                    <div className="col-span-3">
                      <p className="text-xs font-semibold text-gray-800">{TYPE_LABELS[rapport.type]}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">{rapport.id}</p>
                    </div>

                    {/* Période */}
                    <div className="col-span-2">
                      <p className="text-xs font-semibold text-gray-700">{rapport.periode.label}</p>
                      <p className="text-xs text-gray-400 capitalize">{rapport.periode.type}</p>
                    </div>

                    {/* Généré le */}
                    <div className="col-span-2">
                      <p className="text-xs font-semibold text-gray-700">
                        {rapport.genereLeDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{rapport.generePar}</p>
                    </div>

                    {/* KPI principal */}
                    <div className="col-span-1">
                      <p className="text-xs font-bold text-gray-800">
                        {rapport.kpiSnapshot.valeurPrincipale.toFixed(1)}{rapport.kpiSnapshot.unite}
                      </p>
                      <p className="text-xs text-gray-400 leading-tight">{rapport.kpiSnapshot.label}</p>
                    </div>

                    {/* Statut */}
                    <div className="col-span-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold"
                        style={{ backgroundColor: sc.bg, color: sc.text }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sc.dot }} />
                        {sc.label}
                      </span>
                    </div>

                    {/* État */}
                    <div className="col-span-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: ec.bg, color: ec.text }}>
                        {rapport.etat === 'archive' && <Lock className="w-3 h-3 shrink-0" />}
                        {ec.label}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      {/* Voir */}
                      <button title="Consulter le rapport" onClick={() => handleVoir(rapport)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#EBF2F8] text-[#355C7D] hover:bg-[#BFDBFE]/40 transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Voir
                      </button>

                      {/* Archiver */}
                      {!archive && (
                        peutArchiver ? (
                          <button title="Archiver ce rapport" onClick={() => setArchiveCible(rapport)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20] hover:bg-[#c8e0bc] transition-colors">
                            <Archive className="w-3.5 h-3.5" /> Archiver
                          </button>
                        ) : (
                          <div className="relative group/arch">
                            <button disabled title={raisonNA}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-400 cursor-not-allowed">
                              <Clock className="w-3.5 h-3.5" /> Archiver
                            </button>
                            <div className="absolute right-0 bottom-full mb-2 w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded-xl opacity-0 group-hover/arch:opacity-100 transition-opacity pointer-events-none z-10 leading-relaxed">
                              {raisonNA}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 bg-[#F9F9F6] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-600">{filtered.length}</span> rapport{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Lock className="w-3.5 h-3.5" />
              Les rapports archivés sont en lecture seule — conformité BRH
            </div>
          </div>
        </div>
      </div>

      {/* ── Modales ─────────────────────────────────────────────────────────── */}
      {archiveCible && (
        <ModalArchivage
          rapport={archiveCible}
          onConfirm={handleArchiver}
          onClose={() => setArchiveCible(null)}
        />
      )}
      {showGeneration && (
        <ModalGeneration
          onConfirm={handleGenerer}
          onClose={() => setShowGeneration(false)}
        />
      )}
    </div>
  );
}