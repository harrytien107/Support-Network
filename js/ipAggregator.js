/**
 * IP Aggregation / Supernetting Logic
 * Finds the longest common prefix of multiple IP addresses
 */

/**
 * Parse IP address string to array of integers
 * @param {string} ip - IP address in dotted decimal notation
 * @returns {number[]} - Array of four octets
 */
function parseIP(ip) {
    const octets = ip.split('.').map(octet => parseInt(octet));
    if (octets.length !== 4 || octets.some(octet => isNaN(octet) || octet < 0 || octet > 255)) {
        throw new Error(`Invalid IP address format: ${ip}`);
    }
    return octets;
}

/**
 * Convert IP address to 32-bit binary string
 * @param {string} ip - IP address in dotted decimal notation
 * @returns {string} - 32-bit binary representation
 */
function ipToBinary(ip) {
    const octets = parseIP(ip);
    return octets.map(octet => octet.toString(2).padStart(8, '0')).join('');
}

/**
 * Convert 32-bit binary string to IP address
 * @param {string} binary - 32-bit binary string
 * @returns {string} - IP address in dotted decimal notation
 */
function binaryToIP(binary) {
    const octets = [];
    for (let i = 0; i < 4; i++) {
        const octet = binary.substr(i * 8, 8);
        octets.push(parseInt(octet, 2));
    }
    return octets.join('.');
}

/**
 * Validate CIDR notation
 * @param {string} cidrNotation - IP address with CIDR (e.g., "192.168.1.0/24")
 * @returns {boolean} - True if valid
 */
function validateCIDRNotation(cidrNotation) {
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    
    if (!cidrRegex.test(cidrNotation)) {
        return false;
    }
    
    const [ip, cidr] = cidrNotation.split('/');
    const cidrNum = parseInt(cidr);
    
    // Validate CIDR range
    if (cidrNum < 0 || cidrNum > 32) {
        return false;
    }
    
    // Validate IP octets
    try {
        parseIP(ip);
        return true;
    } catch {
        return false;
    }
}

/**
 * Extract network address from IP/CIDR notation
 * @param {string} cidrNotation - IP address with CIDR
 * @returns {string} - Network address
 */
function getNetworkFromCIDR(cidrNotation) {
    const [ip, cidr] = cidrNotation.split('/');
    const cidrNum = parseInt(cidr);
    const binary = ipToBinary(ip);
    
    // Apply subnet mask to get network address
    const networkBinary = binary.substr(0, cidrNum).padEnd(32, '0');
    return binaryToIP(networkBinary);
}

/**
 * Find the longest common prefix of binary strings
 * @param {string[]} binaryStrings - Array of 32-bit binary strings
 * @returns {number} - Length of common prefix
 */
function findCommonPrefixLength(binaryStrings) {
    if (binaryStrings.length === 0) {
        return 0;
    }
    
    if (binaryStrings.length === 1) {
        return 32; // Single IP has full prefix
    }
    
    let commonLength = 0;
    const firstBinary = binaryStrings[0];
    
    for (let i = 0; i < 32; i++) {
        const bit = firstBinary[i];
        let allMatch = true;
        
        for (let j = 1; j < binaryStrings.length; j++) {
            if (binaryStrings[j][i] !== bit) {
                allMatch = false;
                break;
            }
        }
        
        if (allMatch) {
            commonLength++;
        } else {
            break;
        }
    }
    
    return commonLength;
}

/**
 * Aggregate multiple IP addresses to find their common supernet
 * @param {string[]} ipList - Array of IP addresses in CIDR notation
 * @returns {Object} - Aggregation result
 */
export function aggregateIPs(ipList) {
    try {
        // Filter out empty entries and validate input
        const validIPs = ipList
            .map(ip => ip.trim())
            .filter(ip => ip.length > 0);
        
        if (validIPs.length === 0) {
            throw new Error('Please provide at least one IP address');
        }
        
        // Validate all IP addresses
        const networkAddresses = [];
        const originalIPs = [];
        
        for (const ipCidr of validIPs) {
            if (!validateCIDRNotation(ipCidr)) {
                throw new Error(`Invalid CIDR notation: ${ipCidr}`);
            }
            
            const networkAddr = getNetworkFromCIDR(ipCidr);
            networkAddresses.push(networkAddr);
            originalIPs.push(ipCidr);
        }
        
        // Convert network addresses to binary
        const binaryNetworks = networkAddresses.map(ip => ipToBinary(ip));
        
        // Find common prefix length
        const commonPrefixLength = findCommonPrefixLength(binaryNetworks);
        
        // Generate the aggregated network
        const firstBinary = binaryNetworks[0];
        const aggregatedBinary = firstBinary.substr(0, commonPrefixLength).padEnd(32, '0');
        const aggregatedNetwork = binaryToIP(aggregatedBinary);
        const aggregatedCIDR = `${aggregatedNetwork}/${commonPrefixLength}`;
        
        // Calculate statistics
        const totalHosts = Math.pow(2, 32 - commonPrefixLength);
        const usableHosts = Math.max(0, totalHosts - 2);
        
        // Calculate broadcast address
        const broadcastBinary = firstBinary.substr(0, commonPrefixLength).padEnd(32, '1');
        const broadcastAddress = binaryToIP(broadcastBinary);
        
        return {
            success: true,
            originalIPs,
            networkAddresses,
            aggregatedNetwork: aggregatedCIDR,
            commonPrefixLength,
            broadcastAddress,
            totalHosts,
            usableHosts,
            binaryRepresentations: binaryNetworks.map((binary, index) => ({
                ip: networkAddresses[index],
                binary: binary,
                commonPrefix: binary.substr(0, commonPrefixLength),
                hostPortion: binary.substr(commonPrefixLength)
            }))
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message,
            originalIPs: ipList
        };
    }
}

/**
 * Check if IPs can be aggregated efficiently
 * @param {string[]} ipList - Array of IP addresses in CIDR notation
 * @returns {Object} - Analysis of aggregation efficiency
 */
export function analyzeAggregation(ipList) {
    const result = aggregateIPs(ipList);
    
    if (!result.success) {
        return result;
    }
    
    const originalNetworks = result.originalIPs.length;
    const aggregatedHosts = result.totalHosts;
    const originalTotalHosts = result.originalIPs.reduce((total, ipCidr) => {
        const [, cidr] = ipCidr.split('/');
        return total + Math.pow(2, 32 - parseInt(cidr));
    }, 0);
    
    const efficiency = originalTotalHosts / aggregatedHosts;
    const wastedAddresses = aggregatedHosts - originalTotalHosts;
    
    return {
        ...result,
        analysis: {
            originalNetworks,
            aggregatedHosts,
            originalTotalHosts,
            efficiency: Math.round(efficiency * 100) / 100,
            wastedAddresses,
            isEfficient: efficiency > 0.5 // Consider efficient if less than 50% waste
        }
    };
}