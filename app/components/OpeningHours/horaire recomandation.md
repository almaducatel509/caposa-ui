## Il a seulement 2 états métier + 1 état dérivé.

1) brouillon (draft)
➡️ L’horaire n’est utilisé par aucune branche  
➡️ Les heures peuvent être modifiées librement  
➡️ Le bouton principal = Assigner  
➡️ Peut devenir actif si une branche l’utilise

C’est l’équivalent de ton “Brouillon” dans les jours fériés.

2) actif
➡️ L’horaire est utilisé par au moins une branche  
➡️ Les heures deviennent verrouillées (non modifiables)
➡️ Le bouton principal = Gérer (ajouter/enlever des branches)
➡️ On affiche la liste des branches qui l’utilisent

C’est l’état “modèle partagé”.

3) inutilisé (état dérivé, optionnel)
Tu peux l’omettre si tu veux, mais parfois utile en UI.

➡️ L’horaire existe mais n’est assigné à aucune branche  
➡️ Identique à brouillon, mais plus explicite en UI
➡️ Peut être fusionné avec brouillon si tu veux simplifier

## type HoraireStatus = "brouillon" | "actif";
