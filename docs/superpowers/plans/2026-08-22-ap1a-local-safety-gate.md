# AP1A Local Safety Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local, repeatable safety check for availability, search visibility and the path to correct payment, without changing the live store or any outside account.

**Architecture:** Small TypeScript checkers read the committed catalogue, page list, hosting rules and built website. They produce a concise result and a private evidence file. Unit tests prove that the checkers distinguish healthy examples from the failures already observed. Today's store remains red until separately approved repairs resolve those findings.

**Tech Stack:** Node.js 20, TypeScript 5.8, `tsx`, Node's built-in test runner, the existing Vite static build, and a GitHub Actions definition prepared locally but not activated.

**Spec:** `docs/2026-08-22-ap0-authority-and-p0-safety-foundation-approval-package.md`

## Donato summary

This first block adds a safety inspection beside the store. It does not change what customers see. The inspection will deliberately report red on today's known problems. That is correct. Nothing is published, no message is sent, no outside service is connected and automatic rollback stays off.

## Global constraints

- Work only in the local branch `codex/ap1-safety-foundation`.
- Do not push, open a pull request, merge, deploy or change any outside account or setting.
- Do not run `npm run prebuild:products`; use the committed data snapshot.
- Do not request indexing, perform checkout, make a payment, issue a refund or change production data.
- Availability, discoverability/citability and transaction readiness remain equal P0 outcomes.
- Known failures remain red. Never add an exception list that turns them green.
- Automatic rollback remains disabled.
- Evidence contains no secret, customer record, phone number, email address or payment data.
- Local and Preview results are rehearsal only, never production proof.
- Each task follows red, green, review: write a failing test, observe failure, add the smallest implementation, observe the pass, review, then commit locally.

## Subsequent payment-scope decision

Donato approved only the missing-payment-connection detection completed in Task 2. Task 3 and all further payment inspection, provider validation and payment rehearsal are paused. Do not implement Task 3 unless Donato separately reopens payment scope. Continue AP1A with Task 4 and the remaining non-payment safety work.

## Subsequent route-contract correction

Task 4 review found that the proposed shared address pattern would accept product addresses containing `/` and CMS page addresses deeper than the router supports. The implemented contract allows one segment for an artwork and at most two segments for a CMS page. Controlled broken examples cover both unreachable-address conditions. This changes only the local safety checker, not store routing.

## Subsequent hosting-check result

Task 5 is complete. The local checker reports both hosting contradictions present in the saved current-store version: the required article is redirected to the blog, and a broad fallback can substitute homepage HTML for unrelated addresses. The checker does not change or repair the hosting rules. Its result is local evidence, not a live-production test.

## File structure

| Path | Responsibility |
| --- | --- |
| `safety/tsconfig.json` | Strict checking for safety files. |
| `safety/p0/types.ts` | Shared finding and report shapes. |
| `safety/p0/dimensions.ts` | Treat reversed artwork sizes as one size. |
| `safety/p0/catalog.ts` | Check product lifecycle, visible sizes, price and payment mapping. |
| `safety/p0/transaction.ts` | Require real payment verification before showing success or clearing the cart. |
| `safety/p0/routes.ts` | Build the expected public page list. |
| `safety/p0/hosting.ts` | Detect false-homepage and article-override rules. |
| `safety/p0/html.ts` | Inspect one built page's public identity. |
| `safety/p0/artifact.ts` | Compare built pages, sitemap and shared images with the contract. |
| `safety/p0/report.ts` | Write redacted evidence and a concise summary. |
| `safety/p0/check-source.ts` | Run catalogue, route and hosting checks. |
| `safety/p0/check-artifact.ts` | Run built-page, sitemap and asset checks. |
| `.safety-evidence/` | Private generated evidence, ignored by Git. |
| `.github/workflows/p0-safety.yml` | Prepared check with no effect until separately approved and pushed. |

---

### Task 1: Shared findings and canonical artwork sizes

**Files:**

- Create: `safety/tsconfig.json`
- Create: `safety/p0/types.ts`
- Create: `safety/p0/dimensions.ts`
- Test: `safety/p0/dimensions.test.ts`
- Modify: `package.json`

**Interfaces:**

- Produces: `P0Outcome`, `P0Finding`, `GateReport`.
- Produces: `canonicalDimension(input: unknown): string | null`.
- Both `40x60` and `60×40` become `40x60`; composite and malformed values return `null`.

- [ ] **Step 1: Install only the locked packages**

Run `npm ci`. Expected: exit `0`; `package-lock.json` remains unchanged.

- [ ] **Step 2: Add strict checking for the safety folder**

Create `safety/tsconfig.json`:

```json
{
  "extends": "../tsconfig.node.json",
  "compilerOptions": {
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "resolveJsonModule": true,
    "strict": true,
    "types": ["node"]
  },
  "include": ["p0/**/*.ts"]
}
```

- [ ] **Step 3: Write the failing size tests**

Create `safety/p0/dimensions.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { canonicalDimension } from "./dimensions";

test("treats reversed ordinary dimensions as one size", () => {
  assert.equal(canonicalDimension("40x60"), "40x60");
  assert.equal(canonicalDimension("60×40"), "40x60");
  assert.equal(canonicalDimension(" 75 X 100 "), "75x100");
});

test("rejects empty, zero, malformed and composite dimensions", () => {
  for (const value of [null, "", "0", "40", "2x90x60", "40x0", "axb"]) {
    assert.equal(canonicalDimension(value), null);
  }
});
```

- [ ] **Step 4: Observe the missing implementation**

Run `npx tsx --test safety/p0/dimensions.test.ts`. Expected: fail because `./dimensions` does not exist.

- [ ] **Step 5: Add the shared shapes**

Create `safety/p0/types.ts`:

