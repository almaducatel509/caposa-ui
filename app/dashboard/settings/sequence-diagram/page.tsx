'use client';
import { useState, useEffect } from 'react';
import { Play, RotateCcw, ChevronRight, Database, Server, Monitor, User, Code2, Lock } from 'lucide-react';

const ACTORS = [
  { id: 'C',   label: 'Caissier',          short: 'C',   color: 'text-[#2E7D32]',  bg: 'bg-[#DDEAD5]',   border: 'border-[#2E7D32]/30', iconBg: 'bg-linear-to-br from-[#2E7D32] to-[#1B5E20]',   icon: User },
  { id: 'S',   label: 'Superviseur',        short: 'S',   color: 'text-[#355C7D]',  bg: 'bg-blue-50',     border: 'border-blue-200',     iconBg: 'bg-linear-to-br from-[#355C7D] to-[#2A4A5E]',   icon: User },
  { id: 'D',   label: 'Directeur',          short: 'D',   color: 'text-purple-700', bg: 'bg-purple-50',   border: 'border-purple-200',   iconBg: 'bg-linear-to-br from-purple-600 to-purple-800',  icon: User },
  { id: 'UI',  label: 'Interface CAPOASA',  short: 'UI',  color: 'text-orange-600', bg: 'bg-orange-50',   border: 'border-orange-200',   iconBg: 'bg-linear-to-br from-orange-400 to-orange-600',  icon: Monitor },
  { id: 'API', label: 'Backend API',        short: 'API', color: 'text-pink-600',   bg: 'bg-pink-50',     border: 'border-pink-200',     iconBg: 'bg-linear-to-br from-pink-500 to-pink-700',      icon: Server },
  { id: 'DB',  label: 'Base de données',    short: 'DB',  color: 'text-yellow-700', bg: 'bg-yellow-50',   border: 'border-yellow-200',   iconBg: 'bg-linear-to-br from-yellow-500 to-yellow-600',  icon: Database },
];

const METHOD_STYLE: Record<string, string> = {
  GET:   'bg-[#DDEAD5] text-[#1B5E20] border border-[#2E7D32]/20',
  POST:  'bg-blue-50 text-blue-700 border border-blue-200',
  PATCH: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  PUT:   'bg-purple-50 text-purple-700 border border-purple-200',
};

interface Step {
  id: number;
  phase: string;
  phaseColor: string;
  phaseTw: string;
  from: string;
  to: string;
  label: string;
  detail: string;
  method?: string;
  endpoint?: string;
  sql?: string;
  isLock?: boolean;
}

