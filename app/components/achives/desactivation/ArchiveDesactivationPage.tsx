// app/dashboard/archives/[id]/desactivation/page.tsx
'use client';

import React, { useState } from 'react';
import {
  ArrowLeft, Lock, User, Clock, AlertTriangle,
  RotateCcw, FileText, Eye, ShieldOff, Loader2, X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Archive, getCategoryLabel, getTypeLabel, getCategoryAccent,
} from '@/types/archives';

const C = { green: '#2E7D32', greenDark: '#1B5E20', greenPale: '#DDEAD5', blue: '#355C7D', gold: '#D4AF37' };

// ─── Mock — en prod : fetch(`/api/archives/${params.id}`) ─────────────────────
const MOCK_ARCHIVE: Archive = {
  id: 'ARC_20260101_00007', category: 'administrative', type: 'document_interne',
  date: new Date('2026-01-01'), employeeId: 'emp_002',
  employeeName: 'Paul Martin', employeeRole: 'RH',
  summary: 'Document interne — Test (désactivé)', metadata: {},
  isDeleted: true, deletedBy: 'Jean-Marc Célestin',
  deletedAt: new Date('2026-01-15T16:00:00'),
  deletionReason: "Document de test créé lors de la phase de développement — nettoyage administratif autorisé par le directeur.",
  createdAt: new Date('2026-01-01T08:00:00'), updatedAt: new Date('2026-01-15T16:00:00'),
};

const HISTORIQUE = [
  { date: new Date('2026-01-01T08:00:00'), auteur: 'Paul Martin',       role: 'RH',       action: 'Création',               detail: "Archive créée automatiquement lors de l'enregistrement du document interne.", type: 'creation'      as const },
  { date: new Date('2026-01-15T15:45:00'), auteur: 'Jean-Marc Célestin',role: 'Directeur', action: 'Demande de désactivation', detail: 'Demande soumise via le formulaire avec motif obligatoire.',                   type: 'demande'       as const },
  { date: new Date('2026-01-15T16:00:00'), auteur: 'Jean-Marc Célestin',role: 'Directeur', action: 'Désactivation confirmée', detail: MOCK_ARCHIVE.deletionReason ?? '',                                             type: 'desactivation' as const },
];

function formatDateTime(d: Date) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) +
    ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── Modal restauration ───────────────────────────────────────────────────────
