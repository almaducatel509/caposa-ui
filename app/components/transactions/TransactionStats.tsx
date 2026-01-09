'use client';
import React from 'react';
import { TransactionData } from './types';
import { BarChart as BarChartRechart, Bar, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, PieChart, Pie } from 'recharts';

interface TransactionStatsProps {
  transactions: TransactionData[];
}

const TransactionStats: React.FC<TransactionStatsProps> = ({ transactions }) => {
  // Calculs des statistiques
  const stats = {
    total: transactions.length,
    deposits: transactions.filter(t => t.type === 'deposit').length,
    withdrawals: transactions.filter(t => t.type === 'withdrawal').length,
    transfers: transactions.filter(t => t.type === 'transfer').length,
    loans: transactions.filter(t => t.type === 'loan').length,
    totalAmount: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    pendingAmount: transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + (t.amount || 0), 0),
    completedToday: transactions.filter(t => {
      const today = new Date().toDateString();
      return new Date(t.created_at || '').toDateString() === today && t.status === 'completed';
    }).length
  };
  
  const getVolumeData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(t => 
        t.created_at?.startsWith(date)
      );
      const dayName = new Date(date).toLocaleDateString('fr-CA', { weekday: 'short' });
      
      return {
        date: dayName,
        count: dayTransactions.length,
        montant: dayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
      };
    });
  };

  // 2. Répartition par type (Donut Chart)
  const getTypeDistribution = () => {
    const types = {
      deposit: { count: 0, amount: 0, label: 'Dépôts', color: '#3b82f6' },
      withdrawal: { count: 0, amount: 0, label: 'Retraits', color: '#ef4444' },
      transfer: { count: 0, amount: 0, label: 'Virements', color: '#10b981' },
      loan: { count: 0, amount: 0, label: 'Prêts', color: '#8b5cf6' }
    };

    transactions.forEach(t => {
      if (types[t.type]) {
        types[t.type].count++;
        types[t.type].amount += t.amount || 0;
      }
    });

    return Object.entries(types).map(([key, value]) => ({
      name: value.label,
      value: value.count,
      amount: value.amount,
      color: value.color
    }));
  };

  // 3. Taux de réussite par statut
  const getStatusData = () => {
    const statuses = {
      completed: { count: 0, label: 'Complétées', color: '#10b981' },
      pending: { count: 0, label: 'En attente', color: '#f59e0b' },
      processing: { count: 0, label: 'En traitement', color: '#3b82f6' },
      failed: { count: 0, label: 'Échouées', color: '#ef4444' }
    };

    transactions.forEach(t => {
      if (statuses[t.status]) {
        statuses[t.status].count++;
      }
    });

    return Object.entries(statuses).map(([key, value]) => ({
      name: value.label,
      value: value.count,
      color: value.color,
      percentage: ((value.count / transactions.length) * 100).toFixed(1)
    }));
  };

  // 4. Top 5 membres les plus actifs
  const getTopMembers = () => {
    const memberStats: Record<string, { count: number; total: number }> = {};

    transactions.forEach(t => {
      const name = t.member_name || 'Anonyme';
      if (!memberStats[name]) {
        memberStats[name] = { count: 0, total: 0 };
      }
      memberStats[name].count++;
      memberStats[name].total += t.amount || 0;
    });

    return Object.entries(memberStats)
      .map(([name, stats]) => ({
        name,
        transactions: stats.count,
        montant: stats.total
      }))
      .sort((a, b) => b.transactions - a.transactions)
      .slice(0, 3);
  };

  // 5. Heatmap des heures actives
  const getHourlyActivity = () => {
    const hours = Array.from({ length: 18 }, (_, i) => ({
      hour: i,
      label: `${i}h`,
      count: 0
    }));

    transactions.forEach(t => {
      if (t.created_at) {
        const hour = new Date(t.created_at).getHours();
        hours[hour].count++;
      }
    });

    return hours.filter(h => h.hour >= 9 && h.hour <= 17); // 9h à 5h
  };

  const volumeData = getVolumeData();
  const typeData = getTypeDistribution();
  const statusData = getStatusData();
  const topMembers = getTopMembers();
  const hourlyData = getHourlyActivity();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transactions - Blue Gradient */}
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">Total Transactions</p>
            <p className="text-4xl font-bold text-white mb-1">{stats.total}</p>
            <div className="flex items-center gap-1 text-blue-100 text-xs">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              Toutes périodes
            </div>
          </div>
        </div>

        {/* Total Amount - Green Gradient */}
        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">Montant Total</p>
            <p className="text-4xl font-bold text-white mb-1">{formatCurrency(stats.totalAmount)}</p>
            <div className="flex items-center gap-1 text-green-100 text-xs">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              +25% cette semaine
            </div>
          </div>
        </div>

        {/* Pending Amount - Orange Gradient */}
        <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-orange-100 text-sm font-medium mb-1">Paiement Moyen</p>
            <p className="text-4xl font-bold text-white mb-1">{formatCurrency(stats.pendingAmount)}</p>
            <div className="flex items-center gap-1 text-orange-100 text-xs">
              À traiter
            </div>
          </div>
        </div>

        {/* Completed Today - Purple Gradient */}
        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-purple-100 text-sm font-medium mb-1">Aujourd'hui</p>
            <p className="text-4xl font-bold text-white mb-1">{stats.completedToday}</p>
            <div className="flex items-center gap-1 text-purple-100 text-xs">
              Complétées
            </div>
          </div>
        </div>
      </div>

      {/* Section Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top membres actifs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Top 3 Membres Actifs</h3>
          <div className="space-y-4">
            {topMembers.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-sm font-light text-gray-500">{member.transactions} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(member.montant)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap des heures actives */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Activité par Heure</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChartRechart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Transactions">
                {hourlyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.count > 3 ? '#8b5cf6' : entry.count > 1 ? '#a78bfa' : '#ddd6fe'} 
                  />
                ))}
              </Bar>
            </BarChartRechart>
          </ResponsiveContainer>
        </div>
      </div>
     
       {/* Section 2: Répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par type */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition par Type</h3>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number | undefined, name: string | undefined, props: any) => [
                    value !== undefined ? `${value} (${formatCurrency(props.payload.amount)})` : '',
                    name || ''
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {typeData.map((item, index) => (
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

        {/* Taux de réussite */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Statut des Transactions</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={12} width={100} />
              <Tooltip 
                formatter={(value: number | undefined, name: string | undefined, props: any) => [
                  value !== undefined ? `${value} (${props.payload.percentage}%)` : '',
                  name || ''
                ]}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} name="Transactions">
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TransactionStats;