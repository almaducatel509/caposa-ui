'use client';
import React, { useEffect, useState } from 'react';
import { fetchOpeningHours } from '@/app/lib/api/opening_hour';  
import Hours_table from '@/app/components/OpeningHours/Hours_table';  
import { OpeningHrs } from './columns';
import { Card, CardBody, CardFooter, CardHeader } from '@nextui-org/react';
import { FiEdit2 } from "react-icons/fi";
import { GoTrash } from "react-icons/go";
import { LuPrinter } from "react-icons/lu";


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
  const handleEdit = (dayKey: string) => {
    console.log("Modifier", dayKey);
    // Ouvre un modal ou affiche un input par exemple
  };
  return (
    <div className="w-full p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center text-gray-800">Opening Hours</h1>
      <Hours_table hourtable={openingHours} />
    </div>
  );
  
}
