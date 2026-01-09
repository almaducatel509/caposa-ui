import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TransactionData {
  id: number;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'loan';
  status: 'pending' | 'completed' | 'failed' | 'processing';
  amount: number;
  created_at: string;
  member_name?: string;
}

interface TransactionChartsProps {
  transactions: TransactionData[];
}

const TransactionCharts: React.FC<TransactionChartsProps> = ({ transactions }) => {
  // 1. Volume des transactions par jour (derniers 7 jours)
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
      .slice(0, 5);
  };

  // 5. Heatmap des heures actives
  const getHourlyActivity = () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
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

    return hours.filter(h => h.hour >= 6 && h.hour <= 22); // 6h à 22h
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
      {/* Section 1: Activité (Volume & Montants) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume des transactions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Volume des Transactions</h3>
            <span className="text-sm text-gray-500">7 derniers jours</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
                name="Transactions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Montants par jour */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Montants Traités</h3>
            <span className="text-sm text-gray-500">7 derniers jours</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="montant" fill="#10b981" radius={[8, 8, 0, 0]} name="Montant" />
            </BarChart>
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

      {/* Section 3: Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top membres actifs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top 5 Membres Actifs</h3>
          <div className="space-y-4">
            {topMembers.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.transactions} transactions</p>
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
            <BarChart data={hourlyData}>
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
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Demo Component
const Demo = () => {
  const generateSampleData = (): TransactionData[] => {
    const types: Array<'deposit' | 'withdrawal' | 'transfer' | 'loan'> = ['deposit', 'withdrawal', 'transfer', 'loan'];
    const statuses: Array<'pending' | 'completed' | 'failed' | 'processing'> = ['completed', 'completed', 'completed', 'pending', 'failed'];
    const members = ['Alice Tremblay', 'Bob Martin', 'Charlie Dubois', 'Diana Roy', 'Ethan Gagnon', 'Fiona Côté'];
    
    const data: TransactionData[] = [];
    
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(hoursAgo);
      
      data.push({
        id: i + 1,
        type: types[Math.floor(Math.random() * types.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        amount: Math.floor(Math.random() * 5000) + 100,
        created_at: date.toISOString(),
        member_name: members[Math.floor(Math.random() * members.length)]
      });
    }
    
    return data;
  };

  const sampleTransactions = generateSampleData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Transactions</h1>
          <p className="text-gray-500 mt-1">Analyse complète de l'activité transactionnelle</p>
        </div>
        
        <TransactionCharts transactions={sampleTransactions} />
      </div>
    </div>
  );
};

export default Demo;