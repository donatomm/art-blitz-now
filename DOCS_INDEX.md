# DOCS_INDEX.md — OctoWonders Docs Map (Read Order)

This repo has a few “must-read” documents for anyone (human or AI) making changes.

## Read order (do this in order)

1) **`README_FOR_AI.md`**  
   Purpose: architecture safety + operational rules to avoid breaking SSG, routing, build output.

2) **`docs/chat-continuity-primer.md`**  
   Purpose: behavioral guardrails, scope limits (STOP / FORGET X), and project continuity context.

## Precedence (when something conflicts)

1) **User commands override everything**  
   - `STOP` = stop immediately  
   - `FORGET X` = drop it immediately  

2) **`docs/chat-continuity-primer.md` governs behavior + scope**  
   - do only what’s requested  
   - don’t claim access to systems you can’t see  

3) **`README_FOR_AI.md` governs architecture safety when changes are requested**  
   - protect SSG output and routing stability  
   - avoid SPA-shell regressions  

## Quick links

- `README_FOR_AI.md`
- `docs/chat-continuity-primer.md`
