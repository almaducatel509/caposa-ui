import TablePageSkeleton from '@/app/components/skeletons/TablePageSkeleton';

export default function TransactionsLoading() {
  return (
    <TablePageSkeleton
      title="Transactions"
      subtitle="Historique des dépôts, retraits et transferts"
      rowCount={8}
    />
  );
}
