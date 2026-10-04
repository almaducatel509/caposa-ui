// app/types/accounts.ts
export type AccountApiItem = {
  id: string;
  member_id: string;
  noCompte: string;
  typeCompte: string;
  account_status: string;
  dateOuverture: string;
  solde?: number;
};
