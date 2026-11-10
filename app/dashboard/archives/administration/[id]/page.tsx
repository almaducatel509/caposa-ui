import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Archive - Administration",
  description: "Détails de l'archive administrative",
};

export default async function AdministrativeArchiveDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Détail Archive Administrative</h1>
      <p className="text-gray-600 mt-2">Archive ID: {id}</p>
    </div>
  );
}
