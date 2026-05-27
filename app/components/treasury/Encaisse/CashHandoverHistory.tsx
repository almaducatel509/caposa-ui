'use client';
import React, { useState, useMemo } from 'react';
import { Search, Calendar, DollarSign, Users, FileText, CheckCircle, Lock } from 'lucide-react';
import { BarChart, Bar, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import type { EmployeeData } from '@/app/components/employees/validations';
import { Session } from '@/types/session';
import { Branch } from '@/types/branche';
import { getFullName, getInitials } from '@/app/utils/employee';
import { ExportAllButton } from '@/app/ExportAllButton';

export interface CashHandover {
  id: string;
  type: 'opening' | 'closing';
  amount: number;
  notes?: string;
  created_at: string;

  // FKs
  session_id: string;
  branch_id: string;
  verified_by_id: string;
  received_by_id: string;

  // Objets joints (singulier — un seul de chaque)
  session?: Session;
  branch?: Branch;
  employee?: EmployeeData;       // l'employé de la session (celui qui remet)
  verified_by?: EmployeeData;
  received_by?: EmployeeData;
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

const CashHandoverHistory: React.FC = () => {
  const [periodFilter, setPeriodFilter] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Génération de données échantillon (Lun-Ven, 8h-10h)
  const generateSampleHandovers = (): CashHandover[] => {
     const makeEmployee = (id: string, first: string, last: string): EmployeeData => ({
    id,
    first_name: first,
    last_name: last,
    phone_number: '',
    payment_ref: '',
    posts: [],
    branch: 'branch_001',
    nomComplet: `${first} ${last}`,
  });
   const employees: EmployeeData[] = [
    makeEmployee('emp_001', 'Jean', 'Dupont'),
    makeEmployee('emp_002', 'Marie', 'Tremblay'),
    makeEmployee('emp_003', 'Paul', 'Martin'),
    makeEmployee('emp_004', 'Sophie', 'Lavoie'),
    makeEmployee('emp_005', 'Luc', 'Gagnon'),
    makeEmployee('emp_006', 'Claire', 'Bergeron'),
  ];

    const data: CashHandover[] = [];
    const daysBack = periodFilter === 'day' ? 1 : 
                     periodFilter === 'week' ? 7 : 
                     periodFilter === 'month' ? 30 : 365;

    let attempts = 0;
    
    for (let i = 0; i < (periodFilter === 'year' ? 250 : 60) && attempts < 500; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
      
      // Seulement les jours de semaine (Lun-Ven)
      if (date.getDay() === 0 || date.getDay() === 6) {
        i--;
        attempts++;
        continue;
      }
      
      // Entre 8h et 10h du matin
      date.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
      
      // Sélectionner 3 employés différents
      const shuffled = [...employees].sort(() => Math.random() - 0.5);
      const employee = shuffled[0];       // ← celui qui remet
      const verifiedBy = shuffled[1];
      const receivedBy = shuffled[2];
      
      const amount = Math.floor(Math.random() * 3000) + 1000; // Entre 1000 et 4000
      
      data.push({
        id: `handover_${i + 1}`,
        type: 'closing',
        amount,
        notes: Math.random() > 0.7 ? 'Fonds de caisse standard du matin' : undefined,
        created_at: date.toISOString(),

        // FKs
        session_id: `session_${i + 1}`,
        branch_id: 'branch_001',
        verified_by_id: verifiedBy.id,
        received_by_id: receivedBy.id,

        // Objets joints
        employee,
        verified_by: verifiedBy,
        received_by: receivedBy,
      });
      attempts++;
    }
    
    return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const handovers = useMemo(() => generateSampleHandovers(), [periodFilter]);

  // Filtrage
  const filteredHandovers = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return handovers.filter(h => {
      const matchesSearch =
        getFullName(h.employee).toLowerCase().includes(term) ||
        getFullName(h.verified_by).toLowerCase().includes(term) ||
        getFullName(h.received_by).toLowerCase().includes(term) ||
        h.id.toLowerCase().includes(term);

      const matchesMinAmount = !minAmount || h.amount >= parseFloat(minAmount);
      const matchesMaxAmount = !maxAmount || h.amount <= parseFloat(maxAmount);

      return matchesSearch && matchesMinAmount && matchesMaxAmount;
    });
  }, [handovers, searchTerm, minAmount, maxAmount]);

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
    if (selectedRows.size === filteredHandovers.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredHandovers.map(h => h.id)));
    }
  };

  // Groupement par date
  const groupedHandovers = useMemo(() => {
    const sorted = [...filteredHandovers].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sorted.reduce((acc, handover) => {
      const date = new Date(handover.created_at);
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
      acc[key].push(handover);
      return acc;
    }, {} as Record<string, CashHandover[]>);
  }, [filteredHandovers, periodFilter]);

  // Calculs des KPIs
  const totalAmount = handovers.reduce((sum, h) => sum + h.amount, 0);
  const averageAmount = handovers.length > 0 ? totalAmount / handovers.length : 0;
  const uniqueEmployees = new Set(
    handovers.flatMap(h => [
      h.employee?.id,
      h.verified_by?.id,
      h.received_by?.id,
    ]).filter(Boolean)
  ).size;

  // Graphique: Volume par période
  const volumeByPeriod = useMemo(() => {
    const periods = periodFilter === 'day' ? 10 : 
                   periodFilter === 'week' ? 5 : 
                   periodFilter === 'month' ? 22 : 12;
    
    const data = Array.from({ length: periods }, (_, i) => {
      const date = new Date();
      
      if (periodFilter === 'day') {
        // Heures de 8h à 17h
        const hour = 8 + i;
        date.setHours(hour, 0, 0, 0);
        return { label: `${hour}h`, date: date.toISOString(), count: 0, amount: 0 };
      } else if (periodFilter === 'week') {
        // 5 derniers jours ouvrables
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
          count: 0,
          amount: 0
        };
      } else if (periodFilter === 'month') {
        // 22 derniers jours ouvrables
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
          count: 0,
          amount: 0
        };
      } else {
        // 12 derniers mois
        date.setMonth(date.getMonth() - (periods - 1 - i));
        return {
          label: date.toLocaleDateString('fr-CA', { month: 'short' }),
          date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          count: 0,
          amount: 0
        };
      }
    });

    handovers.forEach(h => {
      const handoverDate = new Date(h.created_at);
      const index = data.findIndex(item => {
        if (periodFilter === 'day') {
          return new Date(item.date).getHours() === handoverDate.getHours();
        } else if (periodFilter === 'year') {
          const itemDate = item.date.split('-');
          return itemDate[0] === handoverDate.getFullYear().toString() && 
                 itemDate[1] === String(handoverDate.getMonth() + 1).padStart(2, '0');
        } else {
          return item.date === h.created_at.split('T')[0];
        }
      });
      if (index >= 0) {
        data[index].count++;
        data[index].amount += h.amount;
      }
    });

    return data;
  }, [handovers, periodFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-CA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // Remises actuellement sélectionnées
  const selectedHandovers = useMemo(
    () => filteredHandovers.filter(h => selectedRows.has(h.id)),
    [filteredHandovers, selectedRows]
  );
  

  // Format aplati pour Excel (une ligne = une remise, colonnes simples)
  const exportRows = useMemo(
    () => selectedHandovers.map(h => ({
      id: h.id,
      date: new Date(h.created_at).toLocaleDateString('fr-CA'),
      heure: new Date(h.created_at).toLocaleTimeString('fr-CA', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      remis_par: getFullName(h.employee),
      verifie_par: getFullName(h.verified_by),
      recu_par: getFullName(h.received_by),
      montant: h.amount,
      type: h.type,
      notes: h.notes ?? '',
    })),
    [selectedHandovers]
  );

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 min-h-screen bg-[#F9F9F6]">
      {/* Filtre de période */}
      <div className="mb-6 flex gap-3">
        {(['day', 'week', 'month', 'year'] as const).map(period => (
          <button
            key={period}
            onClick={() => setPeriodFilter(period)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              periodFilter === period
                ? 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-lg'
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
          icon={FileText}
          label="Total des remises"
          value={handovers.length}
          subValue={`${filteredHandovers.length} affichées`}
          color="bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]"
        />
        <KPICard
          icon={DollarSign}
          label="Montant total"
          value={formatCurrency(totalAmount)}
          color="bg-gradient-to-br from-[#355C7D] to-[#2A4A5E]"
        />
        <KPICard
          icon={DollarSign}
          label="Montant moyen"
          value={formatCurrency(averageAmount)}
          color="bg-gradient-to-br from-[#D4AF37] to-[#C9B27C]"
        />
        <KPICard
          icon={Users}
          label="Employés impliqués"
          value={uniqueEmployees}
          color="bg-gradient-to-br from-[#81C784] to-[#66BB6A]"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Volume */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Nombre de Remises</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={volumeByPeriod}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="count" stroke="#2E7D32" strokeWidth={3} name="Nombre" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Montants */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Montants Remis</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={volumeByPeriod}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value) => typeof value === 'number' ? formatCurrency(value) : String(value)}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} 
              />
              <Bar dataKey="amount" fill="#2E7D32" radius={[8, 8, 0, 0]} name="Montant" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Historique des Remises de Caisse</h3>
          <span className="text-sm text-gray-500">{filteredHandovers.length} résultats</span>
        </div>

        {/* Filtres */}
        <div className="px-6 py-4 bg-[#F9F9F6] border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
            />
          </div>

          <input
            type="number"
            placeholder="Montant minimum"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
          />

          <input
            type="number"
            placeholder="Montant maximum"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
          />
        </div>

        {/* Header du tableau */}
        <div className="bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-12 gap-5 items-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
            <div className="col-span-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedRows.size === filteredHandovers.length && filteredHandovers.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32] cursor-pointer"
              />
            </div>
            <div className="col-span-2">Date & Heure</div>
            <div className="col-span-2">Remis par</div>
            <div className="col-span-2">Vérifié par</div>
            <div className="col-span-2">Reçu par</div>
            <div className="col-span-2">Montant</div>
          </div>
        </div>
        {/* Badge de sélection */}
        {selectedRows.size > 0 && (
          <div className="bg-[#DDEAD5] border-b border-[#2E7D32]/20 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[#1B5E20]">
                {selectedRows.size} remise{selectedRows.size > 1 ? 's' : ''} sélectionnée{selectedRows.size > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setSelectedRows(new Set())}
                className="text-xs text-[#2E7D32] hover:text-[#1B5E20] font-medium underline"
              >
                Désélectionner tout
              </button>
            </div>

            <ExportAllButton
              data={exportRows}
              filename="remises_caisse"
              label="Exporter Excel"
              separator=";"
              headerLabels={{
                id: 'Référence',
                date: 'Date',
                heure: 'Heure',
                remis_par: 'Remis par',
                verifie_par: 'Vérifié par',
                recu_par: 'Reçu par',
                montant: 'Montant (CAD)',
                type: 'Type',
                notes: 'Notes',
              }}
            />
          </div>
        )}

        {/* Corps du tableau */}
        <div className="divide-y divide-gray-100">
          {Object.entries(groupedHandovers).map(([date, handovers]) => (
            <div key={date}>
              {/* Séparateur de date */}
              <div className="bg-[#F9F9F6] px-6 py-2 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{date}</p>
              </div>

              {/* Lignes de remises */}
              {handovers.map((handover, index) => {
                const isSelected = selectedRows.has(handover.id);

                return (
                  <div
                    key={handover.id}
                    className={`
                      grid grid-cols-12 gap-4 items-center px-6 py-4
                      hover:bg-[#DDEAD5]/30 transition-all duration-200
                      group cursor-pointer
                      ${isSelected ? 'bg-[#DDEAD5] border-l-4 border-[#2E7D32]' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                    `}
                  >
                    {/* Checkbox */}
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleRowSelect(handover.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32] cursor-pointer"
                      />
                    </div>

                    {/* Date & Heure */}
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(handover.created_at).toLocaleDateString('fr-FR', { 
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(handover.created_at).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>

                    {/* Remis par */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center text-white text-xs font-bold">
                          {getInitials(handover.employee)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getFullName(handover.employee)}
                          </p>
                          <p className="text-xs text-gray-500">Remis</p>
                        </div>
                      </div>
                    </div>

                    {/* Vérifié par */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#355C7D] to-[#2A4A5E] flex items-center justify-center text-white text-xs font-bold">
                          {getInitials(handover.verified_by)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getFullName(handover.verified_by)}
                          </p>
                          <p className="text-xs text-gray-500">Vérifié</p>
                        </div>
                      </div>
                    </div>

                    {/* Reçu par */}
                   <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C9B27C] flex items-center justify-center text-white text-xs font-bold">
                          {getInitials(handover.received_by)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getFullName(handover.received_by)}
                          </p>
                          <p className="text-xs text-gray-500">Reçu</p>
                        </div>
                      </div>
                    </div>

                    {/* Montant */}
                    <div className="col-span-2">
                      <p className="text-lg font-bold text-[#2E7D32]">
                        {formatCurrency(handover.amount)}
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
        {filteredHandovers.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 text-lg font-semibold mb-2">Aucune remise trouvée</p>
            <p className="text-gray-500 text-sm">Essayez de modifier vos filtres pour voir plus de résultats</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashHandoverHistory;