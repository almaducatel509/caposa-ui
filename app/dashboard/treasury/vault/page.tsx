'use client';
import { useState } from 'react';
import PageHeader from '@/app/components/header';
import VaultOverview from '@/app/components/treasury/Coffre/VaultOverview';
import VaultDeclarationModal from '@/app/components/treasury/Coffre/VaultDeclarationModal';
import { FaClipboardList, FaLock } from 'react-icons/fa';

export default function CoffrePage() {
  const [showDeclarationModal, setShowDeclarationModal] = useState(false);

  const handleViewHistory = () => {
    // Navigation vers page historique complète
    window.location.href = 'http://localhost:3000/dashboard/treasury/vault/history';
    // Ou avec Next.js router:
    // router.push('/treasury/coffre/history');
  };

  return (
    <div className="min-h-screen">
      {/* Header de la page */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <PageHeader
              title="Coffre"
              subtitle="Gestion des réserves et mouvements"
              icon={<FaLock className="text-4xl text-gray-700" />}
            />
            
            <div className="flex gap-3">
              <button
                onClick={handleViewHistory}
                className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#355C7D] text-[#355C7D] rounded-lg hover:bg-[#355C7D]/10 transition-colors font-medium"
              >
                <FaClipboardList className="text-sm" />
                Historique
              </button>
              <button
                onClick={() => setShowDeclarationModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-[#D4AF37] to-[#C9B27C] text-white rounded-lg hover:from-[#C9B27C] hover:to-[#D4AF37] transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                <FaClipboardList className="text-xl" />
                Déclarer Coffre
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="bg-gray-50">
        <VaultOverview />
      </div>

      {/* Modal Déclaration (géré au niveau page) */}
      <VaultDeclarationModal 
        isOpen={showDeclarationModal}
        onClose={() => setShowDeclarationModal(false)}
      />
    </div>
  );
}