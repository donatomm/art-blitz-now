/**
 * SSG-safe hook for static site settings
 * Returns bundled data synchronously - no API calls, no hydration mismatch
 */

import { staticSiteSettings, StaticSiteSettings, NavItem } from '@/generated/staticSiteSettings';

export type { NavItem };

export const useStaticSiteSettings = (): StaticSiteSettings => {
  return staticSiteSettings;
};

export default useStaticSiteSettings;
