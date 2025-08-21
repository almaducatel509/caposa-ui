'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Divider,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Switch,
  Autocomplete,
  AutocompleteItem
} from "@nextui-org/react";
import { FaArrowLeft, FaExchangeAlt, FaUserCheck, FaExclamationTriangle, FaCheckCircle, FaCalculator, FaClock } from "react-icons/fa";

// Types pour le formulaire de virement
interface TransferFormData {
  // Comptes
  sourceAccountNumber: string;
  destinationAccountNumber?: string; // Pour transferts internes
  
  // Montant et base
  amount: string;
  transferType: string;
  description: string;
  
  // Destinataire externe (Interac/Fournisseur)
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  
  // Fournisseur agricole
  supplierName?: string;
  supplierAccountNumber?: string;
  invoiceReference?: string;
  
  // Paiement de prêt
  loanAccountNumber?: string;
  paymentType?: 'regular' | 'extra' | 'full';
  
  // Planification
  executeImmediately: boolean;
  scheduledDate?: string;
  
  // Sécurité
  securityQuestion?: string;
  pin: string;
}

interface AccountInfo {
  accountNumber: string;
  accountName: string;
  availableBalance: number;
  accountType: string;
  dailyTransferLimit: number;
}

interface LoanInfo {
  loanNumber: string;
  loanPurpose: string;
  monthlyPayment: number;
  remainingBalance: number;
  nextPaymentDate: string;
}

