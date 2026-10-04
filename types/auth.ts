/**
 * Représente les données essentielles d'un utilisateur connecté dans la session NextAuth.
 * Ce type est utilisé pour garantir que `session.user` contient les champs nécessaires
 * à l'affichage, à la protection des routes, et à la gestion des rôles dans l'application.
 *
 * Utilisation :
 * - Dans le callback `session()` de NextAuth pour typer `session.user`
 * - Dans les composants frontend qui consomment `useSession()` (ex. UserBadge, AuthGuard)
 * - Pour sécuriser l'accès aux pages ou fonctionnalités selon le rôle (`roles`)
 * 
 *
 * Ce typage permet une autocomplétion fiable, une documentation implicite,
 * et une architecture claire et évolutive.
 * C:\Users\alma2\Documents\Final Project\caposa-ui\types\auth.ts
 * 
 * types/auth.ts — Type UserSession : une déclaration de forme (id, email, username, roles) pour documenter/typer 
 * ce qu'on attend de session.user ailleurs dans l'app. Actuellement, il ne semble pas branché au module augmentation 
 * réel de NextAuth (next-auth.d.ts)
 * c'est plus une référence/documentation qu'un type activement utilisé par le compilateur sur session.user.
 */
export type UserSession = {
  id: string;
  email: string;
  username: string;
  roles: string[];
};
