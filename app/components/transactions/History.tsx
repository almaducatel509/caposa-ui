'use client'
import React, { useState, useMemo } from 'react';
import { TrendingDown, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { mockTransactions } from './mockTransactions';
import { TransactionData } from './types';
import PageHeader from '../header';
import { PiHandWithdraw, PiUsersFourThin } from 'react-icons/pi';
import WithdrawalFilterBar from './withdrawals/WithdrawalsFIlter';
import { fetchTransactions } from '@/app/lib/api/transactions';
import { BiImport, BiMoneyWithdraw } from 'react-icons/bi';
import { FaSync } from 'react-icons/fa';
import { GiReceiveMoney } from 'react-icons/gi';

const Dashboard = () => {
  // États pour les filtres
  const [searchValue, setSearchValue] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  
  // Fonction pour gérer la sélection individuelle
  const handleRowSelect = (id: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // Fonction pour tout sélectionner/désélectionner
  const handleSelectAll = () => {
    if (selectedRows.size === filteredTransactions.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredTransactions.map(t => t.id)));
    }
  };

  const statusConfig = {
    completed: { icon: CheckCircle, label: 'Complété', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    pending: { icon: Clock, label: 'En attente', color: 'text-amber-700', bg: 'bg-amber-100' },
    processing: { icon: AlertCircle, label: 'En cours', color: 'text-blue-700', bg: 'bg-blue-100' },
    failed: { icon: XCircle, label: 'Échoué', color: 'text-rose-700', bg: 'bg-rose-100' }
  };

  // Filtrage des transactions (avec recherche + période + statut)
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(t => {
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchSearch = !searchValue || 
        (t.member_name && t.member_name.toLowerCase().includes(searchValue.toLowerCase())) ||
        t.description.toLowerCase().includes(searchValue.toLowerCase()) ||
        (t.reference && t.reference.toLowerCase().includes(searchValue.toLowerCase())) ||
        (t.account_number && t.account_number.toLowerCase().includes(searchValue.toLowerCase()));
      
      let matchPeriod = true;
      if (periodFilter !== 'all') {
        const date = new Date(t.created_at);
        const now = new Date();
        
        if (periodFilter === 'recent') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchPeriod = date >= thirtyDaysAgo;
        } else if (periodFilter === 'thisMonth') {
          matchPeriod = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        } else if (periodFilter === 'thisYear') {
          matchPeriod = date.getFullYear() === now.getFullYear();
        }
      }
      
      return matchStatus && matchSearch && matchPeriod;
    });
  }, [statusFilter, searchValue, periodFilter]);

  // Calcul des statistiques
  const stats = useMemo(() => {
    const completed = mockTransactions.filter(t => t.status === 'completed');
    return {
      totalWithdrawals: completed.reduce((sum, t) => sum + t.amount, 0),
      totalCount: mockTransactions.length,
      completed: completed.length,
      pending: mockTransactions.filter(t => t.status === 'pending').length,
      processing: mockTransactions.filter(t => t.status === 'processing').length,
      failed: mockTransactions.filter(t => t.status === 'failed').length
    };
  }, []);

  // Données pour le graphique
  const chartData = useMemo(() => {
    const withdrawalsByDate = mockTransactions
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => {
        const date = new Date(t.created_at).toLocaleDateString('fr-CA');
        acc[date] = (acc[date] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(withdrawalsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        montant: amount,
        fullDate: date
      }));
  }, []);

  const chartStats = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 0 };
    const amounts = chartData.map(d => d.montant);
    return {
      min: Math.min(...amounts),
      max: Math.max(...amounts)
    };
  }, [chartData]);

  // Groupement par date
  const groupedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sorted.reduce((acc, transaction) => {
      const date = new Date(transaction.created_at);
      const key = date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!acc[key]) acc[key] = [];
      acc[key].push(transaction);
      return acc;
    }, {} as Record<string, TransactionData[]>);
  }, [filteredTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CA', { 
      style: 'currency', 
      currency: 'CAD' 
    }).format(amount);
  };

  const handleExport = () => {
    console.log('Export des retraits...');
  };

  const handleClear = () => {
    setSearchValue('');
  };
