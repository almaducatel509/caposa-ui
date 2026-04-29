'use client';
import { useState } from 'react';
import { canOpenSessionNow } from '@/app/utils/sessionEligibility';
import { BranchData, Holiday, OpeningHour } from '@/app/components/branches/validations';

// ─── Fixtures : 4 branches couvrant tous les scénarios ─────────────

const BRANCH_ACTIVE: BranchData = {
  id: 'branch-1',
  branch_code: 'PAP-01',
  branch_name: 'Branche Active Normale',
  branch_address: 'Port-au-Prince',
  branch_phone_number: '509-1234',
  branch_email: 'pap@test.ht',
  statusBranche: 'active',
  department_code: 'OUEST',     
  city: 'Port-au-Prince',
  number_of_posts: 5,
  number_of_tellers: 2,
  number_of_clerks: 2,
  number_of_credit_officers: 1,
  opening_date: '2024-01-01',
  opening_hour: 'hours-1',
  holidays: ['holiday-1'],
  total_staff: 5,
  full_address: 'Port-au-Prince, Ouest',
};

const BRANCH_ARCHIVED: BranchData = {
  ...BRANCH_ACTIVE,
  id: 'branch-2',
  branch_name: 'Branche Archivée',
  statusBranche: 'archive',
};

const BRANCH_NOT_CONFIGURED: BranchData = {
  ...BRANCH_ACTIVE,
  id: 'branch-3',
  branch_name: 'Branche Non Configurée',
  opening_hour: undefined,
  holidays: [],
};

const HOURS_MOCK: OpeningHour = {
  id: 'hours-1',
  schedule: 'Lundi-Vendredi 08:00-17:00',
  // Ces champs dépendent de ton type réel — adapte selon ta structure
} as any;

const HOLIDAY_TODAY: Holiday = {
  id: 'holiday-1',
  date: new Date().toISOString().split('T')[0], // aujourd'hui
  description: 'Jour férié test',
};

const HOLIDAY_FUTURE: Holiday = {
  id: 'holiday-1',
  date: '2099-01-01',
  description: 'Jour férié futur',
};

// ─── Page de test ────────────────────────────────────────────────

export default function TestSessionPage() {
  const [results, setResults] = useState<Array<{scenario: string; result: any}>>([]);

  const runTests = () => {
    const now = new Date();
    const scenarios = [
      {
        name: '✅ Branche active + horaires + pas férié',
        branch: BRANCH_ACTIVE,
        hours: HOURS_MOCK,
        holidays: [HOLIDAY_FUTURE],
      },
      {
        name: '🚫 Branche archivée',
        branch: BRANCH_ARCHIVED,
        hours: HOURS_MOCK,
        holidays: [HOLIDAY_FUTURE],
      },
      {
        name: '🚫 Branche non configurée',
        branch: BRANCH_NOT_CONFIGURED,
        hours: HOURS_MOCK,
        holidays: [],
      },
      {
        name: '⚠️ Jour férié aujourd\'hui (override)',
        branch: BRANCH_ACTIVE,
        hours: HOURS_MOCK,
        holidays: [HOLIDAY_TODAY],
      },
    ];

    const res = scenarios.map(s => ({
      scenario: s.name,
      result: canOpenSessionNow(s.branch, now, s.hours, s.holidays),
    }));

    setResults(res);
    console.table(res.map(r => ({
      scenario: r.scenario,
      eligible: r.result.eligible,
      reason: r.result.reason,
      override: r.result.requiresOverride ?? false,
    })));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧪 Test sessionEligibility</h1>
      
      <button
        onClick={runTests}
        className="px-4 py-2 bg-[#2E7D32] text-white rounded-xl font-semibold mb-6"
      >
        Lancer les tests
      </button>

      <div className="space-y-3">
        {results.map((r, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-semibold mb-2">{r.scenario}</p>
            <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto">
              {JSON.stringify(r.result, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}