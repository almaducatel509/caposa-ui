// app/dashboard/rapports/endettement/page.tsx
'use client';

import { generateKpiData } from '@/app/lib/mockKpiData';
import RapportEndettement from '@/app/components/rapport/RapportEndettement';
import { useSearchParams, useRouter } from 'next/navigation';
export default function Page() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const periode      = searchParams.get('periode') ?? 'Janvier 2026';
  // TODO: si id présent → GET /api/rapports/:id pour récupérer snapshot figé
  const data = generateKpiData(periode);

  return (
    <main className="min-h-screen bg-[#F9F9F6] p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <RapportEndettement
          data={data}
          onRetour={() => router.push('/dashboard/rapports')}
          objectif="Prévention surendettement et conformité BRH"
          periodeAnalysee={periode}
        />
      </div>
    </main>
  );
}