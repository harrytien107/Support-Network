/**
 * Number Base Converter - Converts numbers between different bases
 */

/**
 * Validates if a number is valid for the given base
 * @param {string} number - The number string to validate
 * @param {number} base - The base (2, 8, 10, 16)
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateNumber(number, base) {
  if (!number || number.trim() === "") {
    return false;
  }

  // Remove spaces and convert to uppercase for hex
  number = number.trim().toUpperCase();

  let validChars;

  switch (base) {
    case 2: // Binary
      validChars = /^[01]+$/;
      break;
    case 8: // Octal
      validChars = /^[0-7]+$/;
      break;
    case 10: // Decimal
      validChars = /^[0-9]+$/;
      break;
    case 16: // Hexadecimal
      validChars = /^[0-9A-F]+$/;
      break;
    default:
      return false;
  }

  return validChars.test(number);
}

/**
 * Converts a number from any base to decimal
 * @param {string} number - The number string
 * @param {number} fromBase - The source base
 * @returns {number} - The decimal value
 */
export function toDecimal(number, fromBase) {
  if (!validateNumber(number, fromBase)) {
    throw new Error(`Invalid ${getBaseName(fromBase)} number: ${number}`);
  }

  return parseInt(number.trim().toUpperCase(), fromBase);
}

/**
 * Converts a decimal number to any base
 * @param {number} decimal - The decimal number
 * @param {number} toBase - The target base
 * @returns {string} - The converted number string
 */
export function fromDecimal(decimal, toBase) {
  if (decimal < 0) {
    throw new Error("Negative numbers are not supported");
  }

  if (!Number.isInteger(decimal)) {
    throw new Error("Only integer numbers are supported");
  }

  return decimal.toString(toBase).toUpperCase();
}

/**
 * Main conversion function
 * @param {string} number - The input number
 * @param {number} fromBase - Source base (2, 8, 10, 16)
 * @param {number} toBase - Target base (2, 8, 10, 16)
 * @returns {string} - The converted number
 */
export function convertNumber(number, fromBase, toBase) {
  // First convert to decimal
  const decimal = toDecimal(number, fromBase);

  // Then convert from decimal to target base
  return fromDecimal(decimal, toBase);
}

/**
 * Converts a number to all bases
 * @param {string} number - The input number
 * @param {number} fromBase - Source base
 * @returns {object} - Object with all conversions
 */
export function convertToAllBases(number, fromBase) {
  try {
    const decimal = toDecimal(number, fromBase);

    return {
      success: true,
      decimal: decimal,
      binary: fromDecimal(decimal, 2),
      octal: fromDecimal(decimal, 8),
      hexadecimal: fromDecimal(decimal, 16),
      bitLength: decimal.toString(2).length,
      byteSize: Math.ceil(decimal.toString(2).length / 8),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Gets the name of a base
 * @param {number} base - The base number
 * @returns {string} - The base name
 */
export function getBaseName(base) {
  const baseNames = {
    2: "Binary",
    8: "Octal",
    10: "Decimal",
    16: "Hexadecimal",
  };

  return baseNames[base] || "Unknown";
}

/**
 * Gets input placeholder and help text for a base
 * @param {number} base - The base number
 * @returns {object} - Object with placeholder and help text
 */
export function getInputHelp(base) {
  const helpData = {
    2: {
      placeholder: "e.g., 1010",
      help: "Enter a binary number (only 0s and 1s)",
    },
    8: {
      placeholder: "e.g., 377",
      help: "Enter an octal number (digits 0-7)",
    },
    10: {
      placeholder: "e.g., 255",
      help: "Enter a decimal number (digits 0-9)",
    },
    16: {
      placeholder: "e.g., FF",
      help: "Enter a hexadecimal number (digits 0-9, A-F)",
    },
  };

  return helpData[base] || helpData[10];
}

/**
 * Format number with proper prefix
 * @param {string} number - The number string
 * @param {number} base - The base
 * @returns {string} - Formatted number with prefix
 */
export function formatWithPrefix(number, base) {
  const prefixes = {
    2: "0b",
    8: "0o",
    10: "",
    16: "0x",
  };

  return prefixes[base] + number;
}
