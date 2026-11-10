import TablePageSkeleton from '@/app/components/skeletons/TablePageSkeleton';

export default function MembersLoading() {
  return (
    <TablePageSkeleton
      title="Gestion des Membres"
      subtitle="Répertoire et statut des sociétaires de la caisse"
      rowCount={8}
    />
  );
}
