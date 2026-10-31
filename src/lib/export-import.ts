/**
 * RFC 4180-compliant CSV and JSON import/export pipelines for CaseKo.
 */
import {
  caseDigestSchema,
  type CaseDigestInput,
} from "@/lib/validations/digest";

export interface ExportableCaseDigest {
  case_title: string;
  gr_number: string;
  legal_classification: string;
  subcategory: string | null;
  doctrine: string | null;
  facts: string;
  issues: string;
  ruling: string;
  created_at?: string;
}

export interface ImportValidationResult {
  validRows: CaseDigestInput[];
  errors: { index: number; gr_number?: string; errors: string[] }[];
}

const CSV_HEADERS = [
  "case_title",
  "gr_number",
  "legal_classification",
  "subcategory",
  "doctrine",
  "facts",
  "issues",
  "ruling",
] as const;

/**
 * Escapes a cell value according to RFC 4180.
 * Any field with commas, double quotes, or newlines must be enclosed in quotes,
 * and internal double quotes must be doubled ("").
 */
function escapeCSVField(value: string | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (
    str.includes('"') ||
    str.includes(",") ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Converts an array of case digests into an RFC 4180 CSV string.
 */
export function exportToCSV(digests: ExportableCaseDigest[]): string {
  const headerLine = CSV_HEADERS.join(",");
  const rows = digests.map((digest) =>
    CSV_HEADERS.map((header) =>
      escapeCSVField(digest[header as keyof ExportableCaseDigest])
    ).join(",")
  );
  return [headerLine, ...rows].join("\r\n");
}

/**
 * Converts an array of case digests into a formatted JSON string.
 */
export function exportToJSON(digests: ExportableCaseDigest[]): string {
  return JSON.stringify(digests, null, 2);
}

/**
 * Generates official CaseKo export filenames with current date stamp.
 */
export function getExportFilename(format: "csv" | "json"): string {
  const dateStamp = new Date().toISOString().slice(0, 10);
  return `caseko-export-${dateStamp}.${format}`;
}

/**
 * Triggers a browser file download for a given Blob.
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Robust RFC 4180 CSV parser handling multi-line quoted fields.
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  while (i < csvText.length) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i += 2;
        continue;
      } else if (char === '"') {
        inQuotes = false;
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ",") {
        currentRow.push(currentField.trim());
        currentField = "";
        i++;
        continue;
      } else if (char === "\r" || char === "\n") {
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().replace(/[\s_-]+/g, "_"));
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = row[idx] ?? "";
    });
    return record;
  });
}

/**
 * Validates a list of raw imported records against the strict Zod schema.
 */
export function validateImportDigests(
  rawRecords: unknown[]
): ImportValidationResult {
  const validRows: CaseDigestInput[] = [];
  const errors: { index: number; gr_number?: string; errors: string[] }[] = [];

  rawRecords.forEach((record, index) => {
    const parsed = caseDigestSchema.safeParse(record);
    if (parsed.success) {
      validRows.push(parsed.data);
    } else {
      const issueMessages = parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "field"}: ${issue.message}`
      );
      errors.push({
        index: index + 1,
        gr_number:
          typeof record === "object" && record && "gr_number" in record
            ? String((record as any).gr_number)
            : undefined,
        errors: issueMessages,
      });
    }
  });

  return { validRows, errors };
}

