Petit récap de ce qui s'est passé, au cas où ça reviendrait :

Symptôme : /api/auth/session → 404 → toutes les pages protégées cassées (sous-menus transactions, etc.)
Cause : export { handlers as GET, handlers as POST } exposait l'objet handlers comme si c'était une fonction. Next plantait à l'invocation → route considérée morte → 404.
Fix : destructurer d'abord, puis exporter :
```json

ts  import { handlers } from "../../../../auth";
  export const { GET, POST } = handlers;
```