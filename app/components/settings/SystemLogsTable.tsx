'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  FileDown,
  Clock,
  User,
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
  SlidersHorizontal,
  Check,
  X,
} from 'lucide-react';
import Pagination from '@/app/components/ui/Pagination';
import { AuditLog } from '@/app/lib/api/audit';

interface SystemLogsTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function SystemLogsTable({
  logs,
  isLoading,
  onRefresh,
}: SystemLogsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Filtrage
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchTerm === '' ||
        (log.username && log.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.actor_name && log.actor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.module && log.module.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.target_repr && log.target_repr.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.description && log.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.ip_address && log.ip_address.includes(searchTerm));

      const matchesAction = filterAction === 'all' || log.action === filterAction;
      const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
      const matchesModule = filterModule === 'all' || log.module === filterModule;

      return matchesSearch && matchesAction && matchesStatus && matchesModule;
    });
  }, [logs, searchTerm, filterAction, filterStatus, filterModule]);

  // Réinitialiser la page lors du changement de filtre
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleActionChange = (val: string) => {
    setFilterAction(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setFilterStatus(val);
    setCurrentPage(1);
  };

  const handleModuleChange = (val: string) => {
    setFilterModule(val);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Sélection
  const paginatedIds = useMemo(() => paginatedLogs.map((l) => l.id), [paginatedLogs]);
  const allOnPageSelected = paginatedIds.length > 0 && paginatedIds.every((id) => selected.has(id));
  const someOnPageSelected = paginatedIds.some((id) => selected.has(id)) && !allOnPageSelected;

  const toggleAllOnPage = () => {
    const next = new Set(selected);
    if (allOnPageSelected) {
      paginatedIds.forEach((id) => next.delete(id));
    } else {
      paginatedIds.forEach((id) => next.add(id));
    }
    setSelected(next);
  };

  const selectAllFiltered = () => {
    setSelected(new Set(filteredLogs.map((l) => l.id)));
  };

  const clearSelection = () => {
    setSelected(new Set());
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  // Export CSV avec BOM UTF-8
  const handleExportCSV = (onlySelected: boolean = false) => {
    const logsToExport = onlySelected && selected.size > 0
      ? filteredLogs.filter((l) => selected.has(l.id))
      : filteredLogs;

    if (logsToExport.length === 0) return;

    const headers = [
      'Date & Heure',
      "Nom d'utilisateur",
      "Nom de l'acteur",
      'Rôle',
      'Action',
      'Module',
      'Statut',
      'Cible',
      'Description',
      'Adresse IP',
    ];

    const rows = logsToExport.map((log) => [
      new Date(log.created_at).toLocaleString('fr-FR'),
      log.username || '',
      log.actor_name || '',
      log.user_role || '',
      log.action_display || log.action || '',
      log.module || '',
      log.status_display || log.status || '',
      log.target_repr || log.target_id || '',
      (log.description || '').replace(/"/g, '""'),
      log.ip_address || '',
    ]);

    const csvContent =
      '\ufeff' +
      [
        headers.map((h) => `"${h}"`).join(';'),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(';')),
      ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute(
      'download',
      `caposa_logs_systeme_${onlySelected ? `selection_${logsToExport.length}_` : ''}${dateStr}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Liste des modules uniques trouvés
  const availableModules = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.module) set.add(l.module);
    });
    return Array.from(set);
  }, [logs]);

  // Helpers pour formater les données
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const getActionBadge = (action: string, actionDisplay?: string) => {
    const label = actionDisplay || action;
    const act = (action || '').toUpperCase();

    if (act.includes('LOGIN') || act.includes('CONNEXION')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          {label}
        </span>
      );
    }
    if (act.includes('LOGOUT') || act.includes('DECONNEXION')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          {label}
        </span>
      );
    }
    if (act.includes('CREATE') || act.includes('CREATION') || act.includes('DEPOSIT')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20] dark:bg-emerald-950/40 dark:text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
          {label}
        </span>
      );
    }
    if (act.includes('DELETE') || act.includes('SUPPRESSION') || act.includes('WITHDRAWAL')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {label}
        </span>
      );
    }
    if (act.includes('UPDATE') || act.includes('MODIFICATION') || act.includes('TRANSFER')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {label}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        {label}
      </span>
    );
  };

  const getStatusBadge = (status: string, statusDisplay?: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'SUCCESS' || s === 'SUCCES') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Succès
        </span>
      );
    }
    if (s === 'FAILED' || s === 'ECHEC') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300">
          <XCircle className="w-3 h-3 text-red-600" />
          Échec
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        Alerte
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
      {/* ─── Barre de filtre et d'actions (Style Caposa) ─── */}
      <div className="p-5 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Rechercher par utilisateur, action, cible, IP..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#F9F9F6] dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] dark:focus:border-[#4CAF50] text-gray-900 dark:text-zinc-100 placeholder-gray-400"
            />
          </div>

          {/* Boutons d'actions */}
          <div className="flex flex-wrap items-center gap-2">
            {selected.size > 0 ? (
              <>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20] border border-[#2E7D32]/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>{selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span>
                  <button
                    onClick={clearSelection}
                    className="ml-1 hover:text-red-600 transition-colors cursor-pointer"
                    title="Désélectionner tout"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleExportCSV(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#2E7D32] hover:bg-[#256628] shadow-sm transition-all cursor-pointer"
                  title="Exporter uniquement les logs sélectionnés au format CSV"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Exporter la sélection ({selected.size})
                </button>

                <button
                  onClick={() => handleExportCSV(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-[#F9F9F6] transition-all cursor-pointer"
                  title="Exporter tous les logs filtrés au format CSV"
                >
                  Tout exporter ({filteredLogs.length})
                </button>
              </>
            ) : (
              <button
                onClick={() => handleExportCSV(false)}
                disabled={filteredLogs.length === 0}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-[#F9F9F6] dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                title="Exporter tous les logs filtrés au format CSV"
              >
                <FileDown className="w-3.5 h-3.5 text-[#2E7D32] dark:text-[#81C784]" />
                Exporter CSV ({filteredLogs.length})
              </button>
            )}

            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 dark:text-zinc-400 hover:text-[#2E7D32] dark:hover:text-[#81C784] hover:bg-[#F9F9F6] dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl transition-all cursor-pointer"
              title="Rafraîchir les logs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#2E7D32]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ligne des sélecteurs de filtre */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-gray-100 dark:border-zinc-800/60 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-gray-400 dark:text-zinc-500">
            <Filter className="w-3.5 h-3.5" />
            Filtres :
          </span>

          {/* Filtre Action */}
          <select
            value={filterAction}
            onChange={(e) => handleActionChange(e.target.value)}
            className="py-1.5 px-3 bg-[#F9F9F6] dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#2E7D32] cursor-pointer"
          >
            <option value="all">Toutes les actions</option>
            <option value="LOGIN">Connexion</option>
            <option value="LOGOUT">Déconnexion</option>
            <option value="CREATE">Création</option>
            <option value="UPDATE">Modification</option>
            <option value="DELETE">Suppression</option>
            <option value="DEPOSIT">Dépôt</option>
            <option value="WITHDRAWAL">Retrait</option>
            <option value="TRANSFER">Transfert</option>
            <option value="SESSION_OPEN">Ouverture session</option>
            <option value="SESSION_CLOSE">Fermeture session</option>
            <option value="OTHER">Autre</option>
          </select>

          {/* Filtre Statut */}
          <select
            value={filterStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="py-1.5 px-3 bg-[#F9F9F6] dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#2E7D32] cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="SUCCESS">Succès</option>
            <option value="FAILED">Échec</option>
            <option value="WARNING">Avertissement</option>
          </select>

          {/* Filtre Module */}
          <select
            value={filterModule}
            onChange={(e) => handleModuleChange(e.target.value)}
            className="py-1.5 px-3 bg-[#F9F9F6] dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#2E7D32] cursor-pointer"
          >
            <option value="all">Tous les modules</option>
            {availableModules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {(searchTerm || filterAction !== 'all' || filterStatus !== 'all' || filterModule !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterAction('all');
                setFilterStatus('all');
                setFilterModule('all');
                setCurrentPage(1);
              }}
              className="text-xs text-[#2E7D32] hover:underline ml-auto font-medium cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Bannière d'aide quand toute la page est sélectionnée */}
        {allOnPageSelected && filteredLogs.length > paginatedLogs.length && (
          <div className="bg-[#DDEAD5]/50 border border-[#2E7D32]/20 rounded-xl px-4 py-2 text-xs text-[#1B5E20] flex items-center justify-between">
            <span>
              Tous les <span className="font-semibold">{paginatedLogs.length}</span> logs de cette page sont sélectionnés.
            </span>
            {selected.size < filteredLogs.length ? (
              <button
                type="button"
                onClick={selectAllFiltered}
                className="font-semibold underline hover:text-[#1B5E20] cursor-pointer"
              >
                Sélectionner les {filteredLogs.length} logs filtrés
              </button>
            ) : (
              <span className="font-semibold">
                Tous les {filteredLogs.length} logs filtrés sont sélectionnés.
              </span>
            )}
          </div>
        )}
      </div>

      {/* ─── Table scrollable ─── */}
      <div className="table-scroll overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] dark:from-zinc-800 dark:to-zinc-800/60 border-b border-gray-200 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-300">
              <th className="py-3 px-3 w-10 text-center">
                <button
                  type="button"
                  onClick={toggleAllOnPage}
                  title={allOnPageSelected ? 'Tout désélectionner sur cette page' : 'Tout sélectionner sur cette page'}
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                    allOnPageSelected || someOnPageSelected
                      ? 'bg-[#2E7D32] border-[#2E7D32]'
                      : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                  }`}
                >
                  {allOnPageSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  {someOnPageSelected && !allOnPageSelected && <div className="w-2 h-0.5 bg-white rounded-full" />}
                </button>
              </th>
              <th className="py-3 px-4">Date & Heure</th>
              <th className="py-3 px-4">Utilisateur / Acteur</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Module</th>
              <th className="py-3 px-4">Cible & Description</th>
              <th className="py-3 px-4">Adresse IP</th>
              <th className="py-3 px-4 text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-14 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#2E7D32]" />
                    <p className="text-xs">Chargement du journal d&apos;audit...</p>
                  </div>
                </td>
              </tr>
            ) : paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-gray-500 dark:text-zinc-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#DDEAD5]/50 flex items-center justify-center text-[#2E7D32] mb-1">
                      <Activity className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-zinc-200 text-base">Aucun log enregistré</p>
                    <p className="text-xs text-gray-400 max-w-sm">
                      {searchTerm || filterAction !== 'all' || filterStatus !== 'all' || filterModule !== 'all'
                        ? 'Aucun résultat ne correspond à vos critères de recherche.'
                        : 'Les activités système et actions des utilisateurs apparaîtront ici.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log, idx) => {
                const isSelected = selected.has(log.id);
                return (
                  <tr
                    key={log.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-[#DDEAD5]/35 dark:bg-[#2E7D32]/15'
                        : idx % 2 === 0
                        ? 'bg-white dark:bg-zinc-900 hover:bg-green-50/20 dark:hover:bg-zinc-800/40'
                        : 'bg-gray-50/30 dark:bg-zinc-900/40 hover:bg-green-50/20 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleRow(log.id)}
                        className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2E7D32] border-[#2E7D32]'
                            : 'bg-white border-gray-300 hover:border-[#2E7D32]'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </button>
                    </td>

                    {/* Date & Heure */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-zinc-200">
                            {formatDate(log.created_at)}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono">
                            {formatTime(log.created_at)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Utilisateur / Acteur */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(log.actor_name || log.username || 'S')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-zinc-100 truncate">
                            {log.actor_name || log.username || 'Système'}
                          </p>
                          <div className="flex items-center gap-1.5">
                            {log.username && (
                              <span className="text-[11px] text-gray-400 font-mono">
                                @{log.username}
                              </span>
                            )}
                            {log.user_role && (
                              <span className="px-1.5 py-0.2 rounded-md bg-gray-100 dark:bg-zinc-800 text-[10px] text-gray-600 dark:text-zinc-300 font-medium">
                                {log.user_role}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.action, log.action_display)}
                    </td>

                    {/* Module */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 capitalize border border-gray-200 dark:border-zinc-700">
                        {log.module}
                      </span>
                    </td>

                    {/* Cible & Description */}
                    <td className="py-3 px-4 max-w-xs">
                      {log.target_repr && (
                        <p className="text-xs font-semibold text-gray-800 dark:text-zinc-200 truncate">
                          {log.target_repr}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2">
                        {log.description || '—'}
                      </p>
                    </td>

                    {/* Adresse IP */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 font-mono">
                        <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{log.ip_address || '—'}</span>
                      </div>
                    </td>

                    {/* Statut */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(log.status, log.status_display)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Footer avec Pagination (Harmonisé Caposa) ─── */}
      {!isLoading && filteredLogs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 dark:border-zinc-800 bg-[#F9F9F6] dark:bg-zinc-800/40 px-5 py-3 gap-3">
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Affichage de <span className="font-semibold text-gray-700 dark:text-zinc-200">{Math.min(filteredLogs.length, (currentPage - 1) * pageSize + 1)}</span> à{' '}
            <span className="font-semibold text-gray-700 dark:text-zinc-200">{Math.min(filteredLogs.length, currentPage * pageSize)}</span> sur{' '}
            <span className="font-semibold text-gray-700 dark:text-zinc-200">{filteredLogs.length}</span> log{filteredLogs.length !== 1 ? 's' : ''}
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredLogs.length}
            pageSize={pageSize}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}