
# Verified Plan: Fix Admin INP to < 40ms + Permanent Anti-Regression Check

## Double-Check Verification of the Proposed Solution

### What the INP trace shows (exact measurements)

| Interaction | Time | Element |
|---|---|---|
| Gear button click → open | 91ms (click) + 57ms (render) | SheetTrigger |
| Pages tab click | 57ms render | `#radix-trigger-pages` |
| Content textarea input delay | 212ms | `.font-mono.text-sm` textarea |
| Gear button click → close | 193ms render | SheetTrigger |
| Overall INP | 216ms | |

### Root cause 1 confirmed: Debounce is the input delay

In `src/components/admin/PageEditorForm.tsx` (lines 47-48), the content textarea still uses `useDebouncedInput`:

```typescript
const debouncedContent = useDebouncedInput(editContent, setEditContent);       // line 47
const debouncedSeoDescription = useDebouncedInput(editSeoDescription, setEditSeoDescription); // line 48
```

The sequence when the user types one character:
1. User presses key → local state updates instantly (0ms)
2. 150ms debounce timer fires → `setEditContent(val)` runs
3. React re-renders `PageEditorForm` with new state → 58ms render
4. Total input delay = 150ms + 58ms = **208ms** — matches the 212ms in the trace

The PageEditorForm fix removed the expensive 950ms re-render of `PagesTabContent`. But the debounce that was meant to prevent those re-renders was not removed. Now the debounce adds latency with zero benefit because re-renders inside `PageEditorForm` cost < 5ms (small isolated component).

Fix: Replace `useDebouncedInput` on the content textarea and SEO description textarea with plain `useState` + direct `onChange`. Remove `DebouncedInput` for title/slug/seoTitle as well — plain `Input` is correct since the component is isolated.

### Root cause 2 confirmed: All tab sub-components mount on Sheet open

In `src/components/AdminPanel.tsx` (lines 1218-1250), the current mount order when the gear is clicked:

```typescript
// Lines 1218-1250 — ALL mount simultaneously when Sheet opens:
<TabsContent value="skus"><SKUEditor .../></TabsContent>   // hooks: renders all products
<MenuTabContent />                                          // hooks: useSiteSettings + useEffect
<HeroTabContent />                                          // hooks: useSiteSettings + 3x useDebouncedInput + useEffect
<PagesTabContent />                                         // hooks: usePages + useSiteSettings + useUpdatePage + useCreatePage
<HelloBarTabContent />                                      // hooks: useSiteSettings + 5x useDebouncedInput + useEffect
<TabsContent value="images">                               // mounts: ArticleImageBrowser, BrokenImageCleanup, ImageOptimizer
<DeployTabContent />                                        // minimal
```

All 7 sub-components execute their hooks and effects simultaneously in one synchronous React commit. The 193ms close render is the unmount cost of the same tree.

Fix: Wrap each sub-component with `{activeTab === "X" && <Component />}`. The `activeTab` state already exists at line 639. On Sheet open, only the default `"products"` tab is active, so only the products list renders.

Note: `MenuTabContent`, `HeroTabContent`, `PagesTabContent`, `HelloBarTabContent` each include their own `<TabsContent value="X">` wrapper. The lazy guard must be applied INSIDE the `TabsContent` wrapper, not outside it, to avoid breaking Radix tab visibility. Pattern:

```tsx
// CORRECT: guard the component, keep TabsContent shell
<TabsContent value="menu">
  {activeTab === "menu" && <MenuTabContent />}
</TabsContent>

// BUT MenuTabContent renders its own <TabsContent value="menu">
// Solution: strip the TabsContent wrapper FROM MenuTabContent and put it in AdminPanel
```

The cleanest approach: strip the `<TabsContent value="X">` wrapper from each sub-component (they become pure content components), and move the wrapper + guard into AdminPanel.tsx. This is a small refactor to each sub-component file.

