'use client';

import { useEffect, useState } from 'react';
import EmployeeGrid from '@/app/components/employees/EmployeeGrid';
import { EmployeeData } from '@/app/components/employees/validations';
import { fetchEmployees } from '@/app/lib/api/employee';

export default function EmployeePage() {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEmployees();
        setEmployees(data);
      } catch (err) {
        console.error("❌ Erreur lors de la récupération des membres :", err);
        setError("Impossible de récupérer les données des membres.");
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  return (
    <EmployeeGrid />
  );
}
