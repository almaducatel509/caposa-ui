// FILE: src/types/autocomplete.types.ts
// ============================================
export interface MemberData {
  id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  email?: string;
  phone_number?: string;
}

export interface EmployeeData {
  id: string;
  first_name: string;
  last_name: string;
  user?: {
    username: string;
    email: string;
  };
  branch?: string;
  posts?: string[];
}

export interface CompteData {
  id: string;
  no_compte: string;
  type_compte: 'epargne' | 'cheques' | 'terme';
  solde_actuel: number;
  statut_compte: 'actif' | 'ferme' | 'suspendu';
  id_membre?: string;
}

export interface BranchData {
  id: string;
  name: string;
  address: string;
  phone_number?: string;
  email?: string;
}

export interface BaseAutocompleteProps {
  selectedKey: string;
  onSelectionChange: (key: string) => void;
  errorMessage?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  className?: string;
}