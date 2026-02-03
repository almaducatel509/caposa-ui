// mock/memberData.ts
import seedrandom from "seedrandom";

// ================= TYPES =================
export interface FinancialHistoryEntry {
  mois: string;
  revenu: number;
  depenses: number;
  isSaisonnier?: boolean;
}

export interface MemberFinancialData {
  id: string;
  nom: string;
  prenom: string;
  photo?: string;

  historique: FinancialHistoryEntry[];

  revenuMensuelMoyen: number;
  depensesMensuellesMoyennes: number;
  capaciteRemboursement: number;
  ratioEndettement: number;
  scoreStabilite: number;

  estSaisonnier: boolean;
  dernierPret?: {
    montant: number;
    statut: "rembourse" | "en_cours" | "en_retard";
    mensualite: number;
  };

  anciennete: number;
  nombrePrets: number;
  tauxRemboursement: number;
}

// ================= CONSTANTES =================
const NOMS = [
  "Tremblay", "Martin", "Dubois", "Roy", "Gagnon", "Côté", "Lavoie",
  "Bergeron", "Bouchard", "Morin", "Jean-Baptiste", "Pierre-Louis",
  "Estimé", "François",
];

const PRENOMS = [
  "Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "Gabriel",
  "Hannah", "Isaac", "Julia", "Marie", "Jean", "Rose", "Paul",
];

// ================= HELPERS =================
const randomBetween = (rng: () => number, min: number, max: number) =>
  min + rng() * (max - min);

const randomInt = (rng: () => number, min: number, max: number) =>
  Math.floor(randomBetween(rng, min, max + 1));

// ================= GENERATOR =================
export function generateMemberData(
  seed = "members-seed",
  count = 24
): MemberFinancialData[] {
  const rng = seedrandom(seed);
  const data: MemberFinancialData[] = [];

  for (let i = 0; i < count; i++) {
    const estSaisonnier = rng() > 0.6;

    const baseRevenu = randomBetween(rng, 15000, 50000);
    const baseDepenses = baseRevenu * randomBetween(rng, 0.5, 0.8);

    const nbMois = estSaisonnier ? 12 : 6;
    const historique: FinancialHistoryEntry[] = [];

    for (let m = nbMois - 1; m >= 0; m--) {
      const date = new Date();
      date.setMonth(date.getMonth() - m);

      const moisStr = date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
      });

      let revenu = baseRevenu;
      let depenses = baseDepenses;
      let cycle = 0;

      if (estSaisonnier) {
        cycle = Math.sin((m / 12) * Math.PI * 2);
        revenu += baseRevenu * 0.4 * cycle;
        depenses += baseDepenses * 0.2 * cycle;
      } else {
        revenu += (rng() - 0.5) * baseRevenu * 0.15;
        depenses += (rng() - 0.5) * baseDepenses * 0.15;
      }

      historique.push({
        mois: moisStr,
        revenu: Math.max(0, revenu),
        depenses: Math.max(0, depenses),
        isSaisonnier: estSaisonnier && Math.abs(cycle) > 0.5,
      });
    }

    // ================= CALCULS =================
    const revenuMoyen =
      historique.reduce((s, h) => s + h.revenu, 0) / historique.length;

    const depensesMoyennes =
      historique.reduce((s, h) => s + h.depenses, 0) / historique.length;

    const capacite = revenuMoyen - depensesMoyennes;

    let ratioEndettement = 0;
    let dernierPret: MemberFinancialData["dernierPret"];

    if (rng() > 0.4 && capacite > 0) {
      const montant = randomInt(rng, capacite * 3, capacite * 9);
      const mensualite = montant / randomInt(rng, 12, 36);
      ratioEndettement = mensualite / revenuMoyen;

      const r = rng();
      dernierPret = {
        montant,
        mensualite,
        statut:
          r > 0.7 ? "en_cours" : r > 0.4 ? "rembourse" : "en_retard",
      };
    }

    // Score de stabilité
    const variance =
      historique.reduce((s, h) => {
        const diff = h.revenu - revenuMoyen;
        return s + diff * diff;
      }, 0) / historique.length;

    const coeffVariation = Math.sqrt(variance) / revenuMoyen;
    const scoreStabilite = Math.max(
      0,
      Math.min(100, 100 - coeffVariation * 200)
    );

    const anciennete = randomInt(rng, 6, 54);
    const nombrePrets = Math.floor(anciennete / 12) + randomInt(rng, 0, 2);
    const tauxRemboursement = randomBetween(rng, 85, 100);

    data.push({
      id: `MEM${1000 + i}`,
      nom: NOMS[randomInt(rng, 0, NOMS.length - 1)],
      prenom: PRENOMS[randomInt(rng, 0, PRENOMS.length - 1)],
      historique,
      revenuMensuelMoyen: revenuMoyen,
      depensesMensuellesMoyennes: depensesMoyennes,
      capaciteRemboursement: capacite,
      ratioEndettement,
      scoreStabilite,
      estSaisonnier,
      dernierPret,
      anciennete,
      nombrePrets,
      tauxRemboursement,
    });
  }

  return data.sort((a, b) => b.scoreStabilite - a.scoreStabilite);
}















