// Dans EditAccountModal.tsx (ligne ~48 comme Employee)
const isEditMode = !!account;  // null = false = CREATE, objet = true = EDIT

useEffect(() => {
  console.log("🎯 Modal opened:", {
    mode: isEditMode ? 'EDIT' : 'CREATE',
    account: account ? account.noCompte : 'none'
  });
}, [account, isEditMode]);
```

---

## 📊 **CONSOLE LOGS ATTENDUS:**

### **Quand tu cliques "Nouveau Compte":**
```
🆕 Creating new account
📋 Modal state: {showEditModal: true, selectedAccount: null, isEditMode: false}
🎯 Modal opened: {mode: 'CREATE', account: 'none'}
```

### **Quand tu cliques "Modifier":**
```
🔍 handleEdit appelé: {account: '001-123456', accountId: 'A001'}
🔍 États après: {selectedAccount: '001-123456', isEditMode: true}
🎯 Modal opened: {mode: 'EDIT', account: '001-123456'}