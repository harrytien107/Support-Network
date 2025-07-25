/**
 * UI Handler - Manages user interface interactions and DOM updates
 */

import { calculateVLSM, validateCIDR, generateDetailedAnalysis } from "./vlsmLogic.js";
import { checkIPAssignability, validateIP } from "./ipChecker.js";
import { aggregateIPs, analyzeAggregation } from "./ipAggregator.js";

class UIHandler {
  constructor() {
    this.currentTool = "vlsm";
    this.subnetCount = 1;
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupVLSMForm();
    this.setupIPCheckerForm();
    this.setupIPAggregatorForm();
    this.setupDynamicSubnets();
    this.setupViewModeToggle();
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-link[data-tool]");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        if (link.classList.contains("disabled")) {
          return;
        }

        const tool = link.getAttribute("data-tool");
        this.switchTool(tool);
      });
    });
  }

  switchTool(toolName) {
    // Update navigation
    document.querySelectorAll(".nav-link[data-tool]").forEach((link) => {
      link.classList.remove("active");
    });
    document.querySelector(`[data-tool="${toolName}"]`).classList.add("active");

    // Show/hide tool sections
    document.querySelectorAll(".tool-section").forEach((section) => {
      section.style.display = "none";
    });

    const targetSection = document.getElementById(`${toolName}-tool`);
    if (targetSection) {
      targetSection.style.display = "block";
      targetSection.classList.add("fade-in");
    }

    this.currentTool = toolName;
  }

  setupVLSMForm() {
    const form = document.getElementById("vlsm-form");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.calculateVLSM();
    });
  }

  setupIPCheckerForm() {
    const form = document.getElementById("ip-checker-form");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.checkIP();
    });
  }

  setupIPAggregatorForm() {
    const form = document.getElementById("ip-aggregator-form");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.aggregateIPs();
    });
  }

  setupDynamicSubnets() {
    const addButton = document.getElementById("add-subnet");

    addButton.addEventListener("click", () => {
      this.addSubnetInput();
    });
  }

  addSubnetInput() {
    this.subnetCount++;
    const container = document.getElementById("subnet-inputs");

    const div = document.createElement("div");
    div.className = "col-md-3 mb-3";
    div.innerHTML = `
            <label class="form-label">Network ${this.subnetCount}</label>
            <div class="input-group">
                <input type="number" class="form-control subnet-hosts" placeholder="${this.subnetCount}" min="1" max="65534">
                <button type="button" class="btn btn-outline-danger btn-sm remove-subnet" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

    container.appendChild(div);

    // Add remove functionality
    div.querySelector(".remove-subnet").addEventListener("click", () => {
      div.remove();
    });
  }

  async calculateVLSM() {
    const baseNetwork = document.getElementById("base-network").value.trim();
    const subnetInputs = document.querySelectorAll(".subnet-hosts");
    const resultsDiv = document.getElementById("vlsm-results");
    const tableBody = document.getElementById("vlsm-table-body");

    // Clear previous results
    tableBody.innerHTML = "";
    resultsDiv.style.display = "none";

    try {
      // Show loading state
      const submitBtn = document.querySelector('#vlsm-form button[type="submit"]');
      let originalText = "";
      if (submitBtn) {
        originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Calculating...';
        submitBtn.disabled = true;
      }

      // Validate base network
      if (!validateCIDR(baseNetwork)) {
        throw new Error("Invalid base network format. Please use CIDR notation (e.g., 192.168.1.0/24)");
      }

      // Collect host requirements
      const hostRequirements = [];
      subnetInputs.forEach((input, index) => {
        const value = parseInt(input.value);
        if (value && value > 0) {
          hostRequirements.push(value);
        }
      });

      if (hostRequirements.length === 0) {
        throw new Error("Please specify at least one host requirement");
      }

      // Calculate VLSM
      const results = calculateVLSM(baseNetwork, hostRequirements);

      // Display results
      this.displayVLSMResults(results, baseNetwork, hostRequirements);

      // Restore button state
      if (submitBtn) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    } catch (error) {
      this.showError("vlsm-results", error.message);

      // Restore button state
      const submitBtn = document.querySelector('#vlsm-form button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-calculator me-2"></i>Calculate VLSM';
        submitBtn.disabled = false;
      }
    }
  }

  displayVLSMResults(results, baseNetwork, hostRequirements) {
    const resultsDiv = document.getElementById("vlsm-results");
    const tableBody = document.getElementById("vlsm-table-body");
    const detailedAnalysisDiv = document.getElementById("detailed-analysis");

    // Clear previous results
    tableBody.innerHTML = "";
    if (detailedAnalysisDiv) {
      detailedAnalysisDiv.innerHTML = "";
    }

    // Populate table view
    results.forEach((subnet, index) => {
      const row = document.createElement("tr");
      row.className = "fade-in";
      row.style.animationDelay = `${index * 0.1}s`;

      row.innerHTML = `
                <td>
                  <strong class="text-primary">Network ${subnet.networkNumber}</strong>
                  <span class="badge bg-info">${subnet.requiredHosts}</span>
                </td>
                <td><strong>${subnet.network}</strong></td>
                <td><strong>${subnet.firstIP}</strong></td>
                <td><strong>${subnet.lastIP}</strong></td>
                <td><strong>${subnet.broadcast}</strong></td>
                <td><strong>${subnet.subnetMask}</strong></td>
                <td><span class="badge bg-success">${subnet.usableHosts}</span></td>
            `;

      tableBody.appendChild(row);
    });

    // Generate detailed analysis
    if (detailedAnalysisDiv && baseNetwork && hostRequirements) {
      try {
        const detailedAnalysis = generateDetailedAnalysis(baseNetwork, hostRequirements, results);
        detailedAnalysisDiv.innerHTML = detailedAnalysis;
      } catch (error) {
        detailedAnalysisDiv.innerHTML = `<p class="text-danger">Error generating detailed analysis: ${error.message}</p>`;
      }
    }

    resultsDiv.style.display = "block";
    resultsDiv.classList.add("fade-in");
  }

  async checkIP() {
    const ipCidrInput = document.getElementById("ip-cidr-input").value.trim();
    const resultsDiv = document.getElementById("ip-checker-results");

    // Clear previous results
    resultsDiv.innerHTML = "";
    resultsDiv.style.display = "none";

    try {
      // Show loading state
      const submitBtn = document.querySelector('#ip-checker-form button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="loading"></span> Checking...';
      submitBtn.disabled = true;

      // Validate input
      if (!ipCidrInput) {
        throw new Error("Please enter an IP address with CIDR notation");
      }

      // Parse IP and CIDR
      const parts = ipCidrInput.split("/");
      if (parts.length !== 2) {
        throw new Error("Please enter IP address in CIDR format (e.g., 192.168.10.50/24)");
      }

      const ipAddress = parts[0].trim();
      const cidr = parts[1].trim();

      if (!validateIP(ipAddress)) {
        throw new Error("Invalid IP address format");
      }

      const cidrNum = parseInt(cidr);
      if (isNaN(cidrNum) || cidrNum < 1 || cidrNum > 32) {
        throw new Error("Invalid CIDR notation. Must be between 1 and 32");
      }

      // Check IP assignability using CIDR
      const result = checkIPAssignability(ipAddress, `/${cidr}`);

      // Display results
      this.displayIPCheckerResults(result);

      // Restore button state
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    } catch (error) {
      this.showError("ip-checker-results", error.message);

      // Restore button state
      const submitBtn = document.querySelector('#ip-checker-form button[type="submit"]');
      submitBtn.innerHTML = '<i class="fas fa-search me-2"></i>Check IP';
      submitBtn.disabled = false;
    }
  }

  displayIPCheckerResults(result) {
    const resultsDiv = document.getElementById("ip-checker-results");

    if (!result.success) {
      this.showError("ip-checker-results", result.error);
      return;
    }

    const isAssignable = result.isAssignable;
    const alertClass = isAssignable ? "alert-info" : "alert-danger";
    const iconClass = isAssignable ? "fa-check-circle" : "fa-times-circle";
    const statusText = isAssignable ? "Assignable" : "Not Assignable";

    resultsDiv.innerHTML = `
            <div class="alert ${alertClass} fade-in">
                <h5 class="alert-heading">
                    <i class="fas ${iconClass} me-2"></i>
                    IP Status: ${statusText}
                </h5>
                <p class="mb-3">${result.message}</p>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="result-item ${isAssignable ? "ip-result-success" : "ip-result-error"}">
                            <h6><i class="fas fa-info-circle me-2"></i>IP Information</h6>
                            <ul class="list-unstyled mb-0">
                                <li><strong>IP Address:</strong> ${result.ipAddress}</li>
                                <li><strong>Subnet:</strong> ${result.networkAddress}/${result.cidr}</li>
                                <li><strong>Subnet Mask:</strong> ${result.subnetInput.startsWith("/") || !isNaN(result.subnetInput) ? this.cidrToMask(result.cidr) : result.subnetInput}</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="result-item">
                            <h6><i class="fas fa-network-wired me-2"></i>Subnet Details</h6>
                            <ul class="list-unstyled mb-0">
                                <li><strong>Network Address:</strong> ${result.networkAddress}</li>
                                <li><strong>Broadcast Address:</strong> ${result.broadcastAddress}</li>
                                <li><strong>Usable Range:</strong> ${result.firstUsableIP || "N/A"} - ${result.lastUsableIP || "N/A"}</li>
                                <li><strong>Usable Hosts:</strong> <span class="badge bg-info">${result.usableHosts}</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

    resultsDiv.style.display = "block";
    resultsDiv.classList.add("fade-in");
  }

  async aggregateIPs() {
    const ipListText = document.getElementById("ip-list").value.trim();
    const resultsDiv = document.getElementById("ip-aggregator-results");

    // Clear previous results
    resultsDiv.innerHTML = "";
    resultsDiv.style.display = "none";

    try {
      // Show loading state
      const submitBtn = document.querySelector('#ip-aggregator-form button[type="submit"]');
      let originalText = "";
      if (submitBtn) {
        originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Aggregating...';
        submitBtn.disabled = true;
      }

      // Parse IP list
      if (!ipListText) {
        throw new Error("Please enter at least one IP address");
      }

      const ipList = ipListText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (ipList.length === 0) {
        throw new Error("Please enter at least one valid IP address");
      }

      // Perform aggregation analysis
      const result = analyzeAggregation(ipList);

      // Display results
      this.displayIPAggregatorResults(result);

      // Restore button state
      if (submitBtn) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    } catch (error) {
      this.showError("ip-aggregator-results", error.message);

      // Restore button state
      const submitBtn = document.querySelector('#ip-aggregator-form button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-layer-group me-2"></i>Aggregate IPs';
        submitBtn.disabled = false;
      }
    }
  }

  displayIPAggregatorResults(result) {
    const resultsDiv = document.getElementById("ip-aggregator-results");

    if (!result.success) {
      this.showError("ip-aggregator-results", result.error);
      return;
    }

    const analysis = result.analysis;
    const isEfficient = analysis.isEfficient;
    const efficiencyClass = isEfficient ? "alert-info" : "alert-warning";
    const efficiencyIcon = isEfficient ? "fa-check-circle" : "fa-exclamation-triangle";

    resultsDiv.innerHTML = `
            <div class="alert ${efficiencyClass} fade-in">
                <h5 class="alert-heading">
                    <i class="fas fa-layer-group me-2"></i>
                    Aggregation Result
                </h5>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <h6><i class="fas fa-network-wired me-2"></i>Aggregated Network</h6>
                        <div class="result-item ip-result-info">
                            <div class="h4 mb-2 text-success">${result.aggregatedNetwork}</div>
                            <ul class="list-unstyled mb-0">
                                <li><strong>Broadcast:</strong> ${result.broadcastAddress}</li>
                                <li><strong>Total Hosts:</strong> <span class="badge bg-info">${result.totalHosts.toLocaleString()}</span></li>
                                <li><strong>Usable Hosts:</strong> <span class="badge bg-info">${result.usableHosts.toLocaleString()}</span></li>
                                <li><strong>Common Prefix:</strong> /${result.commonPrefixLength}</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <h6><i class="fas ${efficiencyIcon} me-2"></i>Efficiency Analysis</h6>
                        <div class="result-item">
                            <ul class="list-unstyled mb-0">
                                <li><strong>Original Networks:</strong> ${analysis.originalNetworks}</li>
                                <li><strong>Original Total Hosts:</strong> ${analysis.originalTotalHosts.toLocaleString()}</li>
                                <li><strong>Efficiency:</strong> 
                                    <span class="badge ${isEfficient ? "bg-info" : "bg-warning"}">${Math.round(analysis.efficiency * 100)}%</span>
                                </li>
                                <li><strong>Wasted Addresses:</strong> 
                                    <span class="badge ${analysis.wastedAddresses === 0 ? "bg-info" : "bg-secondary"}">${analysis.wastedAddresses.toLocaleString()}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4">
                <h5 class="text-primary mb-3">
                    <i class="fas fa-list me-2"></i>Input Networks Analysis
                </h5>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-info">
                            <tr>
                                <th>Original Input</th>
                                <th>Network Address</th>
                                <th>Binary Representation</th>
                                <th>Common Prefix</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${result.binaryRepresentations
                              .map(
                                (item, index) => `
                                <tr class="fade-in" style="animation-delay: ${index * 0.1}s">
                                    <td><strong>${result.originalIPs[index]}</strong></td>
                                    <td><strong>${item.ip}</strong></td>
                                    <td>
                                        <span class="text-primary fw-bold">${item.commonPrefix}</span>
                                        <span class="text-muted"><strong>${item.hostPortion}</strong></span>
                                    </td>
                                    <td>
                                        <span class="badge bg-info">/${result.commonPrefixLength}</span>
                                    </td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

    resultsDiv.style.display = "block";
    resultsDiv.classList.add("fade-in");
  }

  cidrToMask(cidr) {
    const mask = [];
    for (let i = 0; i < 4; i++) {
      const bits = Math.min(8, Math.max(0, cidr - i * 8));
      mask.push(256 - Math.pow(2, 8 - bits));
    }
    return mask.join(".");
  }

  showError(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
            <div class="alert alert-danger fade-in">
                <h5 class="alert-heading">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error
                </h5>
                <p class="mb-0">${message}</p>
            </div>
        `;
    container.style.display = "block";
  }

  setupViewModeToggle() {
    const tableViewRadio = document.getElementById("table-view");
    const detailedViewRadio = document.getElementById("detailed-view");

    if (tableViewRadio && detailedViewRadio) {
      tableViewRadio.addEventListener("change", () => {
        if (tableViewRadio.checked) {
          this.switchToTableView();
        }
      });

      detailedViewRadio.addEventListener("change", () => {
        if (detailedViewRadio.checked) {
          this.switchToDetailedView();
        }
      });
    }
  }

  switchToTableView() {
    const tableViewContent = document.getElementById("table-view-content");
    const detailedViewContent = document.getElementById("detailed-view-content");

    if (tableViewContent && detailedViewContent) {
      tableViewContent.style.display = "block";
      detailedViewContent.style.display = "none";
    }
  }

  switchToDetailedView() {
    const tableViewContent = document.getElementById("table-view-content");
    const detailedViewContent = document.getElementById("detailed-view-content");

    if (tableViewContent && detailedViewContent) {
      tableViewContent.style.display = "none";
      detailedViewContent.style.display = "block";
    }
  }
}

// Initialize UI Handler when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new UIHandler();
});
