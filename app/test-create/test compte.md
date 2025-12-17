// 'use client';
// //app\test-create => localhost:3000/test-create
// import React, { useState } from 'react';
// import CompteFormFields from '@/app/components/accounts/CompteFormFields';
// import { createAccountSchema } from '@/app/components/accounts/validationsaccount';

// export default function TestCreatePage() {
//   // ============= FORM DATA =============
//   const [formData, setFormData] = useState({
//     id_membre: "",
//     typeCompte: "" as "epargne" | "cheques" | "terme" | "",
//     statutCompte: "actif" as "actif" | "ferme" | "suspendu",
//     dateOuverture: new Date().toISOString().split('T')[0],
//     tauxInteret: null as number | null,
//     limiteTrait: null as number | null,
//     fraisServiceMensuel: null as number | null,
//     member_details: undefined as any,
//   });

//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [showSuccess, setShowSuccess] = useState(false);

//   // ============= HANDLERS =============
//   const handleFormDataChange = (updates: Partial<typeof formData>) => {
//     setFormData(prev => ({ ...prev, ...updates }));
//     // Effacer les erreurs quand on modifie
//     if (Object.keys(updates).length > 0) {
//       setErrors({});
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     console.log("\n" + "=".repeat(60));
//     console.log("🚀 TEST - SOUMISSION DU FORMULAIRE");
//     console.log("=".repeat(60));

//     // Reset états
//     setErrors({});
//     setShowSuccess(false);

//     // Construire le payload
//     const payload = {
//       id_membre: formData.id_membre,
//       typeCompte: formData.typeCompte,
//       statutCompte: formData.statutCompte,
//       dateOuverture: formData.dateOuverture,
//       tauxInteret: formData.tauxInteret,
//       limiteTrait: formData.limiteTrait,
//       fraisServiceMensuel: formData.fraisServiceMensuel,
//     };

//     console.log("📋 Payload à envoyer:", JSON.stringify(payload, null, 2));

//     // Validation avec Zod
//     const result = createAccountSchema.safeParse(payload);

//     if (!result.success) {
//       console.error("❌ Validation échouée:");
//       const zodErrors: Record<string, string> = {};
      
//       result.error.errors.forEach((err) => {
//         console.error(`  - ${err.path.join('.')}: ${err.message}`);
//         if (err.path[0]) {
//           zodErrors[err.path[0] as string] = err.message;
//         }
//       });
      
//       setErrors(zodErrors);
//       console.log("=".repeat(60) + "\n");
//       return;
//     }

//     // ✅ Validation réussie
//     console.log("✅ Validation réussie!");
//     console.log("📤 Données validées:", JSON.stringify(result.data, null, 2));
//     console.log("\n🌐 Simulation appel API:");
//     console.log("   POST /api/accounts/");
//     console.log("   Body:", JSON.stringify(result.data, null, 2));
//     console.log("=".repeat(60) + "\n");

//     // Afficher succès
//     setShowSuccess(true);
    
//     // Auto-hide après 5 secondes
//     setTimeout(() => setShowSuccess(false), 5000);
//   };

//   const handleReset = () => {
//     setFormData({
//       id_membre: "",
//       typeCompte: "",
//       statutCompte: "actif",
//       dateOuverture: new Date().toISOString().split('T')[0],
//       tauxInteret: null,
//       limiteTrait: null,
//       fraisServiceMensuel: null,
//       member_details: undefined,
//     });
//     setErrors({});
//     setShowSuccess(false);
//     console.log("🔄 Formulaire réinitialisé");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
//       <div className="max-w-5xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
//             🧪 Test - Création de Compte
//           </h1>
//           <p className="text-gray-600">
//             Page de test pour CompteFormFields (3 steps) - Validation Zod + Console log
//           </p>
          
//           {/* Info Banner */}
//           <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
//             <p className="text-sm text-yellow-800">
//               <strong>🔍 Mode Test :</strong> Les données sont validées et affichées dans la console. 
//               Aucun appel API réel n'est effectué.
//             </p>
//           </div>
//         </div>

//         {/* Success Message */}
//         {showSuccess && (
//           <div className="mb-6 p-4 bg-green-100 border-2 border-green-300 rounded-xl animate-fade-in">
//             <div className="flex items-center gap-3">
//               <span className="text-3xl">✅</span>
//               <div>
//                 <p className="text-green-800 font-bold text-lg">Validation réussie !</p>
//                 <p className="text-green-700 text-sm mt-1">
//                   Les données ont été validées avec succès. Consultez la console pour voir le payload.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Formulaire */}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
//             <CompteFormFields
//               formData={formData}
//               setFormData={handleFormDataChange}
//               errors={errors}
//               setErrors={setErrors}
//               mode="create"
//             />
//           </div>

//           {/* Actions */}
//           <div className="flex gap-4 justify-end">
//             <button
//               type="button"
//               onClick={handleReset}
//               className="px-8 py-4 rounded-xl font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all shadow-md"
//             >
//               🔄 Réinitialiser
//             </button>
//             <button
//               type="submit"
//               className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
//             >
//               ✅ Tester la Validation
//             </button>
//           </div>
//         </form>

//         {/* Debug Panel */}
//         <div className="mt-8 p-6 bg-gray-900 rounded-2xl border-2 border-gray-700">
//           <h3 className="text-lg font-bold text-white mb-4">
//             🐛 État actuel du formulaire
//           </h3>
//           <pre className="text-xs text-green-400 overflow-auto">
// {JSON.stringify(formData, null, 2)}
//           </pre>
          
//           {Object.keys(errors).length > 0 && (
//             <>
//               <h4 className="text-md font-bold text-red-400 mt-4 mb-2">
//                 ❌ Erreurs de validation
//               </h4>
//               <pre className="text-xs text-red-400 overflow-auto">
// {JSON.stringify(errors, null, 2)}
//               </pre>
//             </>
//           )}
//         </div>

//         {/* Instructions */}
//         <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl">
//           <h3 className="font-bold text-blue-900 mb-3 text-lg">
//             📖 Instructions de test
//           </h3>
//           <ol className="space-y-2 text-sm text-blue-800">
//             <li className="flex items-start gap-2">
//               <span className="font-bold">1️⃣</span>
//               <span>Ouvrez la console du navigateur (F12)</span>
//             </li>
//             <li className="flex items-start gap-2">
//               <span className="font-bold">2️⃣</span>
//               <span>Suivez les 3 étapes du formulaire (Membre → Type → Confirmation)</span>
//             </li>
//             <li className="flex items-start gap-2">
//               <span className="font-bold">3️⃣</span>
//               <span>Cliquez sur "Tester la Validation"</span>
//             </li>
//             <li className="flex items-start gap-2">
//               <span className="font-bold">4️⃣</span>
//               <span>Vérifiez la console pour voir le payload et les logs détaillés</span>
//             </li>
//             <li className="flex items-start gap-2">
//               <span className="font-bold">5️⃣</span>
//               <span>Testez aussi avec des données invalides pour voir les erreurs</span>
//             </li>
//           </ol>
//         </div>

//         {/* Navigation */}
//         <div className="mt-8 text-center">
//           <a 
//             href="/"
//             className="text-blue-600 hover:text-blue-700 font-medium"
//           >
//             ← Retour à l'accueil
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// }

