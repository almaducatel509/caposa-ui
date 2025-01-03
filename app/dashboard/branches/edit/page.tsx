'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { branchSchema, BranchData, ErrorMessages } from '@/app/components/branches/validations';
import { getBranchById, updateBranch } from '@/app/lib/api/branche';
import { Button, Input, Textarea } from "@nextui-org/react";

const EditBranch = ({ branchId }: { branchId: string }) => {
  const [formData, setFormData] = useState<BranchData>({
    branch_name: '',
    branch_address: '',
    branch_phone_number: '',
    branch_email: '',
    number_of_posts: 0,
    number_of_tellers: 0,
    number_of_clerks: 0,
    number_of_credit_officers: 0,
    opening_date: '',
    opening_hour: '',
    holidays: [],
  });
  const [errors, setErrors] = useState<ErrorMessages<BranchData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        console.log("Fetching branch data for ID:", branchId);
        const branch = await getBranchById(branchId);
        console.log("Branch data loaded:", branch);
        setFormData(branch);
      } catch (error) {
        console.error("Erreur lors du chargement de la branche :", error);
      }
    };
    fetchBranch();
  }, [branchId]);

  const validateForm = (): boolean => {
    const result = branchSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: ErrorMessages<BranchData> = {};
      result.error.errors.forEach((error) => {
        const key = error.path[0] as keyof BranchData;
        newErrors[key] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await updateBranch(branchId, formData);
      router.push("/dashboard/branches");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la branche :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Modifier une Branche</h1>
      <Input
        label="Nom de la branche"
        value={formData.branch_name}
        onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
        errorMessage={errors.branch_name}
      />
      <Textarea
        label="Adresse"
        value={formData.branch_address}
        onChange={(e) => setFormData({ ...formData, branch_address: e.target.value })}
      />
      {/* Add other inputs here */}
      <Button
        isLoading={isSubmitting}
        onPress={handleSubmit}
        disabled={isSubmitting}
        className="bg-green-600 text-white"
      >
        {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
      </Button>
    </div>
  );
};

export default EditBranch;
