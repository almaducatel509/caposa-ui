// app/config.ts ou lib/config.ts
"use server";

import { signIn } from "@/auth";
import { DeleteProps, Token } from "@/types/data";
import axios from "axios";
import { getCookie, setCookie } from 'cookies-next/server';
import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { deleteCookie } from "cookies-next/server";
import { cookies } from "next/headers";


type CredentialsError = Error & { type?: string };

export async function authenticate(
  _prev: string | undefined,
  formData: FormData
) {
  try {
    const redirectTo = (formData.get("redirectTo") as string) ?? "/dashboard";
    // NextAuth will set the session and redirect server-side
    await signIn("credentials", formData, { redirectTo });  
  }catch (error) {
    const e = error as CredentialsError;
    if (e?.type === "CredentialsSignin") return "Invalid credentials.";
    throw error;
  }
}

export const findByUsernameOrEmail = async (username: string) => {
  try {
    const resp = await axios.get(
      `${process.env.BASE_URL}users/find-user/?search=${username}`
    );

    return {
      success: true,
      details: resp.data,
    };
  } catch (error) {
    return {
      success: false,
      details: error,
    };
  }
};
export const loginUser = async (username: string, password: string) => {
  console.log("loginUser called with:", username, password)
  try {
    const resp = await axios.post(`${process.env.BASE_URL}token/`, {
      username,
      password,
    });


    const token: Token = resp.data;
    console.log(resp.data);
    await setCookie(`${process.env.TOKEN_NAME}`, token.access, {cookies});
    await setCookie(`${process.env.REFRESH_TOKEN}`, token.refresh, {cookies});
    await setCookie("roles", JSON.stringify(token.roles), {cookies});

    return {
      success: true,
      details: resp.data,
    };
  } catch (error) {
    console.log("Error in loginUser:", error);
    return {
      success: false,
      details: error,
    };
  }
};

// export const me = async (accessToken?: string) => {
//   try {
//     const token = accessToken ?? await getCookie(`${process.env.TOKEN_NAME}`, { cookies });
//     if (!token) return { success: false, message: "No token found" };

//     const resp = await axios.get(`${process.env.BASE_URL}users/me/`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//      if (resp.status === 200) {
//       return { success: true, ...resp.data };
//     }
//     return { success: false };
//   } catch (e) {
//     console.log(e);
//     return { success: false };
//   }
// };


export const getToken = async () => {

  const token = await getCookie(`${process.env.TOKEN_NAME}`, {cookies});
  return token;
};

export const deleteMultiple = async (
  ids: number[],
  key: string,
  path: string
): Promise<DeleteProps> => {
  const token = await getToken();
  try {
    const answer = await axios.delete(
      `${process.env.BASE_URL}${path}/delete-multiple/`,
      {
        data: { [key]: ids },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (answer.status === 200) {
      console.log(answer.status);
      revalidatePath(`/dashboard/${path}`);
      return {
        status: 200,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      status: 500,
    };
  }

  return {
    status: 400,
  };
};

export const massImport = async (
  formData: FormData,
  path_redirect: string,
  path: string
) => {
  const token = await getToken();

  try {
    const resp = await axios.post(`${process.env.BASE_URL}${path}/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    revalidatePath(`/dashboard/${path_redirect}`);
    console.log(resp);
    return {
      data: resp.data,
      status: 201,
    };
  } catch (error) {
    console.log(error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return {
          status: 401,
          data: error.response.data,
        };
      } else if (error.response?.status === 400) {
        return {
          status: 400,
          data: error.response.data,
        };
      } else {
        return {
          status: 500,
          data: error.response?.data,
        };
      }
    } else {
      console.log("Unexpected error:", error);
      return {
        status: 500,
        data: error,
      };
    }
  }
};



/**
 * Déconnexion complète : 
 * - Supprime les tokens JWT backend
 * - Termine la session NextAuth
 */
export async function logout() {
  try {
    // 1. Supprimer les cookies de tokens backend
    await deleteCookie(`${process.env.TOKEN_NAME}`, { cookies });
    await deleteCookie(`${process.env.REFRESH_TOKEN}`, { cookies });
    
    // 2. Déconnecter de NextAuth (supprime le cookie de session NextAuth)
    await signOut({ redirect: true, redirectTo: "/login" });
    
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error };
  }
}

/**
 * Vérifier si l'utilisateur est authentifié
 * en vérifiant à la fois NextAuth ET les tokens backend
 */
export async function isAuthenticated() {
  const { auth } = await import("@/auth");
  const session = await auth();
  
  if (!session?.user) {
    return false;
  }
  
  // Vérifier aussi que le token backend existe
  const { getCookie } = await import("cookies-next/server");
  const backendToken = await getCookie(
    `${process.env.TOKEN_NAME}`, 
    { cookies }
  );
  
  return !!backendToken;
}