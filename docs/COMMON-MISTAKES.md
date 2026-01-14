# Common Mistakes: SSG/LCP Regressions

> Real examples from this project showing what went wrong and how we fixed it.

## How to Use This Document

When investigating performance issues or reviewing code changes, reference these case studies. Each documents an actual regression that occurred, with before/after code examples.

---

## Case Study 1: The useSiteSettings API Waterfall

### Problem
`useSiteSettings()` hook was making API calls on every page load, blocking the Hero H1 element for **2,420ms**.

### Root Cause
The hook fetched from Supabase at runtime instead of using pre-built static data.

### Before (Wrong)
```typescript
// Index.tsx - WRONG: API call blocks LCP
import { useSiteSettings, getSettingValue } from "@/hooks/useSiteSettings";

const Index = () => {
  const { data: settings } = useSiteSettings(); // ← Network request!
  const heroTitle = getSettingValue(settings, 'hero_title', 'Default');
  
  return <Hero title={heroTitle} />; // ← Waits for API response
};
```

### After (Correct)
```typescript
// Index.tsx - CORRECT: Static data, no API call
import { useStaticSiteSettings } from "@/hooks/useStaticSiteSettings";

const Index = () => {
  const staticSettings = useStaticSiteSettings(); // ← Bundled data
  
  return <Hero title={staticSettings.hero_title} />; // ← Instant
};
```

### Prevention Pattern
Created `useStaticSiteSettings` hook + prebuild script that bakes all settings into the bundle at build time.

### Key Files
- `src/hooks/useStaticSiteSettings.ts` - SSG-safe hook
- `src/generated/staticSiteSettings.ts` - Build-time generated data
- `scripts/prebuild.ts` - Generates static data

---

## Case Study 2: Incomplete Static Settings Coverage

### Problem
Performance regressed again because `prebuild.ts` only included 5 hero settings, but Navigation and HelloBar needed **15+ more settings** - forcing API calls.

### Root Cause
Partial implementation - static hooks existed but didn't cover all settings used in LCP-critical path.

### Before (Wrong)
```typescript
// prebuild.ts - WRONG: Only hero settings
const generateStaticSiteSettings = async () => {
  const settings = await fetchAllSettings();
  
  return {
    hero_title: settings.hero_title,
    hero_subtitle: settings.hero_subtitle,
    hero_cta_text: settings.hero_cta_text,
    // Missing: hellobar_*, nav_items - still fetched at runtime!
  };
};
```

### After (Correct)
```typescript
// prebuild.ts - CORRECT: ALL settings for LCP-critical components
const generateStaticSiteSettings = async () => {
  const settings = await fetchAllSettings();
  
  return {
    // Hero settings (all of them)
    hero_title: settings.hero_title,
    hero_subtitle: settings.hero_subtitle,
    hero_cta_text: settings.hero_cta_text,
    hero_cta_url: settings.hero_cta_url,
    hero_image_url: settings.hero_image_url,
    
    // Navigation settings
    nav_items: settings.nav_items,
    
    // HelloBar settings (ALL 15+ fields)
    hellobar_enabled: settings.hellobar_enabled,
    hellobar_text: settings.hellobar_text,
    hellobar_bg_color: settings.hellobar_bg_color,
    hellobar_text_color: settings.hellobar_text_color,
    hellobar_countdown_enabled: settings.hellobar_countdown_enabled,
    hellobar_countdown_end: settings.hellobar_countdown_end,
    // ... all remaining hellobar fields
  };
};
```

### Prevention Checklist
When adding new settings, ask: **"Is this used before LCP element renders?"**

If yes → add to `prebuild.ts` and `StaticSiteSettings` type.

---

## Case Study 3: The Lazy-Loaded Component That Still Fetched

### Problem
`AdminPanel` was lazy-loaded with `React.lazy()`, but products API calls were still happening for **ALL visitors**.

### Root Cause
Looked at rendering output, not execution path. The component returned null for non-admins, but `useProducts()` was called unconditionally at the top.

### Before (Wrong)
```typescript
// AdminPanel.tsx - WRONG: Hook runs BEFORE the return null
const AdminPanel = () => {
  const { data: products } = useProducts(); // ← RUNS FOR EVERYONE!
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Auth check happens AFTER the query starts
  useEffect(() => {
    checkAuth().then(setIsAuthenticated);
  }, []);
  
  if (!isAuthenticated) return null; // ← Only affects rendering, not execution
  
  return <div>Admin content with {products?.length} products</div>;
};
```

### After (Correct)
```typescript
// AdminPanel.tsx - CORRECT: Query only runs when authenticated
const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    checkAuth().then(setIsAuthenticated);
  }, []);
  
  // Only fetch when authenticated
  const { data: products } = useProducts({ 
    enabled: isAuthenticated // ← Query doesn't run until auth confirmed
  });
  
  if (!isAuthenticated) return null;
  
  return <div>Admin content with {products?.length} products</div>;
};
```

### Prevention Rule
**Trace what EXECUTES, not just what RENDERS.**

React hooks run top-to-bottom BEFORE the return statement is evaluated.

---

## Case Study 4: CartDrawer Hidden Fetch

### Problem
Products API was being called on page load even though `Index.tsx` used `useStaticProducts()`.

### Root Cause
`CartDrawer` component in `RootLayout` was using `useProducts()` unconditionally to resolve product details from cart items.

### Before (Wrong)
```typescript
// CartDrawer.tsx - WRONG: Fetches always, even when drawer closed
const CartDrawer = () => {
  const { items } = useCart();
  const { data: products } = useProducts(); // ← RUNS ON EVERY PAGE LOAD!
  
  // Even though this only renders when drawer is open,
  // the hook executes regardless
  return (
    <Sheet>
      {items.map(item => {
        const product = products?.find(p => p.id === item.productId);
        return <CartItem product={product} />;
      })}
    </Sheet>
  );
};
```

### After (Correct)
```typescript
// CartDrawer.tsx - CORRECT: Uses static products
const CartDrawer = () => {
  const { items, isCartOpen } = useCart();
  const { products } = useStaticProducts(); // ← No API call, bundled data
  
  // OR: only fetch when drawer opens
  // const { data: products } = useProducts({ enabled: isCartOpen });
  
  return (
    <Sheet>
      {items.map(item => {
        const product = products?.find(p => p.id === item.productId);
        return <CartItem product={product} />;
      })}
    </Sheet>
  );
};
```

### Prevention Rule
**Check all components in RootLayout - they run for EVERY visitor on EVERY page.**

---

## Case Study 5: SSG Hydration Mismatch with window

### Problem
`useIsMobile()` hook caused hydration errors because it accessed `window.innerWidth` during SSG.

### Before (Wrong)
```typescript
// use-mobile.tsx - WRONG: Crashes during SSG
export function useIsMobile() {
  // ReferenceError: window is not defined (during build)
  const isMobile = window.innerWidth < 768;
  return isMobile;
}
```

### After (Correct)
```typescript
// use-mobile.tsx - CORRECT: SSG-safe with useEffect
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false); // Safe default for SSG
  
  useEffect(() => {
    // Only access window on client
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    
    const mql = window.matchMedia(`(max-width: 767px)`);
    mql.addEventListener("change", checkMobile);
    return () => mql.removeEventListener("change", checkMobile);
  }, []);
  
  return isMobile;
}
```

### Prevention Pattern
**Never access browser APIs at module level or in initial render.**

Safe patterns:
- `useEffect` for client-only code
- `typeof window !== 'undefined'` guards
- Default to a safe value during SSG

---

## Case Study 6: Context Without SSG Fallback

### Problem
`useCart()` threw errors during SSG because `CartContext` wasn't available outside the provider during static generation.

### Before (Wrong)
```typescript
// CartContext.tsx - WRONG: Throws during SSG
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be within CartProvider"); // ← SSG fails
  }
  return context;
};
```

### After (Correct)
```typescript
// CartContext.tsx - CORRECT: SSG-safe fallback
const ssgSafeDefaults: CartContextType = {
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getItemCount: () => 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    // SSG continues with safe defaults instead of crashing
    return ssgSafeDefaults;
  }
  return context;
};
```

### Prevention Pattern
**Always provide SSG-safe defaults for context hooks.**

The defaults should be no-op functions that don't break the component but also don't do anything harmful.

---

## Quick Reference: The 6 Common Mistakes

| # | Mistake | Symptom | Prevention |
|---|---------|---------|------------|
| 1 | API call in LCP path | High Element Render Delay in Lighthouse | Use static data hooks (`useStaticProducts`, `useStaticSiteSettings`) |
| 2 | Incomplete static data | Some settings work, others cause API calls | Audit ALL settings used in LCP components |
| 3 | Hook before auth check | API runs for all visitors, not just admins | Use `enabled` option in queries |
| 4 | RootLayout data fetch | Every page makes API calls on load | Use static data or conditional fetch in RootLayout |
| 5 | Browser API at top level | SSG build fails or hydration mismatch | Wrap in `useEffect`, guard with `typeof window` |
| 6 | Context without fallback | SSG throws errors | Provide safe default values |

---

## The Golden Debugging Questions

When investigating LCP regressions, ask these questions:

### 1. "What network requests fire on first page load?"
Open DevTools Network tab, hard refresh, check what requests happen before LCP.

### 2. "Which hooks run BEFORE the Hero renders?"
Trace the component tree from `RootLayout` → `Index` → `Hero`. Every hook in that path executes.

### 3. "What's in RootLayout that runs for everyone?"
Check `RootLayout.tsx` for any data-fetching hooks. These affect every single page.

### 4. "Does prebuild.ts include ALL data needed before LCP?"
Compare settings used in `Navigation`, `HelloBar`, `Hero` with what's in `staticSiteSettings`.

### 5. "Did I check EXECUTION or just RENDERING?"
A component can `return null` but still execute expensive hooks. Trace the code path, not the visual output.

---

## See Also

- [SAFETY-CHECK.md](./SAFETY-CHECK.md) - Pre-implementation checklist
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Architecture overview
- [SEO.md](./SEO.md) - SEO requirements
