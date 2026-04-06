/**
 * Utility functions for generating clean, attractive landing page URLs.
 */

const PRODUCTION_DOMAIN = 'painelcredito2026.lovable.app';

/** Returns the base origin for links (production domain or current origin in dev) */
export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return window.location.origin;
  }
  return `https://${PRODUCTION_DOMAIN}`;
};

/** Full URL for a landing page */
export const getLandingPageUrl = (slug: string, clean = false): string => {
  const base = `${getBaseUrl()}/p/${slug}`;
  return clean ? `${base}?clean=true` : base;
};

/** Short display version of the URL (no https://) */
export const getDisplayUrl = (slug: string): string => {
  return `${PRODUCTION_DOMAIN}/p/${slug}`;
};