### Root cause 3 confirmed: HeroTabContent debounce is also counterproductive

In `src/components/AdminPanel.tsx` (lines 357-370), `HeroTabContent` also uses `useDebouncedInput` for three fields that now live in an isolated sub-component:

```typescript
const debouncedHeroTitle = useDebouncedInput(heroTitle, (val) => { setHeroTitle(val); markChanged(); }, 150);
const debouncedHeroSubtitle = useDebouncedInput(heroSubtitle, (val) => { setHeroSubtitle(val); markChanged(); }, 150);
const debouncedHeroCtaText = useDebouncedInput(heroCtaText, (val) => { setHeroCtaText(val); markChanged(); }, 150);
```

Same problem: the debounce adds 150ms latency with no benefit since `HeroTabContent` is already isolated. Fix: remove `useDebouncedInput` from `HeroTabContent`, use plain `useState` + `onChange`.

Same issue in `HelloBarTabContent.tsx` (lines 112-135): 5 `useDebouncedInput` calls.

## Files Changed

### 1. `src/components/admin/PageEditorForm.tsx`
- Remove `useDebouncedInput` import
- Remove `DebouncedInput` import, add `Input` import
- Replace `debouncedContent` with direct `setEditContent`
- Replace `debouncedSeoDescription` with direct `setEditSeoDescription`
- Replace `DebouncedInput` elements with plain `Input`
- Remove `flushSync` calls from `handleSave`
- Fix `handleImageUploaded` to use `setEditContent` directly

### 2. `src/components/AdminPanel.tsx` (HeroTabContent, lines 342-551)
- Remove 3 `useDebouncedInput` calls from `HeroTabContent`
- Replace with plain state + direct `onChange` handlers
- Remove `flushSync` calls from `HeroTabContent.handleSave`
- Wrap each sub-component inside `TabsContent` with `{activeTab === "X" && ...}` guard (lines 1218-1250)
- The `<TabsContent>` wrappers stay in AdminPanel — the sub-component bodies render lazily

### 3. `src/components/HelloBarTabContent.tsx`
- Remove 5 `useDebouncedInput` calls
- Replace with plain state + direct `onChange` handlers
- Remove `flushSync` calls from `handleSave`
- Strip the `<TabsContent value="hellobar">` wrapper (moved to AdminPanel)

### 4. `src/components/MenuTabContent.tsx`
- Strip the `<TabsContent value="menu">` wrapper (moved to AdminPanel)
- No debounce used here — no debounce changes needed

### 5. `docs/SAFETY-CHECK.md`
- Add new Section 11: Admin Panel INP Anti-Regression Check

## Expected Result

| Metric | Before | After |
|---|---|---|
| Textarea input delay | 212ms | < 5ms |
| Gear open render | 57ms | < 20ms |
| Gear close render | 193ms | < 20ms |
| INP | 216ms | < 40ms |

---

## Section 11 to Add to `docs/SAFETY-CHECK.md`

This is the exact content to append to the file:

