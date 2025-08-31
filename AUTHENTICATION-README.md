# 🔐 MangoLeads CRM - Authentication & Affiliate System

## 🚀 New Features Added

### ✅ Complete Authentication System
- **Secure Login/Logout** with session management
- **Role-based Access Control** (Admin vs Affiliate)
- **Professional Login Page** with glass-morphism design
- **Session Validation** and automatic redirects
- **Password Protection** with SHA-256 hashing

### ✅ Admin Dashboard Features
- **User Management** - View all users and their roles
- **System-wide Statistics** - Total leads, conversions, affiliates
- **Affiliate Management** - Create, activate/deactivate affiliates
- **Commission Tracking** - Monitor total and pending commissions
- **Full Access** to all leads and system data

### ✅ Affiliate Portal Features
- **Personal Dashboard** - View your leads and performance
- **Commission Tracking** - See pending and total earnings
- **Lead Statistics** - Conversion rates and performance metrics
- **Filtered Data** - Only see your own leads and stats
- **Professional Interface** - Beautiful glass-effect design

### ✅ Affiliate Management System
Based on popular CRMs like HubSpot, Pipedrive, and Salesforce, includes:

#### 📊 **Affiliate Dashboard**
- **Personal Stats**: Total leads, conversions, conversion rate
- **Commission Tracking**: Pending commissions, total earnings
- **Performance Metrics**: Real-time analytics
- **Lead History**: View all submitted leads

#### 🎯 **Commission System**
- **Customizable Rates**: Each affiliate can have different commission rates (15%, 20%, etc.)
- **Real-time Tracking**: Automatic commission calculation
- **Payment Management**: Track pending vs. paid commissions
- **Payment Methods**: PayPal, Bank Transfer support

#### 👥 **Affiliate Profiles**
- **Complete Profiles**: Company info, contact details, commission rates
- **Unique Affiliate Codes**: Automatic generation (AFF001, AFF002, etc.)
- **Status Management**: Active/Inactive toggle
- **Performance Tracking**: Lead counts, conversion rates

#### 🔧 **Admin Controls**
- **Affiliate Creation**: Add new affiliate partners
- **Status Management**: Activate/deactivate affiliates
- **Commission Oversight**: Monitor all commission activities
- **Performance Reports**: System-wide affiliate analytics

## 🔑 Login Credentials

### 👤 **Admin Access**
```
Username: admin
Password: admin123
```
**Admin Capabilities:**
- View all leads from all affiliates
- Manage affiliate accounts
- Access system-wide statistics
- Create new affiliates
- Activate/deactivate affiliates

### 👥 **Sample Affiliate Accounts**

#### Affiliate 1 - Digital Marketing Pro
```
Username: affiliate1
Password: aff123
```
- **Affiliate Code**: AFF001
- **Commission Rate**: 15%
- **Company**: Digital Marketing Pro
- **Performance**: 125 leads, 38 conversions (30.4% rate)

#### Affiliate 2 - Traffic Queen Media
```
Username: affiliate2
Password: aff123
```
- **Affiliate Code**: AFF002  
- **Commission Rate**: 20%
- **Company**: Traffic Queen Media
- **Performance**: 280 leads, 84 conversions (30.0% rate)

## 🚀 Quick Start

### Method 1: Double-click the startup file
```
🔐 START AUTHENTICATED CRM.bat
```

### Method 2: Manual command line
```powershell
& "C:\Program Files\nodejs\node.exe" auth-server.js
```

### Method 3: Use the batch file
```
🥭 FINAL START CRM.bat
```

## 📱 How to Use

### 1. **Login**
- Open http://localhost:3000
- You'll be redirected to the login page
- Use the demo credentials above
- Click any demo credential button for quick fill

### 2. **Admin Experience**
- **Dashboard**: See system-wide statistics
- **Leads**: View all leads from all affiliates  
- **Affiliates**: Manage affiliate partners
- **Brands**: Manage brand configurations

### 3. **Affiliate Experience**
- **Dashboard**: See your personal performance
- **Leads**: View only your submitted leads
- **Profile**: Update your information
- **Commission**: Track your earnings

## 🎨 Design Features

### ✨ **Professional Glass-Morphism UI**
- **Backdrop Blur Effects**: Modern glass appearance
- **Gradient Backgrounds**: Purple to blue gradients
- **Smooth Animations**: Slide-in effects and hover transitions
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Icon Integration**: FontAwesome icons throughout

### 🎯 **User Experience**
- **Intuitive Navigation**: Tab-based interface
- **Real-time Updates**: Dynamic data loading
- **Quick Actions**: One-click affiliate management
- **Smart Redirects**: Automatic login/logout handling
- **Error Handling**: Graceful error messages

## 🔒 Security Features

### 🛡️ **Authentication Security**
- **Password Hashing**: SHA-256 with salt
- **Session Tokens**: 32-byte random tokens
- **Session Expiry**: 24-hour automatic logout
- **Role Validation**: Permission-based access
- **Input Sanitization**: Protection against injection attacks

### 🔐 **API Security**
- **Bearer Token Authentication**: Secure API access
- **Permission Checking**: Role-based endpoint access
- **Session Validation**: Every request validated
- **CORS Headers**: Proper cross-origin handling
- **Error Handling**: Secure error responses

## 📈 Affiliate Features Inspired by Industry Leaders

### Based on **HubSpot CRM**:
- User management and permissions
- Contact management system
- Pipeline management
- Reporting dashboards

### Based on **Pipedrive**:
- Activity-based selling approach
- Visual pipeline representation
- Mobile-responsive design
- Integration capabilities

### Based on **Salesforce**:
- Lightning-style interface
- Dynamic forms and actions
- Data cloud integration concepts
- Field-level permissions

## 🛠️ Technical Architecture

### **Frontend**
- **TailwindCSS**: Utility-first CSS framework
- **FontAwesome**: Professional icon library
- **Vanilla JavaScript**: No external dependencies
- **Glass-morphism**: Modern design trends

### **Backend**
- **Node.js**: Server runtime
- **HTTP Module**: Built-in web server
- **Crypto Module**: Password hashing and tokens
- **File System**: Static file serving

### **Data Management**
- **In-Memory Storage**: Fast access with Maps
- **Mock Database**: Comprehensive test data
- **Session Storage**: Token-based authentication
- **Real-time Updates**: Dynamic data loading

## 🎯 Next Steps

Your MangoLeads CRM now includes:
- ✅ **Secure Authentication System**
- ✅ **Admin Dashboard with Full Control**
- ✅ **Affiliate Portal with Personal Stats**  
- ✅ **Professional Design** 
- ✅ **Commission Tracking**
- ✅ **Role-based Access Control**

The system is ready for:
- **Live Deployment** 
- **Database Integration** (PostgreSQL/MySQL)
- **Email Notifications**
- **Payment Processing** 
- **Advanced Reporting**
- **API Integrations**

---

## 📞 Support

If you need any modifications or have questions about the system, the code is well-documented and modular for easy customization.

**Happy Lead Management!** 🥭✨
