#!/usr/bin/env python3
"""
Simple HTTP Server for MangoLeads CRM
Serves static files and handles basic authentication
"""

import json
import os
import time
import hashlib
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import socketserver
from pathlib import Path

# Configuration
PORT = 8000
PUBLIC_DIR = 'public'

# User database (in production, this would be in a real database)
users = {
    'admin': {
        'id': 'admin_001',
        'username': 'admin',
        'password': 'admin123',  # In production, this would be hashed
        'role': 'admin',
        'firstName': 'Admin',
        'lastName': 'User'
    },
    'affiliate1': {
        'id': 'aff_001',
        'username': 'affiliate1',
        'password': 'aff123',
        'role': 'affiliate',
        'firstName': 'John',
        'lastName': 'Smith'
    },
    'affiliate2': {
        'id': 'aff_002',
        'username': 'affiliate2',
        'password': 'aff123',
        'role': 'affiliate',
        'firstName': 'Sarah',
        'lastName': 'Johnson'
    }
}

# Session storage
sessions = {}

def generate_token():
    """Generate a simple session token"""
    return hashlib.md5(str(time.time()).encode()).hexdigest()

class MangoLeadsHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        """Override to provide colored logging"""
        print(f"🌐 {self.address_string()} - {format % args}")

    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # API endpoints
        if path == '/api/auth/validate':
            self.handle_validate()
        elif path == '/api/stats':
            self.handle_stats()
        elif path == '/api/leads':
            self.handle_leads()
        elif path == '/api/affiliates':
            self.handle_affiliates()
        elif path == '/api/offers':
            self.handle_offers()
        elif path == '/api/brands':
            self.handle_brands()
        else:
            # Serve static files
            self.serve_static_file(path)
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/api/auth/login':
            self.handle_login()
        elif path == '/api/auth/logout':
            self.handle_logout()
        else:
            self.send_error(404, "Not Found")
    
    def handle_login(self):
        """Handle login requests"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            username = data.get('username')
            password = data.get('password')
            
            # Validate credentials
            if username in users and users[username]['password'] == password:
                # Create session
                token = generate_token()
                sessions[token] = {
                    'username': username,
                    'created_at': time.time(),
                    'expires_at': time.time() + 86400  # 24 hours
                }
                
                user = users[username]
                response = {
                    'success': True,
                    'token': token,
                    'user': {
                        'id': user['id'],
                        'username': user['username'],
                        'role': user['role'],
                        'firstName': user['firstName'],
                        'lastName': user['lastName']
                    }
                }
                
                print(f"✅ Login successful: {username} ({user['role']})")
                self.send_json_response(response)
            else:
                print(f"❌ Login failed: {username}")
                self.send_json_response({
                    'success': False,
                    'message': 'Invalid credentials'
                }, 401)
                
        except Exception as e:
            print(f"❌ Login error: {e}")
            self.send_json_response({
                'success': False,
                'message': 'Server error'
            }, 500)
    
    def handle_validate(self):
        """Handle token validation"""
        auth_header = self.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else None
        
        if token and token in sessions:
            session = sessions[token]
            if time.time() < session['expires_at']:
                user = users[session['username']]
                response = {
                    'valid': True,
                    'user': {
                        'id': user['id'],
                        'username': user['username'],
                        'role': user['role'],
                        'firstName': user['firstName'],
                        'lastName': user['lastName']
                    }
                }
                self.send_json_response(response)
                return
            else:
                # Token expired
                del sessions[token]
        
        self.send_json_response({'valid': False}, 401)
    
    def handle_logout(self):
        """Handle logout requests"""
        auth_header = self.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else None
        
        if token and token in sessions:
            del sessions[token]
            print(f"✅ Logout successful")
        
        self.send_json_response({'success': True})
    
    def handle_stats(self):
        """Handle stats API"""
        stats_data = {
            'total': 152,
            'pending': 23,
            'converted': 89,
            'rejected': 40,
            'revenue': 15680.50,
            'commission': 2352.75,
            'conversionRate': 58.6,
            'topAffiliate': 'affiliate2'
        }
        self.send_json_response(stats_data)
    
    def handle_leads(self):
        """Handle leads API"""
        leads_data = [
            {
                'id': 'lead_001',
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john.doe@example.com',
                'phone': '+1234567890',
                'country': 'United States',
                'city': 'New York',
                'ip': '192.168.1.100',
                'userAgent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'landingPage': 'https://trading-demo.com/signup',
                'trafficSource': 'Facebook Ads',
                'brand': 'demo',
                'status': 'converted',
                'affiliateId': 'aff_001',
                'affiliateCode': 'AFF001',
                'commission': 25.00,
                'conversionValue': 250.00,
                'created_at': '2024-01-15T10:00:00Z',
                'converted_at': '2024-01-15T11:30:00Z'
            },
            {
                'id': 'lead_002',
                'firstName': 'Jane',
                'lastName': 'Smith',
                'email': 'jane.smith@example.com',
                'phone': '+0987654321',
                'country': 'Canada',
                'city': 'Toronto',
                'ip': '192.168.1.102',
                'userAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'landingPage': 'https://trading-demo.com/invest',
                'trafficSource': 'Google Ads',
                'brand': 'demo',
                'status': 'pending',
                'affiliateId': 'aff_002',
                'affiliateCode': 'AFF002',
                'commission': 30.00,
                'conversionValue': 0.00,
                'created_at': '2024-01-14T14:30:00Z',
                'converted_at': None
            },
            {
                'id': 'lead_003',
                'firstName': 'Michael',
                'lastName': 'Johnson',
                'email': 'michael.j@example.com',
                'phone': '+44123456789',
                'country': 'United Kingdom',
                'city': 'London',
                'ip': '85.123.45.67',
                'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
                'landingPage': 'https://trading-demo.com/mobile',
                'trafficSource': 'Organic Search',
                'brand': 'demo',
                'status': 'sent',
                'affiliateId': 'aff_001',
                'affiliateCode': 'AFF001',
                'commission': 25.00,
                'conversionValue': 0.00,
                'created_at': '2024-01-13T09:15:00Z',
                'converted_at': None
            }
        ]
        self.send_json_response({'leads': leads_data})
    
    def handle_affiliates(self):
        """Handle affiliates API"""
        affiliates_data = [
            {
                'id': 'aff_001',
                'username': 'affiliate1',
                'firstName': 'John',
                'lastName': 'Smith',
                'companyName': 'Digital Marketing Pro',
                'affiliateCode': 'AFF001',
                'commissionRate': 15,
                'totalCommissions': 2450.50,
                'pendingCommissions': 750.00,
                'totalLeads': 125,
                'convertedLeads': 38,
                'conversionRate': 30.4,
                'isActive': True
            },
            {
                'id': 'aff_002',
                'username': 'affiliate2',
                'firstName': 'Sarah',
                'lastName': 'Johnson',
                'companyName': 'Traffic Queen Media',
                'affiliateCode': 'AFF002',
                'commissionRate': 20,
                'totalCommissions': 5890.75,
                'pendingCommissions': 1200.00,
                'totalLeads': 280,
                'convertedLeads': 84,
                'conversionRate': 30.0,
                'isActive': True
            }
        ]
        self.send_json_response({'affiliates': affiliates_data})
    
    def handle_offers(self):
        """Handle offers API"""
        offers_data = [
            {
                'id': 'offer_001',
                'name': 'Trading Demo Account',
                'description': 'High-converting demo trading platform',
                'landingPageUrl': 'https://trading-demo.com/signup?ref={{AFFILIATE_CODE}}',
                'commission': 25.00,
                'commissionType': 'per_lead',
                'category': 'Trading',
                'countries': ['US', 'UK', 'CA', 'AU'],
                'conversionRate': 12.5,
                'averagePayout': 250.00,
                'isActive': True,
                'createdAt': '2024-01-01T00:00:00Z',
                'thumbnail': 'https://via.placeholder.com/300x200/667eea/ffffff?text=Trading+Demo'
            },
            {
                'id': 'offer_002',
                'name': 'Investment Platform',
                'description': 'Premium investment opportunity',
                'landingPageUrl': 'https://invest-pro.com/join?aff={{AFFILIATE_CODE}}',
                'commission': 50.00,
                'commissionType': 'per_conversion',
                'category': 'Investment',
                'countries': ['US', 'UK', 'DE', 'FR'],
                'conversionRate': 8.3,
                'averagePayout': 500.00,
                'isActive': True,
                'createdAt': '2024-01-15T00:00:00Z',
                'thumbnail': 'https://via.placeholder.com/300x200/764ba2/ffffff?text=Investment+Pro'
            },
            {
                'id': 'offer_003',
                'name': 'Crypto Trading Bot',
                'description': 'Automated cryptocurrency trading solution',
                'landingPageUrl': 'https://crypto-bot.com/start?affiliate={{AFFILIATE_CODE}}',
                'commission': 100.00,
                'commissionType': 'per_sale',
                'category': 'Cryptocurrency',
                'countries': ['US', 'UK', 'CA', 'AU', 'NL'],
                'conversionRate': 5.2,
                'averagePayout': 1000.00,
                'isActive': True,
                'createdAt': '2024-02-01T00:00:00Z',
                'thumbnail': 'https://via.placeholder.com/300x200/10b981/ffffff?text=Crypto+Bot'
            }
        ]
        self.send_json_response({'offers': offers_data})
    
    def handle_brands(self):
        """Handle brands API"""
        brands_data = [
            {
                'id': 'demo',
                'name': 'Demo Trading Platform',
                'active': True,
                'type': 'demo',
                'description': 'Demo brand for testing and development'
            }
        ]
        self.send_json_response(brands_data)
    
    def serve_static_file(self, path):
        """Serve static files from public directory"""
        # Handle root path
        if path == '/' or path == '/index.html':
            path = '/login.html'
        
        # Security: prevent directory traversal
        if '..' in path:
            self.send_error(403, "Forbidden")
            return
        
        file_path = Path(PUBLIC_DIR) / path.lstrip('/')
        
        if file_path.exists() and file_path.is_file():
            # Determine content type
            suffix = file_path.suffix.lower()
            content_types = {
                '.html': 'text/html',
                '.js': 'text/javascript', 
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon'
            }
            content_type = content_types.get(suffix, 'text/plain')
            
            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
            except Exception as e:
                print(f"❌ Error serving file {file_path}: {e}")
                self.send_error(500, "Internal Server Error")
        else:
            self.send_error(404, "Not Found")
    
    def send_json_response(self, data, status=200):
        """Send JSON response"""
        json_data = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(json_data)))
        self.end_headers()
        self.wfile.write(json_data)

def main():
    """Start the server"""
    print('🥭 MangoLeads CRM - Python Server')
    print('==================================')
    
    # Check if public directory exists
    if not os.path.exists(PUBLIC_DIR):
        print(f"❌ Public directory '{PUBLIC_DIR}' not found!")
        return
    
    try:
        # Create server
        httpd = HTTPServer(('0.0.0.0', PORT), MangoLeadsHandler)
        
        print(f"✅ Status: RUNNING")
        print(f"🌐 URL: http://localhost:{PORT}")
        print(f"📁 Serving files from: {PUBLIC_DIR}")
        print("")
        print("Test Credentials:")
        print("👑 Admin: admin / admin123")
        print("🤝 Affiliate1: affiliate1 / aff123")
        print("🤝 Affiliate2: affiliate2 / aff123")
        print("")
        print("Press Ctrl+C to stop the server")
        print("")
        
        # Start serving
        httpd.serve_forever()
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")

if __name__ == '__main__':
    main()
