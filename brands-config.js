/**
 * Multi-Brand Configuration for MangoLeads CRM
 * Add new brands here easily
 */

const brands = {
  // Example Brand 1: Trading Platform
  'trading-platform-demo': {
    name: 'Trading Platform Demo',
    trackerUrl: 'https://httpbin.org/post', // Test URL for now
    affId: '28215',
    offerId: '1737',
    active: true,
    requirements: ['first_name', 'last_name', 'email', 'phonecc', 'phone', 'country'],
    description: 'Demo trading platform for testing'
  },

  // Example Brand 2: Forex Broker
  'forex-broker-demo': {
    name: 'Forex Broker Demo',
    trackerUrl: 'https://httpbin.org/post', // Test URL for now
    affId: '45123',
    offerId: '9876',
    active: true,
    requirements: ['first_name', 'last_name', 'email', 'phonecc', 'phone', 'country'],
    description: 'Demo forex broker for testing'
  },

  // Example Brand 3: Crypto Exchange
  'crypto-exchange-demo': {
    name: 'Crypto Exchange Demo',
    trackerUrl: 'https://httpbin.org/post', // Test URL for now
    affId: '78901',
    offerId: '5432',
    active: true,
    requirements: ['first_name', 'last_name', 'email', 'phonecc', 'phone', 'country', 'age'],
    description: 'Demo crypto exchange - requires age field'
  },

  // Inactive brand example
  'inactive-brand': {
    name: 'Inactive Brand',
    trackerUrl: 'https://inactive.com/api',
    affId: '99999',
    offerId: '0000',
    active: false,
    requirements: ['first_name', 'last_name', 'email'],
    description: 'This brand is disabled'
  }
};

/**
 * Get brand configuration by ID
 * @param {string} brandId - Brand identifier
 * @returns {object|null} Brand configuration or null if not found
 */
function getBrand(brandId) {
  return brands[brandId] || null;
}

/**
 * Get all active brands
 * @returns {object} Object with only active brands
 */
function getActiveBrands() {
  const active = {};
  Object.keys(brands).forEach(key => {
    if (brands[key].active) {
      active[key] = brands[key];
    }
  });
  return active;
}

/**
 * Validate lead data against brand requirements
 * @param {object} leadData - Lead data to validate
 * @param {object} brand - Brand configuration
 * @returns {array} Array of missing required fields
 */
function validateLeadData(leadData, brand) {
  return brand.requirements.filter(field => {
    const value = leadData[field];
    return !value || (typeof value === 'string' && value.trim().length === 0);
  });
}

/**
 * Add a new brand (for dynamic brand management)
 * @param {string} brandId - Brand identifier
 * @param {object} brandConfig - Brand configuration
 */
function addBrand(brandId, brandConfig) {
  brands[brandId] = {
    name: brandConfig.name,
    trackerUrl: brandConfig.trackerUrl,
    affId: brandConfig.affId,
    offerId: brandConfig.offerId,
    active: brandConfig.active !== false, // Default to true
    requirements: brandConfig.requirements || ['first_name', 'last_name', 'email', 'phonecc', 'phone', 'country'],
    description: brandConfig.description || ''
  };
}

/**
 * Deactivate a brand
 * @param {string} brandId - Brand identifier
 */
function deactivateBrand(brandId) {
  if (brands[brandId]) {
    brands[brandId].active = false;
  }
}

/**
 * Activate a brand
 * @param {string} brandId - Brand identifier
 */
function activateBrand(brandId) {
  if (brands[brandId]) {
    brands[brandId].active = true;
  }
}

module.exports = {
  brands,
  getBrand,
  getActiveBrands,
  validateLeadData,
  addBrand,
  deactivateBrand,
  activateBrand
};
