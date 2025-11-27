/**
 * URL Validation Utilities
 * Provides functions for validating and checking URLs in the RestBolt app
 */

/**
 * Checks if a string contains template variables (e.g., {{baseUrl}}, {{token}})
 * @param str - The string to check
 * @returns true if the string contains template variables
 */
export const hasTemplateVariables = (str: string): boolean => {
  return /\{\{.+?\}\}/.test(str);
};

/**
 * Validates if a string is a valid HTTP(S) URL
 * Also returns true if the URL contains template variables
 * @param urlString - The URL string to validate
 * @returns true if the URL is valid, uses http/https protocol, or contains template variables
 */
export const isValidUrl = (urlString: string): boolean => {
  if (!urlString || urlString.trim().length < 8) return false;

  // Allow URLs with template variables
  if (hasTemplateVariables(urlString)) return true;

  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Checks if URL should show validation error
 * Only show error if URL is non-empty, has no template variables, and is invalid
 * @param urlString - The URL string to check
 * @returns true if should show validation error
 */
export const shouldShowUrlError = (urlString: string): boolean => {
  const trimmed = urlString.trim();
  return trimmed.length > 0 && !hasTemplateVariables(trimmed) && !isValidUrl(trimmed);
};
