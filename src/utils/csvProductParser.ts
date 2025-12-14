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
 * Parse CSV content with column-based format:
 * Nome,Tecnica,Dim1,Prezzo1,Dim2,Prezzo2,Dim3,Prezzo3,Descrizione,Stripe_ID
 * 
 * Supports up to 6 dimension/price pairs (Dim1-Dim6, Prezzo1-Prezzo6)
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
  
  // Find column indices
  const nomeIdx = findColumnIndex(headers, ['nome', 'nome prodotto', 'name', 'product name']);
  const tecnicaIdx = findColumnIndex(headers, ['tecnica', 'medium', 'technique']);
  const descrizioneIdx = findColumnIndex(headers, ['descrizione', 'description']);
  const stripeIdx = findColumnIndex(headers, ['stripe_id', 'stripeid', 'stripe id', 'stripe']);

  // Find dimension/price/mock column sets (Dim1/Prezzo1/Mock1 through Dim6/Prezzo6/Mock6)
  const dimPriceMockColumns: { dimIdx: number; prezzoIdx: number; mockIdx: number }[] = [];
  for (let i = 1; i <= 6; i++) {
    const dimIdx = findColumnIndex(headers, [`dim${i}`, `dimensione${i}`, `size${i}`]);
    const prezzoIdx = findColumnIndex(headers, [`prezzo${i}`, `price${i}`, `p${i}`]);
    const mockIdx = findColumnIndex(headers, [`mock${i}`, `mockroom${i}`, `label${i}`]);
    if (dimIdx !== -1 && prezzoIdx !== -1) {
      dimPriceMockColumns.push({ dimIdx, prezzoIdx, mockIdx });
    }
  }

  // Validate required columns
  if (nomeIdx === -1) {
    errors.push("Colonna 'Nome' non trovata");
  }
  if (dimPriceMockColumns.length === 0) {
    errors.push("Nessuna coppia Dim/Prezzo trovata (es. Dim1, Prezzo1)");
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
      const descrizione = descrizioneIdx !== -1 ? (values[descrizioneIdx]?.trim() || "") : "";
      const stripeId = stripeIdx !== -1 ? (values[stripeIdx]?.trim() || "") : "";

      if (!nome) {
        warnings.push(`Riga ${rowNum}: Nome vuoto, riga saltata`);
        continue;
      }

      // Extract dimension/price pairs from columns
      const sizes: ProductSize[] = [];
      const mock_rooms: MockRoom[] = [];

      for (const { dimIdx, prezzoIdx, mockIdx } of dimPriceMockColumns) {
        const dim = values[dimIdx]?.trim() || "";
        const prezzoRaw = values[prezzoIdx]?.trim() || "";
        const mockLabel = mockIdx !== -1 ? (values[mockIdx]?.trim() || "") : "";
        
        if (dim && prezzoRaw) {
          const prezzo = parseFloat(prezzoRaw);
          if (isNaN(prezzo)) {
            warnings.push(`Riga ${rowNum} (${nome}): Prezzo non valido "${prezzoRaw}" per dimensione ${dim}`);
            continue;
          }
          
          sizes.push({
            dimensions: dim,
            price: prezzo,
            stripe_product_id: stripeId || undefined,
            deal_label_enabled: false,
            deal_label_text: "",
          });

          mock_rooms.push({
            url: "",
            label: mockLabel || `Mock ${dim}`,
          });
        }
      }

      if (sizes.length === 0) {
        warnings.push(`Riga ${rowNum} (${nome}): Nessuna dimensione/prezzo valida trovata, riga saltata`);
        continue;
      }

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
 * Generate sample CSV template with column-based format
 */
export function generateCSVTemplate(): string {
  return `Nome,Tecnica,Dim1,Prezzo1,Mock1,Dim2,Prezzo2,Mock2,Dim3,Prezzo3,Mock3,Descrizione,Stripe_ID
NuovaOpera,Stampa su Tela,40x60,119,Soggiorno,75x100,149,Camera,80x120,185,Studio,Descrizione...,prod_xxxxx
AltraOpera,Stampa su Tela,60x60,145,Salotto,80x80,195,Ingresso,,,,,prod_yyyyy`;
}
