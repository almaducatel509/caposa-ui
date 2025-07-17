'use client';
import React, { useState, useEffect } from 'react';
import { Input, Select, SelectItem, Button } from "@nextui-org/react";
import MemberCard from './MemberCard';
import { MemberData } from './validations';
import { fetchMembers } from '@/app/lib/api/member';
import { FaSearch, FaSync, FaUserPlus } from "react-icons/fa";

const MemberGrid: React.FC = () => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Charger les membres
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Chargement des membres...');
        const data = await fetchMembers();
        setMembers(data);
        console.log('✅ Membres chargés:', data.length);
      } catch (err) {
        console.error('❌ Erreur chargement membres:', err);
        setError('Erreur lors de la récupération des membres.');
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  // Filtrage des membres
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.membership_tier && member.membership_tier.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterType === 'all' || 
      member.membership_type === filterType ||
      (filterType === 'regular' && !member.membership_type);

    return matchesSearch && matchesFilter;
  });

  // Statistiques
  const stats = {
    total: members.length,
    regular: members.filter(m => m.membership_type === 'regular' || !m.membership_type).length,
    premium: members.filter(m => m.membership_type === 'premium').length,
    vip: members.filter(m => m.membership_type === 'vip').length
  };

  // Handlers
  const handleView = (member: MemberData) => {
    console.log('👁️ Voir membre:', member);
    // TODO: Implémenter modal de détails
  };

  const handleEdit = (member: MemberData) => {
    console.log('✏️ Modifier membre:', member);
    // TODO: Implémenter formulaire d'édition
  };

  const handleDelete = (member: MemberData) => {
    console.log('🗑️ Supprimer membre:', member);
    // TODO: Implémenter suppression avec confirmation
  };

  const handleViewTransactions = (member: MemberData) => {
    console.log('💰 Voir cotisations membre:', member);
    // TODO: Implémenter vue des cotisations
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    // Reload members
    const loadMembers = async () => {
      try {
        console.log('🔄 Actualisation des données...');
        const data = await fetchMembers();
        setMembers(data);
        console.log('✅ Données actualisées:', data.length);
      } catch (err) {
        console.error('❌ Erreur actualisation:', err);
        setError('Erreur lors du rechargement des membres.');
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-blue-600">👥</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-700">Récupération des données</p>
            <p className="text-sm text-gray-500">Chargement des membres en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <span className="text-6xl mb-4 block">⚠️</span>
        <h3 className="text-xl font-medium text-red-600 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button
          color="primary"
          startContent={<FaSync />}
          onClick={handleRefresh}
          className="mx-auto"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Membres</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <span className="text-gray-600 text-xl">🎫</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Régulier</p>
              <p className="text-2xl font-bold text-gray-900">{stats.regular}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Premium</p>
              <p className="text-2xl font-bold text-blue-900">{stats.premium}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">👑</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">VIP</p>
              <p className="text-2xl font-bold text-purple-900">{stats.vip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche avec NextUI */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Recherche avec NextUI */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Rechercher un membre (nom, email, username, organisation...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<FaSearch className="text-gray-400" />}
              classNames={{
                input: "text-sm",
                inputWrapper: "border border-gray-300"
              }}
            />
          </div>

          {/* Filtre par type - Version boutons élégants */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Tous', icon: '👥' },
              { key: 'regular', label: 'Régulier', icon: '🎫' },
              { key: 'premium', label: 'Premium', icon: '⭐' },
              { key: 'vip', label: 'VIP', icon: '👑' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 font-medium
                  ${filterType === filter.key 
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }
                `}
              >
                <span className="text-sm">{filter.icon}</span>
                <span className="text-sm">{filter.label}</span>
              </button>
            ))}
          </div>

          {/* Bouton refresh avec NextUI */}
          <Button
            color="primary"
            startContent={<FaSync />}
            onClick={handleRefresh}
          >
            Actualiser
          </Button>
        </div>

        {/* Résultats de recherche */}
        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-medium">{filteredMembers.length}</span> membre(s) trouvé(s) pour "{searchTerm}"
          </div>
        )}
      </div>

      {/* Grille des membres */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16">
          {members.length === 0 ? (
            // Cas où il n'y a aucun membre dans la base de données
            <>
              <span className="text-8xl mb-6 block">📋</span>
              <h3 className="text-2xl font-medium text-gray-900 mb-3">
                Aucune donnée disponible
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Votre base de données des membres est vide. Commencez par ajouter votre premier membre pour voir apparaître les données ici.
              </p>
              <Button
                color="primary"
                size="lg"
                startContent={<FaUserPlus />}
                className="mx-auto"
              >
                Ajouter un membre
              </Button>
            </>
          ) : (
            // Cas où la recherche/filtre ne donne aucun résultat
            <>
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Aucun membre trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                Aucun membre ne correspond à vos critères de recherche ou de filtrage.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Suggestions :</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Vérifiez l'orthographe de votre recherche</li>
                  <li>• Essayez des termes plus généraux</li>
                  <li>• Modifiez ou supprimez les filtres</li>
                </ul>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewTransactions={handleViewTransactions}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberGrid;