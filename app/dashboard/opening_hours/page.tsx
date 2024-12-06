'use client';

import React, { useEffect, useState } from 'react';
import { fetchOpeningHours } from '@/app/lib/api/opening_hour';  // Importer la fonction pour récupérer les données
import Hours_table from '@/app/components/OpeningHours/Hours_table';  // Importer le tableau d'affichage des horaires
import { OpeningHrs } from './columns';

export default function OpeningHoursPage() {
  const [openingHours, setOpeningHours] = useState<OpeningHrs[]>([]);  // État pour stocker les horaires d'ouverture
  const [loading, setLoading] = useState(true);  // Indicateur de chargement
  const [error, setError] = useState<string | null>(null);  // Pour stocker les erreurs potentielles

  // Appel à l'API pour récupérer les horaires d'ouverture dès le montage du composant
  useEffect(() => {
    const getOpeningHours = async () => {
      try {
        const data = await fetchOpeningHours();  // Appel de l'API
        console.log('Horaires d\'ouverture récupérés:', data);  // Affiche les données dans la console
        setOpeningHours(data);  // Mettre à jour l'état avec les données reçues
      } catch (error) {
        console.error('Erreur de récupération des horaires d\'ouverture:', error);
        setError('Erreur lors de la récupération des horaires d\'ouverture.');
      } finally {
        setLoading(false);  // Fin du chargement
      }
    };   

    getOpeningHours();  // Appel pour récupérer les données
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
          <h1 className="text-2xl">Opening Hours</h1>
        </div>
        <div className="mt-4 mb-4 flex items-center justify-between gap-2 md:mt-8">
          {/* D'autres éléments peuvent être ajoutés ici */}
        </div>

        {/* Passer les horaires d'ouverture au composant Hours_table */}
        <Hours_table openingHours={openingHours} />
      </div>
    );
}
