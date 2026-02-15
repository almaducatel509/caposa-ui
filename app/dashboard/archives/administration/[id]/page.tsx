'use client';
import { useParams } from 'next/navigation';

export default function AdministrativeArchiveDetail() {
  const { id } = useParams();
  
  return (
    <div className="p-6">
      <h1>Détail Archive Administrative</h1>
      <p>Archive ID: {id}</p>
      {/* TODO: Créer composant ArchiveDetailAdministrative */}
    </div>
  );
}