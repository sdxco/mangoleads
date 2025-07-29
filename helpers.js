/**
 * Utility functions for MangoLeads CRM
 */

const crypto = require('crypto');
const validator = require('validator');

/**
 * Generate a unique tracking ID for leads
 */
function generateTrackingId() {
  return crypto.randomUUID();
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  return validator.isEmail(email);
}

/**
 * Validate phone number (basic validation)
 */
function isValidPhone(phone) {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate country code (ISO 3166-1 alpha-2)
 */
function isValidCountryCode(code) {
  return /^[A-Z]{2}$/.test(code);
}

/**
 * Validate IP address
 */
function isValidIP(ip) {
  return validator.isIP(ip);
}

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return validator.escape(input.trim());
}

/**
 * Generate password hash with bcrypt
 */
async function hashPassword(password) {
  const bcrypt = require('bcrypt');
  const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Get client IP from request
 */
function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         '127.0.0.1';
}

/**
 * Create API response format
 */
function apiResponse(success, data = null, message = null, errors = null) {
  const response = {
    success,
    timestamp: new Date().toISOString()
  };

  if (data !== null) response.data = data;
  if (message) response.message = message;
  if (errors) response.errors = Array.isArray(errors) ? errors : [errors];

  return response;
}

/**
 * Environment configuration getter
 */
function getConfig() {
  return {
    port: process.env.PORT || 4000,
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    trackerUrl: process.env.TRACKER_URL,
    affId: process.env.AFF_ID,
    offerId: process.env.OFFER_ID,
    landingDomain: process.env.LANDING_DOMAIN,
    saltRounds: parseInt(process.env.SALT_ROUNDS) || 10,
    nodeEnv: process.env.NODE_ENV || 'development'
  };
}

module.exports = {
  generateTrackingId,
  isValidEmail,
  isValidPhone,
  isValidCountryCode,
  isValidIP,
  sanitizeInput,
  hashPassword,
  getClientIP,
  apiResponse,
  getConfig
};
