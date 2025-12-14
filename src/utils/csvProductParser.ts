import { Product, ProductSize, MockRoom } from "@/types/product";

export interface CSVProductRow {
  nome: string;
  tecnica: string;
  dimensioni: string[];
  prezzi: number[];
  descrizione: string;
  stripeId: string;
}

export interface ParseResult {
  products: Omit<Product, "id" | "created_at" | "updated_at">[];
  errors: string[];
  warnings: string[];
}

/**
 * Parse CSV content with format:
 * Nome,Tecnica,Dimensioni,Prezzi,Descrizione,Stripe_ID
 * 
 * Dimensioni and Prezzi are comma-separated (e.g., "40x60,75x100,80x120" and "119,149,185")
 */
export function parseCSVProducts(csvContent: string, startingDisplayOrder: number = 0): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const products: Omit<Product, "id" | "created_at" | "updated_at">[] = [];

  const lines = csvContent.trim().split('\n');
  
  if (lines.length < 2) {
    errors.push("CSV deve contenere almeno l'header e una riga di dati");
    return { products, errors, warnings };
  }

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim());
  
  // Expected columns (flexible naming)
  const nomeIdx = findColumnIndex(headers, ['nome', 'nome prodotto', 'name', 'product name']);
  const tecnicaIdx = findColumnIndex(headers, ['tecnica', 'medium', 'technique']);
  const dimensioniIdx = findColumnIndex(headers, ['dimensioni', 'dimensions', 'sizes']);
  const prezziIdx = findColumnIndex(headers, ['prezzi', 'prices', 'prezzo', 'price']);
  const descrizioneIdx = findColumnIndex(headers, ['descrizione', 'description']);
  const stripeIdx = findColumnIndex(headers, ['stripe_id', 'stripeid', 'stripe id', 'stripe']);

  // Validate required columns
  if (nomeIdx === -1) {
    errors.push("Colonna 'Nome' non trovata");
  }
  if (dimensioniIdx === -1) {
    errors.push("Colonna 'Dimensioni' non trovata");
  }
  if (prezziIdx === -1) {
    errors.push("Colonna 'Prezzi' non trovata");
  }

  if (errors.length > 0) {
    return { products, errors, warnings };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = parseCSVLine(line);
    const rowNum = i + 1;

    try {
      const nome = values[nomeIdx]?.trim() || "";
      const tecnica = tecnicaIdx !== -1 ? (values[tecnicaIdx]?.trim() || "Stampa su Tela") : "Stampa su Tela";
      const dimensioniRaw = values[dimensioniIdx]?.trim() || "";
      const prezziRaw = values[prezziIdx]?.trim() || "";
      const descrizione = descrizioneIdx !== -1 ? (values[descrizioneIdx]?.trim() || "") : "";
      const stripeId = stripeIdx !== -1 ? (values[stripeIdx]?.trim() || "") : "";

      if (!nome) {
        warnings.push(`Riga ${rowNum}: Nome vuoto, riga saltata`);
        continue;
      }

      // Parse dimensions and prices
      const dimensioni = dimensioniRaw.split(',').map(d => d.trim()).filter(d => d);
      const prezzi = prezziRaw.split(',').map(p => {
        const num = parseFloat(p.trim());
        return isNaN(num) ? 0 : num;
      });

      if (dimensioni.length === 0) {
        warnings.push(`Riga ${rowNum} (${nome}): Nessuna dimensione trovata, riga saltata`);
        continue;
      }

      if (dimensioni.length !== prezzi.length) {
        warnings.push(`Riga ${rowNum} (${nome}): ${dimensioni.length} dimensioni ma ${prezzi.length} prezzi - usando prezzi disponibili`);
      }

      // Create sizes array
      const sizes: ProductSize[] = dimensioni.map((dim, idx) => ({
        dimensions: dim,
        price: prezzi[idx] ?? 0,
        stripe_product_id: stripeId || undefined,
        deal_label_enabled: false,
        deal_label_text: "",
      }));

      // Auto-generate mock_rooms from dimensions
      const mock_rooms: MockRoom[] = dimensioni.map(dim => ({
        url: "",
        label: `Mock ${dim}`,
      }));

      products.push({
        name: nome,
        medium: tecnica,
        description: descrizione,
        image_url: "",
        sizes,
        display_order: startingDisplayOrder + products.length,
        deal_label_enabled: false,
        deal_label_text: "OFFERTA DEL GIORNO, scade h20:00",
        mock_rooms,
      });

    } catch (e) {
      errors.push(`Riga ${rowNum}: Errore di parsing - ${e}`);
    }
  }

  return { products, errors, warnings };
}

/**
 * Parse a CSV line handling quoted values with commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Find column index from possible header names
 */
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const idx = headers.indexOf(name.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

/**
 * Generate sample CSV template
 */
export function generateCSVTemplate(): string {
  return `Nome,Tecnica,Dimensioni,Prezzi,Descrizione,Stripe_ID
NuovaOpera,Stampa su Tela,"40x60,75x100,80x120","119,149,185","Descrizione dell'opera...",prod_xxxxx
AltraOpera,Stampa su Tela,"60x60,80x80","145,195","Altra descrizione...",prod_yyyyy`;
}
