'use client';
import { useState, useEffect } from 'react';
import {
  X, Clock, Banknote, TrendingUp, TrendingDown,
  ShieldCheck, ArrowDownCircle, ArrowUpCircle,
  ArrowLeftRight, Landmark, Receipt, Tag,
  CheckCircle2, XCircle, AlertTriangle,
  Monitor, Wifi, User, FileText, Minus,
} from 'lucide-react';
import {
  CaisseSession,
  CaisseTransaction,
  TransactionType,
} from '@/types/caisse';
import { Modal } from '@/app/components/ui/Modal';
import AxiosInstance from '@/app/lib/axiosInstance';

// ─── Props ───────────────────────────────────────────────────────

interface Props {
  session: CaisseSession;
  onClose: () => void;
}

// ─── Mock transactions — retirer quand l'API est prête ───────────

function mockTransactions(sessionId: string): CaisseTransaction[] {
  const now = Date.now();
  return [
    {
      id: 't1', session_id: sessionId, cashier_id: 'jean.dupont',
      cash_register_id: 'C-01', type: 'depot', montant: 15000,
      solde_apres: 65000, client: 'Marie Estimé', reference: 'DEP-001',
      statut: 'normal', effectue_par: 'jean.dupont',
      ip_address: '192.168.1.10', device_id: 'Chrome/124',
      timestamp: new Date(now - 150 * 60000).toISOString(),
      note:'',
    },
    {
      id: 't2', session_id: sessionId, cashier_id: 'jean.dupont',
      cash_register_id: 'C-01', type: 'retrait', montant: 8000,
      solde_apres: 57000, client: 'Paul Duval', reference: 'RET-002',
      statut: 'normal', effectue_par: 'jean.dupont',
      ip_address: '192.168.1.10', device_id: 'Chrome/124',
      timestamp: new Date(now - 120 * 60000).toISOString(),
      note:'',

    },
    {
      id: 't3', session_id: sessionId, cashier_id: 'jean.dupont',
      cash_register_id: 'C-01', type: 'transfert_entrant', montant: 20000,
      solde_apres: 77000, client: 'Agence Tozin', reference: 'TRF-003',
      statut: 'normal', effectue_par: 'jean.dupont',
      ip_address: '192.168.1.10', device_id: 'Chrome/124',
      timestamp: new Date(now - 90 * 60000).toISOString(),
      note:'',

    },
    {
      id: 't4', session_id: sessionId, cashier_id: 'jean.dupont',
      cash_register_id: 'C-01', type: 'pret_debourse', montant: 12000,
      solde_apres: 65000, client: 'Rose Janvier', reference: 'PRE-004',
      statut: 'annulee', motif_annulation: 'Erreur de saisie — montant incorrect.',
      effectue_par: 'jean.dupont',
      ip_address: '192.168.1.10', device_id: 'Chrome/124',
      timestamp: new Date(now - 60 * 60000).toISOString(),
      note:'',

    },
    {
      id: 't5', session_id: sessionId, cashier_id: 'jean.dupont',
      cash_register_id: 'C-01', type: 'depot', montant: 5000,
      solde_apres: 70000, client: 'André Michel', reference: 'DEP-005',
      statut: 'normal', effectue_par: 'jean.dupont',
      ip_address: '192.168.1.10', device_id: 'Chrome/124',
      timestamp: new Date(now - 30 * 60000).toISOString(),
      note:'',

    },
  ];
}

// ─── Helpers ─────────────────────────────────────────────────────

function fmt(v: number, devise = 'HTG') {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency', currency: devise, minimumFractionDigits: 2,
  }).format(v);
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  });
}