// const generateMemberData = (): MemberFinancialData[] => {
//   const noms = ['Tremblay', 'Martin', 'Dubois', 'Roy', 'Gagnon', 'Côté', 'Lavoie', 'Bergeron', 'Bouchard', 'Morin', 'Jean-Baptiste', 'Pierre-Louis', 'Estimé', 'François'];
//   const prenoms = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'Gabriel', 'Hannah', 'Isaac', 'Julia', 'Marie', 'Jean', 'Rose', 'Paul'];
  
//   const data: MemberFinancialData[] = [];
  
//   for (let i = 0; i < 24; i++) {
//     const estSaisonnier = Math.random() > 0.6;
//     const baseRevenu = 15000 + Math.random() * 35000;
//     const baseDepenses = baseRevenu * (0.5 + Math.random() * 0.3);
    
//     // Générer historique 6-12 mois
//     const nbMois = estSaisonnier ? 12 : 6;
//     const historique: FinancialHistoryEntry[] = [];
    
//    // Dans la boucle de génération d'historique
// for (let m = nbMois - 1; m >= 0; m--) {
//   const date = new Date();
//   date.setMonth(date.getMonth() - m);
//   const moisStr = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
  
//   let revenu = baseRevenu;
//   let depenses = baseDepenses;
//   let cycle = 0; // ⬅️ DÉCLARER cycle ICI
  
//   if (estSaisonnier) {
//     // Variation saisonnière
//     cycle = Math.sin((m / 12) * Math.PI * 2); // ⬅️ CALCULER cycle
//     revenu = baseRevenu + (baseRevenu * 0.4 * cycle);
//     depenses = baseDepenses + (baseDepenses * 0.2 * cycle);
//   } else {
//     // Variation aléatoire légère
//     revenu += (Math.random() - 0.5) * baseRevenu * 0.15;
//     depenses += (Math.random() - 0.5) * baseDepenses * 0.15;
//   }
  
//   historique.push({
//     mois: moisStr,
//     revenu: Math.max(0, revenu),
//     depenses: Math.max(0, depenses),
//     isSaisonnier: estSaisonnier && Math.abs(cycle) > 0.5
//   });
// }
    
//     const revenuMoyen = historique.reduce((sum, h) => sum + h.revenu, 0) / historique.length;
//     const depensesMoyennes = historique.reduce((sum, h) => sum + h.depenses, 0) / historique.length;
//     const capacite = revenuMoyen - depensesMoyennes;
    
//     const aPret = Math.random() > 0.4;
//     let ratioEndettement = 0;
//     let dernierPret;
    
//     if (aPret) {
//         const montantPret = Math.floor(capacite * (3 + Math.random() * 6));
//         const mensualite = montantPret / (12 + Math.floor(Math.random() * 24));
//         ratioEndettement = mensualite / revenuMoyen;
        
//         const random = Math.random();
        
//         dernierPret = {
//             montant: montantPret,
//             statut: (random > 0.7 
//             ? 'en_cours' 
//             : random > 0.4 
//                 ? 'rembourse' 
//                 : 'en_retard') as 'en_cours' | 'rembourse' | 'en_retard',
//             mensualite
//         };
//         }
//     // Score de stabilité (0-100)
//     const variance = historique.reduce((sum, h) => {
//       const diff = h.revenu - revenuMoyen;
//       return sum + (diff * diff);
//     }, 0) / historique.length;
//     const coeffVariation = Math.sqrt(variance) / revenuMoyen;
//     const scoreStabilite = Math.max(0, Math.min(100, 100 - (coeffVariation * 200)));
    
//     const anciennete = 6 + Math.floor(Math.random() * 48);
//     const nombrePrets = Math.floor(anciennete / 12) + Math.floor(Math.random() * 3);
//     const tauxRemboursement = 85 + Math.random() * 15;
    
//     data.push({
//       id: `MEM${1000 + i}`,
//       nom: noms[Math.floor(Math.random() * noms.length)],
//       prenom: prenoms[Math.floor(Math.random() * prenoms.length)],
//       historique,
//       revenuMensuelMoyen: revenuMoyen,
//       depensesMensuellesMoyennes: depensesMoyennes,
//       capaciteRemboursement: capacite,
//       ratioEndettement,
//       scoreStabilite,
//       estSaisonnier,
//       dernierPret,
//       anciennete,
//       nombrePrets,
//       tauxRemboursement
//     });
//   }
  
//   return data.sort((a, b) => b.scoreStabilite - a.scoreStabilite);
// };