```ts
export type P0Outcome = "available" | "discoverable" | "transactable";
export type GateScope = "source" | "artifact";

export interface P0Finding {
  code: string;
  outcome: P0Outcome;
  path: string;
  message: string;
  evidence: Record<string, string | number | boolean | null>;
}

export interface GateReport {
  schemaVersion: 1;
  scope: GateScope;
  passed: boolean;
  generatedAt: string;
  gitCommit: string;
  findings: P0Finding[];
  counts: Record<P0Outcome, number>;
}
```

- [ ] **Step 6: Add the size parser**

Create `safety/p0/dimensions.ts`:

```ts
const ORDINARY_DIMENSION = /^\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*$/i;

export function canonicalDimension(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const match = input.match(ORDINARY_DIMENSION);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  return `${Math.min(width, height)}x${Math.max(width, height)}`;
}
```

- [ ] **Step 7: Add reusable commands**

Add to `package.json` scripts:

```json
"test:safety": "tsx --test safety/p0/*.test.ts",
"typecheck:safety": "tsc -p safety/tsconfig.json"
```

- [ ] **Step 8: Verify and commit locally**

Run `npm run test:safety` and `npm run typecheck:safety`. Expected: both exit `0`; two tests pass.

```bash
git add package.json safety/tsconfig.json safety/p0/types.ts safety/p0/dimensions.ts safety/p0/dimensions.test.ts
git commit -m "test: define P0 findings and canonical sizes"
```

---

### Task 2: Catalogue and payment-readiness checker

**Files:**

- Create: `safety/p0/catalog.ts`
- Test: `safety/p0/catalog.test.ts`

**Interfaces:**

- Consumes: `P0Finding`, `canonicalDimension`.
- Produces: `validateCatalog(products: ProductInput[]): P0Finding[]`.

- [ ] **Step 1: Write failing healthy and broken examples**

Create `safety/p0/catalog.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { validateCatalog, type ProductInput } from "./catalog";

const healthy: ProductInput = {
  id: "art-1", name: "Healthy artwork", slug: "healthy-artwork", is_active: true,
  sizes: [{ dimensions: "40x60", price: 45, stripe_product_id: "prod_healthy" }]
};

test("accepts an active artwork with one exact mapping per visible size", () => {
  assert.deepEqual(validateCatalog([healthy]), []);
});

test("reports lifecycle, size, mapping and orientation failures", () => {
  const broken: ProductInput[] = [
    { ...healthy, id: "no-slug", slug: null },
    { ...healthy, id: "no-size", sizes: [{ dimensions: "40x60", price: 0, stripe_product_id: "" }] },
    { ...healthy, id: "no-map", sizes: [{ dimensions: "40x60", price: 45, stripe_product_id: "" }] },
    { ...healthy, id: "composite", sizes: [{ dimensions: "2x90x60", price: 80, stripe_product_id: "prod_x" }] },
    { ...healthy, id: "duplicate", sizes: [
      { dimensions: "40x60", price: 45, stripe_product_id: "prod_x" },
      { dimensions: "60x40", price: 45, stripe_product_id: "prod_x" }
    ] }
  ];
  const codes = validateCatalog(broken).map((finding) => finding.code);
  for (const code of ["CATALOG_ACTIVE_PRODUCT_NO_SLUG", "CATALOG_NO_VISIBLE_SIZE", "CATALOG_MISSING_STRIPE_MAPPING", "CATALOG_INVALID_DIMENSION", "CATALOG_DUPLICATE_CANONICAL_SIZE"]) {
    assert.ok(codes.includes(code));
  }
});
```

- [ ] **Step 2: Observe the missing implementation**

Run `npx tsx --test safety/p0/catalog.test.ts`. Expected: fail because `./catalog` does not exist.

- [ ] **Step 3: Implement the catalogue checker**

Create `safety/p0/catalog.ts`:

```ts
import { canonicalDimension } from "./dimensions";
import type { P0Finding } from "./types";

export interface SizeInput { dimensions?: unknown; price?: unknown; stripe_product_id?: unknown; deal_label_enabled?: unknown; deal_price?: unknown }
export interface ProductInput { id?: unknown; name?: unknown; slug?: unknown; is_active?: unknown; sizes?: unknown }

const text = (value: unknown): string => typeof value === "string" ? value.trim() : "";

function finding(code: string, product: ProductInput, message: string, extra: Record<string, string | number | boolean | null> = {}): P0Finding {
  return {
    code, outcome: "transactable",
    path: text(product.slug) ? `/product/${text(product.slug)}` : `/product-id/${text(product.id) || "unknown"}`,
    message,
    evidence: { productId: text(product.id) || null, productName: text(product.name) || null, ...extra }
  };
}

export function validateCatalog(products: ProductInput[]): P0Finding[] {
  const findings: P0Finding[] = [];
  for (const product of products) {
    if (product.is_active === false) continue;
    if (!text(product.slug)) findings.push(finding("CATALOG_ACTIVE_PRODUCT_NO_SLUG", product, "Active artwork has no public address."));
    const sizes = Array.isArray(product.sizes) ? product.sizes as SizeInput[] : [];
    const visible = sizes.filter((size) => typeof size.price === "number" && size.price > 0);
    if (visible.length === 0) {
      findings.push(finding("CATALOG_NO_VISIBLE_SIZE", product, "Active artwork has no visible positive-price size."));
      continue;
    }
    const seen = new Set<string>();
    for (const size of visible) {
      const canonical = canonicalDimension(size.dimensions);
      if (!canonical) {
        findings.push(finding("CATALOG_INVALID_DIMENSION", product, "Visible size is not one ordinary dimension.", { dimensions: text(size.dimensions) || null }));
        continue;
      }
      if (seen.has(canonical)) findings.push(finding("CATALOG_DUPLICATE_CANONICAL_SIZE", product, "The same size exists in both orientations.", { canonicalSize: canonical }));
      seen.add(canonical);
      if (!text(size.stripe_product_id)) findings.push(finding("CATALOG_MISSING_STRIPE_MAPPING", product, "Visible size has no exact payment mapping.", { canonicalSize: canonical }));
      if (size.deal_label_enabled === true && (typeof size.deal_price !== "number" || size.deal_price <= 0)) {
        findings.push(finding("CATALOG_INVALID_DEAL_PRICE", product, "Enabled offer has no positive offer price.", { canonicalSize: canonical }));
      }
    }
  }
  return findings;
}
```

- [ ] **Step 4: Verify and commit locally**

Run `npm run test:safety` and `npm run typecheck:safety`. Expected: both exit `0`; four tests pass.

```bash
git add safety/p0/catalog.ts safety/p0/catalog.test.ts
git commit -m "test: detect unsafe catalogue mappings"
```

---

### Task 3: Payment-confirmation source guard

**Files:**

- Create: `safety/p0/transaction.ts`
- Test: `safety/p0/transaction.test.ts`

**Interfaces:**

- Produces: `validateTransactionSources(input: TransactionSourceInput): P0Finding[]`.
- Reports success shown without a session, success shown without server verification, cart clearing before verification and checkout without an active-product check.
- This is prevention only. It does not prove a live payment.

- [ ] **Step 1: Write failing healthy and broken examples**

Create `safety/p0/transaction.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { validateTransactionSources } from "./transaction";

test("accepts success only after session and server verification", () => {
  assert.deepEqual(validateTransactionSources({
    successPage: `const session_id = params.get("session_id"); const verifiedPayment = await verifyPayment(session_id); if (!verifiedPayment) return null; clearCart();`,
    checkoutFunction: `.from("products").select("*").eq("id", product_id).eq("is_active", true).maybeSingle()`
  }), []);
});

test("reports false success and inactive-product risks", () => {
  const findings = validateTransactionSources({
    successPage: `useEffect(() => { clearCart(); }, []); return <p>payment success</p>;`,
    checkoutFunction: `.from("products").select("*").eq("id", product_id).maybeSingle()`
  });
  const codes = findings.map((finding) => finding.code);
  for (const code of ["PAYMENT_SESSION_NOT_REQUIRED", "PAYMENT_NOT_SERVER_VERIFIED", "CART_CLEARED_BEFORE_VERIFICATION", "CHECKOUT_ACTIVE_STATE_NOT_REQUIRED"]) assert.ok(codes.includes(code));
});
```

- [ ] **Step 2: Observe the missing implementation**

Run `npx tsx --test safety/p0/transaction.test.ts`. Expected: fail because `./transaction` does not exist.

- [ ] **Step 3: Implement the source guard**

Create `safety/p0/transaction.ts`:

```ts
import type { P0Finding } from "./types";

export interface TransactionSourceInput { successPage: string; checkoutFunction: string }
const finding = (code: string, path: string, message: string): P0Finding => ({ code, outcome: "transactable", path, message, evidence: { sourceGuard: true } });

export function validateTransactionSources(input: TransactionSourceInput): P0Finding[] {
  const findings: P0Finding[] = [];
  const sessionIndex = input.successPage.search(/session_id/i);
  const verificationIndex = input.successPage.search(/verifyPayment|verifiedPayment|payment_status/i);
  const clearIndex = input.successPage.search(/clearCart\s*\(/);
  if (sessionIndex < 0) findings.push(finding("PAYMENT_SESSION_NOT_REQUIRED", "/checkout/success", "Success page does not require a checkout session."));
  if (verificationIndex < 0) findings.push(finding("PAYMENT_NOT_SERVER_VERIFIED", "/checkout/success", "Success page does not require server-verified payment."));
  if (clearIndex >= 0 && (verificationIndex < 0 || clearIndex < verificationIndex)) findings.push(finding("CART_CLEARED_BEFORE_VERIFICATION", "/checkout/success", "Cart can be cleared before payment verification."));
  if (!/eq\s*\(\s*["']is_active["']\s*,\s*true\s*\)/.test(input.checkoutFunction)) findings.push(finding("CHECKOUT_ACTIVE_STATE_NOT_REQUIRED", "supabase/functions/create-checkout", "Checkout lookup does not require an active product."));
  return findings;
}
```

- [ ] **Step 4: Verify and commit locally**

Run `npm run test:safety` and `npm run typecheck:safety`. Expected: both exit `0`; six tests pass.

```bash
git add safety/p0/transaction.ts safety/p0/transaction.test.ts
git commit -m "test: require verified payment success"
```

---

### Task 4: Expected public-page contract

**Files:**

- Create: `safety/p0/routes.ts`
- Test: `safety/p0/routes.test.ts`

**Interfaces:**

- Consumes: `ProductInput` and committed page records.
- Produces: `buildRouteContract(products, pages): RouteContractResult`.
- Later built-site checks consume `RouteContractResult.routes`.

- [ ] **Step 1: Write failing page-list tests**

Create `safety/p0/routes.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { buildRouteContract } from "./routes";

test("builds one home, product and CMS route with self-canonical addresses", () => {
  const result = buildRouteContract(
    [{ id: "1", name: "Art", slug: "art", is_active: true, sizes: [] }],
    [{ slug: "blog", title: "Blog" }, { slug: "storie-fatti-scientifici-polpo", title: "Article" }]
  );
  assert.deepEqual(result.routes.map((route) => route.path), ["/", "/blog", "/product/art", "/storie-fatti-scientifici-polpo"]);
  assert.equal(result.findings.length, 0);
  assert.equal(result.routes[1].canonical, "https://octowonders.com/blog");
});

test("reports duplicate, malformed and missing required routes", () => {
  const result = buildRouteContract(
    [
      { id: "1", name: "One", slug: "same", is_active: true, sizes: [] },
      { id: "2", name: "Two", slug: "same", is_active: true, sizes: [] }
    ],
    [{ slug: "bad slug", title: "Bad" }]
  );
  const codes = result.findings.map((finding) => finding.code);
  assert.ok(codes.includes("ROUTE_DUPLICATE"));
  assert.ok(codes.includes("ROUTE_INVALID_SLUG"));
  assert.ok(codes.includes("ROUTE_REQUIRED_MISSING"));
});
```

