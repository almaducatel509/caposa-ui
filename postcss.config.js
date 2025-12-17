// postcss.config.js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},  // plugin officiel
    autoprefixer: {},
  },
};
/*

## 📝 Note de rappel – PostCSS & Tailwind avec Turbopack

### Pourquoi j’avais l’erreur
- Turbopack essayait de charger **`tailwindcss/nesting`**, mais ce sous‑chemin n’existe pas dans ma version de Tailwind.  
- Résultat : *“Package subpath './nesting' is not defined”*.  
- En plus, Tailwind v4 ne s’utilise plus directement comme plugin PostCSS → il faut passer par **`@tailwindcss/postcss`**.

### Comment j’ai corrigé
1. J’ai remplacé le contenu de `postcss.config.js` par :
   ```js
   module.exports = {
     plugins: {
       "@tailwindcss/postcss": {},  // plugin officiel Tailwind v4
       autoprefixer: {},            // préfixes navigateurs
     },
   };
   ```
2. J’ai supprimé `node_modules` et mon fichier lock (`package-lock.json` ou `pnpm-lock.yaml`).  
3. J’ai réinstallé les dépendances avec `npm install`.  
4. J’ai relancé mon serveur avec `npm run dev`.

### Résultat
- Turbopack trouve une config PostCSS valide.  
- `globals.css` est compilé correctement avec Tailwind.  
- Plus d’erreur de sous‑chemin ou de config undefined.

---
*/