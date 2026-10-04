// transactionDiffereValidation.ts
import { z } from 'zod';

// ─── Schéma saisie différée ──────────────────────────────────────
// Utilisé uniquement par le modal "Saisie différée"
// Rôle requis : superviseur | admin (géré côté backend)

export const TransactionDiffereSchema = z.object({
  // Champs standard transaction
  session_id:            z.string().min(1, 'Session requise'),
  saisi_par:              z.string().min(1, 'Saisi par requis'),
  idCompte:               z.string().min(1, 'Compte requis'),
  type:                   z.enum(['depot', 'retrait', 'transfert_entrant', 'transfert_sortant', 'pret_encaisse', 'pret_debourse', 'frais', 'autre']),
  montant:                z.number().positive('Montant doit être positif'),
  client:                 z.string().optional(),
  reference:              z.string().optional(),
  note:                   z.string().optional(),

  // Champs saisie différée
  transaction_date:       z.string().min(1, 'Date requise'),
  motif_saisie_differee:  z.string().min(10, 'Motif requis (min 10 caractères)'),
});

export type TransactionDiffere = z.infer<typeof TransactionDiffereSchema>;