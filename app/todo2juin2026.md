Parfait. Demain l'ordre d'attaque :

1. Retirer le bouton "Saisie différée" de `DepositFilterBar`
2. L'ajouter dans la page Sessions — idéalement dans le détail d'une session `interrompue` ou comme action sur la ligne
3. Passer `sessionId` réel à `DifferedDepositModal` depuis la session sélectionnée — au lieu de `"SESS-MOCK"`

Le modal `DifferedDepositModal` lui-même ne change pas. Juste le point d'entrée.