const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Erreur chargement transactions:', err);
      setError('Erreur lors de la récupération des transactions.');
    } finally {
      setLoading(false);
    }
  };
 const handleRefresh = () => {
    loadTransactions();
  };

  const handleNewTransaction = () => {
    console.log('Nouvelle transaction');
  };

  return (
    <div className=" w-full space-y-8 min-h-screen 
    bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 
    p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
          <div className="flex justify-between items-center">
            <PageHeader
            title="Gestion des Retraits"
            subtitle="Gérez tous les retraits et leurs informations"
            icon={<GiReceiveMoney   className="font-light text-4xl" />}
          />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-green-600 text-green-600 rounded-4xl hover:bg-green-100 transition-colors font-medium"
            >
              <FaSync className="text-sm" />
              Actualiser
            </button>
            <button
              onClick={handleNewTransaction}
              className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-4xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              <PiHandWithdraw   className="text-xl" />
                Retirer 
            </button>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl shadow-lg shadow-rose-100 p-6 border border-rose-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <TrendingDown className="w-8 h-8 text-rose-600" />
              <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalWithdrawals)}</p>
            <p className="text-xs text-slate-500 mt-1">Retraits complétés</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-emerald-100 p-6 border border-emerald-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                Complétés
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.completed}</p>
            <p className="text-xs text-slate-500 mt-1">Transactions</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-amber-100 p-6 border border-amber-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                En attente
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
            <p className="text-xs text-slate-500 mt-1">Transactions</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-blue-100 p-6 border border-blue-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <AlertCircle className="w-8 h-8 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                En cours
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.processing}</p>
            <p className="text-xs text-slate-500 mt-1">Transactions</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-red-100 p-6 border border-red-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">
                Échoués
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.failed}</p>
            <p className="text-xs text-slate-500 mt-1">Transactions</p>
          </div>
        </div>

        {/* Graphique */}
        {chartData.length > 0 && (
          <div className="bg-linear-to-br from-rose-500 via-rose-600 to-red-600 rounded-2xl shadow-lg p-6 border border-rose-400">
            <h3 className="text-lg font-semibold text-white mb-4">Évolution des retraits</h3>
            <div className="relative" style={{ height: '200px' }}>
              <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none" className="overflow-visible">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb7185" stopOpacity="0.6"/>
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                
                {[0, 1, 2, 3, 4].map(i => (
                  <line
                    key={i}
                    x1="0"
                    y1={i * 50}
                    x2="800"
                    y2={i * 50}
                    stroke="rgba(255,255,255,0.1)"
                    strokeDasharray="4 4"
                  />
                ))}

                {chartData.length > 1 && (() => {
                  const width = 800;
                  const height = 200;
                  const padding = 20;
                  const stepX = (width - padding * 2) / (chartData.length - 1);
                  const range = chartStats.max - chartStats.min || 1;
                  
                  let pathD = `M ${padding} ${height - padding}`;
                  
                  chartData.forEach((point, i) => {
                    const x = padding + i * stepX;
                    const y = height - padding - ((point.montant - chartStats.min) / range) * (height - padding * 2);
                    pathD += ` L ${x} ${y}`;
                  });
                  
                  pathD += ` L ${padding + (chartData.length - 1) * stepX} ${height - padding} Z`;
                  
                  return <path d={pathD} fill="url(#areaGradient)" />;
                })()}

                {chartData.length > 1 && (() => {
                  const width = 800;
                  const height = 200;
                  const padding = 20;
                  const stepX = (width - padding * 2) / (chartData.length - 1);
                  const range = chartStats.max - chartStats.min || 1;
                  
                  let pathD = '';
                  
                  chartData.forEach((point, i) => {
                    const x = padding + i * stepX;
                    const y = height - padding - ((point.montant - chartStats.min) / range) * (height - padding * 2);
                    pathD += `${i === 0 ? 'M' : ' L'} ${x} ${y}`;
                  });
                  
                  return (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#fb7185"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })()}
              </svg>

              <div className="flex justify-between mt-2 px-2">
                {chartData.map((point, i) => (
                  <span key={i} className="text-xs text-rose-200">
                    {point.date}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="text-white">
                  <p className="text-2xl font-bold">{formatCurrency(chartStats.max)}</p>
                  <p className="text-xs text-rose-200">Pic de retrait</p>
                </div>
                <div className="text-right text-white">
                  <p className="text-lg font-semibold">{chartData.length}</p>
                  <p className="text-xs text-rose-200">Jours actifs</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barre de filtres */}
        <WithdrawalFilterBar
          filterValue={searchValue}
          selectedFilter={periodFilter}
          selectedStatus={statusFilter}
          onSearchChange={(value) => setSearchValue(value || '')}
          onClear={handleClear}
          onFilterChange={setPeriodFilter}
          onStatusChange={setStatusFilter}
          onExport={handleExport}
          totalCount={filteredTransactions.length}
        />

        {/* Liste des transactions - Style Table Fintech */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header de la table */}
          <div className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 items-center text-xs font-semibold text-slate-600 uppercase tracking-wide">
              <div className="col-span-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedRows.size === filteredTransactions.length && filteredTransactions.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
              </div>
              <div className="col-span-3">Membre & Transaction</div>
              <div className="col-span-2">Référence</div>
              <div className="col-span-2">Montant</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-1">Date & Heure</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>

          {/* Badge de sélection */}
          {selectedRows.size > 0 && (
            <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-rose-700">
                  {selectedRows.size} transaction{selectedRows.size > 1 ? 's' : ''} sélectionnée{selectedRows.size > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setSelectedRows(new Set())}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium underline"
                >
                  Désélectionner tout
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-white border-2 border-rose-600 text-rose-600 rounded-lg text-sm font-semibold hover:bg-rose-50 transition-colors">
                  Exporter la sélection
                </button>
                <button className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors">
                  Actions groupées
                </button>
              </div>
            </div>
          )}

          {/* Corps de la table */}
          <div className="divide-y divide-slate-100">
            {Object.entries(groupedTransactions).map(([date, transactions]) => (
              <div key={date}>
                {/* Séparateur de date */}
                <div className="bg-slate-50 px-6 py-2 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{date}</p>
                </div>

                {/* Lignes de transactions */}
                {transactions.map((transaction, index) => {
                  const statusConf = statusConfig[transaction.status];
                  const StatusIcon = statusConf.icon;
                  const isSelected = selectedRows.has(transaction.id);

                  return (
                    <div
                      key={transaction.id}
                      className={`
                        grid grid-cols-12 gap-4 items-center px-6 py-4
                        hover:bg-rose-50/50 transition-all duration-200
                        group cursor-pointer
                        ${isSelected ? 'bg-rose-50 border-l-4 border-rose-500' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                      `}
                    >
                      {/* Colonne 0: Checkbox */}
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(transaction.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </div>

                      {/* Colonne 1: Membre & Transaction */}
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingDown className="w-5 h-5 text-rose-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-rose-600 transition-colors">
                            {transaction.member_name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{transaction.description}</p>
                        </div>
                      </div>

                      {/* Colonne 2: Référence */}
                      <div className="col-span-2">
                        <div className="inline-flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                            {transaction.reference}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{transaction.account_number}</p>
                      </div>

                      {/* Colonne 3: Montant */}
                      <div className="col-span-2">
                        <p className="text-lg font-bold text-rose-600">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-slate-500">CAD</p>
                      </div>

                      {/* Colonne 4: Statut */}
                      <div className="col-span-2">
                        <span className={`
                          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                          ${statusConf.bg} ${statusConf.color}
                          border-2 ${statusConf.bg.replace('bg-', 'border-')}
                        `}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConf.label}
                        </span>
                      </div>

                      {/* Colonne 5: Date & Heure */}
                      <div className="col-span-1">
                        <p className="text-sm font-medium text-slate-700">
                          {new Date(transaction.created_at).toLocaleDateString('fr-FR', { 
                            day: '2-digit',
                            month: 'short'
                          })}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(transaction.created_at).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>

                      {/* Colonne 6: Actions */}
                      <div className="col-span-1 flex items-center justify-center gap-2">
                        <button 
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Voir détails', transaction.id);
                          }}
                        >
                          <svg className="w-4 h-4 text-slate-600 group-hover/btn:text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Menu', transaction.id);
                          }}
                        >
                          <svg className="w-4 h-4 text-slate-600 group-hover/btn:text-slate-800" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* État vide */}
          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 text-lg font-semibold mb-2">Aucune transaction trouvée</p>
              <p className="text-slate-500 text-sm">Essayez de modifier vos filtres pour voir plus de résultats</p>
            </div>
          )}
        </div>
      </div>
  );
};

export default Dashboard;