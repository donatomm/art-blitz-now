/**
 * Reliable Stripe Checkout navigation across every browser, including
 * mobile in-app webviews (Instagram, Facebook, TikTok, Gmail) where a
 * `window.open()` fired after an `await` is silently blocked.
 *
 * Usage:
 *   const target = prepareCheckoutWindow(); // synchronous, inside the click handler
 *   const url = await createSession();
 *   navigateToCheckout(target, url);
 */

export type CheckoutTarget = Window | null;

/**
 * Must be called synchronously inside the user's click/tap handler, BEFORE any
 * await. Where popups are permitted this reserves a real tab; where they are
 * blocked it returns null and we fall back to same-tab navigation later.
 */
export function prepareCheckoutWindow(): CheckoutTarget {
  try {
    return window.open("", "_blank");
  } catch {
    return null;
  }
}

/** Close a reserved tab when checkout fails, so no blank tab is left behind. */
export function closeCheckoutWindow(target: CheckoutTarget): void {
  try {
    if (target && !target.closed) target.close();
  } catch {
    /* noop */
  }
}

/**
 * Sends the user to Stripe. Guaranteed to navigate on every platform:
 * reserved tab -> top-level same-tab navigation -> current-frame navigation.
 */
export function navigateToCheckout(target: CheckoutTarget, url: string): void {
  // 1. Reserved tab (popups allowed).
  try {
    if (target && !target.closed) {
      target.location.replace(url);
      return;
    }
  } catch {
    /* fall through to same-tab navigation */
  }

  console.warn("[checkout] popup blocked - navigating in the current tab");

  // 2. Top-level navigation (works in every mobile browser & in-app webview).
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = url;
      return;
    }
  } catch {
    /* cross-origin iframe (Lovable preview) - fall through */
  }

  // 3. Current frame.
  window.location.assign(url);
}