const STEPS: Step[] = [
  { id: 1,  phase: 'Saisie',         phaseColor: '#2E7D32', phaseTw: 'bg-[#DDEAD5] text-[#1B5E20]',         from: 'C',   to: 'UI',  label: 'Saisie des transactions de la journée',           detail: 'Le caissier entre manuellement ou importe les transactions effectuées durant sa session.' },
  { id: 2,  phase: 'Saisie',         phaseColor: '#2E7D32', phaseTw: 'bg-[#DDEAD5] text-[#1B5E20]',         from: 'UI',  to: 'API', label: 'POST /transactions',                              detail: "L'interface envoie le payload des transactions au backend pour persistance.", method: 'POST', endpoint: '/transactions' },
  { id: 3,  phase: 'Saisie',         phaseColor: '#2E7D32', phaseTw: 'bg-[#DDEAD5] text-[#1B5E20]',         from: 'API', to: 'DB',  label: 'INSERT transactions',                             detail: 'Insertion en base de données avec horodatage, caissier ID, montant, type.', sql: 'INSERT INTO transactions (...) VALUES (...)' },
  { id: 4,  phase: 'Rapport',        phaseColor: '#355C7D', phaseTw: 'bg-blue-50 text-blue-700',            from: 'C',   to: 'UI',  label: 'Génère rapport journalier',                       detail: 'Le caissier déclenche la génération du rapport de fin de journée depuis son dashboard.' },
  { id: 5,  phase: 'Rapport',        phaseColor: '#355C7D', phaseTw: 'bg-blue-50 text-blue-700',            from: 'UI',  to: 'API', label: 'POST /reports/daily',                             detail: 'Création du rapport journalier agrégé incluant totaux, caisses, écarts préliminaires.', method: 'POST', endpoint: '/reports/daily' },
  { id: 6,  phase: 'Rapport',        phaseColor: '#355C7D', phaseTw: 'bg-blue-50 text-blue-700',            from: 'API', to: 'DB',  label: 'INSERT daily_report',                             detail: "Le rapport est sauvegardé avec le statut initial 'draft'.", sql: "INSERT INTO daily_reports (date, cashier_id, total, status='draft')" },
  { id: 7,  phase: 'Soumission',     phaseColor: '#D4AF37', phaseTw: 'bg-yellow-50 text-yellow-700',        from: 'C',   to: 'UI',  label: 'Soumet la journée pour réconciliation',           detail: 'Action finale du caissier — il verrouille ses données et les soumet au superviseur.' },
  { id: 8,  phase: 'Soumission',     phaseColor: '#D4AF37', phaseTw: 'bg-yellow-50 text-yellow-700',        from: 'UI',  to: 'API', label: 'PATCH /reports/daily/{id}/submit',                detail: 'Transition de statut : draft → submitted. Aucune modification possible après.', method: 'PATCH', endpoint: '/reports/daily/{id}/submit' },
  { id: 9,  phase: 'Soumission',     phaseColor: '#D4AF37', phaseTw: 'bg-yellow-50 text-yellow-700',        from: 'API', to: 'DB',  label: "UPDATE report.status = 'submitted'",              detail: 'Verrouillage partiel — le caissier ne peut plus modifier les données.', sql: "UPDATE daily_reports SET status='submitted', submitted_at=NOW() WHERE id={id}" },
  { id: 10, phase: 'Réconciliation', phaseColor: '#7C3AED', phaseTw: 'bg-purple-50 text-purple-700',        from: 'S',   to: 'UI',  label: 'Ouvre module de réconciliation',                  detail: 'Le superviseur accède au rapport soumis pour démarrer la vérification.' },
  { id: 11, phase: 'Réconciliation', phaseColor: '#7C3AED', phaseTw: 'bg-purple-50 text-purple-700',        from: 'UI',  to: 'API', label: 'GET /reports/daily/{id}/details',                 detail: 'Chargement complet : transactions, soldes, agents, mouvements bancaires.', method: 'GET', endpoint: '/reports/daily/{id}/details' },
  { id: 12, phase: 'Réconciliation', phaseColor: '#7C3AED', phaseTw: 'bg-purple-50 text-purple-700',        from: 'API', to: 'DB',  label: 'SELECT transactions, cash, agents, bank',         detail: 'Jointure multi-tables pour assembler la vue complète du rapport.', sql: 'SELECT t.*, c.balance, a.name, b.movements FROM ... WHERE report_id={id}' },
  { id: 13, phase: 'Réconciliation', phaseColor: '#7C3AED', phaseTw: 'bg-purple-50 text-purple-700',        from: 'S',   to: 'UI',  label: 'Marque transactions (match / écart / en attente)', detail: 'Le superviseur tague chaque ligne : ✅ match, ⚠️ écart, 🕐 en attente.' },
  { id: 14, phase: 'Réconciliation', phaseColor: '#7C3AED', phaseTw: 'bg-purple-50 text-purple-700',        from: 'UI',  to: 'API', label: 'POST /reconciliation/entries',                    detail: 'Enregistrement de chaque décision de réconciliation avec statut et référence.', method: 'POST', endpoint: '/reconciliation/entries' },
  { id: 15, phase: 'Réconciliation', phaseColor: '#7C3AED', phaseTw: 'bg-purple-50 text-purple-700',        from: 'API', to: 'DB',  label: 'INSERT reconciliation_entries',                   detail: 'Traçabilité complète de qui a validé quoi et quand.', sql: 'INSERT INTO reconciliation_entries (report_id, tx_id, status, supervisor_id)' },
  { id: 16, phase: 'Notes',          phaseColor: '#DB2777', phaseTw: 'bg-pink-50 text-pink-700',            from: 'S',   to: 'UI',  label: "Ajoute notes d'explication",                      detail: "Pour chaque écart, le superviseur documente la cause et la résolution." },
  { id: 17, phase: 'Notes',          phaseColor: '#DB2777', phaseTw: 'bg-pink-50 text-pink-700',            from: 'UI',  to: 'API', label: 'PATCH /reconciliation/entries/{id}',              detail: "Mise à jour de la note sur l'entrée de réconciliation existante.", method: 'PATCH', endpoint: '/reconciliation/entries/{id}' },
  { id: 18, phase: 'Notes',          phaseColor: '#DB2777', phaseTw: 'bg-pink-50 text-pink-700',            from: 'API', to: 'DB',  label: 'UPDATE reconciliation_entries.notes',             detail: 'Persistance de la note avec audit trail.', sql: "UPDATE reconciliation_entries SET notes='{text}', updated_at=NOW() WHERE id={id}" },
  { id: 19, phase: 'Review',         phaseColor: '#D4AF37', phaseTw: 'bg-yellow-50 text-yellow-700',        from: 'S',   to: 'UI',  label: 'Soumet pour validation',                          detail: 'Le superviseur finalise son travail et transmet au directeur pour approbation.' },
  { id: 20, phase: 'Review',         phaseColor: '#D4AF37', phaseTw: 'bg-yellow-50 text-yellow-700',        from: 'UI',  to: 'API', label: 'PATCH /reports/daily/{id}/reviewed',              detail: 'Transition de statut : submitted → reviewed.', method: 'PATCH', endpoint: '/reports/daily/{id}/reviewed' },
  { id: 21, phase: 'Review',         phaseColor: '#D4AF37', phaseTw: 'bg-yellow-50 text-yellow-700',        from: 'API', to: 'DB',  label: "UPDATE report.status = 'reviewed'",               detail: "Enregistrement de l'identité du superviseur et de l'heure de validation.", sql: "UPDATE daily_reports SET status='reviewed', reviewed_by={sup_id}, reviewed_at=NOW()" },
  { id: 22, phase: 'Approbation',    phaseColor: '#7C3AED', phaseTw: 'bg-purple-50 text-purple-700',        from: 'D',   to: 'UI',  label: 'Valide la journée',                               detail: 'Le directeur approuve définitivement la journée après revue du rapport.' },
  { id: 23, phase: 'Approbation',    phaseColor: '#7C3AED', phaseTw: 'bg-purple-50 text-purple-700',        from: 'UI',  to: 'API', label: 'PATCH /reports/daily/{id}/approve',               detail: 'Transition finale : reviewed → approved. Déclenche le verrouillage.', method: 'PATCH', endpoint: '/reports/daily/{id}/approve' },
  { id: 24, phase: 'Approbation',    phaseColor: '#7C3AED', phaseTw: 'bg-purple-50 text-purple-700',        from: 'API', to: 'DB',  label: "UPDATE report.status = 'approved'",               detail: "Approbation enregistrée avec identité du directeur.", sql: "UPDATE daily_reports SET status='approved', approved_by={dir_id}, approved_at=NOW()" },
  { id: 25, phase: 'Verrouillage',   phaseColor: '#DC2626', phaseTw: 'bg-red-50 text-red-700',              from: 'API', to: 'DB',  label: 'LOCK report — verrouillage définitif',            detail: "🔒 Le rapport est définitivement scellé. Aucun acteur ne peut plus le modifier. Immuable pour l'audit.", sql: "UPDATE daily_reports SET locked=TRUE, locked_at=NOW() -- Aucune modification possible", isLock: true },
];

