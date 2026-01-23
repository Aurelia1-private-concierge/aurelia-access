/**
 * Domain validation utilities for Apollo.io integration
 */

const PRIMARY_DOMAIN_REGEX = /^https:\/\/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

/**
 * Validate a list of up to 5 main domains (https://domain.tld).
 * No subdomains, no paths, no duplicates. Returns true if valid.
 */
export function validatePrimaryDomains(domains: string[]): boolean {
  if (!domains || domains.length === 0 || domains.length > 5) return false;
  const unique = new Set(domains);
  if (unique.size !== domains.length) return false;
  for (const d of domains) {
    if (!PRIMARY_DOMAIN_REGEX.test(d)) return false;
  }
  return true;
}

/**
 * Validate a single primary domain.
 * Returns error message or null if valid.
 */
export function validateSingleDomain(domain: string): string | null {
  if (!domain.trim()) return null;
  if (!PRIMARY_DOMAIN_REGEX.test(domain.trim())) {
    return "Use primary domain only (e.g., https://apollo.io)";
  }
  return null;
}

/**
 * Check for duplicate domains in a list.
 * Returns true if duplicates exist.
 */
export function hasDuplicateDomains(domains: string[]): boolean {
  const filtered = domains.filter(d => d.trim());
  return new Set(filtered).size !== filtered.length;
}
