'use client';
// import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/components/search';
import {Holyday} from './columns';
import HolydayTable from '@/app/components/holydays/holydayTable';
import { fetchHolydays } from '@/app/lib/api/holyday';  // Importer la fonction pour récupérer les données
import { useState, useEffect } from 'react';

export default function Holydays(){
  const [hollydays, setHolidays] = useState<Holyday[]>([]);  // État pour stocker 
  const [loading, setLoading] = useState(true);  // Indicateur de chargement
  const [error, setError] = useState<string | null>(null);  // Pour stocker les erreurs potentielles

  // Appel à l'API pour récupérer les holiday dès le montage du composant
  useEffect(() => {
    const getHolidays = async () => {
      try {
        const data = await fetchHolydays();  // Appel de l'API
        console.log('Horaires d\'ouverture récupérés:', data);  // Affiche les données dans la console
        setHolidays(data);  // Mettre à jour l'état avec les données reçues
      } catch (error) {
        console.error('Erreur de récupération des horaires d\'ouverture:', error);
        setError('Erreur lors de la récupération des horaires d\'ouverture.');
      } finally {
        setLoading(false);  // Fin du chargement
      }
    };   

    getHolidays();  // Appel pour récupérer les données
  }, []);  // Le tableau vide [] garantit que la fonction se lance une seule fois lors du montage

  // Affichage d'un message de chargement tant que les données ne sont pas récupérées
  if (loading) {
    return <div>Loading...</div>;
  }

  // Affichage des erreurs si elles existent
  if (error) {
    return <div>{error}</div>;
  }
    return (
      <div className="w-full bg-white">
        <div className="flex w-full items-center justify-between">
          <h1 className={` text-2xl`}>Holydays</h1>
        </div>
        <div className="mt-4 mb-4 flex items-center justify-between gap-2 md:mt-8">
         {/* card */} 
        </div>
        <HolydayTable holydays={hollydays} />
      </div>
    )
  }