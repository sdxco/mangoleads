const { query, getClient } = require('../database/db');
const bcrypt = require('bcrypt');
const validator = require('validator');

class Lead {
  constructor(data) {
    this.id = data.id;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.email = data.email;
    this.passwordHash = data.password_hash;
    this.phonecc = data.phonecc;
    this.phone = data.phone;
    this.country = data.country;
    this.referer = data.referer;
    this.userIp = data.user_ip;
    this.affId = data.aff_id;
    this.offerId = data.offer_id;
    this.affSub = data.aff_sub;
    this.affSub2 = data.aff_sub2;
    this.affSub3 = data.aff_sub3;
    this.affSub4 = data.aff_sub4;
    this.affSub5 = data.aff_sub5;
    this.origOffer = data.orig_offer;
    this.status = data.status || 'queued';
    this.attempts = data.attempts || 0;
    this.lastError = data.last_error;
    this.createdAt = data.created_at;
  }

  // Validate lead data
  static validate(data) {
    const errors = [];

    if (!data.first_name || data.first_name.length > 50) {
      errors.push('First name is required and must be less than 50 characters');
    }

    if (!data.last_name || data.last_name.length > 50) {
      errors.push('Last name is required and must be less than 50 characters');
    }

    if (!data.email || !validator.isEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.password) {
      errors.push('Password is required');
    }

    if (!data.phonecc || data.phonecc.length > 5) {
      errors.push('Phone country code is required and must be less than 5 characters');
    }

    if (!data.phone || data.phone.length > 14) {
      errors.push('Phone number is required and must be less than 14 characters');
    }

    if (!data.country || data.country.length !== 2) {
      errors.push('Country code is required and must be 2 characters');
    }

    if (!data.user_ip || !validator.isIP(data.user_ip)) {
      errors.push('Valid IP address is required');
    }

    if (!data.aff_id || data.aff_id.length > 20) {
      errors.push('Affiliate ID is required and must be less than 20 characters');
    }

    if (!data.offer_id || data.offer_id.length > 10) {
      errors.push('Offer ID is required and must be less than 10 characters');
    }

    return errors;
  }

  // Create a new lead
  static async create(data) {
    const errors = Lead.validate(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const query_text = `
      INSERT INTO leads (
        first_name, last_name, email, password_hash, phonecc, phone, 
        country, referer, user_ip, aff_id, offer_id, aff_sub, aff_sub2, 
        aff_sub3, aff_sub4, aff_sub5, orig_offer
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const values = [
      data.first_name, data.last_name, data.email, passwordHash,
      data.phonecc, data.phone, data.country, data.referer,
      data.user_ip, data.aff_id, data.offer_id, data.aff_sub,
      data.aff_sub2, data.aff_sub3, data.aff_sub4, data.aff_sub5,
      data.orig_offer
    ];

    try {
      const result = await query(query_text, values);
      return new Lead(result.rows[0]);
    } catch (error) {
      if (error.code === '23505' && error.constraint === 'leads_email_idx') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Find lead by ID
  static async findById(id) {
    const result = await query('SELECT * FROM leads WHERE id = $1', [id]);
    return result.rows.length > 0 ? new Lead(result.rows[0]) : null;
  }

  // Find lead by email
  static async findByEmail(email) {
    const result = await query('SELECT * FROM leads WHERE email = $1', [email]);
    return result.rows.length > 0 ? new Lead(result.rows[0]) : null;
  }

  // Get all leads with pagination
  static async findAll(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const result = await query(
      'SELECT * FROM leads ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows.map(row => new Lead(row));
  }

  // Update lead status
  async updateStatus(status, error = null) {
    const result = await query(
      `UPDATE leads 
       SET status = $1, attempts = attempts + 1, last_error = $2 
       WHERE id = $3 
       RETURNING *`,
      [status, error, this.id]
    );
    
    if (result.rows.length > 0) {
      const updated = new Lead(result.rows[0]);
      Object.assign(this, updated);
    }
    return this;
  }

  // Get leads by status
  static async findByStatus(status) {
    const result = await query('SELECT * FROM leads WHERE status = $1', [status]);
    return result.rows.map(row => new Lead(row));
  }

  // Convert to JSON for API responses
  toJSON() {
    const { passwordHash, ...leadData } = this;
    return leadData;
  }
}

module.exports = Lead;
