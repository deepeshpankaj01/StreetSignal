import crypto from 'node:crypto';

/**
 * Generates a clean, unique civic report ID (e.g., SIG-729401 or SIG-832109)
 * Prefixed with 'SIG-' followed by 6 random numbers/characters
 */
export function generateReportId() {
  const randomNum = crypto.randomInt(100000, 999999);
  return `SIG-${randomNum}`;
}

/**
 * Validates report ID format
 * @param {string} id 
 * @returns {boolean}
 */
export function isValidReportId(id) {
  if (!id || typeof id !== 'string') return false;
  return /^SIG-[A-Z0-9]{6}$/i.test(id.trim());
}
