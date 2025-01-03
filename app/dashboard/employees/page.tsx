'use client';

import React, { useEffect, useState } from 'react';
import { Employee } from './columns';
import EmployeeTable from '@/app/components/employees/EmployeeTable';
import { fetchEmployees } from '@/app/lib/api/employee';

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        console.log("Début de la récupération des employés...");
        const data = await fetchEmployees();

        // Transformation des données brutes en données compatibles avec EmployeeTable
        const transformedData = data.map((item: any) => ({
          id: item.id,
          name: `${item.first_name} ${item.last_name}`,
          first_name: item.first_name,
          last_name: item.last_name,
          gender: item.gender,
          date_of_birthday: item.date_of_birth,
          phone_number: item.phone_number,
          address: item.address,
          role: item.user?.username || 'N/A', // Rôle basé sur le champ username
          email: item.user?.email || 'N/A', // Email basé sur le champ user
          photo_url: item.photo_profil, // Utilisation de photo_profil comme photo_url
          status: 'Active', // Exemple de statut par défaut
        }));

        console.log("Données transformées :", transformedData);
        setEmployees(transformedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des employés :", err);
        setError("Erreur lors de la récupération des employés.");
      } finally {
        console.log("Fin de la récupération des employés.");
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  if (loading) {
    return <div>Chargement des employés...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="w-full bg-white">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Employees</h1>
      </div>
      <div className="mt-4 mb-4 flex items-center justify-between gap-2 md:mt-8">
        {/* Vous pouvez ajouter du contenu ici, comme des filtres ou des actions */}
      </div>
      <EmployeeTable employees={employees} />
    </div>
  );
}
