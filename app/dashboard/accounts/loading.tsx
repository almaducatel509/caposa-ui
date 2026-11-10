import TablePageSkeleton from '@/app/components/skeletons/TablePageSkeleton';

export default function AccountsLoading() {
  return (
    <TablePageSkeleton
      title="Comptes Bancaires"
      subtitle="Gestion des comptes d'épargne, courants et soldes"
      rowCount={8}
    />
  );
}
