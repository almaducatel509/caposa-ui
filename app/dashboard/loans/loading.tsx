import TablePageSkeleton from '@/app/components/skeletons/TablePageSkeleton';

export default function LoansLoading() {
  return (
    <TablePageSkeleton
      title="Dossiers de Prêts"
      subtitle="Suivi des demandes de crédit, approbations et échéances"
      rowCount={8}
    />
  );
}
