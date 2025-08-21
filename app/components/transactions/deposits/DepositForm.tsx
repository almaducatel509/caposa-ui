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
  Switch
} from "@nextui-org/react";
import { FaArrowLeft, FaMoneyBillWave, FaFileInvoiceDollar, FaExclamationTriangle, FaCheckCircle, FaCamera, FaCalculator } from "react-icons/fa";

// Types pour le formulaire de dépôt
interface DepositFormData {
  // Informations de base
  memberId: string;
  accountNumber: string;
  amount: string;
  
  // Type et détails
  depositType: string;
  source: string;
  description: string;
  
  // Spécifique aux chèques
  checkNumber?: string;
  checkBank?: string;
  checkDate?: string;
  
  // Spécifique aux virements
  transferReference?: string;
  senderName?: string;
  
  // Validation et processing
  requiresVerification: boolean;
  holdPeriod: number;
  availableImmediately: number;
}

interface AccountInfo {
  accountNumber: string;
  accountName: string;
  currentBalance: number;
  accountType: string;
  interestRate?: number;
}

const DepositForm: React.FC = () => {
  const [formData, setFormData] = useState<DepositFormData>({
    memberId: '',
    accountNumber: '',
    amount: '',
    depositType: '',
    source: '',
    description: '',
    requiresVerification: false,
    holdPeriod: 0,
    availableImmediately: 0
  });

  const [selectedAccount, setSelectedAccount] = useState<AccountInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Comptes disponibles (simulation)
  const availableAccounts: AccountInfo[] = [
    {
      accountNumber: "12345-001",
      accountName: "Compte Épargne Principal",
      currentBalance: 15420.50,
      accountType: "Épargne",
      interestRate: 2.5
    },
    {
      accountNumber: "12345-002", 
      accountName: "Compte Chèques Exploitation",
      currentBalance: 8750.25,
      accountType: "Chèques",
      interestRate: 0.5
    },
    {
      accountNumber: "12345-003",
      accountName: "Fonds Saisonnier",
      currentBalance: 25000.00,
      accountType: "Terme",
      interestRate: 3.2
    }
  ];

  // Types de dépôts agricoles
  const depositTypes = [
    { key: 'cash', label: 'Espèces' },
    { key: 'check_personal', label: 'Chèque personnel' },
    { key: 'check_business', label: 'Chèque commercial' },
    { key: 'check_government', label: 'Chèque gouvernemental' },
    { key: 'transfer_received', label: 'Virement reçu' },
    { key: 'subsidy', label: 'Subvention agricole' },
    { key: 'crop_sale', label: 'Vente de récolte' },
    { key: 'insurance_refund', label: 'Remboursement assurance' }
  ];

  // Sources de dépôt spécialisées
  const depositSources = [
    { key: 'member_contribution', label: 'Cotisation membre' },
    { key: 'harvest_income', label: 'Revenus de récolte' },
    { key: 'livestock_sale', label: 'Vente de bétail' },
    { key: 'government_subsidy', label: 'Subvention gouvernementale' },
    { key: 'insurance_claim', label: 'Réclamation assurance' },
    { key: 'equipment_sale', label: 'Vente d\'équipement' },
    { key: 'coop_payment', label: 'Paiement coopérative' },
    { key: 'contract_payment', label: 'Paiement contrat' },
    { key: 'loan_proceeds', label: 'Produit de prêt' },
    { key: 'gift_inheritance', label: 'Don/héritage' },
    { key: 'other', label: 'Autre source' }
  ];

  // Gestion des changements
  const handleInputChange = (field: keyof DepositFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Calcul automatique des retenues selon le type
    if (field === 'depositType') {
      calculateHoldPeriod(value as string);
    }
  };

  // Sélection de compte
  const handleAccountChange = (accountNumber: string) => {
    const account = availableAccounts.find(acc => acc.accountNumber === accountNumber);
    setSelectedAccount(account || null);
    setFormData(prev => ({ ...prev, accountNumber }));
  };

  // Calcul de la période de retenue selon le type de dépôt
  const calculateHoldPeriod = (depositType: string) => {
    const amount = parseFloat(formData.amount || '0');
    let holdDays = 0;
    let immediateAvailable = amount;
    let requiresVerification = false;

    switch (depositType) {
      case 'cash':
        holdDays = 0;
        requiresVerification = amount > 10000; // Déclaration obligatoire > 10k$ CAD
        break;
      case 'check_personal':
        holdDays = 5;
        immediateAvailable = Math.min(amount, 500); // 500$ disponible immédiatement
        requiresVerification = true;
        break;
      case 'check_business':
        holdDays = 7;
        immediateAvailable = Math.min(amount, 1000);
        requiresVerification = true;
        break;
      case 'check_government':
        holdDays = 2; // Chèques gouvernementaux plus rapides
        immediateAvailable = Math.min(amount, 2000);
        requiresVerification = true;
        break;
      case 'transfer_received':
        holdDays = 1;
        requiresVerification = amount > 5000;
        break;
      case 'subsidy':
        holdDays = 3;
        requiresVerification = true;
        break;
      case 'crop_sale':
        holdDays = 3;
        immediateAvailable = Math.min(amount, 5000);
        requiresVerification = amount > 10000;
        break;
      default:
        holdDays = 5;
        immediateAvailable = Math.min(amount, 500);
        requiresVerification = true;
    }

    setFormData(prev => ({
      ...prev,
      holdPeriod: holdDays,
      availableImmediately: immediateAvailable,
      requiresVerification
    }));
  };

  // Validation du montant
  const validateAmount = (amount: number) => {
    const errors: string[] = [];
    
    if (amount <= 0) {
      errors.push("Le montant doit être supérieur à 0$");
    }

    if (amount > 100000) {
      errors.push("Montant maximum de 100,000$ par dépôt");
    }

    // Validation spécifique aux espèces
    if (formData.depositType === 'cash' && amount > 10000) {
      errors.push("⚠️ Dépôt d'espèces > 10,000$ - Déclaration légale requise");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Calcul des frais de dépôt
  const calculateFees = (): number => {
    const amount = parseFloat(formData.amount || '0');
    let fees = 0;

    switch (formData.depositType) {
      case 'cash':
        fees = 0; // Espèces gratuites
        break;
      case 'check_personal':
      case 'check_business':
        fees = 0; // Chèques gratuits
        break;
      case 'check_government':
        fees = 0;
        break;
      case 'transfer_received':
        fees = amount > 1000 ? 5.00 : 0; // Frais sur gros virements
        break;
      default:
        fees = 0;
    }

    return fees;
  };

  // Calcul des intérêts projetés
  const calculateProjectedInterest = (): number => {
    if (!selectedAccount?.interestRate) return 0;
    const amount = parseFloat(formData.amount || '0');
    return (amount * selectedAccount.interestRate / 100) / 12; // Intérêts mensuels
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    const amount = parseFloat(formData.amount);
    
    if (!validateAmount(amount) || !selectedAccount) {
      return;
    }

    setShowConfirmation(true);
  };

  // Confirmation finale
  const confirmDeposit = async () => {
    setIsSubmitting(true);
    setShowConfirmation(false);

    try {
      // Recalcul des retenues avec montant final
      calculateHoldPeriod(formData.depositType);
      
      // Simulation de traitement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('💵 Dépôt traité:', {
        ...formData,
        account: selectedAccount,
        fees: calculateFees(),
        projectedInterest: calculateProjectedInterest(),
        timestamp: new Date().toISOString()
      });
      
      onOpen(); // Ouvrir modal de succès
    } catch (error) {
      console.error('❌ Erreur dépôt:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effect pour recalculer les retenues quand le montant change
  useEffect(() => {
    if (formData.amount && formData.depositType) {
      calculateHoldPeriod(formData.depositType);
      validateAmount(parseFloat(formData.amount));
    }
  }, [formData.amount, formData.depositType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString('fr-CA', {
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
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">💵</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nouveau Dépôt</h1>
              <p className="text-gray-600">Dépôt de fonds dans votre compte</p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="space-y-6">
          {/* Sélection du compte */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🏦</span>
              <h2 className="text-xl font-semibold">Compte de destination</h2>
            </div>
            
            <Select
              label="Compte à créditer"
              placeholder="Choisir le compte de destination"
              selectedKeys={formData.accountNumber ? [formData.accountNumber] : []}
              onChange={(e) => handleAccountChange(e.target.value)}
              isRequired
            >
              {availableAccounts.map((account) => (
                <SelectItem 
                  key={account.accountNumber} 
                  value={account.accountNumber}
                  description={`${formatCurrency(account.currentBalance)} | Taux: ${account.interestRate}%`}
                >
                  {account.accountName} ({account.accountNumber})
                </SelectItem>
              ))}
            </Select>

            {/* Infos du compte sélectionné */}
            {selectedAccount && (
              <Card className="bg-green-50 border-green-200">
                <CardBody className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Solde actuel</p>
                      <p className="font-bold text-green-600">
                        {formatCurrency(selectedAccount.currentBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Type de compte</p>
                      <p className="font-medium">{selectedAccount.accountType}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Taux d'intérêt</p>
                      <p className="font-medium text-blue-600">
                        {selectedAccount.interestRate}% annuel
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Détails du dépôt */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">💰</span>
              <h2 className="text-xl font-semibold">Détails du dépôt</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Montant à déposer"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                startContent={<span className="text-gray-500">$</span>}
                isRequired
                color={validationErrors.length > 0 ? "danger" : "default"}
              />
              
              <Select
                label="Type de dépôt"
                placeholder="Choisir le type"
                selectedKeys={formData.depositType ? [formData.depositType] : []}
                onChange={(e) => handleInputChange('depositType', e.target.value)}
                isRequired
              >
                {depositTypes.map((type) => (
                  <SelectItem key={type.key} value={type.key}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Source du dépôt"
                placeholder="D'où proviennent ces fonds"
                selectedKeys={formData.source ? [formData.source] : []}
                onChange={(e) => handleInputChange('source', e.target.value)}
                isRequired
              >
                {depositSources.map((source) => (
                  <SelectItem key={source.key} value={source.key}>
                    {source.label}
                  </SelectItem>
                ))}
              </Select>

              {/* Champs conditionnels selon le type */}
              {formData.depositType?.includes('check') && (
                <>
                  <Input
                    label="Numéro de chèque"
                    placeholder="123456"
                    value={formData.checkNumber || ''}
                    onChange={(e) => handleInputChange('checkNumber', e.target.value)}
                  />
                  <Input
                    label="Banque émettrice"
                    placeholder="Banque ABC"
                    value={formData.checkBank || ''}
                    onChange={(e) => handleInputChange('checkBank', e.target.value)}
                  />
                  <Input
                    label="Date du chèque"
                    type="date"
                    value={formData.checkDate || ''}
                    onChange={(e) => handleInputChange('checkDate', e.target.value)}
                  />
                </>
              )}

              {formData.depositType === 'transfer_received' && (
                <>
                  <Input
                    label="Référence du virement"
                    placeholder="REF123456"
                    value={formData.transferReference || ''}
                    onChange={(e) => handleInputChange('transferReference', e.target.value)}
                  />
                  <Input
                    label="Nom de l'expéditeur"
                    placeholder="Nom complet"
                    value={formData.senderName || ''}
                    onChange={(e) => handleInputChange('senderName', e.target.value)}
                  />
                </>
              )}
            </div>

            <Textarea
              label="Description (optionnel)"
              placeholder="Ex: Vente de blé récolte 2024, paiement coopérative..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              minRows={2}
            />
          </div>

          {/* Erreurs de validation */}
          {validationErrors.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardBody className="p-4">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">Attention</h4>
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

          {/* Résumé du traitement */}
          {formData.amount && formData.depositType && selectedAccount && validationErrors.length === 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaCalculator className="text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Traitement du dépôt</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Montant déposé:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(parseFloat(formData.amount))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frais de traitement:</span>
                      <span className="font-medium">
                        {formatCurrency(calculateFees())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Disponible immédiatement:</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(formData.availableImmediately)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Période de retenue:</span>
                      <span className="font-medium">
                        {formData.holdPeriod === 0 ? 'Aucune' : `${formData.holdPeriod} jours`}
                      </span>
                    </div>
                    {formData.holdPeriod > 0 && (
                      <div className="flex justify-between">
                        <span>Disponible le:</span>
                        <span className="font-medium text-orange-600">
                          {formatDate(formData.holdPeriod)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Intérêts mensuels projetés:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(calculateProjectedInterest())}
                      </span>
                    </div>
                  </div>
                </div>

                {formData.requiresVerification && (
                  <Chip color="warning" size="sm" className="mt-3">
                    ⚠️ Dépôt nécessitant vérification
                  </Chip>
                )}
              </CardBody>
            </Card>
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
              color="success"
              endContent={<FaMoneyBillWave />}
              onClick={handleSubmit}
              isDisabled={
                !formData.amount || 
                !formData.accountNumber || 
                !formData.depositType || 
                !formData.source ||
                validationErrors.length > 0
              }
              className="min-w-32"
            >
              Effectuer le Dépôt
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Modal de confirmation */}
      <Modal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <span className="text-2xl">💵</span>
            Confirmer le dépôt
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-gray-700">
                Vous êtes sur le point d'effectuer un dépôt. Veuillez vérifier les informations suivantes :
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Compte:</span>
                  <span className="font-medium">{selectedAccount?.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Montant:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(parseFloat(formData.amount || '0'))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>{depositTypes.find(t => t.key === formData.depositType)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Source:</span>
                  <span>{depositSources.find(s => s.key === formData.source)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Disponible immédiatement:</span>
                  <span className="font-medium text-blue-600">
                    {formatCurrency(formData.availableImmediately)}
                  </span>
                </div>
                {formData.holdPeriod > 0 && (
                  <div className="flex justify-between">
                    <span>Solde complet disponible le:</span>
                    <span className="font-medium text-orange-600">
                      {formatDate(formData.holdPeriod)}
                    </span>
                  </div>
                )}
              </div>
              
              <Card className="bg-orange-50 border-orange-200">
                <CardBody className="p-3">
                  <div className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-orange-500" />
                    <span className="text-orange-800 font-medium">
                      Assurez-vous que tous les documents nécessaires sont fournis.
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
              color="success" 
              onPress={confirmDeposit}
              isLoading={isSubmitting}
            >
              Confirmer le Dépôt
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de succès */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            Dépôt effectué avec succès !
          </ModalHeader>
          <ModalBody>
            <div className="text-center space-y-4">
              <div className="text-6xl">💵</div>
              <h3 className="text-xl font-semibold">
                Transaction #DP-2025-{Date.now().toString().slice(-4)}
              </h3>
              <p className="text-gray-600">
                Votre dépôt de <strong>{formatCurrency(parseFloat(formData.amount || '0'))}</strong> a été traité avec succès.
              </p>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Détails du traitement :</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Montant disponible immédiatement: <strong>{formatCurrency(formData.availableImmediately)}</strong></li>
                  {formData.holdPeriod > 0 && (
                    <li>• Solde complet disponible le: <strong>{formatDate(formData.holdPeriod)}</strong></li>
                  )}
                  <li>• Nouveau solde projeté: <strong>{formatCurrency(selectedAccount?.currentBalance! + parseFloat(formData.amount || '0'))}</strong></li>
                  <li>• Reçu imprimé automatiquement</li>
                </ul>
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

export default DepositForm;