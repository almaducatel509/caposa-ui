// app/components/account/modals/AccountHistoryModal.tsx
'use client';
import React, { useState, useEffect } from "react";
import { 
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, 
  Button, Chip, Spinner, Table, TableHeader, TableColumn, 
  TableBody, TableRow, TableCell, Input, Select, SelectItem
} from "@nextui-org/react";
import type { AccountData, TransactionData } from "../validationsaccount";
import { getTransactionSummary } from "../validationsaccount";

interface AccountHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountData | null;
}

export default function AccountHistoryModal({ 
  isOpen, 
  onClose, 
  account 
}: AccountHistoryModalProps) {
  
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Charger les transactions quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && account) {
      loadTransactions();
    }
  }, [isOpen, account]);

  const loadTransactions = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      // Si les transactions sont déjà dans l'objet account
      if (account.transactions) {
        setTransactions(account.transactions);
      } else {
        // Sinon, faire un appel API (à implémenter)
        // const data = await fetchAccountTransactions(account.id);
        // setTransactions(data);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Erreur chargement transactions:", error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) return null;

  // Filtrer les transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === "all" || t.transaction_type === filterType;
    const matchesSearch = searchTerm === "" || 
      t.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Obtenir le résumé
  const summary = getTransactionSummary(account);

  // Fonction pour obtenir la couleur du type de transaction
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'success';
      case 'withdrawal': return 'danger';
      case 'transfer': return 'primary';
      case 'fee': return 'warning';
      case 'interest': return 'secondary';
      default: return 'default';
    }
  };

  // Fonction pour obtenir l'icône du type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '💸';
      case 'transfer': return '🔄';
      case 'fee': return '📋';
      case 'interest': return '📈';
      default: return '📊';
    }
  };

  // Fonction pour formater le type
  const formatTransactionType = (type: string) => {
    const types: Record<string, string> = {
      deposit: 'Dépôt',
      withdrawal: 'Retrait',
      transfer: 'Transfert',
      fee: 'Frais',
      interest: 'Intérêt',
    };
    return types[type] || type;
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">Historique des transactions</h2>
              <p className="text-sm text-gray-600 font-normal">
                Compte: {account.noCompte} • {account.member_details?.full_name}
              </p>
            </ModalHeader>
            
            <ModalBody>
              {/* Résumé des transactions */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-gray-600 mb-1">Total Dépôts</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${summary.deposits.toLocaleString('fr-CA')}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="text-sm text-gray-600 mb-1">Total Retraits</div>
                  <div className="text-2xl font-bold text-red-600">
                    ${summary.withdrawals.toLocaleString('fr-CA')}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Flux Net</div>
                  <div className={`text-2xl font-bold ${summary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${summary.netFlow.toLocaleString('fr-CA')}
                  </div>
                </div>
              </div>

              {/* Filtres */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  placeholder="Rechercher par référence ou description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  startContent={<span>🔍</span>}
                  isClearable
                  onClear={() => setSearchTerm("")}
                />
                <Select
                  label="Filtrer par type"
                  selectedKeys={[filterType]}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <SelectItem key="all" value="all">Tous les types</SelectItem>
                  <SelectItem key="deposit" value="deposit">Dépôts</SelectItem>
                  <SelectItem key="withdrawal" value="withdrawal">Retraits</SelectItem>
                  <SelectItem key="transfer" value="transfer">Transferts</SelectItem>
                  <SelectItem key="fee" value="fee">Frais</SelectItem>
                  <SelectItem key="interest" value="interest">Intérêts</SelectItem>
                </Select>
              </div>

              {/* Table des transactions */}
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Spinner size="lg" />
                  <span className="ml-3">Chargement de l'historique...</span>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">📭</div>
                  <p>Aucune transaction trouvée</p>
                </div>
              ) : (
                <Table aria-label="Historique des transactions">
                  <TableHeader>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>MONTANT</TableColumn>
                    <TableColumn>SOLDE APRÈS</TableColumn>
                    <TableColumn>RÉFÉRENCE</TableColumn>
                    <TableColumn>DESCRIPTION</TableColumn>
                    <TableColumn>STATUT</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(transaction.date).toLocaleDateString('fr-CA')}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(transaction.date).toLocaleTimeString('fr-CA')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={getTransactionColor(transaction.transaction_type)}
                            variant="flat"
                            size="sm"
                            startContent={<span>{getTransactionIcon(transaction.transaction_type)}</span>}
                          >
                            {formatTransactionType(transaction.transaction_type)}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            transaction.transaction_type === 'deposit' || transaction.transaction_type === 'interest'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'interest'
                              ? '+'
                              : '-'}
                            ${transaction.amount.toLocaleString('fr-CA')}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${transaction.balance_after.toLocaleString('fr-CA')}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            {transaction.reference_number || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {transaction.description || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={transaction.status === 'completed' ? 'success' : 'warning'}
                            variant="dot"
                            size="sm"
                          >
                            {transaction.status}
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Nombre de transactions affichées */}
              <div className="text-sm text-gray-500 mt-4 text-center">
                Affichage de {filteredTransactions.length} transaction(s) sur {transactions.length} au total
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                Fermer
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}