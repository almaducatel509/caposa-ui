'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileWarning, Loader2 } from 'lucide-react';
import { CaisseSession } from '@/types/caisse';
import AxiosInstance from '@/app/lib/axiosInstance';

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

interface AuditSessionProviderProps {
  sessionId: string;
  children:  (session: CaisseSession & { ferme_par?: string }) => React.ReactNode;
}

export default function AuditSessionProvider({ sessionId, children }: AuditSessionProviderProps) {
  const router    = useRouter();
  const [session, setSession] = useState<(CaisseSession & { ferme_par?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await AxiosInstance.get(`/sessions/${sessionId}/`);
        setSession(data);
      } catch {
        setSession(MOCK_SESSION);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  useEffect(() => {
    if (session) {
      document.title = `Audit · ${session.caissier_nom ?? session.username} · CAPOSA`;
    }
    return () => { document.title = 'CAPOSA'; };
  }, [session]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-[#2E7D32]" />
    </div>
  );

  if (!session) return (
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

  return <>{children(session)}</>;
}