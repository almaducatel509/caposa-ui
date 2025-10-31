// app/lib/api/membersWithCache.ts
import AxiosInstance from "@/app/lib/axiosInstance";
import type { MemberData } from "@/app/components/members/member.schema";

const memberCache = new Map<string, MemberData | null>();

export const fetchMemberById = async (id: string): Promise<MemberData | null> => {
  if (memberCache.has(id)) {
    return memberCache.get(id) ?? null;
  }
  try {
    const { data } = await AxiosInstance.get(`/members/${id}/`);
    memberCache.set(id, data);
    return data;
  } catch (e) {
    console.warn("fetchMemberById error:", e);
    memberCache.set(id, null);
    return null;
  }
};

/** Vérifie rapidement si membre existe (réutilisable) */
export const verifyMemberExists = async (idOrIdNumber: string): Promise<MemberData | null> => {
  // si c'est un id numérique/uuid -> fetch membre par id
  // sinon on peut faire une recherche par id_number -> /members/?id_number=...
  // ici on essaye d'abord fetch by id:
  const byId = await fetchMemberById(idOrIdNumber);
  if (byId) return byId;

  // fallback: essayer par id_number via query
  try {
    const { data } = await AxiosInstance.get(`/members/?id_number=${encodeURIComponent(idOrIdNumber)}`);
    if (Array.isArray(data) && data.length > 0) {
      const found = data[0];
      memberCache.set(found.id, found);
      return found;
    }
  } catch (e) {
    console.warn("verifyMemberExists fallback search error:", e);
  }

  return null;
};
