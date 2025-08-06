/**
 * Multi-Brand Configuration for MangoLeads CRM
 * Add new brands here easily
 */

const brands = {
  // Mock Brand for Testing - No External API
  '1000': {
    name: 'Mock Trading Test',
    trackerUrl: null, // No external URL - stores locally only
    affId: '28215',
    offerId: '1000',
    active: true,
    type: 'mock', // Special type for internal testing
    requirements: ['first_name', 'last_name', 'email', 'phonecc', 'phone', 'country'],
    description: 'Mock brand for testing - stores leads in CRM database only'
  },

  // Example Brand 2: Trading Platform
  '2000': {
    name: 'Trading Platform Demo',
    trackerUrl: 'https://httpbin.org/post', // Test URL for now
    affId: '28215',
    offerId: '2000',
    active: true,
    requirements: ['first_name', 'last_name', 'email', 'phonecc', 'phone', 'country'],
    description: 'Demo trading platform for testing'
  },

  // Example Brand 3: Forex Broker
  '3000': {
    name: 'Forex Broker Demo',
    trackerUrl: 'https://httpbin.org/post', // Test URL for now
    affId: '45123',
    offerId: '3000',
    active: true,
    requirements: ['first_name', 'last_name', 'email', 'phonecc', 'phone', 'country'],
    description: 'Demo forex broker for testing'
  },

  // Example Brand 4: Crypto Exchange
  '4000': {
    name: 'Crypto Exchange Demo',
    trackerUrl: 'https://httpbin.org/post', // Test URL for now
    affId: '78901',
    offerId: '4000',
    active: true,
    requirements: ['first_name', 'last_name', 'email', 'phonecc', 'phone', 'country', 'age'],
    description: 'Demo crypto exchange - requires age field'
  },

  // Inactive brand example
  '9999': {
    name: 'Inactive Brand',
    trackerUrl: 'https://inactive.com/api',
    affId: '99999',
    offerId: '9999',
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
 * @returns {array} Array of active brands with id property
 */
function getActiveBrands() {
  return Object.keys(brands)
    .filter(key => brands[key].active)
    .map(key => ({
      id: key,
      ...brands[key],
      apiUrl: brands[key].trackerUrl,
      affId: brands[key].affId,
      offerId: brands[key].offerId,
      required_fields: brands[key].requirements || [],
      country_restrictions: brands[key].country_restrictions || []
    }));
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
