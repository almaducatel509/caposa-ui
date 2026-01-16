'use client'
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, LineChart, Line } from 'recharts';
import { Search, Calendar, DollarSign, Users, TrendingUp, CheckCircle, Clock, AlertCircle, XCircle, ArrowLeftRight } from 'lucide-react';

// Types
interface TransferData {
  id: number;
  compteSource: string;
  compteDestination: string;
  montant: number;
  reference: string;
  type: 'internal' | 'interac' | 'wire' | 'other';
  description?: string;
  effectuePar: string;
  memberName: string;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  created_at: string;
}

// KPI Card Component
const KPICard = ({ icon: Icon, label, value, subValue, color }: any) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-sm text-gray-600">{label}</p>
    {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
  </div>
);

const TransferDashboard = () => {
  // États
  const [periodFilter, setPeriodFilter] = useState<'day' | 'week' | 'month'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // Génération de données échantillon (Lun-Ven, 9h-17h)
  const generateSampleTransfers = (): TransferData[] => {
    const types: Array<'internal' | 'interac' | 'wire' | 'other'> = ['internal', 'internal', 'internal', 'internal']; // Principalement internes
    const statuses: Array<'completed' | 'pending' | 'processing' | 'failed'> = ['completed', 'completed', 'completed', 'pending', 'processing', 'failed'];
    const members = ['Alice Tremblay', 'Bob Martin', 'Charlie Dubois', 'Diana Roy', 'Ethan Gagnon', 'Fiona Côté', 'Gabriel Lavoie', 'Hannah Bergeron'];
    const employees = ['Jean Dupont', 'Marie Lefebvre', 'Pierre Gagnon'];
    const accountTypes = ['Épargne', 'Chèque', 'Placement'];
    
    const data: TransferData[] = [];
    const daysBack = periodFilter === 'day' ? 1 : periodFilter === 'week' ? 7 : 30;
    let attempts = 0;
    
    // Générer 80 transferts pendant les heures ouvrables
    for (let i = 0; i < 80 && attempts < 200; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
      
      // Sauter les weekends (0 = Dimanche, 6 = Samedi)
      if (date.getDay() === 0 || date.getDay() === 6) {
        i--;
        attempts++;
        continue;
      }
      
      // Heures ouvrables: 9h-17h
      date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
      
      const type = types[Math.floor(Math.random() * types.length)];
      const amount = Math.floor(Math.random() * 10000) + 100;
      const sourceType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
      const destType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
      
      data.push({
        id: i + 1,
        compteSource: `${sourceType.substring(0, 3).toUpperCase()}${1000 + Math.floor(Math.random() * 100)}`,
        compteDestination: `${destType.substring(0, 3).toUpperCase()}${2000 + Math.floor(Math.random() * 100)}`,
        montant: amount,
        reference: `TRF-2025-${String(i + 1).padStart(4, '0')}`,
        type: type,
        description: Math.random() > 0.5 ? `Transfert ${sourceType} → ${destType}` : undefined,
        effectuePar: Math.floor(1000 + Math.random() * 9000).toString(),
        memberName: members[Math.floor(Math.random() * members.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        created_at: date.toISOString()
      });
      attempts++;
    }
    
    return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const transfers = useMemo(() => generateSampleTransfers(), [periodFilter]);

  // Filtrage des transferts
  const filteredTransfers = useMemo(() => {
    return transfers.filter(t => {
      const matchesSearch = t.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.compteSource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.compteDestination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.reference.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesMinAmount = !minAmount || t.montant >= parseFloat(minAmount);
      const matchesMaxAmount = !maxAmount || t.montant <= parseFloat(maxAmount);
      
      return matchesSearch && matchesStatus && matchesType && matchesMinAmount && matchesMaxAmount;
    });
  }, [transfers, searchTerm, statusFilter, typeFilter, minAmount, maxAmount]);

  // Fonctions de sélection
  const handleRowSelect = (id: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === filteredTransfers.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredTransfers.map(t => t.id)));
    }
  };

  // Groupement par date
  const groupedTransfers = useMemo(() => {
    const sorted = [...filteredTransfers].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sorted.reduce((acc, transfer) => {
      const date = new Date(transfer.created_at);
      const key = date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!acc[key]) acc[key] = [];
      acc[key].push(transfer);
      return acc;
    }, {} as Record<string, TransferData[]>);
  }, [filteredTransfers]);

  // Calculs des KPIs
  const completedTransfers = transfers.filter(t => t.status === 'completed');
  const totalAmount = completedTransfers.reduce((sum, t) => sum + t.montant, 0);
  const averageAmount = completedTransfers.length > 0 ? totalAmount / completedTransfers.length : 0;
  const uniqueMembers = new Set(completedTransfers.map(t => t.memberName)).size;
  const completionRate = transfers.length > 0 ? (completedTransfers.length / transfers.length) * 100 : 0;

  // Graphique: Volume par jour (Lun-Ven uniquement)
  const volumeByDay = useMemo(() => {
    const days = periodFilter === 'day' ? 9 : periodFilter === 'week' ? 5 : 22;
    const data = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      
      if (periodFilter === 'day') {
        const hour = 9 + i;
        date.setHours(hour, 0, 0, 0);
        return { label: `${hour}h`, date: date.toISOString(), count: 0, amount: 0 };
      } else {
        let daysBack = 0;
        let workDaysCount = 0;
        while (workDaysCount < days - i) {
          daysBack++;
          const tempDate = new Date();
          tempDate.setDate(tempDate.getDate() - daysBack);
          if (tempDate.getDay() !== 0 && tempDate.getDay() !== 6) {
            workDaysCount++;
          }
        }
        date.setDate(date.getDate() - daysBack);
        return {
          label: date.toLocaleDateString('fr-CA', { weekday: 'short', day: 'numeric' }),
          date: date.toISOString().split('T')[0],
          count: 0,
          amount: 0
        };
      }
    });

    transfers.forEach(t => {
      const transferDate = new Date(t.created_at);
      const index = data.findIndex(item => {
        if (periodFilter === 'day') {
          return new Date(item.date).getHours() === transferDate.getHours();
        } else {
          return item.date === t.created_at.split('T')[0];
        }
      });
      if (index >= 0) {
        data[index].count++;
        data[index].amount += t.montant;
      }
    });

    return data;
  }, [transfers, periodFilter]);

  // Répartition par type
  const typeDistribution = useMemo(() => {
    const types = {
      internal: { count: 0, amount: 0, label: 'Interne', color: '#3b82f6' },
      interac: { count: 0, amount: 0, label: 'Interac', color: '#10b981' },
      wire: { count: 0, amount: 0, label: 'Virement bancaire', color: '#8b5cf6' },
      other: { count: 0, amount: 0, label: 'Autre', color: '#f59e0b' }
    };

    transfers.forEach(t => {
      types[t.type].count++;
      types[t.type].amount += t.montant;
    });

    return Object.values(types).map(t => ({
      name: t.label,
      value: t.count,
      amount: t.amount,
      color: t.color
    }));
  }, [transfers]);

  // Répartition par statut
  const statusDistribution = useMemo(() => {
    const statuses = {
      completed: { count: 0, label: 'Complété', color: '#10b981' },
      pending: { count: 0, label: 'En attente', color: '#f59e0b' },
      processing: { count: 0, label: 'En traitement', color: '#3b82f6' },
      failed: { count: 0, label: 'Échoué', color: '#ef4444' }
    };

    transfers.forEach(t => {
      statuses[t.status].count++;
    });

    return Object.values(statuses);
  }, [transfers]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      internal: 'Interne',
      interac: 'Interac',
      wire: 'Virement',
      other: 'Autre'
    };
    return labels[type as keyof typeof labels];
  };

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-indigo-50 md:p-8">
      {/* Filtre de période */}
      <div className="mb-6 flex gap-3">
        {(['day', 'week', 'month'] as const).map(period => (
          <button
            key={period}
            onClick={() => setPeriodFilter(period)}
            className={`px-4 py-2 rounded-4xl text-sm font-medium transition-all ${
              periodFilter === period
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {period === 'day' ? 'Aujourd\'hui' : period === 'week' ? '7 jours' : '30 jours'}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <KPICard
          icon={DollarSign}
          label="Montant total"
          value={formatCurrency(totalAmount)}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <KPICard
          icon={ArrowLeftRight}
          label="Nombre de transferts"
          value={transfers.length}
          subValue={`${completedTransfers.length} complétés`}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <KPICard
          icon={TrendingUp}
          label="Moyenne par transfert"
          value={formatCurrency(averageAmount)}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
        <KPICard
          icon={Users}
          label="Membres actifs"
          value={uniqueMembers}
          subValue="membres"
          color="bg-gradient-to-br from-pink-500 to-pink-600"
        />
        <KPICard
          icon={CheckCircle}
          label="Taux de complétion"
          value={`${completionRate.toFixed(1)}%`}
          color="bg-gradient-to-br from-teal-500 to-teal-600"
        />
        <KPICard
          icon={Clock}
          label="En attente"
          value={transfers.filter(t => t.status === 'pending').length}
          subValue="nécessitent attention"
          color="bg-gradient-to-br from-amber-500 to-amber-600"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Volume */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Volume des Transferts</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={volumeByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} name="Nombre" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Montants */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Montants Transférés</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={volumeByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} 
              />
              <Bar dataKey="amount" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Montant" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par type */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition par Type</h3>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number | undefined, name: string | undefined, props: any) => {
                    if (value === undefined) return ['', ''];
                    return [`${value} (${formatCurrency(props.payload.amount)})`, name || ''];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {typeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statuts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Statut des Transferts</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis type="category" dataKey="label" stroke="#6b7280" fontSize={12} width={100} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} name="Transferts">
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau filtrable */}
      <div className="rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center justify-between px-6 py-5 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Historique des Transferts</h3>
          <span className="text-sm text-gray-500">{filteredTransfers.length} résultats</span>
        </div>

        {/* Filtres */}
        <div className="px-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Complété</option>
            <option value="pending">En attente</option>
            <option value="processing">En traitement</option>
            <option value="failed">Échoué</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="all">Tous les types</option>
            <option value="internal">Interne</option>
            <option value="interac">Interac</option>
            <option value="wire">Virement</option>
            <option value="other">Autre</option>
          </select>

          <input
            type="number"
            placeholder="Montant min"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          <input
            type="number"
            placeholder="Montant max"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          {/* Header de la table */}
          <div className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 items-center text-xs font-semibold text-slate-600 uppercase tracking-wide">
              <div className="col-span-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedRows.size === filteredTransfers.length && filteredTransfers.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </div>
              <div className="col-span-1">Date</div>
              <div className="col-span-2">Membre</div>
              <div className="col-span-2">Comptes</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-2">Montant</div>
              <div className="col-span-1">Statut</div>
              <div className="col-span-1">Effectué par</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>

          {/* Badge de sélection */}
          {selectedRows.size > 0 && (
            <div className="bg-purple-50 border-b border-purple-200 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-purple-700">
                  {selectedRows.size} transfert{selectedRows.size > 1 ? 's' : ''} sélectionné{selectedRows.size > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setSelectedRows(new Set())}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium underline"
                >
                  Désélectionner tout
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-white border-2 border-purple-600 text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors">
                  Exporter la sélection
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                  Actions groupées
                </button>
              </div>
            </div>
          )}

          {/* Corps de la table */}
          <div className="divide-y divide-slate-100">
            {Object.entries(groupedTransfers).map(([date, transfers]) => (
              <div key={date}>
                {/* Séparateur de date */}
                <div className="bg-slate-50 px-6 py-2 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{date}</p>
                </div>

                {/* Lignes de transferts */}
                {transfers.map((transfer, index) => {
                  const statusConf = {
                    completed: { icon: CheckCircle, label: 'Complété', color: 'text-emerald-700', bg: 'bg-emerald-100' },
                    pending: { icon: Clock, label: 'En attente', color: 'text-amber-700', bg: 'bg-amber-100' },
                    processing: { icon: AlertCircle, label: 'En cours', color: 'text-blue-700', bg: 'bg-blue-100' },
                    failed: { icon: XCircle, label: 'Échoué', color: 'text-rose-700', bg: 'bg-rose-100' }
                  }[transfer.status];
                  const StatusIcon = statusConf.icon;
                  const isSelected = selectedRows.has(transfer.id);

                  return (
                    <div
                      key={transfer.id}
                      className={`
                        grid grid-cols-12 gap-4 items-center px-6 py-4
                        hover:bg-purple-50/50 transition-all duration-200
                        group cursor-pointer
                        ${isSelected ? 'bg-purple-50 border-l-4 border-purple-500' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                      `}
                    >
                      {/* Checkbox */}
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(transfer.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </div>

                      {/* Date */}
                      <div className="col-span-1">
                        <p className="text-sm font-medium text-slate-700">
                          {new Date(transfer.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(transfer.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Membre */}
                      <div className="col-span-2 flex items-center gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ArrowLeftRight className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-purple-600 transition-colors">
                            {transfer.memberName}
                          </p>
                          <p className="text-xs text-slate-500">{transfer.reference}</p>
                        </div>
                      </div>

                      {/* Comptes */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                            {transfer.compteSource}
                          </span>
                          <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          <span className="text-xs font-mono text-slate-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                            {transfer.compteDestination}
                          </span>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="col-span-1">
                        <p className="text-xs text-slate-600">{getTypeLabel(transfer.type)}</p>
                      </div>

                      {/* Montant */}
                      <div className="col-span-2">
                        <p className="text-lg font-bold text-purple-600">
                          {formatCurrency(transfer.montant)}
                        </p>
                        <p className="text-xs text-slate-500">CAD</p>
                      </div>

                      {/* Statut */}
                      <div className="col-span-1">
                        <span className={`
                          inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold
                          ${statusConf.bg} ${statusConf.color}
                          border-2 ${statusConf.bg.replace('bg-', 'border-')}
                        `}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConf.label}
                        </span>
                      </div>

                      {/* Effectué par */}
                      <div className="col-span-1 px-2.5">
                        <p className="text-xs p-1.5 font-semibold text-slate-600 truncate">{transfer.effectuePar}</p>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-center gap-2">
                        <button 
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Voir détails', transfer.id);
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
                            console.log('Menu', transfer.id);
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
          {filteredTransfers.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 text-lg font-semibold mb-2">Aucun transfert trouvé</p>
              <p className="text-slate-500 text-sm">Essayez de modifier vos filtres pour voir plus de résultats</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferDashboard;