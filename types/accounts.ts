// app/types/accounts.ts
export type AccountApiItem = {
  id: string;
  member_id: string;
  noCompte: string;
  typeCompte: string;
  statutCompte: string;
  dateOuverture: string;
  solde?: number;
};
