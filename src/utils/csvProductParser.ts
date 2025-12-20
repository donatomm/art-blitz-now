import { Product, ProductSize, MockRoom } from "@/types/product";

export type CSVImportMode = 'create' | 'update' | 'merge';

export interface ParsedProduct extends Omit<Product, "id" | "created_at" | "updated_at"> {
  id?: string; // Optional ID for updating existing products
}

export interface ParseResult {
  products: ParsedProduct[];
  errors: string[];
  warnings: string[];
}

/**
 * Parse CSV content with vertical/row-based format:
 * Nome Prodotto,Dimensioni,Prezzi,Descrizione,Stripe ID,Tecnica
 * 
 * Each product has multiple rows - first row has product name, subsequent rows are empty in Nome column.
 * Product ends when a new non-empty Nome appears.
 */
export function parseCSVProducts(csvContent: string, startingDisplayOrder: number = 0): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const products: ParsedProduct[] = [];

  const lines = csvContent.trim().split('\n');
  
  if (lines.length < 2) {
    errors.push("CSV deve contenere almeno l'header e una riga di dati");
    return { products, errors, warnings };
  }

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim());
  
  // Find column indices for vertical format
  const idIdx = findColumnIndex(headers, ['id', 'uuid', 'product_id', 'productid']);
  const nomeIdx = findColumnIndex(headers, ['nome prodotto', 'nome', 'name', 'product name']);
  const dimIdx = findColumnIndex(headers, ['dimensioni', 'dimensione', 'dim', 'size', 'sizes']);
  const prezzoIdx = findColumnIndex(headers, ['prezzi', 'prezzo', 'price', 'prices']);
  const descrizioneIdx = findColumnIndex(headers, ['descrizione', 'description']);
  const stripeIdx = findColumnIndex(headers, ['stripe id', 'stripe_id', 'stripeid', 'stripe']);
  const tecnicaIdx = findColumnIndex(headers, ['tecnica', 'medium', 'technique']);

  // Validate required columns
  if (nomeIdx === -1) {
    errors.push("Colonna 'Nome Prodotto' non trovata");
  }
  if (dimIdx === -1) {
    errors.push("Colonna 'Dimensioni' non trovata");
  }
  if (prezzoIdx === -1) {
    errors.push("Colonna 'Prezzi' non trovata");
  }

  if (errors.length > 0) {
    return { products, errors, warnings };
  }

  // Parse data rows - group by product
  let currentProduct: {
    id?: string;
    name: string;
    medium: string;
    description: string;
    stripeId: string;
    sizes: ProductSize[];
    mock_rooms: MockRoom[];
  } | null = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const rowNum = i + 1;

    try {
      const productId = idIdx !== -1 ? (values[idIdx]?.trim() || "") : "";
      const nome = values[nomeIdx]?.trim() || "";
      const dim = values[dimIdx]?.trim() || "";
      const prezzoRaw = values[prezzoIdx]?.trim() || "";

      // If we have a product name, start a new product
      if (nome) {
        // Save previous product if exists
        if (currentProduct && currentProduct.sizes.length > 0) {
          const productData: ParsedProduct = {
            name: currentProduct.name,
            medium: currentProduct.medium,
            description: currentProduct.description,
            image_url: "",
            sizes: currentProduct.sizes,
            display_order: startingDisplayOrder + products.length,
            deal_label_enabled: false,
            deal_label_text: "OFFERTA DEL GIORNO, scade h20:00",
            mock_rooms: currentProduct.mock_rooms,
            is_active: true,
          };
          if (currentProduct.id) {
            productData.id = currentProduct.id;
          }
          products.push(productData);
        }

        // Start new product
        const tecnica = tecnicaIdx !== -1 ? (values[tecnicaIdx]?.trim() || "Stampa su Tela") : "Stampa su Tela";
        const descrizione = descrizioneIdx !== -1 ? (values[descrizioneIdx]?.trim() || "") : "";
        const stripeId = stripeIdx !== -1 ? (values[stripeIdx]?.trim() || "") : "";

        currentProduct = {
          id: productId || undefined,
          name: nome,
          medium: tecnica,
          description: descrizione,
          stripeId: stripeId,
          sizes: [],
          mock_rooms: [],
        };
      }

      // Add dimension/price to current product
      if (currentProduct && dim && prezzoRaw) {
        const prezzo = parseFloat(prezzoRaw);
        if (isNaN(prezzo)) {
          warnings.push(`Riga ${rowNum}: Prezzo non valido "${prezzoRaw}" per dimensione ${dim}`);
        } else {
          currentProduct.sizes.push({
            dimensions: dim,
            price: prezzo,
            stripe_product_id: currentProduct.stripeId || undefined,
            deal_label_enabled: false,
            deal_label_text: "",
          });
          currentProduct.mock_rooms.push({
            url: "",
            label: `Mock ${dim}`,
          });
        }
      } else if (!nome && !dim && !prezzoRaw) {
        // Empty row, skip
        continue;
      } else if (currentProduct && (!dim || !prezzoRaw)) {
        warnings.push(`Riga ${rowNum}: Dimensione o prezzo mancante, riga saltata`);
      }

    } catch (e) {
      errors.push(`Riga ${rowNum}: Errore di parsing - ${e}`);
    }
  }

  // Don't forget the last product
  if (currentProduct && currentProduct.sizes.length > 0) {
    const productData: ParsedProduct = {
      name: currentProduct.name,
      medium: currentProduct.medium,
      description: currentProduct.description,
      image_url: "",
      sizes: currentProduct.sizes,
      display_order: startingDisplayOrder + products.length,
      deal_label_enabled: false,
      deal_label_text: "OFFERTA DEL GIORNO, scade h20:00",
      mock_rooms: currentProduct.mock_rooms,
      is_active: true,
    };
    if (currentProduct.id) {
      productData.id = currentProduct.id;
    }
    products.push(productData);
  }

  if (products.length === 0) {
    warnings.push("Nessun prodotto valido trovato nel CSV");
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
        i++;
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
 * Generate sample CSV template with vertical format
 */
export function generateCSVTemplate(): string {
  return `ID,Nome Prodotto,Dimensioni,Prezzi,Descrizione,Stripe ID,Tecnica
,NuovaOpera,40x60,119,Descrizione dell'opera...,prod_xxxxx,Stampa su Tela
,,75x100,149,,,,
,,80x120,185,,,,
abc-123-uuid,OperaEsistente,60x60,145,Aggiorna prodotto esistente...,prod_yyyyy,Stampa su Tela
,,80x80,195,,,,`;
}

/**
 * Export products to CSV format with vertical structure
 */
export function exportProductsToCSV(products: Product[]): string {
  const lines = ['ID,Nome Prodotto,Dimensioni,Prezzi,Descrizione,Stripe ID,Tecnica'];
  
  for (const product of products) {
    const stripeId = product.sizes[0]?.stripe_product_id || '';
    
    for (let i = 0; i < product.sizes.length; i++) {
      const size = product.sizes[i];
      
      if (i === 0) {
        // First row has all product info including ID
        lines.push([
          escapeCSVValue(product.id),
          escapeCSVValue(product.name),
          escapeCSVValue(size.dimensions),
          String(size.price),
          escapeCSVValue(product.description || ''),
          escapeCSVValue(stripeId),
          escapeCSVValue(product.medium),
        ].join(','));
      } else {
        // Subsequent rows only have dimension and price
        lines.push([
          '',
          '',
          escapeCSVValue(size.dimensions),
          String(size.price),
          '',
          '',
          '',
        ].join(','));
      }
    }
  }
  
  return lines.join('\n');
}

/**
 * Escape a value for CSV (wrap in quotes if contains comma, quote, or newline)
 */
function escapeCSVValue(value: string): string {
  if (!value) return '';
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
