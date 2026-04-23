'use client';
//app\dashboard\sessions\[id]\audit\page.tsx
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FileText, Users, Wallet, Shield,
  ClipboardCheck, Laptop,
  Hash, Building2, Coins,
  Clock, Calendar, User,
  ShieldCheck, Wifi, Monitor, LogIn, AlertTriangle,
  CheckCircle2, ArrowLeft, Loader2,
  FileWarning, Send,
} from 'lucide-react';
import { CaisseSession } from '@/types/caisse';
import AxiosInstance from '@/app/lib/axiosInstance';
import { ConformityStatus } from '../../../../components/sessions/audit/AuditConformityBadge';
import AuditHeader from '../../../../components/sessions/audit/AuditHeader';
import AuditInfoCard, { InfoRow } from '../../../../components/sessions/audit/AuditInfoCard';
import AuditTimeline, { AuditEvent } from '../../../../components/sessions/audit/AuditTimeline';
// ═══════════════════════════════════════════════════════════════
// MOCK — à remplacer par un GET /sessions/:id/audit/
// ═══════════════════════════════════════════════════════════════

const MOCK_SESSION: CaisseSession & { ferme_par?: string } = {
  id:                       'sess-004',
  username:                 'alice.pierre',
  caissier_nom:             'Alice Pierre',
  numero_caisse:            'S-02',
  branch:                   'uuid-branch-pap',
  branch_name:              'Agence Port-au-Prince',
  devise:                   'HTG',
  superviseur:              'marie.joseph',
  id_responsable_cash:      'paul.martin',
  montant_ouverture:        15000,
  montant_fermeture:        15000,
  statut:                   'fermée',
  ouverture_at:             '2026-04-21T01:43:12',
  fermeture_at:             '2026-04-21T09:42:55',
  note_fermeture:           undefined,
  tentatives_ouverture:     0,
  remise_effectuee:         true,
  reconciliation_effectuee: true,
  actif:                    false,
  nom_caisse:               'Caisse C-02',
  localisation:             '1er étage',
  solde_actuel:             0,
  solde_initial:            15000,
  nb_sessions:              3,
  ip_address:               '192.168.1.22',
  device_id:                'Chrome / 124.0.0.0 (Windows)',
  nb_transactions:          24,
  ferme_par:                'alice.pierre',
  derniere_session:         undefined,
  created_at:               undefined,
};

const MOCK_EVENTS: AuditEvent[] = [
  {
    time: '01:43:12',
    kind: 'ouverture',
    title: 'Ouverture de session',
    detail: 'Session ouverte avec un montant de 15 000,00 HTG',
    actor: 'alice.pierre',
  },
  {
    time: '01:43:25',
    kind: 'validation',
    title: 'Validation par le superviseur',
    detail: 'marie.joseph a validé l\'ouverture de session',
    actor: 'marie.joseph',
  },
  {
    time: '01:43:40',
    kind: 'validation',
    title: 'Validation par le responsable cash',
    detail: 'paul.martin a validé l\'ouverture de session',
    actor: 'paul.martin',
  },
  {
    time: '03:15:08',
    kind: 'transaction',
    title: 'Dépôt espèces',
    detail: 'Dépôt de 8 500,00 HTG — client Marie Estimé',
    actor: 'alice.pierre',
  },
  {
    time: '05:22:45',
    kind: 'transaction',
    title: 'Retrait espèces',
    detail: 'Retrait de 3 200,00 HTG — client Paul Duval',
    actor: 'alice.pierre',
  },
  {
    time: '09:42:55',
    kind: 'fermeture',
    title: 'Fermeture de session',
    detail: 'Session fermée avec un montant compté de 15 000,00 HTG',
    actor: 'alice.pierre',
  },
];

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function fmtMoney(v: number | undefined, devise = 'HTG'): string {
  if (v == null) return '—';
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency', currency: devise, minimumFractionDigits: 2,
  }).format(v);
}

function fmtDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })} ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

