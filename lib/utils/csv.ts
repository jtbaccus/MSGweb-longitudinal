/**
 * Simple CSV parser for student roster imports.
 * Splits on commas, first row = headers (lowercased/trimmed).
 */
export function parseCSV(
  csv: string,
  requiredColumns: string[]
): { rows: Record<string, string>[]; errors: string[] } {
  const errors: string[] = [];
  const lines = csv.trim().split('\n');

  if (lines.length < 2) {
    return { rows: [], errors: ['CSV must contain a header row and at least one data row'] };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

  for (const col of requiredColumns) {
    if (!headers.includes(col.toLowerCase())) {
      errors.push(`Missing required column: ${col}`);
    }
  }

  if (errors.length > 0) {
    return { rows: [], errors };
  }

  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map((v) => v.trim());
    const row: Record<string, string> = {};

    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? '';
    }

    // Validate required columns have non-empty values
    let valid = true;
    for (const col of requiredColumns) {
      if (!row[col.toLowerCase()]) {
        errors.push(`Row ${i + 1}: missing required value for "${col}"`);
        valid = false;
      }
    }

    if (valid) {
      rows.push(row);
    }
  }

  return { rows, errors };
}
