// app/dashboard/rapports/conformite/page.tsx
'use client';

import { generateKpiData } from '@/app/lib/mockKpiData';
import RapportConformite from '@/app/components/rapport/RapportConformite';
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
        <RapportConformite
          data={data}
          onRetour={() => router.push('/dashboard/rapports')}
          objectif="Synthèse réglementaire mensuelle BRH"
          periodeAnalysee={periode}
        />
      </div>
    </main>
  );
}