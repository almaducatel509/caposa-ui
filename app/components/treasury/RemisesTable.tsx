'use client';
import React, { useState } from 'react';
import { Clock, Archive, ShieldAlert, Check, X, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import AnomalieModal from './AnomalieModal';
import { Remise, Decision, AnomalieDecision } from '@/types/remise';
import { MOCK_REMISES_ARCHIVED, MOCK_REMISES_PENDING } from '@/app/lib/api/treasury.mock';
// ─── Source de vérité unique ──────────────────────────────────────────────────
// Quand l'API est prête, remplacer ces imports par :
//   useEffect(() => {
//     fetch('/api/treasury/handovers?status=pending').then(r => r.json()).then(setPending);
//     fetch('/api/treasury/handovers?status=archived').then(r => r.json()).then(setArchived);
//   }, []);


// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('fr-HT', { maximumFractionDigits: 0 }).format(n) + ' G';

const Avatar: React.FC<{ initials: string; color?: 'green' | 'blue' }> = ({
  initials, color = 'green',
}) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
    color === 'green' ? 'bg-[#DDEAD5] text-[#1B5E20]' : 'bg-[#E3EAF5] text-[#1E3A5F]'
  }`}>
    {initials}
  </div>
);

const Tag: React.FC<{ color: 'amber' | 'red'; children: React.ReactNode }> = ({ color, children }) => (
  <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
    color === 'amber' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-700'
  }`}>
    {children}
  </span>
);

const AuditStep: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-1.5">
    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] shrink-0" />
    <span className="text-xs text-gray-400">{label}</span>
  </div>
);

const headerBase =
  'bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600';

