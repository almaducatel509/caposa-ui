import { TreasuryData } from "@/app/components/treasury/validation";

export async function fetchTreasuryData(): Promise<TreasuryData> {
  // 🧪 Mock temporaire
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalCash: 2547850.75,
        cashInVault: 1250000.00,
        cashInHand: 1297850.75,
        pendingReconciliation: 5,
        recentOperations: [
          {
            id: "1",
            type: "cash_in",
            amount: 50000,
            date: "2024-01-15",
            description: "Dépôt en espèces",
            performed_by: "Jean Dupont",
            status: "completed",
            member_id: "M001",
            account_number: "ACC123",
            employee_id: "EMP01",
            branch_id: "BR01",
          },
        ],
      });
    }, 800);
  });

  // 🔄 Migration future :
  // const res = await fetch('/api/treasury');
  // if (!res.ok) throw new Error("Erreur API");
  // return res.json();
}
