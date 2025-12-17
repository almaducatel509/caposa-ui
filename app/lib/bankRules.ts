// 📋 RÈGLES MÉTIER BANCAIRES
// 🇭🇹 Configuration adaptée pour caisse populaire rurale en Haïti
// ⚠️ TEMPORAIRE : Sera remplacé par API (GET/PUT) plus tard

export interface AccountTypeRule {
  icon: string;
  title: string;
  description: string;
  minDeposit: number;
  maxDeposit?: number;
  minimumBalanceRequired?: number;
  interestRate: number;
  interestCalculation: 'none' | 'simple' | 'compound-monthly' | 'compound-daily';
  monthlyFees: number;
  freeWithdrawalsPerMonth?: number;
  feePerExtraWithdrawal?: number;
  withdrawalLimit?: number;
  lowBalanceFee?: number;
  termOptions?: number[];
  earlyWithdrawalPenalty?: string;
  features: string[];
  educationalNote?: string;
}

export interface BankRules {
  epargne: AccountTypeRule;
  cheques: AccountTypeRule;
  terme: AccountTypeRule;
}

export const BANK_RULES: BankRules = {
  epargne: {
    icon: "🐷",
    title: "Compte Épargne",
    description: "Idéal pour économiser petit à petit avec intérêts",
    minDeposit: 25,
    maxDeposit: undefined,
    minimumBalanceRequired: undefined,
    interestRate: 2.5,
    interestCalculation: "compound-monthly",
    monthlyFees: 0,
    freeWithdrawalsPerMonth: 4,
    feePerExtraWithdrawal: 10,
    lowBalanceFee: undefined,
    features: [
      "Intérêts composés mensuellement (2.5%)",
      "Aucun frais mensuel",
      "4 retraits gratuits par mois",
      "Frais de 10 HTG par retrait additionnel",
      "Accessible dès 25 HTG de dépôt initial"
    ],
    educationalNote: "💡 Conseil : Économiser régulièrement, même de petites sommes, permet de construire une réserve financière solide."
  },

  cheques: {
    icon: "💳",
    title: "Compte Chèques",
    description: "Pour gérer vos transactions quotidiennes facilement",
    minDeposit: 100,
    maxDeposit: undefined,
    minimumBalanceRequired: 100,
    interestRate: 0,
    interestCalculation: "none",
    monthlyFees: 15,
    withdrawalLimit: 500,
    freeWithdrawalsPerMonth: 999,
    lowBalanceFee: 25,
    features: [
      "Transactions illimitées",
      "Carte de retrait incluse",
      "Frais mensuels réduits : 15 HTG",
      "Limite de retrait quotidien : 500 HTG",
      "Frais de 25 HTG si solde < 100 HTG"
    ],
    educationalNote: "💡 Conseil : Maintenez un solde minimum de 100 HTG pour éviter les frais additionnels."
  },

  terme: {
    icon: "📈",
    title: "Compte à Terme (CPG)",
    description: "Placement sécurisé avec taux garanti et rendement élevé",
    minDeposit: 500,
    maxDeposit: undefined,
    minimumBalanceRequired: undefined,
    interestRate: 4.5,
    interestCalculation: "compound-monthly",
    monthlyFees: 0,
    termOptions: [6, 12, 18, 24],
    earlyWithdrawalPenalty: "Perte de 50% des intérêts accumulés",
    features: [
      "Taux d'intérêt fixe garanti : 4.5%",
      "Durées disponibles : 6, 12, 18 ou 24 mois",
      "Aucun frais mensuel",
      "Idéal pour objectifs à moyen terme",
      "Pénalité en cas de retrait anticipé"
    ],
    educationalNote: "💡 Conseil : Ce compte est idéal pour épargner en vue d'un projet important (éducation, agriculture, commerce)."
  }
};

// ========= UTILITAIRES =========

export function getRulesForAccountType(type: keyof BankRules): AccountTypeRule {
  return BANK_RULES[type];
}

export function validateDepositAmount(
  type: keyof BankRules,
  amount: number
): { valid: boolean; error?: string } {
  const rules = BANK_RULES[type];

  if (amount < rules.minDeposit) {
    return {
      valid: false,
      error: `Le dépôt minimum pour ${rules.title} est de ${rules.minDeposit} HTG`
    };
  }

  if (rules.maxDeposit && amount > rules.maxDeposit) {
    return {
      valid: false,
      error: `Le dépôt maximum est de ${rules.maxDeposit} HTG`
    };
  }

  return { valid: true };
}

export function getAllRules(): BankRules {
  return BANK_RULES;
}

// Fonction pour formater les montants en HTG
export function formatHTG(amount: number): string {
  return `${amount.toLocaleString('fr-HT')} HTG`;
}

// TODO: Migration API
/*
export async function fetchBankRules(): Promise<BankRules> {
  const response = await fetch('/api/bank-rules');
  return response.json();
}

export async function updateBankRules(rules: BankRules): Promise<void> {
  await fetch('/api/bank-rules', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rules)
  });
}
*/

// TODO: Migration API
/*
export async function fetchBankRules(): Promise<BankRules> {
  const response = await fetch('/api/bank-rules');
  return response.json();
}

export async function updateBankRules(rules: BankRules): Promise<void> {
  await fetch('/api/bank-rules', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rules)
  });
}
  Pour une caisse populaire rurale en Haïti :

Garde les règles simples et accessibles.

Présente-les avec un design pro et clair.

Prépare ton code pour évoluer vers une API (BRH ou CNC).

Ajoute une touche éducative et esthétique → ça différencie ton appli et inspire confiance.
*/