// ─── Composant principal ──────────────────────────────────────────────────────
const RemisesTable: React.FC = () => {
  const [tab,      setTab]      = useState<'pending' | 'archived'>('pending');
  const [pending,  setPending]  = useState<Remise[]>(MOCK_REMISES_PENDING   );
  const [archived, setArchived] = useState<Remise[]>(MOCK_REMISES_ARCHIVED  );

  // Remise ouverte dans la modale anomalie (null = fermée)
  const [anomalieTarget, setAnomalieTarget] = useState<Remise | null>(null);
  // Ligne archive ouverte en expand
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  // ── Décision simple (sans anomalie) ─────────────────────────────────────
  const handleDecide = async (id: string, decision: Decision) => {
    // TODO API : await fetch(`/api/treasury/handovers/${id}/decide`, {
    //   method: 'POST', body: JSON.stringify({ decision }),
    // });
    const now  = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const item = pending.find(r => r.id === id);
    if (!item) return;
    const closed: Remise = { ...item, decision, decided_at: now, decided_by: 'Vous' };
    setPending(prev  => prev.filter(r => r.id !== id));
    setArchived(prev => [closed, ...prev]);
  };

  // ── Décision avec anomalie (depuis la modale) ────────────────────────────
  const handleAnomalieConfirm = async (
    id: string,
    decision: Decision,
    anomalie: AnomalieDecision,
  ) => {
    // TODO API : await fetch(`/api/treasury/handovers/${id}/decide`, {
    //   method: 'POST', body: JSON.stringify({ decision, anomalie }),
    // });
    const now  = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const item = pending.find(r => r.id === id);
    if (!item) return;
    const closed: Remise = { ...item, decision, decided_at: now, decided_by: 'Vous', anomalie_decision: anomalie };
    setPending(prev  => prev.filter(r => r.id !== id));
    setArchived(prev => [closed, ...prev]);
    setAnomalieTarget(null);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* ── Onglets ── */}
        <div className="flex border-b border-gray-100 px-1">
          {[
            { id: 'pending'  as const, label: 'En attente de validation', icon: <Clock    className="w-3.5 h-3.5" />, count: pending.length,  activeClass: 'border-yellow-500 text-yellow-800', badgeClass: 'bg-yellow-100 text-yellow-800' },
            { id: 'archived' as const, label: 'Archive & audit trail',    icon: <Archive  className="w-3.5 h-3.5" />, count: archived.length, activeClass: 'border-gray-500 text-gray-700',    badgeClass: 'bg-gray-100 text-gray-600'    },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm transition-all -mb-px border-b-2 whitespace-nowrap ${
                tab === t.id
                  ? `${t.activeClass} font-semibold`
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.icon}
              {t.label}
              {t.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                  tab === t.id ? t.badgeClass : 'bg-gray-100 text-gray-500'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Bannière archive ── */}
        {tab === 'archived' && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            Lecture seule — sessions clôturées avec audit trail complet
          </div>
        )}

        {/* ── En-têtes colonnes ── */}
        {tab === 'pending' ? (
          <div className={`${headerBase} grid grid-cols-[1.5fr_1.2fr_110px_1fr_110px_160px] gap-3`}>
            <span>Caissière</span>
            <span>Vérifié par</span>
            <span>Montant</span>
            <span>Session</span>
            <span>Statut</span>
            <span>Actions</span>
          </div>
        ) : (
          <div className={`${headerBase} grid grid-cols-[1.4fr_1.2fr_110px_1fr_1.5fr_130px] gap-3`}>
            <span>Caissière</span>
            <span>Vérifié par</span>
            <span>Montant</span>
            <span>Date</span>
            <span>Audit trail</span>
            <span>Décision</span>
          </div>
        )}

        {/* ── Lignes ── */}
        <div className="divide-y divide-gray-50">

          {/* Vide */}
          {tab === 'pending' && pending.length === 0 && (
            <div className="py-14 text-center text-sm text-gray-400">
              <Check className="w-8 h-8 mx-auto mb-2 text-[#2E7D32]" />
              Toutes les remises ont été traitées
            </div>
          )}

          {/* En attente */}
          {tab === 'pending' && pending.map(r => (
            <div
              key={r.id}
              className="grid grid-cols-[1.5fr_1.2fr_110px_1fr_110px_160px] gap-3 items-center px-5 py-3.5 hover:bg-[#FAFAF6] transition-colors"
            >
              {/* Caissière */}
              <div className="flex items-center gap-2.5">
                <Avatar initials={r.cashier.initials} color="green" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {r.cashier.name}
                    {r.anomaly     && <Tag color="amber">⚠ Anomalie</Tag>}
                    {r.late_days > 0 && <Tag color="red">{r.late_days}j retard</Tag>}
                  </p>
                  <p className="text-xs text-gray-400">{r.id}</p>
                </div>
              </div>

              {/* Vérifié par */}
              <div className="flex items-center gap-2.5">
                <Avatar initials={r.verified_by.initials} color="blue" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{r.verified_by.name}</p>
                  <p className="text-xs text-gray-400">Vérifié</p>
                </div>
              </div>

              {/* Montant */}
              <p className="text-[15px] font-bold text-[#2E7D32]">{fmt(r.amount)}</p>

              {/* Session */}
              <div>
                <p className="text-sm font-medium text-gray-800">{r.session_id}</p>
                <p className="text-xs text-gray-400">{r.date} · {r.time}</p>
              </div>

              {/* Statut */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF9EC] text-[#B45309]">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                En attente
              </span>

              {/* Actions — diverge selon anomalie */}
              <div className="flex items-center gap-2">
                {r.anomaly ? (
                  /* Remise avec anomalie → seul bouton : traiter l'anomalie */
                  <button
                    onClick={() => setAnomalieTarget(r)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-yellow-800 border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Traiter
                  </button>
                ) : (
                  /* Remise normale → Valider / Rejeter */
                  <>
                    <button
                      onClick={() => handleDecide(r.id, 'approved')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B5E20] border border-[#A7D1A2] hover:bg-[#DDEAD5] transition-colors"
                    >
                      <Check className="w-3 h-3" /> Valider
                    </button>
                    <button
                      onClick={() => handleDecide(r.id, 'rejected')}
                      className="p-1.5 rounded-lg text-red-700 border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Archive */}
          {tab === 'archived' && archived.map(r => {
            const isOpen = expandedId === r.id;
            return (
              <div key={r.id} className="border-b border-gray-50 last:border-0">

                {/* ── Ligne principale (cliquable) ── */}
                <div
                  onClick={() => toggleExpand(r.id)}
                  className={`grid grid-cols-[1.4fr_1.2fr_110px_1fr_1.5fr_130px] gap-3 items-center px-5 py-3.5 cursor-pointer transition-colors ${
                    isOpen ? 'bg-[#F5F9F3]' : 'hover:bg-[#FAFAF6]'
                  }`}
                >
                  {/* Caissière */}
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={r.cashier.initials} color="green" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{r.cashier.name}</p>
                      <p className="text-xs text-gray-400">{r.id} · {r.session_id}</p>
                    </div>
                  </div>

                  {/* Vérifié par */}
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={r.verified_by.initials} color="blue" />
                    <p className="text-sm text-gray-600">{r.verified_by.name}</p>
                  </div>

                  {/* Montant */}
                  <p className="text-[15px] font-bold text-[#2E7D32]">{fmt(r.amount)}</p>

                  {/* Date */}
                  <div>
                    <p className="text-sm font-medium text-gray-700">{r.date}</p>
                    <p className="text-xs text-gray-400">{r.time}</p>
                  </div>

                  {/* Audit trail résumé */}
                  <div className="space-y-1">
                    <AuditStep label={`Remise · ${r.time}`} />
                    <AuditStep label={`Vérif · ${r.verified_by.name}`} />
                    <AuditStep label={`Décision · ${r.decided_by} · ${r.decided_at}`} />
                    {r.anomalie_decision && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                        <span className="text-xs text-yellow-700 font-medium">
                          Anomalie {r.anomalie_decision.resolution === 'justified' ? 'justifiée' : 'imputée'}
                          {r.anomalie_decision.amount ? ` · ${fmt(r.anomalie_decision.amount)}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Décision + chevron */}
                  <div className="flex items-center justify-between">
                    <div>
                      {r.decision === 'approved' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" /> Approuvé
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Rejeté
                        </span>
                      )}
                    </div>
                    {isOpen
                      ? <ChevronUp   className="w-4 h-4 text-gray-400 shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    }
                  </div>
                </div>

                {/* ── Panneau expand ── */}
                {isOpen && (
                  <div className="bg-[#F5F9F3] border-t border-[#DDEAD5] px-6 py-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                      {/* Colonne 1 — Acteurs */}
                      <ExpandSection title="Acteurs">
                        <ExpandField label="Caissière"   value={r.cashier.name} />
                        <ExpandField label="Vérifié par" value={r.verified_by.name} />
                        <ExpandField label="Décidé par"  value={r.decided_by ?? '—'} />
                      </ExpandSection>

                      {/* Colonne 2 — Montants */}
                      <ExpandSection title="Montants">
                        <ExpandField label="Montant remis"   value={fmt(r.amount)} green />
                        {r.anomalie_decision?.amount != null && (
                          <ExpandField
                            label={r.anomalie_decision.resolution === 'justified' ? 'Montant justifié' : 'Montant imputé'}
                            value={fmt(r.anomalie_decision.amount)}
                          />
                        )}
                        <ExpandField label="Session"      value={r.session_id} />
                        <ExpandField label="Date · Heure" value={`${r.date} · ${r.time}`} />
                      </ExpandSection>

                      {/* Colonne 3 — Note du trésorier */}
                      <ExpandSection title="Note du trésorier">
                        {r.anomalie_decision ? (
                          <>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                              {r.anomalie_decision.resolution === 'justified'
                                ? 'Justification'
                                : 'Motif d\'imputation'}
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed bg-white rounded-lg px-3 py-2.5 border border-[#DDEAD5]">
                              {r.anomalie_decision.note}
                            </p>
                          </>
                        ) : r.reject_reason ? (
                          <>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                              Motif de rejet
                            </p>
                            <p className="text-sm text-red-600 leading-relaxed bg-red-50 rounded-lg px-3 py-2.5 border border-red-100">
                              {r.reject_reason}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Aucune note</p>
                        )}
                      </ExpandSection>

                    </div>
                  </div>
                )}

              </div>
            );
          })}

        </div>
      </div>

      {/* ── Modale anomalie ── */}
      <AnomalieModal
        remise={anomalieTarget}
        onClose={() => setAnomalieTarget(null)}
        onConfirm={handleAnomalieConfirm}
      />
    </>
  );
};

// ─── Micro-composants expand ──────────────────────────────────────────────────

const ExpandSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{title}</p>
    <div className="space-y-2">{children}</div>
  </div>
);

const ExpandField: React.FC<{ label: string; value: string; green?: boolean }> = ({ label, value, green }) => (
  <div className="flex items-baseline justify-between gap-4">
    <span className="text-xs text-gray-400 shrink-0">{label}</span>
    <span className={`text-sm font-medium text-right ${green ? 'text-[#2E7D32]' : 'text-gray-700'}`}>{value}</span>
  </div>
);

export default RemisesTable;