- [ ] **Step 2: Observe the missing implementation**

Run `npx tsx --test safety/p0/routes.test.ts`. Expected: fail because `./routes` does not exist.

- [ ] **Step 3: Implement the route contract**

Create `safety/p0/routes.ts`:

```ts
import type { ProductInput } from "./catalog";
import type { P0Finding } from "./types";

const BASE_URL = "https://octowonders.com";
const REQUIRED_ROUTES = ["/blog", "/storie-fatti-scientifici-polpo"];
const VALID_SLUG = /^[a-z0-9]+(?:[a-z0-9/-]*[a-z0-9])?$/;

export interface PageInput { slug?: unknown; title?: unknown }
export interface RouteContractEntry { path: string; canonical: string; kind: "home" | "page" | "product" }
export interface RouteContractResult { routes: RouteContractEntry[]; findings: P0Finding[] }

const text = (value: unknown): string => typeof value === "string" ? value.trim() : "";
const routeFinding = (code: string, path: string, message: string): P0Finding => ({ code, outcome: "discoverable", path, message, evidence: { path } });

export function buildRouteContract(products: ProductInput[], pages: PageInput[]): RouteContractResult {
  const candidates: RouteContractEntry[] = [{ path: "/", canonical: `${BASE_URL}/`, kind: "home" }];
  const findings: P0Finding[] = [];

  for (const page of pages) {
    const slug = text(page.slug);
    if (!VALID_SLUG.test(slug)) {
      findings.push(routeFinding("ROUTE_INVALID_SLUG", slug || "(empty)", "CMS page has an invalid public address."));
      continue;
    }
    const path = `/${slug}`;
    candidates.push({ path, canonical: `${BASE_URL}${path}`, kind: "page" });
  }

  for (const product of products) {
    if (product.is_active === false) continue;
    const slug = text(product.slug);
    if (!slug) continue;
    if (!VALID_SLUG.test(slug)) {
      findings.push(routeFinding("ROUTE_INVALID_SLUG", slug, "Product has an invalid public address."));
      continue;
    }
    const path = `/product/${slug}`;
    candidates.push({ path, canonical: `${BASE_URL}${path}`, kind: "product" });
  }

  const seen = new Set<string>();
  const routes: RouteContractEntry[] = [];
  for (const candidate of candidates.sort((a, b) => a.path.localeCompare(b.path))) {
    if (seen.has(candidate.path)) {
      findings.push(routeFinding("ROUTE_DUPLICATE", candidate.path, "Two records claim the same public address."));
      continue;
    }
    seen.add(candidate.path);
    routes.push(candidate);
  }

  for (const required of REQUIRED_ROUTES) {
    if (!seen.has(required)) findings.push(routeFinding("ROUTE_REQUIRED_MISSING", required, "Required public page is absent."));
  }
  return { routes, findings };
}
```

- [ ] **Step 4: Verify and commit locally**

Run `npm run test:safety` and `npm run typecheck:safety`. Expected: both exit `0`; eight tests pass.

```bash
git add safety/p0/routes.ts safety/p0/routes.test.ts
git commit -m "test: define expected public routes"
```

---

### Task 5: Hosting-rule counterexample checker

**Files:**

- Create: `safety/p0/hosting.ts`
- Test: `safety/p0/hosting.test.ts`

**Interfaces:**

- Produces: `validateHostingRules(config: HostingConfig): P0Finding[]`.
- Reports the article override and false-homepage catch-all already observed. It does not repair them.

- [x] **Step 1: Write failing hosting tests**

Create `safety/p0/hosting.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { validateHostingRules } from "./hosting";

test("accepts explicit routes without a homepage catch-all", () => {
  assert.deepEqual(validateHostingRules({
    redirects: [{ source: "/artist", destination: "/artista", permanent: true }],
    rewrites: [{ source: "/product/:slug", destination: "/product/:slug/index.html" }]
  }), []);
});

test("reports article override and broad homepage substitution", () => {
  const findings = validateHostingRules({
    redirects: [{ source: "/storie-fatti-scientifici-polpo", destination: "/blog", permanent: true }],
    rewrites: [{ source: "/((?!api).*)", destination: "/index.html" }]
  });
  const codes = findings.map((finding) => finding.code);
  assert.ok(codes.includes("HOSTING_ARTICLE_REDIRECT"));
  assert.ok(codes.includes("HOSTING_FALSE_200_CATCHALL"));
});
```

- [x] **Step 2: Observe the missing implementation**

Run `npx tsx --test safety/p0/hosting.test.ts`. Expected: fail because `./hosting` does not exist.

- [x] **Step 3: Implement the hosting checker**

Create `safety/p0/hosting.ts`:

```ts
import type { P0Finding } from "./types";

interface Rule { source?: unknown; destination?: unknown; permanent?: unknown }
export interface HostingConfig { redirects?: Rule[]; rewrites?: Rule[] }
const value = (input: unknown): string => typeof input === "string" ? input : "";

export function validateHostingRules(config: HostingConfig): P0Finding[] {
  const findings: P0Finding[] = [];
  const article = "/storie-fatti-scientifici-polpo";

  for (const rule of config.redirects ?? []) {
    if (value(rule.source) === article && value(rule.destination) !== article) {
      findings.push({
        code: "HOSTING_ARTICLE_REDIRECT", outcome: "discoverable", path: article,
        message: "The intended article is overridden by a redirect.",
        evidence: { destination: value(rule.destination) || null }
      });
    }
  }

  for (const rule of config.rewrites ?? []) {
    const source = value(rule.source);
    const destination = value(rule.destination);
    const looksBroad = source.includes(".*") || source.includes(":path*") || source.includes("(?!");
    if (looksBroad && destination === "/index.html") {
      findings.push({
        code: "HOSTING_FALSE_200_CATCHALL", outcome: "discoverable", path: source,
        message: "Unknown pages or assets can be replaced by homepage HTML.", evidence: { destination }
      });
    }
  }
  return findings;
}
```

