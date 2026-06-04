'use client';
import { useRouter } from 'next/navigation';
import AuditHeader from './AuditHeader';
import AuditTimeline from './AuditTimeline';
import { ConformityStatus } from './AuditConformityBadge';
import AuditSessionProvider from './AuditSessionProvider';
import { CaisseSession } from '@/types/caisse';
import jsPDF from 'jspdf';

interface AuditPageProps {
  sessionId: string;
}

export default function AuditPage({ sessionId }: AuditPageProps) {
  const ecartConformity = (session: any): ConformityStatus => {
    const ecart = session.montant_fermeture != null
      ? session.montant_fermeture - session.montant_ouverture
      : null;
    if (session.forcee_par)              return 'non_conforme';
    if (ecart != null && ecart !== 0)    return 'ecart';
    return 'conforme';
  };
  const MOCK_EVENTS = [
    { time: '01:43:12', title: 'Ouverture de session',       actor: 'alice.pierre' },
    { time: '01:43:25', title: 'Validation superviseur',      actor: 'marie.joseph' },
    { time: '01:43:40', title: 'Validation responsable cash', actor: 'paul.martin'  },
    { time: '03:15:08', title: 'Depot especes',               actor: 'alice.pierre' },
    { time: '05:22:45', title: 'Retrait especes',             actor: 'alice.pierre' },
    { time: '09:42:55', title: 'Fermeture de session',        actor: 'alice.pierre' },
  ];

  const handleExportPDF = (session: CaisseSession & { ferme_par?: string }) => {
    const doc  = new jsPDF();
    const date = new Date(session.ouverture_at ?? '').toLocaleDateString('fr-FR');
    const fmt  = (v: number) => new Intl.NumberFormat('fr-CA').format(v) + ' HTG';
    const ecart = session.montant_fermeture != null
      ? session.montant_fermeture - session.montant_ouverture
      : null;

    doc.setFontSize(16);
    doc.text(`Audit de session — ${session.numero_caisse}`, 14, 20);

    doc.setFontSize(11);
    doc.text(`Caissier   : ${session.caissier_nom ?? session.username}`, 14, 35);
    doc.text(`Date       : ${date}`, 14, 43);
    doc.text(`Agence     : ${session.branch_name ?? '—'}`, 14, 51);
    doc.text(`Statut     : ${session.statut}`, 14, 59);
    doc.setFontSize(13);
    doc.text('Financier', 14, 75);
    doc.setFontSize(11);
    doc.text(`Montant ouverture  : ${fmt(session.montant_ouverture ?? 0)}`, 14, 83);
    doc.text(`Montant fermeture  : ${session.montant_fermeture != null ? fmt(session.montant_fermeture) : '—'}`, 14, 91);

    if (ecart != null) {
      doc.text(`Ecart : ${ecart > 0 ? '+' : ''}${fmt(ecart)}`, 14, 99);
    }

    doc.setFontSize(13);
    doc.text('Journal des evenements', 14, 111);
    doc.setFontSize(10);
    MOCK_EVENTS.forEach((e, i) => {
      doc.text(`${e.time}   ${e.title}   ${e.actor}`, 14, 121 + i * 10);
    });
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`CAPOSA v1.0 — généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 285);

    doc.save(`audit-${session.numero_caisse}-${date}.pdf`);
  };
  return (
    <AuditSessionProvider sessionId={sessionId}>
      {(session) => (
        <div className="w-full min-h-screen bg-gradient-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8">
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            <AuditHeader
              sessionId={session.id}
              sessionLabel={session.numero_caisse}
              caissierNom={session.caissier_nom ?? session.username}
              dateSession={new Date(session.ouverture_at ?? '').toLocaleDateString('fr-FR')}
              conformity={ecartConformity(session)}
              onExportPDF={() => handleExportPDF(session)}  
              montantOuverture={session.montant_ouverture}
              montantFermeture={session.montant_fermeture}          
            />
            
            <AuditTimeline sessionId={session.id} />
            
          </div>
        </div>
      )}
    </AuditSessionProvider>
  );
}