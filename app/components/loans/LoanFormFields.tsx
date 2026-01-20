"use client";
import React, { useEffect, useState } from "react";
import { FaInfoCircle, FaLock } from "react-icons/fa";
import {
  LoanFormData,
  validateLoanWithZod,
} from "../transactions/validation/loanSchema";
import {
  calculateMonthlyPayment,
  calculateTotalInterest,
} from "../transactions/validation/loanCalculations";
import { validateLoanForm } from "../transactions/validation/loanLogic";

type Errors = Record<string, string>;

const LoanFormFields: React.FC<{
  members?: Array<{ id: string; first_name?: string; last_name?: string }>;
  employees?: Array<{ id: string; first_name?: string; last_name?: string }>;
  isEditMode?: boolean;
}> = ({ members = [], employees = [], isEditMode = false }) => {
  const [formData, setFormData] = useState<LoanFormData>({
    id_loan: "",
    id_member: undefined,
    typePret: undefined,
    montantDemande: undefined,
    dureeMois: undefined,
    tauxInteret: undefined,
    dateDemande: "",
    statut: "pending", // ✅ corrigé (anglais)
    commentaire: "",
    frais: undefined,
  });

  const [errors, setErrors] = useState<Errors>({});

  // === Setters ===
  const handleChange = (key: keyof LoanFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNumber = (key: keyof LoanFormData, value: string) => {
    const num = value === "" ? undefined : Number(value);
    setFormData((prev) => ({ ...prev, [key]: num }));
  };

  // === Validation auto ===
  useEffect(() => {
    const zodCheck = validateLoanWithZod(formData);
    const logicCheck = validateLoanForm(formData);
    const mergedErrors = { ...zodCheck.errors, ...logicCheck.errors };

    (Object.keys(mergedErrors) as (keyof LoanFormData)[]).forEach((key) => {
      const val = formData[key];
      if (val !== undefined && val !== "" && val !== null) {
        delete mergedErrors[key];
      }
    });

    setErrors(Object.keys(mergedErrors).length ? mergedErrors : {});
  }, [formData]);

  // === Progression ===
  const completionPercentage = (() => {
    const requiredFields = [
      formData.id_member,
      formData.typePret,
      formData.montantDemande,
      formData.dureeMois,
      formData.tauxInteret,
      formData.dateDemande,
    ];
    const filled = requiredFields.filter(
      (f) => f !== undefined && f !== "" && String(f).trim() !== ""
    ).length;
    return Math.round((filled / requiredFields.length) * 100);
  })();

  // === Calculs financiers ===
  const estimatedMonthlyPayment =
    formData.montantDemande && formData.dureeMois && formData.tauxInteret
      ? calculateMonthlyPayment(
          formData.montantDemande,
          formData.tauxInteret,
          formData.dureeMois
        )
      : 0;

  const totalInterest = formData.montantDemande
    ? calculateTotalInterest(
        estimatedMonthlyPayment,
        formData.dureeMois || 0,
        formData.montantDemande
      )
    : 0;

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "0,00 $";
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  // === Rendu ===
  return (
    <div className="space-y-6">
      {/* Progression */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progression du formulaire
          </span>
          <span className="text-sm font-bold text-green-600">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Sélection membre  je dois changer en auto completion https://www.heroui.com/docs/components/autocomplete*/}
      <div>
        <label className="block text-sm font-medium text-gray-700">Membre</label>
        <select
          value={formData.id_member ?? ""}
          onChange={(e) => handleChange("id_member", e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mt-1"
        >
          <option value="">-- Sélectionner un membre --</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.first_name} {m.last_name}
            </option>
          ))}
        </select>
      </div>

      {/* Type de prêt */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Type de prêt
        </label>
        <select
          value={formData.typePret ?? ""}
          onChange={(e) => handleChange("typePret", e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mt-1"
        >
          <option value="">-- Sélectionner un type --</option>
          <option value="personnel">Prêt personnel</option>
          <option value="immobilier">Prêt immobilier</option>
          <option value="auto">Prêt auto</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      {/* Montant / durée / taux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Montant demandé
          </label>
          <input
            type="number"
            value={formData.montantDemande ?? ""}
            onChange={(e) => handleNumber("montantDemande", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Durée (mois)
          </label>
          <input
            type="number"
            value={formData.dureeMois ?? ""}
            onChange={(e) => handleNumber("dureeMois", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Taux d’intérêt (%) non manuel
          </label>
          <input
            type="number"
            value={formData.tauxInteret ?? ""}
            onChange={(e) => handleNumber("tauxInteret", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>
      </div>

      {/* Résumé calculé */}
      {estimatedMonthlyPayment > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Paiement Mensuel Estimé
            </span>
            <FaInfoCircle className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(estimatedMonthlyPayment)}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Calculé automatiquement selon les paramètres
          </p>
        </div>
      )}
    </div>
  );
};

export default LoanFormFields;
