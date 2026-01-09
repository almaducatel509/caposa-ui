'use client';
import React from 'react';
import { TransactionData } from './types';
import TransactionCard from './TransactionCard';

interface TransactionGridProps {
  transactions: TransactionData[];
  filters: {
    search: string;
    type: string;
    status: string;
    dateRange: string;
  };
}

const TransactionGrid: React.FC<TransactionGridProps> = ({ transactions, filters }) => {
  // Fonction de filtrage
  const filteredTransactions = transactions.filter(transaction => {
    // Filtre de recherche
    const matchesSearch = filters.search === '' || 
      transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.amount?.toString().includes(filters.search);

    // Filtre par type
    const matchesType = filters.type === 'all' || transaction.type === filters.type;

    // Filtre par statut
    const matchesStatus = filters.status === 'all' || transaction.status === filters.status;

    // Filtre par date
    const matchesDate = () => {
      if (filters.dateRange === 'all') return true;
      
      const transactionDate = new Date(transaction.created_at || '');
      const now = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          return transactionDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return transactionDate >= monthAgo;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          return transactionDate >= quarterAgo;
        default:
          return true;
      }
    };

    return matchesSearch && matchesType && matchesStatus && matchesDate();
  });
  
  // Gestionnaires d'événements
  const handleView = (transaction: TransactionData) => {
    console.log('👁️ Voir transaction:', transaction);
    // TODO: Implémenter modal de détails
  };

  const handleEdit = (transaction: TransactionData) => {
    console.log('✏️ Modifier transaction:', transaction);
    // TODO: Implémenter formulaire d'édition
  };

  const handleDelete = (transaction: TransactionData) => {
    console.log('🗑️ Supprimer transaction:', transaction);
    // TODO: Implémenter suppression avec confirmation
  };

  const handleProcess = (transaction: TransactionData) => {
    console.log('⚡ Traiter transaction:', transaction);
    // TODO: Implémenter traitement de transaction
  };

  if (filteredTransactions.length === 0) {
    return (
      <div className="text-center py-16">
        {transactions.length === 0 ? (
          // Cas où il n'y a aucune transaction dans la base de données
          <div>
            <span className="text-8xl mb-6 block">💰</span>
            <h3 className="text-2xl font-medium text-gray-900 mb-3">
              Aucune transaction enregistrée
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Votre registre de transactions est vide. Commencez par enregistrer votre première transaction pour voir apparaître les données ici.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl mb-2">💵</div>
                  <h4 className="font-medium text-blue-900">Dépôts</h4>
                  <p className="text-xs text-blue-700">Espèces, chèques</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl mb-2">💸</div>
                  <h4 className="font-medium text-red-900">Retraits</h4>
                  <p className="text-xs text-red-700">Guichet, achats</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl mb-2">🔄</div>
                  <h4 className="font-medium text-green-900">Virements</h4>
                  <p className="text-xs text-green-700">Interac, transferts</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl mb-2">🏦</div>
                  <h4 className="font-medium text-purple-900">Prêts</h4>
                  <p className="text-xs text-purple-700">Demandes, versements</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Cas où la recherche/filtre ne donne aucun résultat
          <div>
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Aucune transaction trouvée
            </h3>
            <p className="text-gray-600 mb-4">
              Aucune transaction ne correspond à vos critères de recherche ou de filtrage.
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
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <p className="font-medium text-gray-900">
              {filteredTransactions.length} transaction(s) affichée(s)  
            </p>
            <p className="text-sm text-gray-600">
              Sur un total de {transactions.length} transactions
            </p>
          </div>
        </div>
        
        {filteredTransactions.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Montant total filtré</p>
            <p className="font-bold text-green-600">
              {new Intl.NumberFormat('fr-CA', {
                style: 'currency',
                currency: 'CAD'
              }).format(
                filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
              )}
            </p>
          </div>
        )}
      </div>

      {/* Grille des cartes de transaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTransactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
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

export default TransactionGrid;