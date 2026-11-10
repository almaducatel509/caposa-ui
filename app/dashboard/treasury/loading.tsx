import TablePageSkeleton from '@/app/components/skeletons/TablePageSkeleton';

export default function TreasuryLoading() {
  return (
    <TablePageSkeleton
      title="Gestion de Trésorerie"
      subtitle="Remises de caisse, coffre-fort et réconciliations financières"
      rowCount={8}
    />
  );
}
