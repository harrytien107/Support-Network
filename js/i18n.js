/**
 * Internationalization (i18n) Module
 * Supports English and Vietnamese languages
 */

export const translations = {
  en: {
    // Navigation
    nav_title: "Network Tools Suite",
    nav_vlsm: "Subnetting (VLSM)",
    nav_ip_checker: "IP Checker",
    nav_ip_aggregator: "IP Summary",
    nav_number_converter: "Number Converter",
    nav_theory: "Theory",
    
    // VLSM Tool
    vlsm_title: "VLSM Subnetting",
    vlsm_description: "Calculate Variable Length Subnet Masks for efficient IP allocation",
    vlsm_base_network: "Base Network (CIDR)",
    vlsm_base_network_help: "Enter the base network in CIDR notation",
    vlsm_strategy: "Subnet Allocation Strategy",
    vlsm_strategy_help: "Choose how to allocate subnets during subdivision",
    vlsm_strategy_first: "Take the first subnet to assign - Traditional Method",
    vlsm_strategy_last: "Take the last subnet to assign - Alternative Method",
    vlsm_host_requirements: "Host Requirements per Subnet",
    vlsm_network: "Network",
    vlsm_add_subnet: "Add Another Subnet",
    vlsm_calculate: "Calculate",
    vlsm_results: "Subnetting Results",
    vlsm_table_view: "Table View",
    vlsm_detailed_view: "Detailed Analysis",
    vlsm_ip_network: "IP Network",
    vlsm_first_ip: "First IP",
    vlsm_last_ip: "Last IP",
    vlsm_broadcast: "Broadcast",
    vlsm_subnet_mask: "Subnet Mask",
    vlsm_wildcard_mask: "Wildcard Mask",
    vlsm_usable_hosts: "Usable Hosts",
    
    // IP Checker Tool
    ip_checker_title: "IP Checker",
    ip_checker_description: "Check if an IP address is assignable within a subnet",
    ip_checker_input: "IP Address with CIDR",
    ip_checker_input_help: "Enter the IP address with CIDR notation (e.g., 192.168.10.50/24)",
    ip_checker_check: "Check",
    ip_checker_status: "IP Status",
    ip_checker_assignable: "Assignable",
    ip_checker_not_assignable: "Not Assignable",
    ip_checker_ip_info: "IP Information",
    ip_checker_subnet_details: "Subnet Details",
    ip_checker_ip_address: "IP Address",
    ip_checker_subnet: "Subnet",
    ip_checker_network_address: "Network Address",
    ip_checker_broadcast_address: "Broadcast Address",
    ip_checker_usable_range: "Usable Range",
    
    // IP Aggregator Tool
    ip_aggregator_title: "IP Summary Tool",
    ip_aggregator_description: "Find the common supernet for multiple IP addresses",
    ip_aggregator_input: "IP Addresses (CIDR Notation)",
    ip_aggregator_input_help: "Enter each IP address with CIDR notation on a separate line (e.g., 192.168.10.0/28)",
    ip_aggregator_find: "Find",
    ip_aggregator_result: "Aggregation Result",
    ip_aggregator_aggregated_network: "Aggregated Network",
    ip_aggregator_common_prefix: "Common Prefix",
    ip_aggregator_efficiency: "Efficiency Analysis",
    ip_aggregator_original_networks: "Original Networks",
    ip_aggregator_original_total_hosts: "Original Total Hosts",
    ip_aggregator_efficiency_label: "Efficiency",
    ip_aggregator_wasted_addresses: "Wasted Addresses",
    ip_aggregator_input_networks: "Input Networks Analysis",
    ip_aggregator_original_input: "Original Input",
    ip_aggregator_network_address: "Network Address",
    ip_aggregator_binary: "Binary Representation",
    ip_aggregator_common_prefix_label: "Common Prefix",
    
    // Number Converter Tool
    number_converter_title: "Number Base Converter",
    number_converter_description: "Convert numbers between Binary, Decimal, Hexadecimal, and Octal",
    number_converter_input: "Input",
    number_converter_from_base: "From Base",
    number_converter_decimal: "Decimal (Base 10)",
    number_converter_binary: "Binary (Base 2)",
    number_converter_hex: "Hexadecimal (Base 16)",
    number_converter_octal: "Octal (Base 8)",
    number_converter_number: "Number to Convert",
    number_converter_number_help: "Enter a decimal number (e.g., 255)",
    number_converter_results: "Results",
    number_converter_error: "Error",
    number_converter_examples: "Quick Examples",
    number_converter_converting: "Converting...",
    
    // Footer
    footer_title: "Network Tools Suite",
    footer_description: "Professional network calculation tools for efficient IP management",
    footer_copyright: "Built with",
    footer_for: "for AI and Glasspham.",
    footer_developed_by: "Developed by",
    footer_open_source: "Open source networking tools",
    
    // Common
    calculating: "Calculating...",
    checking: "Checking...",
    aggregating: "Aggregating...",
    error: "Error",
    hosts: "hosts",
    remove: "Remove",
    
    // VLSM Detailed Analysis
    vlsm_problem: "VLSM Problem",
    vlsm_using_network: "Using network",
    vlsm_design_vlsm: "design VLSM for the following networks",
    vlsm_net: "Net",
    vlsm_find_addresses: "Find the first address, last address and broadcast address for each subnet?",
    vlsm_solution: "Solution",
    vlsm_borrowed_bits_note: "Let n be the number of additional borrowed bits from parent network, m be the number of remaining host bits.",
    vlsm_calculation: "Calculation",
    vlsm_find_m: "Find m",
    vlsm_borrowed_bits: "Borrowed bits",
    vlsm_block_size: "Block Size",
    vlsm_number_subnets: "Number of Subnets",
    vlsm_direct_assignment: "Direct assignment (no subdivision needed)",
    vlsm_take_and_divide: "Take",
    vlsm_and_divide_into: "and divide into",
    vlsm_subnets: "subnets",
    vlsm_assigned_to: "assigned to",
    vlsm_first_ip_label: "First IP",
    vlsm_last_ip_label: "Last IP",
    vlsm_broadcast_label: "Broadcast",
    vlsm_subnet_mask_label: "Subnet Mask",
    vlsm_wildcard_mask_label: "Wildcard Mask",
    vlsm_strategy_first_subnet: "using First Subnet strategy",
    vlsm_strategy_last_subnet: "using Last Subnet strategy",
    vlsm_disabled_analysis: "Detailed Analysis Disabled",
    vlsm_disabled_reason: "Detailed analysis is disabled for networks larger than /16 to prevent performance issues.",
    vlsm_suggestion: "Suggestion",
    vlsm_suggestion_text: "Use a smaller base network (CIDR ≥ /20) or reduce the number of required hosts per subnet to enable detailed analysis.",
    
    // Error Messages
    error_invalid_base_network: "Invalid base network format. Please use CIDR notation (e.g., 192.168.1.0/24)",
    error_invalid_cidr: "Invalid CIDR value. CIDR must be a number between 1 and 32.",
    error_no_host_requirements: "Please specify at least one host requirement",
    error_host_too_large: "Host requirement too large",
    error_max_hosts: "Maximum supported is 16,777,214 hosts.",
    error_ip_cidr_required: "Please enter an IP address with CIDR notation",
    error_ip_cidr_format: "Please enter IP address in CIDR format (e.g., 192.168.10.50/24)",
    error_invalid_ip: "Invalid IP address format",
    error_invalid_cidr_range: "Invalid CIDR notation. Must be between 1 and 32",
    error_at_least_one_ip: "Please enter at least one IP address",
    error_at_least_one_valid_ip: "Please enter at least one valid IP address",
    error_invalid_number: "Invalid input",
    
    // Validation Warnings
    warning_large_network: "⚠️ Networks larger than (smaller than /8) will take quite a while to process for performance reasons.",
    warning_cidr_range: "⚠️ CIDR must be between 1 and 32. Please enter a valid CIDR notation.",
    warning_large_network_limited: "⚠️ Large networks (smaller than /16) will have disabled detailed analysis for performance reasons.",
    warning_large_network_may_limit: "⚠️ Large networks (smaller than /20) may have limited detailed analysis.",
  },
  
  vi: {
    // Navigation
    nav_title: "Bộ Công Cụ Mạng",
    nav_vlsm: "Chia Mạng Con (VLSM)",
    nav_ip_checker: "Kiểm Tra IP",
    nav_ip_aggregator: "Tổng Hợp IP",
    nav_number_converter: "Chuyển Đổi Số",
    nav_theory: "Lý Thuyết",
    
    // VLSM Tool
    vlsm_title: "Chia Mạng Con VLSM",
    vlsm_description: "Tính toán Subnet Mask có độ dài thay đổi để phân bổ IP hiệu quả",
    vlsm_base_network: "Mạng Gốc (CIDR)",
    vlsm_base_network_help: "Nhập mạng gốc theo ký hiệu CIDR",
    vlsm_strategy: "Chiến Lược Phân Bổ Mạng Con",
    vlsm_strategy_help: "Chọn cách phân bổ mạng con trong quá trình chia",
    vlsm_strategy_first: "Lấy mạng con đầu tiên để gán - Phương pháp Truyền thống",
    vlsm_strategy_last: "Lấy mạng con cuối cùng để gán - Phương pháp Thay thế",
    vlsm_host_requirements: "Yêu Cầu Số Host Cho Mỗi Mạng Con",
    vlsm_network: "Mạng",
    vlsm_add_subnet: "Thêm Mạng Con",
    vlsm_calculate: "Tính Toán",
    vlsm_results: "Kết Quả Chia Mạng Con",
    vlsm_table_view: "Xem Bảng",
    vlsm_detailed_view: "Phân Tích Chi Tiết",
    vlsm_ip_network: "Mạng IP",
    vlsm_first_ip: "IP Đầu",
    vlsm_last_ip: "IP Cuối",
    vlsm_broadcast: "Broadcast",
    vlsm_subnet_mask: "Subnet Mask",
    vlsm_wildcard_mask: "Wildcard Mask",
    vlsm_usable_hosts: "Số Host Khả Dụng",
    
    // IP Checker Tool
    ip_checker_title: "Kiểm Tra IP",
    ip_checker_description: "Kiểm tra xem địa chỉ IP có thể gán được trong mạng con hay không",
    ip_checker_input: "Địa Chỉ IP với CIDR",
    ip_checker_input_help: "Nhập địa chỉ IP với ký hiệu CIDR (ví dụ: 192.168.10.50/24)",
    ip_checker_check: "Kiểm Tra",
    ip_checker_status: "Trạng Thái IP",
    ip_checker_assignable: "Có Thể Gán",
    ip_checker_not_assignable: "Không Thể Gán",
    ip_checker_ip_info: "Thông Tin IP",
    ip_checker_subnet_details: "Chi Tiết Mạng Con",
    ip_checker_ip_address: "Địa Chỉ IP",
    ip_checker_subnet: "Mạng Con",
    ip_checker_network_address: "Địa Chỉ Mạng",
    ip_checker_broadcast_address: "Địa Chỉ Broadcast",
    ip_checker_usable_range: "Dải IP Khả Dụng",
    
    // IP Aggregator Tool
    ip_aggregator_title: "Công Cụ Tổng Hợp IP",
    ip_aggregator_description: "Tìm mạng cha chung cho nhiều địa chỉ IP",
    ip_aggregator_input: "Địa Chỉ IP (Ký Hiệu CIDR)",
    ip_aggregator_input_help: "Nhập mỗi địa chỉ IP với ký hiệu CIDR trên một dòng riêng (ví dụ: 192.168.10.0/28)",
    ip_aggregator_find: "Tìm",
    ip_aggregator_result: "Kết Quả Tổng Hợp",
    ip_aggregator_aggregated_network: "Mạng Tổng Hợp",
    ip_aggregator_common_prefix: "Tiền Tố Chung",
    ip_aggregator_efficiency: "Phân Tích Hiệu Quả",
    ip_aggregator_original_networks: "Số Mạng Gốc",
    ip_aggregator_original_total_hosts: "Tổng Số Host Gốc",
    ip_aggregator_efficiency_label: "Hiệu Quả",
    ip_aggregator_wasted_addresses: "Địa Chỉ Lãng Phí",
    ip_aggregator_input_networks: "Phân Tích Các Mạng Đầu Vào",
    ip_aggregator_original_input: "Đầu Vào Gốc",
    ip_aggregator_network_address: "Địa Chỉ Mạng",
    ip_aggregator_binary: "Biểu Diễn Nhị Phân",
    ip_aggregator_common_prefix_label: "Tiền Tố Chung",
    
    // Number Converter Tool
    number_converter_title: "Chuyển Đổi Hệ Cơ Số",
    number_converter_description: "Chuyển đổi số giữa Nhị phân, Thập phân, Thập lục phân và Bát phân",
    number_converter_input: "Đầu Vào",
    number_converter_from_base: "Từ Hệ Cơ Số",
    number_converter_decimal: "Thập phân (Cơ số 10)",
    number_converter_binary: "Nhị phân (Cơ số 2)",
    number_converter_hex: "Thập lục phân (Cơ số 16)",
    number_converter_octal: "Bát phân (Cơ số 8)",
    number_converter_number: "Số Cần Chuyển Đổi",
    number_converter_number_help: "Nhập một số thập phân (ví dụ: 255)",
    number_converter_results: "Kết Quả",
    number_converter_error: "Lỗi",
    number_converter_examples: "Ví Dụ Nhanh",
    number_converter_converting: "Đang chuyển đổi...",
    
    // Footer
    footer_title: "Bộ Công Cụ Mạng",
    footer_description: "Công cụ tính toán mạng chuyên nghiệp cho quản lý IP hiệu quả",
    footer_copyright: "Xây dựng với",
    footer_for: "cho AI và Glasspham.",
    footer_developed_by: "Phát triển bởi",
    footer_open_source: "Công cụ mạng mã nguồn mở",
    
    // Common
    calculating: "Đang tính toán...",
    checking: "Đang kiểm tra...",
    aggregating: "Đang tổng hợp...",
    error: "Lỗi",
    hosts: "host",
    remove: "Xóa",
    
    // VLSM Detailed Analysis
    vlsm_problem: "Bài Toán VLSM",
    vlsm_using_network: "Sử dụng mạng",
    vlsm_design_vlsm: "thiết kế VLSM cho các mạng sau",
    vlsm_net: "Mạng",
    vlsm_find_addresses: "Tìm địa chỉ đầu tiên, địa chỉ cuối cùng và địa chỉ broadcast cho mỗi mạng con?",
    vlsm_solution: "Lời Giải",
    vlsm_borrowed_bits_note: "Gọi n là số bit mượn thêm từ mạng cha, m là số bit host còn lại.",
    vlsm_calculation: "Tính Toán",
    vlsm_find_m: "Tìm m",
    vlsm_borrowed_bits: "Số bit mượn",
    vlsm_block_size: "Kích Thước Khối",
    vlsm_number_subnets: "Số Mạng Con",
    vlsm_direct_assignment: "Gán trực tiếp (không cần chia nhỏ)",
    vlsm_take_and_divide: "Lấy",
    vlsm_and_divide_into: "và chia thành",
    vlsm_subnets: "mạng con",
    vlsm_assigned_to: "gán cho",
    vlsm_first_ip_label: "IP Đầu",
    vlsm_last_ip_label: "IP Cuối",
    vlsm_broadcast_label: "Broadcast",
    vlsm_subnet_mask_label: "Subnet Mask",
    vlsm_wildcard_mask_label: "Wildcard Mask",
    vlsm_strategy_first_subnet: "sử dụng chiến lược Mạng con Đầu tiên",
    vlsm_strategy_last_subnet: "sử dụng chiến lược Mạng con Cuối cùng",
    vlsm_disabled_analysis: "Phân Tích Chi Tiết Bị Tắt",
    vlsm_disabled_reason: "Phân tích chi tiết bị tắt đối với các mạng lớn hơn /16 để tránh vấn đề về hiệu suất.",
    vlsm_suggestion: "Gợi Ý",
    vlsm_suggestion_text: "Sử dụng mạng gốc nhỏ hơn (CIDR ≥ /20) hoặc giảm số lượng host yêu cầu cho mỗi mạng con để bật phân tích chi tiết.",
    
    // Error Messages
    error_invalid_base_network: "Định dạng mạng gốc không hợp lệ. Vui lòng sử dụng ký hiệu CIDR (ví dụ: 192.168.1.0/24)",
    error_invalid_cidr: "Giá trị CIDR không hợp lệ. CIDR phải là một số từ 1 đến 32.",
    error_no_host_requirements: "Vui lòng chỉ định ít nhất một yêu cầu host",
    error_host_too_large: "Yêu cầu host quá lớn",
    error_max_hosts: "Tối đa hỗ trợ là 16.777.214 host.",
    error_ip_cidr_required: "Vui lòng nhập địa chỉ IP với ký hiệu CIDR",
    error_ip_cidr_format: "Vui lòng nhập địa chỉ IP theo định dạng CIDR (ví dụ: 192.168.10.50/24)",
    error_invalid_ip: "Định dạng địa chỉ IP không hợp lệ",
    error_invalid_cidr_range: "Ký hiệu CIDR không hợp lệ. Phải từ 1 đến 32",
    error_at_least_one_ip: "Vui lòng nhập ít nhất một địa chỉ IP",
    error_at_least_one_valid_ip: "Vui lòng nhập ít nhất một địa chỉ IP hợp lệ",
    error_invalid_number: "Đầu vào không hợp lệ",
    
    // Validation Warnings
    warning_large_network: "⚠️ Các mạng lớn hơn (nhỏ hơn /8) sẽ mất khá nhiều thời gian để xử lý vì lý do hiệu suất.",
    warning_cidr_range: "⚠️ CIDR phải từ 1 đến 32. Vui lòng nhập ký hiệu CIDR hợp lệ.",
    warning_large_network_limited: "⚠️ Các mạng lớn (nhỏ hơn /16) sẽ bị tắt phân tích chi tiết vì lý do hiệu suất.",
    warning_large_network_may_limit: "⚠️ Các mạng lớn (nhỏ hơn /20) có thể có phân tích chi tiết bị giới hạn.",
  }
};

