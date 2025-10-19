/**
 * UI Handler - Manages user interface interactions and DOM updates
 */

import { calculateVLSM, validateCIDR, generateDetailedAnalysis } from "./vlsmLogic.js";
import { checkIPAssignability, validateIP } from "./ipChecker.js";
import { aggregateIPs, analyzeAggregation } from "./ipAggregator.js";
import { convertToAllBases, getInputHelp, validateNumber } from "./numberConverter.js";
import { initI18n, t, updatePageTranslations } from "./i18n.js";

class UIHandler {
  constructor() {
    this.currentTool = "vlsm";
    this.subnetCount = 1;
    this.init();
  }

  init() {
    // Initialize i18n first
    initI18n();
    
    this.setupNavigation();
    this.setupVLSMForm();
    this.setupIPCheckerForm();
    this.setupIPAggregatorForm();
    this.setupDynamicSubnets();
    this.setupViewModeToggle();
    this.setupNumberConverter();
    this.switchTool(this.currentTool);
    
    // Listen for language changes
    document.addEventListener('languageChanged', () => {
      this.onLanguageChanged();
    });
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
    const baseNetworkInput = document.getElementById("base-network");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.calculateVLSM();
    });

    // Add real-time validation feedback
    baseNetworkInput.addEventListener("input", () => {
      this.validateBaseNetworkInput();
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
            <label class="form-label"><span data-i18n="vlsm_network">${t('vlsm_network')}</span> ${this.subnetCount}</label>
            <div class="input-group">
                <input type="number" class="form-control subnet-hosts" placeholder="${this.subnetCount}" min="1" max="65534">
                <button type="button" class="btn btn-outline-danger btn-sm remove-subnet" title="${t('remove')}">
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
  
  onLanguageChanged() {
    // Update select options
    const selectOptions = document.querySelectorAll('select option[data-i18n]');
    selectOptions.forEach(option => {
      const key = option.getAttribute('data-i18n');
      option.textContent = t(key);
    });
    
    // Re-render any visible results with new language
    // This ensures dynamically generated content is updated
  }

  // Performance check for detailed analysis
  shouldGenerateDetailedAnalysis(baseNetwork, hostRequirements) {
    const [baseIP, baseCIDR] = baseNetwork.split("/");
    const baseCIDRNum = parseInt(baseCIDR);

    // Limit detailed analysis for performance reasons
    // If base network is too large (CIDR < 16), detailed analysis can be slow
    if (baseCIDRNum < 16) {
      return {
        generate: false,
        reason: "Detailed analysis is disabled for networks larger than /16 to prevent performance issues.",
      };
    }

    // If any host requirement is too large (> 1000), detailed analysis can be slow
    const maxHosts = Math.max(...hostRequirements);
    if (maxHosts > 1000) {
      return {
        generate: false,
        reason: "Detailed analysis is disabled when any subnet requires more than 1000 hosts to prevent performance issues.",
      };
    }

    // Check total network size that would be processed
    const totalRequiredHosts = hostRequirements.reduce((sum, hosts) => sum + hosts, 0);
    if (totalRequiredHosts > 5000) {
      return {
        generate: false,
        reason: "Detailed analysis is disabled when total host requirements exceed 5000 to prevent performance issues.",
      };
    }

    return { generate: true };
  }

  validateBaseNetworkInput() {
    const baseNetworkInput = document.getElementById("base-network");
    const baseNetwork = baseNetworkInput.value.trim();

    // Remove any existing validation feedback
    const existingFeedback = baseNetworkInput.parentNode.querySelector(".validation-feedback");
    if (existingFeedback) {
      existingFeedback.remove();
    }

    // Reset input styling
    baseNetworkInput.classList.remove("is-invalid", "is-warning");

    if (baseNetwork && baseNetwork.includes("/")) {
      const [baseIP, baseCIDR] = baseNetwork.split("/");
      const baseCIDRNum = parseInt(baseCIDR);

      if (!isNaN(baseCIDRNum)) {
        let feedbackMessage = "";
        let feedbackClass = "";

        if (baseCIDRNum < 1 || baseCIDRNum > 32) {
          feedbackMessage = t('warning_cidr_range');
          feedbackClass = "is-invalid";
        } else if (baseCIDRNum < 8) {
          feedbackMessage = t('warning_large_network');
          feedbackClass = "is-invalid";
        } else if (baseCIDRNum < 16) {
          feedbackMessage = t('warning_large_network_limited');
          feedbackClass = "is-warning";
        } else if (baseCIDRNum < 20) {
          feedbackMessage = t('warning_large_network_may_limit');
          feedbackClass = "is-warning";
        }

        if (feedbackMessage) {
          if (baseCIDRNum < 1 || baseCIDRNum > 32) baseNetworkInput.classList.add(feedbackClass);
          const feedback = document.createElement("div");
          feedback.className = `validation-feedback ${feedbackClass === "is-invalid" ? "invalid" : "warning"}-feedback d-block`;
          feedback.innerHTML = feedbackMessage;
          baseNetworkInput.parentNode.appendChild(feedback);
        }
      } else {
        // Handle case where CIDR is not a valid number
        baseNetworkInput.classList.add("is-invalid");
        const feedback = document.createElement("div");
        feedback.className = "validation-feedback invalid-feedback d-block";
        feedback.innerHTML = "⚠️ Invalid CIDR format. Please enter a number between 1 and 32.";
        baseNetworkInput.parentNode.appendChild(feedback);
      }
    }
  }

  async calculateVLSM() {
    const baseNetwork = document.getElementById("base-network").value.trim();
    const strategy = document.getElementById("subdivision-strategy").value; // Get selected strategy
    const subnetInputs = document.querySelectorAll(".subnet-hosts");
    const resultsDiv = document.getElementById("vlsm-results");

    // Hide previous results (don't clear innerHTML yet, in case we need to show error)
    resultsDiv.style.display = "none";

    try {
      // Show loading state
      const submitBtn = document.querySelector('#vlsm-form button[type="submit"]');
      let originalText = "";
      if (submitBtn) {
        originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span class="loading"></span> ${t('calculating')}`;
        submitBtn.disabled = true;
      }

      // Validate base network
      if (!validateCIDR(baseNetwork)) {
        throw new Error(t('error_invalid_base_network'));
      }

      // Additional validation for CIDR range
      const [baseIP, baseCIDR] = baseNetwork.split("/");
      const baseCIDRNum = parseInt(baseCIDR);

      if (isNaN(baseCIDRNum) || baseCIDRNum < 1 || baseCIDRNum > 32) {
        throw new Error(t('error_invalid_cidr'));
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
        throw new Error(t('error_no_host_requirements'));
      }

      // Check for host requirements that are too large
      const maxHosts = Math.max(...hostRequirements);
      if (maxHosts > 16777214) {
        // Maximum hosts for /8 network
        throw new Error(`${t('error_host_too_large')}: ${maxHosts}. ${t('error_max_hosts')}`);
      }

      // Warn about performance for very large host requirements
      if (maxHosts > 65534) {
        console.warn("Large host requirements detected. This may affect performance.");
      }

      // Calculate VLSM with selected strategy
      const results = calculateVLSM(baseNetwork, hostRequirements, strategy);

      // Display results
      this.displayVLSMResults(results, baseNetwork, hostRequirements, strategy);

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

  displayVLSMResults(results, baseNetwork, hostRequirements, strategy = "first") {
    const resultsDiv = document.getElementById("vlsm-results");

    // Check if detailed analysis should be generated
    const detailedAnalysisCheck = this.shouldGenerateDetailedAnalysis(baseNetwork, hostRequirements);

    // Recreate the entire results structure to ensure it's clean
    resultsDiv.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="text-primary mb-0"><i class="fas fa-check-circle me-2"></i>${t('vlsm_results')}</h5>
        <div class="btn-group" role="group">
          <input type="radio" class="btn-check" name="viewMode" id="table-view" value="table" checked />
          <label class="btn btn-outline-primary btn-sm" for="table-view"> <i class="fas fa-table me-1"></i>${t('vlsm_table_view')} </label>
          <input type="radio" class="btn-check" name="viewMode" id="detailed-view" value="detailed" ${!detailedAnalysisCheck.generate ? "disabled" : ""} />
          <label class="btn btn-outline-primary btn-sm ${!detailedAnalysisCheck.generate ? "disabled" : ""}" for="detailed-view"> 
            <i class="fas fa-list-alt me-1"></i>${t('vlsm_detailed_view')} ${!detailedAnalysisCheck.generate ? "(Disabled)" : ""}
          </label>
        </div>
      </div>

      <!-- Table View -->
      <div id="table-view-content">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-primary">
              <tr>
                <th>${t('vlsm_network')}</th>
                <th>${t('vlsm_ip_network')}</th>
                <th>${t('vlsm_first_ip')}</th>
                <th>${t('vlsm_last_ip')}</th>
                <th>${t('vlsm_broadcast')}</th>
                <th>${t('vlsm_subnet_mask')}</th>
                <th>${t('vlsm_wildcard_mask')}</th>
                <th>${t('vlsm_usable_hosts')}</th>
              </tr>
            </thead>
            <tbody id="vlsm-table-body"></tbody>
          </table>
        </div>
      </div>

      <!-- Detailed Analysis View -->
      <div id="detailed-view-content" style="display: none;">
        <div id="detailed-analysis" class="bg-light p-4 rounded"></div>
      </div>
    `; // Now get the new elements after recreating the structure
    const tableBody = document.getElementById("vlsm-table-body");
    const detailedAnalysisDiv = document.getElementById("detailed-analysis");

    // Populate table view
    results.forEach((subnet, index) => {
      const row = document.createElement("tr");
      row.className = "fade-in";
      row.style.animationDelay = `${index * 0.1}s`;

      row.innerHTML = `
                <td>
                  <strong class="text-primary">${t('vlsm_network')} ${subnet.networkNumber}</strong>
                  <span class="badge bg-info">${subnet.requiredHosts}</span>
                </td>
                <td><strong>${subnet.network}</strong></td>
                <td><strong>${subnet.firstIP}</strong></td>
                <td><strong>${subnet.lastIP}</strong></td>
                <td><strong>${subnet.broadcast}</strong></td>
                <td><strong>${subnet.subnetMask}</strong></td>
                <td><strong>${subnet.wildcardMask}</strong></td>
                <td><span class="badge bg-success">${subnet.usableHosts}</span></td>
            `;

      tableBody.appendChild(row);
    });

    // Generate detailed analysis with strategy (only if performance allows)
    if (detailedAnalysisDiv && baseNetwork && hostRequirements) {
      if (detailedAnalysisCheck.generate) {
        try {
          const detailedAnalysis = generateDetailedAnalysis(baseNetwork, hostRequirements, results, strategy);
          detailedAnalysisDiv.innerHTML = detailedAnalysis;
        } catch (error) {
          detailedAnalysisDiv.innerHTML = `<p class="text-danger">Error generating detailed analysis: ${error.message}</p>`;
        }
      } else {
        // Show performance warning instead of detailed analysis
        detailedAnalysisDiv.innerHTML = `
          <div class="alert alert-warning">
            <h6 class="alert-heading">
              <i class="fas fa-exclamation-triangle me-2"></i>
              ${t('vlsm_disabled_analysis')}
            </h6>
            <p class="mb-0">${t('vlsm_disabled_reason')}</p>
            <hr>
            <p class="mb-0 small">
              <strong>${t('vlsm_suggestion')}:</strong> ${t('vlsm_suggestion_text')}
            </p>
          </div>
        `;
      }
    }

    // Re-setup view mode toggle after recreating the structure
    this.setupViewModeToggle();

    resultsDiv.style.display = "block";
    resultsDiv.classList.add("fade-in");
  }

  async checkIP() {
    const ipCidrInput = document.getElementById("ip-cidr-input").value.trim();
    const resultsDiv = document.getElementById("ip-checker-results");

    // Hide previous results
    resultsDiv.style.display = "none";

    try {
      // Show loading state
      const submitBtn = document.querySelector('#ip-checker-form button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span class="loading"></span> ${t('checking')}`;
      submitBtn.disabled = true;

      // Validate input
      if (!ipCidrInput) {
        throw new Error(t('error_ip_cidr_required'));
      }

      // Parse IP and CIDR
      const parts = ipCidrInput.split("/");
      if (parts.length !== 2) {
        throw new Error(t('error_ip_cidr_format'));
      }

      const ipAddress = parts[0].trim();
      const cidr = parts[1].trim();

      if (!validateIP(ipAddress)) {
        throw new Error(t('error_invalid_ip'));
      }

      const cidrNum = parseInt(cidr);
      if (isNaN(cidrNum) || cidrNum < 1 || cidrNum > 32) {
        throw new Error(t('error_invalid_cidr_range'));
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
    const statusText = isAssignable ? t('ip_checker_assignable') : t('ip_checker_not_assignable');

    resultsDiv.innerHTML = `
            <div class="alert ${alertClass} fade-in">
                <h5 class="alert-heading">
                    <i class="fas ${iconClass} me-2"></i>
                    ${t('ip_checker_status')}: ${statusText}
                </h5>
                <p class="mb-3">${result.message}</p>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="result-item ${isAssignable ? "ip-result-success" : "ip-result-error"}">
                            <h6><i class="fas fa-info-circle me-2"></i>${t('ip_checker_ip_info')}</h6>
                            <ul class="list-unstyled mb-0">
                                <li><strong>${t('ip_checker_ip_address')}:</strong> ${result.ipAddress}</li>
                                <li><strong>${t('ip_checker_subnet')}:</strong> ${result.networkAddress}/${result.cidr}</li>
                                <li><strong>${t('vlsm_subnet_mask')}:</strong> ${result.subnetInput.startsWith("/") || !isNaN(result.subnetInput) ? this.cidrToMask(result.cidr) : result.subnetInput}</li>
                                <li><strong>${t('vlsm_wildcard_mask')}:</strong> ${result.wildcardMask}</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="result-item">
                            <h6><i class="fas fa-network-wired me-2"></i>${t('ip_checker_subnet_details')}</h6>
                            <ul class="list-unstyled mb-0">
                                <li><strong>${t('ip_checker_network_address')}:</strong> ${result.networkAddress}</li>
                                <li><strong>${t('ip_checker_broadcast_address')}:</strong> ${result.broadcastAddress}</li>
                                <li><strong>${t('ip_checker_usable_range')}:</strong> ${result.firstUsableIP || "N/A"} - ${result.lastUsableIP || "N/A"}</li>
                                <li><strong>${t('vlsm_usable_hosts')}:</strong> <span class="badge bg-info">${result.usableHosts}</span></li>
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

    // Hide previous results
    resultsDiv.style.display = "none";

    try {
      // Show loading state
      const submitBtn = document.querySelector('#ip-aggregator-form button[type="submit"]');
      let originalText = "";
      if (submitBtn) {
        originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span class="loading"></span> ${t('aggregating')}`;
        submitBtn.disabled = true;
      }

      // Parse IP list
      if (!ipListText) {
        throw new Error(t('error_at_least_one_ip'));
      }

      const ipList = ipListText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (ipList.length === 0) {
        throw new Error(t('error_at_least_one_valid_ip'));
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
                    ${t('ip_aggregator_result')}
                </h5>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <h6><i class="fas fa-network-wired me-2"></i>${t('ip_aggregator_aggregated_network')}</h6>
                        <div class="result-item ip-result-success">
                            <div class="h4 mb-2">${result.aggregatedNetwork}</div>
                            <ul class="list-unstyled mb-0">
                                <li><strong>${t('vlsm_subnet_mask')}:</strong> ${result.subnetMask}</li>
                                <li><strong>${t('vlsm_wildcard_mask')}:</strong> ${result.wildcardMask}</li>
                                <li><strong>${t('ip_aggregator_common_prefix')}:</strong> /${result.commonPrefixLength}</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <h6><i class="fas ${efficiencyIcon} me-2"></i>${t('ip_aggregator_efficiency')}</h6>
                        <div class="result-item">
                            <ul class="list-unstyled mb-0">
                                <li><strong>${t('ip_aggregator_original_networks')}:</strong> ${analysis.originalNetworks}</li>
                                <li><strong>${t('ip_aggregator_original_total_hosts')}:</strong> ${analysis.originalTotalHosts.toLocaleString()}</li>
                                <li><strong>${t('ip_aggregator_efficiency_label')}:</strong> 
                                    <span class="badge ${isEfficient ? "bg-info" : "bg-warning"}">${Math.round(analysis.efficiency * 100)}%</span>
                                </li>
                                <li><strong>${t('ip_aggregator_wasted_addresses')}:</strong> 
                                    <span class="badge ${analysis.wastedAddresses === 0 ? "bg-info" : "bg-secondary"}">${analysis.wastedAddresses.toLocaleString()}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4">
                <h5 class="text-primary mb-3">
                    <i class="fas fa-list me-2"></i>${t('ip_aggregator_input_networks')}
                </h5>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-info">
                            <tr>
                                <th>${t('ip_aggregator_original_input')}</th>
                                <th>${t('ip_aggregator_network_address')}</th>
                                <th>${t('ip_aggregator_binary')}</th>
                                <th>${t('ip_aggregator_common_prefix_label')}</th>
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
                    ${t('error')}
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
        // Only switch if the radio is not disabled
        if (detailedViewRadio.checked && !detailedViewRadio.disabled) {
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

  setupNumberConverter() {
    const inputBase = document.getElementById("input-base");
    const inputNumber = document.getElementById("input-number");
    const exampleButtons = document.querySelectorAll(".example-btn");

    // Base selection change
    inputBase.addEventListener("change", () => {
      this.updateInputHelp();
      this.clearResults();
      // Auto convert if there's existing input
      const value = inputNumber.value.trim();
      if (value) {
        setTimeout(() => this.convertNumber(), 100);
      }
    });

    // Input change - auto convert as user types
    inputNumber.addEventListener("input", () => {
      const value = inputNumber.value.trim();
      if (value) {
        // Show converting indicator
        document.getElementById("converting-indicator").classList.remove("d-none");
        setTimeout(() => {
          this.convertNumber();
          // Hide converting indicator
          document.getElementById("converting-indicator").classList.add("d-none");
        }, 300); // Debounce
      } else {
        this.clearResults();
        document.getElementById("converting-indicator").classList.add("d-none");
      }
    });

    // Example button clicks
    exampleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.getAttribute("data-value");
        const base = button.getAttribute("data-base");

        document.getElementById("input-base").value = base;
        document.getElementById("input-number").value = value;

        this.updateInputHelp();
        this.convertNumber();
      });
    });

    // Enter key support - focus to input for better UX
    inputNumber.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.convertNumber();
      }
    });

    // Initialize help text
    this.updateInputHelp();
  }

  updateInputHelp() {
    const base = parseInt(document.getElementById("input-base").value);
    const inputNumber = document.getElementById("input-number");
    const helpText = document.getElementById("input-help");

    const help = getInputHelp(base);
    inputNumber.placeholder = help.placeholder;
    helpText.textContent = help.help;

    // Clear input if current value is invalid for new base
    const currentValue = inputNumber.value.trim();
    if (currentValue && !validateNumber(currentValue, base)) {
      inputNumber.value = "";
      this.clearResults();
    }
  }

  convertNumber() {
    const inputBase = parseInt(document.getElementById("input-base").value);
    const inputNumber = document.getElementById("input-number").value.trim();
    const inputElement = document.getElementById("input-number");

    const resultsDiv = document.getElementById("conversion-results");
    const errorDiv = document.getElementById("conversion-error");

    // Hide previous results/errors
    resultsDiv.classList.add("d-none");
    errorDiv.classList.add("d-none");

    if (!inputNumber) {
      // Remove validation classes
      inputElement.classList.remove("is-valid", "is-invalid");
      return;
    }

    // Convert using the number converter module
    const result = convertToAllBases(inputNumber, inputBase);

    if (result.success) {
      // Display results
      document.getElementById("result-decimal").value = result.decimal;
      document.getElementById("result-binary").value = result.binary;
      document.getElementById("result-hex").value = result.hexadecimal;
      document.getElementById("result-octal").value = result.octal;

      // Add success styling
      inputElement.classList.remove("is-invalid");
      inputElement.classList.add("is-valid");

      resultsDiv.classList.remove("d-none");
      resultsDiv.classList.add("fade-in");
    } else {
      // Display error
      document.getElementById("error-message").textContent = result.error;

      // Add error styling
      inputElement.classList.remove("is-valid");
      inputElement.classList.add("is-invalid");

      errorDiv.classList.remove("d-none");
      errorDiv.classList.add("fade-in");
    }
  }

  clearResults() {
    const resultsDiv = document.getElementById("conversion-results");
    const errorDiv = document.getElementById("conversion-error");
    const inputElement = document.getElementById("input-number");

    resultsDiv.classList.add("d-none");
    errorDiv.classList.add("d-none");

    // Remove validation classes
    inputElement.classList.remove("is-valid", "is-invalid");
  }
}

// Initialize UI Handler when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new UIHandler();
});
