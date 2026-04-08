// app/lib/api/members.ts
import AxiosInstance from "@/app/lib/axiosInstance";
// use the types/helpers from your unified schema file


import type { MemberData } from "@/app/components/members/validations";

function mapApiMember(m: any): MemberData {
  let status: MemberData['status'] = 'inactif';
  if (m.status === true || m.status === 'true' || m.status === 'active' || m.status === 'actif') {
    status = 'actif';
  } else if (m.status === 'suspendu' || m.status === 'suspended') {
    status = 'suspendu';
  }

  return {
    ...m,
    status,
    id_member:        m.id_member ?? m.id ?? '',
    photo_profil:     m.photo_profil ?? m.photo_url ?? null,
    date_of_birthday: m.date_of_birthday ?? m.date_of_birth ?? '',
    department_code:  m.department_code ?? undefined,
  };
}

export const fetchMembers = async (): Promise<MemberData[]> => {
  try {
    const response = await AxiosInstance.get("/members/");
    return (response.data as any[]).map(mapApiMember);
  } catch (e) {
    console.error("Erreur récupération membres:", e);
    return [];
  }
};
// export const fetchMembers = async () => {
//   try {
//     const response = await AxiosInstance.get("/members/");
//     console.log("Réponse brute API :", response); // 👈 Affiche tout, headers inclus
//     console.log("Données membres :", response.data); // 👈 Affiche juste les données utiles
//     return response.data;
//   } catch (e) {
//     console.error("Erreur récupération membres:", e);
//     return [];
//   }
// };


function parseApiError(error: any, fallback = "Une erreur est survenue.") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data) {
    try { return JSON.stringify(error.response.data); } catch {}
  }
  return fallback;
}

/** CREATE — multipart (photo supported) */
export const createMember = async (fd: FormData) => {
  try {
    const { data } = await AxiosInstance.post("/members/", fd); // let browser set boundary
    return data;
  } catch (error: any) {
    console.error("❌ Create member error:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw new Error(parseApiError(error, "Impossible de créer le membre."));
  }
};

/** UPDATE — multipart (photo supported). Use PATCH or PUT per your API */
export const updateMember = async (id: string | number, fd: FormData) => {
  try {
    const { data } = await AxiosInstance.patch(`/members/${id}/`, fd);
    return data;
  } catch (error: any) {
    console.error("❌ Update member error:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw new Error(parseApiError(error, "Impossible de mettre à jour le membre."));
  }
};

export const deleteMember = async (id: string) => {
  try {
    const { data } = await AxiosInstance.delete(`/members/${id}/`);
    return data;
  } catch (error: any) {
    console.error("❌ Delete member error:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    throw new Error(parseApiError(error, "Impossible de supprimer le membre."));
  }
};
