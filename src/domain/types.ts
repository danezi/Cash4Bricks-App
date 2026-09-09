import { z } from 'zod';

/**
 * Fachliche Kernentitäten als Zod-Schemas. Die TypeScript-Typen werden daraus
 * abgeleitet (`z.infer`) — eine einzige Quelle für Struktur und Laufzeitprüfung.
 *
 * Diese Datei importiert nichts aus `expo`, `@supabase` oder der App-Schicht.
 */

// --- Aufzählungen -----------------------------------------------------------

export const submissionStatusSchema = z.enum([
  'submitted',
  'under_review',
  'offer_sent',
  'accepted',
  'received',
  'payment_initiated',
  'paid',
]);
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;

export const lineStatusSchema = z.enum(['requested', 'received', 'missing', 'extra']);
export type LineStatus = z.infer<typeof lineStatusSchema>;

export const itemSourceSchema = z.enum(['scan', 'manual']);
export type ItemSource = z.infer<typeof itemSourceSchema>;

export const roleSchema = z.enum(['customer', 'admin']);
export type Role = z.infer<typeof roleSchema>;

// --- Katalog --------------------------------------------------------------

export const catalogSetSchema = z.object({
  setNumber: z.string().min(1),
  name: z.string().min(1),
  year: z.number().int(),
  theme: z.string(),
  parts: z.number().int().nonnegative(),
  imageUrl: z.url().nullable(),
});
export type CatalogSet = z.infer<typeof catalogSetSchema>;

/** Ergebnis einer Barcode-Auflösung — mehrstufig, mit Confidence. */
export const barcodeMatchSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('confirmed'), set: catalogSetSchema }),
  z.object({
    kind: z.literal('probable'),
    set: catalogSetSchema,
    confidence: z.number().min(0).max(1),
  }),
  z.object({ kind: z.literal('unknown'), ean: z.string() }),
]);
export type BarcodeMatch = z.infer<typeof barcodeMatchSchema>;

// --- Einreichung --------------------------------------------------------

export const submissionItemInputSchema = z.object({
  setNumber: z.string().min(1),
  setName: z.string().min(1),
  qty: z.number().int().positive(),
  source: itemSourceSchema,
});
export type SubmissionItemInput = z.infer<typeof submissionItemInputSchema>;

export const submissionInputSchema = z.object({
  contactEmail: z.email(),
  contactPhone: z.string().min(4),
  items: z.array(submissionItemInputSchema).min(1),
});
export type SubmissionInput = z.infer<typeof submissionInputSchema>;

export const submissionItemSchema = z.object({
  id: z.string(),
  setNumber: z.string(),
  setName: z.string(),
  qty: z.number().int().positive(),
  qtyReceived: z.number().int().nonnegative(),
  source: itemSourceSchema,
  lineStatus: lineStatusSchema,
  priceEstimated: z.number().nonnegative().nullable(),
  priceFinal: z.number().nonnegative().nullable(),
});
export type SubmissionItem = z.infer<typeof submissionItemSchema>;

export const adjustmentInputSchema = z.object({
  amount: z.number(),
  reason: z.string().min(3),
});
export type AdjustmentInput = z.infer<typeof adjustmentInputSchema>;

export const adjustmentSchema = adjustmentInputSchema.extend({
  id: z.string(),
  createdAt: z.string(),
});
export type Adjustment = z.infer<typeof adjustmentSchema>;

export const submissionSummarySchema = z.object({
  id: z.string(),
  status: submissionStatusSchema,
  itemCount: z.number().int().nonnegative(),
  totalQty: z.number().int().nonnegative(),
  totalEstimated: z.number().nonnegative(),
  createdAt: z.string(),
});
export type SubmissionSummary = z.infer<typeof submissionSummarySchema>;

export const submissionDetailSchema = z.object({
  id: z.string(),
  status: submissionStatusSchema,
  contactEmail: z.string(),
  contactPhone: z.string(),
  items: z.array(submissionItemSchema),
  adjustments: z.array(adjustmentSchema),
  totalEstimated: z.number().nonnegative(),
  totalFinal: z.number().nullable(),
  createdAt: z.string(),
});
export type SubmissionDetail = z.infer<typeof submissionDetailSchema>;

/** Ergebnis eines einzelnen Wareneingangs-Scans. */
export const reconcileResultSchema = z.object({
  setNumber: z.string(),
  setName: z.string(),
  lineStatus: z.enum(['received', 'extra']),
  qtyReceived: z.number().int().positive(),
  qtyRequested: z.number().int().nonnegative(),
});
export type ReconcileResult = z.infer<typeof reconcileResultSchema>;

// --- Anmeldung --------------------------------------------------------

export const sessionSchema = z.object({
  userId: z.string(),
  email: z.string(),
  role: roleSchema,
});
export type Session = z.infer<typeof sessionSchema>;

// --- Kennungen -------------------------------------------------------

export type SubmissionId = string;
export type ReceiptId = string;
