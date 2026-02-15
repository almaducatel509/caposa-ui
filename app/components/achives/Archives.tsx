'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // AJOUT: Import du router
import { FaArchive, FaSearch, FaFilePdf, FaFileCsv, FaFilter, FaEye, FaTrash, FaUndo } from 'react-icons/fa';
import { 
  Archive, 
  ArchiveCategory, 
  ArchiveFilters,
  getCategoryLabel,
  getTypeLabel,
  getCategoryIcon
} from '@/types/archives';

// Données mockées - à remplacer par API calls
const generateMockArchives = (): Archive[] => {
  return [
    {
      id: 'ARC_20260215_00001',
      category: 'operational',
      type: 'reconciliation_caisse',
      date: new Date('2026-02-15'),
      employeeId: 'emp_001',
      employeeName: 'Jean Dupont',
      employeeRole: 'Caissier',
      summary: 'Réconciliation journalière - Écart de -30.00 G expliqué',
      metadata: {
        reportId: 'rpt_20260213',
        openingCash: 2000,
        theoreticalCash: 7130,
        actualCash: 7100,
        discrepancy: -30,
        status: 'balanced'
      },
      detailsUrl: '/reconciliation/rpt_20260213',
      isDeleted: false,
      createdAt: new Date('2026-02-15T17:45:00'),
      updatedAt: new Date('2026-02-15T17:45:00')
    },
    {
      id: 'ARC_20260201_00002',
      category: 'regulatory',
      type: 'rapport_liquidite',
      date: new Date('2026-02-01'),
      periode: 'Janvier 2026',
      employeeId: 'system',
      employeeName: 'Système',
      employeeRole: 'Automatique',
      summary: 'Rapport de liquidité - Janvier 2026 - Statut: Conforme',
      metadata: {
        reportType: 'liquidite',
        periode: 'Janvier 2026',
        status: 'Conforme',
        keyMetrics: {
          ratioLiquidite: 18.5,
          liquiditeDisponible: 1200000
        }
      },
      documentUrl: '/rapports/liquidite/janvier-2026.pdf',
      isDeleted: false,
      createdAt: new Date('2026-02-01T09:00:00'),
      updatedAt: new Date('2026-02-01T09:00:00')
    },
    {
      id: 'ARC_20260201_00003',
      category: 'regulatory',
      type: 'rapport_solvabilite',
      date: new Date('2026-02-01'),
      periode: 'Janvier 2026',
      employeeId: 'system',
      employeeName: 'Système',
      employeeRole: 'Automatique',
      summary: 'Rapport de solvabilité - Janvier 2026 - Statut: Conforme',
      metadata: {
        reportType: 'solvabilite',
        periode: 'Janvier 2026',
        status: 'Conforme',
        keyMetrics: {
          ratioSolvabilite: 12.3,
          capitalPropre: 800000
        }
      },
      documentUrl: '/rapports/solvabilite/janvier-2026.pdf',
      isDeleted: false,
      createdAt: new Date('2026-02-01T09:15:00'),
      updatedAt: new Date('2026-02-01T09:15:00')
    },
    {
      id: 'ARC_20260214_00004',
      category: 'operational',
      type: 'pret_approuve',
      date: new Date('2026-02-14'),
      employeeId: 'emp_003',
      employeeName: 'Marie Tremblay',
      employeeRole: 'Gestionnaire de prêts',
      summary: 'Prêt approuvé - Jean Baptiste - 50,000 G',
      metadata: {
        loanId: 'loan_2026_0234',
        memberId: 'mbr_1234',
        memberName: 'Jean Baptiste',
        amount: 50000,
        decision: 'approved',
        approvedBy: 'Marie Tremblay'
      },
      detailsUrl: '/loans/loan_2026_0234',
      isDeleted: false,
      createdAt: new Date('2026-02-14T14:30:00'),
      updatedAt: new Date('2026-02-14T14:30:00')
    },
    {
      id: 'ARC_20260210_00005',
      category: 'administrative',
      type: 'horaire',
      date: new Date('2026-02-10'),
      employeeId: 'emp_002',
      employeeName: 'Paul Martin',
      employeeRole: 'RH',
      summary: 'Modification horaire - Équipe caisse - Mars 2026',
      metadata: {
        scheduleId: 'sch_2026_03',
        period: 'Mars 2026',
        affectedEmployees: 5
      },
      isDeleted: false,
      createdAt: new Date('2026-02-10T10:00:00'),
      updatedAt: new Date('2026-02-10T10:00:00')
    },
    {
      id: 'ARC_20260215_00006',
      category: 'operational',
      type: 'transaction_journaliere',
      date: new Date('2026-02-15'),
      employeeId: 'emp_001',
      employeeName: 'Jean Dupont',
      employeeRole: 'Caissier',
      summary: 'Dépôt - Sophie Lavoie - 15,000 G',
      metadata: {
        transactionId: 'tx_20260215_0123',
        memberId: 'mbr_5678',
        memberName: 'Sophie Lavoie',
        amount: 15000,
        type: 'deposit',
        status: 'completed'
      },
      detailsUrl: '/transactions/tx_20260215_0123',
      isDeleted: false,
      createdAt: new Date('2026-02-15T11:20:00'),
      updatedAt: new Date('2026-02-15T11:20:00')
    },
    // Exemple d'archive soft-deleted
    {
      id: 'ARC_20260101_00007',
      category: 'administrative',
      type: 'document_interne',
      date: new Date('2026-01-01'),
      employeeId: 'emp_002',
      employeeName: 'Paul Martin',
      employeeRole: 'RH',
      summary: 'Document interne - Test (supprimé)',
      metadata: {},
      isDeleted: true,
      deletedBy: 'direction',
      deletedAt: new Date('2026-01-15T16:00:00'),
      deletionReason: 'Document de test - nettoyage administratif',
      createdAt: new Date('2026-01-01T08:00:00'),
      updatedAt: new Date('2026-01-15T16:00:00')
    }
  ];
};

