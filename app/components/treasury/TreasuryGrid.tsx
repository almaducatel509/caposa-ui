'use client';
import React from 'react';
import { Building2, User, DollarSign, TrendingUp, TrendingDown, ArrowRightLeft, Banknote, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { TreasuryData } from './validation';
import TreasuryCard from './TreasuryCard';


interface TreasuryGridProps {
  treasuries: TreasuryData[];
  filters: {
    search: string;
    type: string;
    status: string;
    dateRange: string;
  };
}  

// Treasury Grid Component
const TreasuryGrid: React.FC<TreasuryGridProps> = ({ treasuries, filters }) => {
    // Fonction de filtrage
  const filteredTreasuries = treasuries.filter(treasury => {
        // Filtre de recherche
    const matchesSearch = filters.search === '' || 
      treasury.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      treasury.member_id.toLowerCase().includes(filters.search.toLowerCase()) ||
      treasury.amount?.toString().includes(filters.search);
    
      // Filtre par type
    const matchesType = filters.type === 'all' || treasury.type === filters.type;
      // Filtre par statut
    const matchesStatus = filters.status === 'all' || treasury.status === filters.status;
     // Filtre par date
    const matchesDate = () => {
      if (filters.dateRange === 'all') return true;
      
      const treasuryDate = new Date(treasury.created_at || '');
      const now = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          return treasuryDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return treasuryDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return treasuryDate >= monthAgo;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          return treasuryDate >= quarterAgo;
        default:
          return true;
      }
    };

    return matchesSearch && matchesType && matchesStatus && matchesDate();
  });

  const handleView = (treasury: TreasuryData) => {
    console.log('👁️ Voir opération de trésorerie:', treasury);
  };

  const handleEdit = (treasury: TreasuryData) => {
    console.log('✏️ Modifier opération de trésorerie:', treasury);
  };

  const handleDelete = (treasury: TreasuryData) => {
    console.log('🗑️ Supprimer opération de trésorerie:', treasury);
  };

  const handleProcess = (treasury: TreasuryData) => {
    console.log('⚡ Traiter opération de trésorerie:', treasury);
  };

  if (filteredTreasuries.length === 0) {
    return (
      <div className="text-center py-16">
        {treasuries.length === 0 ? (
          <div>
            <span className="text-8xl mb-6 block">🏦</span>
            <h3 className="text-2xl font-medium text-gray-900 mb-3">
              Aucune opération de trésorerie
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Votre registre de trésorerie est vide. Commencez par enregistrer votre première opération pour voir apparaître les données ici.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl mb-2">📈</div>
                  <h4 className="font-medium text-green-900">Dépôts</h4>
                  <p className="text-xs text-green-700">Entrées de fonds</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl mb-2">📉</div>
                  <h4 className="font-medium text-red-900">Retraits</h4>
                  <p className="text-xs text-red-700">Sorties de fonds</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl mb-2">🔄</div>
                  <h4 className="font-medium text-blue-900">Virements</h4>
                  <p className="text-xs text-blue-700">Transferts internes</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl mb-2">💰</div>
                  <h4 className="font-medium text-purple-900">Prêts</h4>
                  <p className="text-xs text-purple-700">Gestion de prêts</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Aucune opération trouvée
            </h3>
            <p className="text-gray-600 mb-4">
              Aucune opération ne correspond à vos critères de recherche ou de filtrage.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Suggestions :</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vérifiez l'orthographe de votre recherche</li>
                <li>• Essayez des termes plus généraux</li>
                <li>• Modifiez la période de recherche</li>
                <li>• Supprimez certains filtres</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Résumé des résultats */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <p className="font-medium text-gray-900">
              {filteredTreasuries.length} opération(s) affichée(s)
            </p>
            <p className="text-sm text-gray-600">
              Sur un total de {treasuries.length} opérations
            </p>
          </div>
        </div>
        
        {filteredTreasuries.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Montant total filtré</p>
            <p className="font-bold text-green-600">
              {new Intl.NumberFormat('fr-CA', {
                style: 'currency',
                currency: 'CAD'
              }).format(
                filteredTreasuries.reduce((sum, t) => sum + (t.amount || 0), 0)
              )}
            </p>
          </div>
        )}
      </div>

      {/* Grille des cartes d'opérations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTreasuries.map((treasury) => (
          <TreasuryCard
            key={treasury.id}
            treasury={treasury}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onProcess={handleProcess}
          />
        ))}
      </div>
    </div>
  );
};

export default TreasuryGrid;

function getTypeConfig(type: any) {
  throw new Error('Function not implemented.');
}
