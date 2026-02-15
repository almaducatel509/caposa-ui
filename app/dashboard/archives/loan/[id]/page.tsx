'use client';
import { useParams } from 'next/navigation';

export default function LoanArchiveDetail() {
  const { id } = useParams();
  
  return (
    <div className="p-6">
      <h1>Détail Archive Prêt</h1>
      <p>Archive ID: {id}</p>
      {/* TODO: Créer composant ArchiveDetailLoan */}
    </div>
  );
}