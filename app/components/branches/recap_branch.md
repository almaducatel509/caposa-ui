
## ✅ Ce qui a été fait :

### 1. **BranchFormFields** 
- ✅ Ajout de la prop `mode: 'create' | 'edit' | 'activate'`
- ✅ Désactivation conditionnelle des Listbox (horaires & jours fériés)
- ✅ Affichage des `*` rouges en mode activation
- ✅ Messages d'aide en mode création
- ✅ Messages d'erreur uniquement en mode activation
- ✅ Utilisation de Tailwind (`pointer-events-none opacity-50`) au lieu de props Hero UI

### 2. **EditBranchModal**
- ✅ Ajout de la prop `mode` avec valeur par défaut `'create'`
- ✅ Gestion du `status: 'inactive' | 'active'`
- ✅ Validation dynamique selon le mode (schéma base vs activation)
- ✅ Titres et boutons adaptés au contexte
- ✅ Messages de succès personnalisés
- ✅ Transmission du `mode` à BranchFormFields

### 3. **Validation Zod** (inchangée, comme demandé)
- ✅ `branchBaseSchema` : horaires/jours fériés optionnels
- ✅ `branchActivationSchema` : horaires/jours fériés obligatoires

---

## 🎯 Résultat final :

| Mode | Formulaire | Validation | UX |
|------|-----------|-----------|-----|
| **create** | Horaires désactivés (grisés) | Optionnels | "Créer" |
| **edit** | Horaires modifiables | Optionnels | "Modifier" |
| **activate** | Horaires obligatoires avec `*` | Requis + erreurs | "Activer" |

Tout est maintenant cohérent et respecte la logique métier ! 🚀

