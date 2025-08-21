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
  Progress,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@nextui-org/react";
import { FaArrowLeft, FaArrowRight, FaCalculator, FaFileUpload, FaCheckCircle, FaInfoCircle } from "react-icons/fa";

// Types pour le formulaire
interface LoanFormData {
  // Étape 1: Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberId?: string;
  
  // Étape 2: Détails du prêt
  amount: string;
  duration: string;
  purpose: string;
  purposeDetails: string;
  
  // Étape 3: Informations financières
  monthlyIncome: string;
  monthlyExpenses: string;
  otherLoans: string;
  collateral: string;
  collateralValue: string;
  
  // Étape 4: Documents (simulation)
  documents: File[];
}

interface LoanCalculation {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  interestRate: number;
}

const LoanApplicationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<LoanFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    amount: '',
    duration: '12',
    purpose: '',
    purposeDetails: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    otherLoans: '0',
    collateral: '',
    collateralValue: '',
    documents: []
  });
  
  const [calculation, setCalculation] = useState<LoanCalculation>({
    monthlyPayment: 0,
    totalInterest: 0,
    totalAmount: 0,
    interestRate: 3.5
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Calcul automatique des mensualités
  useEffect(() => {
    if (formData.amount && formData.duration) {
      const principal = parseFloat(formData.amount);
      const months = parseInt(formData.duration);
      const rate = getInterestRate(principal, months);
      
      if (principal > 0 && months > 0) {
        const monthlyRate = rate / 100 / 12;
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        const totalAmount = monthlyPayment * months;
        const totalInterest = totalAmount - principal;
        
        setCalculation({
          monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
          totalInterest: isNaN(totalInterest) ? 0 : totalInterest,
          totalAmount: isNaN(totalAmount) ? 0 : totalAmount,
          interestRate: rate
        });
      }
    }
  }, [formData.amount, formData.duration]);

  // Calcul du taux d'intérêt selon le montant et la durée
  const getInterestRate = (amount: number, months: number): number => {
    if (amount <= 1000) return 2.5;
    if (amount <= 5000) return 3.0;
    if (amount <= 10000) return 3.5;
    if (months > 24) return 4.0;
    return 3.5;
  };

  // Options pour les sélecteurs
  const purposeOptions = [
    { key: 'equipment', label: 'Équipement agricole' },
    { key: 'seeds', label: 'Semences et plants' },
    { key: 'livestock', label: 'Bétail' },
    { key: 'land', label: 'Achat/amélioration terrain' },
    { key: 'building', label: 'Bâtiments/infrastructures' },
    { key: 'vehicle', label: 'Véhicule agricole' },
    { key: 'emergency', label: 'Urgence/imprévu' },
    { key: 'other', label: 'Autre' }
  ];

  const durationOptions = [
    { key: '6', label: '6 mois' },
    { key: '12', label: '1 an' },
    { key: '18', label: '18 mois' },
    { key: '24', label: '2 ans' },
    { key: '36', label: '3 ans' },
    { key: '48', label: '4 ans' },
    { key: '60', label: '5 ans' }
  ];

  const collateralOptions = [
    { key: 'none', label: 'Aucune garantie' },
    { key: 'equipment', label: 'Équipement agricole' },
    { key: 'vehicle', label: 'Véhicule' },
    { key: 'land', label: 'Terrain/propriété' },
    { key: 'livestock', label: 'Bétail' },
    { key: 'savings', label: 'Épargne/dépôt' },
    { key: 'other', label: 'Autre' }
  ];

  // Gestion des changements de formulaire
  const handleInputChange = (field: keyof LoanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validation par étape
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone);
      case 2:
        return !!(formData.amount && formData.duration && formData.purpose);
      case 3:
        return !!(formData.monthlyIncome && formData.monthlyExpenses);
      case 4:
        return true; // Documents optionnels
      default:
        return false;
    }
  };

  // Navigation entre étapes
  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulation d'envoi (remplacer par vraie API plus tard)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('📤 Demande de prêt soumise:', formData);
      console.log('💰 Calculs:', calculation);
      onOpen(); // Ouvrir modal de confirmation
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
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
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">🏦</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Demande de Prêt Agricole</h1>
              <p className="text-gray-600">Financement pour vos projets agricoles</p>
            </div>
          </div>
          
          {/* Indicateur de progression */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Étape {currentStep} sur 4</span>
              <span className="text-sm text-gray-600">{Math.round((currentStep / 4) * 100)}% complété</span>
            </div>
            <Progress 
              value={(currentStep / 4) * 100} 
              color="success"
              className="w-full"
            />
          </div>
        </CardHeader>

        <CardBody className="space-y-6">
          {/* Étape 1: Informations personnelles */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">👤</span>
                <h2 className="text-xl font-semibold">Informations personnelles</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  placeholder="Votre prénom"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  isRequired
                />
                <Input
                  label="Nom de famille"
                  placeholder="Votre nom"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  isRequired
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  isRequired
                />
                <Input
                  label="Téléphone"
                  placeholder="(514) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  isRequired
                />
              </div>
              
              <Input
                label="ID Membre (optionnel)"
                placeholder="Si vous êtes déjà membre"
                value={formData.memberId || ''}
                onChange={(e) => handleInputChange('memberId', e.target.value)}
                description="Laissez vide si vous n'êtes pas encore membre"
              />
            </div>
          )}

          {/* Étape 2: Détails du prêt */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">💰</span>
                <h2 className="text-xl font-semibold">Détails du prêt</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="Montant demandé"
                    placeholder="5000"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    startContent={<span className="text-gray-500">$</span>}
                    isRequired
                  />
                  
                  <Select
                    label="Durée du prêt"
                    placeholder="Choisir la durée"
                    selectedKeys={formData.duration ? [formData.duration] : []}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    isRequired
                  >
                    {durationOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="But du prêt"
                    placeholder="Choisir le but"
                    selectedKeys={formData.purpose ? [formData.purpose] : []}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    isRequired
                  >
                    {purposeOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Calculatrice de prêt */}
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <CardBody className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <FaCalculator className="text-purple-600" />
                      <h3 className="font-semibold text-purple-800">Simulation de prêt</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Taux d'intérêt:</span>
                        <span className="font-medium text-purple-700">{calculation.interestRate}%</span>
                      </div>
                      
                      <Divider />
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Paiement mensuel:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(calculation.monthlyPayment)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total des intérêts:</span>
                        <span className="font-medium text-orange-600">
                          {formatCurrency(calculation.totalInterest)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="font-medium">Montant total:</span>
                        <span className="font-bold text-purple-700">
                          {formatCurrency(calculation.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
              
              <Textarea
                label="Détails supplémentaires"
                placeholder="Décrivez en détail l'utilisation prévue des fonds..."
                value={formData.purposeDetails}
                onChange={(e) => handleInputChange('purposeDetails', e.target.value)}
                minRows={3}
              />
            </div>
          )}

          {/* Étape 3: Informations financières */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📊</span>
                <h2 className="text-xl font-semibold">Situation financière</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="Revenus mensuels"
                    placeholder="3000"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                    startContent={<span className="text-gray-500">$</span>}
                    isRequired
                  />
                  
                  <Input
                    label="Dépenses mensuelles"
                    placeholder="2000"
                    value={formData.monthlyExpenses}
                    onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
                    startContent={<span className="text-gray-500">$</span>}
                    isRequired
                  />
                  
                  <Input
                    label="Autres prêts en cours"
                    placeholder="500"
                    value={formData.otherLoans}
                    onChange={(e) => handleInputChange('otherLoans', e.target.value)}
                    startContent={<span className="text-gray-500">$</span>}
                    description="Paiements mensuels d'autres prêts"
                  />
                </div>

                {/* Analyse de capacité */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardBody className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <FaInfoCircle className="text-green-600" />
                      <h3 className="font-semibold text-green-800">Analyse de capacité</h3>
                    </div>
                    
                    {formData.monthlyIncome && formData.monthlyExpenses && (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Revenus nets:</span>
                          <span className="font-medium text-green-700">
                            {formatCurrency(
                              parseFloat(formData.monthlyIncome) - 
                              parseFloat(formData.monthlyExpenses) - 
                              parseFloat(formData.otherLoans || '0')
                            )}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Nouveau paiement:</span>
                          <span className="font-medium text-purple-700">
                            {formatCurrency(calculation.monthlyPayment)}
                          </span>
                        </div>
                        
                        <Divider />
                        
                        <div className="flex justify-between">
                          <span className="font-medium">Reste disponible:</span>
                          <span className={`font-bold ${
                            (parseFloat(formData.monthlyIncome) - 
                             parseFloat(formData.monthlyExpenses) - 
                             parseFloat(formData.otherLoans || '0') - 
                             calculation.monthlyPayment) > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(
                              parseFloat(formData.monthlyIncome) - 
                              parseFloat(formData.monthlyExpenses) - 
                              parseFloat(formData.otherLoans || '0') - 
                              calculation.monthlyPayment
                            )}
                          </span>
                        </div>
                        
                        {(parseFloat(formData.monthlyIncome) - 
                          parseFloat(formData.monthlyExpenses) - 
                          parseFloat(formData.otherLoans || '0') - 
                          calculation.monthlyPayment) < 0 && (
                          <Chip color="warning" size="sm" className="w-full justify-center">
                            ⚠️ Capacité de remboursement insuffisante
                          </Chip>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
              
              <div className="space-y-4">
                <Select
                  label="Type de garantie"
                  placeholder="Choisir une garantie"
                  selectedKeys={formData.collateral ? [formData.collateral] : []}
                  onChange={(e) => handleInputChange('collateral', e.target.value)}
                >
                  {collateralOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
                
                {formData.collateral && formData.collateral !== 'none' && (
                  <Input
                    label="Valeur estimée de la garantie"
                    placeholder="10000"
                    value={formData.collateralValue}
                    onChange={(e) => handleInputChange('collateralValue', e.target.value)}
                    startContent={<span className="text-gray-500">$</span>}
                  />
                )}
              </div>
            </div>
          )}

          {/* Étape 4: Documents et révision */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📄</span>
                <h2 className="text-xl font-semibold">Documents et révision</h2>
              </div>
              
              {/* Zone de upload de fichiers (simulation) */}
              <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
                <CardBody className="text-center py-8">
                  <FaFileUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Documents justificatifs (optionnel)
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Relevés bancaires, preuves de revenus, factures d'équipement...
                  </p>
                  <Button color="primary" variant="bordered">
                    Choisir des fichiers
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">
                    PDF, JPG, PNG jusqu'à 10MB par fichier
                  </p>
                </CardBody>
              </Card>
              
              {/* Résumé de la demande */}
              <Card className="bg-blue-50 border-blue-200">
                <CardBody>
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">
                    📋 Résumé de votre demande
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Demandeur:</strong> {formData.firstName} {formData.lastName}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Téléphone:</strong> {formData.phone}</p>
                    </div>
                    
                    <div>
                      <p><strong>Montant:</strong> {formatCurrency(parseFloat(formData.amount || '0'))}</p>
                      <p><strong>Durée:</strong> {durationOptions.find(d => d.key === formData.duration)?.label}</p>
                      <p><strong>But:</strong> {purposeOptions.find(p => p.key === formData.purpose)?.label}</p>
                    </div>
                    
                    <div>
                      <p><strong>Revenus mensuels:</strong> {formatCurrency(parseFloat(formData.monthlyIncome || '0'))}</p>
                      <p><strong>Paiement mensuel:</strong> {formatCurrency(calculation.monthlyPayment)}</p>
                    </div>
                    
                    <div>
                      <p><strong>Taux d'intérêt:</strong> {calculation.interestRate}%</p>
                      <p><strong>Total à rembourser:</strong> {formatCurrency(calculation.totalAmount)}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Boutons de navigation */}
          <Divider />
          
          <div className="flex justify-between items-center">
            <Button
              variant="bordered"
              startContent={<FaArrowLeft />}
              onClick={prevStep}
              isDisabled={currentStep === 1}
            >
              Précédent
            </Button>
            
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep
                      ? 'bg-purple-500 text-white'
                      : step < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? <FaCheckCircle /> : step}
                </div>
              ))}
            </div>
            
            {currentStep < 4 ? (
              <Button
                color="primary"
                endContent={<FaArrowRight />}
                onClick={nextStep}
                isDisabled={!validateStep(currentStep)}
              >
                Suivant
              </Button>
            ) : (
              <Button
                color="success"
                endContent={<FaCheckCircle />}
                onClick={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={!validateStep(currentStep)}
              >
                Soumettre la demande
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Modal de confirmation */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            Demande soumise avec succès !
          </ModalHeader>
          <ModalBody>
            <div className="text-center space-y-4">
              <div className="text-6xl">✅</div>
              <h3 className="text-xl font-semibold">Demande de prêt #LOAN-2025-{Date.now().toString().slice(-3)}</h3>
              <p className="text-gray-600">
                Votre demande de prêt de <strong>{formatCurrency(parseFloat(formData.amount || '0'))}</strong> a été soumise avec succès.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Prochaines étapes :</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Révision par notre équipe (2-3 jours ouvrables)</li>
                  <li>• Vérification des informations fournies</li>
                  <li>• Notification par email de la décision</li>
                  <li>• Si approuvé, signature du contrat</li>
                </ul>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onClose} fullWidth>
              Retour au tableau de bord
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LoanApplicationForm;