- [x] **Step 4: Verify and commit locally**

Run `npm run test:safety` and `npm run typecheck:safety`. Observed: both exited `0`; the current set of 20 safety examples passed.

```bash
git add safety/p0/hosting.ts safety/p0/hosting.test.ts
git commit -m "test: detect false homepage routing"
```

---

### Task 6: Built-page, sitemap and image checker

**Files:**

- Create: `safety/p0/html.ts`
- Create: `safety/p0/artifact.ts`
- Test: `safety/p0/html.test.ts`
- Test: `safety/p0/artifact.test.ts`

**Interfaces:**

- Consumes: `RouteContractEntry[]` and the built folder.
- Produces: `inspectHtml(html, route): P0Finding[]`.
- Produces: `validateArtifact(distDir, routes): P0Finding[]`.

- [ ] **Step 1: Write failing page-identity tests**

Create `safety/p0/html.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { inspectHtml } from "./html";

const route = { path: "/product/art", canonical: "https://octowonders.com/product/art", kind: "product" as const };

test("accepts one indexable identity for one route", () => {
  const html = `<!doctype html><html><head><title>Art</title><meta name="description" content="One"><link rel="canonical" href="https://octowonders.com/product/art"></head><body><h1>Art</h1></body></html>`;
  assert.deepEqual(inspectHtml(html, route), []);
});

test("reports duplicate and conflicting identity", () => {
  const html = `<!doctype html><html><head><title>One</title><title>Two</title><meta name="description" content="One"><meta name="description" content="Two"><meta name="robots" content="noindex"><link rel="canonical" href="https://octowonders.com/wrong"></head><body><h1>One</h1><h1>Two</h1></body></html>`;
  const codes = inspectHtml(html, route).map((finding) => finding.code);
  for (const code of ["HTML_TITLE_COUNT", "HTML_DESCRIPTION_COUNT", "HTML_CANONICAL_MISMATCH", "HTML_H1_COUNT", "HTML_NOINDEX"]) assert.ok(codes.includes(code));
});
```

- [ ] **Step 2: Observe the missing implementation**

Run `npx tsx --test safety/p0/html.test.ts`. Expected: fail because `./html` does not exist.

- [ ] **Step 3: Implement page inspection**

Create `safety/p0/html.ts`:

```ts
import type { RouteContractEntry } from "./routes";
import type { P0Finding } from "./types";

const withoutRawText = (html: string): string => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
const matches = (html: string, pattern: RegExp): string[] => html.match(pattern) ?? [];
const attribute = (tag: string, name: string): string | null => tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1] ?? null;

function htmlFinding(code: string, route: RouteContractEntry, message: string, evidence: Record<string, string | number | boolean | null>): P0Finding {
  return { code, outcome: "discoverable", path: route.path, message, evidence };
}

export function inspectHtml(html: string, route: RouteContractEntry): P0Finding[] {
  const source = withoutRawText(html);
  const titles = matches(source, /<title\b[^>]*>/gi);
  const descriptions = matches(source, /<meta\b[^>]*name\s*=\s*["']description["'][^>]*>/gi);
  const canonicals = matches(source, /<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/gi);
  const h1s = matches(source, /<h1\b[^>]*>/gi);
  const robots = matches(source, /<meta\b[^>]*name\s*=\s*["']robots["'][^>]*>/gi);
  const findings: P0Finding[] = [];

  if (titles.length !== 1) findings.push(htmlFinding("HTML_TITLE_COUNT", route, "Document must have one effective title.", { count: titles.length }));
  if (descriptions.length !== 1) findings.push(htmlFinding("HTML_DESCRIPTION_COUNT", route, "Document must have one description.", { count: descriptions.length }));
  if (canonicals.length !== 1) {
    findings.push(htmlFinding("HTML_CANONICAL_COUNT", route, "Document must have one canonical.", { count: canonicals.length }));
  } else if (attribute(canonicals[0], "href") !== route.canonical) {
    findings.push(htmlFinding("HTML_CANONICAL_MISMATCH", route, "Canonical does not identify this route.", { expected: route.canonical, actual: attribute(canonicals[0], "href") }));
  }
  if (h1s.length !== 1) findings.push(htmlFinding("HTML_H1_COUNT", route, "Document must have one primary heading.", { count: h1s.length }));
  for (const tag of robots) {
    if ((attribute(tag, "content") ?? "").toLowerCase().includes("noindex")) {
      findings.push(htmlFinding("HTML_NOINDEX", route, "Intended public route is marked not for indexing.", { content: attribute(tag, "content") }));
    }
  }
  return findings;
}
```

- [ ] **Step 4: Write failing built-folder tests**

Create `safety/p0/artifact.test.ts`:

```ts
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { validateArtifact } from "./artifact";

const routes = [
  { path: "/", canonical: "https://octowonders.com/", kind: "home" as const },
  { path: "/blog", canonical: "https://octowonders.com/blog", kind: "page" as const }
];
const healthyHtml = (title: string, canonical: string): string => `<!doctype html><html><head><title>${title}</title><meta name="description" content="Good"><link rel="canonical" href="${canonical}"></head><body><h1>${title}</h1></body></html>`;

test("accepts complete pages, sitemap and real image bytes", () => {
  const dir = mkdtempSync(join(tmpdir(), "octowonders-safe-"));
  mkdirSync(join(dir, "blog"), { recursive: true });
  mkdirSync(join(dir, "artworks"), { recursive: true });
  writeFileSync(join(dir, "index.html"), healthyHtml("Home", "https://octowonders.com/"));
  writeFileSync(join(dir, "blog", "index.html"), healthyHtml("Blog", "https://octowonders.com/blog"));
  writeFileSync(join(dir, "logo.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  writeFileSync(join(dir, "artworks", "octoheaded.jpg"), Buffer.from([0xff, 0xd8, 0xff]));
  writeFileSync(join(dir, "sitemap.xml"), `<?xml version="1.0"?><urlset><url><loc>https://octowonders.com/</loc></url><url><loc>https://octowonders.com/blog</loc></url></urlset>`);
  assert.deepEqual(validateArtifact(dir, routes), []);
});

