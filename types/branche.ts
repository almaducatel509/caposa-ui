// types/branche.ts

import { Holiday } from "@/app/components/holidays/validations";
import { DepartmentCode } from "@/app/data/haitiLocations";
import { OpeningHourDetail } from "@/app/components/OpeningHours/validations";

// ─────────────────────────────────────────────────────────────────────────────
// MODIFICATIONS apportées à ce fichier :
//
// 1. SUPPRIMÉ : `name: any`
//    Champ résiduel d'un ancien refactor, redondant avec `branch_name`
//    et désactivait TypeScript sur ce champ (à cause du `any`).
//
// 2. NETTOYÉ : commentaire de chemin Windows en haut du fichier supprimé.
//
// 3. CHANGÉ : `opening_hour_details?: OpeningHour` → `OpeningHourDetail`
//    `OpeningHour` (avec `schedule: string` compact) ne permet pas d'itérer
//    jour par jour comme le fait `BranchScheduleDisplay`. Le bon type pour
//    les détails complets retournés par l'API est `OpeningHourDetail`
//    (champs `monday`, `tuesday`, ..., `sunday`).
//
//    ⚠ Le backend doit s'aligner sur ce contrat :
//      GET /branches/{id}/ doit renvoyer `opening_hour_details` au format
//      jour-par-jour, pas en string compacte.
// ─────────────────────────────────────────────────────────────────────────────

export interface OpeningHour {
  id: string;
  name?: string;        // pour l'afficher dans le message
  schedule: string;
  is_default: boolean;  // ← le flag clé
}

export interface Branch {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_address: string;
  branch_phone_number: string;
  branch_email: string;
  statusBranche: "active" | "inactive" | "archive";
  department_code: DepartmentCode;
  city: string;
  opening_date: string;
  opening_hour: string;
  holidays?: string[];
  opening_hour_details?: OpeningHourDetail;
  holidays_details?: Holiday[];
  created_at?: string;
  updated_at?: string;
  total_staff: number;
  full_address: string;
  status?:string;
  number_of_posts: 0,           // ← ajouté
  number_of_tellers: 0,         // ← ajouté
  number_of_clerks: 0,          // ← ajouté
  number_of_credit_officers: 0, // ← ajouté
}