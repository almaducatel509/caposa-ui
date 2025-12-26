import { BranchData } from "./types";

export const SAMPLE_BRANCHES: BranchData[] = [
  {
    id: "1",
    branch_code: "PAP001",
    branch_name: "Port-au-Prince Centre",
    branch_address: "123 Rue Pavée, Port-au-Prince",
    branch_phone_number: "(509) 2222-1234",
    branch_email: "pap.centre@bank.ht",
    status: "active",
    department_code: "OUEST",
    city: "Port-au-Prince",
    opening_hour: "sch1",
    opening_hour_details: {
      id: "sch1",
      monday: "08:00 - 17:00",
      tuesday: "08:00 - 17:00",
      wednesday: "08:00 - 17:00",
      thursday: "08:00 - 17:00",
      friday: "08:00 - 16:00",
      saturday: "09:00 - 13:00",
      sunday: null,
    },
  },
  {
    id: "2",
    branch_code: "CAP001",
    branch_name: "Cap-Haïtien Nord",
    branch_address: "45 Boulevard du Cap",
    branch_phone_number: "(509) 2262-5678",
    branch_email: "cap.nord@bank.ht",
    status: "active",
    department_code: "NORD",
    city: "Cap-Haïtien",
  },
];
