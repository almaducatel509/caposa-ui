//app\lib\actions.ts
"use server";

import { signIn } from "@/auth";
import { DeleteProps, Token } from "@/types/data";
import axios from "axios";
import { getCookie, setCookie } from 'cookies-next/server';
import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { cookies } from "next/headers";
import { createLogger } from "./logger";

const log = createLogger("ServerActions");

const ACCESS_COOKIE = process.env.TOKEN_NAME || process.env.NEXT_PUBLIC_TOKEN_NAME || "auth_token";
const REFRESH_COOKIE = process.env.REFRESH_TOKEN || process.env.NEXT_PUBLIC_REFRESH_TOKEN || "refresh_token";

type CredentialsError = Error & { type?: string };

export async function authenticate(
  _prev: string | undefined,
  formData: FormData
) {
  try {
    const redirectTo = (formData.get("redirectTo") as string) ?? "/dashboard";
    // NextAuth will set the session and redirect server-side
    await signIn("credentials", formData, { redirectTo });  
  } catch (error) {
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
    log.error("Erreur lors de findByUsernameOrEmail:", error);
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
    await setCookie(ACCESS_COOKIE, token.access, { cookies, path: "/", maxAge: 60 * 60 * 24 });
    await setCookie(REFRESH_COOKIE, token.refresh, { cookies, path: "/", maxAge: 60 * 60 * 24 * 30 });
    await setCookie("roles", JSON.stringify(token.roles), { cookies, path: "/", maxAge: 60 * 60 * 24 * 30 });

    log.info(`Connexion réussie pour l'utilisateur : ${username}`);

    return {
      success: true,
      details: resp.data,
    };
  } catch (error) {
    log.warn(`Échec de connexion pour l'utilisateur : ${username}`, axios.isAxiosError(error) ? error.response?.status : error);
    return {
      success: false,
      details: error,
    };
  }
};

export const getToken = async () => {
  const token = await getCookie(ACCESS_COOKIE, { cookies });
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
      revalidatePath(`/dashboard/${path}`);
      return {
        status: 200,
      };
    }
  } catch (error) {
    log.error(`Erreur deleteMultiple sur ${path}:`, error);
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
    return {
      data: resp.data,
      status: 201,
    };
  } catch (error) {
    log.error(`Erreur massImport sur ${path}:`, error);
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
  log.info("Processus de déconnexion globale initié");
  const access  = tokens?.access  ?? (await getCookie(ACCESS_COOKIE, { cookies }));
  const refresh = tokens?.refresh ?? (await getCookie(REFRESH_COOKIE, { cookies }));

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
        } catch {
          log.warn("Impossible d'invalider le refresh token côté serveur, poursuite de la déconnexion locale");
        }
      }
    }
  }

  // 2. Cookies : API native de Next.js (plus fiable que cookies-next dans une action serveur)
  const store = await cookies();
  const allAuthCookies = [
    ACCESS_COOKIE,
    REFRESH_COOKIE,
    "roles",
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.csrf-token",
    "__Host-authjs.csrf-token",
    "authjs.callback-url",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "next-auth.callback-url",
  ];
  for (const name of allAuthCookies) {
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
    ACCESS_COOKIE, 
    { cookies }
  );
  
  return !!backendToken;
}