function duree(ouverture: string, fermeture?: string) {
  const fin  = fermeture ? new Date(fermeture) : new Date();
  const diff = Math.floor((fin.getTime() - new Date(ouverture).getTime()) / 60000);
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m} min`;
}

// ─── Config types de transaction ─────────────────────────────────

const TX_CONFIG: Record<TransactionType, {
  label: string;
  Icon:  React.ElementType;
  color: string;
  bg:    string;
  sign:  '+' | '-' | '~';
}> = {
  depot:             { label: 'Dépôt',            Icon: ArrowDownCircle, color: 'text-[#2E7D32]',  bg: 'bg-[#DDEAD5]',  sign: '+' },
  retrait:           { label: 'Retrait',           Icon: ArrowUpCircle,   color: 'text-red-500',    bg: 'bg-red-50',     sign: '-' },
  transfert_entrant: { label: 'Transfert entrant', Icon: ArrowLeftRight,  color: 'text-blue-600',   bg: 'bg-blue-50',    sign: '+' },
  transfert_sortant: { label: 'Transfert sortant', Icon: ArrowLeftRight,  color: 'text-orange-500', bg: 'bg-orange-50',  sign: '-' },
  pret_encaisse:     { label: 'Prêt encaissé',     Icon: Landmark,        color: 'text-[#2E7D32]',  bg: 'bg-[#DDEAD5]',  sign: '+' },
  pret_debourse:     { label: 'Prêt déboursé',     Icon: Landmark,        color: 'text-purple-600', bg: 'bg-purple-50',  sign: '-' },
  frais:             { label: 'Frais',              Icon: Receipt,         color: 'text-gray-500',   bg: 'bg-gray-100',   sign: '-' },
  autre:             { label: 'Autre',              Icon: Tag,             color: 'text-gray-500',   bg: 'bg-gray-100',   sign: '~' },
};

// ─── Onglets ─────────────────────────────────────────────────────

type Tab = 'resume' | 'timeline' | 'transactions' | 'audit';

// ═══════════════════════════════════════════════════════════════
// TAB : RÉSUMÉ
// ═══════════════════════════════════════════════════════════════

function ResumeTab({ session, transactions }: {
  session:      CaisseSession;
  transactions: CaisseTransaction[];
}) {
  const devise = session.devise;

  const totaux = transactions
    .filter(t => t.statut === 'normal')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + t.montant;
      return acc;
    }, {});

  const lignes = [
    {
      label: "Montant d'ouverture",
      value: session.montant_ouverture,
      color: 'text-gray-700',
    },
    {
      label: 'Total entrées',
      value: (totaux['depot'] ?? 0)
           + (totaux['pret_encaisse'] ?? 0)
           + (totaux['transfert_entrant'] ?? 0),
      color: 'text-[#2E7D32]',
    },
    {
      label: 'Total sorties',
      value: (totaux['retrait'] ?? 0)
           + (totaux['pret_debourse'] ?? 0)
           + (totaux['transfert_sortant'] ?? 0)
           + (totaux['frais'] ?? 0),
      color: 'text-red-500',
    },
  ];

  const ecart = session.ecart;

  return (
    <div className="flex flex-col gap-4">

      {/* Grille 4 montants clés */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label:  'Ouverture',
            value:  fmt(session.montant_ouverture, devise),
            color:  'text-gray-900',
            border: 'border-gray-200',
          },
          {
            label:  'Théorique',
            value:  session.montant_theorique ? fmt(session.montant_theorique, devise) : '—',
            color:  'text-blue-700',
            border: 'border-blue-200',
          },
          {
            label:  'Fermeture',
            value:  session.montant_fermeture ? fmt(session.montant_fermeture, devise) : '—',
            color:  'text-gray-900',
            border: 'border-gray-200',
          },
          {
            label:  'Écart',
            value:  ecart == null
              ? '—'
              : ecart === 0
              ? 'Aucun écart'
              : `${ecart > 0 ? '+' : ''}${fmt(ecart, devise)}`,
            color:  ecart == null   ? 'text-gray-400'
                  : ecart === 0    ? 'text-[#2E7D32]'
                  : ecart > 0      ? 'text-blue-600'
                  :                  'text-red-500',
            border: ecart == null   ? 'border-gray-200'
                  : ecart === 0    ? 'border-[#2E7D32]/30'
                  : ecart > 0      ? 'border-blue-200'
                  :                  'border-red-200',
          },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={`bg-white border-2 ${border} rounded-xl px-4 py-3`}>
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-base font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Détail par type */}
      <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
        {lignes.map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500">{label}</span>
            <span className={`font-semibold ${color}`}>{fmt(value, devise)}</span>
          </div>
        ))}
      </div>

      {/* Statuts réconciliation */}
      <div className="flex gap-2">
        {[
          { label: 'Remise effectuée',        done: session.remise_effectuee },
          { label: 'Réconciliation effectuée', done: session.reconciliation_effectuee },
        ].map(({ label, done }) => (
          <div
            key={label}
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${
              done
                ? 'bg-[#DDEAD5]/40 border-[#2E7D32]/30 text-[#1B5E20]'
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
          >
            {done ? <CheckCircle2 size={13} /> : <Minus size={13} />}
            {label}
          </div>
        ))}
      </div>

      {/* Note de fermeture */}
      {session.note_fermeture && (
        <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>{session.note_fermeture}</span>
        </div>
      )}

      {/* Bloc USD */}
      {session.devise === 'USD' && session.taux_change && (
        <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-blue-500">Montant USD</span>
            <span className="font-semibold">{fmt(session.montant_ouverture, 'USD')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-500">Taux (figé)</span>
            <span className="font-semibold">{session.taux_change.toFixed(2)}</span>
          </div>
          {session.montant_equivalent && (
            <div className="flex justify-between border-t border-blue-200 pt-1 mt-1">
              <span className="text-blue-500">Équivalent HTG</span>
              <span className="font-bold">{fmt(session.montant_equivalent, 'HTG')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB : TIMELINE
// ═══════════════════════════════════════════════════════════════

function TimelineTab({ session, transactions }: {
  session:      CaisseSession;
  transactions: CaisseTransaction[];
}) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="flex flex-col">
      {/* Ouverture */}
      <TimelineEvent
        iconBg="bg-[#DDEAD5]"
        icon={<div className="w-2 h-2 rounded-full bg-[#2E7D32]" />}
        time={fmtTime(session.ouverture_at)}
        title="Session ouverte"
        subtitle={`Montant d'ouverture : ${fmt(session.montant_ouverture, session.devise)}`}
        ip={session.ip_address}
        device={session.device_id}
        isFirst
      />

      {/* Transactions */}
      {sorted.map((tx, i) => {
        const cfg     = TX_CONFIG[tx.type];
        const annulee = tx.statut === 'annulee';
        return (
          <TimelineEvent
            key={tx.id}
            iconBg={annulee ? 'bg-gray-100' : cfg.bg}
            icon={<cfg.Icon size={13} className={annulee ? 'text-gray-400' : cfg.color} />}
            time={fmtTime(tx.timestamp)}
            title={cfg.label}
            subtitle={`${annulee ? '' : cfg.sign !== '~' ? cfg.sign : ''}${fmt(tx.montant, session.devise)}${tx.client ? ` · ${tx.client}` : ''}`}
            solde={annulee ? undefined : `Solde : ${fmt(tx.solde_apres, session.devise)}`}
            ip={tx.ip_address}
            device={tx.device_id}
            annulee={annulee}
            motif={tx.motif_annulation}
            isLast={i === sorted.length - 1 && !session.fermeture_at}
          />
        );
      })}

      {/* Fermeture */}
      {session.fermeture_at && (
        <TimelineEvent
          iconBg="bg-gray-100"
          icon={<div className="w-2 h-2 rounded-full bg-gray-400" />}
          time={fmtTime(session.fermeture_at)}
          title={
            session.forcee_par
              ? `Fermée de force par ${session.forcee_par}`
              : 'Session fermée'
          }
          subtitle={
            session.montant_fermeture
              ? `Montant de fermeture : ${fmt(session.montant_fermeture, session.devise)}`
              : '—'
          }
          isLast
        />
      )}
    </div>
  );
}

