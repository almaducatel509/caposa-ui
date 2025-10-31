'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import type { AccountFormData, AccountData } from './validationsaccount';
import { fetchMembers, createAccount } from '@/app/lib/api/accounts';
import AccountFormFields from './CompteFormFields';

interface CreateAccountFormProps {
  onSuccess: (createdAccount: AccountData) => void; // <- returns created object
  onCancel?: () => void;
  defaultMemberId?: string;
}

const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  onSuccess,
  onCancel,
  defaultMemberId,
}) => {
  const [formData, setFormData] = useState<AccountFormData>({
    noCompte: '',       
    idMembre: defaultMemberId || '',
    idEmployee: undefined,
    typeCompte: '',
    statutCompte: 'actif',
    dateOuverture: new Date().toISOString().slice(0, 10),
    dateFermeture: undefined,
    soldeActuel: 0,
    depotInitial: 0,
    tauxInteret: undefined,
    limiteTrait: undefined,
    fraisServiceMensuel: undefined,
  });

  const [errors, setErrors] = useState<Record<string,string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string|null>(null);
  const [successMessage, setSuccessMessage] = useState<string|null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const m = await fetchMembers();
        if (!mounted) return;
        setMembers(m || []);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setApiError('Erreur lors du chargement des membres');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleSetFormData = (data: Partial<AccountFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    // clear errors for updated fields
    setErrors(prev => {
      const next = { ...prev };
      Object.keys(data).forEach(k => delete (next as any)[k]);
      return next;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string,string> = {};
    if (!formData.idMembre || String(formData.idMembre).trim() === '') newErrors.idMembre = 'Le membre est requis';
    if (!formData.noCompte || formData.noCompte.trim() === '') newErrors.noCompte = 'Le numéro de compte est requis';
    if (!formData.typeCompte) newErrors.typeCompte = 'Le type de compte est requis';
    if (!formData.dateOuverture) newErrors.dateOuverture = 'La date d\'ouverture est requise';
    if (formData.depotInitial === undefined || formData.depotInitial < 0) newErrors.depotInitial = 'Le dépôt initial doit être positif';
    // domain-specific rules
    if (formData.typeCompte === 'epargne' && (formData.depotInitial || 0) < 25) newErrors.depotInitial = 'Dépôt minimum de 25$ requis pour compte épargne';
    if (formData.typeCompte === 'cheques' && (formData.depotInitial || 0) < 100) newErrors.depotInitial = 'Dépôt minimum de 100$ requis pour compte chèques';
    if (formData.typeCompte === 'terme' && (formData.depotInitial || 0) < 500) newErrors.depotInitial = 'Dépôt minimum de 500$ requis pour compte à terme';
    if ((formData.typeCompte === 'epargne' || formData.typeCompte === 'terme') && (!formData.tauxInteret || formData.tauxInteret <= 0)) newErrors.tauxInteret = 'Le taux d\'intérêt est requis pour ce type de compte';
    if (formData.typeCompte === 'cheques' && (!formData.limiteTrait || formData.limiteTrait <= 0)) newErrors.limiteTrait = 'La limite de retrait est requise pour compte chèques';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setApiError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        noCompte: formData.noCompte,
        member_id: formData.idMembre,
        typeCompte: formData.typeCompte,
        statutCompte: formData.statutCompte,
        dateOuverture: formData.dateOuverture,
        depotInitial: formData.depotInitial || 0,
        soldeActuel: formData.soldeActuel,
        tauxInteret: formData.tauxInteret,
        limiteTrait: formData.limiteTrait,
        fraisServiceMensuel: formData.fraisServiceMensuel,
      };

      const created = await createAccount(payload);
      setSuccessMessage('Compte créé avec succès!');
      // Return the created object to parent immediately
      onSuccess(created);
    } catch (err: any) {
      console.error(err);
      setApiError(err?.message || 'Erreur lors de la création du compte');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34963d] mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {apiError && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{apiError}</div>}
      {successMessage && <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">{successMessage}</div>}

      <AccountFormFields
        formData={formData}
        setFormData={handleSetFormData}
        errors={errors}
        setErrors={setErrors}
        members={members}
        isEditMode={false}
      />

      <div className="flex gap-4 justify-end pt-6 border-t">
        {onCancel && <Button variant="light" onPress={onCancel} isDisabled={isSubmitting}>Annuler</Button>}
        <Button variant="light" onPress={() => {
          setFormData({
            noCompte: '',
            idMembre: defaultMemberId || '',
            idEmployee: undefined,
            typeCompte: '',
            statutCompte: 'actif',
            dateOuverture: new Date().toISOString().slice(0, 10),
            dateFermeture: undefined,
            soldeActuel: 0,
            depotInitial: 0,
            tauxInteret: undefined,
            limiteTrait: undefined,
            fraisServiceMensuel: undefined,
          });
          setErrors({});
          setApiError(null);
          setSuccessMessage(null);
        }} isDisabled={isSubmitting}>Réinitialiser</Button>

        <Button className="bg-[#34963d] text-white hover:bg-[#1e7367]" onPress={handleSubmit} isLoading={isSubmitting} isDisabled={isSubmitting}>
          {isSubmitting ? "Création..." : "Créer le compte"}
        </Button>
      </div>
    </div>
  );
};

export default CreateAccountForm;
