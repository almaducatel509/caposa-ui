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
  useDisclosure
} from "@heroui/react";
import { FaArrowLeft, FaWallet, FaCreditCard, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaCalculator } from "react-icons/fa";

// Types pour le formulaire de retrait
interface WithdrawalFormData {
  // Informations de base
  memberId: string;
  accountNumber: string;
  amount: string;
  
  // Type et détails
  withdrawalType: string;
  method: string;
  purpose: string;
  description: string;
  
  // Sécurité et autorisation
  pin: string;
  authorizationRequired: boolean;
  urgency: 'normal' | 'urgent' | 'emergency';
}

interface AccountInfo {
  accountNumber: string;
  accountName: string;
  availableBalance: number;
  dailyLimit: number;
  todayWithdrawn: number;
  accountType: string;
}

const WithdrawalForm: React.FC = () => {
  const [formData, setFormData] = useState<WithdrawalFormData>({
    memberId: '',
    accountNumber: '',
    amount: '',
    withdrawalType: '',
    method: '',
    purpose: '',
    description: '',
    pin: '',
    authorizationRequired: false,
    urgency: 'normal'
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
      availableBalance: 15420.50,
      dailyLimit: 1000,
      todayWithdrawn: 0,
      accountType: "Épargne"
    },
    {
      accountNumber: "12345-002", 
      accountName: "Compte Chèques Exploitation",
      availableBalance: 8750.25,
      dailyLimit: 2500,
      todayWithdrawn: 500,
      accountType: "Chèques"
    },
    {
      accountNumber: "12345-003",
      accountName: "Fonds Saisonnier",
      availableBalance: 25000.00,
      dailyLimit: 5000,
      todayWithdrawn: 0,
      accountType: "Terme"
    }
  ];

  // Types de retraits agricoles (comptoir seulement)
  const withdrawalTypes = [
    { key: 'cash_counter', label: 'Espèces au comptoir' },
    { key: 'check_issue', label: 'Émission de chèque' },
    { key: 'loan_disbursement', label: 'Déblocage de prêt' },
    { key: 'emergency', label: 'Retrait d\'urgence' }
  ];

  // Méthodes de retrait
  const withdrawalMethods = [
    { key: 'immediate', label: 'Immédiat (si fonds disponibles)' },
    { key: 'next_day', label: 'Lendemain (commande spéciale)' },
    { key: 'scheduled', label: 'Planifié (date future)' }
  ];

  // Buts de retrait agricoles
  const purposeOptions = [
    { key: 'equipment', label: 'Achat d\'équipement agricole' },
    { key: 'seeds_supplies', label: 'Semences et fournitures' },
    { key: 'livestock', label: 'Achat de bétail' },
    { key: 'feed', label: 'Nourriture animale' },
    { key: 'fuel', label: 'Carburant et diesel' },
    { key: 'repairs', label: 'Réparations d\'urgence' },
    { key: 'labor', label: 'Main-d\'œuvre saisonnière' },
    { key: 'insurance', label: 'Assurances agricoles' },
    { key: 'taxes', label: 'Taxes et impôts' },
    { key: 'personal', label: 'Usage personnel' },
    { key: 'other', label: 'Autre (préciser)' }
  ];

  // Gestion des changements
  const handleInputChange = (field: keyof WithdrawalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validation en temps réel pour le montant
    if (field === 'amount' && selectedAccount) {
      validateAmount(parseFloat(value));
    }
  };

  // Sélection de compte
  const handleAccountChange = (accountNumber: string) => {
    const account = availableAccounts.find(acc => acc.accountNumber === accountNumber);
    setSelectedAccount(account || null);
    setFormData(prev => ({ ...prev, accountNumber }));
  };

  // Validation du montant
  const validateAmount = (amount: number) => {
    const errors: string[] = [];
    
    if (!selectedAccount) {
      errors.push("Veuillez sélectionner un compte");
      setValidationErrors(errors);
      return false;
    }

    if (amount <= 0) {
      errors.push("Le montant doit être supérieur à 0$");
    }

    if (amount > selectedAccount.availableBalance) {
      errors.push(`Fonds insuffisants (disponible: ${formatCurrency(selectedAccount.availableBalance)})`);
    }

    const remainingLimit = selectedAccount.dailyLimit - selectedAccount.todayWithdrawn;
    if (amount > remainingLimit) {
      errors.push(`Limite quotidienne dépassée (restant: ${formatCurrency(remainingLimit)})`);
    }

    // Seuil d'autorisation (1000$ et plus)
    if (amount >= 1000) {
      setFormData(prev => ({ ...prev, authorizationRequired: true }));
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Calcul des frais
  const calculateFees = (): number => {
    const amount = parseFloat(formData.amount || '0');
    let fees = 0;

    // Frais selon le type de retrait
    switch (formData.withdrawalType) {
      case 'cash_counter':
        fees = amount > 500 ? 2.50 : 0; // Frais pour gros montants
        break;
      case 'check_issue':
        fees = 3.00;
        break;
      case 'loan_disbursement':
        fees = 0; // Pas de frais pour déblocage de prêt
        break;
      case 'emergency':
        fees = 15.00; // Frais d'urgence
        break;
      default:
        fees = 0;
    }

    return fees;
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
  const confirmWithdrawal = async () => {
    setIsSubmitting(true);
    setShowConfirmation(false);

    try {
      // Simulation de traitement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('💸 Retrait traité:', {
        ...formData,
        account: selectedAccount,
        fees: calculateFees(),
        timestamp: new Date().toISOString()
      });
      
      onOpen(); // Ouvrir modal de succès
    } catch (error) {
      console.error('❌ Erreur retrait:', error);
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

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <span className="text-2xl">💸</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nouveau Retrait</h1>
              <p className="text-gray-600">Retrait de fonds au comptoir</p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="space-y-6">
          {/* Sélection du compte */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🏦</span>
              <h2 className="text-xl font-semibold">Sélection du compte</h2>
            </div>
            
            <Select
              label="Compte source"
              placeholder="Choisir le compte à débiter"
              selectedKeys={formData.accountNumber ? [formData.accountNumber] : []}
              onChange={(e) => handleAccountChange(e.target.value)}
              isRequired
            >
              {availableAccounts.map((account) => (
                <SelectItem 
                  key={account.accountNumber} 
                  value={account.accountNumber}
                  description={`${formatCurrency(account.availableBalance)} disponible`}
                >
                  {account.accountName} ({account.accountNumber})
                </SelectItem>
              ))}
            </Select>

            {/* Infos du compte sélectionné */}
            {selectedAccount && (
              <Card className="bg-blue-50 border-blue-200">
                <CardBody className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Solde disponible</p>
                      <p className="font-bold text-green-600">
                        {formatCurrency(selectedAccount.availableBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Limite quotidienne</p>
                      <p className="font-medium">
                        {formatCurrency(selectedAccount.dailyLimit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Déjà retiré aujourd'hui</p>
                      <p className="font-medium text-orange-600">
                        {formatCurrency(selectedAccount.todayWithdrawn)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Limite restante</p>
                      <p className="font-bold text-blue-600">
                        {formatCurrency(selectedAccount.dailyLimit - selectedAccount.todayWithdrawn)}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Détails du retrait */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">💰</span>
              <h2 className="text-xl font-semibold">Détails du retrait</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Montant à retirer"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                startContent={<span className="text-gray-500">$</span>}
                isRequired
                color={validationErrors.length > 0 ? "danger" : "default"}
              />
              
              <Select
                label="Type de retrait"
                placeholder="Choisir le type"
                selectedKeys={formData.withdrawalType ? [formData.withdrawalType] : []}
                onChange={(e) => handleInputChange('withdrawalType', e.target.value)}
                isRequired
              >
                {withdrawalTypes.map((type) => (
                  <SelectItem key={type.key} value={type.key}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Méthode de retrait"
                placeholder="Quand effectuer le retrait"
                selectedKeys={formData.method ? [formData.method] : []}
                onChange={(e) => handleInputChange('method', e.target.value)}
                isRequired
              >
                {withdrawalMethods.map((method) => (
                  <SelectItem key={method.key} value={method.key}>
                    {method.label}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="But du retrait"
                placeholder="À quoi servira cet argent"
                selectedKeys={formData.purpose ? [formData.purpose] : []}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                isRequired
              >
                {purposeOptions.map((purpose) => (
                  <SelectItem key={purpose.key} value={purpose.key}>
                    {purpose.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Textarea
              label="Description détaillée (optionnel)"
              placeholder="Ex: Achat de semences de maïs pour la saison 2025, fournisseur ABC..."
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
                    <h4 className="font-medium text-red-800 mb-2">Erreurs de validation</h4>
                    <ul className="list-disc ml-4 space-y-1 text-red-700">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Résumé des frais */}
          {formData.amount && formData.withdrawalType && selectedAccount && validationErrors.length === 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaCalculator className="text-green-600" />
                  <h3 className="font-semibold text-green-800">Résumé de la transaction</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Montant demandé:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(formData.amount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais de transaction:</span>
                    <span className="font-medium">{formatCurrency(calculateFees())}</span>
                  </div>
                  <Divider />
                  <div className="flex justify-between font-bold">
                    <span>Total à débiter:</span>
                    <span className="text-red-600">
                      {formatCurrency(parseFloat(formData.amount) + calculateFees())}
                    </span>
                  </div>
                  
                  {formData.authorizationRequired && (
                    <Chip color="warning" size="sm" className="mt-2">
                      ⚠️ Autorisation superviseur requise (montant ≥ 1000$)
                    </Chip>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Sécurité */}
          {validationErrors.length === 0 && formData.amount && selectedAccount && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔐</span>
                <h2 className="text-xl font-semibold">Sécurité</h2>
              </div>
              
              <Input
                label="Code PIN ou mot de passe"
                type="password"
                placeholder="••••"
                value={formData.pin}
                onChange={(e) => handleInputChange('pin', e.target.value)}
                isRequired
                description="Votre code PIN à 4 chiffres ou mot de passe"
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
              color="danger"
              endContent={<FaWallet />}
              onClick={handleSubmit}
              isDisabled={
                !formData.amount || 
                !formData.accountNumber || 
                !formData.withdrawalType || 
                !formData.pin ||
                validationErrors.length > 0
              }
              className="min-w-32"
            >
              Effectuer le Retrait
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Modal de confirmation */}
      <Modal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Confirmer le retrait
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-gray-700">
                Vous êtes sur le point d'effectuer un retrait. Veuillez vérifier les informations suivantes :
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Compte:</span>
                  <span className="font-medium">{selectedAccount?.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Montant:</span>
                  <span className="font-bold text-red-600">{formatCurrency(parseFloat(formData.amount || '0'))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>{withdrawalTypes.find(t => t.key === formData.withdrawalType)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>But:</span>
                  <span>{purposeOptions.find(p => p.key === formData.purpose)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais:</span>
                  <span>{formatCurrency(calculateFees())}</span>
                </div>
                <Divider />
                <div className="flex justify-between font-bold">
                  <span>Total à débiter:</span>
                  <span className="text-red-600">{formatCurrency(parseFloat(formData.amount || '0') + calculateFees())}</span>
                </div>
              </div>
              
              <Card className="bg-orange-50 border-orange-200">
                <CardBody className="p-3">
                  <div className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-orange-500" />
                    <span className="text-orange-800 font-medium">
                      Cette action est irréversible. Le montant sera immédiatement débité de votre compte.
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
              color="danger" 
              onPress={confirmWithdrawal}
              isLoading={isSubmitting}
            >
              Confirmer le Retrait
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de succès */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            Retrait effectué avec succès !
          </ModalHeader>
          <ModalBody>
            <div className="text-center space-y-4">
              <div className="text-6xl">💸</div>
              <h3 className="text-xl font-semibold">Transaction #WD-2025-{Date.now().toString().slice(-4)}</h3>
              <p className="text-gray-600">
                Votre retrait de <strong>{formatCurrency(parseFloat(formData.amount || '0'))}</strong> a été traité avec succès.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Prochaines étapes :</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Récupérez votre reçu au comptoir</li>
                  <li>• Les fonds sont disponibles immédiatement</li>
                  <li>• Transaction visible dans votre relevé</li>
                  <li>• Conservez le reçu pour vos dossiers</li>
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

export default WithdrawalForm;