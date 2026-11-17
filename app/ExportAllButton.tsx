import { useState } from "react";
import { Download } from "lucide-react";
import { exportToXLSXFile } from "./utils/excelExport";

interface ExportAllButtonProps<T extends object> {
  /** Données à exporter */
  data: T[];
  /** Nom du fichier (sans extension, sans date) */
  filename?: string;
  /** Titre affiché dans l'en-tête du fichier Excel */
  documentTitle?: string;
  /** Texte du bouton */
  label?: string;
  /** Colonnes à exporter (clés). Si omis, toutes les clés du premier objet. */
  columns?: (keyof T)[];
  /** Renommage des en-têtes : { email: "Adresse e-mail" } */
  headerLabels?: Partial<Record<keyof T, string>>;
  /** Séparateur (gardé pour compatibilité descendante) */
  separator?: "," | ";";
  /** Callback après succès (toast, analytics, etc.) */
  onSuccess?: (count: number) => void;
  /** Callback en cas d'erreur */
  onError?: (error: Error) => void;
  /** Option compatibilité */
  excelSepHint?: boolean;
}

export const ExportAllButton = <T extends object>({
  data,
  filename = "export",
  documentTitle,
  label = "Exporter",
  columns,
  headerLabels,
  onSuccess,
  onError,
}: ExportAllButtonProps<T>) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!data?.length) return;

    setLoading(true);
    try {
      // 1. Déterminer les colonnes
      const keys = columns ?? (Object.keys(data[0]) as (keyof T)[]);

      // 2. En-têtes (avec labels custom si fournis)
      const headers = keys.map((k) => headerLabels?.[k] ?? String(k));

      // 3. Lignes de données
      const rows = data.map((row) => keys.map((k) => row[k]));

      // 4. Génération du fichier XLSX avec en-tête complet et auto-dimensionnement
      await exportToXLSXFile({
        filename,
        documentTitle: documentTitle || filename.replace(/[_-]/g, " ").toUpperCase(),
        headers,
        rows,
      });

      onSuccess?.(data.length);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Export échoué");
      console.error("Export XLSX:", error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !data?.length;

  return (
    <button
      onClick={handleExport}
      disabled={isDisabled}
      title={!data?.length ? "Aucune donnée à exporter" : `${label} (${data.length})`}
      className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl border font-medium
        whitespace-nowrap bg-white border-2 border-[#2E7D32] text-[#2E7D32] text-sm  
        hover:bg-[#DDEAD5] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
          <span>Export...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 shrink-0" />
          <span>{label}</span>
        </div>
      )}
    </button>
  );
};
