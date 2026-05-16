// bankConfig.ts

export type AccountType =
  | "savings"
  | "checking"
  | "term";

export interface BankAccountPolicy {
  label: string;
  description: string;

  min_deposit: number;

  interest_rate: number; // en %
  interest_mode: "simple" | "compound";

  monthly_fee: number;

  withdrawal_limit?: number;
}

export const bankConfig: Record<AccountType, BankAccountPolicy> = {
  savings: {
    label: "Compte Épargne",
    description: "Idéal pour économiser petit à petit avec intérêts",

    min_deposit: 25,

    interest_rate: 2.5,
    interest_mode: "compound",

    monthly_fee: 0,
  },

  checking: {
    label: "Compte Chèques",
    description: "Pour gérer vos transactions quotidiennes facilement",

    min_deposit: 100,

    interest_rate: 0,
    interest_mode: "simple",

    monthly_fee: 15,
  },

  term: {
    label: "Compte à Terme (CPG)",
    description: "Placement sécurisé avec taux garanti",

    min_deposit: 500,

    interest_rate: 4.5,
    interest_mode: "compound",

    monthly_fee: 0,
  },
};
// bankConfig.helpers.ts


export function getAccountPolicy(type: AccountType) {
  return bankConfig[type];
}

export function calculateMonthlyInterest(
  type: AccountType,
  balance: number
) {
  const policy = bankConfig[type];

  const rate = policy.interest_rate / 100;

  if (policy.interest_mode === "compound") {
    return balance * rate / 12;
  }

  return balance * rate / 12;
}