// Dashboard functionality for MangoLeads CRM
let currentTab = 'leads';
let brands = {};
let stats = {};
let brandChart = null;
let statusChart = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    loadDashboard();
    setupEventListeners();
    setInterval(loadDashboard, 30000); // Refresh every 30 seconds
});

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Test form submission
    document.getElementById('test-form').addEventListener('submit', testApiSubmission);
}

// Switch tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active', 'border-blue-500', 'text-blue-600');
    
    // Show/hide tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    
    currentTab = tabName;
    
    // Load tab-specific data
    if (tabName === 'brands') loadBrands();
    if (tabName === 'api') loadApiGuide();
    if (tabName === 'analytics') loadAnalytics();
}

// Load dashboard data
async function loadDashboard() {
    try {
        console.log('Loading dashboard data...');
        
        // Load stats
        await loadStats();
        
        // Load leads if on leads tab
        if (currentTab === 'leads') {
            await loadLeads();
        }
        
        // Update status indicator
        document.getElementById('status-indicator').innerHTML = `
            <i class="fas fa-circle text-green-500 mr-1"></i>
            Online
        `;
        document.getElementById('status-indicator').className = 'px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full';
        
    } catch (error) {
        console.error('Dashboard load error:', error);
        document.getElementById('status-indicator').innerHTML = `
            <i class="fas fa-circle text-red-500 mr-1"></i>
            Offline
        `;
        document.getElementById('status-indicator').className = 'px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full';
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch('/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const statsData = await response.json();
        
        // Update UI
        document.getElementById('total-leads').textContent = statsData.totalLeads;
        document.getElementById('sent-leads').textContent = statsData.sentLeads;
        document.getElementById('queued-leads').textContent = statsData.queuedLeads;
        document.getElementById('active-brands').textContent = statsData.activeBrands;
        
        stats = statsData;
        
    } catch (error) {
        console.error('Stats load error:', error);
        // Set default values
        document.getElementById('total-leads').textContent = '-';
        document.getElementById('sent-leads').textContent = '-';
        document.getElementById('queued-leads').textContent = '-';
        document.getElementById('active-brands').textContent = '-';
    }
}

// Load leads table
async function loadLeads() {
    try {
        const response = await fetch('/api/leads');
        if (!response.ok) throw new Error('Failed to fetch leads');
        
        const data = await response.json();
        const leads = data.leads || [];
        const tableBody = document.getElementById('leads-table');
        
        if (leads.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        <i class="fas fa-inbox mr-2"></i>No leads yet. Use the API Integration tab to test submitting leads.
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = '';
        
        leads.slice(0, 50).forEach(lead => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${lead.first_name} ${lead.last_name}</div>
                    <div class="text-sm text-gray-500">${lead.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        ${lead.brand_name || lead.brand_id || 'Unknown'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}">
                        ${lead.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(lead.created_at).toLocaleString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900" onclick="viewLead(${lead.id})">View</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Leads load error:', error);
        document.getElementById('leads-table').innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-red-500">
                    <i class="fas fa-exclamation-triangle mr-2"></i>Error loading leads
                </td>
            </tr>
        `;
    }
}

// Load brands
async function loadBrands() {
    try {
        const response = await fetch('/brands');
        if (!response.ok) throw new Error('Failed to fetch brands');
        
        const brandsData = await response.json();
        const brandsList = document.getElementById('brands-list');
        brandsList.innerHTML = '';
        
        if (brandsData.length === 0) {
            brandsList.innerHTML = `
                <div class="col-span-full text-center text-gray-500 py-8">
                    <i class="fas fa-building text-4xl mb-4"></i>
                    <p>No brands configured yet.</p>
                    <p class="text-sm">Edit brands-config.js to add brands.</p>
                </div>
            `;
            return;
        }
        
        brandsData.forEach(brand => {
            const card = document.createElement('div');
            card.className = 'bg-white border rounded-lg p-6 hover:shadow-md transition-shadow';
            card.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-medium text-gray-900">${brand.name}</h4>
                    <span class="px-2 py-1 text-xs rounded-full ${brand.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${brand.active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <div class="space-y-2 text-sm text-gray-600">
                    <div><strong>ID:</strong> <code class="bg-gray-100 px-1 rounded">${brand.id}</code></div>
                    <div><strong>API URL:</strong> <span class="font-mono text-xs break-all">${brand.api_url}</span></div>
                    <div><strong>Required Fields:</strong> ${brand.required_fields.join(', ')}</div>
                    ${brand.country_restrictions.length > 0 ? 
                        `<div><strong>Countries:</strong> ${brand.country_restrictions.join(', ')}</div>` : 
                        ''
                    }
                </div>
            `;
            brandsList.appendChild(card);
        });
        
        brands = brandsData;
        
    } catch (error) {
        console.error('Brands load error:', error);
        document.getElementById('brands-list').innerHTML = `
            <div class="col-span-full text-center text-red-500 py-8">
                <i class="fas fa-exclamation-triangle mr-2"></i>Error loading brands
            </div>
        `;
    }
}

// Load API guide
function loadApiGuide() {
    // Update base URL
    document.getElementById('base-url').textContent = window.location.origin;
    
    // Load brand options for test form
    const brandSelect = document.getElementById('test-brand');
    brandSelect.innerHTML = '<option value="">Select Brand</option>';
    
    if (brands && brands.length > 0) {
        brands.forEach(brand => {
            if (brand.active) {
                const option = document.createElement('option');
                option.value = brand.id;
                option.textContent = brand.name;
                brandSelect.appendChild(option);
            }
        });
    }
    
    // Update API example
    const firstActiveBrand = brands.find(b => b.active);
    const brandId = firstActiveBrand ? firstActiveBrand.id : 'trading-platform-demo';
    
    const apiExample = `curl -X POST ${window.location.origin}/api/leads \\
  -H "Content-Type: application/json" \\
  -d '{
    "brand_id": "${brandId}",
    "first_name": "John",
    "last_name": "Doe", 
    "email": "john@example.com",
    "phone": "5551234567",
    "country": "US"
  }'`;
    
    document.getElementById('api-example').textContent = apiExample;
}

// Utility functions
function getStatusColor(status) {
    switch (status) {
        case 'sent': return 'bg-green-100 text-green-800';
        case 'queued': return 'bg-yellow-100 text-yellow-800';
        case 'error': return 'bg-red-100 text-red-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function refreshLeads() {
    loadLeads();
}

function viewLead(id) {
    // Simple implementation - could be enhanced with a modal
    fetch(`/api/leads/${id}`)
        .then(response => response.json())
        .then(lead => {
            alert(`Lead Details:

ID: ${lead.id}
Name: ${lead.first_name} ${lead.last_name}
Email: ${lead.email}
Phone: ${lead.phone || 'N/A'}
Country: ${lead.country || 'N/A'}
Brand: ${lead.brand_name || lead.brand_id || 'Unknown'}
Status: ${lead.status}
Created: ${new Date(lead.created_at).toLocaleString()}
${lead.sent_at ? `Sent: ${new Date(lead.sent_at).toLocaleString()}` : ''}
${lead.last_error ? `Last Error: ${lead.last_error}` : ''}`);
        })
        .catch(error => {
            alert('Failed to load lead details: ' + error.message);
        });
}

// Test API submission
async function testApiSubmission(e) {
    e.preventDefault();
    
    const formData = {
        brand_id: document.getElementById('test-brand').value,
        first_name: document.getElementById('test-first-name').value,
        last_name: document.getElementById('test-last-name').value,
        email: document.getElementById('test-email').value,
        phone: document.getElementById('test-phone').value,
        country: document.getElementById('test-country').value
    };
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';
    submitButton.disabled = true;
    
    try {
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        const resultDiv = document.getElementById('test-result');
        resultDiv.className = `mt-4 p-4 rounded-lg ${response.ok ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`;
        resultDiv.innerHTML = `
            <h5 class="font-semibold mb-2">${response.ok ? '✅ Success!' : '❌ Error'}</h5>
            <pre class="text-sm bg-white bg-opacity-50 p-2 rounded">${JSON.stringify(result, null, 2)}</pre>
        `;
        resultDiv.classList.remove('hidden');
        
        // Refresh dashboard if successful
        if (response.ok) {
            setTimeout(() => {
                loadDashboard();
                // Reset form
                e.target.reset();
            }, 1000);
        }
        
    } catch (error) {
        const resultDiv = document.getElementById('test-result');
        resultDiv.className = 'mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800';
        resultDiv.innerHTML = `
            <h5 class="font-semibold mb-2">❌ Network Error</h5>
            <p class="text-sm">${error.message}</p>
        `;
        resultDiv.classList.remove('hidden');
    } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    navigator.clipboard.writeText(element.textContent).then(() => {
        // Show feedback
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
        button.classList.add('bg-green-600');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('bg-green-600');
        }, 2000);
    });
}

// Load analytics
async function loadAnalytics() {
    try {
        const response = await fetch('/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        
        const analytics = await response.json();
        
        // Check if we have data
        if (!analytics.brandStats || analytics.brandStats.length === 0) {
            document.getElementById('brand-chart').parentElement.innerHTML = `
                <h4 class="text-md font-semibold text-gray-900 mb-4">Leads by Brand</h4>
                <div class="flex items-center justify-center h-64 text-gray-500">
                    <div class="text-center">
                        <i class="fas fa-chart-bar text-4xl mb-4"></i>
                        <p>No data to display</p>
                        <p class="text-sm">Submit some leads to see analytics</p>
                    </div>
                </div>
            `;
            
            document.getElementById('status-chart').parentElement.innerHTML = `
                <h4 class="text-md font-semibold text-gray-900 mb-4">Status Distribution</h4>
                <div class="flex items-center justify-center h-64 text-gray-500">
                    <div class="text-center">
                        <i class="fas fa-chart-pie text-4xl mb-4"></i>
                        <p>No data to display</p>
                        <p class="text-sm">Submit some leads to see analytics</p>
                    </div>
                </div>
            `;
            
            document.getElementById('brand-stats-table').innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        No analytics data available
                    </td>
                </tr>
            `;
            return;
        }
        
        // Destroy existing charts
        if (brandChart) brandChart.destroy();
        if (statusChart) statusChart.destroy();
        
        // Brand performance chart
        brandChart = new Chart(document.getElementById('brand-chart'), {
            type: 'bar',
            data: {
                labels: analytics.brandStats.map(b => b.brand_name || 'Unknown'),
                datasets: [{
                    label: 'Total Leads',
                    data: analytics.brandStats.map(b => b.total_leads),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Status distribution chart
        statusChart = new Chart(document.getElementById('status-chart'), {
            type: 'doughnut',
            data: {
                labels: analytics.statusStats.map(s => s.status),
                datasets: [{
                    data: analytics.statusStats.map(s => s.count),
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(168, 85, 247, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Brand stats table
        const tableBody = document.getElementById('brand-stats-table');
        tableBody.innerHTML = '';
        
        analytics.brandStats.forEach(brand => {
            const successRate = brand.total_leads > 0 ? 
                ((brand.sent_leads / brand.total_leads) * 100).toFixed(1) + '%' : 
                '0%';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${brand.brand_name || 'Unknown'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${brand.total_leads}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${successRate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">${brand.sent_leads}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">${brand.error_leads || 0}</td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Analytics load error:', error);
    }
}

// Utility functions
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    navigator.clipboard.writeText(element.textContent).then(() => {
        // Show temporary feedback
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    });
}

async function refreshLeads() {
    await dashboard.loadLeads();
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
    
    // Setup test form
    document.getElementById('test-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const leadData = {
            first_name: document.getElementById('test-first-name').value,
            last_name: document.getElementById('test-last-name').value,
            email: document.getElementById('test-email').value,
            phone: document.getElementById('test-phone').value,
            country: document.getElementById('test-country').value,
            brand_id: document.getElementById('test-brand').value
        };
        
        dashboard.submitTestLead({
            target: e.target,
            preventDefault: () => {},
            get: (key) => leadData[key]
        });
    });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (dashboard && dashboard.refreshInterval) {
        clearInterval(dashboard.refreshInterval);
    }
});
