## 📌 Aide-mémoire : `SessionProvider` & `useSession`

### À quoi ça sert (en 1 phrase)
`SessionProvider` rend les infos de connexion (qui est l'utilisateur, son rôle…) disponibles partout dans tes composants client.

### Le duo

| Pièce | Où | Rôle |
|---|---|---|
| `<SessionProvider>` | dans `providers.tsx` | Le **robinet d'eau** : branché une fois, alimente toute la maison |
| `useSession()` | dans n'importe quel composant client | Le **verre** : tu prends de l'eau quand tu en as besoin |

### Quand utiliser `useSession()` ?

Dès que tu veux **lire qui est connecté** dans un composant client. Exemples :

- Afficher le nom de l'utilisateur dans une navbar
- Cacher/montrer un bouton selon le rôle (`isAdmin`)
- Personnaliser un message d'accueil
- Bloquer une section UI selon les permissions

### Le pattern à retenir

```tsx
"use client"; // 👈 obligatoire (hook = client only)
import { useSession } from "next-auth/react";

export function MonComposant() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <p>Chargement…</p>;
  if (!session) return <p>Non connecté</p>;
  
  const isAdmin = (session.user as any)?.isAdmin;
  
  return <p>Bonjour {session.user?.name} {isAdmin && "(admin)"}</p>;
}
```

### Les 3 valeurs de `status`
- `"loading"` → la session est en train d'être chargée
- `"authenticated"` → connecté, `session` est rempli
- `"unauthenticated"` → pas connecté, `session` est `null`

### ⚠️ Pièges à éviter
1. **Server component ≠ client component** : `useSession()` ne marche QUE dans les fichiers avec `"use client"`. Côté serveur, utilise `auth()` de `@/auth` à la place.
2. **Pas de Provider = crash** : si tu vois `useSession must be wrapped in a <SessionProvider />` → c'est que `providers.tsx` n'enveloppe pas ce composant. Vérifie que `<Providers>` entoure bien `{children}` dans `layout.tsx`.
3. **Sécurité** : ce que tu lis avec `useSession()` est pour l'**UX** (afficher/cacher). La vraie sécurité se fait côté backend, jamais ici seulement.

### TL;DR
> 1 `<SessionProvider>` au top niveau → `useSession()` partout dans tes client components → tu sais qui est connecté.