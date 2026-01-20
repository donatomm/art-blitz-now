# User Journey - Peter (Visitatore)

> Percorso completo di un visitatore sul sito OctoWonders, dalla landing page alla ricezione dell'ordine.

---

## Diagramma di Flusso

```mermaid
flowchart TD
    A[🏠 Landing Page] --> B[HelloBar + Hero + Trust Bar]
    B --> C[Galleria Masonry]
    C --> D{Azione Utente}
    
    D -->|Click Immagine| E[📄 Pagina Prodotto]
    D -->|Click ACQUISTA| E
    D -->|Menu Blog| F[📚 Sezione Divulgativa]
    D -->|Menu Contatti| G[📧 Pagina Contatti]
    
    F --> F1[/blog - Container]
    F1 --> F2[/blog/articolo-n]
    F2 --> E
    
    E --> H[Carousel Mock Room]
    H --> I[Seleziona Dimensione]
    I --> J{Metodo Acquisto}
    
    J -->|Stripe Diretto| K[✅ Accetta Termini]
    K --> L[ACQUISTA ORA €X]
    L --> M[Checkout Stripe]
    
    J -->|Carrello| N[🛒 Add to Cart]
    N --> O[Apri Drawer Carrello]
    O --> P[Checkout Carrello]
    P --> M
    
    J -->|Contatto Diretto| Q[💬 WhatsApp / 📧 Email]
    Q --> R[Messaggio Pre-compilato]
    R --> S[Risposta Manuale]
    
    M --> T[/checkout/success]
    T --> U[📧 Email Conferma Stripe]
    U --> V[📦 Spedizione]
    V --> W[🎉 Consegna]
    
    E --> X[Opere Correlate]
    X --> E
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style T fill:#9f9,stroke:#333,stroke-width:2px
    style W fill:#9f9,stroke:#333,stroke-width:2px
```

---

## Fasi del Journey

### 1. Arrivo (Landing Page)

**URL:** `/`

**Componenti visualizzati:**
- **HelloBar** (opzionale): Banner superiore con promozioni, countdown, popup dettagli
- **Navigation**: Logo, menu voci, icona carrello (se abilitato)
- **Hero**: Immagine full-width, H1, sottotitolo, CTA "Esplora la Collezione"
- **Trust Bar**: Badge fiducia (Spedizione Gratuita, Pagamento Sicuro, etc.)
- **Galleria Masonry**: Grid responsive con tutti i prodotti attivi

**Interazioni possibili:**
- Scroll verso galleria (click CTA Hero)
- Click su voce menu
- Click su prodotto nella galleria
- Apertura popup HelloBar dettagli

---

### 2. Esplorazione Galleria

**Componente:** `MasonryGrid` → `ProductCard`

**Elementi ProductCard:**
| Elemento | Descrizione |
|----------|-------------|
| Immagine | Thumbnail prodotto con lazy loading |
| Badge NEW | Visibile se `is_new = true` |
| Badge OFFERTA | Visibile se `deal_label_enabled = true` |
| Nome | Titolo opera |
| Medium | Tecnica artistica |
| Prezzo | Prezzo minimo disponibile (€XX) |
| Bottone ACQUISTA | Naviga a `/product/{slug}#acquista` |

**Logica prezzo minimo:**
```typescript
// Solo sizes con price > 0 vengono considerati
const minPrice = Math.min(...sizes.filter(s => s.price > 0).map(s => s.price));
```

**Note:**
- Prodotti con `is_active = false` non vengono mostrati
- Prodotti "Coming Soon" mostrano immagine sfocata, no navigazione

---

### 3. Sezione Divulgativa (/blog)

**Struttura attuale:**
```
/blog → CMSPage.tsx (pagina singola con contenuto HTML/Markdown)
```

**Struttura futura (nested routes):**
```
/blog           → Container con lista articoli
/blog/articolo-1 → NestedCMSPage.tsx (articolo singolo)
/blog/articolo-2 → NestedCMSPage.tsx (articolo singolo)
```

**Supporto contenuto:**
- Markdown con sintassi standard (`**bold**`, `## heading`, liste)
- HTML raw (`<span style="color: red;">testo</span>`)
- Immagini caricate in Supabase Storage

---

### 4. Pagina Prodotto

**URL:** `/product/{slug}`

**Componente:** `Product.tsx`

**Sezioni:**

#### 4.1 Carousel Mock Room
- Stile Netflix (scroll orizzontale)
- Immagini mock room per ogni dimensione disponibile
- Solo dimensioni con `price > 0` mostrate
- Label custom da database, fallback a dimensione normalizzata

#### 4.2 Selettore Dimensioni
```
┌─────────────────────────────────────┐
│  40x40  │  60x60  │  80x80  │ ...  │
│  €44    │  €70    │  €95    │      │
└─────────────────────────────────────┘
```

**Logica normalizzazione dimensioni:**
```typescript
// 80x120 e 120x80 sono lo stesso SKU
function normalizeDimension(dim: string): string {
  const [a, b] = dim.split('x').map(Number);
  return `${Math.min(a, b)}x${Math.max(a, b)}`;
}
```