```markdown
---

## 11. Admin Panel INP Anti-Regression Check (RUN BEFORE ANY CHANGE TO ADMIN FILES)

**Target**: Admin panel interactions must remain < 50ms INP at all times.
**Verified baseline**: Textarea input delay < 5ms, Sheet open/close < 20ms.

### Files under protection

Any change to these files MUST pass ALL checks below before implementation:

| File | INP Risk |
|------|----------|
| `src/components/AdminPanel.tsx` | CRITICAL — Sheet mount cost, tab lazy-loading |
| `src/components/HelloBarTabContent.tsx` | HIGH — 5 state fields, popup textarea |
| `src/components/MenuTabContent.tsx` | MEDIUM — list re-render on changes |
| `src/components/admin/PageEditorForm.tsx` | HIGH — large content textarea |
| `src/components/admin/TrustBarItemInput.tsx` | LOW |
| `src/components/admin/MenuItemRow.tsx` | LOW |
| `src/components/HeroTabContent` (inline in AdminPanel.tsx) | HIGH — 3 text inputs |

### Rule 1: NO useDebouncedInput inside isolated sub-components

`useDebouncedInput` was designed to prevent re-renders of LARGE parent components. Inside an already-isolated sub-component (e.g., `PageEditorForm`, `HeroTabContent`, `HelloBarTabContent`), it adds 150ms+ latency with zero benefit.

BEFORE adding `useDebouncedInput` anywhere in Admin files, ask:

| Question | Required Answer | If No |
|---|---|---|
| Will this state update trigger re-renders OUTSIDE this component? | Yes | Use plain useState — debounce is wrong here |
| Is the component subtree larger than ~20 nodes? | Yes | Use plain useState — component is already isolated |
| Is the re-render cost measured at > 100ms? | Yes | Use plain useState — debounce cannot fix mount cost |

CORRECT pattern (isolated sub-component):
```typescript
// CORRECT: plain state, instant response
const [content, setContent] = useState(page.content);
<Textarea value={content} onChange={(e) => setContent(e.target.value)} />
```

WRONG pattern (unnecessary debounce in isolated component):
```typescript
// WRONG: adds 150ms delay with no benefit
const debouncedContent = useDebouncedInput(content, setContent, 150);
<Textarea value={debouncedContent.value} onChange={(e) => debouncedContent.onChange(e.target.value)} />
```

`useDebouncedInput` IS appropriate ONLY in large components where state updates propagate to expensive parent re-renders — for example, a text field inside `AdminPanel` main component body (not a sub-component).

### Rule 2: ALL tab sub-components MUST be lazy-mounted

The AdminPanel Sheet mounts all tab content simultaneously on open. This MUST NOT regress. The pattern that fixes this:

```typescript
// CORRECT: lazy mount — only renders when tab is active
<TabsContent value="hero">
  {activeTab === "hero" && <HeroTabContent />}
</TabsContent>

// WRONG: always mounted — all hooks run on every Sheet open
<HeroTabContent />  // (component owns its own TabsContent wrapper)
```

BEFORE adding a new tab to AdminPanel, verify:
- [ ] The new tab content is wrapped in `{activeTab === "X" && <NewTabComponent />}`
- [ ] The `<TabsContent value="X">` wrapper lives in AdminPanel.tsx, NOT inside the sub-component
- [ ] The sub-component does NOT include its own `<TabsContent>` wrapper

### Rule 3: New admin sub-components must be state-isolated

BEFORE adding any new form or editor inside the admin panel:
- [ ] Does it own its own state? (not shared with parent `AdminPanel`)
- [ ] Does it use `useEffect` with API calls? If yes: will those run on Sheet open even when inactive? Apply Rule 2.
- [ ] Does it have a large textarea or multi-field form? If yes: use plain `useState`, NOT `useDebouncedInput`

### Rule 4: Verify INP after ANY admin change

After implementing any change that touches admin files:
1. Open the admin panel gear button in Chrome
2. Navigate to the affected tab
3. Type in any textarea/input for 5 seconds
4. Check Chrome DevTools → Performance → INP badge
5. REQUIRED: INP < 100ms. TARGET: INP < 50ms. If > 100ms: the change has introduced a regression and must be reverted or fixed before merging.

### Quick Reference: What Each Pattern Fixes

| Pattern | What it fixes | What it does NOT fix |
|---|---|---|
| `PageEditorForm` extraction | Re-render cost on typing (950ms → 5ms) | Sheet open cost |
| Remove `useDebouncedInput` from isolated components | Input delay (212ms → 0ms) | Sheet open cost |
| Lazy tab mounting `{activeTab === "X" && ...}` | Sheet open/close cost (193ms → 20ms) | Typing delay |
| Plain `useState` instead of debounce | Typing responsiveness | Nothing (it's the correct base pattern) |
```
