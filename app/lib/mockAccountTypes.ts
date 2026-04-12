// app/lib/mockAccountTypes.ts
export const mockAccountTypes = [
  {
    id: 1,
    type_compte: "epargne",
    taux_interet: 2.5,
    frais_service_mensuel: 0.0,
    limite_trait: null,
    minimum_depot: 25
  },
  {
    id: 2,
    type_compte: "cheques",
    taux_interet: null,
    frais_service_mensuel: 5.0,
    limite_trait: 1000,
    minimum_depot: 100
  },
  {
    id: 3,
    type_compte: "terme",
    taux_interet: 3.0,
    frais_service_mensuel: 0.0,
    limite_trait: null,
    minimum_depot: 500
  }
];

// Format recommandé :
// [Bloc membre] – [Bloc produit] – [Séquence unique]
