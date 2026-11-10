import TablePageSkeleton from '@/app/components/skeletons/TablePageSkeleton';

export default function EmployeesLoading() {
  return (
    <TablePageSkeleton
      title="Gestion des Employés"
      subtitle="Consultez et gérez les employés, postes et statuts"
      rowCount={8}
    />
  );
}
