'use client';
import MemberGrid from '@/app/components/members/MemberGrid';
import { MemberData } from '@/app/components/members/validations';
import { fetchMembers } from '@/app/lib/api/members';
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
        const data = await fetchMembers();
        setMembers(data);
      } catch (err) {
        console.error("❌ Erreur lors de la récupération des membres :", err);
        setError("Impossible de récupérer les données des membres.");
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, []);

  // Loading state with clean design
  if (loading) {
    return (
      <main className="w-full min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-semibold text-[#2c2e2f] mb-8">Gestion des Membres</h1>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#34963d]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <p className="text-lg font-medium text-[#2c2e2f]">Chargement des membres...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="w-full min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-semibold text-[#2c2e2f] mb-8">Gestion des Membres</h1>
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h3 className="text-xl font-medium text-red-600 mb-2">Erreur de chargement</h3>
            <p className="text-[#2c2e2f]/70 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-[#34963d] text-white rounded-lg hover:bg-[#2d7f34] transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="px-6 py-6">
        {/* Simple header - no clutter */}
        <h1 className="text-2xl font-semibold text-[#2c2e2f] mb-8">Gestion des Membres</h1>
        
        {/* The grid handles everything else */}
        <MemberGrid />
      </div>
    </main>
  );
}