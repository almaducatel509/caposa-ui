"use client";

import CreateEmployeeForm from "@/app/components/employees/CreateEmployeeForm";

export default function TestCreatePage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Créer un employé (test)</h1>
      <CreateEmployeeForm onSuccess={() => console.log("✅ Employé créé")} />
    </div>
  );
}