function RestoreModal({ archive, onConfirm, onClose }: {
  archive: Archive; onConfirm: () => void; onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    onConfirm();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-[#F9F9F6] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <p className="text-sm font-bold text-gray-800">Restaurer l'archive</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="p-3 rounded-xl border border-gray-100 bg-white">
            <p className="text-xs font-semibold text-gray-500 mb-1">Archive à restaurer</p>
            <p className="text-xs font-mono text-gray-700">{archive.id}</p>
            <p className="text-xs text-gray-500 mt-0.5">{archive.summary}</p>
          </div>
          <div className="p-3 rounded-xl border border-[#FDE68A] bg-[#FEF9EC]">
            <p className="text-xs text-[#B45309]">
              La restauration réactivera cette archive. Elle redeviendra visible dans la liste principale et dans les rapports.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button onClick={handle} disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Restauration…</> : <><RotateCcw className="w-4 h-4" />Restaurer</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ArchiveDesactivationPage() {
  const router  = useRouter();
  const archive = MOCK_ARCHIVE;
  const accent  = getCategoryAccent(archive.category);

  const [showModal, setShowModal] = useState(false);
  const [restored, setRestored]   = useState(false);

  const handleRestore = () => {
    setRestored(true);
    setShowModal(false);
    // TODO: PATCH /api/archives/{id}/restore
    setTimeout(() => router.push('/dashboard/archives'), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] p-6 md:p-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-5">

        {/* Nav */}
        <div className="flex items-center">
        <button onClick={() => router.back()}
            className="flex items-center gap-2 text-[#355C7D] hover:text-[#1E3A5F] text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        </div>

        {/* Bannière statut */}
        {!restored ? (
          <div className="rounded-2xl border-2 bg-[#FEF2F2] border-[#FCA5A5] p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444] flex items-center justify-center shrink-0">
                <ShieldOff className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#B91C1C]">Archive désactivée</p>
                <p className="text-xs text-[#DC2626] mt-0.5">
                  Le {archive.deletedAt ? formatDateTime(archive.deletedAt) : '—'} · par {archive.deletedBy}
                </p>
              </div>
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold hover:shadow-md transition-all shrink-0">
              <RotateCcw className="w-4 h-4" /> Restaurer
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border-2 bg-[#DDEAD5]/40 border-[#DDEAD5] p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1B5E20]">Archive restaurée</p>
              <p className="text-xs text-[#2E7D32] mt-0.5">Redirection vers la liste…</p>
            </div>
          </div>
        )}

        {/* Identité archive */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Archive concernée</p>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: accent.bg }}>
              <FileText className="w-5 h-5" style={{ color: accent.text }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">{archive.summary}</p>
              <p className="text-xs font-mono text-gray-400 mt-0.5">{archive.id}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: accent.bg, color: accent.text }}>
                  {getCategoryLabel(archive.category)}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F3F4F6] text-gray-600">
                  {getTypeLabel(archive.type)}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-400">Créée le</p>
              <p className="text-xs font-semibold text-gray-700 mt-0.5">{archive.createdAt.toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        {/* Détail désactivation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-[#EF4444]" />
            <p className="text-sm font-bold text-gray-800">Détail de la désactivation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="p-4 rounded-xl border bg-[#FEF2F2]/40 border-[#FCA5A5]/50">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Désactivé par
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center shrink-0 text-[#B91C1C] font-bold text-sm">
                  {archive.deletedBy?.charAt(0) ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{archive.deletedBy ?? '—'}</p>
                  <p className="text-xs text-gray-500">Direction</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-[#FEF2F2]/40 border-[#FCA5A5]/50">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Date et heure
              </p>
              <p className="text-sm font-bold text-gray-800">
                {archive.deletedAt ? formatDateTime(archive.deletedAt) : '—'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Motif de désactivation
            </p>
            <div className="p-4 rounded-xl border-l-4 border-[#EF4444] bg-[#FEF2F2]/40">
              <p className="text-sm text-gray-700 leading-relaxed">
                {archive.deletionReason ?? 'Aucun motif enregistré.'}
              </p>
            </div>
          </div>
        </div>

        {/* Historique */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-4">Historique complet</p>
          <div className="flex flex-col">
            {HISTORIQUE.map((item, idx) => {
              const isLast = idx === HISTORIQUE.length - 1;
              const palette = {
                creation:     { bg: '#EBF2F8', color: C.blue,    Icon: FileText      },
                demande:      { bg: '#FEF9EC', color: C.gold,    Icon: AlertTriangle },
                desactivation:{ bg: '#FEF2F2', color: '#EF4444', Icon: Lock          },
              }[item.type];
              const { bg, color, Icon } = palette;
              return (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    {!isLast && <div className="w-0.5 flex-1 bg-gray-100 my-1" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between mb-0.5">
                      <div>
                        <span className="text-xs font-bold text-gray-800">{item.auteur}</span>
                        <span className="text-xs text-gray-400 ml-1.5">· {item.role}</span>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{formatDateTime(item.date)}</span>
                    </div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color }}>{item.action}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rappel soft delete */}
        <div className="p-4 rounded-2xl border-2 bg-[#FEF9EC] border-[#FDE68A]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-[#B45309] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#B45309] mb-1">Rappel — Soft delete uniquement</p>
              <p className="text-xs text-[#B45309] leading-relaxed">
                Cette archive n'a pas été supprimée définitivement. Elle reste enregistrée dans le système et peut être restaurée par la direction. Toutes les données restent intactes et traçables pour audit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <RestoreModal archive={archive} onConfirm={handleRestore} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}