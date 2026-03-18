'use client';

import {
  ArrowLeft, User, Clock, CheckCircle2, AlertTriangle,
  Lock, FileText, Printer, Banknote,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props { archiveId?: string; }

const C = { green: '#2E7D32', greenDark: '#1B5E20', greenPale: '#DDEAD5', blue: '#355C7D', gold: '#D4AF37' };

function formatHTG(n: number) {
  return new Intl.NumberFormat('fr-HT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' HTG';
}
function formatDateTime(d: Date) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function ArchiveDetailReconciliation({ archiveId = 'ARC_20260215_00001' }: Props) {
  const router = useRouter();

  const archive = {
    id: 'ARC_20260215_00001',
    category: 'Opérationnel', type: 'Réconciliation de caisse',
    date: new Date('2026-02-15'), createdAt: new Date('2026-02-15T17:45:23'),
    employeeId: 'emp_001', employeeName: 'Jean Dupont', employeeRole: 'Caissier',
    employeeEmail: 'jean.dupont@caisse.com',
    isLocked: true,
    summary: 'Réconciliation journalière — Écart de -30.00 HTG expliqué',
    reconciliationData: {
      reportId: 'rpt_20260213',
      openingCash: 2000.00, theoreticalCash: 7130.00, actualCash: 7100.00, discrepancy: -30.00,
      status: 'equilibre',
      declaredBy: 'Jean Dupont',    declaredAt:  new Date('2026-02-15T17:00:00'),
      reviewedBy: 'Marie Tremblay', reviewedAt:  new Date('2026-02-15T17:30:00'),
      approvedBy: null,             approvedAt:  null,
      discrepancies: [
        { source: 'Cash en caisse', expected: 7130.00, actual: 7100.00, difference: -30.00, status: 'en_attente', explanation: 'En cours de vérification' },
        { source: 'Bordereau BDP-2026-002', expected: 2500.00, actual: 2480.00, difference: -20.00, status: 'explique', explanation: 'Frais bancaire de 20 HTG déduit automatiquement. Confirmé par email de la Banque Nationale.' },
        { source: 'Agent Julie Leblanc', expected: 2200.00, actual: 2150.00, difference: -50.00, status: 'explique', explanation: 'Erreur de frappe sur reçu #478. Montant corrigé dans le système.' },
      ],
      supervisorNotes: [
        { author: 'Marie Tremblay', timestamp: new Date('2026-02-15T17:30:00'), content: 'Transaction tx_003 : Membre a payé avec un billet de 100 HTG déchiré, remplacé par billet neuf. Billet abîmé envoyé à la banque.' },
        { author: 'Marie Tremblay', timestamp: new Date('2026-02-15T17:45:00'), content: 'Agent Julie Leblanc : Écart de 50 HTG expliqué — erreur de frappe sur reçu #478. Montant corrigé.' },
      ],
    },
  };

  // TODO: handleExportPDF — appel API génération PDF
  const handleExportPDF = () => { console.log('Export PDF:', archive.id); };
  const handlePrint     = () => { window.print(); };

  return (
    <div className="min-h-screen bg-[#F9F9F6] p-6 md:p-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-5">

        {/* Retour */}
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-[#355C7D] hover:text-[#1E3A5F] text-sm font-semibold transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Retour aux archives
        </button>

        {/* Header carte */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF2F8] flex items-center justify-center shrink-0">
                <Banknote className="w-5 h-5 text-[#355C7D]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Détails de l'archive</h1>
                <p className="text-xs font-mono text-gray-500 mt-0.5">#{archive.id}</p>
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
              { label: 'Type',            value: archive.type     },
              { label: 'Date opération',  value: archive.date.toLocaleDateString('fr-FR') },
              { label: 'Archive créée le',value: formatDateTime(archive.createdAt) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-xs font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Traçabilité employé */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-[#355C7D]" />
            <p className="text-sm font-bold text-gray-800">Traçabilité employé</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border bg-[#EBF2F8]/40 border-[#BFDBFE]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#355C7D] flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {archive.employeeName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{archive.employeeName}</p>
                  <p className="text-xs text-gray-500">{archive.employeeRole}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs text-gray-600">
                <span>ID : <b className="font-mono">{archive.employeeId}</b></span>
                <span>Email : <b>{archive.employeeEmail}</b></span>
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-[#F9F9F6] border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <p className="text-xs font-bold text-gray-700">Horodatage complet</p>
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Archive créée</span>
                  <span className="font-semibold font-mono text-gray-700">{formatDateTime(archive.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Modifiable</span>
                  <span className="font-bold text-[#B91C1C]">Jamais</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé */}
        <div className="p-4 rounded-2xl border-2 bg-[#DDEAD5]/30 border-[#DDEAD5]">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1B5E20] mb-1">Résumé de l'opération</p>
          <p className="text-sm text-gray-700">{archive.summary}</p>
        </div>

        {/* Données réconciliation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-4">Données de réconciliation</p>

          {/* Montants */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: "Cash d'ouverture",  value: archive.reconciliationData.openingCash,     accent: C.blue  },
              { label: 'Cash théorique',    value: archive.reconciliationData.theoreticalCash, accent: C.gold  },
              { label: 'Cash réel compté',  value: archive.reconciliationData.actualCash,      accent: C.green },
            ].map(({ label, value, accent }) => (
              <div key={label} className="rounded-xl border p-4 text-center"
                style={{ backgroundColor: accent + '0D', borderColor: accent + '33' }}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-lg font-bold" style={{ color: accent }}>{formatHTG(value)}</p>
              </div>
            ))}
          </div>

          {/* Écart total */}
          <div className={`rounded-xl border-2 p-4 mb-5 flex items-center justify-between ${
            archive.reconciliationData.discrepancy === 0
              ? 'bg-[#DDEAD5]/30 border-[#DDEAD5]'
              : 'bg-[#FEF2F2] border-[#FCA5A5]'
          }`}>
            <div className="flex items-center gap-3">
              {archive.reconciliationData.discrepancy === 0
                ? <CheckCircle2 className="w-6 h-6 text-[#2E7D32]" />
                : <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
              }
              <div>
                <p className="text-sm font-bold text-gray-800">Écart total</p>
                <p className="text-xs text-gray-500">
                  {archive.reconciliationData.discrepancy === 0 ? 'Aucun écart — correspondance parfaite' : 'Écart détecté — voir détails'}
                </p>
              </div>
            </div>
            <p className={`text-2xl font-bold ${archive.reconciliationData.discrepancy === 0 ? 'text-[#2E7D32]' : 'text-[#B91C1C]'}`}>
              {formatHTG(Math.abs(archive.reconciliationData.discrepancy))}
            </p>
          </div>

          {/* Tableau écarts */}
          {archive.reconciliationData.discrepancy !== 0 && (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Détail des écarts</p>
              <div className="bg-linear-to-r from-[#DDEAD5] to-[#F9F9F6] rounded-xl border border-gray-100 px-4 py-3 mb-2">
                <div className="grid grid-cols-12 gap-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                  <div className="col-span-4">Source</div>
                  <div className="col-span-2 text-right">Attendu</div>
                  <div className="col-span-2 text-right">Réel</div>
                  <div className="col-span-2 text-right">Écart</div>
                  <div className="col-span-2 text-center">Statut</div>
                </div>
              </div>
              {archive.reconciliationData.discrepancies.map((d, i) => (
                <div key={i} className={`grid grid-cols-12 gap-3 items-start px-4 py-3 rounded-xl mb-2 ${
                  d.status === 'en_attente' ? 'bg-[#FEF9EC] border border-[#FDE68A]' : 'bg-[#DDEAD5]/20 border border-[#DDEAD5]'
                }`}>
                  <div className="col-span-4">
                    <p className="text-xs font-semibold text-gray-800">{d.source}</p>
                    {d.explanation && <p className="text-xs text-gray-500 mt-0.5">{d.explanation}</p>}
                  </div>
                  <div className="col-span-2 text-right text-xs font-semibold text-gray-700">{formatHTG(d.expected)}</div>
                  <div className="col-span-2 text-right text-xs font-semibold text-gray-700">{formatHTG(d.actual)}</div>
                  <div className="col-span-2 text-right">
                    <span className={`text-sm font-bold ${d.difference === 0 ? 'text-[#2E7D32]' : 'text-[#B91C1C]'}`}>
                      {formatHTG(d.difference)}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    {d.status === 'explique'
                      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-[#DDEAD5] text-[#1B5E20]"><CheckCircle2 className="w-3 h-3" />Expliqué</span>
                      : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-[#FEF9EC] text-[#B45309]"><Clock className="w-3 h-3" />En attente</span>
                    }
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Signatures */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-4">Signatures et validation</p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Déclaré par',  name: archive.reconciliationData.declaredBy, date: archive.reconciliationData.declaredAt,  color: C.blue  },
              { label: 'Révisé par',   name: archive.reconciliationData.reviewedBy!, date: archive.reconciliationData.reviewedAt!, color: C.green },
            ].map(({ label, name, date, color }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ backgroundColor: color + '0D', borderColor: color + '33' }}>
                <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color }} />
                <div>
                  <p className="text-xs font-bold text-gray-800">{label} : {name}</p>
                  <p className="text-xs text-gray-500">Le {formatDateTime(date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes superviseur */}
        {archive.reconciliationData.supervisorNotes.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-800 mb-4">Notes du superviseur</p>
            <div className="flex flex-col gap-3">
              {archive.reconciliationData.supervisorNotes.map((note, i) => (
                <div key={i} className="border-l-4 border-[#D4AF37] bg-[#FEF9EC] rounded-r-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-gray-800">{note.author}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(note.timestamp)}</p>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Immuabilité */}
        <div className="p-4 rounded-2xl border-2 bg-[#FEF2F2] border-[#FCA5A5]">
          <div className="flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#B91C1C] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#B91C1C] mb-1">Archive immuable — Garantie d'intégrité</p>
              <ul className="flex flex-col gap-1 text-xs text-[#B91C1C]">
                <li>• Cette archive ne peut jamais être modifiée ou supprimée définitivement.</li>
                <li>• Seule la direction peut la désactiver (soft delete) avec justification.</li>
                <li>• Ce document fait foi en cas d'inspection réglementaire.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}