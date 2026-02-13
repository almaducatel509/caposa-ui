'use client';
import React, { useState, useMemo } from 'react';
import { Search, Calendar, DollarSign, Users, Lock, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie } from 'recharts';
import { BiImport, BiExport } from 'react-icons/bi';

interface VaultMovement {
  id: string;
  type: 'in' | 'out';
  amount: number;
  performed_by: string;
  performed_by_name: string;
  verified_by: string;
  verified_by_name: string;
  related_cashier?: string;
  related_cashier_name?: string;
  branch_id: string;
  movement_date: string;
  created_at: string;
  notes?: string;
  is_locked: boolean;
}

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

const VaultMovementHistory: React.FC = () => {
  const [periodFilter, setPeriodFilter] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out'>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Génération de données échantillon (Lun-Ven, heures variées)
  const generateSampleMovements = (): VaultMovement[] => {
    const employees = [
      { id: 'emp_002', name: 'Marie Tremblay', role: 'Superviseur' },
      { id: 'emp_003', name: 'Paul Martin', role: 'Gestionnaire' },
      { id: 'emp_005', name: 'Luc Gagnon', role: 'Trésorier' },
      { id: 'emp_006', name: 'Claire Bergeron', role: 'Contrôleur' }
    ];

    const cashiers = [
      { id: 'emp_001', name: 'Jean Dupont' },
      { id: 'emp_004', name: 'Sophie Lavoie' },
      { id: 'emp_007', name: 'Marc Leblanc' }
    ];

    const notes = {
      in: [
        'Remise de fin de journée caisse principale',
        'Excédent caisse 2',
        'Dépôt espèces membres',
        'Retour fonds inutilisés',
        'Versement banque reçu'
      ],
      out: [
        'Fonds de caisse ouverture matinale',
        'Réapprovisionnement caisse 1',
        'Monnaie pour caisse',
        'Fonds urgence caisse 3',
        'Transfert vers banque'
      ]
    };

    const data: VaultMovement[] = [];
    const daysBack = periodFilter === 'day' ? 1 : 
                     periodFilter === 'week' ? 7 : 
                     periodFilter === 'month' ? 30 : 365;

    let attempts = 0;
    const targetCount = periodFilter === 'year' ? 300 : 80;
    
    for (let i = 0; i < targetCount && attempts < 1000; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
      
      // Seulement les jours de semaine (Lun-Ven)
      if (date.getDay() === 0 || date.getDay() === 6) {
        i--;
        attempts++;
        continue;
      }
      
      const type = Math.random() > 0.5 ? 'in' : 'out';
      
      // Heures selon le type
      // Sorties: principalement le matin (8h-10h)
      // Entrées: principalement le soir (16h-18h)
      if (type === 'out') {
        date.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      } else {
        date.setHours(16 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      }
      
      // Sélectionner 2 employés différents
      const shuffled = [...employees].sort(() => Math.random() - 0.5);
      const performedBy = shuffled[0];
      const verifiedBy = shuffled[1];
      
      // Caissier concerné (optionnel, surtout pour sorties)
      const relatedCashier = (type === 'out' && Math.random() > 0.3) 
        ? cashiers[Math.floor(Math.random() * cashiers.length)]
        : undefined;
      
      const amount = type === 'out'
        ? Math.floor(Math.random() * 2500) + 500  // Sorties: 500-3000$
        : Math.floor(Math.random() * 8000) + 2000; // Entrées: 2000-10000$
      
      data.push({
        id: `vault_mvt_${i + 1}`,
        type,
        amount,
        performed_by: performedBy.id,
        performed_by_name: performedBy.name,
        verified_by: verifiedBy.id,
        verified_by_name: verifiedBy.name,
        related_cashier: relatedCashier?.id,
        related_cashier_name: relatedCashier?.name,
        branch_id: 'branch_001',
        movement_date: date.toISOString(),
        created_at: date.toISOString(),
        notes: Math.random() > 0.3 
          ? notes[type][Math.floor(Math.random() * notes[type].length)]
          : undefined,
        is_locked: true
      });
      
      attempts++;
    }
    
    return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const movements = useMemo(() => generateSampleMovements(), [periodFilter]);

  // Filtrage
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const matchesSearch = 
        m.performed_by_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.verified_by_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.related_cashier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || m.type === typeFilter;
      const matchesMinAmount = !minAmount || m.amount >= parseFloat(minAmount);
      const matchesMaxAmount = !maxAmount || m.amount <= parseFloat(maxAmount);
      
      return matchesSearch && matchesType && matchesMinAmount && matchesMaxAmount;
    });
  }, [movements, searchTerm, typeFilter, minAmount, maxAmount]);

  // Fonctions de sélection
  const handleRowSelect = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === filteredMovements.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredMovements.map(m => m.id)));
    }
  };

  // Groupement par date
  const groupedMovements = useMemo(() => {
    const sorted = [...filteredMovements].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sorted.reduce((acc, movement) => {
      const date = new Date(movement.created_at);
      let key: string;
      
      if (periodFilter === 'day') {
        key = date.toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } else if (periodFilter === 'week' || periodFilter === 'month') {
        key = date.toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } else {
        // Pour l'année, grouper par mois
        key = date.toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long'
        });
      }
      
      if (!acc[key]) acc[key] = [];
      acc[key].push(movement);
      return acc;
    }, {} as Record<string, VaultMovement[]>);
  }, [filteredMovements, periodFilter]);

  // Calculs des KPIs
  const totalIn = movements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.amount, 0);
  const totalOut = movements.filter(m => m.type === 'out').reduce((sum, m) => sum + m.amount, 0);
  const netMovement = totalIn - totalOut;
  const inCount = movements.filter(m => m.type === 'in').length;
  const outCount = movements.filter(m => m.type === 'out').length;

  // Graphique: Volume par période
  const volumeByPeriod = useMemo(() => {
    const periods = periodFilter === 'day' ? 10 : 
                   periodFilter === 'week' ? 5 : 
                   periodFilter === 'month' ? 22 : 12;
    
    const data = Array.from({ length: periods }, (_, i) => {
      const date = new Date();
      
      if (periodFilter === 'day') {
        const hour = 8 + i;
        date.setHours(hour, 0, 0, 0);
        return { label: `${hour}h`, date: date.toISOString(), countIn: 0, countOut: 0, amountIn: 0, amountOut: 0 };
      } else if (periodFilter === 'week') {
        let daysBack = 0;
        let workDaysCount = 0;
        while (workDaysCount < periods - i) {
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
          countIn: 0, countOut: 0, amountIn: 0, amountOut: 0
        };
      } else if (periodFilter === 'month') {
        let daysBack = 0;
        let workDaysCount = 0;
        while (workDaysCount < periods - i) {
          daysBack++;
          const tempDate = new Date();
          tempDate.setDate(tempDate.getDate() - daysBack);
          if (tempDate.getDay() !== 0 && tempDate.getDay() !== 6) {
            workDaysCount++;
          }
        }
        date.setDate(date.getDate() - daysBack);
        return {
          label: date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }),
          date: date.toISOString().split('T')[0],
          countIn: 0, countOut: 0, amountIn: 0, amountOut: 0
        };
      } else {
        date.setMonth(date.getMonth() - (periods - 1 - i));
        return {
          label: date.toLocaleDateString('fr-CA', { month: 'short' }),
          date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          countIn: 0, countOut: 0, amountIn: 0, amountOut: 0
        };
      }
    });

    movements.forEach(m => {
      const movementDate = new Date(m.created_at);
      const index = data.findIndex(item => {
        if (periodFilter === 'day') {
          return new Date(item.date).getHours() === movementDate.getHours();
        } else if (periodFilter === 'year') {
          const itemDate = item.date.split('-');
          return itemDate[0] === movementDate.getFullYear().toString() && 
                 itemDate[1] === String(movementDate.getMonth() + 1).padStart(2, '0');
        } else {
          return item.date === m.created_at.split('T')[0];
        }
      });
      if (index >= 0) {
        if (m.type === 'in') {
          data[index].countIn++;
          data[index].amountIn += m.amount;
        } else {
          data[index].countOut++;
          data[index].amountOut += m.amount;
        }
      }
    });

    return data;
  }, [movements, periodFilter]);

  // Répartition IN vs OUT
  const typeDistribution = [
    { name: 'Entrées', value: inCount, amount: totalIn, color: '#81C784' },
    { name: 'Sorties', value: outCount, amount: totalOut, color: '#ff9800' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-8">
      {/* Filtre de période */}
      <div className="mb-6 flex gap-3">
        {(['day', 'week', 'month', 'year'] as const).map(period => (
          <button
            key={period}
            onClick={() => setPeriodFilter(period)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              periodFilter === period
                ? 'bg-gradient-to-r from-[#355C7D] to-[#2A4A5E] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {period === 'day' ? 'Aujourd\'hui' : 
             period === 'week' ? '7 jours' : 
             period === 'month' ? '30 jours' : 'Année'}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          icon={BiImport}
          label="Total Entrées"
          value={formatCurrency(totalIn)}
          subValue={`${inCount} mouvements`}
          color="bg-gradient-to-br from-[#81C784] to-[#66BB6A]"
        />
        <KPICard
          icon={BiExport}
          label="Total Sorties"
          value={formatCurrency(totalOut)}
          subValue={`${outCount} mouvements`}
          color="bg-gradient-to-br from-[#ff9800] to-[#f57c00]"
        />
        <KPICard
          icon={netMovement >= 0 ? TrendingUp : TrendingDown}
          label="Mouvement Net"
          value={formatCurrency(Math.abs(netMovement))}
          subValue={netMovement >= 0 ? 'Excédent' : 'Déficit'}
          color={netMovement >= 0 
            ? "bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]"
            : "bg-gradient-to-br from-[#ef4444] to-[#dc2626]"}
        />
        <KPICard
          icon={Lock}
          label="Total Mouvements"
          value={movements.length}
          subValue={`${filteredMovements.length} affichés`}
          color="bg-gradient-to-br from-[#355C7D] to-[#2A4A5E]"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Volume des mouvements */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Volume des Mouvements</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={volumeByPeriod}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="countIn" stroke="#81C784" strokeWidth={3} name="Entrées" />
              <Line type="monotone" dataKey="countOut" stroke="#ff9800" strokeWidth={3} name="Sorties" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Montants */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Montants Entrées vs Sorties</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={volumeByPeriod}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} 
              />
              <Bar dataKey="amountIn" fill="#81C784" radius={[8, 8, 0, 0]} name="Entrées" />
              <Bar dataKey="amountOut" fill="#ff9800" radius={[8, 8, 0, 0]} name="Sorties" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition Entrées/Sorties</h3>
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

        {/* Balance nette */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Balance Nette</h3>
          <div className="flex flex-col items-center justify-center h-[250px]">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 ${
              netMovement >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {netMovement >= 0 ? (
                <TrendingUp className={`w-16 h-16 ${netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              ) : (
                <TrendingDown className="w-16 h-16 text-red-600" />
              )}
            </div>
            <p className={`text-3xl font-bold mb-2 ${
              netMovement >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(Math.abs(netMovement))}
            </p>
            <p className="text-sm text-gray-600">
              {netMovement >= 0 ? 'Excédent net' : 'Déficit net'}
            </p>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Historique des Mouvements Coffre</h3>
          <span className="text-sm text-gray-500">{filteredMovements.length} résultats</span>
        </div>

        {/* Filtres */}
        <div className="px-6 py-4 bg-[#F9F9F6] border-b border-gray-200 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#355C7D] focus:border-transparent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#355C7D] focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="in">Entrées uniquement</option>
            <option value="out">Sorties uniquement</option>
          </select>

          <input
            type="number"
            placeholder="Montant minimum"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#355C7D] focus:border-transparent"
          />

          <input
            type="number"
            placeholder="Montant maximum"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#355C7D] focus:border-transparent"
          />
        </div>

        {/* Header du tableau */}
        <div className="bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-12 gap-4 items-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
            <div className="col-span-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedRows.size === filteredMovements.length && filteredMovements.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-[#355C7D] focus:ring-[#355C7D] cursor-pointer"
              />
            </div>
            <div className="col-span-2">Date & Heure</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-2">Effectué par</div>
            <div className="col-span-2">Vérifié par</div>
            <div className="col-span-2">Caissier</div>
            <div className="col-span-2">Montant</div>
          </div>
        </div>

        {/* Badge de sélection */}
        {selectedRows.size > 0 && (
          <div className="bg-[#DDEAD5] border-b border-[#355C7D]/20 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[#1B5E20]">
                {selectedRows.size} mouvement{selectedRows.size > 1 ? 's' : ''} sélectionné{selectedRows.size > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setSelectedRows(new Set())}
                className="text-xs text-[#355C7D] hover:text-[#2A4A5E] font-medium underline"
              >
                Désélectionner tout
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-white border-2 border-[#355C7D] text-[#355C7D] rounded-lg text-sm font-semibold hover:bg-[#DDEAD5] transition-colors">
                Exporter PDF
              </button>
            </div>
          </div>
        )}

        {/* Corps du tableau */}
        <div className="divide-y divide-gray-100">
          {Object.entries(groupedMovements).map(([date, movements]) => (
            <div key={date}>
              {/* Séparateur de date */}
              <div className="bg-[#F9F9F6] px-6 py-2 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{date}</p>
              </div>

              {/* Lignes de mouvements */}
              {movements.map((movement, index) => {
                const isSelected = selectedRows.has(movement.id);
                const isEntry = movement.type === 'in';

                return (
                  <div
                    key={movement.id}
                    className={`
                      grid grid-cols-12 gap-4 items-center px-6 py-4
                      hover:bg-[#DDEAD5]/30 transition-all duration-200
                      group cursor-pointer
                      ${isSelected ? 'bg-[#DDEAD5] border-l-4 border-[#355C7D]' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                    `}
                  >
                    {/* Checkbox */}
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleRowSelect(movement.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-gray-300 text-[#355C7D] focus:ring-[#355C7D] cursor-pointer"
                      />
                    </div>

                    {/* Date & Heure */}
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(movement.created_at).toLocaleDateString('fr-FR', { 
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(movement.created_at).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>

                    {/* Type */}
                    <div className="col-span-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                        isEntry 
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-orange-100 text-orange-700 border border-orange-300'
                      }`}>
                        {isEntry ? <BiImport className="w-3 h-3" /> : <BiExport className="w-3 h-3" />}
                        {isEntry ? 'IN' : 'OUT'}
                      </span>
                    </div>

                    {/* Effectué par */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#355C7D] to-[#2A4A5E] flex items-center justify-center text-white text-xs font-bold">
                          {movement.performed_by_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{movement.performed_by_name}</p>
                          <p className="text-xs text-gray-500">Effectué</p>
                        </div>
                      </div>
                    </div>

                    {/* Vérifié par */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C9B27C] flex items-center justify-center text-white text-xs font-bold">
                          {movement.verified_by_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{movement.verified_by_name}</p>
                          <p className="text-xs text-gray-500">Vérifié</p>
                        </div>
                      </div>
                    </div>

                    {/* Caissier */}
                    <div className="col-span-2">
                      {movement.related_cashier_name ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center text-white text-xs font-bold">
                            {movement.related_cashier_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{movement.related_cashier_name}</p>
                            <p className="text-xs text-gray-500">Caissier</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>

                    {/* Montant */}
                    <div className="col-span-2">
                      <p className={`text-lg font-bold ${
                        isEntry ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {isEntry ? '+' : '-'} {formatCurrency(movement.amount)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Lock className="w-3 h-3" />
                        Verrouillé
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* État vide */}
        {filteredMovements.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 text-lg font-semibold mb-2">Aucun mouvement trouvé</p>
            <p className="text-gray-500 text-sm">Essayez de modifier vos filtres pour voir plus de résultats</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultMovementHistory;