// Affiliate tracking utilities
// Manages cookie + localStorage for affiliate referral persistence

const COOKIE_NAME = "affiliate_ref";
const LS_KEY = "affiliate_ref";
const COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

/**
 * Store affiliate ref in cookie (30 days) + localStorage backup.
 * Last-click model: always overwrites previous value.
 */
export function storeAffiliateRef(affiliateId: string) {
  setCookie(COOKIE_NAME, affiliateId, COOKIE_DAYS);
  try {
    localStorage.setItem(LS_KEY, affiliateId);
  } catch {}
}

/**
 * Retrieve stored affiliate ref. Cookie takes priority, falls back to localStorage.
 */
export function getAffiliateRef(): string | null {
  const fromCookie = getCookie(COOKIE_NAME);
  if (fromCookie) return fromCookie;
  try {
    return localStorage.getItem(LS_KEY);
  } catch {
    return null;
  }
}

/**
 * Clear affiliate ref after successful registration assignment.
 */
export function clearAffiliateRef() {
  deleteCookie(COOKIE_NAME);
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
}
