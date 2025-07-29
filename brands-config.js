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

  // Real API Integration Brand - Based on provided API info
  '1737': {
    name: 'VIP Dekikoy Trading',
    trackerUrl: 'https://vip.dekikoy.com/tracker',
    affId: '28215',
    offerId: '1737',
    active: true,
    type: 'api', // Real API integration
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiOWZiOWZlNGMyNDMyOTkwNGExNzhjYzBmOWE1OWY5MmExOTgyYTA0ZDdlYzU2YzlmZmMwYjY0MDcyNDVmMjcwOTM3NGRhNTZlOGM3MzVhNTEiLCJpYXQiOjE3NTEzMDk5MDUuNDAxNDIyLCJuYmYiOjE3NTEzMDk5MDUuNDAxNDI1LCJleHAiOjE3ODI4NDU5MDUuMzkzNjMxLCJzdWIiOiIyOTk4NiIsInNjb3BlcyI6W119.ijjlCXXljrGcvyFOZsl-bXne74-dCS6rnQd1TwoxntaJr3ThZesdxN89CV1zivcyU1zk0UszOgUTNJGEQy5SgjBnREqPNgMuZa51ZIakOTiAaz6Fp4681YKO7HgROLSWi5H07lLge3s2p4FwVqvz_WMFP7Lr1IpLQEYGPHYcUH1aTtsYN7lw0MR5-zxZZSq0ydMsBK_JaZn4MEE9-Pzm5G-vnwfnxs-l6nMCZmrH0ls2Un4dwvEloAEbuN-3DMuWoc9HCzuEqwhhB5vxfz70-Fx042n0bAD_sXOmvMhLLHOc1tP-SpmY4Wktlg5L9WYtBeLKi_Gg9ITUDPx2eCp6HH5cbGUYZwtF6JYjD2Ecr4PgTgIL11WKvZWbyPKo1SmT-e_0Br0Vi7N1dJ8ia9OHGdU5AI4BePN2nGZUAiV1nTnwmeZB-04qh4GPm6Gofsw-NuGIJ_rG-qkTNBrQQT73sAgiZHvZlqEWWyB4QxtyM-cT5Az5OsZ2m2ofxsLoxJQZR7fj22it1xR4e-qh_jn5z6y5YrXpPjA2wEAW26H46PwsY223k2FKWjOqKX8gU_q7icOzqLbgJNzQM_s-oyYQ5-pgQmiuYcSc9K-DTnaZkDU8oZqQCVWWVLXBClTTLTo-Ofn1rvDlSVTu17KNGEYpi870LIs37bK4wxaxSyAYeD8',
    requirements: ['first_name', 'last_name', 'email', 'phonecc', 'phone', 'country'],
    description: 'VIP Dekikoy real API integration with JWT token authentication'
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
