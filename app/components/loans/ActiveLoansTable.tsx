'use client'
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, LineChart, Line } from 'recharts';
import { Search, Calendar, DollarSign, Users, TrendingUp, CheckCircle, Clock, AlertCircle, XCircle, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Types
interface ActiveLoanData {
  id: number;
  amount: number;
  status: 'decaisse';
  member_name: string;
  member_id: string;
  created_at: string;
  approved_at: string;
  disbursed_at: string;
  
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
    next_payment_date: string;
    last_payment_date?: string;
    late_days: number;
    is_late: boolean;
  };
}

// KPI Card Component
const KPICard = ({ icon: Icon, label, value, subValue, trend, color }: any) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend !== undefined && (
        <span className={`text-sm font-semibold flex items-center gap-1 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
          {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : trend < 0 ? <ArrowDownRight className="w-4 h-4" /> : null}
          {trend !== 0 ? `${Math.abs(trend)}%` : '0%'}
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-sm text-gray-600">{label}</p>
    {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
  </div>
);

const ActiveLoansTable = () => {
  // États
  const [periodFilter, setPeriodFilter] = useState<'all' | 'week' | 'month'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, on_time, late, critical
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // Génération de données échantillon - UNIQUEMENT prêts actifs (décaissés)
  const generateActiveLoans = (): ActiveLoanData[] => {
    const members = ['Alice Tremblay', 'Bob Martin', 'Charlie Dubois', 'Diana Roy', 'Ethan Gagnon', 'Fiona Côté', 'Gabriel Lavoie', 'Hannah Bergeron', 'Isaac Bouchard', 'Julia Morin'];
    const purposes: Array<'plantation' | 'construction' | 'scolarite' | 'commerce' | 'elevage' | 'equipement' | 'autre'> = 
      ['plantation', 'construction', 'scolarite', 'commerce', 'elevage', 'equipement', 'autre'];
    const loanTypes: Array<'agriculture' | 'commerce' | 'logement' | 'education' | 'sante' | 'autre'> = 
      ['agriculture', 'commerce', 'logement', 'education', 'sante', 'autre'];
    const collaterals: Array<'epargne_bloquee' | 'caution' | 'betail' | 'terrain' | 'vehicule' | 'autre'> = 
      ['epargne_bloquee', 'caution', 'betail', 'terrain', 'vehicule', 'autre'];
    const frequencies: Array<'mensuel' | 'hebdomadaire' | 'saisonnier'> = 
      ['mensuel', 'mensuel', 'mensuel', 'hebdomadaire', 'saisonnier'];
    
    const data: ActiveLoanData[] = [];
    
    // Générer 60 prêts actifs
    for (let i = 0; i < 60; i++) {
      const createdDate = new Date();
      // Prêts créés entre 1 et 12 mois dans le passé
      createdDate.setMonth(createdDate.getMonth() - Math.floor(Math.random() * 12) - 1);
      createdDate.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
      
      const amount = Math.floor(Math.random() * 50000) + 5000;
      const duration = [6, 12, 18, 24, 36, 48][Math.floor(Math.random() * 6)];
      const interestRate = 2.5 + Math.random() * 5;
      const monthlyPayment = (amount * (1 + interestRate/100)) / duration;
      
      // Calculer combien de mois se sont écoulés depuis la création
      const monthsElapsed = Math.floor((Date.now() - createdDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
      const paymentsMade = Math.min(monthsElapsed, duration - 1); // Toujours au moins 1 paiement restant
      
      // 30% de chance d'être en retard
      const isLate = Math.random() > 0.7;
      const lateDays = isLate ? Math.floor(Math.random() * 45) + 1 : 0;
      
      const disbursedDate = new Date(createdDate.getTime() + 5 * 24 * 60 * 60 * 1000);
      const nextPaymentDate = new Date();
      nextPaymentDate.setDate(nextPaymentDate.getDate() + (isLate ? -lateDays : 15));
      
      data.push({
        id: i + 1,
        amount: amount,
        status: 'decaisse',
        member_name: members[Math.floor(Math.random() * members.length)],
        member_id: `MEM${1000 + i}`,
        created_at: createdDate.toISOString(),
        approved_at: new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        disbursed_at: disbursedDate.toISOString(),
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
          remaining_balance: amount - (monthlyPayment * paymentsMade),
          next_payment_date: nextPaymentDate.toISOString(),
          last_payment_date: paymentsMade > 0 ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          late_days: lateDays,
          is_late: isLate
        }
      });
    }
    
    return data.sort((a, b) => b.loan_details.remaining_balance - a.loan_details.remaining_balance);
  };

  const loans = useMemo(() => generateActiveLoans(), []);

  // Filtrage des prêts
  const filteredLoans = useMemo(() => {
    return loans.filter(l => {
      const matchesSearch = l.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           l.member_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           l.id.toString().includes(searchTerm);
      const matchesType = typeFilter === 'all' || l.loan_details.loan_type === typeFilter;
      const matchesMinAmount = !minAmount || l.amount >= parseFloat(minAmount);
      const matchesMaxAmount = !maxAmount || l.amount <= parseFloat(maxAmount);
      
      let matchesStatus = true;
      if (statusFilter === 'on_time') {
        matchesStatus = !l.loan_details.is_late;
      } else if (statusFilter === 'late') {
        matchesStatus = l.loan_details.is_late && l.loan_details.late_days < 30;
      } else if (statusFilter === 'critical') {
        matchesStatus = l.loan_details.late_days >= 30;
      }
      
      // Filtre de période basé sur la date de prochain paiement
      let matchesPeriod = true;
      if (periodFilter !== 'all') {
        const nextPayment = new Date(l.loan_details.next_payment_date);
        const now = new Date();
        const daysUntilPayment = Math.ceil((nextPayment.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        
        if (periodFilter === 'week') {
          matchesPeriod = daysUntilPayment <= 7 && daysUntilPayment >= -7;
        } else if (periodFilter === 'month') {
          matchesPeriod = daysUntilPayment <= 30 && daysUntilPayment >= -30;
        }
      }
      
      return matchesSearch && matchesType && matchesMinAmount && matchesMaxAmount && matchesStatus && matchesPeriod;
    });
  }, [loans, searchTerm, typeFilter, minAmount, maxAmount, statusFilter, periodFilter]);

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

  // Groupement par statut de paiement
  const groupedLoans = useMemo(() => {
    const groups: Record<string, ActiveLoanData[]> = {
      'En retard critique (30+ jours)': [],
      'En retard': [],
      'À jour': []
    };

    filteredLoans.forEach(loan => {
      if (loan.loan_details.late_days >= 30) {
        groups['En retard critique (30+ jours)'].push(loan);
      } else if (loan.loan_details.is_late) {
        groups['En retard'].push(loan);
      } else {
        groups['À jour'].push(loan);
      }
    });

    return groups;
  }, [filteredLoans]);

  // Calculs des KPIs
  const totalOutstanding = loans.reduce((sum, l) => sum + l.loan_details.remaining_balance, 0);
  const totalPrincipal = loans.reduce((sum, l) => sum + l.amount, 0);
  const totalRepaid = totalPrincipal - totalOutstanding;
  const lateLoans = loans.filter(l => l.loan_details.is_late);
  const criticalLoans = loans.filter(l => l.loan_details.late_days >= 30);
  const onTimeRate = loans.length > 0 ? ((loans.length - lateLoans.length) / loans.length) * 100 : 0;
  const totalMonthlyExpected = loans.reduce((sum, l) => sum + l.loan_details.monthly_payment, 0);
  const avgLoanSize = loans.length > 0 ? totalPrincipal / loans.length : 0;

  // Graphique: Répartition par statut de retard
  const lateStatusDistribution = useMemo(() => {
    return [
      { name: 'À jour', value: loans.filter(l => !l.loan_details.is_late).length, color: '#10b981' },
      { name: 'En retard (1-29j)', value: loans.filter(l => l.loan_details.is_late && l.loan_details.late_days < 30).length, color: '#f59e0b' },
      { name: 'Critique (30+j)', value: criticalLoans.length, color: '#ef4444' }
    ];
  }, [loans, criticalLoans]);

  // Graphique: Progression des paiements
  const paymentProgress = useMemo(() => {
    const ranges = [
      { range: '0-25%', count: 0, color: '#ef4444' },
      { range: '26-50%', count: 0, color: '#f59e0b' },
      { range: '51-75%', count: 0, color: '#3b82f6' },
      { range: '76-100%', count: 0, color: '#10b981' }
    ];

    loans.forEach(l => {
      const progress = (l.loan_details.payments_made / l.loan_details.duration_months) * 100;
      if (progress <= 25) ranges[0].count++;
      else if (progress <= 50) ranges[1].count++;
      else if (progress <= 75) ranges[2].count++;
      else ranges[3].count++;
    });

    return ranges;
  }, [loans]);

  // Graphique: Top 5 plus gros prêts actifs
  const topLoans = useMemo(() => {
    return [...loans]
      .sort((a, b) => b.loan_details.remaining_balance - a.loan_details.remaining_balance)
      .slice(0, 5)
      .map(l => ({
        name: l.member_name,
        amount: l.loan_details.remaining_balance
      }));
  }, [loans]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-HT', {
      style: 'currency',
      currency: 'HTG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
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

  const getPaymentStatus = (loan: ActiveLoanData) => {
    if (loan.loan_details.late_days >= 30) {
      return { label: 'Critique', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle };
    } else if (loan.loan_details.is_late) {
      return { label: 'En retard', color: 'text-orange-700', bg: 'bg-orange-100', icon: AlertCircle };
    } else {
      return { label: 'À jour', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle };
    }
  };

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-indigo-50 md:p-8">
            {/* Filtres de période */}
      <div className="mb-6 flex gap-3">
        {(['all', 'week', 'month'] as const).map(period => (
          <button
            key={period}
            onClick={() => setPeriodFilter(period)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              periodFilter === period
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {period === 'all' ? 'Tous les prêts' : period === 'week' ? 'Cette semaine' : 'Ce mois'}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <KPICard
          icon={TrendingUp}
          label="Prêts actifs"
          value={loans.length}
          subValue={`${lateLoans.length} en retard`}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <KPICard
          icon={DollarSign}
          label="Solde total restant"
          value={formatCurrency(totalOutstanding)}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
        <KPICard
          icon={CheckCircle}
          label="Montant remboursé"
          value={formatCurrency(totalRepaid)}
          subValue={`${((totalRepaid / totalPrincipal) * 100).toFixed(1)}% du total`}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <KPICard
          icon={Calendar}
          label="Paiements mensuels"
          value={formatCurrency(totalMonthlyExpected)}
          subValue="Montant attendu/mois"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <KPICard
          icon={AlertCircle}
          label="Taux de ponctualité"
          value={`${onTimeRate.toFixed(1)}%`}
          subValue={`${loans.length - lateLoans.length} à jour`}
          color="bg-gradient-to-br from-teal-500 to-teal-600"
        />
        <KPICard
          icon={XCircle}
          label="Retards critiques"
          value={criticalLoans.length}
          subValue="30+ jours de retard"
          color="bg-gradient-to-br from-red-500 to-red-600"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Statut de retard */}
        <div className="bg-red- rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Statut des Paiements</h3>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie data={lateStatusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {lateStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {lateStatusDistribution.map((item, index) => (
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

        {/* Progression des paiements */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Progression des Remboursements</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={paymentProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Prêts">
                {paymentProgress.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 plus gros prêts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top 5 - Plus Gros Soldes Restants</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topLoans} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="category" dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis type="number" stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} 
              />
              <Bar dataKey="amount" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Solde restant" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau filtrable */}
      <div className="rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center justify-between px-6 py-5 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Liste des Prêts Actifs</h3>
          <span className="text-sm text-gray-500">{filteredLoans.length} résultats</span>
        </div>

        {/* Filtres */}
        <div className="px-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher membre..."
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
            <option value="on_time">À jour</option>
            <option value="late">En retard</option>
            <option value="critical">Critique (30+j)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                  checked={selectedRows.size === filteredLoans.length && filteredLoans.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </div>
              <div className="col-span-2">Membre</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-2">Montant Initial</div>
              <div className="col-span-2">Solde Restant</div>
              <div className="col-span-2">Progression</div>
              <div className="col-span-1">Prochain</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>

          {/* Badge de sélection */}
          {selectedRows.size > 0 && (
            <div className="bg-purple-50 border-b border-purple-200 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-purple-700">
                  {selectedRows.size} prêt{selectedRows.size > 1 ? 's' : ''} sélectionné{selectedRows.size > 1 ? 's' : ''}
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
                  Envoyer rappel
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                  Exporter
                </button>
              </div>
            </div>
          )}

          {/* Corps de la table */}
          <div className="divide-y divide-slate-100">
            {Object.entries(groupedLoans).map(([group, groupLoans]) => (
              groupLoans.length > 0 && (
                <div key={group}>
                  {/* Séparateur de groupe */}
                  <div className={`px-6 py-2 border-t ${
                    group.includes('critique') ? 'bg-red-50 border-red-200' :
                    group.includes('En retard') ? 'bg-orange-50 border-orange-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                      {group}
                      <span className="text-slate-500">({groupLoans.length})</span>
                    </p>
                  </div>

                  {/* Lignes de prêts */}
                  {groupLoans.map((loan, index) => {
                    const paymentStatus = getPaymentStatus(loan);
                    const StatusIcon = paymentStatus.icon;
                    const isSelected = selectedRows.has(loan.id);
                    const progressPercent = (loan.loan_details.payments_made / loan.loan_details.duration_months) * 100;

                    return (
                      <div
                        key={loan.id}
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
                            onChange={() => handleRowSelect(loan.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </div>

                        {/* Membre */}
                        <div className="col-span-2 flex items-center gap-3">
                          <div className="shrink-0 w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-purple-600 transition-colors">
                              {loan.member_name}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">{loan.member_id}</p>
                          </div>
                        </div>

                        {/* Type */}
                        <div className="col-span-1">
                          <p className="text-xs text-slate-600">{getLoanTypeLabel(loan.loan_details.loan_type)}</p>
                          <p className="text-xs text-slate-500">{loan.loan_details.duration_months}m</p>
                        </div>

                        {/* Montant Initial */}
                        <div className="col-span-2">
                          <p className="text-base font-bold text-slate-800">
                            {formatCurrency(loan.amount)}
                          </p>
                          <p className="text-xs text-slate-500">Taux: {loan.loan_details.interest_rate}%</p>
                        </div>

                        {/* Solde Restant */}
                        <div className="col-span-2">
                          <p className="text-lg font-bold text-purple-600">
                            {formatCurrency(loan.loan_details.remaining_balance)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatCurrency(loan.loan_details.monthly_payment)}/mois
                          </p>
                        </div>

                        {/* Progression */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-600">
                                  {loan.loan_details.payments_made}/{loan.loan_details.duration_months}
                                </span>
                                <span className="text-xs font-semibold text-slate-700">
                                  {Math.round(progressPercent)}%
                                </span>
                              </div>
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    progressPercent >= 75 ? 'bg-green-600' :
                                    progressPercent >= 50 ? 'bg-blue-600' :
                                    progressPercent >= 25 ? 'bg-orange-600' : 'bg-red-600'
                                  }`}
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Prochain paiement */}
                        <div className="col-span-1">
                          <span className={`
                            inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold
                            ${paymentStatus.bg} ${paymentStatus.color}
                            border-2 ${paymentStatus.bg.replace('bg-', 'border-')}
                          `}>
                            <StatusIcon className="w-3 h-3" />
                            {loan.loan_details.late_days > 0 ? `-${loan.loan_details.late_days}j` : 
                             new Date(loan.loan_details.next_payment_date) > new Date() ? 
                             `${Math.ceil((new Date(loan.loan_details.next_payment_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000))}j` : 
                             'Aujourd\'hui'}
                          </span>
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
              )
            ))}
          </div>

          {/* État vide */}
          {filteredLoans.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 text-lg font-semibold mb-2">Aucun prêt actif trouvé</p>
              <p className="text-slate-500 text-sm">Essayez de modifier vos filtres pour voir plus de résultats</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveLoansTable;