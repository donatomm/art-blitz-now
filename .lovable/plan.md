

# Green + Gold Contact Buttons -- Implementation

## Overview

Update both contact button files to use branded `<a>` tags with real SVG logos, green (#25D366) and gold (#FFD700) styling, and dynamic contact data from site settings.

## File 1: `src/pages/Contact.tsx`

**Remove:**
- `import { MessageCircle, Mail } from "lucide-react"`
- `import { Button } from "@/components/ui/button"`
- Hardcoded WhatsApp number `393666295174` and email `me@octowonders.com`

**Add:**
- `import { useStaticSiteSettings } from "@/hooks/useStaticSiteSettings"` for dynamic contact data
- `const settings = useStaticSiteSettings()` inside the component
- Build `whatsappLink` and `emailLink` from `settings.hellobar_whatsapp_number` and `settings.hellobar_contact_email`

**Replace button block with two plain `<a>` tags:**

- **WhatsApp**: green background (#25D366), white text, inline WhatsApp SVG logo (the same `<path>` already used in `HelloBar.tsx`), `rounded-lg`, `font-bold`, `text-lg`, `py-4 px-6`
- **Email**: dark gradient background (#1a1a2e to #16213e), white text, Lucide-style Mail SVG icon, 3px gold border (#FFD700), gold glow shadow, same sizing

**Layout stays:** `flex flex-col sm:flex-row gap-4 mt-8` (stacked on mobile, side-by-side on desktop)

## File 2: `src/components/ContactButtons.tsx`

**Remove:**
- `import { MessageCircle, Mail } from "lucide-react"`
- `import { Button } from "@/components/ui/button"`

**Replace button block with the same styled `<a>` tags**, slightly smaller sizing (`py-3 px-5`, `text-base`) since these render inline within CMS page content.

**Keep:** existing `useStaticSiteSettings` import, props interface, and link-building logic (already correct).

## SVG Logos (from HelloBar.tsx, proven working)

- **WhatsApp**: official brand SVG path, `fill="currentColor"`, `viewBox="0 0 24 24"`
- **Mail**: envelope outline SVG, `stroke="currentColor"`, `viewBox="0 0 24 24"`

Both are lightweight inline SVGs with `className="w-5 h-5"` -- no external dependencies.

## Summary

| What | Before | After |
|------|--------|-------|
| Contact data | Hardcoded in Contact.tsx | Dynamic from site settings |
| WhatsApp icon | Generic Lucide MessageCircle | Official WhatsApp SVG logo |
| WhatsApp color | shadcn Button variant | Green #25D366 background |
| Email color | Plain gray button | Dark gradient + gold border + glow |
| Wrapper | shadcn Button asChild | Plain `<a>` tags |

2 files modified, 0 new files.

