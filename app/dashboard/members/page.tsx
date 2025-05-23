'use client';
import React, { useEffect, useState } from 'react';
import { Member } from './columns';
import MemberTable from '@/app/components/members/MemberTable';
import { fetchMembers } from '@/app/lib/api/member';

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        console.log("Début de la récupération des membres...");
        const data = await fetchMembers();

        const transformedData = data.map((item: any) => ({
          first_name: item.first_name,
          last_name: item.last_name,
          email: item.email,
          photo_url: item.photo_url ?? '/default-avatar.png',
          current_balance: item.current_balance ?? "0",
          status: item.status ?? "active",
        }));

        console.log("Membres transformés :", transformedData);
        setMembers(transformedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des membres :", err);
        setError("Erreur lors de la récupération des membres.");
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  if (loading) {
    return <div className='font-normal'>Chargement des membres...</div>;
  }

  if (error) {
    return <div className='font-normal'>{error}</div>;
  }

  return (
    <div className="w-full bg-white">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Members</h1>
      </div>
      <div className="mt-4 mb-4 flex items-center justify-between gap-2 md:mt-8">
        {/* Ajoutez ici des filtres ou boutons si nécessaire */}
      </div>
      <MemberTable users={members} />
    </div>
  );
}