function TimelineEvent({
  icon, iconBg, time, title, subtitle,
  solde, ip, device, annulee, motif, isFirst, isLast,
}: {
  icon:     React.ReactNode;
  iconBg:   string;
  time:     string;
  title:    string;
  subtitle: string;
  solde?:   string;
  ip?:      string;
  device?:  string;
  annulee?: boolean;
  motif?:   string;
  isFirst?: boolean;
  isLast?:  boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-full ${iconBg} flex items-center justify-center shrink-0 z-10`}>
          {icon}
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
      </div>

      <div className={`pb-4 flex-1 min-w-0 pt-1`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${annulee ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {title}
          </span>
          {annulee && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-500 font-medium">
              Annulée
            </span>
          )}
          <span className="text-xs text-gray-400 ml-auto">{time}</span>
        </div>

        <p className={`text-xs mt-0.5 ${annulee ? 'text-gray-400' : 'text-gray-500'}`}>
          {subtitle}
        </p>

        {solde && (
          <p className="text-xs text-[#2E7D32] font-medium mt-0.5">{solde}</p>
        )}

        {motif && (
          <p className="text-xs text-red-400 italic mt-1">↳ {motif}</p>
        )}

        {(ip || device) && (
          <div className="flex items-center gap-3 mt-1">
            {ip     && <span className="text-[10px] text-gray-400 flex items-center gap-1"><Wifi    size={9} />{ip}</span>}
            {device && <span className="text-[10px] text-gray-400 flex items-center gap-1"><Monitor size={9} />{device}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB : TRANSACTIONS
// ═══════════════════════════════════════════════════════════════

type TxFilter = 'toutes' | TransactionType | 'annulee';

function TransactionsTab({ session, transactions }: {
  session:      CaisseSession;
  transactions: CaisseTransaction[];
}) {
  const [txFilter, setTxFilter] = useState<TxFilter>('toutes');

  const types    = Array.from(new Set(transactions.map(t => t.type)));
  const filtered = transactions.filter(t => {
    if (txFilter === 'toutes')  return true;
    if (txFilter === 'annulee') return t.statut === 'annulee';
    return t.type === txFilter;
  });

  return (
    <div className="flex flex-col gap-3">

      {/* Filtres */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(['toutes', 'annulee', ...types] as TxFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setTxFilter(f)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              txFilter === f
                ? 'bg-[#2E7D32] text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {f === 'toutes'  ? 'Toutes'   :
             f === 'annulee' ? 'Annulées' :
             TX_CONFIG[f as TransactionType]?.label ?? f}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-400 uppercase tracking-wider">
              <th className="text-left px-3 py-2.5 font-semibold">Type</th>
              <th className="text-right px-3 py-2.5 font-semibold">Montant</th>
              <th className="text-left px-3 py-2.5 font-semibold hidden sm:table-cell">Client</th>
              <th className="text-left px-3 py-2.5 font-semibold hidden md:table-cell">Réf.</th>
              <th className="text-right px-3 py-2.5 font-semibold hidden sm:table-cell">Solde après</th>
              <th className="text-center px-3 py-2.5 font-semibold">Statut</th>
              <th className="text-right px-3 py-2.5 font-semibold">Heure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  Aucune transaction dans ce filtre
                </td>
              </tr>
            ) : filtered.map(tx => {
              const cfg     = TX_CONFIG[tx.type];
              const annulee = tx.statut === 'annulee';
              return (
                <tr
                  key={tx.id}
                  className={`transition-colors ${annulee ? 'opacity-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-md ${cfg.bg} flex items-center justify-center`}>
                        <cfg.Icon size={10} className={cfg.color} />
                      </div>
                      <span className={`font-medium ${annulee ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </td>
                  <td className={`px-3 py-2.5 text-right font-bold ${annulee ? 'line-through text-gray-400' : cfg.color}`}>
                    {cfg.sign !== '~' ? cfg.sign : ''}{fmt(tx.montant, session.devise)}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 hidden sm:table-cell">
                    {tx.client ?? '—'}
                  </td>
                  <td className="px-3 py-2.5 text-gray-400 hidden md:table-cell">
                    {tx.reference ?? '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-500 hidden sm:table-cell">
                    {annulee ? '—' : fmt(tx.solde_apres, session.devise)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {annulee
                      ? <span className="inline-flex items-center gap-1 text-red-400 font-medium"><XCircle size={11} />Annulée</span>
                      : <span className="inline-flex items-center gap-1 text-[#2E7D32] font-medium"><CheckCircle2 size={11} />OK</span>
                    }
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-400">
                    {fmtTime(tx.timestamp)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 text-right">
        {filtered.length} transaction(s) · {transactions.filter(t => t.statut === 'annulee').length} annulée(s)
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB : AUDIT
// ═══════════════════════════════════════════════════════════════

function AuditTab({ session }: { session: CaisseSession }) {
  const rows = [
    { label: 'Caissier (username)',   value: session.username,                        Icon: User        },
    { label: 'Superviseur',           value: session.superviseur,                     Icon: ShieldCheck },
    { label: 'Responsable cash',      value: session.id_responsable_cash,             Icon: User        },
    { label: 'Ouverture',             value: fmtDate(session.ouverture_at),           Icon: Clock       },
    { label: 'Fermeture',             value: fmtDate(session.fermeture_at),           Icon: Clock       },
    { label: 'Durée',                 value: duree(session.ouverture_at, session.fermeture_at), Icon: Clock },
    { label: 'Adresse IP',            value: session.ip_address  ?? '—',              Icon: Wifi        },
    { label: 'Terminal / navigateur', value: session.device_id   ?? '—',              Icon: Monitor     },
    { label: 'Tentatives ouverture',  value: String(session.tentatives_ouverture),    Icon: AlertTriangle },
    { label: 'Nb transactions',       value: String(session.nb_transactions ?? '—'),  Icon: FileText    },
    { label: 'Agence',                value: session.branch_name ?? session.branch,   Icon: Landmark    },
  ];

  return (
    <div className="flex flex-col gap-3">

      {/* Grille audit */}
      <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
        {rows.map(({ label, value, Icon }) => (
          <div key={label} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <Icon size={11} />{label}
            </span>
            <span className="text-xs font-semibold text-gray-700 text-right max-w-[55%] truncate">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Fermeture forcée */}
      {session.forcee_par && (
        <div className="flex flex-col gap-1.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs font-bold text-red-600 flex items-center gap-1.5">
            <AlertTriangle size={12} />
            Session fermée de force
          </p>
          <p className="text-xs text-red-500">
            Par : <span className="font-semibold">{session.forcee_par}</span>
          </p>
          {session.raison_forcage && (
            <p className="text-xs text-red-500">
              Raison : <span className="font-semibold">{session.raison_forcage}</span>
            </p>
          )}
        </div>
      )}

      {/* USD */}
      {session.devise === 'USD' && session.taux_change && (
        <div className="flex flex-col gap-1.5 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
          <p className="font-bold">Session en USD</p>
          <p>Taux figé à l'ouverture : <span className="font-semibold">{session.taux_change}</span></p>
          <p className="text-blue-400 italic">
            Ce taux ne sera jamais recalculé rétroactivement (règle d'audit).
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MODAL PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function SessionDetailModal({ session, onClose }: Props) {
  const [tab,          setTab]          = useState<Tab>('resume');
  const [transactions, setTransactions] = useState<CaisseTransaction[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await AxiosInstance.get<CaisseTransaction[]>(
          `/sessions/${session.id}/transactions/`
        );
        setTransactions(data);
      } catch {
        // TODO : retirer mockTransactions() quand l'API /sessions/{id}/transactions/ est prête
        setTransactions(mockTransactions(session.id));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session.id]);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'resume',       label: 'Résumé'       },
    { key: 'timeline',     label: 'Timeline'     },
    { key: 'transactions', label: 'Transactions' },
    { key: 'audit',        label: 'Audit'        },
  ];

  const open = session.statut === 'ouverte';

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <div className="flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              open ? 'bg-[#DDEAD5]' : 'bg-gray-100'
            }`}>
              <FileText className={`w-5 h-5 ${open ? 'text-[#2E7D32]' : 'text-gray-400'}`} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Session {session.numero_caisse}
              </h2>
              <p className="text-xs text-gray-400">
                {session.caissier_nom ?? session.username} · {fmtDate(session.ouverture_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {open ? '● En cours' : '✓ Fermée'}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-100 shrink-0 overflow-x-auto">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                tab === key
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {tab === 'resume'       && <ResumeTab       session={session} transactions={transactions} />}
              {tab === 'timeline'     && <TimelineTab     session={session} transactions={transactions} />}
              {tab === 'transactions' && <TransactionsTab session={session} transactions={transactions} />}
              {tab === 'audit'        && <AuditTab        session={session} />}
            </>
          )}
        </div>

      </div>
    </Modal>
  );
}