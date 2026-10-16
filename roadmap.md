# Roadmap

- [x] Remove the `x-octo-marker` test line from trigger-deploy and redeploy it
- [x] Restore the 7 safety script entries in package.json so the GitHub safety gate can run again
- [x] Diagnose the deploy complaint — resolved: "Sync & Deploy" reaches Vercel and updates the live site
- [ ] Decide the safety gate contract: the judge still expects the two article addresses to serve the article, while `vercel.json` sends both to `/blog`. The check is RED on 8 discoverability findings, and its own test suite asserts it must be GREEN against the checked-in `vercel.json`. Reaching green needs either explicit rewrites back in `vercel.json` (owner forbade touching that file) or protections removed from the judge (owner decision needed).
- [ ] 6 visible sizes have no exact Stripe mapping (`CATALOG_MISSING_STRIPE_MAPPING`, pre-existing) — decide whether to fix
