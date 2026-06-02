// transactionDiffereValidation.ts
import { z } from 'zod';

// ─── Schéma saisie différée ──────────────────────────────────────
// Utilisé uniquement par le modal "Saisie différée"
// Rôle requis : superviseur | admin (géré côté backend)

// export const TransactionDiffereSchema = z.object({
// // Quand Django sera prêt et enverra de vrais UUIDs, tu remets .uuid(). Pour l'instant ça bloque le mock inutilement.
//   // ── Champs standard transaction ─────────────────────────────
// session_id: z.string().min(1, "Session requise"),      // était .uuid()
// saisi_par:  z.string().min(1, "Saisi par requis"),     // était .uuid()  type:        z.enum(['depot', 'retrait', 'transfert_entrant', 'transfert_sortant', 'pret_encaisse', 'pret_debourse', 'frais', 'autre']),
//   montant:     z.number().positive("Montant doit être positif"),
//   client:      z.string().optional(),
//   reference:   z.string().optional(),
//   note:        z.string().optional(),

//   // ── Champs saisie différée ───────────────────────────────────
// // AVANT
// // transaction_date: z.string().datetime("Date/heure invalide"),

// // APRÈS
// transaction_date: z.string().min(1, "Date requise"),
//   motif_saisie_differee: z.string().min(10, "Motif requis (min 10 caractères)"),
//   // saisi_par:             z.string().uuid(),                                 // auto-rempli, non affiché

// });
export const TransactionDiffereSchema = z.object({
  session_id:            z.string().min(1, "Session requise"),
  saisi_par:             z.string().min(1, "Saisi par requis"),
  type:                  z.enum(['depot', 'retrait', 'transfert_entrant', 'transfert_sortant', 'pret_encaisse', 'pret_debourse', 'frais', 'autre']),  // ← ajouter
  montant:               z.number().positive("Montant doit être positif"),
  client:                z.string().optional(),
  reference:             z.string().optional(),
  note:                  z.string().optional(),
  transaction_date:      z.string().min(1, "Date requise"),
  motif_saisie_differee: z.string().min(10, "Motif requis (min 10 caractères)"),
});

export type TransactionDiffere = z.infer<typeof TransactionDiffereSchema>;