# Compte rendu – Intégration Auth (Django + NextAuth) 

_Date :_ aujourd’hui

## ✅ Ce qu’on a accompli

### 1) Backend (Django/DRF + SimpleJWT)
- **SIMPLE_JWT** configuré pour utiliser `username` comme identifiant (`USER_ID_FIELD` / `USER_ID_CLAIM`).
- Endpoints confirmés et testés via Postman :
  - `POST /api/token/` → renvoie `{ refresh, access }`.
  - `POST /api/token/refresh/` → renvoie `{ access }`.
  - Ressources protégées (ex. `/api/branches/`, `/api/employees/`) accessibles avec le header `Authorization: Bearer <access>`.
- **Postman** :
  - OK : génération des tokens avec `username + password`.
  - OK : appel des endpoints avec l’en-tête **Authorization** correct.
  - Erreurs 401 “token_not_valid” diagnostiquées et corrigées (utilisation du bon token **access**).

### 2) Frontend (Next.js App Router + NextAuth v5)
- Création de `app/api/auth/[...nextauth]/route.ts` pour exposer automatiquement les handlers NextAuth :
  ```ts
  // app/api/auth/[...nextauth]/route.ts
  export { handlers as GET, handlers as POST } from "../../../../auth";
  // (ou) export { handlers as GET, handlers as POST } from "@/auth";
  ```
- **Fichier `auth.ts`** (NextAuth) avec provider Credentials et décodage du JWT `access` pour construire l’objet `user`.
- **LoginForm** : passage du champ `redirectTo` (à la place de `callbackUrl`) pour redirection après login.
- **Server action `authenticate`** : appel à `signIn("credentials", formData, { redirectTo })` pour redirection serveur vers `/dashboard`.
- **Guard côté serveur** sur le layout du dashboard (pas besoin de guard client) :
  ```ts
  import { auth } from "@/auth";
  import { redirect } from "next/navigation";
  
  export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session?.user) redirect("/login?callbackUrl=/dashboard");
    return <>{children}</>;
  }
  ```
- **Page /login** : redirection automatique vers `/dashboard` si déjà connecté :
  ```ts
  import { auth } from "@/auth";
  import { redirect } from "next/navigation";
  export default async function Page() {
    const session = await auth();
    if (session?.user) redirect("/dashboard");
    return <LoginForm />;
  }
  ```

### 3) Axios + Injection du token + Refresh auto
- **Intercepteur request** qui injecte toujours l’`access` depuis le cookie (`TOKEN_NAME / auth_token`) :
  ```ts
  import { getCookie } from "cookies-next";
  const ACCESS_COOKIE = process.env.TOKEN_NAME || "auth_token";
  AxiosInstance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const access = getCookie(ACCESS_COOKIE) as string | undefined;
      if (access) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${access}`;
      }
    }
    return config;
  });
  ```
- **Intercepteur response** pour rafraîchir automatiquement l’`access` sur 401 `token_not_valid` via `POST /api/token/refresh/` et rejouer la requête. (Ajouté et commenté.)

### 4) State final / Résultat
- Connexion depuis le front **fonctionnelle** → redirige vers **/dashboard**.
- Les pages du dashboard sont **protégées** (auth requise).
- Les données sécurisées (Employés, Branches, Postes, etc.) s’affichent correctement.
- Les erreurs “403 identitytoolkit.googleapis.com” identifiées comme **bruit d’une extension de navigateur** (sans impact).

## ⚙️ Fichiers clés modifiés/ajoutés
- `auth.ts` (NextAuth – provider Credentials)
- `app/api/auth/[...nextauth]/route.ts`
- `app/login/LoginForm.tsx` (champ `redirectTo`)
- `app/lib/actions.ts` (`authenticate` → `signIn(..., { redirectTo })`)
- `app/(dashboard)/layout.tsx` (guard serveur avec `auth()`)
- `app/lib/axiosInstance.ts` (intercepteurs + refresh auto)

## 🔐 .env.local (rappels utilisés)
```
NEXT_PUBLIC_BASE_ROUTE=http://localhost:8000/api/
BASE_URL=http://localhost:8000/api/
TOKEN_NAME=auth_token
REFRESH_TOKEN=refresh_token
NEXT_PUBLIC_APP_DOMAIN=localhost
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=... (obligatoire)
```
> `NEXTAUTH_SECRET` doit être défini (génère une valeur aléatoire en prod).

## ✅ Check-list de test rapide
1. **Postman** : `POST /api/token/` → recevoir `{access, refresh}`.
2. **Front** : soumettre le formulaire de login → redirection vers `/dashboard`.
3. **/api/auth/session** : renvoie un `user` après login.
4. **Navigation** vers `/dashboard` après fermeture/réouverture du navigateur (session persistante tant que les cookies existent).
5. L’`access` expiré se **refresh** automatiquement (401 → refresh → retry).

## 🚀 Prochaines étapes (optionnel)
- Mettre les cookies de tokens côté front en **HTTPOnly** via des routes API Next pour meilleure sécurité.
- Logger côté serveur (et non le token) + observabilité.
- Pages “Forgot Password”/“Reset Password” si besoin.
- Rôles/permissions (si le backend les expose dans le JWT).

— Fin —
