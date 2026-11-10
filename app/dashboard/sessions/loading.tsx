import TablePageSkeleton from '@/app/components/skeletons/TablePageSkeleton';

export default function SessionsLoading() {
  return (
    <TablePageSkeleton
      title="Sessions de Caisse"
      subtitle="Supervision des sessions actives, montants théoriques et clôtures"
      rowCount={8}
    />
  );
}
