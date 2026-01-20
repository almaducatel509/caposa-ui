'use client'
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, LineChart, Line } from 'recharts';
import { Search, Calendar, DollarSign, Users, TrendingUp, CheckCircle, Clock, AlertCircle, XCircle, FileText } from 'lucide-react';

// Types
interface LoanData {
  id: number;
  amount: number;
  status: 'en_attente' | 'approuve' | 'decaisse' | 'rembourse' | 'rejete' | 'annule';
  member_name: string;
  created_at: string;
  approved_at?: string;
  disbursed_at?: string;
  
  loan_details: {
    duration_months: number;
    interest_rate: number;
    monthly_payment: number;
    total_amount: number;
    purpose: 'plantation' | 'construction' | 'scolarite' | 'commerce' | 'elevage' | 'equipement' | 'autre';
    loan_type: 'agriculture' | 'commerce' | 'logement' | 'education' | 'sante' | 'autre';
    collateral_type: 'epargne_bloquee' | 'caution' | 'betail' | 'terrain' | 'vehicule' | 'autre';
    repayment_frequency: 'mensuel' | 'hebdomadaire' | 'saisonnier';
    
    payments_made: number;
    remaining_balance: number;
    next_payment_date?: string;
    last_payment_date?: string;
    late_days: number;
  };
}

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

