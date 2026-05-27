// utils/employee.ts
import type { EmployeeData } from '@/app/components/employees/validations';

export const getFullName = (emp?: EmployeeData): string => {
  if (!emp) return '—';
  return emp.nomComplet ?? `${emp.first_name} ${emp.last_name}`.trim();
};

export const getInitials = (emp?: EmployeeData): string => {
  if (!emp) return '?';
  return `${emp.first_name?.[0] ?? ''}${emp.last_name?.[0] ?? ''}`.toUpperCase();
};