let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @returns {string} - Translated text
 */
export function t(key) {
  return translations[currentLanguage][key] || key;
}

/**
 * Get current language
 * @returns {string} - Current language code
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * Set current language
 * @param {string} lang - Language code ('en' or 'vi')
 */
export function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updatePageTranslations();
  }
}

/**
 * Update all translations on the page
 */
export function updatePageTranslations() {
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);
    
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translation;
    } else {
      // Preserve HTML structure while updating text
      const icon = element.querySelector('i');
      const badge = element.querySelector('.badge');
      
      if (icon && badge) {
        element.innerHTML = '';
        element.appendChild(icon);
        element.appendChild(document.createTextNode(' ' + translation + ' '));
        element.appendChild(badge);
      } else if (icon) {
        element.innerHTML = '';
        element.appendChild(icon);
        element.appendChild(document.createTextNode(' ' + translation));
      } else if (badge) {
        element.textContent = translation + ' ';
        element.appendChild(badge);
      } else {
        element.textContent = translation;
      }
    }
  });
  
  // Update elements with data-i18n-title attribute
  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    element.title = t(key);
  });
  
  // Update elements with data-i18n-html attribute (for form-text and help text)
  document.querySelectorAll('[data-i18n-html]').forEach(element => {
    const key = element.getAttribute('data-i18n-html');
    element.innerHTML = t(key);
  });
  
  // Dispatch event for custom handlers
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: currentLanguage } }));
}

