# Stage 0 Change 1 evidence: held production branch

**Execution date:** 23 August 2026

**Status:** completed and verified. This was the only outside change in this step.

## Approved action

Create GitHub branch `production` in `donatomm/art-blitz-now` from exactly:

`063cf2a3dbadd913e5e37c11703d52b52a82a340`

No file change, merge, push to `main`, Vercel setting, domain change or deployment was authorized.

## Preconditions immediately before execution

| Item | Verified value |
| --- | --- |
| GitHub `main` | `063cf2a3dbadd913e5e37c11703d52b52a82a340` |
| Existing `production` branch | absent |
| Current public Vercel build | `dpl_TL2wWwETpnj44kzsc6NxeV9AhVAo` |
| Public build GitHub version | `063cf2a3dbadd913e5e37c11703d52b52a82a340` |
| Public build state | ready |

The action was cancelled automatically if any precondition differed. All preconditions matched.

## Action result

GitHub reported that branch `production` was created.

The post-action GitHub comparison proved:

- `production` resolves successfully;
- `production` and `063cf2a3...` are identical;
- zero version ahead;
- zero version behind;
- zero differing file.

## Public-store verification

After branch creation:

| Item | Verified result |
| --- | --- |
| Latest public build | still `dpl_TL2wWwETpnj44kzsc6NxeV9AhVAo` |
| Build state | ready |
| Build GitHub version | still `063cf2a3...` |
| Public aliases | `octowonders.com`, `www.octowonders.com` and the existing project aliases remain attached |
| Homepage | fetched successfully |
| Checked product page | fetched successfully |
| Exact owner label `2x9060` | still visible |

No new Vercel deployment became the latest deployment during this verification.

## Risk and recovery state

The held branch is recoverable and contains no unique file change. Do not delete it while Vercel is configured to follow it. At this point Vercel has not yet been changed to follow it, so the public release-control gap is not yet closed.

## Changes not made

- No GitHub file, default branch, protection rule, action setting or review request changed.
- No Vercel setting, deployment, public domain or alias changed.
- No application, catalogue, payment, production data, alert, rollback or indexing action occurred.
- Automatic rollback remained disabled and release reopening remained manual.

## Next approval boundary

The next proposed outside action is only this Vercel setting change in project `art-blitz-now`:

- current effective public branch: `main`;
- proposed public branch: `production`;
- documented screen: `Settings` → `Environments` → `Production` → `Branch Tracking`.

Before execution, present the exact current and proposed values to Donato again. If the documented field is absent or its current value is not `main`, stop without changing anything.
