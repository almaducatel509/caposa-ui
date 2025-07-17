'use client';
import MemberCard from '@/app/components/members/MemberCard';
import MemberGrid from '@/app/components/members/MemberGrid';
import { MemberData } from '@/app/components/members/validations';
import { fetchMembers } from '@/app/lib/api/member';
import { useState, useEffect } from 'react';

export default function Members() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Récupération des membres...');
        const data = await fetchMembers();
        setMembers(data);
        console.log('✅ Membres récupérés:', data.length);
      } catch (err) {
        console.error("❌ Erreur lors de la récupération des membres :", err);
        setError("Impossible de récupérer les données des membres.");
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  if (loading) {
    return (
      <div className="w-full p-4">
        <h2 className="text-xl font-bold mb-6">Gestion des Membres</h2>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            {/* Indicateur de chargement animé */}
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-lg font-medium text-gray-700">Recherche des données...</p>
            <p className="text-sm text-gray-500 mt-1">Récupération des membres en cours</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4">
        <h2 className="text-xl font-bold mb-6">Gestion des Membres</h2>
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h3 className="text-xl font-medium text-red-600 mb-2">Erreur de connexion</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-bold mb-6">Gestion des Membres</h2>
      
      {/* Toujours rendre MemberGrid, il gère l'affichage vide */}
      <div className="">
        <MemberGrid />
      </div>
      
      {/* Message d'information si pas de données */}
      {members.length === 0 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-blue-600 text-xl mr-3">ℹ️</span>
            <div>
              <p className="text-blue-800 font-medium">Base de données vide</p>
              <p className="text-blue-600 text-sm">Aucun membre n'a encore été ajouté à votre système.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}