export default function ArchivesPage() {
  const router = useRouter(); // AJOUT: Initialiser le router
  const [archives] = useState<Archive[]>(generateMockArchives());
  const [selectedCategory, setSelectedCategory] = useState<ArchiveCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  // Filtrer les archives
  const filteredArchives = useMemo(() => {
    return archives.filter(archive => {
      // Filtre catégorie
      if (selectedCategory !== 'all' && archive.category !== selectedCategory) {
        return false;
      }

      // Filtre supprimés
      if (!showDeleted && archive.isDeleted) {
        return false;
      }

      // Filtre recherche
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          archive.id.toLowerCase().includes(search) ||
          archive.summary.toLowerCase().includes(search) ||
          archive.employeeName.toLowerCase().includes(search) ||
          getTypeLabel(archive.type).toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [archives, selectedCategory, searchTerm, showDeleted]);

  // Statistiques
  const stats = useMemo(() => {
    const operational = archives.filter(a => a.category === 'operational' && !a.isDeleted).length;
    const regulatory = archives.filter(a => a.category === 'regulatory' && !a.isDeleted).length;
    const administrative = archives.filter(a => a.category === 'administrative' && !a.isDeleted).length;
    const deleted = archives.filter(a => a.isDeleted).length;

    return { operational, regulatory, administrative, deleted, total: archives.length };
  }, [archives]);

  const handleExportPDF = () => {
    console.log('Export PDF avec filtres:', { selectedCategory, searchTerm, showDeleted });
    alert('📄 Export PDF en cours de développement...\n\nCette fonctionnalité permettra d\'exporter:\n• Liste des archives filtrées\n• Avec horodatage complet\n• Pour audits externes');
  };

  const handleExportCSV = () => {
    console.log('Export CSV avec filtres:', { selectedCategory, searchTerm, showDeleted });
    
    // Créer le CSV simple
    const headers = ['ID', 'Catégorie', 'Type', 'Date', 'Employé', 'Résumé', 'Statut'];
    const rows = filteredArchives.map(archive => [
      archive.id,
      getCategoryLabel(archive.category),
      getTypeLabel(archive.type),
      archive.date.toLocaleDateString('fr-CA'),
      archive.employeeName,
      archive.summary,
      archive.isDeleted ? 'Supprimé' : 'Actif'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Télécharger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `archives_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // NOUVELLE FONCTION: Navigation vers les pages de détails
  const handleViewDetails = (archive: Archive) => {
    // Construire l'URL de détail selon le type d'archive
    let detailUrl = '';
    
    // ============== OPÉRATIONNEL ==============
    if (archive.category === 'operational' && archive.type === 'reconciliation_caisse') {
      detailUrl = `/dashboard/archives/reconciliation/${archive.id}`;
    } 
    else if (archive.category === 'operational' && (archive.type === 'pret_approuve' || archive.type === 'pret_refuse')) {
      detailUrl = `/dashboard/archives/loan/${archive.id}`;
    } 
    else if (archive.category === 'operational' && archive.type === 'transaction_journaliere') {
      detailUrl = `/dashboard/archives/transaction/${archive.id}`;
    }
    else if (archive.category === 'operational' && archive.type === 'mouvement_tresorerie') {
      detailUrl = `/dashboard/archives/treasury/${archive.id}`;
    }
    
    // ============== RÉGLEMENTAIRE ==============
    else if (archive.category === 'regulatory') {
      // Tous les rapports réglementaires utilisent la même page de détails
      detailUrl = `/dashboard/archives/rapport/${archive.id}`;
    }
    
    // ============== ADMINISTRATIF ==============
    else if (archive.category === 'administrative') {
      detailUrl = `/dashboard/archives/administrative/${archive.id}`;
    }
    
    // Naviguer vers la page de détails
    if (detailUrl) {
      router.push(detailUrl);
    } else {
      alert('⚠️ Type d\'archive non supporté\n\nCe type d\'archive n\'a pas encore de page de détails configurée.');
    }
  };

  const handleSoftDelete = (archiveId: string) => {
    console.log('Soft delete archive:', archiveId);
    alert('🔒 ATTENTION\n\nSeule la direction peut désactiver une archive.\n\nCette action nécessite:\n• Authentification direction\n• Raison de suppression\n• Confirmation');
  };

  const handleRestore = (archiveId: string) => {
    console.log('Restaurer archive:', archiveId);
    alert('✅ Restauration d\'archive\n\nCette fonctionnalité permet à la direction de réactiver une archive soft-deleted.');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-CA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-CA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaArchive className="text-blue-600" />
                📂 Archives
              </h1>
              <p className="text-gray-600 mt-1">
                Traçabilité complète des opérations - Audit et conformité
              </p>
            </div>

            {/* Boutons Export */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-md"
              >
                <FaFileCsv />
                Export CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-md"
              >
                <FaFilePdf />
                Export PDF
              </button>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total archives</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total - stats.deleted}</p>
                </div>
                <div className="text-3xl">📦</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Opérationnel</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.operational}</p>
                </div>
                <div className="text-3xl">⚙️</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Réglementaire</p>
                  <p className="text-2xl font-bold text-green-900">{stats.regulatory}</p>
                </div>
                <div className="text-3xl">📋</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700">Administratif</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.administrative}</p>
                </div>
                <div className="text-3xl">📁</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et Recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            {/* Sélecteur de catégorie */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaFilter className="inline mr-2" />
                Catégorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ArchiveCategory | 'all')}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
              >
                <option value="all">📦 Toutes les catégories</option>
                <option value="operational">⚙️ Opérationnel</option>
                <option value="regulatory">📋 Réglementaire</option>
                <option value="administrative">📁 Administratif</option>
              </select>
            </div>

            {/* Recherche */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline mr-2" />
                Recherche
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ID, employé, résumé, type..."
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
              />
            </div>

            {/* Toggle archives supprimées */}
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-200"
                />
                <span className="text-sm font-medium text-gray-700">
                  Afficher archives désactivées ({stats.deleted})
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Tableau des archives */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="text-left py-4 px-4 font-semibold">ID</th>
                  <th className="text-left py-4 px-4 font-semibold">Catégorie</th>
                  <th className="text-left py-4 px-4 font-semibold">Type</th>
                  <th className="text-left py-4 px-4 font-semibold">Date</th>
                  <th className="text-left py-4 px-4 font-semibold">Employé</th>
                  <th className="text-left py-4 px-4 font-semibold">Résumé</th>
                  <th className="text-center py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArchives.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="text-gray-400">
                        <FaArchive className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Aucune archive trouvée</p>
                        <p className="text-sm mt-2">Essayez de modifier vos filtres</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredArchives.map((archive, index) => (
                    <tr 
                      key={archive.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        archive.isDeleted ? 'bg-red-50 opacity-60' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-gray-700">{archive.id}</span>
                        {archive.isDeleted && (
                          <span className="block text-xs text-red-600 font-semibold mt-1">DÉSACTIVÉ</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                          {getCategoryIcon(archive.category)}
                          {getCategoryLabel(archive.category)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-700">{getTypeLabel(archive.type)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">{formatDate(archive.date)}</div>
                          <div className="text-gray-500">{formatTime(archive.createdAt)}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{archive.employeeName}</div>
                          <div className="text-gray-500">{archive.employeeRole}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-700">{archive.summary}</p>
                        {archive.periode && (
                          <p className="text-xs text-gray-500 mt-1">Période: {archive.periode}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(archive)}
                            className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                            title="Voir détails"
                          >
                            <FaEye />
                          </button>
                          {!archive.isDeleted ? (
                            <button
                              onClick={() => handleSoftDelete(archive.id)}
                              className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                              title="Désactiver (Direction uniquement)"
                            >
                              <FaTrash />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestore(archive.id)}
                              className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                              title="Restaurer"
                            >
                              <FaUndo />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer avec compteur */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Affichage de <strong>{filteredArchives.length}</strong> archive(s)
                {searchTerm && <> · Recherche: <strong>"{searchTerm}"</strong></>}
              </span>
              <span className="text-xs">
                🔒 Archives immuables - Soft delete uniquement (Direction)
              </span>
            </div>
          </div>
        </div>

        {/* Info importante */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-blue-900 mb-2">ℹ️ À propos des archives</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">•</span>
              <span><strong>Immuabilité :</strong> Les archives ne peuvent jamais être modifiées ou supprimées définitivement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">•</span>
              <span><strong>Génération automatique :</strong> Chaque opération sensible crée automatiquement une archive</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">•</span>
              <span><strong>Soft delete :</strong> Seule la direction peut "désactiver" une archive (elle reste visible avec le filtre)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">•</span>
              <span><strong>Export :</strong> PDF et CSV disponibles pour audits externes et inspections</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}