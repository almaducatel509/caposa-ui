'use client';
import React, { useState, useEffect } from 'react';
import { Button, Chip, Progress } from "@nextui-org/react";
import { FaPlus, FaEye, FaDownload, FaCalendarAlt, FaCreditCard } from "react-icons/fa";

// Types spécifiques aux prêts
interface LoanData {
  id: string;
  amount: number;
  status: 'requested' | 'under_review' | 'approved' | 'disbursed' | 'active' | 'completed' | 'rejected' | 'defaulted';
  member_name: string;
  created_at: string;
  approved_at?: string;
  disbursed_at?: string;
  
  // Détails du prêt
  loan_details: {
    duration_months: number;
    interest_rate: number;
    monthly_payment: number;
    total_amount: number; // avec intérêts
    purpose: string;
    
    // Progression
    payments_made: number;
    remaining_balance: number;
    next_payment_date?: string;
    last_payment_date?: string;
  };
  
  // Historique des paiements
  payments: Array<{
    date: string;
    amount: number;
    type: 'monthly' | 'extra' | 'late';
    status: 'completed' | 'pending' | 'failed';
  }>;
}

const LoanDashboard: React.FC = () => {
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);

  // Données de test pour démonstration
  useEffect(() => {
    // Simuler le chargement des prêts
    setTimeout(() => {
      setLoans([
        {
          id: 'LOAN-2025-001',
          amount: 5000,
          status: 'approved',
          member_name: 'Marie Dubois',
          created_at: '2025-07-10T10:00:00Z',
          approved_at: '2025-07-15T14:30:00Z',
          loan_details: {
            duration_months: 24,
            interest_rate: 3.5,
            monthly_payment: 218.42,
            total_amount: 5242.08,
            purpose: 'Équipement serre',
            payments_made: 0,
            remaining_balance: 5000,
            next_payment_date: '2025-08-17'
          },
          payments: []
        },
        {
          id: 'LOAN-2024-015',
          amount: 3000,
          status: 'active',
          member_name: 'Jean Tremblay',
          created_at: '2024-12-01T09:00:00Z',
          approved_at: '2024-12-05T11:00:00Z',
          disbursed_at: '2024-12-10T15:00:00Z',
          loan_details: {
            duration_months: 18,
            interest_rate: 2.8,
            monthly_payment: 175.33,
            total_amount: 3155.94,
            purpose: 'Tracteur occasion',
            payments_made: 7,
            remaining_balance: 1827.69,
            next_payment_date: '2025-07-20',
            last_payment_date: '2025-06-20'
          },
          payments: [
            { date: '2025-06-20', amount: 175.33, type: 'monthly', status: 'completed' },
            { date: '2025-05-20', amount: 175.33, type: 'monthly', status: 'completed' },
            { date: '2025-04-20', amount: 175.33, type: 'monthly', status: 'completed' },
            // ... autres paiements
          ]
        },
        {
          id: 'LOAN-2023-045',
          amount: 2500,
          status: 'completed',
          member_name: 'Sophie Lavoie',
          created_at: '2023-06-15T08:00:00Z',
          approved_at: '2023-06-18T10:00:00Z',
          disbursed_at: '2023-06-20T14:00:00Z',
          loan_details: {
            duration_months: 12,
            interest_rate: 2.5,
            monthly_payment: 213.89,
            total_amount: 2566.68,
            purpose: 'Semences bio',
            payments_made: 12,
            remaining_balance: 0
          },
          payments: []
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Fonction pour obtenir la couleur et l'icône du statut
  const getStatusInfo = (status: LoanData['status']) => {
    switch (status) {
      case 'requested':
        return { color: 'default', label: 'Demandé', icon: '📝' };
      case 'under_review':
        return { color: 'warning', label: 'En révision', icon: '👀' };
      case 'approved':
        return { color: 'success', label: 'Approuvé', icon: '✅' };
      case 'disbursed':
        return { color: 'primary', label: 'Versé', icon: '💸' };
      case 'active':
        return { color: 'primary', label: 'Actif', icon: '🔄' };
      case 'completed':
        return { color: 'success', label: 'Complété', icon: '🎉' };
      case 'rejected':
        return { color: 'danger', label: 'Refusé', icon: '❌' };
      case 'defaulted':
        return { color: 'danger', label: 'En défaut', icon: '⚠️' };
      default:
        return { color: 'default', label: 'Inconnu', icon: '❓' };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-CA');
  };

  // Calculer le pourcentage de remboursement
  const getRepaymentProgress = (loan: LoanData) => {
    const totalPayments = loan.loan_details.duration_months;
    const paidPayments = loan.loan_details.payments_made;
    return (paidPayments / totalPayments) * 100;
  };

  if (loading) {
    return (
      <div className="w-full p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mes Prêts</h1>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Prêts</h1>
          <p className="text-gray-600 mt-1">Suivi et gestion de vos prêts agricoles</p>
        </div>
        <Button
          color="primary"
          startContent={<FaPlus />}
          href="/dashboard/transactions/loans/new"
        >
          Nouvelle Demande
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏦</span>
            <div>
              <p className="text-sm text-blue-600">Prêts Actifs</p>
              <p className="text-xl font-bold text-blue-900">
                {loans.filter(l => l.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-sm text-green-600">Total Emprunté</p>
              <p className="text-xl font-bold text-green-900">
                {formatCurrency(loans.reduce((sum, l) => sum + l.amount, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-sm text-orange-600">Solde Restant</p>
              <p className="text-xl font-bold text-orange-900">
                {formatCurrency(
                  loans
                    .filter(l => l.status === 'active')
                    .reduce((sum, l) => sum + l.loan_details.remaining_balance, 0)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-sm text-purple-600">Prêts Complétés</p>
              <p className="text-xl font-bold text-purple-900">
                {loans.filter(l => l.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des prêts */}
      <div className="space-y-4">
        {loans.map((loan) => {
          const statusInfo = getStatusInfo(loan.status);
          const progress = getRepaymentProgress(loan);
          
          return (
            <div key={loan.id} className="bg-white border border-gray-200 rounded-xl p-6">
              {/* En-tête du prêt */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <span className="text-2xl">🏦</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Prêt #{loan.id}
                    </h3>
                    <p className="text-sm text-gray-600">{loan.loan_details.purpose}</p>
                    <p className="text-xs text-gray-500">
                      Créé le {formatDate(loan.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-3 md:mt-0">
                  <Chip
                    color={statusInfo.color as any}
                    variant="flat"
                    startContent={<span>{statusInfo.icon}</span>}
                  >
                    {statusInfo.label}
                  </Chip>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(loan.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {loan.loan_details.interest_rate}% sur {loan.loan_details.duration_months} mois
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenu selon le statut */}
              {loan.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-green-800 mb-1">
                        🎉 Prêt Approuvé - Prêt à retirer !
                      </h4>
                      <p className="text-sm text-green-600">
                        Votre demande de prêt a été approuvée. Vous pouvez maintenant retirer les fonds.
                      </p>
                    </div>
                    <Button 
                      color="success" 
                      size="sm"
                      startContent={<FaDownload />}
                      href={`/dashboard/transactions/withdrawals/new?loan_id=${loan.id}`}
                    >
                      Retirer les Fonds
                    </Button>
                  </div>
                </div>
              )}

              {loan.status === 'active' && (
                <div className="space-y-4">
                  {/* Progression du remboursement */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progression du remboursement
                      </span>
                      <span className="text-sm text-gray-500">
                        {loan.loan_details.payments_made}/{loan.loan_details.duration_months} paiements
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      color="success"
                      className="mb-2"
                    />
                    <p className="text-xs text-gray-500">
                      {progress.toFixed(1)}% complété
                    </p>
                  </div>

                  {/* Détails des paiements */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Paiement Mensuel</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(loan.loan_details.monthly_payment)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Solde Restant</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(loan.loan_details.remaining_balance)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Prochain Paiement</p>
                      <p className="text-lg font-bold text-gray-900">
                        {loan.loan_details.next_payment_date ? 
                          formatDate(loan.loan_details.next_payment_date) : 
                          'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="ghost"
                      startContent={<FaCreditCard />}
                      href={`/dashboard/transactions/payments/new?loan_id=${loan.id}`}
                    >
                      Faire un Paiement
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      startContent={<FaCalendarAlt />}
                      href={`/dashboard/loans/${loan.id}/schedule`}
                    >
                      Voir l'Échéancier
                    </Button>
                  </div>
                </div>
              )}

              {loan.status === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-center">
                    <span className="text-3xl mb-2 block">🎉</span>
                    <h4 className="font-medium text-green-800 mb-1">
                      Prêt Remboursé Intégralement !
                    </h4>
                    <p className="text-sm text-green-600">
                      Félicitations ! Ce prêt a été remboursé en totalité.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions communes */}
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="ghost"
                  startContent={<FaEye />}
                  href={`/dashboard/loans/${loan.id}`}
                >
                  Voir Détails
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  startContent={<FaDownload />}
                  onClick={() => console.log('Télécharger contrat:', loan.id)}
                >
                  Contrat PDF
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* État vide */}
      {loans.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🏦</span>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Aucun prêt en cours
          </h3>
          <p className="text-gray-600 mb-6">
            Vous n'avez aucun prêt actuel. Soumettez une demande pour commencer.
          </p>
          <Button
            color="primary"
            startContent={<FaPlus />}
            href="/dashboard/transactions/loans/new"
          >
            Demander un Prêt
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoanDashboard;