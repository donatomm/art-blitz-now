# OctoWonders WS0 Backup Verification

**Date:** 2026-08-21  
**Workstream:** WS0, authority, backup and recovery  
**Status:** Database, all current physical Storage objects and core Supabase service function are proven in an isolated local lab. Full application recovery, external configuration parity and exact Realtime production-version parity remain unproven.  
**Controlling handoff:** `docs/handoffs/2026-08-21-stabilization-handoff.md`

> This check restored the archive only into an isolated, disposable local database. It did not restore or modify production, change Lovable, change GitHub, deploy, or alter external settings. Customer rows were not printed or inspected.

## Quick orientation

The database archive has a valid ZIP CRC, a PostgreSQL custom-dump header, and an inner payload that is byte-for-byte identical to the separately downloaded dump. PostgreSQL 18.6 `pg_restore` reads its catalogue successfully. The complete unfiltered archive restores with exit code `0`, zero errors and zero warnings into an isolated Supabase PostgreSQL 17.6 environment with Vault, original database-object owners, ACLs, policies, functions, triggers, publications and data. Read-only production SQL resolved the exact `sandbox_exec` and `supabase_realtime_admin` role definitions, replacing the earlier placeholder limitation.

The originally supplied `bucket-product-images-files` directory was incomplete: it contained only the 80 `mockrooms` files and did not preserve their `mockrooms/` prefix. That gap has now been repaired without changing Lovable. All 118 current `product-images` objects were downloaded fresh from the public Lovable/Supabase bucket with their exact bucket-relative paths. The completed snapshot contains 110 WebP files, 7 GIFs and 1 XML sitemap, totaling 41,679,896 bytes. Its inventory matches the read-only Lovable listing with zero missing and zero unexpected paths. All 117 images decode, the sitemap parses as XML and the ZIP integrity test passes.

All 136 objects in the current production Storage inventory now restore physically with exact paths. Storage metadata and physical files both total 78,957,478 bytes. All 135 dump-referenced objects passed round-trip SHA-256 verification, and the current database-export object passed separately. PostgREST, Auth, Storage access control and a real Realtime database-change event also passed. Exact Realtime production parity did not: the tested v2.129.0 image advanced the restored Realtime migration ledger beyond production. Detailed evidence is in `docs/2026-08-21-ws0-supabase-service-recovery-proof.md`.

## Sources

- Local backup set: `/Users/donatomm/---OCTOPRO.PRO/DB+STORAGE`
- Completed product-image snapshot: `/Users/donatomm/---OCTOPRO.PRO/DB+STORAGE/product-images-complete-2026-08-21`
- Separately downloaded database dump: `/Users/donatomm/Downloads/gallery-rush_260821.backup`
- Lovable project: `248403b8-3b63-497c-a1bd-bb25e96e0f47`
- GitHub repository: `donatomm/art-blitz-now`
- GitHub/Vercel production commit: `ffe0b380166bd6b9bae7e3d89711a1078867e41d`

## Initial local backup-set inventory

Before the product-image repair, the directory contained 96 files excluding `.DS_Store`, totaling 85,671,328 bytes.

| Component | Local evidence | Integrity result |
|---|---:|---|
| Database ZIP | 1 archive containing 1 dump, 378,327 uncompressed bytes | ZIP CRC passes |
| Product images | 80 files, 15,724,298 bytes | All 80 recognized as images and decoded by the available image inspector |
| Article images | 11 files, 3,196,273 bytes | All 11 recognized as images and decoded by the available image inspector |
| Public audio | Direct MP3 plus ZIP copy | ZIP CRC passes; payload hashes match |
| Private streaming audio | Direct MP3 plus ZIP copy | ZIP CRC passes; payload hashes match |

No zero-byte files were found.

### Image payload observations

- Product export: 80 filenames, 65 distinct SHA-256 payloads. Fifteen filenames duplicate bytes used by another file. This is not itself corruption; variants can legitimately share image bytes.
- Article export: 11 filenames, 11 distinct SHA-256 payloads.
- Audio payload: valid MP3, 16,592,979 bytes, approximately 1,037.06 seconds.

## Database evidence

### Proven

- The ZIP archive passes `unzip -t` without errors.
- The extracted payload is 378,327 bytes.
- `file` identifies the payload as `PostgreSQL custom database dump - v1.16-0`.
- The payload begins with the PostgreSQL custom-dump magic `PGDMP`.
- The separately downloaded dump and the ZIP's inner dump have the same SHA-256:

  `ea8783c6716451c1934f6d03f106e019bb9d35dd92dfac6ddcef37e29c527456`

- PostgreSQL 18.6 `pg_restore -l` reads the archive without error.
- Archive metadata reports:
  - format: custom;
  - archive version: `1.16-0`;
  - compression: zstd;
  - source database: PostgreSQL 17.6;
  - dumper: pg_dump 18.4;
  - TOC entries reported by the archive header: 589.
- A generic PostgreSQL 18 restore recovered these critical aggregates without printing customer rows:
  - `public.products`: 24 rows;
  - `public.pages`: 11 rows;
  - `public.site_settings`: 25 rows;
  - `public.default_prices`: 12 rows;
  - `public.user_roles`: 4 rows;
  - `auth.users`: 4 rows;
  - `storage.buckets`: 6 rows;
  - `storage.objects`: 135 rows.
- After creating only the local `authenticated` test role and excluding 10 Vault-specific catalogue lines, all 572 selected non-Vault catalogue lines restored with zero errors and zero warnings.
- The successful non-Vault restoration produced 23 `auth` tables, 5 `public` tables, 3 `realtime` tables, 8 `storage` tables and 1 `supabase_migrations` table.
- The complete unfiltered archive restored in Supabase PostgreSQL 17.6 with exit code `0`, zero errors and zero warnings.
- Supabase Vault 0.3.1 and `vault.secrets` restored successfully.
- The full restore produced 11 non-system schemas, 41 base tables, 3 views, 99 non-system functions, 11 noninternal triggers, 28 policies, 6 event triggers and 1 publication. A final all-schema re-count corrected the earlier 9-schema/97-function summary, which had omitted the archived `pgbouncer` and `private` schemas and their two functions.
- All 41 base tables were readable for aggregate row counting.
- The restored database reports zero invalid/unready indexes and zero unvalidated constraints.
- Representative restored ACLs and read access were verified under `anon`, `authenticated` and the local `sandbox_exec` placeholder.

- Exact-name string filtering found the expected application tables:
  - `products`
  - `pages`
  - `site_settings`
  - `default_prices`
  - `user_roles`
- Exact-name filtering also found identifiers for `public`, `private`, `auth`, `storage`, `extensions`, `realtime` and `vault`, plus storage/auth object names.

The string-name checks establish presence of identifiers only. They do not prove complete table data, valid dependencies, or restorability.

### GitHub reconciliation

At production commit `ffe0b380166bd6b9bae7e3d89711a1078867e41d`, GitHub contains 28 Supabase migrations from `20251204191855_29712b72-9125-4eea-89da-8ec3ba3426fb.sql` through `20260807072455_d00c8c8f-8313-44cb-ae5c-fdba21f84b39.sql`. The local code export contains the same count and endpoints.

The migrations reference the five application tables found in the dump identifiers. This is supporting consistency evidence, not a schema equality proof. In particular, repository migrations do not by themselves prove the complete present production schema or data.

### Not yet proven

- Other cluster-global roles or tablespaces not represented in the database-only archive.
- Row completeness, semantic correctness or production-time consistency.
- Exact production Realtime image/version and a startup procedure that does not migrate beyond production without approval.
- Full application, browser and admin operation against the recovered stack.
- Production JWT, API keys, OAuth, SMTP, redirect URLs, Edge Function secrets, custom domains and Vercel environment parity.

PostgreSQL 18.6, Docker Desktop 4.87.0 and Supabase CLI 2.115.0 are installed locally. The final database restore used no Docker network and no published port. Detailed evidence is in `backups/2026-08-21/db-restore-verification`.

After final verification, the disposable restored database container, work/socket volumes, empty CLI lab volumes and dedicated lab network were removed. The original archive and evidence were retained. Follow-up checks found no remaining lab resources or listeners on the test port ranges, and Docker's daemon configuration matches its pre-test backup.

The later full service-recovery lab was also removed after its final gate passed. Exact-name checks found none of its six containers, two volumes or internal network. The original backups and `backups/2026-08-21/supabase-service-recovery` evidence remain.

## Storage reconciliation

### Current Lovable inventory

| Bucket/path | Current visible objects | Current visible size |
|---|---:|---:|
| `product-images/artworks` | 26 | 21.6 MB |
| `product-images/hero` | 7 | 2.0 MB |
| `product-images/mockrooms` | 80 | 15.0 MB |
| `product-images/pages` | 4 | 1.2 MB |
| `product-images/sitemap.xml` | 1 | 6 KB |
| `article-images` root | 11 | 3.0 MB |
| `article-images/art-Paul---` | 0 | 0 KB |
| `audiostreaming` | 1 | 15.8 MB |
| `audio` | 1 | 15.8 MB |
| `curl-test-for-indexability` | 0 | 0 KB |
| `database_export_21_08_26` | 1 | 369 KB |

