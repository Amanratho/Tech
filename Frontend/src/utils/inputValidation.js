/**
 * Utility functions for strict frontend input validation.
 * 
 * Provides centralized logic to maintain data integrity across the application,
 * avoiding complex regex in individual components.
 */

/**
 * Cleans a string input by removing dangerous or junk characters.
 * Allows alphanumeric characters (including Hindi/Unicode if needed), spaces, commas, hyphens, and periods.
 * Removes special characters like <, >, {, }, *, %, $, etc.
 *
 * @param {string} value - The raw input string
 * @returns {string} - The sanitized string
 */
export const cleanStringInput = (value) => {
  if (typeof value !== "string") return "";
  
  // Allows letters (including unicode for multi-language like Hindi), numbers, spaces, 
  // commas, hyphens, periods, apostrophes, and parentheses.
  // Replaces anything that is NOT in this allowed set with an empty string.
  // \p{L} matches any kind of letter from any language
  // \p{N} matches any kind of numeric character
  // Note: For older browsers without unicode regex support, we might need a fallback, 
  // but standard modern React apps support 'u' flag.
  try {
    return value.replace(/[^\p{L}\p{N}\s,\-.'()]/gu, "");
  } catch (e) {
    // Fallback if regex 'u' flag is not supported
    return value.replace(/[^a-zA-Z0-9\s,\-.'()]/g, "");
  }
};

/**
 * Cleans a number input to ensure it is strictly positive.
 * It strips out minus signs and any other non-numeric character (except the decimal).
 *
 * @param {string|number} value - The raw input value
 * @returns {string} - The sanitized positive number string
 */
export const cleanNumberInput = (value) => {
  if (value === undefined || value === null) return "";
  
  // Convert to string
  let strValue = String(value);
  
  // Remove everything except digits and the decimal point
  strValue = strValue.replace(/[^0-9.]/g, "");
  
  // Ensure there is only at most one decimal point
  const parts = strValue.split(".");
  if (parts.length > 2) {
    strValue = parts[0] + "." + parts.slice(1).join("");
  }
  
  return strValue;
};

/**
 * Standard approach to block '-', '+', 'e', and 'E' keys during onKeyDown.
 * Useful for <input type="number" /> fields to prevent invalid characters 
 * before the onChange event fires.
 *
 * @param {React.KeyboardEvent} e - The keyboard event
 */
export const blockInvalidNumberKeys = (e) => {
  if (["-", "+", "e", "E"].includes(e.key)) {
    e.preventDefault();
  }
};
