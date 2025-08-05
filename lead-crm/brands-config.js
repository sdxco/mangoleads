/**
 * MangoLeads Multi-Brand Configuration
 * Configure different affiliate brands and their requirements
 */

const brands = {
  'trading-platform-demo': {
    id: 'trading-platform-demo',
    name: 'Trading Platform Demo',
    active: true,
    apiUrl: 'https://demo-brand.example.com/api/leads',
    required_fields: ['first_name', 'last_name', 'email', 'phone', 'country'],
    country_restrictions: [], // Empty = all countries allowed
    trackerUrl: 'https://track.demo-brand.com',
    affId: 'AFF001',
    offerId: 'TRADE123'
  },
  
  'forex-trader-1': {
    id: 'forex-trader-1',
    name: 'Forex Trader Pro',
    active: true,
    apiUrl: 'https://forex-api.example.com/submit',
    required_fields: ['first_name', 'last_name', 'email', 'phone', 'country'],
    country_restrictions: ['US', 'CA', 'GB', 'AU'], // Only these countries
    trackerUrl: 'https://track.forex-trader.com',
    affId: 'AFF002',
    offerId: 'FOREX456'
  },
  
  'crypto-exchange': {
    id: 'crypto-exchange',
    name: 'Crypto Exchange Plus',
    active: true,
    apiUrl: 'https://crypto-api.example.com/leads',
    required_fields: ['first_name', 'last_name', 'email', 'phone', 'country'],
    country_restrictions: ['US', 'CA', 'GB', 'DE', 'FR', 'NL'],
    trackerUrl: 'https://track.crypto-exchange.com',
    affId: 'AFF003',
    offerId: 'CRYPTO789'
  }
};

/**
 * Get brand configuration by ID
 * @param {string} brandId - The brand identifier
 * @returns {object|null} Brand configuration or null if not found
 */
function getBrand(brandId) {
  return brands[brandId] || null;
}

/**
 * Get all active brands
 * @returns {array} Array of active brand configurations
 */
function getActiveBrands() {
  return Object.values(brands).filter(brand => brand.active);
}

/**
 * Get all brands (active and inactive)
 * @returns {array} Array of all brand configurations
 */
function getAllBrands() {
  return Object.values(brands);
}

/**
 * Validate lead data against brand requirements
 * @param {object} leadData - The lead data to validate
 * @param {object} brand - The brand configuration
 * @returns {array} Array of missing field names (empty if valid)
 */
function validateLeadData(leadData, brand) {
  const missingFields = [];
  
  // Check required fields
  brand.required_fields.forEach(field => {
    if (!leadData[field] || leadData[field].toString().trim() === '') {
      missingFields.push(field);
    }
  });
  
  // Check country restrictions
  if (brand.country_restrictions.length > 0 && leadData.country) {
    if (!brand.country_restrictions.includes(leadData.country.toUpperCase())) {
      missingFields.push('country (not accepted for this brand)');
    }
  }
  
  return missingFields;
}

/**
 * Check if a brand accepts leads from a specific country
 * @param {string} brandId - The brand identifier
 * @param {string} country - The country code (e.g., 'US', 'CA')
 * @returns {boolean} True if country is accepted, false otherwise
 */
function isCountryAccepted(brandId, country) {
  const brand = getBrand(brandId);
  if (!brand) return false;
  
  // If no restrictions, all countries are accepted
  if (brand.country_restrictions.length === 0) return true;
  
  return brand.country_restrictions.includes(country.toUpperCase());
}

module.exports = {
  getBrand,
  getActiveBrands,
  getAllBrands,
  validateLeadData,
  isCountryAccepted,
  brands
};