const TransferForm: React.FC = () => {
  const [formData, setFormData] = useState<TransferFormData>({
    sourceAccountNumber: '',
    amount: '',
    transferType: '',
    description: '',
    executeImmediately: true,
    pin: ''
  });

  const [sourceAccount, setSourceAccount] = useState<AccountInfo | null>(null);
  const [destinationAccount, setDestinationAccount] = useState<AccountInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Comptes disponibles du membre
  const memberAccounts: AccountInfo[] = [
    {
      accountNumber: "12345-001",
      accountName: "Compte Épargne Principal",
      availableBalance: 15420.50,
      accountType: "Épargne",
      dailyTransferLimit: 5000
    },
    {
      accountNumber: "12345-002", 
      accountName: "Compte Chèques Exploitation",
      availableBalance: 8750.25,
      accountType: "Chèques",
      dailyTransferLimit: 10000
    },
    {
      accountNumber: "12345-003",
      accountName: "Fonds Saisonnier",
      availableBalance: 25000.00,
      accountType: "Terme",
      dailyTransferLimit: 15000
    }
  ];

  // Prêts actifs du membre
  const activeLoans: LoanInfo[] = [
    {
      loanNumber: "LOAN-2024-015",
      loanPurpose: "Tracteur occasion",
      monthlyPayment: 175.33,
      remainingBalance: 1827.69,
      nextPaymentDate: "2025-07-20"
    },
    {
      loanNumber: "LOAN-2025-001", 
      loanPurpose: "Équipement serre",
      monthlyPayment: 218.42,
      remainingBalance: 5000.00,
      nextPaymentDate: "2025-08-17"
    }
  ];

  // Types de virements simplifiés
  const transferTypes = [
    { key: 'internal', label: '🔄 Transfert entre mes comptes' },
    { key: 'supplier', label: '💸 Paiement fournisseur agricole' },
    { key: 'interac', label: '🏦 Virement Interac (email/téléphone)' },
    { key: 'loan_payment', label: '⚡ Paiement de prêt' }
  ];

  // Fournisseurs agricoles fréquents (simulation)
  const commonSuppliers = [
    { key: 'semences_abc', label: 'Semences ABC Inc.' },
    { key: 'equipement_rural', label: 'Équipement Rural Ltée' },
    { key: 'coop_agricole', label: 'Coopérative Agricole du Québec' },
    { key: 'fourrage_plus', label: 'Fourrage Plus' },
    { key: 'machinerie_jean', label: 'Machinerie Jean & Fils' }
  ];

  // Gestion des changements
  const handleInputChange = (field: keyof TransferFormData, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset des champs conditionnels quand le type change
      if (field === 'transferType') {
        return {
          ...newData,
          destinationAccountNumber: '',
          recipientName: '',
          recipientEmail: '',
          recipientPhone: '',
          supplierName: '',
          supplierAccountNumber: '',
          invoiceReference: '',
          loanAccountNumber: '',
          paymentType: 'regular'
        };
      }
      
      return newData;
    });
    
    // Reset du compte destination si le type change
    if (field === 'transferType') {
      setDestinationAccount(null);
    }
  };

  // Sélection compte source
  const handleSourceAccountChange = (accountNumber: string) => {
    const account = memberAccounts.find(acc => acc.accountNumber === accountNumber);
    setSourceAccount(account || null);
    setFormData(prev => ({ ...prev, sourceAccountNumber: accountNumber }));
  };

  // Sélection compte destination (transferts internes)
  const handleDestinationAccountChange = (accountNumber: string) => {
    const account = memberAccounts.find(acc => acc.accountNumber === accountNumber);
    setDestinationAccount(account || null);
    setFormData(prev => ({ ...prev, destinationAccountNumber: accountNumber }));
  };

  // Validation du montant
  const validateAmount = (amount: number) => {
    const errors: string[] = [];
    
    if (!sourceAccount) {
      errors.push("Veuillez sélectionner un compte source");
      setValidationErrors(errors);
      return false;
    }

    if (amount <= 0) {
      errors.push("Le montant doit être supérieur à 0$");
    }

    if (amount > sourceAccount.availableBalance) {
      errors.push(`Fonds insuffisants (disponible: ${formatCurrency(sourceAccount.availableBalance)})`);
    }

    if (amount > sourceAccount.dailyTransferLimit) {
      errors.push(`Limite quotidienne dépassée (max: ${formatCurrency(sourceAccount.dailyTransferLimit)})`);
    }

    // Validations spécifiques par type
    if (formData.transferType === 'interac' && amount > 3000) {
      errors.push("Limite Interac: 3,000$ par transaction");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Calcul des frais de virement
  const calculateFees = (): number => {
    const amount = parseFloat(formData.amount || '0');
    let fees = 0;

    switch (formData.transferType) {
      case 'internal':
        fees = 0; // Transferts internes gratuits
        break;
      case 'supplier':
        fees = 5.00; // Frais virements fournisseurs
        break;
      case 'interac':
        fees = 1.50; // Frais Interac standard
        break;
      case 'loan_payment':
        fees = 0; // Paiements de prêts gratuits
        break;
      default:
        fees = 0;
    }

    return fees;
  };

  // Estimation du délai de traitement
  const getProcessingTime = (): string => {
    if (!formData.executeImmediately) {
      return `Exécuté le ${formData.scheduledDate}`;
    }

    switch (formData.transferType) {
      case 'internal':
        return 'Immédiat';
      case 'supplier':
        return '1-2 jours ouvrables';
      case 'interac':
        return '30 minutes (si accepté)';
      case 'loan_payment':
        return 'Immédiat';
      default:
        return 'Variable';
    }
  };

  // Validation complète du formulaire
  const validateForm = (): boolean => {
    if (!formData.amount || !formData.transferType || !formData.pin || !sourceAccount) {
      return false;
    }

    const amount = parseFloat(formData.amount || '0');
    if (amount <= 0 || amount > sourceAccount.availableBalance) {
      return false;
    }

    // Validations spécifiques par type
    switch (formData.transferType) {
      case 'internal':
        return !!(formData.destinationAccountNumber && 
                 formData.sourceAccountNumber !== formData.destinationAccountNumber);
      case 'supplier':
        return !!formData.supplierName;
      case 'interac':
        return !!(formData.recipientName && 
                 (formData.recipientEmail || formData.recipientPhone));
      case 'loan_payment':
        return !!formData.loanAccountNumber;
      default:
        return false;
    }
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    // Validation finale avec messages d'erreur
    const amount = parseFloat(formData.amount || '0');
    const errors: string[] = [];

    if (!validateAmount(amount)) return;

    // Validations spécifiques par type
    switch (formData.transferType) {
      case 'internal':
        if (!formData.destinationAccountNumber) {
          errors.push("Veuillez sélectionner un compte de destination");
        }
        if (formData.sourceAccountNumber === formData.destinationAccountNumber) {
          errors.push("Les comptes source et destination doivent être différents");
        }
        break;
      case 'supplier':
        if (!formData.supplierName) {
          errors.push("Veuillez spécifier le nom du fournisseur");
        }
        break;
      case 'interac':
        if (!formData.recipientName) {
          errors.push("Veuillez spécifier le nom du destinataire");
        }
        if (!formData.recipientEmail && !formData.recipientPhone) {
          errors.push("Email OU téléphone requis pour Interac");
        }
        break;
      case 'loan_payment':
        if (!formData.loanAccountNumber) {
          errors.push("Veuillez sélectionner un prêt");
        }
        break;
    }

    if (!formData.pin) {
      errors.push("Code PIN requis pour autoriser le virement");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setShowConfirmation(true);
  };

  // Confirmation finale
  const confirmTransfer = async () => {
    setIsSubmitting(true);
    setShowConfirmation(false);

    try {
      // Simulation de traitement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('🔄 Virement traité:', {
        ...formData,
        sourceAccount,
        destinationAccount,
        fees: calculateFees(),
        processingTime: getProcessingTime(),
        timestamp: new Date().toISOString()
      });
      
      onOpen(); // Ouvrir modal de succès
    } catch (error) {
      console.error('❌ Erreur virement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">🔄</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nouveau Virement</h1>
              <p className="text-gray-600">Transferts et paiements automatisés</p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="space-y-6">
          {/* Sélection du compte source */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🏦</span>
              <h2 className="text-xl font-semibold">Compte source</h2>
            </div>
            
            <Select
              label="Débiter de ce compte"
              placeholder="Choisir le compte à débiter"
              selectedKeys={formData.sourceAccountNumber ? [formData.sourceAccountNumber] : []}
              onChange={(e) => handleSourceAccountChange(e.target.value)}
              isRequired
            >
              {memberAccounts.map((account) => (
                <SelectItem 
                  key={account.accountNumber} 
                  value={account.accountNumber}
                  description={`${formatCurrency(account.availableBalance)} disponible | Limite: ${formatCurrency(account.dailyTransferLimit)}`}
                >
                  {account.accountName} ({account.accountNumber})
                </SelectItem>
              ))}
            </Select>

            {/* Infos du compte source */}
            {sourceAccount && (
              <Card className="bg-blue-50 border-blue-200">
                <CardBody className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Solde disponible</p>
                      <p className="font-bold text-blue-600">
                        {formatCurrency(sourceAccount.availableBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Type de compte</p>
                      <p className="font-medium">{sourceAccount.accountType}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Limite de virement</p>
                      <p className="font-medium text-orange-600">
                        {formatCurrency(sourceAccount.dailyTransferLimit)}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Type de virement */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚡</span>
              <h2 className="text-xl font-semibold">Type de virement</h2>
            </div>
            
            <Select
              label="Que voulez-vous faire ?"
              placeholder="Choisir le type de virement"
              selectedKeys={formData.transferType ? [formData.transferType] : []}
              onChange={(e) => handleInputChange('transferType', e.target.value)}
              isRequired
            >
              {transferTypes.map((type) => (
                <SelectItem key={type.key} value={type.key}>
                  {type.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Montant */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">💰</span>
              <h2 className="text-xl font-semibold">Montant</h2>
            </div>
            
            <Input
              label="Montant à virer"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              startContent={<span className="text-gray-500">$</span>}
              isRequired
              color={validationErrors.length > 0 ? "danger" : "default"}
            />
          </div>

          {/* Champs conditionnels selon le type */}
          {formData.transferType === 'internal' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🎯</span>
                <h2 className="text-xl font-semibold">Destination</h2>
              </div>
              
              <Select
                label="Vers ce compte"
                placeholder="Choisir le compte de destination"
                selectedKeys={formData.destinationAccountNumber ? [formData.destinationAccountNumber] : []}
                onChange={(e) => handleDestinationAccountChange(e.target.value)}
                isRequired
              >
                {memberAccounts
                  .filter(acc => acc.accountNumber !== formData.sourceAccountNumber)
                  .map((account) => (
                    <SelectItem 
                      key={account.accountNumber} 
                      value={account.accountNumber}
                      description={`${formatCurrency(account.availableBalance)} | ${account.accountType}`}
                    >
                      {account.accountName} ({account.accountNumber})
                    </SelectItem>
                  ))
                }
              </Select>
            </div>
          )}

          {formData.transferType === 'supplier' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🚜</span>
                <h2 className="text-xl font-semibold">Fournisseur agricole</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Autocomplete
                  label="Nom du fournisseur"
                  placeholder="Choisir ou taper le nom"
                  inputValue={formData.supplierName || ''}
                  onInputChange={(value) => handleInputChange('supplierName', value)}
                  isRequired
                >
                  {commonSuppliers.map((supplier) => (
                    <AutocompleteItem key={supplier.key} value={supplier.key}>
                      {supplier.label}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>
                
                <Input
                  label="Numéro de facture (optionnel)"
                  placeholder="INV-2025-001"
                  value={formData.invoiceReference || ''}
                  onChange={(e) => handleInputChange('invoiceReference', e.target.value)}
                />
              </div>
            </div>
          )}

          {formData.transferType === 'interac' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📧</span>
                <h2 className="text-xl font-semibold">Destinataire Interac</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nom complet du destinataire"
                  placeholder="Jean Tremblay"
                  value={formData.recipientName || ''}
                  onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  isRequired
                />
                
                <Input
                  label="Email du destinataire"
                  type="email"
                  placeholder="jean@exemple.com"
                  value={formData.recipientEmail || ''}
                  onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                  description="Email OU téléphone requis"
                />
                
                <Input
                  label="Téléphone du destinataire"
                  placeholder="(514) 123-4567"
                  value={formData.recipientPhone || ''}
                  onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                  description="Email OU téléphone requis"
                />
                
                <Input
                  label="Question de sécurité (optionnel)"
                  placeholder="Nom de votre ville natale ?"
                  value={formData.securityQuestion || ''}
                  onChange={(e) => handleInputChange('securityQuestion', e.target.value)}
                />
              </div>
            </div>
          )}

          {formData.transferType === 'loan_payment' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🏦</span>
                <h2 className="text-xl font-semibold">Paiement de prêt</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Prêt à payer"
                  placeholder="Choisir le prêt"
                  selectedKeys={formData.loanAccountNumber ? [formData.loanAccountNumber] : []}
                  onChange={(e) => handleInputChange('loanAccountNumber', e.target.value)}
                  isRequired
                >
                  {activeLoans.map((loan) => (
                    <SelectItem 
                      key={loan.loanNumber} 
                      value={loan.loanNumber}
                      description={`Solde: ${formatCurrency(loan.remainingBalance)} | Paiement: ${formatCurrency(loan.monthlyPayment)}`}
                    >
                      {loan.loanPurpose} ({loan.loanNumber})
                    </SelectItem>
                  ))}
                </Select>
                
                <Select
                  label="Type de paiement"
                  placeholder="Paiement régulier"
                  selectedKeys={formData.paymentType ? [formData.paymentType] : ['regular']}
                  onChange={(e) => handleInputChange('paymentType', e.target.value)}
                >
                  <SelectItem key="regular" value="regular">
                    Paiement régulier
                  </SelectItem>
                  <SelectItem key="extra" value="extra">
                    Paiement supplémentaire
                  </SelectItem>
                  <SelectItem key="full" value="full">
                    Remboursement complet
                  </SelectItem>
                </Select>
              </div>

              {/* Suggestion automatique du montant selon le prêt */}
              {formData.loanAccountNumber && (
                <Card className="bg-green-50 border-green-200">
                  <CardBody className="p-3">
                    {(() => {
                      const selectedLoan = activeLoans.find(l => l.loanNumber === formData.loanAccountNumber);
                      if (!selectedLoan) return null;
                      
                      return (
                        <div className="text-sm space-y-2">
                          <p className="font-medium text-green-800">
                            💡 Suggestions de montant :
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <Button 
                              size="sm" 
                              variant="bordered" 
                              color="success"
                              onClick={() => handleInputChange('amount', selectedLoan.monthlyPayment.toString())}
                            >
                              Paiement mensuel: {formatCurrency(selectedLoan.monthlyPayment)}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="bordered" 
                              color="warning"
                              onClick={() => handleInputChange('amount', selectedLoan.remainingBalance.toString())}
                            >
                              Solde complet: {formatCurrency(selectedLoan.remainingBalance)}
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </CardBody>
                </Card>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-4">
            <Textarea
              label="Description (optionnel)"
              placeholder="Ex: Paiement semences printemps 2025, transfert pour équipement..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              minRows={2}
            />
          </div>

          {/* Planification */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⏰</span>
              <h2 className="text-xl font-semibold">Planification</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <Switch
                isSelected={formData.executeImmediately}
                onValueChange={(checked) => handleInputChange('executeImmediately', checked)}
              >
                Exécuter immédiatement
              </Switch>
            </div>

            {!formData.executeImmediately && (
              <Input
                label="Date d'exécution"
                type="date"
                value={formData.scheduledDate || ''}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                description="Le virement sera exécuté à cette date"
              />
            )}
          </div>

          {/* Erreurs de validation */}
          {validationErrors.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardBody className="p-4">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">Erreurs de validation</h4>
                    <ul className="space-y-1 text-red-700">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Résumé de la transaction */}
          {formData.amount && formData.transferType && sourceAccount && validationErrors.length === 0 && (
            <Card className="bg-purple-50 border-purple-200">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaCalculator className="text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Résumé du virement</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Montant:</span>
                      <span className="font-bold text-purple-600">
                        {formatCurrency(parseFloat(formData.amount))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frais:</span>
                      <span className="font-medium">
                        {formatCurrency(calculateFees())}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total débité:</span>
                      <span className="text-red-600">
                        {formatCurrency(parseFloat(formData.amount) + calculateFees())}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Délai de traitement:</span>
                      <span className="font-medium text-blue-600">
                        {getProcessingTime()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">
                        {transferTypes.find(t => t.key === formData.transferType)?.label.replace(/^.{2}\s/, '')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Sécurité */}
          {validationErrors.length === 0 && formData.amount && sourceAccount && formData.transferType && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔐</span>
                <h2 className="text-xl font-semibold">Autorisation</h2>
              </div>
              
              <Input
                label="Code PIN"
                type="password"
                placeholder="••••"
                value={formData.pin}
                onChange={(e) => handleInputChange('pin', e.target.value)}
                isRequired
                description="Votre code PIN pour autoriser ce virement"
              />
            </div>
          )}

          {/* Boutons d'action */}
          <Divider />
          
          <div className="flex justify-between items-center">
            <Button
              variant="bordered"
              startContent={<FaArrowLeft />}
              href="/dashboard/transactions"
              as="a"
            >
              Annuler
            </Button>
            
            <Button
              color="primary"
              endContent={<FaExchangeAlt />}
              onClick={handleSubmit}
              isDisabled={
                !formData.amount || 
                !formData.sourceAccountNumber || 
                !formData.transferType || 
                !formData.pin ||
                validationErrors.length > 0
              }
              className="min-w-32"
            >
              Effectuer le Virement
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Modal de confirmation */}
      <Modal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <span className="text-2xl">🔄</span>
            Confirmer le virement
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-gray-700">
                Vous êtes sur le point d'effectuer un virement. Veuillez vérifier les informations suivantes :
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>De:</span>
                  <span className="font-medium">{sourceAccount?.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vers:</span>
                  <span className="font-medium">
                    {formData.transferType === 'internal' && destinationAccount?.accountName}
                    {formData.transferType === 'supplier' && formData.supplierName}
                    {formData.transferType === 'interac' && formData.recipientName}
                    {formData.transferType === 'loan_payment' && `Prêt ${formData.loanAccountNumber}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Montant:</span>
                  <span className="font-bold text-purple-600">
                    {formatCurrency(parseFloat(formData.amount || '0'))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Frais:</span>
                  <span>{formatCurrency(calculateFees())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Délai:</span>
                  <span className="font-medium text-blue-600">{getProcessingTime()}</span>
                </div>
                <Divider />
                <div className="flex justify-between font-bold">
                  <span>Total débité:</span>
                  <span className="text-red-600">
                    {formatCurrency(parseFloat(formData.amount || '0') + calculateFees())}
                  </span>
                </div>
              </div>
              
              <Card className="bg-orange-50 border-orange-200">
                <CardBody className="p-3">
                  <div className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-orange-500" />
                    <span className="text-orange-800 font-medium">
                      Cette transaction sera traitée selon les délais indiqués et ne pourra pas être annulée.
                    </span>
                  </div>
                </CardBody>
              </Card>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="bordered" 
              href="/dashboard/transactions"
              as="a"
            >
              Annuler
            </Button>
            <Button 
              color="primary" 
              onPress={confirmTransfer}
              isLoading={isSubmitting}
            >
              Confirmer le Virement
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de succès */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            Virement effectué avec succès !
          </ModalHeader>
          <ModalBody>
            <div className="text-center space-y-4">
              <div className="text-6xl">🔄</div>
              <h3 className="text-xl font-semibold">
                Transaction #TR-2025-{Date.now().toString().slice(-4)}
              </h3>
              <p className="text-gray-600">
                Votre virement de <strong>{formatCurrency(parseFloat(formData.amount || '0'))}</strong> a été traité avec succès.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Délai de traitement :</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <FaClock className="text-blue-500" />
                    <span><strong>{getProcessingTime()}</strong></span>
                  </div>
                  <p className="text-center mt-2">
                    {formData.transferType === 'interac' && "Le destinataire recevra un email/SMS avec les instructions"}
                    {formData.transferType === 'supplier' && "Le paiement sera traité pendant les heures d'affaires"}
                    {formData.transferType === 'internal' && "Le montant est maintenant disponible dans le compte de destination"}
                    {formData.transferType === 'loan_payment' && "Votre paiement de prêt a été appliqué immédiatement"}
                  </p>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onClose} fullWidth>
              Retour aux transactions
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TransferForm;