'use client';

import { useEffect, useState } from 'react';
import MemberGrid from '@/app/components/members/MemberGrid';
import { MemberData } from '@/app/components/members/validations';
import { fetchMembers } from '@/app/lib/api/members';

export default function Members() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMembers();
        setMembers(data);
      } catch (err) {
        console.error("❌ Erreur lors de la récupération des membres :", err);
        setError("Impossible de récupérer les données des membres.");
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);
  return <MemberGrid />;

}
