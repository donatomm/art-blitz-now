# Restore the three live-site files

## Scope
- Replace `index.html` exactly with the supplied live-site content.
- Replace `vercel.json` exactly with the supplied live-site content.
- Replace only the `scripts` object in `package.json` with the supplied block; preserve every dependency and all other package fields exactly.
- Do not install, remove, or upgrade packages.
- Do not modify any other file, including anything under `safety/`, `docs/`, `.github/`, or `src/`.

## Verification
- Confirm the three resulting contents match the supplied text character for character in the requested scope.
- Confirm `vercel.json` and `package.json` remain valid JSON.
- Report exactly which files changed.

## Known consequence
- This intentionally removes the extra safety-related package scripts and post-build safety command because they are absent from the supplied live-site `scripts` block; files under `safety/` remain untouched.
