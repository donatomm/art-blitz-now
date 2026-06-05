## Incident plan: `personal_context` PERMISSION_DENIED / “Octowonders.com inaccessible”

**Safety gate before implementation:** DO YOU WANT TO RUN A FULL SAFETY CHECL? If yes, I will read and follow `docs/SAFETY-CHECK.md` before any file changes.

### Verified facts so far

- **2026-06-05T00:00:01Z — Root domain is reachable to Googlebot.** `https://octowonders.com` returned HTTP 200 from Vercel, no `X-Robots-Tag`, no `noindex`, `robots.txt` allows `User-agent: *`.
  - **Contradiction:** the external `personal_context:retrieve_personal_data` tool says “This website is inaccessible: Octowonders.com”, but direct HTTP fetches do not confirm a global block.
  - **Risk:** High impact, unknown cause. Could be an external indexing/permission layer, not website code.

- **2026-06-05T00:00:01Z — Sitemap is reachable and valid XML.** `https://octowonders.com/sitemap.xml` returned HTTP 200, `application/xml`, 33 URLs, includes `/privacy` and `/contatti`.
  - **Risk:** Low for crawl blocking; Medium for discoverability because sitemap includes an HTML `/sitemap` page and existing SEO docs mention prior crawl-budget issues.

- **2026-06-05T00:00:02Z — Product pages are reachable.** `/product/polpo-octopus-blue-wow-stampa-tela` returned HTTP 200 and has product JSON-LD + canonical.
  - **Risk:** Medium because duplicate `<title>` and duplicate meta description still exist in live HTML.

- **2026-06-05T00:00:03Z — Legal/contact data is inconsistent.** Live privacy content references `donato marco mangialardo` and `donatomm@gmail.com`; footer references `OctoWonders by Marco De Francesco alias Donato Marco Mangialardo`; JSON-LD/contact buttons use `macudici@gmail.com`; earlier project memory says order webhook email is `me@octowonders.com`.
  - **Risk:** High for trust/legal/entity extraction. Do not “resolve” by guessing which identity/email is correct.

- **2026-06-05T00:00:03Z — “Partita IVA” is not confirmed on the visible legal/contact pages checked.** Live `/privacy` contains “IVA” only incidentally from privacy text; `/contatti` does not contain IVA/Partita IVA; footer contains Codice Fiscale only.
  - **Risk:** High if the query expects business VAT data. Missing or scattered legal data can cause retrieval failure, but it does not by itself explain `PERMISSION_DENIED`.

### Proposed fix steps

1. **Confirm the exact blocking surface**
   - Test `octowonders.com`, `www.octowonders.com`, `/robots.txt`, `/sitemap.xml`, `/contatti`, `/privacy`, `/terms`, and 2 product pages with normal browser UA and Googlebot UA.
   - Check status, redirects, final URL, cache age, robots directives, canonical, title count, JSON-LD count, and whether “Partita IVA” appears.
   - **Risk:** Low. Read-only verification; no production change.

2. **Fix duplicate head injection only if confirmed in current code path**
   - Update `scripts/postbuild-inject-head.cjs` so it does not append fallback `<title>`/description into pages that already have Helmet/SSG tags.
   - Keep only required global static tags when needed: charset, viewport, verification/preconnect/domain verification.
   - **Risk:** Medium. This touches SEO build output; must verify homepage, CMS pages, and product pages after build.

3. **Create a single authoritative legal/business identity source**
   - Do not choose the identity/email/Partita IVA value without your confirmation.
   - Once confirmed, place the same legal identity, Codice Fiscale/Partita IVA, and contact email consistently in footer, `/contatti`, `/privacy`, and `/terms`/PDF references where applicable.
   - **Risk:** High if wrong legal data is used; this must be user-confirmed before implementation.

4. **Make `/contatti` machine-readable for entity tools**
   - Add visible legal/contact details to `/contatti` content and include structured Organization/LocalBusiness JSON-LD only with confirmed values.
   - Ensure the page contains the literal strings users/tools search for: `Partita IVA`, `Codice Fiscale`, official email, business/legal name.
   - **Risk:** Medium. Improves retrieval, but cannot guarantee the external `personal_context` tool will re-index immediately.

5. **Clean crawl/indexing contradictions without removing content**
   - Keep `robots.txt` permissive.
   - Verify canonical URLs are page-specific.
   - Review whether `/sitemap` should remain in XML sitemap, since it is an HTML sitemap page and prior docs flagged crawl-budget risk.
   - **Risk:** Low to Medium. Removing a sitemap entry is usually safe, but any URL removal must be intentional.

6. **Validate after changes**
   - Re-fetch live/preview HTML and extract SEO tags.
   - Confirm one `<title>`, one meta description, one canonical per checked page.
   - Confirm legal/contact pages expose the approved Partita IVA/legal strings.
   - If available, run the SEO scanner after deployment; do not mark findings fixed unless verified.
   - **Risk:** Low. Verification only.

### What I will not do

- I will not guess the correct Partita IVA, legal name, or official email.
- I will not disable robots, block pages, remove storage files, or edit backend data without explicit approval.
- I will not claim the external `personal_context` permission error is fixed unless the same tool or an equivalent external signal confirms it.