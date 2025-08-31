/**
 * Brand Configuration for MangoLeads CRM
 * Professional lead management system
 */

const brands = {
  // Main Demo Brand for Testing and Development
  'demo': {
    name: 'Demo Trading Platform',
    trackerUrl: null, // No external URL - stores locally only
    affId: '28215',
    offerId: '1000',
    active: true,
    type: 'demo',
    requirements: ['first_name', 'last_name', 'email', 'phonecc', 'phone', 'country'],
    description: 'Demo brand for testing and development - stores leads in CRM database only',
    config: {
      conversion_tracking: true,
      lead_validation: true,
      auto_processing: true
    }
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
 * Toggle brand active status
 * @param {string} brandId - Brand identifier
 * @param {boolean} active - New active status
 */
function toggleBrand(brandId, active) {
  if (brands[brandId]) {
    brands[brandId].active = active;
    return true;
  }
  return false;
}

module.exports = {
  brands,
  getBrand,
  getActiveBrands,
  validateLeadData,
  addBrand,
  toggleBrand
};
