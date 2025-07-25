/**
 * Binary Map - Maps numbers 0-32 to their binary representation
 * Used for subnet mask calculations and CIDR notation
 */

export const binaryMap = new Map([
    [0, '00000000000000000000000000000000'],
    [1, '10000000000000000000000000000000'],
    [2, '11000000000000000000000000000000'],
    [3, '11100000000000000000000000000000'],
    [4, '11110000000000000000000000000000'],
    [5, '11111000000000000000000000000000'],
    [6, '11111100000000000000000000000000'],
    [7, '11111110000000000000000000000000'],
    [8, '11111111000000000000000000000000'],
    [9, '11111111100000000000000000000000'],
    [10, '11111111110000000000000000000000'],
    [11, '11111111111000000000000000000000'],
    [12, '11111111111100000000000000000000'],
    [13, '11111111111110000000000000000000'],
    [14, '11111111111111000000000000000000'],
    [15, '11111111111111100000000000000000'],
    [16, '11111111111111110000000000000000'],
    [17, '11111111111111111000000000000000'],
    [18, '11111111111111111100000000000000'],
    [19, '11111111111111111110000000000000'],
    [20, '11111111111111111111000000000000'],
    [21, '11111111111111111111100000000000'],
    [22, '11111111111111111111110000000000'],
    [23, '11111111111111111111111000000000'],
    [24, '11111111111111111111111100000000'],
    [25, '11111111111111111111111110000000'],
    [26, '11111111111111111111111111000000'],
    [27, '11111111111111111111111111100000'],
    [28, '11111111111111111111111111110000'],
    [29, '11111111111111111111111111111000'],
    [30, '11111111111111111111111111111100'],
    [31, '11111111111111111111111111111110'],
    [32, '11111111111111111111111111111111']
]);

/**
 * Convert CIDR prefix to subnet mask
 * @param {number} cidr - CIDR prefix length (0-32)
 * @returns {string} - Dotted decimal subnet mask
 */
export function cidrToSubnetMask(cidr) {
    if (cidr < 0 || cidr > 32) {
        throw new Error('CIDR must be between 0 and 32');
    }
    
    const binary = binaryMap.get(cidr);
    const octets = [];
    
    for (let i = 0; i < 4; i++) {
        const octet = binary.substr(i * 8, 8);
        octets.push(parseInt(octet, 2));
    }
    
    return octets.join('.');
}

/**
 * Convert subnet mask to CIDR prefix
 * @param {string} subnetMask - Dotted decimal subnet mask
 * @returns {number} - CIDR prefix length
 */
export function subnetMaskToCidr(subnetMask) {
    const octets = subnetMask.split('.').map(octet => parseInt(octet));
    let binary = '';
    
    for (const octet of octets) {
        binary += octet.toString(2).padStart(8, '0');
    }
    
    // Count consecutive 1s from the left
    let cidr = 0;
    for (const bit of binary) {
        if (bit === '1') {
            cidr++;
        } else {
            break;
        }
    }
    
    return cidr;
}

/**
 * Calculate the number of host bits for a given CIDR
 * @param {number} cidr - CIDR prefix length
 * @returns {number} - Number of host bits
 */
export function getHostBits(cidr) {
    return 32 - cidr;
}

/**
 * Calculate the number of possible hosts for a given CIDR
 * @param {number} cidr - CIDR prefix length
 * @returns {number} - Number of possible hosts (including network and broadcast)
 */
export function getTotalHosts(cidr) {
    const hostBits = getHostBits(cidr);
    return Math.pow(2, hostBits);
}

/**
 * Calculate the number of usable hosts for a given CIDR
 * @param {number} cidr - CIDR prefix length
 * @returns {number} - Number of usable hosts (excluding network and broadcast)
 */
export function getUsableHosts(cidr) {
    const totalHosts = getTotalHosts(cidr);
    return Math.max(0, totalHosts - 2); // Subtract network and broadcast addresses
}