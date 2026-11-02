//app\lib\actions.ts
"use server";

import { signIn } from "@/auth";
import { DeleteProps, Token } from "@/types/data";
import axios from "axios";
import { getCookie, setCookie } from 'cookies-next/server';
import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
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
  // Ne JAMAIS journaliser le mot de passe ni les jetons : ces logs serveur sont conservés en clair.
  try {
    const resp = await axios.post(`${process.env.BASE_URL}auth/login/`, {
      username,
      password,
    });


    const token: Token = resp.data;
    await setCookie(`${process.env.TOKEN_NAME}`, token.access, {cookies});
    await setCookie(`${process.env.REFRESH_TOKEN}`, token.refresh, {cookies});
    await setCookie("roles", JSON.stringify(token.roles), {cookies});

    return {
      success: true,
      details: resp.data,
    };
  } catch (error) {
    console.log("Error in loginUser:", axios.isAxiosError(error) ? error.response?.status : error);
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
 * 1. Invalide le refresh token côté Django (liste noire : il ne pourra plus
 *    servir à obtenir de nouveaux jetons, même s'il a été copié)
 * 2. Supprime les cookies de jetons et de rôles du navigateur
 * 3. Termine la session NextAuth et renvoie vers /login
 *
 * Un échec à l'étape 1 (serveur injoignable) n'empêche pas la déconnexion
 * locale : on supprime toujours les cookies.
 */
export async function logout(tokens?: { access?: string; refresh?: string }) {
  // Le navigateur supprime ses cookies avant d'appeler cette action et nous
  // transmet les jetons : on les prend en priorité, sinon on lit les cookies.
  const access  = tokens?.access  ?? (await getCookie(`${process.env.TOKEN_NAME}`, { cookies }));
  const refresh = tokens?.refresh ?? (await getCookie(`${process.env.REFRESH_TOKEN}`, { cookies }));

  // 1. Liste noire du refresh token (POST /auth/logout/ — utils/views.py AuthLogoutView).
  //    La vue exige un jeton d'accès valide (IsAuthenticated). Après plus de 30 min
  //    d'inactivité, il a expiré : on en obtient un neuf avec le refresh, puis on réessaie.
  if (refresh) {
    const callLogout = (accessToken?: string) =>
      axios.post(
        `${process.env.BASE_URL}auth/logout/`,
        { refresh },
        { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}, timeout: 5000 },
      );

    try {
      await callLogout(access ?? undefined);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        try {
          const { data } = await axios.post(
            `${process.env.BASE_URL}auth/refresh/`,
            { refresh },
            { timeout: 5000 },
          );
          await callLogout(data.access);
        } catch (retryError) {
          console.warn("Logout: refresh token non invalidé côté serveur",
            axios.isAxiosError(retryError) ? retryError.response?.status : retryError);
        }
      } else {
        console.warn("Logout: refresh token non invalidé côté serveur",
          axios.isAxiosError(error) ? error.response?.status : error);
      }
    }
  }

  // 2. Cookies : API native de Next.js (plus fiable que cookies-next dans une action serveur)
  const store = await cookies();
  for (const name of [process.env.TOKEN_NAME, process.env.REFRESH_TOKEN, "roles"]) {
    if (name) store.delete(name);
  }

  // 3. Session NextAuth (lève une redirection vers /login : ne pas l'attraper)
  await signOut({ redirect: true, redirectTo: "/login" });
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