const LoanDashboard = () => {
  // États
  const [periodFilter, setPeriodFilter] = useState<'day' | 'week' | 'month'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // Génération de données échantillon (Lun-Ven, 9h-17h)
  const generateSampleLoans = (): LoanData[] => {
    const statuses: Array<'en_attente' | 'approuve' | 'decaisse' | 'rembourse' | 'rejete' | 'annule'> = 
      ['decaisse', 'decaisse', 'decaisse', 'rembourse', 'approuve', 'en_attente', 'rejete', 'annule'];
    const members = ['Alice Tremblay', 'Bob Martin', 'Charlie Dubois', 'Diana Roy', 'Ethan Gagnon', 'Fiona Côté', 'Gabriel Lavoie', 'Hannah Bergeron'];
    const purposes: Array<'plantation' | 'construction' | 'scolarite' | 'commerce' | 'elevage' | 'equipement' | 'autre'> = 
      ['plantation', 'construction', 'scolarite', 'commerce', 'elevage', 'equipement', 'autre'];
    const loanTypes: Array<'agriculture' | 'commerce' | 'logement' | 'education' | 'sante' | 'autre'> = 
      ['agriculture', 'commerce', 'logement', 'education', 'sante', 'autre'];
    const collaterals: Array<'epargne_bloquee' | 'caution' | 'betail' | 'terrain' | 'vehicule' | 'autre'> = 
      ['epargne_bloquee', 'caution', 'betail', 'terrain', 'vehicule', 'autre'];
    const frequencies: Array<'mensuel' | 'hebdomadaire' | 'saisonnier'> = 
      ['mensuel', 'mensuel', 'mensuel', 'hebdomadaire', 'saisonnier'];
    
    const data: LoanData[] = [];
    const daysBack = periodFilter === 'day' ? 1 : periodFilter === 'week' ? 7 : 30;
    let attempts = 0;
    
    for (let i = 0; i < 80 && attempts < 200; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
      
      if (date.getDay() === 0 || date.getDay() === 6) {
        i--;
        attempts++;
        continue;
      }
      
      date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = Math.floor(Math.random() * 50000) + 5000;
      const duration = [6, 12, 18, 24, 36, 48][Math.floor(Math.random() * 6)];
      const interestRate = 2.5 + Math.random() * 5;
      const monthlyPayment = (amount * (1 + interestRate/100)) / duration;
      const paymentsMade = status === 'decaisse' ? Math.floor(Math.random() * duration) : 
                          status === 'rembourse' ? duration : 0;
      const lateDays = status === 'decaisse' && Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0;
      
      data.push({
        id: i + 1,
        amount: amount,
        status: status,
        member_name: members[Math.floor(Math.random() * members.length)],
        created_at: date.toISOString(),
        approved_at: status !== 'en_attente' && status !== 'rejete' ? 
          new Date(date.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        disbursed_at: status === 'decaisse' || status === 'rembourse' ? 
          new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        loan_details: {
          duration_months: duration,
          interest_rate: parseFloat(interestRate.toFixed(2)),
          monthly_payment: monthlyPayment,
          total_amount: amount * (1 + interestRate/100),
          purpose: purposes[Math.floor(Math.random() * purposes.length)],
          loan_type: loanTypes[Math.floor(Math.random() * loanTypes.length)],
          collateral_type: collaterals[Math.floor(Math.random() * collaterals.length)],
          repayment_frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
          payments_made: paymentsMade,
          remaining_balance: status === 'rembourse' ? 0 : amount - (monthlyPayment * paymentsMade),
          next_payment_date: status === 'decaisse' ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          last_payment_date: paymentsMade > 0 ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          late_days: lateDays
        }
      });
      attempts++;
    }
    
    return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const loans = useMemo(() => generateSampleLoans(), [periodFilter]);

  // Filtrage des prêts
  const filteredLoans = useMemo(() => {
    return loans.filter(l => {
      const matchesSearch = l.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           l.id.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchesType = typeFilter === 'all' || l.loan_details.loan_type === typeFilter;
      const matchesMinAmount = !minAmount || l.amount >= parseFloat(minAmount);
      const matchesMaxAmount = !maxAmount || l.amount <= parseFloat(maxAmount);
      
      return matchesSearch && matchesStatus && matchesType && matchesMinAmount && matchesMaxAmount;
    });
  }, [loans, searchTerm, statusFilter, typeFilter, minAmount, maxAmount]);

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
    if (selectedRows.size === filteredLoans.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredLoans.map(l => l.id)));
    }
  };

  // Groupement par date
  const groupedLoans = useMemo(() => {
    const sorted = [...filteredLoans].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sorted.reduce((acc, loan) => {
      const date = new Date(loan.created_at);
      const key = date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!acc[key]) acc[key] = [];
      acc[key].push(loan);
      return acc;
    }, {} as Record<string, LoanData[]>);
  }, [filteredLoans]);

  
  // Répartition par type de prêt
  const loanTypeDistribution = useMemo(() => {
    const types = {
      agriculture: { count: 0, amount: 0, label: 'Agriculture', color: '#10b981' },
      commerce: { count: 0, amount: 0, label: 'Commerce', color: '#3b82f6' },
      logement: { count: 0, amount: 0, label: 'Logement', color: '#8b5cf6' },
      education: { count: 0, amount: 0, label: 'Éducation', color: '#f59e0b' },
      sante: { count: 0, amount: 0, label: 'Santé', color: '#ef4444' },
      autre: { count: 0, amount: 0, label: 'Autre', color: '#6b7280' }
    };

    loans.forEach(l => {
      types[l.loan_details.loan_type].count++;
      types[l.loan_details.loan_type].amount += l.amount;
    });

    return Object.values(types).map(t => ({
      name: t.label,
      value: t.count,
      amount: t.amount,
      color: t.color
    }));
  }, [loans]);

  // Répartition par statut
  const statusDistribution = useMemo(() => {
    const statuses = {
      en_attente: { count: 0, label: 'En attente', color: '#f59e0b' },
      approuve: { count: 0, label: 'Approuvé', color: '#3b82f6' },
      decaisse: { count: 0, label: 'Décaissé', color: '#8b5cf6' },
      rembourse: { count: 0, label: 'Remboursé', color: '#10b981' },
      rejete: { count: 0, label: 'Rejeté', color: '#ef4444' },
      annule: { count: 0, label: 'Annulé', color: '#6b7280' }
    };

    loans.forEach(l => {
      statuses[l.status].count++;
    });

    return Object.values(statuses);
  }, [loans]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-HT', {
      style: 'currency',
      currency: 'HTG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      en_attente: 'En attente',
      approuve: 'Approuvé',
      decaisse: 'Décaissé',
      rembourse: 'Remboursé',
      rejete: 'Rejeté',
      annule: 'Annulé'
    };
    return labels[status as keyof typeof labels];
  };

  const getLoanTypeLabel = (type: string) => {
    const labels = {
      agriculture: 'Agriculture',
      commerce: 'Commerce',
      logement: 'Logement',
      education: 'Éducation',
      sante: 'Santé',
      autre: 'Autre'
    };
    return labels[type as keyof typeof labels];
  };

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50 md:p-8">
      {/* Filtre de période */}
      <div className="mb-6 flex gap-3">
        {(['day', 'week', 'month'] as const).map(period => (
          <button
            key={period}
            onClick={() => setPeriodFilter(period)}
            className={`px-4 py-2 rounded-4xl text-sm font-medium transition-all ${
              periodFilter === period
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {period === 'day' ? 'Aujourd\'hui' : period === 'week' ? '7 jours' : '30 jours'}
          </button>
        ))}
      </div>

      

     

      {/* Tableau filtrable */}
      <div className="rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center justify-between px-6 py-5 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Liste des Prêts</h3>
          <span className="text-sm text-gray-500">{filteredLoans.length} résultats</span>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="approuve">Approuvé</option>
            <option value="decaisse">Décaissé</option>
            <option value="rembourse">Remboursé</option>
            <option value="rejete">Rejeté</option>
            <option value="annule">Annulé</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="all">Tous les types</option>
            <option value="agriculture">Agriculture</option>
            <option value="commerce">Commerce</option>
            <option value="logement">Logement</option>
            <option value="education">Éducation</option>
            <option value="sante">Santé</option>
            <option value="autre">Autre</option>
          </select>

          <input
            type="number"
            placeholder="Montant min"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />

          <input
            type="number"
            placeholder="Montant max"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                  checked={selectedRows.size === filteredLoans.length && filteredLoans.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
              <div className="col-span-1">Date</div>
              <div className="col-span-2">Membre</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-2">Montant</div>
              <div className="col-span-1">Durée</div>
              <div className="col-span-1">Statut</div>
              <div className="col-span-2">Paiements</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>


          {/* Badge de sélection */}
          {selectedRows.size > 0 && (
            <div className="bg-indigo-50 border-b border-indigo-200 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-indigo-700">
                  {selectedRows.size} prêt{selectedRows.size > 1 ? 's' : ''} sélectionné{selectedRows.size > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setSelectedRows(new Set())}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium underline"
                >
                  Désélectionner tout
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors">
                  Exporter la sélection
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  Actions groupées
                </button>
              </div>
            </div>
          )}

          {/* Corps de la table */}
          <div className="divide-y divide-slate-100">
            {Object.entries(groupedLoans).map(([date, loans]) => (
              <div key={date}>
                {/* Séparateur de date */}
                <div className="bg-slate-50 px-6 py-2 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{date}</p>
                </div>

                {/* Lignes de prêts */}
                {loans.map((loan, index) => {
                  const statusConf = {
                    en_attente: { icon: Clock, label: 'Att', color: 'text-amber-700', bg: 'bg-amber-100' },
                    approuve: { icon: CheckCircle, label: 'Appr', color: 'text-blue-700', bg: 'bg-blue-100' },
                    decaisse: { icon: TrendingUp, label: 'Déc', color: 'text-purple-700', bg: 'bg-purple-100' },
                    rembourse: { icon: CheckCircle, label: 'Remb', color: 'text-emerald-700', bg: 'bg-emerald-100' },
                    rejete: { icon: XCircle, label: 'Rej', color: 'text-rose-700', bg: 'bg-rose-100' },
                    annule: { icon: XCircle, label: 'Ann', color: 'text-slate-700', bg: 'bg-slate-100' }
                  }[loan.status];
                  const StatusIcon = statusConf.icon;
                  const isSelected = selectedRows.has(loan.id);

                  return (
                    <div
                      key={loan.id}
                      className={`
                        grid grid-cols-12 gap-4 items-center px-6 py-4
                        hover:bg-indigo-50/50 transition-all duration-200
                        group cursor-pointer
                        ${isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                      `}
                    >
                      {/* Checkbox */}
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(loan.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>

                      {/* Date */}
                      <div className="col-span-1">
                        <p className="text-sm font-medium text-slate-700">
                          {new Date(loan.created_at).toLocaleDateString('fr-FR', { 
                            day: '2-digit',
                            month: 'short'
                          })}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(loan.created_at).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>

                      {/* Membre */}
                      <div className="col-span-2 flex items-center gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors">
                            {loan.member_name}
                          </p>
                          {loan.loan_details.late_days > 0 && (
                            <p className="text-xs text-red-600 font-medium">
                              {loan.loan_details.late_days}j de retard
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Type */}
                      <div className="col-span-1">
                        <p className="text-xs text-slate-600">{getLoanTypeLabel(loan.loan_details.loan_type)}</p>
                        <p className="text-xs text-slate-500">{loan.loan_details.purpose}</p>
                      </div>

                      {/* Montant */}
                      <div className="col-span-2">
                        <p className="text-lg font-bold text-indigo-600">
                          {formatCurrency(loan.amount)}
                        </p>
                        <p className="text-xs text-slate-500">Taux: {loan.loan_details.interest_rate}%</p>
                      </div>

                      {/* Durée */}
                      <div className="col-span-1">
                        <p className="text-sm font-medium text-slate-700">{loan.loan_details.duration_months} mois</p>
                        <p className="text-xs text-slate-500">{loan.loan_details.repayment_frequency}</p>
                      </div>

                      {/* Statut */}
                      <div className="col-span-1">
                        <span className={`
                          inline-flex items-center gap-3 px-2 py-1 rounded-lg text-xs font-semibold
                          ${statusConf.bg} ${statusConf.color}
                          border-2 ${statusConf.bg.replace('bg-', 'border-')}
                        `}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConf.label}
                        </span>
                      </div>

                      {/* Paiements */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-600">
                                {loan.loan_details.payments_made}/{loan.loan_details.duration_months}
                              </span>
                              <span className="text-xs font-semibold text-slate-700">
                                {Math.round((loan.loan_details.payments_made / loan.loan_details.duration_months) * 100)}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-600 rounded-full transition-all"
                                style={{ width: `${(loan.loan_details.payments_made / loan.loan_details.duration_months) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Reste: {formatCurrency(loan.loan_details.remaining_balance)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-center gap-2">
                        <button 
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Voir détails', loan.id);
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
                            console.log('Menu', loan.id);
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
          {filteredLoans.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 text-lg font-semibold mb-2">Aucun prêt trouvé</p>
              <p className="text-slate-500 text-sm">Essayez de modifier vos filtres pour voir plus de résultats</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDashboard;