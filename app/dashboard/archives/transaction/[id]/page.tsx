'use client';
import { useParams } from 'next/navigation';

export default function TransactionArchiveDetail() {
  const { id } = useParams();
  
  return (
    <div className="p-6">
      <h1>Détail Archive Transaction</h1>
      <p>Archive ID: {id}</p>
      {/* TODO: Créer composant ArchiveDetailTransaction */}
    </div>
  );
}