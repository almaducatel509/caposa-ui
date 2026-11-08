// ============================================
// 📁 app/accounts/page.tsx
// ============================================
'use client';
import AccountGrid from '@/app/components/accounts/AccountGrid';


export default function Accounts() {
  const handleExportReport = () => {
  };

  return (
    <main className="w-full min-h-screen bg-linear-to-br from-green-50 to-emerald-50">
      <div className="">
        <AccountGrid />
      </div>
    </main>
  );
}
