'use client'
import React, { useState, useMemo } from 'react';
import { TfiWallet } from 'react-icons/tfi';
import { BarChart, Bar, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, LineChart, Line } from 'recharts';
import { Search, TrendingUp, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { FaSync } from 'react-icons/fa';

// Types
interface DepositData {
  id: number;
  idCompte: string;
  typeTransaction: 'DEPOSIT';
  codeAutorisation: string;
  montantTransaction: number;
  depositSubtype: 'cash' | 'check' | 'transfer' | 'other';
  source: string;
  description?: string;
  transferReference?: string;
  senderName?: string;
  requiresVerification: boolean;
  holdPeriod: number;
  availableImmediately: number;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  created_at: string;
  member_name: string;
}

// Header Component
const PageHeader = ({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) => (
  <div className="mb-2">
    <div className="flex items-center gap-4">
      {icon}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{subtitle}</p>
      </div>
    </div>
  </div>
);

const DepositDashboard = () => {
  // États
  const [periodFilter, setPeriodFilter] = useState<'day' | 'week' | 'month'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subtypeFilter, setSubtypeFilter] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

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
    if (selectedRows.size === filteredDeposits.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredDeposits.map(d => d.id)));
    }
  };
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // Configuration des statuts
  const statusConfig = {
    completed: { icon: CheckCircle, label: 'Complété', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    pending: { icon: Clock, label: 'En attente', color: 'text-amber-700', bg: 'bg-amber-100' },
    processing: { icon: AlertCircle, label: 'En cours', color: 'text-blue-700', bg: 'bg-blue-100' },
    failed: { icon: XCircle, label: 'Échoué', color: 'text-rose-700', bg: 'bg-rose-100' }
  };

// Types
interface DepositData {
  id: number;
  idCompte: string;
  typeTransaction: 'DEPOSIT';
  codeAutorisation: string;
  montantTransaction: number;
  depositSubtype: 'cash' | 'check' | 'transfer' | 'other';
  source: string;
  description?: string;
  transferReference?: string;
  senderName?: string;
  requiresVerification: boolean;
  holdPeriod: number;
  availableImmediately: number;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  created_at: string;
  member_name: string;
}

// Header Component
const PageHeader = ({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) => (
  <div className="mb-8">
    <div className="flex items-center gap-4 mb-2">
      {icon}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{subtitle}</p>
      </div>
    </div>
  </div>
);

// KPI Card Component
const KPICard = ({ icon: Icon, label, value, subValue, trend, color }: any) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className={`text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-sm text-gray-600">{label}</p>
    {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
  </div>
);

const DepositDashboard = () => {
  // États
  const [periodFilter, setPeriodFilter] = useState<'day' | 'week' | 'month'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subtypeFilter, setSubtypeFilter] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

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
    if (selectedRows.size === filteredDeposits.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredDeposits.map(d => d.id)));
    }
  };

  // Génération de données échantillon (Lun-Ven, 9h-17h)
  const generateSampleDeposits = (): DepositData[] => {
    const subtypes: Array<'cash' | 'check' | 'transfer' | 'other'> = ['cash', 'check', 'transfer', 'other'];
    const statuses: Array<'completed' | 'pending' | 'processing' | 'failed'> = ['completed', 'completed', 'completed', 'pending', 'processing', 'failed'];
    const members = ['Alice Tremblay', 'Bob Martin', 'Charlie Dubois', 'Diana Roy', 'Ethan Gagnon', 'Fiona Côté', 'Gabriel Lavoie', 'Hannah Bergeron'];
    const sources = ['Salaire', 'Remboursement', 'Épargne', 'Vente', 'Cadeau', 'Dividendes'];
    
    const data: DepositData[] = [];
    const daysBack = periodFilter === 'day' ? 1 : periodFilter === 'week' ? 7 : 30;
    let attempts = 0;
    
    // Générer 80 dépôts pendant les heures ouvrables
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
      
      const subtype = subtypes[Math.floor(Math.random() * subtypes.length)];
      const amount = Math.floor(Math.random() * 8000) + 200;
      const holdPeriod = subtype === 'check' ? Math.floor(Math.random() * 5) + 1 : 0;
      
      data.push({
        id: i + 1,
        idCompte: `ACC${1000 + i}`,
        typeTransaction: 'DEPOSIT',
        codeAutorisation: `AUTH${100000 + i}`,
        montantTransaction: amount,
        depositSubtype: subtype,
        source: sources[Math.floor(Math.random() * sources.length)],
        description: Math.random() > 0.5 ? 'Dépôt régulier' : undefined,
        transferReference: subtype === 'transfer' ? `REF${10000 + i}` : undefined,
        senderName: subtype === 'transfer' ? members[Math.floor(Math.random() * members.length)] : undefined,
        requiresVerification: subtype === 'check' || amount > 5000,
        holdPeriod: holdPeriod,
        availableImmediately: holdPeriod > 0 ? Math.floor(amount * 0.3) : amount,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        created_at: date.toISOString(),
        member_name: members[Math.floor(Math.random() * members.length)]
      });
      attempts++;
    }
    
    return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const deposits = useMemo(() => generateSampleDeposits(), [periodFilter]);

  // Filtrage des dépôts
  const filteredDeposits = useMemo(() => {
    return deposits.filter(d => {
      const matchesSearch = d.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           d.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           d.idCompte.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchesSubtype = subtypeFilter === 'all' || d.depositSubtype === subtypeFilter;
      const matchesMinAmount = !minAmount || d.montantTransaction >= parseFloat(minAmount);
      const matchesMaxAmount = !maxAmount || d.montantTransaction <= parseFloat(maxAmount);
      
      return matchesSearch && matchesStatus && matchesSubtype && matchesMinAmount && matchesMaxAmount;
    });
  }, [deposits, searchTerm, statusFilter, subtypeFilter, minAmount, maxAmount]);

  // Calculs des KPIs
  const completedDeposits = deposits.filter(d => d.status === 'completed');
  const totalAmount = completedDeposits.reduce((sum, d) => sum + d.montantTransaction, 0);
  const averageAmount = completedDeposits.length > 0 ? totalAmount / completedDeposits.length : 0;
  const uniqueMembers = new Set(completedDeposits.map(d => d.member_name)).size;
  const completionRate = deposits.length > 0 ? (completedDeposits.length / deposits.length) * 100 : 0;

  // Top 3 membres
  const topMembers = useMemo(() => {
    const memberTotals: Record<string, number> = {};
    completedDeposits.forEach(d => {
      memberTotals[d.member_name] = (memberTotals[d.member_name] || 0) + d.montantTransaction;
    });
    return Object.entries(memberTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, amount]) => ({ name, amount }));
  }, [completedDeposits]);

  // Graphique: Volume par jour (Lun-Ven uniquement)
  const volumeByDay = useMemo(() => {
    const days = periodFilter === 'day' ? 9 : periodFilter === 'week' ? 5 : 22; // Heures ou jours ouvrables
    const data = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      
      if (periodFilter === 'day') {
        // Heures: 9h-17h
        const hour = 9 + i;
        date.setHours(hour, 0, 0, 0);
        return { label: `${hour}h`, date: date.toISOString(), count: 0, amount: 0 };
      } else {
        // Jours: reculer et sauter les weekends
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

    // Compter les dépôts par période
    deposits.forEach(d => {
      const depositDate = new Date(d.created_at);
      const index = data.findIndex(item => {
        if (periodFilter === 'day') {
          return new Date(item.date).getHours() === depositDate.getHours();
        } else {
          return item.date === d.created_at.split('T')[0];
        }
      });
      if (index >= 0) {
        data[index].count++;
        data[index].amount += d.montantTransaction;
      }
    });

    return data;
  }, [deposits, periodFilter]);

  // Graphique: Répartition par type de dépôt
  const subtypeDistribution = useMemo(() => {
    const types = {
      cash: { count: 0, amount: 0, label: 'Espèces', color: '#10b981' },
      check: { count: 0, amount: 0, label: 'Chèque', color: '#3b82f6' },
      transfer: { count: 0, amount: 0, label: 'Virement', color: '#8b5cf6' },
      other: { count: 0, amount: 0, label: 'Autre', color: '#f59e0b' }
    };

    deposits.forEach(d => {
      types[d.depositSubtype].count++;
      types[d.depositSubtype].amount += d.montantTransaction;
    });

    return Object.values(types).map(t => ({
      name: t.label,
      value: t.count,
      amount: t.amount,
      color: t.color
    }));
  }, [deposits]);

  // Graphique: Répartition par statut
  const statusDistribution = useMemo(() => {
    const statuses = {
      completed: { count: 0, label: 'Complété', color: '#10b981' },
      pending: { count: 0, label: 'En attente', color: '#f59e0b' },
      processing: { count: 0, label: 'En traitement', color: '#3b82f6' },
      failed: { count: 0, label: 'Échoué', color: '#ef4444' }
    };

    deposits.forEach(d => {
      statuses[d.status].count++;
    });

    return Object.values(statuses);
  }, [deposits]);

  // Groupement par date
  const groupedDeposits = useMemo(() => {
    const sorted = [...filteredDeposits].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sorted.reduce((acc, deposit) => {
      const date = new Date(deposit.created_at);
      const key = date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!acc[key]) acc[key] = [];
      acc[key].push(deposit);
      return acc;
    }, {} as Record<string, DepositData[]>);
  }, [filteredDeposits]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800'
    };
    const labels = {
      completed: 'Complété',
      pending: 'En attente',
      processing: 'En traitement',
      failed: 'Échoué'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getSubtypeLabel = (subtype: string) => {
    const labels = {
      cash: 'Espèces',
      check: 'Chèque',
      transfer: 'Virement',
      other: 'Autre'
    };
    return labels[subtype as keyof typeof labels];
  };

  const getSubtypeLabel = (subtype: string) => {
    const labels = {
      cash: 'Espèces',
      check: 'Chèque',
      transfer: 'Virement',
      other: 'Autre'
    };
    return labels[subtype as keyof typeof labels];
  };

  const handleRefresh = () => {
    console.log('Refresh deposits');
  };

  const handleNewDeposit = () => {
    console.log('New deposit');
  };

  const handleExport = () => {
    console.log('Export deposits');
  };

  const handleClear = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSubtypeFilter('all');
    setMinAmount('');
    setMaxAmount('');
  };

  return (
    <div className="w-full space-y-8 min-h-screen bg-linear-to-br from-slate-50 via-green-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <PageHeader 
            title="Gestion des Dépôts"
            subtitle="Gérez tous les dépôts et leurs informations"
            icon={<TfiWallet className="text-4xl text-[#008152]" />}
          />
          
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#008152] text-[#008152] rounded-4xl hover:bg-green-100 transition-colors font-medium"
            >
              <FaSync className="text-sm" />
              Actualiser
            </button>
            <button
              onClick={handleNewDeposit}
              className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-4xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              <TfiWallet className="text-xl" />
              Nouveau Dépôt
            </button>
          </div>
        </div>

        {/* Filtre de période */}
        <div className="mb-6 flex gap-3">
          {(['day', 'week', 'month'] as const).map(period => (
            <button
              key={period}
              onClick={() => setPeriodFilter(period)}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                periodFilter === period
                  ? 'bg-[#008152] text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {period === 'day' ? 'Aujourd\'hui' : period === 'week' ? '7 jours' : '30 jours'}
            </button>
          ))}
        </div>

        {/* KPIs - Style Fintech */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-green-100 p-6 border border-green-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalAmount)}</p>
            <p className="text-xs text-slate-500 mt-1">Montant total</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-blue-100 p-6 border border-blue-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-8 h-8 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                Nombre
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{deposits.length}</p>
            <p className="text-xs text-slate-500 mt-1">{completedDeposits.length} complétés</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-purple-100 p-6 border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                Moyenne
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(averageAmount)}</p>
            <p className="text-xs text-slate-500 mt-1">Par dépôt</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-orange-100 p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-8 h-8 text-orange-600" />
              <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                Membres
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{uniqueMembers}</p>
            <p className="text-xs text-slate-500 mt-1">Actifs</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-teal-100 p-6 border border-teal-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-8 h-8 text-teal-600" />
              <span className="text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-1 rounded-full">
                Taux
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{completionRate.toFixed(1)}%</p>
            <p className="text-xs text-slate-500 mt-1">Complétion</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-yellow-100 p-6 border border-yellow-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                En attente
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{deposits.filter(d => d.status === 'pending').length}</p>
            <p className="text-xs text-slate-500 mt-1">Nécessitent attention</p>
          </div>
        </div>

        {/* Top 3 Membres */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top 3 Déposants</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topMembers.map((member, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-lg font-bold text-[#008152]">{formatCurrency(member.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Volume et montants */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Volume des Dépôts</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={volumeByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} name="Nombre" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Montants Déposés</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={volumeByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} 
                />
                <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} name="Montant" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Répartition par type */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition par Type</h3>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="50%" height={250}>
                <PieChart>
                  <Pie data={subtypeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {subtypeDistribution.map((entry, index) => (
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
                {subtypeDistribution.map((item, index) => (
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
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Statut des Dépôts</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis type="category" dataKey="label" stroke="#6b7280" fontSize={12} width={100} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} name="Dépôts">
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barre de filtres - Style Fintech */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Recherche */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008152] focus:border-transparent transition-all"
              />
            </div>

            {/* Statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008152] focus:border-transparent cursor-pointer bg-white font-medium text-slate-700"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Complété</option>
              <option value="pending">En attente</option>
              <option value="processing">En traitement</option>
              <option value="failed">Échoué</option>
            </select>

            {/* Type */}
            <select
              value={subtypeFilter}
              onChange={(e) => setSubtypeFilter(e.target.value)}
              className="px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008152] focus:border-transparent cursor-pointer bg-white font-medium text-slate-700"
            >
              <option value="all">Tous les types</option>
              <option value="cash">Espèces</option>
              <option value="check">Chèque</option>
              <option value="transfer">Virement</option>
              <option value="other">Autre</option>
            </select>

            {/* Montant min */}
            <input
              type="number"
              placeholder="Montant min"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008152] focus:border-transparent"
            />

            {/* Montant max */}
            <input
              type="number"
              placeholder="Montant max"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008152] focus:border-transparent"
            />
          </div>

          {/* Actions de filtre */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <span className="text-sm text-slate-600 font-medium">
              {filteredDeposits.length} résultat{filteredDeposits.length > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm font-semibold text-[#008152] border-2 border-[#008152] rounded-lg hover:bg-green-50 transition-colors"
              >
                Exporter
              </button>
            </div>
          </div>
        </div>

        {/* Table des dépôts - Style Fintech comme Retraits */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header de la table */}
          <div className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 items-center text-xs font-semibold text-slate-600 uppercase tracking-wide">
              <div className="col-span-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedRows.size === filteredDeposits.length && filteredDeposits.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer"
                />
              </div>
              <div className="col-span-3">Membre & Source</div>
              <div className="col-span-2">Compte & Type</div>
              <div className="col-span-2">Montant</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-1">Date & Heure</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>

          {/* Badge de sélection */}
          {selectedRows.size > 0 && (
            <div className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-green-700">
                  {selectedRows.size} dépôt{selectedRows.size > 1 ? 's' : ''} sélectionné{selectedRows.size > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setSelectedRows(new Set())}
                  className="text-xs text-green-600 hover:text-green-700 font-medium underline"
                >
                  Désélectionner tout
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors">
                  Exporter la sélection
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                  Actions groupées
                </button>
              </div>
            </div>
          )}

          {/* Corps de la table */}
          <div className="divide-y divide-slate-100">
            {Object.entries(groupedDeposits).map(([date, deposits]) => (
              <div key={date}>
                {/* Séparateur de date */}
                <div className="bg-slate-50 px-6 py-2 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{date}</p>
                </div>

                {/* Lignes de dépôts */}
                {deposits.map((deposit, index) => {
                  const statusConf = statusConfig[deposit.status];
                  const StatusIcon = statusConf.icon;
                  const isSelected = selectedRows.has(deposit.id);

                  return (
                    <div
                      key={deposit.id}
                      className={`
                        grid grid-cols-12 gap-4 items-center px-6 py-4
                        hover:bg-green-50/50 transition-all duration-200
                        group cursor-pointer
                        ${isSelected ? 'bg-green-50 border-l-4 border-green-500' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                      `}
                    >
                      {/* Checkbox */}
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(deposit.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                      </div>

                      {/* Membre & Source */}
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-green-100 border border-green-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-green-600 transition-colors">
                            {deposit.member_name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{deposit.source}</p>
                        </div>
                      </div>

                      {/* Compte & Type */}
                      <div className="col-span-2">
                        <div className="inline-flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                            {deposit.idCompte}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{getSubtypeLabel(deposit.depositSubtype)}</p>
                      </div>

                      {/* Montant */}
                      <div className="col-span-2">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(deposit.montantTransaction)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {deposit.holdPeriod > 0 ? `Délai: ${deposit.holdPeriod}j` : 'Disponible'}
                        </p>
                      </div>

                      {/* Statut */}
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

                      {/* Date & Heure */}
                      <div className="col-span-1">
                        <p className="text-sm font-medium text-slate-700">
                          {new Date(deposit.created_at).toLocaleDateString('fr-FR', { 
                            day: '2-digit',
                            month: 'short'
                          })}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(deposit.created_at).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-center gap-2">
                        <button 
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Voir détails', deposit.id);
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
                            console.log('Menu', deposit.id);
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
          {filteredDeposits.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 text-lg font-semibold mb-2">Aucun dépôt trouvé</p>
              <p className="text-slate-500 text-sm">Essayez de modifier vos filtres pour voir plus de résultats</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositDashboard;