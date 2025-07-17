"use client";

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Avatar,
  Divider,
  Tab,
  Tabs,
  Card,
  CardBody
} from "@nextui-org/react";
import { FaMoneyBillWave, FaHistory, FaFileInvoiceDollar, FaUserClock } from "react-icons/fa";
import { BsArrowUpCircle, BsArrowDownCircle } from "react-icons/bs";

// Types
interface Transaction {
  id: string;
  type: 'payment' | 'bonus' | 'deduction' | 'reimbursement';
  amount: number;
  currency: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  createdBy: string;
}

interface ActivityLog {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  date: string;
  modifiedBy: string;
}

interface EmployeeTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    photo_profil: string | null;
    payment_ref: string;
  };
}

// Données mockées
const generateMockTransactions = (employeeId: string): Transaction[] => [
  {
    id: '1',
    type: 'payment',
    amount: 2500.00,
    currency: 'USD',
    description: 'Salaire mensuel - Janvier 2025',
    date: '2025-01-15T14:30:00',
    status: 'completed',
    createdBy: 'Système RH'
  },
  {
    id: '2',
    type: 'bonus',
    amount: 500.00,
    currency: 'USD',
    description: 'Prime de performance Q4 2024',
    date: '2025-01-10T10:00:00',
    status: 'completed',
    createdBy: 'Marie Martin (Manager)'
  },
  {
    id: '3',
    type: 'reimbursement',
    amount: 150.00,
    currency: 'USD',
    description: 'Remboursement frais de transport',
    date: '2025-01-08T16:45:00',
    status: 'completed',
    createdBy: 'Comptabilité'
  },
  {
    id: '4',
    type: 'deduction',
    amount: -50.00,
    currency: 'USD',
    description: 'Cotisation assurance santé',
    date: '2025-01-05T09:00:00',
    status: 'completed',
    createdBy: 'Système RH'
  },
  {
    id: '5',
    type: 'payment',
    amount: 2500.00,
    currency: 'USD',
    description: 'Salaire mensuel - Décembre 2024',
    date: '2024-12-15T14:30:00',
    status: 'completed',
    createdBy: 'Système RH'
  }
];

const generateMockActivityLogs = (employeeId: string): ActivityLog[] => [
  {
    id: '1',
    action: 'update',
    field: 'phone_number',
    oldValue: '+1234567890',
    newValue: '+0987654321',
    date: '2025-01-12T11:20:00',
    modifiedBy: 'Jean Dupont (Admin)'
  },
  {
    id: '2',
    action: 'update',
    field: 'address',
    oldValue: '123 Rue Principale',
    newValue: '456 Avenue Centrale',
    date: '2025-01-10T15:30:00',
    modifiedBy: 'Marie Martin (RH)'
  },
  {
    id: '3',
    action: 'update',
    field: 'posts',
    oldValue: 'Developer',
    newValue: 'Senior Developer',
    date: '2025-01-05T09:15:00',
    modifiedBy: 'Pierre Durand (Manager)'
  },
  {
    id: '4',
    action: 'create',
    date: '2024-06-15T10:00:00',
    modifiedBy: 'Admin Système'
  }
];

const EmployeeTransactionModal: React.FC<EmployeeTransactionModalProps> = ({
  isOpen,
  onClose,
  employee
}) => {
  const [selectedTab, setSelectedTab] = useState("transactions");
  
  // Données mockées
  const transactions = generateMockTransactions(employee.id);
  const activityLogs = generateMockActivityLogs(employee.id);
  
  // Calcul du total
  const totalAmount = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Helpers
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <FaMoneyBillWave className="text-green-600" />;
      case 'bonus':
        return <BsArrowUpCircle className="text-blue-600" />;
      case 'deduction':
        return <BsArrowDownCircle className="text-red-600" />;
      case 'reimbursement':
        return <FaFileInvoiceDollar className="text-purple-600" />;
      default:
        return <FaMoneyBillWave />;
    }
  };
  
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'payment': return 'success';
      case 'bonus': return 'primary';
      case 'deduction': return 'danger';
      case 'reimbursement': return 'secondary';
      default: return 'default';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3 bg-gradient-to-r from-[#34963d] to-[#1e7367] text-white p-6">
          <Avatar
            src={employee.photo_profil || undefined}
            name={`${employee.first_name} ${employee.last_name}`}
            size="lg"
            className="border-2 border-white"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold">
              {employee.first_name} {employee.last_name}
            </h3>
            <p className="text-sm opacity-90">
              Référence: {employee.payment_ref}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Solde total</p>
            <p className="text-2xl font-bold">
              {formatCurrency(totalAmount, 'USD')}
            </p>
          </div>
        </ModalHeader>
        
        <ModalBody className="p-0">
          <Tabs 
            selectedKey={selectedTab} 
            onSelectionChange={(key) => setSelectedTab(key as string)}
            classNames={{
              tabList: "w-full",
              tab: "h-12",
              panel: "p-4"
            }}
          >
            <Tab
              key="transactions"
              title={
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave />
                  <span>Transactions</span>
                  <Chip size="sm" variant="flat">{transactions.length}</Chip>
                </div>
              }
            >
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <Card key={transaction.id} className="border-1 hover:shadow-md transition-shadow">
                    <CardBody className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-sm">
                                {transaction.description}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                Par {transaction.createdBy} • {formatDate(transaction.date)}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <p className={`font-bold text-lg ${
                                transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount, transaction.currency)}
                              </p>
                              <Chip 
                                size="sm" 
                                color={getTransactionColor(transaction.type)}
                                variant="flat"
                                className="mt-1"
                              >
                                {transaction.type}
                              </Chip>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </Tab>
            
            <Tab
              key="activity"
              title={
                <div className="flex items-center gap-2">
                  <FaHistory />
                  <span>Historique</span>
                  <Chip size="sm" variant="flat">{activityLogs.length}</Chip>
                </div>
              }
            >
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <Card key={log.id} className="border-1">
                    <CardBody className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FaUserClock className="text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              {log.action === 'create' ? (
                                <h4 className="font-semibold text-sm">
                                  Création du profil employé
                                </h4>
                              ) : (
                                <>
                                  <h4 className="font-semibold text-sm">
                                    Modification du champ "{log.field}"
                                  </h4>
                                  {log.oldValue && log.newValue && (
                                    <div className="mt-2 text-xs">
                                      <span className="text-red-600 line-through">{log.oldValue}</span>
                                      <span className="mx-2">→</span>
                                      <span className="text-green-600 font-medium">{log.newValue}</span>
                                    </div>
                                  )}
                                </>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Par {log.modifiedBy} • {formatDate(log.date)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </Tab>
          </Tabs>
          
          {/* Résumé des statistiques */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600">Total des paiements</p>
                <p className="font-bold text-green-600">
                  {formatCurrency(
                    transactions.filter(t => t.type === 'payment' && t.status === 'completed')
                      .reduce((sum, t) => sum + t.amount, 0),
                    'USD'
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Bonus reçus</p>
                <p className="font-bold text-blue-600">
                  {formatCurrency(
                    transactions.filter(t => t.type === 'bonus')
                      .reduce((sum, t) => sum + t.amount, 0),
                    'USD'
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Déductions</p>
                <p className="font-bold text-red-600">
                  {formatCurrency(
                    Math.abs(transactions.filter(t => t.type === 'deduction')
                      .reduce((sum, t) => sum + t.amount, 0)),
                    'USD'
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Remboursements</p>
                <p className="font-bold text-purple-600">
                  {formatCurrency(
                    transactions.filter(t => t.type === 'reimbursement')
                      .reduce((sum, t) => sum + t.amount, 0),
                    'USD'
                  )}
                </p>
              </div>
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter className="bg-gray-50 border-t">
          <Button 
            variant="light" 
            onPress={onClose}
            className="text-[#2c2e2f]"
          >
            Fermer
          </Button>
          <Button 
            className="bg-[#34963d] text-white hover:bg-[#1e7367] transition-colors"
            startContent={<FaFileInvoiceDollar />}
          >
            Exporter en PDF
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EmployeeTransactionModal;