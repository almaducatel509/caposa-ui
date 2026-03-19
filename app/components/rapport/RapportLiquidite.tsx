// app/components/rapports/RapportLiquidite.tsx
'use client';

import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import ReportDocument, {
  ReportRow, ReportDivider, ReportStatusBox, ReportActionPlan,
} from './ReportDocument';
import { KpiData, formatHTG, formatPct } from '@/types/kpis';

interface Props {
  data:             KpiData;
  onRetour?:        () => void;
  objectif?:        string;
  periodeAnalysee?: string;
}

// ─── Mock détail disponibilités ───────────────────────────────────────────────
// TODO: En prod, ces champs viennent de GET /api/tresorerie/liquidite?periode=...
interface DetailDisponibilites {
  cashEnCaisse:    number;
  comptesBancaires:number;
  autresLiquidites:number;
}

interface DetailDepots {
  depotsAVue:   number;
  depotsATerme: number;
  comptesEpargne:number;
}

interface PointHistorique {
  mois:  string;
  ratio: number;
}

function getMockDetail(liquiditeDisponible: number): DetailDisponibilites {
  return {
    cashEnCaisse:     liquiditeDisponible * 0.37,
    comptesBancaires: liquiditeDisponible * 0.58,
    autresLiquidites: liquiditeDisponible * 0.05,
  };
}

function getMockDepots(totalDepots: number): DetailDepots {
  return {
    depotsAVue:    totalDepots * 0.45,
    depotsATerme:  totalDepots * 0.30,
    comptesEpargne:totalDepots * 0.25,
  };
}

function getMockHistorique(ratioActuel: number): PointHistorique[] {
  return [
    { mois: 'Nov 2025', ratio: ratioActuel - 1.7 },
    { mois: 'Déc 2025', ratio: ratioActuel - 0.9 },
    { mois: 'Jan 2026', ratio: ratioActuel        },
  ];
}

// ─── Mini sparkline SVG ───────────────────────────────────────────────────────
function Sparkline({ points, seuilMinimal }: { points: PointHistorique[]; seuilMinimal: number }) {
  const vals   = points.map(p => p.ratio);
  const minVal = Math.min(...vals, seuilMinimal) - 1;
  const maxVal = Math.max(...vals) + 1;
  const range  = maxVal - minVal;
  const w = 240; const h = 60; const pad = 8;

  const toX = (i: number) => pad + (i / (points.length - 1)) * (w - pad * 2);
  const toY = (v: number) => h - pad - ((v - minVal) / range) * (h - pad * 2);

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.ratio)}`).join(' ');
  const seuilY   = toY(seuilMinimal);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 60 }}>
      {/* Ligne seuil */}
      <line x1={pad} y1={seuilY} x2={w - pad} y2={seuilY}
        stroke="#EF4444" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
      <text x={w - pad + 2} y={seuilY + 4} fontSize="7" fill="#EF4444" opacity="0.8">
        {seuilMinimal} %
      </text>

      {/* Courbe */}
      <path d={linePath} fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(p.ratio)} r="3.5" fill="#2E7D32" />
          <text x={toX(i)} y={toY(p.ratio) - 6} textAnchor="middle" fontSize="7" fill="#1B5E20" fontWeight="600">
            {p.ratio.toFixed(1)} %
          </text>
          <text x={toX(i)} y={h - 1} textAnchor="middle" fontSize="7" fill="#9CA3AF">
            {p.mois}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── Barre de proportion ──────────────────────────────────────────────────────
function BarreRepartition({ label, montant, total, color }: {
  label: string; montant: number; total: number; color: string;
}) {
  const pct = total > 0 ? (montant / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 shrink-0">
        <p className="text-xs text-gray-600 truncate">{label}</p>
      </div>
      <div className="flex-1 h-5 bg-gray-100 rounded-lg overflow-hidden relative">
        <div className="h-full rounded-lg transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }} />
        <span className="absolute right-2 top-0 bottom-0 flex items-center text-xs font-semibold text-gray-700">
          {formatHTG(montant)}
        </span>
      </div>
      <span className="text-xs font-bold w-10 text-right" style={{ color }}>
        {pct.toFixed(0)} %
      </span>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function RapportLiquidite({ data, onRetour, objectif, periodeAnalysee }: Props) {
  // ── Calculs ─────────────────────────────────────────────────────────────────
  const ratio           = (data.liquiditeDisponible / data.totalDepotsMembres) * 100;
  const seuilMinimal    = 15;   // % — réglementation BRH microfinance
  const seuilAlerte     = 16.5; // % — zone d'attention avant d'approcher le seuil
  const margeSecurite   = ratio - seuilMinimal;
  const estProcheSeuil  = ratio < seuilAlerte && ratio >= seuilMinimal;

  const detail    = getMockDetail(data.liquiditeDisponible);  // TODO: API
  const depots    = getMockDepots(data.totalDepotsMembres);   // TODO: API
  const historique= getMockHistorique(ratio);                  // TODO: API

  // ── Statut ──────────────────────────────────────────────────────────────────
  const statut      = ratio >= seuilMinimal ? 'Conforme' : ratio >= 10 ? 'À surveiller' : 'Critique';
  const messageType = ratio >= seuilMinimal ? 'success'  : ratio >= 10 ? 'warning'      : 'error';
  const message =
    ratio >= seuilMinimal
      ? `La caisse dispose d'une liquidité suffisante (${formatPct(ratio)}). Les réserves dépassent le seuil minimal de ${formatPct(seuilMinimal, 0)}.`
      : ratio >= 10
      ? `La liquidité est sous le seuil optimal de ${formatPct(seuilMinimal, 0)}. Renforcez les réserves liquides.`
      : `ATTENTION : Liquidité dangereusement basse (${formatPct(ratio)}). Actions immédiates requises.`;

  const handleExportPDF   = () => { console.log('TODO: POST /api/rapports/liquidite/export-pdf'); };
  const handleExportExcel = () => { console.log('TODO: POST /api/rapports/liquidite/export-excel'); };

  return (
    <ReportDocument
      titre="Rapport de Liquidité"
      periode={data.periode}
      periodeAnalysee={periodeAnalysee}
      objectif={objectif ?? 'Vérification conformité BRH'}
      statut={statut as any}
      onRetour={onRetour}
      onExportPDF={handleExportPDF}
      onExportExcel={handleExportExcel}
    >

      {/* ── 1. Résumé exécutif ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border-2 p-4 flex items-center justify-between gap-4"
        style={{
          backgroundColor: ratio >= seuilMinimal ? '#DDEAD5' : ratio >= 10 ? '#FEF9EC' : '#FEF2F2',
          borderColor:     ratio >= seuilMinimal ? '#DDEAD5' : ratio >= 10 ? '#FDE68A' : '#FCA5A5',
        }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Résumé exécutif</p>
          <p className="text-sm font-semibold text-gray-800">
            Liquidité {statut === 'Conforme' ? 'conforme' : 'non conforme'} — Ratio {formatPct(ratio)},
            seuil {formatPct(seuilMinimal, 0)},
            marge de sécurité&nbsp;:&nbsp;
            <span className="font-bold" style={{ color: margeSecurite >= 0 ? '#1B5E20' : '#B91C1C' }}>
              {margeSecurite >= 0 ? '+' : ''}{formatPct(margeSecurite)}
            </span>
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-3xl font-bold" style={{ color: ratio >= seuilMinimal ? '#1B5E20' : '#B91C1C' }}>
            {formatPct(ratio)}
          </p>
          <p className="text-xs text-gray-400">ratio actuel</p>
        </div>
      </div>

      {/* ── Alerte si proche du seuil ─────────────────────────────────────── */}
      {estProcheSeuil && (
        <div className="flex items-start gap-3 p-3 rounded-xl border-2 bg-[#FEF9EC] border-[#FDE68A]">
          <AlertTriangle className="w-4 h-4 text-[#B45309] mt-0.5 shrink-0" />
          <p className="text-xs font-semibold text-[#B45309]">
            Ratio proche du seuil réglementaire ({formatPct(ratio)} vs seuil {formatPct(seuilMinimal, 0)}).
            Surveiller attentivement les retraits et éviter de nouveaux décaissements importants.
          </p>
        </div>
      )}

      {/* ── 2. Données de base ───────────────────────────────────────────────── */}
      <div>
        <ReportRow
          label="Liquidité disponible"
          value={`${formatHTG(data.liquiditeDisponible)} (≈ ${(data.liquiditeDisponible / 1_000_000).toFixed(2)} M)`}
          description="Somme des disponibilités en caisse et en banque"
        />
        <ReportRow
          label="Total dépôts membres"
          value={`${formatHTG(data.totalDepotsMembres)} (≈ ${(data.totalDepotsMembres / 1_000_000).toFixed(2)} M)`}
          description="Montant total des dépôts à vue et à terme"
        />
        <ReportDivider />
        <ReportRow label="Ratio de liquidité" value={formatPct(ratio)} highlight />
        <ReportRow label="Seuil réglementaire BRH" value={formatPct(seuilMinimal, 0)} />
        <ReportRow
          label="Marge de sécurité"
          value={`${margeSecurite >= 0 ? '+' : ''}${formatPct(margeSecurite)}`}
        />
      </div>

      {/* ── 3. Détail des disponibilités ──────────────────────────────────────── */}
      <div className="bg-[#F9F9F6] rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
          <span className="w-4 h-px bg-gray-300" /> Détail des disponibilités
        </p>
        <div className="flex flex-col gap-3">
          <BarreRepartition label="Cash en caisse"     montant={detail.cashEnCaisse}     total={data.liquiditeDisponible} color="#2E7D32" />
          <BarreRepartition label="Comptes bancaires"  montant={detail.comptesBancaires}  total={data.liquiditeDisponible} color="#355C7D" />
          <BarreRepartition label="Autres liquidités"  montant={detail.autresLiquidites}  total={data.liquiditeDisponible} color="#D4AF37" />
        </div>
      </div>

      {/* ── 4. Détail des dépôts ──────────────────────────────────────────────── */}
      <div className="bg-[#F9F9F6] rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
          <span className="w-4 h-px bg-gray-300" /> Détail des dépôts membres
        </p>
        <div className="flex flex-col gap-3">
          <BarreRepartition label="Dépôts à vue"    montant={depots.depotsAVue}    total={data.totalDepotsMembres} color="#2E7D32" />
          <BarreRepartition label="Dépôts à terme"  montant={depots.depotsATerme}  total={data.totalDepotsMembres} color="#355C7D" />
          <BarreRepartition label="Comptes épargne" montant={depots.comptesEpargne}total={data.totalDepotsMembres} color="#D4AF37" />
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Les dépôts à vue représentent la pression la plus immédiate sur la liquidité.
        </p>
      </div>

      {/* ── 5. Évolution 3 mois ───────────────────────────────────────────────── */}
      <div className="bg-[#F9F9F6] rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <span className="w-4 h-px bg-gray-300" /> Évolution du ratio (3 mois)
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-[#EF4444]" />
            Seuil réglementaire
          </div>
        </div>
        <Sparkline points={historique} seuilMinimal={seuilMinimal} />
        <div className="flex items-center gap-2 mt-3">
          {historique[historique.length - 1].ratio > historique[0].ratio
            ? <TrendingUp  className="w-4 h-4 text-[#2E7D32]" />
            : <TrendingDown className="w-4 h-4 text-[#EF4444]" />
          }
          <p className="text-xs text-gray-500">
            Tendance sur 3 mois :&nbsp;
            <span className="font-semibold" style={{
              color: historique[historique.length - 1].ratio > historique[0].ratio ? '#1B5E20' : '#B91C1C',
            }}>
              {historique[historique.length - 1].ratio > historique[0].ratio ? 'En hausse' : 'En baisse'}
            </span>
          </p>
        </div>
      </div>

      {/* ── 6. Interprétation ─────────────────────────────────────────────────── */}
      <ReportStatusBox status={messageType} message={message} />

      {/* ── 7. Actions si hors conformité ─────────────────────────────────────── */}
      {statut !== 'Conforme' && (
        <ReportActionPlan
          titre="Actions recommandées"
          variant={statut === 'Critique' ? 'error' : 'warning'}
          actions={
            statut === 'Critique'
              ? [
                  'Suspendre temporairement les nouveaux décaissements de prêts importants.',
                  'Mobiliser des lignes de crédit d\'urgence ou vendre des actifs liquides.',
                  'Intensifier le recouvrement des prêts en cours.',
                ]
              : [
                  'Augmenter progressivement les réserves liquides via l\'épargne.',
                  'Limiter les décaissements aux prêts prioritaires.',
                  'Surveiller quotidiennement l\'évolution de la trésorerie.',
                ]
          }
        />
      )}

      {/* ── 8. Note méthodologique ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#BFDBFE] bg-[#EBF2F8] p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#355C7D] mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-bold text-[#1E3A5F] mb-1">Comment ce ratio est calculé</p>
          <p className="text-xs text-[#355C7D] leading-relaxed">
            Ratio de liquidité = Liquidités disponibles ÷ Total dépôts membres × 100.
            Les liquidités disponibles comprennent le cash en caisse, les soldes bancaires
            et les autres disponibilités immédiates. Le seuil de {formatPct(seuilMinimal, 0)} est
            imposé par la réglementation BRH pour garantir la capacité de la caisse à honorer
            les retraits immédiats de ses membres.
          </p>
        </div>
      </div>

    </ReportDocument>
  );
}