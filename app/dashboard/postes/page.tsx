'use client';

import React, { useEffect, useState } from 'react';
import { Post } from './columns';
import { fetchPosts } from '@/app/lib/api/post';
import PostTable from '@/app/components/postes/PostTable';

export default function PostPage() {
  const [postes, setPostes] = useState<Post[]>([]);  // État pour stocker les postes
  const [loading, setLoading] = useState(true);  // Indicateur de chargement
  const [error, setError] = useState<string | null>(null);  // Pour stocker les erreurs potentielles
  const [isClient, setIsClient] = useState(false);  // Flag pour vérifier si on est côté client

  // Assurez-vous que tout le code dépendant de la fenêtre (client) s'exécute uniquement côté client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true); // Si on est côté client, définir isClient à true
    }
  }, []);
  
  useEffect(() => {
    if (isClient) {
      const getPostes = async () => {
        try {
          const data = await fetchPosts();  // Appel de l'API
          console.log('Posts récupérés:', data);
          setPostes(data);  // Mettre à jour l'état avec les données reçues
        } catch (error) {
          console.error('Erreur de récupération des posts:', error);
          setError('Erreur lors de la récupération des posts.');
        } finally {
          setLoading(false);  // Fin du chargement
        }
      };
      getPostes();
    }
  }, [isClient]);  // L'appel de l'API se fait une fois que le client est monté

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
        <h1 className="text-2xl">Postes</h1>
      </div>
      <div className="mt-4 mb-4 flex items-center justify-between gap-2 md:mt-8">
        {/* D'autres éléments peuvent être ajoutés ici */}
      </div>
      <PostTable postes={postes} />
    </div>
  );
}
