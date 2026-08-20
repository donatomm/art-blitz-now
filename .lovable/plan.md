# Admin Playbook v2 — readable without colours

Regenerate the admin playbook spreadsheet so the instant / deploy / irreversible coding is readable as text, not only as cell colours (the in-chat preview strips fills).

## Changes

- New file `OctoWonders-Admin-Playbook_v2.xlsx` in the documents area (the v1 file stays untouched).
- Every "When customers see it" cell gets a text prefix:
  - `[INSTANT]` — visitors see it within seconds
  - `[DEPLOY]` — only after Deploy > Sync & Deploy
  - `[N/A]` — no effect on the public site
- Every "Risk / confirmation" cell that describes a destructive action gets an `[IRREVERSIBLE]` prefix.
- Same markers applied to the "Deploy needed?" column of the Scenarios tab and to the "Visible when" column of the Instant vs Deploy tab.
- A legend block added at the top of the "0. Read me" tab explaining the three markers and noting that the matching colours (green / amber / red) appear once the file is opened in Google Sheets, Excel or Numbers.
- Colour fills are kept as they are, so the file reads correctly both ways.

## Content

No content changes — same 13 tabs, same controls, scenarios and technical map as the current playbook. Only the markers and the legend are added.

## Technical notes

- Generated with a throwaway Python script (xlsxwriter) under `/tmp`; no project source file is touched.
- After generation the workbook is re-opened and every sheet checked for populated rows and correct markers before delivery.
