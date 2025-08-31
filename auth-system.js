// Authentication system for MangoLeads CRM
const crypto = require('crypto');

class AuthSystem {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.affiliates = new Map();
    
    // Initialize with admin user
    this.createAdminUser();
    this.createSampleAffiliates();
  }

  // Create initial admin user
  createAdminUser() {
    const adminUser = {
      id: 'admin',
      username: 'admin',
      password: this.hashPassword('admin123'), // Default admin password
      email: 'admin@mangoleads.com',
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true,
      permissions: [
        'users.create', 'users.read', 'users.update', 'users.delete',
        'leads.create', 'leads.read', 'leads.update', 'leads.delete',
        'affiliates.create', 'affiliates.read', 'affiliates.update', 'affiliates.delete',
        'brands.create', 'brands.read', 'brands.update', 'brands.delete',
        'reports.view', 'settings.manage'
      ]
    };
    
    this.users.set('admin', adminUser);
  }

  // Create sample affiliates
  createSampleAffiliates() {
    const sampleAffiliates = [
      {
        id: 'aff_001',
        username: 'affiliate1',
        password: this.hashPassword('aff123'),
        email: 'john@affiliate1.com',
        role: 'affiliate',
        firstName: 'John',
        lastName: 'Smith',
        companyName: 'Digital Marketing Pro',
        affiliateCode: 'AFF001',
        commissionRate: 15, // 15%
        paymentMethod: 'PayPal',
        paymentDetails: 'john.smith@paypal.com',
        totalCommissions: 2450.50,
        pendingCommissions: 750.00,
        totalLeads: 125,
        convertedLeads: 38,
        conversionRate: 30.4,
        isActive: true,
        createdAt: '2024-01-15T10:30:00.000Z',
        lastLogin: '2025-08-27T15:45:00.000Z',
        permissions: ['leads.create', 'leads.read', 'dashboard.view', 'profile.update']
      },
      {
        id: 'aff_002',
        username: 'affiliate2',
        password: this.hashPassword('aff123'),
        email: 'sarah@trafficqueen.com',
        role: 'affiliate',
        firstName: 'Sarah',
        lastName: 'Johnson',
        companyName: 'Traffic Queen Media',
        affiliateCode: 'AFF002',
        commissionRate: 20, // 20% (higher rate)
        paymentMethod: 'Bank Transfer',
        paymentDetails: 'Chase Bank - ****5678',
        totalCommissions: 5890.75,
        pendingCommissions: 1200.00,
        totalLeads: 280,
        convertedLeads: 84,
        conversionRate: 30.0,
        isActive: true,
        createdAt: '2024-02-01T09:15:00.000Z',
        lastLogin: '2025-08-28T08:20:00.000Z',
        permissions: ['leads.create', 'leads.read', 'dashboard.view', 'profile.update']
      }
    ];

    sampleAffiliates.forEach(affiliate => {
      this.users.set(affiliate.username, affiliate);
      this.affiliates.set(affiliate.id, affiliate);
    });
  }

  // Hash password
  hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'mangoleads_salt').digest('hex');
  }

  // Generate session token
  generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Login user
  login(username, password) {
    const user = this.users.get(username);
    
    if (!user || !user.isActive) {
      return { success: false, message: 'Invalid credentials' };
    }

    const hashedPassword = this.hashPassword(password);
    if (user.password !== hashedPassword) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Generate session
    const sessionToken = this.generateSessionToken();
    const session = {
      userId: user.id,
      username: user.username,
      role: user.role,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    this.sessions.set(sessionToken, session);

    // Update last login
    user.lastLogin = new Date().toISOString();

    return {
      success: true,
      token: sessionToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        permissions: user.permissions
      }
    };
  }

  // Logout user
  logout(sessionToken) {
    this.sessions.delete(sessionToken);
    return { success: true };
  }

  // Validate session
  validateSession(sessionToken) {
    const session = this.sessions.get(sessionToken);
    
    if (!session) {
      return { valid: false, message: 'Invalid session' };
    }

    if (new Date() > new Date(session.expiresAt)) {
      this.sessions.delete(sessionToken);
      return { valid: false, message: 'Session expired' };
    }

    const user = this.users.get(session.username);
    if (!user || !user.isActive) {
      this.sessions.delete(sessionToken);
      return { valid: false, message: 'User inactive' };
    }

    return {
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        permissions: user.permissions
      }
    };
  }

  // Check permission
  hasPermission(sessionToken, permission) {
    const sessionValidation = this.validateSession(sessionToken);
    if (!sessionValidation.valid) {
      return false;
    }

    const user = this.users.get(sessionValidation.user.username);
    return user.permissions.includes(permission) || user.role === 'admin';
  }

  // Get affiliate data
  getAffiliateData(affiliateId) {
    return this.affiliates.get(affiliateId);
  }

  // Get all affiliates (admin only)
  getAllAffiliates() {
    return Array.from(this.affiliates.values());
  }

  // Create new affiliate (admin only)
  createAffiliate(affiliateData) {
    const id = `aff_${Date.now()}`;
    const affiliate = {
      id,
      ...affiliateData,
      password: this.hashPassword(affiliateData.password),
      role: 'affiliate',
      totalCommissions: 0,
      pendingCommissions: 0,
      totalLeads: 0,
      convertedLeads: 0,
      conversionRate: 0,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true,
      permissions: ['leads.create', 'leads.read', 'dashboard.view', 'profile.update']
    };

    this.users.set(affiliate.username, affiliate);
    this.affiliates.set(id, affiliate);
    
    return { success: true, affiliate: { ...affiliate, password: undefined } };
  }

  // Update affiliate status
  updateAffiliateStatus(affiliateId, isActive) {
    const affiliate = this.affiliates.get(affiliateId);
    if (affiliate) {
      affiliate.isActive = isActive;
      this.users.get(affiliate.username).isActive = isActive;
      return { success: true };
    }
    return { success: false, message: 'Affiliate not found' };
  }

  // Add commission to affiliate
  addCommission(affiliateId, amount, leadId) {
    const affiliate = this.affiliates.get(affiliateId);
    if (affiliate) {
      affiliate.pendingCommissions += amount;
      return { success: true };
    }
    return { success: false, message: 'Affiliate not found' };
  }

  // Update affiliate stats
  updateAffiliateStats(affiliateId, newLead = false, converted = false) {
    const affiliate = this.affiliates.get(affiliateId);
    if (affiliate) {
      if (newLead) {
        affiliate.totalLeads++;
      }
      if (converted) {
        affiliate.convertedLeads++;
      }
      affiliate.conversionRate = affiliate.totalLeads > 0 
        ? ((affiliate.convertedLeads / affiliate.totalLeads) * 100).toFixed(1)
        : 0;
      return { success: true };
    }
    return { success: false };
  }
}

module.exports = AuthSystem;