#### 4.3 Sistema Offerte
| Campo | Descrizione |
|-------|-------------|
| `deal_label_enabled` | Abilita visualizzazione offerta |
| `deal_price` | Prezzo scontato (sovrascrive price) |
| `deal_label_text` | Testo badge (es. "OFFERTA NATALE") |

#### 4.4 Deadline Personalizzabile
- Messaggio urgenza per ordini (es. "Ordina entro il 20/12 per Natale!")
- Configurabile da AdminPanel

---

### 5. Opere Correlate

**Componente:** `RelatedProducts.tsx`

**Logica matching:**
1. Cerca prodotti con tag in comune (`hasMatchingTags`)
2. Se trovati → Titolo "Opere Correlate"
3. Se non trovati → Fallback "Altre Opere" (prodotti attivi random)

**Filtri applicati:**
- `is_active = true`
- `slug` presente
- Nome non contiene "coming soon"
- Massimo 4 prodotti

**Tags disponibili:**
- `polpo`, `acciuga`, `pesce`, `astratto`, `custom`

---

### 6. Percorsi di Acquisto

#### Opzione A: Stripe Diretto (Primaria)

```
┌────────────────────────────────────────┐
│  ☑️ Accetto termini e condizioni       │
│                                        │
│  ┌────────────────────────────────┐   │
│  │  🛒 ACQUISTA ORA - €95         │   │
│  └────────────────────────────────┘   │
│                                        │
│  Hai domande? Contattami              │
└────────────────────────────────────────┘
```

**Flusso:**
1. Seleziona dimensione
2. Accetta termini (checkbox obbligatoria)
3. Click "ACQUISTA ORA"
4. Redirect a Stripe Checkout
5. Pagamento con carta
6. Redirect a `/checkout/success`

**Edge Function:** `create-checkout`
- Riceve `product_id` + `size_dimensions` (o `size_index` per retrocompatibilità)
- Legge prezzo corrente da database
- Crea sessione Stripe con prezzo dinamico

#### Opzione B: Carrello (Multi-prodotto)

**Feature flag:** `VITE_ENABLE_CART=true`

**Storage:** `localStorage` only (no database)

**Struttura item carrello:**
```typescript
interface CartItem {
  productId: string;      // UUID prodotto
  sizeDimensions: string; // "60x90" (stabile, non index)
  quantity: number;
}
```

**Flusso:**
1. Click "Aggiungi al Carrello" (no termini richiesti)
2. Badge counter si aggiorna
3. Apri drawer carrello
4. Prezzi fresh caricati da Supabase
5. Click "Checkout"
6. Singola sessione Stripe per tutti gli items
7. Redirect a `/checkout/success`

#### Opzione C: Contatto Diretto

**WhatsApp:**
```
Ciao Marco, Sono interessato/a all'opera
- Opera: {nome}
- Dimensione: {size}
- Prezzo: €{price}
- MESSAGGIO QUI SOTTO:
[spazio per messaggio utente]
- Grazie!
```

**Email:**
- Subject: `Richiesta informazioni - {nome opera}`
- Body: stesso template WhatsApp

---

### 7. Conferma (/checkout/success)

**URL:** `/checkout/success`

**Componente:** `CheckoutSuccess.tsx`

**Azioni automatiche:**
- Svuotamento carrello (`localStorage.removeItem`)
- Tracking analytics (se configurato)

**Contenuto pagina:**
- ✅ Messaggio conferma ordine
- 📧 Info email conferma in arrivo
- 📦 Prossimi passi spedizione
- 💬 Invito VIP WhatsApp
- 🏠 Link ritorno homepage
- 🖼️ Link ritorno galleria

---

### 8. Ricezione Ordine

**Timeline tipica:**

| Fase | Tempistica | Descrizione |
|------|------------|-------------|
| Email Stripe | Immediata | Conferma pagamento + ricevuta |
| Preparazione | 1-3 giorni | Stampa e preparazione opera |
| Spedizione | Variabile | Corriere (tracking via email) |
| Consegna | 3-7 giorni | Consegna a domicilio |

**Note spedizione:**
- Gratuita per Italia
- Imballaggio protettivo incluso
- Tracking disponibile

---

## Visualizzazione Diagramma

### GitHub
Il diagramma Mermaid viene renderizzato automaticamente.

### VS Code
Installa estensione: **"Markdown Preview Mermaid Support"**

### Figma (Export)
1. Vai a [mermaid.live](https://mermaid.live)
2. Incolla il codice Mermaid
3. Esporta come PNG o SVG
4. Importa in Figma

---

## Reference Codebase

| Componente | File |
|------------|------|
| Landing Page | `src/pages/Index.tsx` |
| Product Card | `src/components/ProductCard.tsx` |
| Product Page | `src/pages/Product.tsx` |
| Related Products | `src/components/RelatedProducts.tsx` |
| Cart Drawer | `src/components/CartDrawer.tsx` |
| Cart Context | `src/contexts/CartContext.tsx` |
| Checkout Success | `src/pages/CheckoutSuccess.tsx` |
| Create Checkout | `supabase/functions/create-checkout/index.ts` |
