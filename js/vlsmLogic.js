/**
 * VLSM Logic - Variable Length Subnet Masking calculations
 */

import { cidrToSubnetMask, getUsableHosts, cidrToWildcardMask } from "./binaryMap.js";
import { t } from "./i18n.js";

/**
 * Parse IP address string to array of integers
 * @param {string} ip - IP address in dotted decimal notation
 * @returns {number[]} - Array of four octets
 */
function parseIP(ip) {
  return ip.split(".").map((octet) => parseInt(octet));
}

/**
 * Convert IP array back to string
 * @param {number[]} ipArray - Array of four octets
 * @returns {string} - IP address in dotted decimal notation
 */
function ipArrayToString(ipArray) {
  return ipArray.join(".");
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
 * Calculate network address given IP and CIDR
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
 * Calculate broadcast address given network address and CIDR
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
 * Calculate first usable IP address
 * @param {string} networkIP - Network address
 * @returns {string} - First usable IP address
 */
function getFirstUsableIP(networkIP) {
  const networkInt = ipToInt(networkIP);
  return intToIP(networkInt + 1);
}

/**
 * Calculate last usable IP address
 * @param {string} broadcastIP - Broadcast address
 * @returns {string} - Last usable IP address
 */
function getLastUsableIP(broadcastIP) {
  const broadcastInt = ipToInt(broadcastIP);
  return intToIP(broadcastInt - 1);
}

/**
 * Find the smallest CIDR that can accommodate the required number of hosts
 * @param {number} requiredHosts - Number of hosts needed
 * @returns {number} - CIDR prefix length
 */
function findSuitableCIDR(requiredHosts) {
  for (let cidr = 30; cidr >= 1; cidr--) {
    const usableHosts = getUsableHosts(cidr);
    if (usableHosts >= requiredHosts) {
      return cidr;
    }
  }
  throw new Error(`Cannot accommodate ${requiredHosts} hosts in any subnet`);
}

/**
 * Core VLSM allocation logic - shared between calculation and analysis
 * @param {string} baseNetwork - Base network in CIDR notation
 * @param {Array} sortedRequirements - Requirements sorted by hosts (descending)
 * @returns {Object} - Contains results and allocation steps
 */
function performVLSMAllocation(baseNetwork, sortedRequirements, strategy = "first") {
  const results = [];
  const allocationSteps = []; // Track each allocation step for analysis

  // Track available networks for hierarchical subdivision
  let availableNetworks = [{ network: baseNetwork, used: false }];

  for (let i = 0; i < sortedRequirements.length; i++) {
    const requirement = sortedRequirements[i];
    const requiredHosts = requirement.hosts;

    // Find suitable CIDR for this requirement
    const subnetCIDR = findSuitableCIDR(requiredHosts);
    const subnetSize = Math.pow(2, 32 - subnetCIDR);

    // Find the smallest available network that can accommodate this subnet
    let bestParent = null;
    let bestParentIndex = -1;

    for (let j = 0; j < availableNetworks.length; j++) {
      const available = availableNetworks[j];
      if (available.used) continue;

      const [parentIP, parentCIDRStr] = available.network.split("/");
      const parentCIDR = parseInt(parentCIDRStr);
      const parentSize = Math.pow(2, 32 - parentCIDR);

      // Check if this parent can accommodate the required subnet
      if (parentSize >= subnetSize && parentCIDR <= subnetCIDR) {
        // Prefer smaller networks (higher CIDR) for efficiency, but prioritize .0 addresses
        const parentNetworkInt = ipToInt(getNetworkAddress(parentIP, parentCIDR));

        if (!bestParent) {
          bestParent = available;
          bestParentIndex = j;
        } else {
          const [bestIP, bestCIDRStr] = bestParent.network.split("/");
          const bestCIDR = parseInt(bestCIDRStr);
          const bestNetworkInt = ipToInt(getNetworkAddress(bestIP, bestCIDR));

          // Prioritize: 1) Lower address (.0 priority), 2) Then smaller network (higher CIDR)
          if (parentNetworkInt < bestNetworkInt || (parentNetworkInt === bestNetworkInt && parentCIDR > bestCIDR)) {
            bestParent = available;
            bestParentIndex = j;
          }
        }
      }
    }

    if (!bestParent) {
      throw new Error(`Insufficient space in base network for Network ${requirement.networkNumber} requiring ${requiredHosts} hosts`);
    }

    const [parentIP, parentCIDRStr] = bestParent.network.split("/");
    const parentCIDR = parseInt(parentCIDRStr);

    // Store allocation step for analysis
    const allocationStep = {
      requirement: requirement,
      parentNetwork: bestParent.network,
      parentCIDR: parentCIDR,
      targetCIDR: subnetCIDR,
      availableNetworksBefore: [...availableNetworks],
      strategy: strategy,
    };

    // If we need to subdivide the parent network
    if (parentCIDR < subnetCIDR) {
      // Generate all subnets from this parent
      const allSubnets = generateSubnetDivision(bestParent.network, subnetCIDR);

      // Choose subnet based on strategy
      let assignedSubnetIndex;
      if (strategy === "last") {
        // Assign the last subnet to this requirement
        assignedSubnetIndex = allSubnets.length - 1;
      } else {
        // Default: assign the first subnet (.0 network)
        assignedSubnetIndex = 0;
      }

      const assignedSubnet = allSubnets[assignedSubnetIndex];
      allocationStep.allSubnets = allSubnets;
      allocationStep.assignedSubnetIndex = assignedSubnetIndex;

      // Calculate subnet details
      const [networkIP, cidrStr] = assignedSubnet.network.split("/");
      const broadcastIP = getBroadcastAddress(networkIP, subnetCIDR);
      const firstIP = getFirstUsableIP(networkIP);
      const lastIP = getLastUsableIP(broadcastIP);
      const subnetMask = cidrToSubnetMask(subnetCIDR);
      const wildcardMask = cidrToWildcardMask(subnetCIDR);
      const usableHosts = getUsableHosts(subnetCIDR);

      results.push({
        network: assignedSubnet.network,
        networkAddress: networkIP,
        firstIP: `${firstIP}/${subnetCIDR}`,
        lastIP: `${lastIP}/${subnetCIDR}`,
        broadcast: `${broadcastIP}/${subnetCIDR}`,
        subnetMask: subnetMask,
        wildcardMask: wildcardMask,
        usableHosts: usableHosts,
        requiredHosts: requiredHosts,
        cidr: subnetCIDR,
        originalIndex: requirement.originalIndex,
        networkNumber: requirement.networkNumber,
      });

      // Remove the used parent and add the remaining subnets as available
      availableNetworks.splice(bestParentIndex, 1);

      // Add all subnets except the assigned one as available
      for (let k = 0; k < allSubnets.length; k++) {
        if (k !== assignedSubnetIndex) {
          availableNetworks.push({ network: allSubnets[k].network, used: false });
        }
      }
    } else {
      // Direct assignment (parent CIDR matches required CIDR)
      allocationStep.allSubnets = [{ network: bestParent.network }];
      allocationStep.assignedSubnetIndex = 0;

      const [networkIP, cidrStr] = bestParent.network.split("/");
      const broadcastIP = getBroadcastAddress(networkIP, subnetCIDR);
      const firstIP = getFirstUsableIP(networkIP);
      const lastIP = getLastUsableIP(broadcastIP);
      const subnetMask = cidrToSubnetMask(subnetCIDR);
      const wildcardMask = cidrToWildcardMask(subnetCIDR);
      const usableHosts = getUsableHosts(subnetCIDR);

      results.push({
        network: bestParent.network,
        networkAddress: networkIP,
        firstIP: `${firstIP}/${subnetCIDR}`,
        lastIP: `${lastIP}/${subnetCIDR}`,
        broadcast: `${broadcastIP}/${subnetCIDR}`,
        subnetMask: subnetMask,
        wildcardMask: wildcardMask,
        usableHosts: usableHosts,
        requiredHosts: requiredHosts,
        cidr: subnetCIDR,
        originalIndex: requirement.originalIndex,
        networkNumber: requirement.networkNumber,
      });

      // Mark this network as used
      availableNetworks[bestParentIndex].used = true;
    }

    // Sort available networks to prioritize .0 addresses
    availableNetworks.sort((a, b) => {
      if (a.used && !b.used) return 1;
      if (!a.used && b.used) return -1;
      if (a.used && b.used) return 0;

      const [aIP, aCIDR] = a.network.split("/");
      const [bIP, bCIDR] = b.network.split("/");
      const aInt = ipToInt(aIP);
      const bInt = ipToInt(bIP);

      // Prioritize .0 addresses (lower IP values)
      if (aInt !== bInt) return aInt - bInt;

      // Then prioritize larger networks (smaller CIDR)
      return parseInt(aCIDR) - parseInt(bCIDR);
    });

    allocationStep.availableNetworksAfter = [...availableNetworks];
    allocationSteps.push(allocationStep);
  }

  return { results, allocationSteps };
}

/**
 * Calculate VLSM subnetting with hierarchical allocation
 * @param {string} baseNetwork - Base network in CIDR notation (e.g., "192.168.1.0/24")
 * @param {number[]} hostRequirements - Array of host requirements for each subnet
 * @returns {Object[]} - Array of subnet information objects
 */
export function calculateVLSM(baseNetwork, hostRequirements, strategy = "first") {
  // Parse base network
  const [baseIP, baseCIDR] = baseNetwork.split("/");
  const baseCIDRNum = parseInt(baseCIDR);

  // Validate base network
  if (!baseIP || isNaN(baseCIDRNum) || baseCIDRNum < 1 || baseCIDRNum > 30) {
    throw new Error("Invalid base network format. Use format like 192.168.1.0/24");
  }

  // Filter out empty requirements and keep track of original order
  const validRequirements = [];

  for (let i = 0; i < hostRequirements.length; i++) {
    const req = hostRequirements[i];
    if (req && req > 0) {
      validRequirements.push({
        hosts: req,
        originalIndex: i,
        networkNumber: i + 1,
      });
    }
  }

  if (validRequirements.length === 0) {
    throw new Error("At least one host requirement must be specified");
  }

  // Sort by host requirements in descending order for efficient allocation
  const sortedRequirements = [...validRequirements].sort((a, b) => b.hosts - a.hosts);

  try {
    const { results } = performVLSMAllocation(baseNetwork, sortedRequirements, strategy);

    // Sort results by CIDR (smaller CIDR first, i.e., /25 before /26)
    results.sort((a, b) => a.cidr - b.cidr);

    return results;
  } catch (error) {
    throw new Error(`VLSM calculation failed: ${error.message}`);
  }
}

/**
 * Generate detailed VLSM analysis text
 * @param {string} baseNetwork - Base network in CIDR notation
 * @param {number[]} hostRequirements - Array of host requirements
 * @param {Object[]} results - VLSM calculation results
 * @returns {string} - Detailed analysis in HTML format
 */
export function generateDetailedAnalysis(baseNetwork, hostRequirements, results, strategy = "first") {
  const [baseIP, baseCIDR] = baseNetwork.split("/");
  const baseCIDRNum = parseInt(baseCIDR);

  let analysis = `<div class="detailed-vlsm">`;
  analysis += `<h6 class="text-primary mb-3"><strong>${t('vlsm_problem')}:</strong></h6>`;
  analysis += `<p><strong>${t('vlsm_using_network')}:</strong> ${baseNetwork} ${t('vlsm_design_vlsm')}:</p>`;
  analysis += `<ul class="list-unstyled ms-3">`;

  // List all requirements
  hostRequirements.forEach((req, index) => {
    if (req && req > 0) {
      analysis += `<li><strong>${t('vlsm_net')} ${index + 1}:</strong> ${req} ${t('hosts')}</li>`;
    }
  });

  analysis += `</ul>`;
  analysis += `<p><strong>${t('vlsm_find_addresses')}</strong></p>`;

  // Add strategy information
  const strategyName = strategy === "last" ? t('vlsm_strategy_last_subnet').split(' ')[2] + " " + t('vlsm_strategy_last_subnet').split(' ')[3] : t('vlsm_strategy_first_subnet').split(' ')[2] + " " + t('vlsm_strategy_first_subnet').split(' ')[3];
  const strategyNameFull = strategy === "last" ? "Last Subnet" : "First Subnet";
  const strategyDescription = strategy === "last" ? "This method takes the last subnet from each subdivision, leaving the lower-numbered subnets available for future use." : "This method takes the first subnet from each subdivision, which is the traditional approach in VLSM.";

  analysis += `<div class="alert alert-info mb-3">`;
  analysis += `<h6 class="mb-2"><i class="fas fa-info-circle me-2"></i>Allocation Strategy: ${strategyNameFull}</h6>`;
  analysis += `<p class="mb-0">${strategyDescription}</p>`;
  analysis += `</div>`;

  analysis += `<hr><h6 class="text-success"><strong>${t('vlsm_solution')}:</strong></h6>`;
  analysis += `<p><em>${t('vlsm_borrowed_bits_note')}</em></p>`;

  // Prepare requirements in the same way as calculateVLSM
  const validRequirements = [];
  for (let i = 0; i < hostRequirements.length; i++) {
    const req = hostRequirements[i];
    if (req && req > 0) {
      validRequirements.push({
        hosts: req,
        originalIndex: i,
        networkNumber: i + 1,
      });
    }
  }

  // Sort by host requirements in descending order (same as calculateVLSM)
  const sortedRequirements = [...validRequirements].sort((a, b) => b.hosts - a.hosts);

  try {
    // Use the same allocation logic to get steps
    const { results: calculatedResults, allocationSteps } = performVLSMAllocation(baseNetwork, sortedRequirements, strategy);

    // Generate analysis for each allocation step
    allocationSteps.forEach((step, stepIndex) => {
      const requirement = step.requirement;
      const networkNum = requirement.networkNumber;
      const requiredHosts = requirement.hosts; // Fix: use requirement.hosts instead of requirement.requiredHosts
      const targetCIDR = step.targetCIDR;
      const parentNetwork = step.parentNetwork;
      const parentCIDR = step.parentCIDR;
      const hostBits = 32 - targetCIDR;

      analysis += `<div class="mb-4 p-3 border rounded bg-white">`;
      analysis += `<h6 class="text-info"><strong>${t('vlsm_net')} ${networkNum}: ${requiredHosts} ${t('hosts')}</strong></h6>`;

      // Calculate borrowed bits from this parent
      const borrowedBits = targetCIDR - parentCIDR;
      const blockSize = Math.pow(2, hostBits);
      const numSubnets = Math.pow(2, borrowedBits);

      analysis += `<p class="mb-2"><strong>${t('vlsm_calculation')}:</strong></p>`;
      analysis += `<div class="ms-3 mb-2">`;
      analysis += `<p class="mb-1">${t('vlsm_find_m')}: 2<sup>m</sup> - 2 ≥ ${requiredHosts} ⇒ m = ${hostBits}</p>`;
      analysis += `<p class="mb-1">${t('vlsm_borrowed_bits')}: n = ${parentCIDR} → ${targetCIDR} = ${borrowedBits}</p>`;
      analysis += `<p class="mb-1">${t('vlsm_block_size')} = 2<sup>${hostBits}</sup> = ${blockSize}</p>`;
      analysis += `<p class="mb-1">${t('vlsm_number_subnets')} = 2<sup>${borrowedBits}</sup> = ${numSubnets}</p>`;
      analysis += `</div>`;

      // Special case: if borrowedBits is 0, it means direct assignment without subdivision
      if (borrowedBits === 0) {
        analysis += `<p class="mb-2"><strong>${t('vlsm_direct_assignment')}:</strong></p>`;
        analysis += `<div class="ms-3 mb-2">`;
        analysis += `<p class="mb-1"><strong>1) ${step.allSubnets[0].network} (${t('vlsm_assigned_to')} ${t('vlsm_net')} ${networkNum})</strong></p>`;
        analysis += `</div>`;
      } else {
        const strategyText = strategy === "last" ? ` (${t('vlsm_strategy_last_subnet')})` : ` (${t('vlsm_strategy_first_subnet')})`;
        analysis += `<p class="mb-2"><strong>${t('vlsm_take_and_divide')} ${parentNetwork} ${t('vlsm_and_divide_into')} ${numSubnets} ${t('vlsm_subnets')} (/${targetCIDR})${strategyText}:</strong></p>`;

        // Use the subnets from the allocation step
        const allSubnets = step.allSubnets;
        const assignedSubnetIndex = step.assignedSubnetIndex;

        // Display all subnets, highlighting the assigned one
        allSubnets.forEach((subnet, subIndex) => {
          const isAssigned = subIndex === assignedSubnetIndex;
          const assignmentStyle = isAssigned ? ' style="background-color: #e8f5e8; border-left: 4px solid #28a745;"' : "";
          analysis += `<div class="ms-3 mb-2"${assignmentStyle}>`;
          analysis += `<p class="mb-1"><strong>${subIndex + 1}) ${subnet.network}${isAssigned ? ` (✓ ${t('vlsm_assigned_to')} ${t('vlsm_net')} ${networkNum})` : ""}</strong></p>`;

          if (subnet.firstIP) {
            // Only show details if available
            analysis += `<div class="ms-3">`;
            analysis += `<p class="mb-1">+ ${t('vlsm_first_ip_label')}: ${subnet.firstIP}</p>`;
            analysis += `<p class="mb-1">+ ${t('vlsm_last_ip_label')}: ${subnet.lastIP}</p>`;
            analysis += `<p class="mb-1">+ ${t('vlsm_broadcast_label')}: ${subnet.broadcast}</p>`;
            analysis += `<p class="mb-1">+ ${t('vlsm_subnet_mask_label')}: ${subnet.subnetMask}</p>`;
            analysis += `<p class="mb-1">+ ${t('vlsm_wildcard_mask_label')}: ${subnet.wildcardMask}</p>`;
            analysis += `</div>`;
          }
          analysis += `</div>`;
        });
      }

      analysis += `</div>`;
    });
  } catch (error) {
    analysis += `<div class="alert alert-danger">Error generating analysis: ${error.message}</div>`;
  }

  analysis += `</div>`;
  return analysis;
}

/**
 * Find the best available parent network for subdivision
 * @param {string} targetNetwork - The target network to be created
 * @param {number} targetCIDR - Target CIDR
 * @param {Object} subdivisionTree - Tree tracking subdivisions
 * @param {string} baseNetwork - Base network
 * @returns {string} - Best parent network
 */
function findBestAvailableParent(targetNetwork, targetCIDR, subdivisionTree, baseNetwork) {
  // For detailed analysis, we need to find the most appropriate parent for educational purposes
  // This should be the smallest available network that requires subdivision to reach the target CIDR

  // First, try to find a direct parent at the appropriate CIDR level
  const targetSize = Math.pow(2, 32 - targetCIDR);

  // Look for available networks that are exactly one CIDR level above
  for (let parentCIDR = targetCIDR - 1; parentCIDR >= parseInt(baseNetwork.split("/")[1]); parentCIDR--) {
    const parentSize = Math.pow(2, 32 - parentCIDR);

    // Check all available networks in subdivision tree at this CIDR level
    for (const [network, info] of Object.entries(subdivisionTree)) {
      if (info.used) continue;

      const [parentIP, networkCIDRStr] = network.split("/");
      const networkCIDR = parseInt(networkCIDRStr);

      if (networkCIDR === parentCIDR) {
        const parentNetworkInt = ipToInt(getNetworkAddress(parentIP, parentCIDR));
        const [targetIP] = targetNetwork.split("/");
        const targetNetworkInt = ipToInt(getNetworkAddress(targetIP, targetCIDR));

        // Check if target network fits within this parent
        if (targetNetworkInt >= parentNetworkInt && targetNetworkInt < parentNetworkInt + parentSize) {
          // Always prefer the .0 network (lowest address) for educational clarity
          return network;
        }
      }
    }
  }

  // Fallback to base network if no suitable parent found
  return baseNetwork;
}

/**
 * Find the best parent network for subdivision display
 * @param {string} network - Current network
 * @param {number} parentCIDR - Parent CIDR
 * @param {Array} availableNetworks - Available networks for subdivision
 * @param {string} baseNetwork - Base network
 * @returns {string} - Best parent network
 */
function findBestParentNetwork(network, parentCIDR, availableNetworks, baseNetwork) {
  const [ip, cidr] = network.split("/");
  const parentNetworkIP = getNetworkAddress(ip, parentCIDR);
  return `${parentNetworkIP}/${parentCIDR}`;
}

/**
 * Get parent network for subdivision display
 * @param {string} network - Current network
 * @param {number} parentCIDR - Parent CIDR
 * @returns {string} - Parent network
 */
function getParentNetwork(network, parentCIDR) {
  const [ip, cidr] = network.split("/");
  const parentNetworkIP = getNetworkAddress(ip, parentCIDR);
  return `${parentNetworkIP}/${parentCIDR}`;
}
/**
 * Generate subnet division for display
 * @param {string} parentNetwork - Parent network to divide
 * @param {number} targetCIDR - Target CIDR after division
 * @returns {Array} - Array of subnet information
 */
function generateSubnetDivision(parentNetwork, targetCIDR) {
  const [parentIP, parentCIDRStr] = parentNetwork.split("/");
  const parentCIDRNum = parseInt(parentCIDRStr);
  const subnetSize = Math.pow(2, 32 - targetCIDR);
  const numSubnets = Math.pow(2, targetCIDR - parentCIDRNum);

  const subnets = [];
  let currentInt = ipToInt(getNetworkAddress(parentIP, parentCIDRNum));

  for (let i = 0; i < numSubnets; i++) {
    const networkIP = intToIP(currentInt);
    const broadcastIP = getBroadcastAddress(networkIP, targetCIDR);
    const firstIP = getFirstUsableIP(networkIP);
    const lastIP = getLastUsableIP(broadcastIP);
    const subnetMask = cidrToSubnetMask(targetCIDR);
    const wildcardMask = cidrToWildcardMask(targetCIDR);

    subnets.push({
      network: `${networkIP}/${targetCIDR}`,
      firstIP: `${firstIP}/${targetCIDR}`,
      lastIP: `${lastIP}/${targetCIDR}`,
      broadcast: `${broadcastIP}/${targetCIDR}`,
      subnetMask: subnetMask,
      wildcardMask: wildcardMask,
    });

    currentInt += subnetSize;
  }

  return subnets;
}

/**
 * Validate CIDR notation
 * @param {string} cidrNotation - Network in CIDR notation
 * @returns {boolean} - True if valid
 */
export function validateCIDR(cidrNotation) {
  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;

  if (!cidrRegex.test(cidrNotation)) {
    return false;
  }

  const [ip, cidr] = cidrNotation.split("/");
  const cidrNum = parseInt(cidr);

  // Validate CIDR range
  if (cidrNum < 1 || cidrNum > 32) {
    return false;
  }

  // Validate IP octets
  const octets = ip.split(".").map((octet) => parseInt(octet));
  for (const octet of octets) {
    if (octet < 0 || octet > 255) {
      return false;
    }
  }

  return true;
}
