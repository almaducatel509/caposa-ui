'use client';

import { useEffect, useState } from 'react';
import EmployeeGrid from '@/app/components/employees/EmployeeGrid';
import { EmployeeData } from '@/app/components/employees/validations';
import { fetchEmployees } from '@/app/lib/api/employee';

export default function EmployeePage() {
  return (
    <EmployeeGrid />
  );
}
