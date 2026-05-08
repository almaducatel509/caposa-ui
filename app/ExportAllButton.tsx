import { useState } from "react";
import { Download } from "lucide-react";

interface ExportAllButtonProps<T extends Record<string, unknown>> {
  /** Données à exporter */
  data: T[];
  /** Nom du fichier (sans extension, sans date) */
  filename?: string;
  /** Texte du bouton */
  label?: string;
  /** Colonnes à exporter (clés). Si omis, toutes les clés du premier objet. */
  columns?: (keyof T)[];
  /** Renommage des en-têtes : { email: "Adresse e-mail" } */
  headerLabels?: Partial<Record<keyof T, string>>;
  /** Séparateur. ";" recommandé pour Excel en français. Défaut: "," */
  separator?: "," | ";";
  /** Callback après succès (toast, analytics, etc.) */
  onSuccess?: (count: number) => void;
  /** Callback en cas d'erreur */
  onError?: (error: Error) => void;
}

/**
 * Échappe une valeur pour CSV selon RFC 4180 + protection injection de formule.
 * 
 * Préviens 4 catégories de bugs :
 * 1. Virgules / points-virgules dans les valeurs
 * 2. Guillemets dans les valeurs
 * 3. Retours à la ligne dans les valeurs
 * 4. Injection de formule (=, +, -, @, tab, CR) — CVE CSV injection
 */
const escapeCSVValue = (val: unknown): string => {
  // Null, undefined → champ vide
  if (val === null || val === undefined) return '""';

  // Sérialisation propre selon le type
  let str: string;
  if (val instanceof Date) {
    str = val.toISOString();
  } else if (typeof val === "object") {
    str = JSON.stringify(val);
  } else {
    str = String(val);
  }

  // Protection contre l'injection de formule (CSV injection / CWE-1236)
  // Si la valeur commence par =, +, -, @, tab ou CR, Excel l'interprète comme formule.
  // On préfixe d'une apostrophe pour neutraliser.
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // RFC 4180 : doubler les guillemets internes et entourer de guillemets
  return `"${str.replace(/"/g, '""')}"`;
};

export const ExportAllButton = <T extends Record<string, unknown>>({
  data,
  filename = "export",
  label = "Exporter tout",
  columns,
  headerLabels,
  separator = ",",
  onSuccess,
  onError,
}: ExportAllButtonProps<T>) => {
  const [loading, setLoading] = useState(false);

  const exportCSV = () => {
    if (!data?.length) return;

    setLoading(true);
    try {
      // 1. Déterminer les colonnes
      const keys = columns ?? (Object.keys(data[0]) as (keyof T)[]);

      // 2. En-têtes (avec labels custom si fournis)
      const headerRow = keys
        .map(k => escapeCSVValue(headerLabels?.[k] ?? String(k)))
        .join(separator);

      // 3. Lignes de données
      const dataRows = data.map(row =>
        keys.map(k => escapeCSVValue(row[k])).join(separator)
      );

      // 4. Assemblage avec CRLF (RFC 4180, meilleure compat Windows/Excel)
      const csv = [headerRow, ...dataRows].join("\r\n");

      // 5. BOM UTF-8 pour qu'Excel lise correctement les accents
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });

      // 6. Téléchargement
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onSuccess?.(data.length);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Export échoué");
      console.error("Export CSV:", error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !data?.length;

  return (
    <button
      onClick={exportCSV}
      disabled={isDisabled}
      title={!data?.length ? "Aucune donnée à exporter" : `${label} (${data.length})`}
      className="flex items-center gap-2 h-11 px-5 bg-white border-2 border-[#2E7D32] text-[#2E7D32] text-sm font-medium rounded-xl hover:bg-[#DDEAD5] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
          Export…
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          {label}
        </>
      )}
    </button>
  );
};