test("reports missing pages, sitemap drift and invalid shared images", () => {
  const dir = mkdtempSync(join(tmpdir(), "octowonders-broken-"));
  writeFileSync(join(dir, "index.html"), healthyHtml("Home", "https://octowonders.com/"));
  writeFileSync(join(dir, "logo.png"), "<!doctype html><html>homepage</html>");
  writeFileSync(join(dir, "sitemap.xml"), `<?xml version="1.0"?><urlset><url><loc>https://octowonders.com/</loc></url></urlset>`);
  const codes = validateArtifact(dir, routes).map((finding) => finding.code);
  for (const code of ["ARTIFACT_ROUTE_MISSING", "SITEMAP_ROUTE_MISSING", "ASSET_NOT_IMAGE", "ASSET_MISSING"]) assert.ok(codes.includes(code));
});
```

- [ ] **Step 5: Observe the missing artifact implementation**

Run `npx tsx --test safety/p0/artifact.test.ts`. Expected: fail because `./artifact` does not exist.

- [ ] **Step 6: Implement the built-site checker**

Create `safety/p0/artifact.ts`:

```ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { inspectHtml } from "./html";
import type { RouteContractEntry } from "./routes";
import type { P0Finding } from "./types";

const CRITICAL_ASSETS = ["/logo.png", "/artworks/octoheaded.jpg"];
const pageFile = (distDir: string, path: string): string => path === "/" ? join(distDir, "index.html") : join(distDir, path.slice(1), "index.html");
const finding = (code: string, outcome: "available" | "discoverable", path: string, message: string, evidence: Record<string, string | number | boolean | null> = {}): P0Finding => ({ code, outcome, path, message, evidence });

function isImage(buffer: Buffer): boolean {
  const png = buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const jpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const webp = buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return png || jpeg || webp;
}

const sitemapLocations = (xml: string): string[] => [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1].replaceAll("&amp;", "&").trim());

export function validateArtifact(distDir: string, routes: RouteContractEntry[]): P0Finding[] {
  const findings: P0Finding[] = [];
  for (const route of routes) {
    const file = pageFile(distDir, route.path);
    if (!existsSync(file)) {
      findings.push(finding("ARTIFACT_ROUTE_MISSING", "available", route.path, "Expected built page is missing."));
      continue;
    }
    findings.push(...inspectHtml(readFileSync(file, "utf8"), route));
  }

  const sitemapFile = join(distDir, "sitemap.xml");
  if (!existsSync(sitemapFile)) {
    findings.push(finding("SITEMAP_MISSING", "discoverable", "/sitemap.xml", "Built sitemap is missing."));
  } else {
    const counts = new Map<string, number>();
    for (const location of sitemapLocations(readFileSync(sitemapFile, "utf8"))) counts.set(location, (counts.get(location) ?? 0) + 1);
    for (const route of routes) {
      const count = counts.get(route.canonical) ?? 0;
      if (count === 0) findings.push(finding("SITEMAP_ROUTE_MISSING", "discoverable", route.path, "Expected route is absent from the sitemap."));
      if (count > 1) findings.push(finding("SITEMAP_ROUTE_DUPLICATE", "discoverable", route.path, "Route appears more than once in the sitemap.", { count }));
      counts.delete(route.canonical);
    }
    for (const [unexpected] of counts) findings.push(finding("SITEMAP_ROUTE_UNEXPECTED", "discoverable", unexpected, "Sitemap contains an unexpected route."));
  }

  for (const asset of CRITICAL_ASSETS) {
    const file = join(distDir, asset.slice(1));
    if (!existsSync(file)) {
      findings.push(finding("ASSET_MISSING", "discoverable", asset, "Required shared image is missing."));
    } else if (!isImage(readFileSync(file))) {
      findings.push(finding("ASSET_NOT_IMAGE", "discoverable", asset, "Required shared image is not an image file."));
    }
  }
  return findings;
}
```

- [ ] **Step 7: Verify and commit locally**

Run `npm run test:safety` and `npm run typecheck:safety`. Expected: both exit `0`; fourteen tests pass.

```bash
git add safety/p0/html.ts safety/p0/html.test.ts safety/p0/artifact.ts safety/p0/artifact.test.ts
git commit -m "test: inspect built page identity and assets"
```

---

### Task 7: Redacted evidence and local gate commands

**Files:**

- Create: `safety/p0/report.ts`
- Create: `safety/p0/check-source.ts`
- Create: `safety/p0/check-artifact.ts`
- Test: `safety/p0/report.test.ts`
- Modify: `.gitignore`
- Modify: `package.json`

**Interfaces:**

- Produces: `makeReport(scope, findings, options)`, `writeReport(report, file)`, `printSummary(report)`.
- Both gate commands exit `0` only when they find no P0 failure.
- Evidence stores safe facts and codes, never complete source data or private details.

- [ ] **Step 1: Write the failing report test**

Create `safety/p0/report.test.ts`:

```ts
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { makeReport, writeReport } from "./report";