function fmtDateShort(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function duree(ouverture?: string, fermeture?: string): string {
  if (!ouverture) return '—';
  const fin   = fermeture ? new Date(fermeture) : new Date();
  const debut = new Date(ouverture);
  const diff  = Math.floor((fin.getTime() - debut.getTime()) / 60000);
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m} min`;
}

// ═══════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════

export default function SessionAuditPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;

  const [session, setSession] = useState<(CaisseSession & { ferme_par?: string }) | null>(null);
  const [events,  setEvents]  = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Chargement ────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await AxiosInstance.get<CaisseSession & { ferme_par?: string }>(
          `/sessions/${sessionId}/audit/`
        );
        setSession(data);
        // TODO : charger aussi le journal des événements
        setEvents(MOCK_EVENTS);
      } catch {
        // Fallback mock
        setSession(MOCK_SESSION);
        setEvents(MOCK_EVENTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#2E7D32]" />
          <p className="text-sm text-gray-500">Chargement de l&apos;audit…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="flex flex-col items-center gap-3 max-w-sm text-center">
          <FileWarning className="w-10 h-10 text-red-400" />
          <p className="text-sm font-semibold text-gray-900">Session introuvable</p>
          <p className="text-xs text-gray-500">
            La session demandée n&apos;existe pas ou a été supprimée.
          </p>
          <button
            onClick={() => router.push('/dashboard/sessions')}
            className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#2E7D32] text-white rounded-xl text-sm font-semibold hover:bg-[#256427]"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux sessions
          </button>
        </div>
      </div>
    );
  }

  // ── Calculs ───────────────────────────────────────────────
  const ecart = session.montant_fermeture != null
    ? session.montant_fermeture - session.montant_ouverture
    : null;

  const conformity: ConformityStatus = (() => {
    if (session.forcee_par) return 'non_conforme';
    if (ecart != null && ecart !== 0) return 'ecart';
    if (session.statut === 'fermée' && !session.remise_effectuee) return 'non_conforme';
    return 'conforme';
  })();

  // ── Handlers ──────────────────────────────────────────────
  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    alert('[Mock] Export PDF — à implémenter avec une lib comme jsPDF ou via l\'API backend');
  };

  // ═══════════════════════════════════════════════════════════════
  // Rows des différentes cartes
  // ═══════════════════════════════════════════════════════════════

  // ── Informations générales ────────────────────────────────
  const infoGeneralesRows: InfoRow[] = [
    { label: 'N° de session',  value: session.numero_caisse, Icon: Hash, mono: true },
    { label: 'Caisse',         value: session.numero_caisse, Icon: Wallet, mono: true },
    { label: 'Agence',         value: session.branch_name ?? session.branch, Icon: Building2 },
    { label: 'Devise',         value: session.devise, Icon: Coins },
    { label: 'Ouverture',      value: fmtDateTime(session.ouverture_at), Icon: Clock, mono: true },
    { label: 'Fermeture',      value: session.fermeture_at ? fmtDateTime(session.fermeture_at) : '—', Icon: Clock, mono: true },
    { label: 'Durée',          value: duree(session.ouverture_at, session.fermeture_at), Icon: Clock },
    {
      label: 'Statut',
      value: (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
          session.statut === 'ouverte'
            ? 'bg-green-50 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {session.statut === 'ouverte' ? '● Ouverte' : '✓ Fermée'}
        </span>
      ),
      Icon: Shield,
    },
  ];

  // ── Intervenants ──────────────────────────────────────────
  const intervenantsRows: InfoRow[] = [
    { label: 'Caissier (username)', value: session.username,              Icon: User,        mono: true },
    { label: 'Superviseur',         value: session.superviseur,           Icon: ShieldCheck, mono: true },
    { label: 'Responsable cash',    value: session.id_responsable_cash,   Icon: User,        mono: true },
    ...(session.ferme_par && session.ferme_par !== session.username
      ? [{ label: 'Fermée par', value: session.ferme_par, Icon: LogIn, mono: true, highlight: 'info' as const }]
      : []),
  ];

  // ── Informations techniques ───────────────────────────────
  const techniquesRows: InfoRow[] = [
    { label: 'Adresse IP',            value: session.ip_address ?? '—', Icon: Wifi,    mono: true },
    { label: 'Terminal / Navigateur', value: session.device_id ?? '—',  Icon: Monitor, mono: true },
    { label: 'Ouverture depuis',      value: 'Application web',          Icon: Laptop },
    {
      label: 'Tentatives ouverture',
      value: String(session.tentatives_ouverture),
      Icon: AlertTriangle,
      highlight: session.tentatives_ouverture > 0 ? 'warning' : 'default',
    },
  ];

  // ── Détails financiers ────────────────────────────────────
  const financiersRows: InfoRow[] = [
    { label: 'Montant d\'ouverture',      value: fmtMoney(session.montant_ouverture, session.devise),                 highlight: 'default' },
    { label: 'Montant compté à la fermeture', value: fmtMoney(session.montant_fermeture, session.devise),             highlight: 'default' },
    {
      label: 'Écart de caisse',
      value: ecart == null ? '—' : (ecart === 0 ? fmtMoney(0, session.devise) : `${ecart > 0 ? '+' : ''}${fmtMoney(ecart, session.devise)}`),
      highlight: ecart == null ? 'default' : (ecart === 0 ? 'success' : ecart > 0 ? 'info' : 'danger'),
    },
  ];

  // ── Contrôles de fermeture ────────────────────────────────
  const controlesRows: InfoRow[] = [
    {
      label: 'Remise effectuée',
      value: (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
          session.remise_effectuee ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {session.remise_effectuee ? '✓ Oui' : '✗ Non'}
        </span>
      ),
      Icon: CheckCircle2,
    },
    {
      label: 'Réconciliation effectuée',
      value: (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
          session.reconciliation_effectuee ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {session.reconciliation_effectuee ? '✓ Oui' : '✗ Non'}
        </span>
      ),
      Icon: CheckCircle2,
    },
    {
      label: 'Note de fermeture',
      value: session.note_fermeture ? (
        <span className="text-xs text-amber-700 italic truncate">{session.note_fermeture}</span>
      ) : (
        <span className="text-gray-400 italic font-normal">Aucune</span>
      ),
      Icon: FileText,
    },
  ];

  // ═══════════════════════════════════════════════════════════════
  // Rendu
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-6 md:p-8 print:bg-white print:p-0 print:m-0">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <AuditHeader
          sessionId={session.id}
          sessionLabel={session.numero_caisse}
          caissierNom={session.caissier_nom ?? session.username}
          dateSession={fmtDateShort(session.ouverture_at)}
          conformity={conformity}
          onExportPDF={handleExportPDF}
          onPrint={handlePrint}
        />

        {/* ── Grille principale (2 colonnes) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

          {/* Informations générales */}
          <AuditInfoCard
            title="Informations générales"
            Icon={FileText}
            rows={infoGeneralesRows}
          />

          {/* Intervenants */}
          <AuditInfoCard
            title="Intervenants"
            Icon={Users}
            rows={intervenantsRows}
          />

          {/* Détails financiers */}
          <AuditInfoCard
            title="Détails financiers"
            Icon={Wallet}
            rows={financiersRows}
            banner={
              ecart === 0
                ? {
                    kind: 'success',
                    title: 'Aucun écart détecté',
                    message: 'Les montants sont conformes.',
                    Icon: CheckCircle2,
                  }
                : ecart != null
                ? {
                    kind: 'warning',
                    title: `Écart de ${fmtMoney(Math.abs(ecart), session.devise)}`,
                    message: 'Vérification recommandée par le superviseur.',
                    Icon: AlertTriangle,
                  }
                : undefined
            }
          />

          {/* Informations techniques */}
          <AuditInfoCard
            title="Informations techniques"
            Icon={Laptop}
            rows={techniquesRows}
          />

          {/* Contrôles de fermeture */}
          <AuditInfoCard
            title="Contrôles de fermeture"
            Icon={ClipboardCheck}
            rows={controlesRows}
            banner={
              session.remise_effectuee && session.reconciliation_effectuee
                ? {
                    kind: 'success',
                    title: 'Toutes les vérifications sont validées',
                    message: 'La session respecte les procédures de clôture.',
                    Icon: CheckCircle2,
                  }
                : {
                    kind: 'warning',
                    title: 'Contrôles incomplets',
                    message: 'Certaines vérifications n\'ont pas été effectuées.',
                    Icon: AlertTriangle,
                  }
            }
          />

          {/* Fermeture forcée (conditionnel) */}
          {session.forcee_par && (
            <AuditInfoCard
              title="⚠️ Fermeture forcée"
              Icon={ShieldCheck}
              rows={[
                { label: 'Forcée par',     value: session.forcee_par,                        Icon: User,          mono: true, highlight: 'danger' },
                { label: 'Raison',         value: session.raison_forcage ?? '—',             Icon: AlertTriangle, highlight: 'danger' },
              ]}
              banner={{
                kind: 'danger',
                title: 'Session fermée de manière non-standard',
                message: 'Cette session nécessite une attention particulière de l\'auditeur.',
                Icon: ShieldCheck,
              }}
            />
          )}
        </div>

        {/* ── Journal des événements (pleine largeur) ── */}
        <AuditTimeline events={events} />
        {/* ── Footer ── */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 print:hidden">
          <div>
            © 2026 CAPOSA. Tous droits réservés.
          </div>
          <div className="flex items-center gap-3">
            <span>Confidentialité</span>
            <span>·</span>
            <span>Conditions</span>
            <span>·</span>
            <span>Support</span>
          </div>
        </div>

        {/* ── Signature d'impression (visible uniquement à l'impression) ── */}
        <div className="hidden print:block mt-8 pt-6 border-t-2 border-gray-300">
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="font-semibold text-gray-700 mb-8">Signature du caissier</p>
              <div className="h-16 border-b border-gray-400" />
              <p className="text-xs text-gray-500 mt-2">{session.caissier_nom}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-8">Signature du superviseur</p>
              <div className="h-16 border-b border-gray-400" />
              <p className="text-xs text-gray-500 mt-2">{session.superviseur}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-8">
            Document généré le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            {' · '}
            CAPOSA v1.0 · Audit BRH
          </p>
        </div>
      </div>
    </div>
  );
}