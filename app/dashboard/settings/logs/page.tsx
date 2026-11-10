'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollText,
  ShieldAlert,
  AlertCircle,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import PageHeader from '@/app/components/header';
import { RoleGate } from '@/app/components/core/RoleGate';
import SystemLogsTable from '@/app/components/settings/SystemLogsTable';
import { AuditLog, fetchAuditLogs } from '@/app/lib/api/audit';

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAuditLogs({ page_size: 200 });
      setLogs(data.results || []);
    } catch (err: any) {
      console.error('Erreur chargement logs système:', err);
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.message ||
        'Impossible de charger les journaux d’audit système.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Statistiques rapides
  const totalLogs = logs.length;
  const successCount = logs.filter((l) => l.status === 'SUCCESS').length;
  const failureCount = logs.filter((l) => l.status === 'FAILED').length;
  const loginCount = logs.filter((l) => (l.action || '').toUpperCase().includes('LOGIN')).length;

  return (
    <RoleGate
      roles={['administrateur', 'admin']}
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Accès réservé aux administrateurs
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md">
            Le journal d&apos;audit système contient la traçabilité complète des actions et accès sur la plateforme.
            Seuls les administrateurs ont l&apos;autorisation de consulter ces enregistrements.
          </p>
        </div>
      }
    >
      <div className="w-full min-h-screen bg-linear-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-3 sm:p-6 md:p-8 flex flex-col gap-6">
        {/* En-tête standard Caposa */}
        <PageHeader
          title="Logs & Audit Système"
          subtitle="Traçabilité complète des actions, connexions et modifications sur la plateforme"
          icon={<ScrollText className="w-6 h-6 text-[#2E7D32]" />}
          className="mb-0"
        />

        {/* Message d'alerte si échec API */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-sm font-medium text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <p className="font-semibold">Erreur de communication avec le serveur</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
            <button
              onClick={loadLogs}
              className="px-4 py-2 bg-linear-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Tableau des logs système paginé avec filtres & export CSV */}
        <SystemLogsTable
          logs={logs}
          isLoading={isLoading}
          onRefresh={loadLogs}
        />
      </div>
    </RoleGate>
  );
}