test("creates deterministic counts and writes valid JSON", () => {
  const report = makeReport("source", [{
    code: "EXAMPLE", outcome: "transactable", path: "/product/example",
    message: "Example", evidence: { canonicalSize: "40x60" }
  }], { now: new Date("2026-08-22T12:00:00.000Z"), gitCommit: "abc123" });
  assert.equal(report.passed, false);
  assert.deepEqual(report.counts, { available: 0, discoverable: 0, transactable: 1 });
  const dir = mkdtempSync(join(tmpdir(), "octowonders-report-"));
  const file = join(dir, "report.json");
  writeReport(report, file);
  assert.deepEqual(JSON.parse(readFileSync(file, "utf8")), report);
});
```

- [ ] **Step 2: Observe the missing implementation**

Run `npx tsx --test safety/p0/report.test.ts`. Expected: fail because `./report` does not exist.

- [ ] **Step 3: Implement report creation and writing**

Create `safety/p0/report.ts`:

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { GateReport, GateScope, P0Finding, P0Outcome } from "./types";

export function makeReport(scope: GateScope, findings: P0Finding[], options: { now: Date; gitCommit: string }): GateReport {
  const counts: Record<P0Outcome, number> = { available: 0, discoverable: 0, transactable: 0 };
  for (const finding of findings) counts[finding.outcome] += 1;
  return { schemaVersion: 1, scope, passed: findings.length === 0, generatedAt: options.now.toISOString(), gitCommit: options.gitCommit, findings, counts };
}

export function writeReport(report: GateReport, file: string): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
}

export function printSummary(report: GateReport): void {
  console.log(report.passed ? "P0 SAFETY: GREEN" : "P0 SAFETY: RED");
  console.log(`Availability findings: ${report.counts.available}`);
  console.log(`Discoverability findings: ${report.counts.discoverable}`);
  console.log(`Transaction findings: ${report.counts.transactable}`);
  for (const finding of report.findings) console.log(`[${finding.outcome}] ${finding.code} ${finding.path}: ${finding.message}`);
}
```

- [ ] **Step 4: Implement the source gate**

Create `safety/p0/check-source.ts`:

```ts
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateCatalog, type ProductInput } from "./catalog";
import { validateHostingRules, type HostingConfig } from "./hosting";
import { makeReport, printSummary, writeReport } from "./report";
import { buildRouteContract, type PageInput } from "./routes";
import { validateTransactionSources } from "./transaction";

const json = <T>(path: string): T => JSON.parse(readFileSync(resolve(path), "utf8")) as T;
const products = json<ProductInput[]>("src/generated/products.json");
const pages = json<PageInput[]>("src/generated/pages.json");
const hosting = json<HostingConfig>("vercel.json");
const routeResult = buildRouteContract(products, pages);
const findings = [
  ...validateCatalog(products),
  ...routeResult.findings,
  ...validateHostingRules(hosting),
  ...validateTransactionSources({
    successPage: readFileSync(resolve("src/pages/CheckoutSuccess.tsx"), "utf8"),
    checkoutFunction: readFileSync(resolve("supabase/functions/create-checkout/index.ts"), "utf8")
  })
];
const gitCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const report = makeReport("source", findings, { now: new Date(), gitCommit });
writeReport(report, ".safety-evidence/p0-source.json");
printSummary(report);
process.exitCode = report.passed ? 0 : 1;
```

- [ ] **Step 5: Implement the built-site gate**

Create `safety/p0/check-artifact.ts`:

```ts
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateArtifact } from "./artifact";
import type { ProductInput } from "./catalog";
import { makeReport, printSummary, writeReport } from "./report";
import { buildRouteContract, type PageInput } from "./routes";

const json = <T>(path: string): T => JSON.parse(readFileSync(resolve(path), "utf8")) as T;
const products = json<ProductInput[]>("src/generated/products.json");
const pages = json<PageInput[]>("src/generated/pages.json");
const routeResult = buildRouteContract(products, pages);
const findings = [...routeResult.findings, ...validateArtifact(resolve("dist"), routeResult.routes)];
const gitCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const report = makeReport("artifact", findings, { now: new Date(), gitCommit });
writeReport(report, ".safety-evidence/p0-artifact.json");
printSummary(report);
process.exitCode = report.passed ? 0 : 1;
```

- [ ] **Step 6: Ignore generated private evidence**

Add to `.gitignore`:

```gitignore
.safety-evidence/
```

- [ ] **Step 7: Add non-live commands**

Add to `package.json` scripts without changing the existing production `build` command:

```json
"build:committed": "vite-react-ssg build && npm run postbuild",
"p0:check:source": "tsx safety/p0/check-source.ts",
"p0:check:artifact": "tsx safety/p0/check-artifact.ts"
```

- [ ] **Step 8: Verify unit checks**

Run `npm run test:safety` and `npm run typecheck:safety`. Expected: both exit `0`; fifteen tests pass.

- [ ] **Step 9: Prove today's snapshot stays red**

Run `npm run p0:check:source`. Expected: exit `1` and `P0 SAFETY: RED`. It must report at least the current missing payment mappings, the active artwork without a public address, the article override and the false-homepage rule. This is the correct result.

- [ ] **Step 10: Commit locally**

```bash
git add .gitignore package.json safety/p0/report.ts safety/p0/report.test.ts safety/p0/check-source.ts safety/p0/check-artifact.ts
git commit -m "feat: report source and artifact P0 evidence"
```

---

### Task 8: Rehearse the complete local gate

**Files:**

- Modify only when a test exposes a checker error: files from Tasks 1 through 7.
- Create: `docs/evidence/2026-08-22-ap1a-local-gate-rehearsal.md`

**Interfaces:**

- Consumes all AP1A local checks.
- Produces one plain-English evidence note with exact observed results and no private data.

- [ ] **Step 1: Run unit and agreement checks**

Run:

```bash
npm run test:safety
npm run typecheck:safety
```

Expected: both exit `0`. Record the exact passing test count.

- [ ] **Step 2: Build from the committed snapshot**

Run `npm run build:committed`. Expected: exit `0` and create `dist/`. Record warnings separately. Never call this production proof.

- [ ] **Step 3: Run both gates**