const PHASES = [...new Set(STEPS.map(s => s.phase))];

function getActor(id: string) { return ACTORS.find(a => a.id === id); }

export default function SequenceDiagram() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [playMode, setPlayMode] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const [visible, setVisible] = useState<number[]>([]);

  useEffect(() => {
    if (!playMode) return;
    if (playIndex >= STEPS.length) { setPlayMode(false); return; }
    const t = setTimeout(() => {
      setVisible(v => [...v, STEPS[playIndex].id]);
      setActiveStep(STEPS[playIndex].id);
      setPlayIndex(i => i + 1);
    }, 320);
    return () => clearTimeout(t);
  }, [playMode, playIndex]);

  const startPlay = () => {
    setVisible([]); setActiveStep(null); setPlayIndex(0); setPlayMode(true);
  };
  const reset = () => {
    setVisible([]); setActiveStep(null); setActivePhase(null); setPlayMode(false);
  };

  const filteredSteps = activePhase ? STEPS.filter(s => s.phase === activePhase) : STEPS;
  const showStep = (id: number) => playMode ? visible.includes(id) : true;
  const step = activeStep ? STEPS.find(s => s.id === activeStep) : null;

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 flex flex-col">

      {/* Header */}
      <div className="px-8 py-5 bg-white border-b border-gray-100 flex items-center justify-between flex-wrap gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-linear-to-br from-[#2E7D32] to-[#1B5E20]">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sequence Diagram Interactif</h1>
            <p className="text-xs text-gray-500">CAPOASA — Flux de réconciliation · {STEPS.length} étapes · {PHASES.length} phases</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={startPlay}
            disabled={playMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              playMode
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <Play className="w-4 h-4" />
            {playMode ? `Animation… (${playIndex}/${STEPS.length})` : 'Rejouer'}
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* LEFT: Actors panel */}
        <div className="w-44 min-w-36 bg-white border-r border-gray-100 p-4 flex flex-col gap-2 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Acteurs</p>
          {ACTORS.map(actor => {
            const Icon = actor.icon;
            return (
              <div key={actor.id} className={`${actor.bg} ${actor.border} border rounded-xl p-3`}>
                <div className={`w-7 h-7 rounded-lg ${actor.iconBg} flex items-center justify-center mb-2`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <p className={`text-xs font-bold ${actor.color}`}>{actor.short}</p>
                <p className="text-xs text-gray-500 leading-tight">{actor.label}</p>
              </div>
            );
          })}
        </div>

        {/* CENTER: Steps */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Phase filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActivePhase(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                !activePhase
                  ? 'bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Toutes
            </button>
            {PHASES.map(phase => {
              const s = STEPS.find(s => s.phase === phase)!;
              const active = activePhase === phase;
              return (
                <button
                  key={phase}
                  onClick={() => setActivePhase(active ? null : phase)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                    active ? `${s.phaseTw} border-current` : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {phase}
                </button>
              );
            })}
          </div>

          {/* Step rows */}
          <div className="flex flex-col gap-1">
            {filteredSteps.map((s, i) => {
              const fromActor = getActor(s.from)!;
              const toActor   = getActor(s.to)!;
              const isActive  = activeStep === s.id;
              if (!showStep(s.id)) return null;

              return (
                <div
                  key={s.id}
                  onClick={() => setActiveStep(isActive ? null : s.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-[#DDEAD5] border-[#2E7D32]/30 shadow-sm'
                      : s.isLock
                      ? 'bg-red-50 border-red-100 hover:bg-red-100/60'
                      : 'bg-white border-gray-100 hover:bg-[#DDEAD5]/30 hover:border-[#2E7D32]/20'
                  }`}
                  style={{ animationDelay: `${i * 0.02}s` }}
                >
                  {/* Number */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isActive ? 'bg-[#2E7D32] text-white' : s.isLock ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {s.isLock ? <Lock className="w-3 h-3" /> : s.id}
                  </div>

                  {/* Phase badge */}
                  <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-lg text-xs font-medium shrink-0 ${s.phaseTw}`}>
                    {s.phase}
                  </span>

                  {/* From → To */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${fromActor.bg} ${fromActor.color}`}>
                      {s.from}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${toActor.bg} ${toActor.color}`}>
                      {s.to}
                    </span>
                  </div>

                  {/* Method badge */}
                  {s.method && (
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold shrink-0 ${METHOD_STYLE[s.method] || ''}`}>
                      {s.method}
                    </span>
                  )}

                  {/* Label */}
                  <span className={`text-sm flex-1 truncate ${
                    s.isLock ? 'text-red-700 font-semibold' : s.sql ? 'text-yellow-700' : 'text-gray-700'
                  }`}>
                    {s.label}
                  </span>

                  {/* SQL indicator */}
                  {s.sql && !s.isLock && (
                    <span className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-yellow-50 text-yellow-600 border border-yellow-100 shrink-0">
                      <Database className="w-3 h-3" /> SQL
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Detail panel */}
        <div className="w-72 min-w-60 bg-white border-l border-gray-100 p-5 overflow-y-auto">
          {step ? (
            <div className="flex flex-col gap-4">
              {/* Step header */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step.isLock ? 'bg-red-500 text-white' : 'bg-[#2E7D32] text-white'
                }`}>
                  {step.isLock ? <Lock className="w-4 h-4" /> : step.id}
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${step.phaseTw}`}>
                  {step.phase}
                </span>
              </div>

              <p className="text-sm font-semibold text-gray-900 leading-snug">{step.label}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{step.detail}</p>

              {/* Flow */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Flux</p>
                <div className="flex items-center gap-2">
                  {[getActor(step.from), getActor(step.to)].map((actor, i) => actor && (
                    <span key={i} className="flex items-center gap-1.5">
                      {i === 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${actor.bg} ${actor.color}`}>
                        {actor.short}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Endpoint */}
              {step.method && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Endpoint</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${METHOD_STYLE[step.method] || ''}`}>
                      {step.method}
                    </span>
                    <code className="text-xs text-gray-600 font-mono">{step.endpoint}</code>
                  </div>
                </div>
              )}

              {/* SQL */}
              {step.sql && (
                <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                  <p className="text-xs font-semibold text-yellow-600 uppercase tracking-widest mb-3 flex items-center gap-1">
                    <Database className="w-3 h-3" /> SQL
                  </p>
                  <pre className="text-xs text-yellow-800 font-mono leading-relaxed whitespace-pre-wrap break-all">
                    {step.sql}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center pt-16">
              <div className="w-12 h-12 bg-[#DDEAD5] rounded-full flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6 text-[#2E7D32]" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Sélectionne une étape</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Clique sur n'importe quelle ligne pour voir les détails, l'endpoint API et la requête SQL.
              </p>
              <div className="mt-6 flex flex-col gap-1 text-xs text-gray-400">
                <span>📋 {STEPS.length} étapes</span>
                <span>🏷️ {PHASES.length} phases</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Status bar */}
      <div className="bg-white border-t border-gray-100 px-8 py-2 flex gap-6 items-center text-xs text-gray-400">
        <span>📋 {STEPS.length} étapes</span>
        <span>🏷️ {PHASES.length} phases</span>
        <span>🔗 3 acteurs métier · 3 couches système</span>
        <span className="ml-auto">CAPOASA v1.0</span>
      </div>
    </div>
  );
}