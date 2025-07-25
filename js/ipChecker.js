/**
 * IP Assignability Checker - Check if an IP is assignable within a subnet
 */

import { subnetMaskToCidr, cidrToWildcardMask } from "./binaryMap.js";

/**
 * Parse IP address string to array of integers
 * @param {string} ip - IP address in dotted decimal notation
 * @returns {number[]} - Array of four octets
 */
function parseIP(ip) {
  const octets = ip.split(".").map((octet) => parseInt(octet));
  if (octets.length !== 4 || octets.some((octet) => isNaN(octet) || octet < 0 || octet > 255)) {
    throw new Error("Invalid IP address format");
  }
  return octets;
}

/**
 * Convert IP address to 32-bit integer
 * @param {string} ip - IP address in dotted decimal notation
 * @returns {number} - 32-bit integer representation
 */
function ipToInt(ip) {
  const octets = parseIP(ip);
  return (octets[0] << 24) + (octets[1] << 16) + (octets[2] << 8) + octets[3];
}

/**
 * Convert 32-bit integer to IP address
 * @param {number} int - 32-bit integer
 * @returns {string} - IP address in dotted decimal notation
 */
function intToIP(int) {
  return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join(".");
}

/**
 * Validate subnet mask
 * @param {string} mask - Subnet mask in dotted decimal notation
 * @returns {boolean} - True if valid
 */
function isValidSubnetMask(mask) {
  try {
    const octets = parseIP(mask);
    let binary = "";

    for (const octet of octets) {
      binary += octet.toString(2).padStart(8, "0");
    }

    // Check if it's a valid subnet mask (consecutive 1s followed by consecutive 0s)
    const ones = binary.indexOf("0");
    if (ones === -1) return true; // All 1s is valid

    return binary.substr(ones).indexOf("1") === -1; // No 1s after the first 0
  } catch {
    return false;
  }
}

/**
 * Parse subnet mask or CIDR notation
 * @param {string} subnetInput - Subnet mask (255.255.255.0) or CIDR (/24)
 * @returns {number} - CIDR prefix length
 */
function parseSubnetInput(subnetInput) {
  const trimmed = subnetInput.trim();

  // Check if it's CIDR notation
  if (trimmed.startsWith("/")) {
    const cidr = parseInt(trimmed.substr(1));
    if (isNaN(cidr) || cidr < 0 || cidr > 32) {
      throw new Error("Invalid CIDR notation. Must be between /0 and /32");
    }
    return cidr;
  }

  // Check if it's just a number (CIDR without /)
  const cidrNum = parseInt(trimmed);
  if (!isNaN(cidrNum) && cidrNum >= 0 && cidrNum <= 32) {
    return cidrNum;
  }

  // Assume it's a subnet mask in dotted decimal notation
  if (!isValidSubnetMask(trimmed)) {
    throw new Error("Invalid subnet mask format");
  }

  return subnetMaskToCidr(trimmed);
}

/**
 * Calculate network address
 * @param {string} ip - IP address
 * @param {number} cidr - CIDR prefix length
 * @returns {string} - Network address
 */
function getNetworkAddress(ip, cidr) {
  const ipInt = ipToInt(ip);
  const maskInt = (-1 << (32 - cidr)) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  return intToIP(networkInt);
}

/**
 * Calculate broadcast address
 * @param {string} networkIP - Network address
 * @param {number} cidr - CIDR prefix length
 * @returns {string} - Broadcast address
 */
function getBroadcastAddress(networkIP, cidr) {
  const networkInt = ipToInt(networkIP);
  const hostBits = 32 - cidr;
  const broadcastInt = (networkInt + Math.pow(2, hostBits) - 1) >>> 0;
  return intToIP(broadcastInt);
}

/**
 * Check if an IP address is assignable within a subnet
 * @param {string} ipAddress - IP address to check
 * @param {string} subnetInput - Subnet mask or CIDR notation
 * @returns {Object} - Result object with assignability information
 */
export function checkIPAssignability(ipAddress, subnetInput) {
  try {
    // Validate and parse inputs
    const ipInt = ipToInt(ipAddress); // This will throw if IP is invalid
    const cidr = parseSubnetInput(subnetInput);

    // Calculate network and broadcast addresses
    const networkAddress = getNetworkAddress(ipAddress, cidr);
    const broadcastAddress = getBroadcastAddress(networkAddress, cidr);

    const networkInt = ipToInt(networkAddress);
    const broadcastInt = ipToInt(broadcastAddress);

    // Determine if IP is assignable
    const isNetworkAddress = ipInt === networkInt;
    const isBroadcastAddress = ipInt === broadcastInt;
    const isInRange = ipInt >= networkInt && ipInt <= broadcastInt;
    const isAssignable = isInRange && !isNetworkAddress && !isBroadcastAddress;

    // Calculate additional information
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = Math.max(0, totalHosts - 2);
    const firstUsableIP = totalHosts > 2 ? intToIP(networkInt + 1) : null;
    const lastUsableIP = totalHosts > 2 ? intToIP(broadcastInt - 1) : null;
    const wildcardMask = cidrToWildcardMask(cidr);

    return {
      success: true,
      ipAddress,
      subnetInput,
      cidr,
      networkAddress,
      broadcastAddress,
      firstUsableIP,
      lastUsableIP,
      wildcardMask,
      totalHosts,
      usableHosts,
      isAssignable,
      isNetworkAddress,
      isBroadcastAddress,
      isInRange,
      message: getAssignabilityMessage(isAssignable, isNetworkAddress, isBroadcastAddress, isInRange),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      ipAddress,
      subnetInput,
    };
  }
}

/**
 * Generate human-readable message about IP assignability
 * @param {boolean} isAssignable - Whether IP is assignable
 * @param {boolean} isNetworkAddress - Whether IP is network address
 * @param {boolean} isBroadcastAddress - Whether IP is broadcast address
 * @param {boolean} isInRange - Whether IP is in subnet range
 * @returns {string} - Human-readable message
 */
function getAssignabilityMessage(isAssignable, isNetworkAddress, isBroadcastAddress, isInRange) {
  if (isAssignable) {
    return "This IP address is assignable to a host device.";
  }

  if (!isInRange) {
    return "This IP address is outside the specified subnet range.";
  }

  if (isNetworkAddress) {
    return "This IP address is the network address and cannot be assigned to a host.";
  }

  if (isBroadcastAddress) {
    return "This IP address is the broadcast address and cannot be assigned to a host.";
  }

  return "This IP address is not assignable.";
}

/**
 * Validate IP address format
 * @param {string} ip - IP address to validate
 * @returns {boolean} - True if valid
 */
export function validateIP(ip) {
  try {
    parseIP(ip);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get detailed subnet information
 * @param {string} networkAddress - Network address
 * @param {number} cidr - CIDR prefix length
 * @returns {Object} - Detailed subnet information
 */
export function getSubnetInfo(networkAddress, cidr) {
  const networkInt = ipToInt(networkAddress);
  const totalHosts = Math.pow(2, 32 - cidr);
  const broadcastInt = networkInt + totalHosts - 1;

  return {
    networkAddress,
    broadcastAddress: intToIP(broadcastInt),
    firstUsableIP: totalHosts > 2 ? intToIP(networkInt + 1) : null,
    lastUsableIP: totalHosts > 2 ? intToIP(broadcastInt - 1) : null,
    totalHosts,
    usableHosts: Math.max(0, totalHosts - 2),
    cidr,
  };
}