Run `npm run p0:check:source`, then `npm run p0:check:artifact`. Expected on commit `ffe0b380166bd6b9bae7e3d89711a1078867e41d`: both exit `1`; both evidence files exist and accurately identify current red conditions. A red store result is not a failed checker.

- [ ] **Step 4: Check evidence redaction**

Run:

```bash
rg -n "[A-Za-z0-9._%+-]+@gmail\\.com|\\b39[0-9]{9,12}\\b|STRIPE_SECRET_KEY|SERVICE_ROLE|ACCESS_TOKEN" .safety-evidence
```

Expected: no matches. Never print an `.env` file.

- [ ] **Step 5: Write the observed evidence note**

Create `docs/evidence/2026-08-22-ap1a-local-gate-rehearsal.md`. Start with `# AP1A local safety-gate rehearsal`, followed by `## Result`, `## Checks run`, `## Changes not made` and `## Next approval boundary`.

Under `## Checks run`, write one table row for each command from Steps 1 through 4. Each Result cell must contain the actual exit code and observed count or finding total. Do not write a predicted value. State that the local build is not production proof.

Under `## Changes not made`, record that nothing was pushed or published; no GitHub, Vercel, Checkly, Meta, Resend, DNS, Supabase or Stripe setting changed; no message, checkout or payment occurred; and automatic rollback stayed disabled.

Under `## Next approval boundary`, state that the exact outside release protection and watcher connections must be presented to Donato before applying them.

- [ ] **Step 6: Review and commit locally**

Run `git diff --check`, `git status --short` and `git log --oneline --decorate -8`. Expected: formatting exits `0`; only the evidence note is uncommitted.

```bash
git add docs/evidence/2026-08-22-ap1a-local-gate-rehearsal.md
git commit -m "docs: record AP1A local gate rehearsal"
```

---

### Task 9: Prepare, but do not activate, the release check

**Files:**

- Create: `.github/workflows/p0-safety.yml`
- Create: `docs/approvals/2026-08-22-ap1b-external-release-protection-package.md`

**Interfaces:**

- Consumes the safety commands created in AP1A.
- Produces a prepared release check and a separate plain-English approval package.
- Neither file is pushed or activated in AP1A.

- [ ] **Step 1: Create the prepared release check**

Create `.github/workflows/p0-safety.yml`:

```yaml
name: P0 Store Safety

on:
  workflow_dispatch:
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  safety:
    runs-on: ubuntu-latest
    steps:
      - name: Read the proposed change
        uses: actions/checkout@v4

      - name: Use the project's Node version
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm

      - name: Install locked packages
        run: npm ci

      - name: Prove the safety checker
        run: npm run test:safety

      - name: Check safety-file agreement
        run: npm run typecheck:safety

      - name: Build only from the committed snapshot
        run: npm run build:committed

      - name: Check saved catalogue and hosting rules
        id: source_gate
        continue-on-error: true
        run: npm run p0:check:source

      - name: Check built pages, sitemap and shared images
        id: artifact_gate
        continue-on-error: true
        run: npm run p0:check:artifact

      - name: Preserve redacted evidence
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: p0-safety-evidence
          path: .safety-evidence/
          if-no-files-found: error
          retention-days: 30

      - name: Stop an unsafe release
        if: always()
        env:
          SOURCE_RESULT: ${{ steps.source_gate.outcome }}
          ARTIFACT_RESULT: ${{ steps.artifact_gate.outcome }}
        run: |
          test "$SOURCE_RESULT" = "success"
          test "$ARTIFACT_RESULT" = "success"
```

This prepared file is limited to reviewed proposals and manual rehearsal. It cannot push, publish, change data or call an alert service.

- [ ] **Step 2: Validate the prepared file locally**

Run:

```bash
rg -n "push:|git push|deploy|repository_dispatch|workflow_run|schedule:" .github/workflows/p0-safety.yml
```

Expected: no matches. Confirm `permissions` grants only `contents: read`.

- [ ] **Step 3: Write the outside-change approval package**

Create `docs/approvals/2026-08-22-ap1b-external-release-protection-package.md` in plain English. It must list these proposed changes separately and explain benefit, risk, cost, owner and reversal procedure for each:

1. Make the new store-safety result compulsory before a proposal can join `main`.
2. Stop direct changes to `main`; require a reviewed proposal.
3. Prevent the existing catalogue refresh from writing directly to `main`.
4. Make live publishing honor a manual incident freeze.
5. Keep automatic rollback disabled.
6. State current plan and cost limits for the chosen independent watcher after rechecking them.
7. Name every account owner and permission requested.
8. Present `apply`, `change` and `postpone` choices.

The package must state clearly that none of these outside changes has been executed.

- [ ] **Step 4: Run final local checks**

Run:

```bash
npm run test:safety
npm run typecheck:safety
git diff --check
git status --short
```

Expected: unit and agreement checks exit `0`; formatting exits `0`; only the prepared release check and approval package are uncommitted.

- [ ] **Step 5: Commit the preparation locally**

```bash
git add .github/workflows/p0-safety.yml docs/approvals/2026-08-22-ap1b-external-release-protection-package.md
git commit -m "ci: prepare P0 release safety approval"
```

- [ ] **Step 6: Stop at the outside-change boundary**

Do not push the branch, open a pull request or change GitHub rules, Vercel publishing, monitoring, DNS, Meta WhatsApp, Resend, Supabase or Stripe. Present Donato with the AP1A result and AP1B approval package.

## Final acceptance for AP1A

AP1A is complete only when:

1. The clean local clone remains on `codex/ap1-safety-foundation` and descends from the proven live commit.
2. Safety unit and agreement checks pass.
3. Current source and built-site gates report known current problems as red instead of hiding them.
4. Evidence contains no private contact, secret or customer/payment data.
5. No live store, outside account or production data changed.
6. Automatic rollback remains disabled.
7. The prepared release check cannot write, push, publish or call alerts.
8. Donato receives a separate plain-English package before any outside release-protection setting changes.
