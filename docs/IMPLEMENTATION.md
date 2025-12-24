# OctoWonders - Implementation Documentation

## Overview

**OctoWonders** is an e-commerce website for selling art prints by Marco De Francesco. Built with React + TypeScript + Vite, powered by Lovable Cloud (Supabase) for backend services and Stripe for payments.

**Live URL**: `octowonders.lovable.app`

---

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **TanStack Query** - Server state management
- **React Context** - Client state (Cart, Auth)
- **React Router DOM** - Routing
- **react-helmet-async** - SEO meta tags
- **Framer Motion** - Animations (available but not heavily used)

### Backend (Lovable Cloud)
- **Database** - PostgreSQL
- **Authentication** - Email/password with role-based access
- **Edge Functions** - Serverless functions for Stripe checkout, sitemap generation
- **Storage** - Product images bucket

### Payments
- **Stripe** - Checkout Sessions API

---

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── AdminPanel.tsx         # Admin dashboard with tabs
│   ├── BuyDialog.tsx          # Product purchase dialog
│   ├── CanvasCustomizationOptions.tsx
│   ├── CartDrawer.tsx         # Shopping cart sidebar
│   ├── FloatingCartButton.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx               # Homepage hero section
│   ├── ImageOptimizer.tsx     # Admin image optimization tool
│   ├── ImageUpload.tsx        # Admin image upload
│   ├── MasonryGrid.tsx        # Product gallery grid
│   ├── Navigation.tsx         # Site navigation
│   ├── OptimizedImage.tsx     # Lazy-loading image component
│   ├── PageContent.tsx        # CMS page renderer
│   ├── ProductCard.tsx        # Product display card
│   ├── SEO.tsx                # Meta tags component
│   ├── SKUEditor.tsx          # Admin SKU management
│   └── TrustBar.tsx           # Trust indicators
├── contexts/
│   └── CartContext.tsx        # Shopping cart state
├── hooks/
│   ├── use-mobile.tsx         # Mobile detection
│   ├── use-toast.ts           # Toast notifications
│   ├── usePages.ts            # CMS pages CRUD
│   └── useProducts.ts         # Products CRUD
├── pages/
│   ├── Index.tsx              # Homepage
│   ├── Product.tsx            # Product detail page
│   ├── Artist.tsx             # Artist bio page
│   ├── Contact.tsx            # Contact page
│   ├── CheckoutSuccess.tsx    # Post-purchase success
│   ├── OrdinePersonalizzato.tsx # Custom order page
│   └── [Legal pages...]       # Privacy, Terms, Cookies, etc.
├── integrations/supabase/
│   ├── client.ts              # Supabase client (auto-generated)
│   └── types.ts               # Database types (auto-generated)
├── types/
│   └── product.ts             # Product TypeScript interfaces
└── utils/
    ├── csvProductParser.ts    # CSV import/export
    └── sanitizeHtml.ts        # HTML sanitization