/**
 * Get current theme
 * @returns {string} - Current theme ('light' or 'dark')
 */
export function getCurrentTheme() {
  return currentTheme;
}

/**
 * Set current theme
 * @param {string} theme - Theme name ('light' or 'dark')
 */
export function setTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('theme', theme);
  applyTheme(theme);
  
  // Dispatch event for custom handlers
  document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: currentTheme } }));
}

/**
 * Apply theme to document
 * @param {string} theme - Theme name ('light' or 'dark')
 */
function applyTheme(theme) {
  const body = document.body;
  
  if (theme === 'dark') {
    body.classList.add('dark-theme');
    body.classList.remove('light-theme');
  } else {
    body.classList.add('light-theme');
    body.classList.remove('dark-theme');
  }
}

/**
 * Initialize i18n system
 */
export function initI18n() {
  // Set initial language and theme
  updatePageTranslations();
  applyTheme(currentTheme);
  
  // Create language and theme toggle buttons
  const navbarNav = document.querySelector('.navbar-nav');
  if (navbarNav) {
    // Language toggle button
    const langItem = document.createElement('li');
    langItem.className = 'nav-item ms-2';
    langItem.innerHTML = `
      <button class="btn btn-outline-light btn-sm" id="language-toggle">
        <i class="fas fa-globe me-1"></i>
        <span id="current-lang-text">${currentLanguage.toUpperCase()}</span>
      </button>
    `;
    navbarNav.appendChild(langItem);
    
    // Theme toggle button
    const themeItem = document.createElement('li');
    themeItem.className = 'nav-item ms-2';
    const themeIcon = currentTheme === 'dark' ? 'fa-sun' : 'fa-moon';
    themeItem.innerHTML = `
      <button class="btn btn-outline-light btn-sm" id="theme-toggle" title="Toggle theme">
        <i class="fas ${themeIcon}" id="theme-icon"></i>
      </button>
    `;
    navbarNav.appendChild(themeItem);
    
    // Add language click handler
    document.getElementById('language-toggle').addEventListener('click', () => {
      const newLang = currentLanguage === 'en' ? 'vi' : 'en';
      setLanguage(newLang);
      document.getElementById('current-lang-text').textContent = newLang.toUpperCase();
    });
    
    // Add theme click handler
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      
      // Update icon
      const themeIcon = document.getElementById('theme-icon');
      themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
  }
}