### Completeness result

| Bucket | Local result | Decision |
|---|---|---|
| `product-images` | Completed snapshot: 118 fresh cloud downloads, 41,679,896 bytes, exact live relative paths preserved | **Complete against the visible Lovable inventory.** 118 expected, 118 present, zero missing, zero unexpected. The original 80-file export remains as historical evidence but is superseded by the completed snapshot |
| `article-images` | 15 exact metadata paths restored. Four absent public objects were recovered read-only and retained as evidence | Complete against current read-only production metadata; all restored bytes hash-verified |
| `audio` | One MP3; direct and ZIP payloads match | Count-complete for visible bucket |
| `audiostreaming` | One MP3; direct and ZIP payloads match | Count-complete for visible bucket |
| `curl-test-for-indexability` | No local object | Expected because the bucket is intentionally empty |
| Database export bucket | Current object restored from the verified local archive and round-trip SHA-256 matched | Complete against current read-only production metadata |

The original gap was material because the missing `product-images/artworks` objects include primary artwork assets used by current production pages. The completed snapshot repairs that local backup gap. It does not prove a successful storage restore.

## Checksums

| Artifact | SHA-256 |
|---|---|
| Database dump payload | `ea8783c6716451c1934f6d03f106e019bb9d35dd92dfac6ddcef37e29c527456` |
| Database ZIP | `95dc40a195ba51a787937b16f15b2de4c0d1916741b5c7199bd2795a36b75e0c` |
| MP3 payload used by both audio buckets | `399f15601ccf23e6811d968bed72421815f81c969136031fdd7cdf6e38598bfb` |
| Public-audio ZIP | `05ed2f444574f85000a827d7a71cc30befec3ce63e9febf01da3e68861343b57` |
| Streaming-audio ZIP | `1324c169b315e76f3e66d2473bf2df706a6e5ac9bd3577c6f3d172012845bd61` |
| Completed product-images ZIP | `cb87763f0c7c91ce8ef28b0c68c252f6b44e5908765a253a4d24e80654621c4a` |

The product-image bundle also includes:

- `product-images-manifest.tsv`: bucket, exact relative path, byte size and SHA-256 for all 118 objects.
- `product-images-manifest.sha256`: a standard SHA-256 manifest for all 118 objects.
- `product-images-complete-2026-08-21.zip`: 41,374,630 bytes; `unzip -t` reports no errors.

## WS0 decision

WS0 evidence now proves the exact-role database restore, all 136 current physical Storage objects, PostgREST public reads and token rejection, synthetic Auth signup/login/read/delete, Storage public/private authorization and actual Realtime database-change delivery in an isolated lab. It does not prove full application disaster recovery or production environment parity. The tested Realtime image migrated beyond production, so a production recovery remains blocked until its exact version or migration decision is controlled.

Completed local actions:

1. Reconstructed the exact nonstandard roles and restored the full database with zero errors and warnings.
2. Restored all 136 current Storage objects with exact metadata and physical byte totals.
3. Verified all dump-referenced objects and the current database export by round-trip SHA-256.
4. Verified PostgREST, RLS public reads, Auth, Storage access control and Realtime change delivery.
5. Compared Auth, Storage and Realtime migration ledgers with production. Auth and Storage match; Realtime does not.

Required next actions:

1. Identify and pin the production-equivalent Realtime image, or explicitly approve and rehearse the newer schema migration.
2. Recover and verify external configuration separately from the database and Storage backups.
3. Verify the full application, browser and admin behavior against the recovered stack.
4. Preserve the handoff's production-mutation and release stop conditions until those checks pass.

Until those steps pass, the handoff's production recovery and stateful-change stop conditions remain active. Database, physical Storage and core service function no longer constitute the unknown.

## Limitations

- No transactional storage snapshot proves that the Lovable inventory remained unchanged during the download window.
- File decoding does not prove that every image is the correct semantic asset for its database references.
- Rounded Lovable sizes are not byte-level remote hashes.
- Aggregate row counts prove restored quantities only. They do not prove semantic correctness or production-time consistency.
- The single-database archive does not carry cluster-global roles or external service secrets. Exact required role definitions were remeasured separately from production.
- Realtime v2.129.0 is functionally compatible but migrated the local Realtime schema beyond production.
- The EOS audit skill required by the global audit guardrail was unavailable in this session. This brief uses an evidence-first fallback and states its limits explicitly.
