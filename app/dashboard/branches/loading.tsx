import TablePageSkeleton from '@/app/components/skeletons/TablePageSkeleton';

export default function BranchesLoading() {
  return (
    <TablePageSkeleton
      title="Succursales"
      subtitle="Gestion des agences, coordonnées et horaires d'ouverture"
      rowCount={6}
    />
  );
}