```

---

## Database Schema

### `products` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Product name |
| slug | TEXT | URL-friendly identifier |
| description | TEXT | Product description |
| medium | TEXT | Art medium (e.g., "Acquerello") |
| image_url | TEXT | Main product image |
| sizes | JSONB | Array of size/price options |
| mock_rooms | JSONB | Array of room mockup images |
| is_active | BOOLEAN | Published status |
| is_new | BOOLEAN | "New" badge flag |
| deal_label_enabled | BOOLEAN | Show deal label |
| deal_label_text | TEXT | Deal label content |
| display_order | INTEGER | Sort order |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

**Product Size Structure (JSONB):**
```typescript
interface ProductSize {
  dimensions: string;      // e.g., "40x40"
  price: number;           // Regular price in EUR
  isAvailable: boolean;
  sku?: string;
  originalPrice?: number;  // For deals/discounts
}
```

**Mock Room Structure (JSONB):**
```typescript
interface MockRoom {
  url: string;
  dimensions?: string;
}
```

### `pages` Table (CMS)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | TEXT | URL identifier |
| title | TEXT | Page title |
| content | TEXT | HTML/Markdown content |
| seo_title | TEXT | SEO meta title |
| seo_description | TEXT | SEO meta description |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

### `user_roles` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to auth.users |
| role | ENUM | 'admin' or 'user' |

---

## Authentication & Authorization

### Authentication Flow
- Email/password authentication via Supabase Auth
- Auto-confirm enabled for email signups
- Session persisted in localStorage

### Role-Based Access
- **Admin role**: Full CRUD on products and pages
- **User role**: Read-only access
- Role checked via `has_role()` database function

### RLS Policies
- Products: Public read, admin-only write
- Pages: Public read, admin-only write
- User roles: Users can read own role, admin-only write

---

## E-commerce Features

### Shopping Cart
- **State Management**: React Context (`CartContext.tsx`)
- **Persistence**: localStorage
- **UI**: Slide-out drawer (`CartDrawer.tsx`)
- **Feature Flag**: Cart can be disabled (currently showing "Coming Soon")

### Product Sizes & Pricing
- Stored as JSONB array in `products.sizes`
- Supports regular and sale prices (`price` vs `originalPrice`)
- Availability per size (`isAvailable`)
- SKU tracking per size

### Stripe Integration
- **Edge Function**: `supabase/functions/create-checkout/index.ts`
- **Checkout Flow**:
  1. User selects product + size
  2. Frontend calls edge function with line items
  3. Edge function creates Stripe Checkout Session
  4. User redirected to Stripe hosted checkout
  5. Success redirect to `/checkout-success`
- **Shipping**: Fixed rate (€5) or free over €100, Italy only
- **Environment Variables**:
  - `STRIPE_SECRET_KEY` - Server-side API key
  - `VITE_STRIPE_PUBLISHABLE_KEY` - Client-side key

---

## Admin Panel Features

Located in `AdminPanel.tsx`, accessible to users with admin role.

### Tabs
1. **Prodotti** - Product management
   - Create, edit, delete products
   - Image upload with optimization
   - Size/price configuration
   - Mock room image management
   - Display order drag-and-drop

2. **Pagine** - CMS page editor
   - Edit page content (HTML/Markdown)
   - SEO title and description

3. **SKU Editor** - Bulk SKU management
   - View all products and sizes
   - Edit SKUs inline

4. **Strumenti** - Tools
   - Image optimizer (WebP conversion)
   - CSV import/export for products

---

## Edge Functions

### `create-checkout`
Creates Stripe Checkout Session for single or cart purchases.

**Request Body:**
```typescript
{
  items: Array<{
    productId: string;
    sizeDimensions: string;
    quantity: number;
  }>;
  isCart?: boolean;
}
```

### `setup-admin`
One-time setup to assign admin role to a user.

### `sitemap`
Generates dynamic XML sitemap including all products.

---

## Storage

### `product-images` Bucket
- Public read access
- Admin-only upload
- Supports WebP conversion via ImageOptimizer component

---

## Environment Variables

### Frontend (VITE_)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key
- `VITE_SUPABASE_PROJECT_ID` - Project identifier
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key

### Backend (Edge Functions)
- `STRIPE_SECRET_KEY` - Stripe secret key

---

## Static Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Index | Homepage with gallery |
| `/prodotto/:slug` | Product | Product detail page |
| `/artista` | Artist | Artist biography (CMS) |
| `/contatti` | Contact | Contact information |
| `/ordine-personalizzato` | Custom Order | Custom order form |
| `/checkout-success` | Checkout Success | Post-purchase confirmation |
| `/spedizioni` | Shipping | Shipping policy |
| `/resi-rimborsi` | Returns | Returns policy |
| `/politica-prezzi` | Pricing | Pricing policy |
| `/nota-clienti` | Customer Note | Customer info (CMS) |
| `/privacy` | Privacy | Privacy policy |
| `/termini` | Terms | Terms of service |
| `/cookies` | Cookies | Cookie policy |

---

## SEO Implementation

- **Meta Tags**: Managed via `SEO.tsx` component with react-helmet-async
- **Sitemap**: Dynamic generation via edge function
- **robots.txt**: Configured in `/public/robots.txt`
- **Structured Data**: JSON-LD for products
- **Image Optimization**: WebP format, lazy loading

---

## Upcoming Features

### Showcase Carousel (Planned)
A homepage carousel showcasing selected products.

**Database Schema:**
```sql
CREATE TABLE showcase_items (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  display_order INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Components:**
- `ShowcaseCarousel.tsx` - Carousel display
- Admin panel integration for managing items

---

## Development Notes

### Code Conventions
- TypeScript strict mode
- Tailwind CSS with semantic tokens
- Component-based architecture
- React Query for server state
- Context for client state

### File Naming
- Components: PascalCase (`ProductCard.tsx`)
- Hooks: camelCase with `use` prefix (`useProducts.ts`)
- Utils: camelCase (`sanitizeHtml.ts`)
- Pages: PascalCase (`Product.tsx`)

### Import Aliases
- `@/` maps to `src/`
- Example: `import { Button } from "@/components/ui/button"`
