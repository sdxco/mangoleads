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
    const testForm = document.getElementById('testForm');
    if (testForm) {
        testForm.addEventListener('submit', testApiSubmission);
    }
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
    if (tabName === 'api-integration') loadIntegrations();
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
                    <td colspan="18" class="px-6 py-4 text-center text-gray-500">
                        <i class="fas fa-inbox mr-2"></i>No leads yet. Use the API Integration tab to test submitting leads.
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = '';
        
        leads.slice(0, 50).forEach(lead => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            // Format phone number with country code
            const fullPhone = `${lead.phonecc || '+1'} ${lead.phone || 'N/A'}`;
            
            // Format dates
            const registeredDate = lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'N/A';
            const convertedDate = lead.converted_at ? new Date(lead.converted_at).toLocaleDateString() : 'N/A';
            
            // Format tracking info
            const trackingInfo = [
                lead.aff_id && `AFF: ${lead.aff_id}`,
                lead.offer_id && `Offer: ${lead.offer_id}`,
                lead.aff_sub && `Sub: ${lead.aff_sub}`,
                lead.aff_sub2 && `Sub2: ${lead.aff_sub2}`,
                lead.aff_sub4 && `Sub4: ${lead.aff_sub4}`,
                lead.aff_sub5 && `Sub5: ${lead.aff_sub5}`
            ].filter(Boolean).join('<br>');
            
            row.innerHTML = `
                <td class="px-3 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${lead.first_name || ''} ${lead.last_name || ''}</div>
                    <div class="text-xs text-gray-500">ID: ${lead.id}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${lead.email || 'N/A'}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${lead.phonecc || 'N/A'}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${lead.phone || 'N/A'}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${lead.country || 'N/A'}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${lead.user_id || 'N/A'}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${lead.user_ip || 'N/A'}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${lead.aff_id || 'N/A'}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${lead.offer_id || 'N/A'}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${lead.aff_sub || 'N/A'}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${lead.aff_sub2 || 'N/A'}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${lead.aff_sub4 || 'N/A'}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${lead.aff_sub5 || 'N/A'}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}">
                        ${getStatusLabel(lead.status)}
                    </span>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getApiStatusColor(lead.api_status)}">
                        ${getApiStatusLabel(lead.api_status)}
                    </span>
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-xs text-gray-500">
                    <div>${registeredDate}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-xs text-gray-500">
                    <div>${lead.converted_at ? convertedDate : 'Not converted'}</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-2" onclick="viewLead(${lead.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="text-green-600 hover:text-green-900" onclick="updateLeadStatus(${lead.id}, 'converted')" title="Mark as Converted">
                        <i class="fas fa-check"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Leads load error:', error);
        document.getElementById('leads-table').innerHTML = `
            <tr>
                <td colspan="17" class="px-6 py-4 text-center text-red-500">
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
                <div class="flex gap-2 mt-4 pt-4 border-t">
                    <button onclick="toggleBrand('${brand.id}')" 
                            class="flex-1 px-3 py-2 text-sm font-medium rounded ${brand.active 
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                : 'bg-green-100 text-green-800 hover:bg-green-200'}">
                        <i class="fas ${brand.active ? 'fa-pause' : 'fa-play'} mr-1"></i>
                        ${brand.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onclick="deleteBrand('${brand.id}', this)" 
                            class="px-3 py-2 text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 rounded">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
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
    switch (status?.toLowerCase()) {
        case 'sent': return 'bg-green-100 text-green-800';
        case 'converted': return 'bg-emerald-100 text-emerald-800';
        case 'new': return 'bg-blue-100 text-blue-800';
        case 'queued': return 'bg-yellow-100 text-yellow-800';
        case 'processing': return 'bg-indigo-100 text-indigo-800';
        case 'call_again': return 'bg-orange-100 text-orange-800';
        case 'no_answer': return 'bg-gray-100 text-gray-800';
        case 'not_interested': return 'bg-red-100 text-red-800';
        case 'wrong_number': return 'bg-red-100 text-red-800';
        case 'wrong_info': return 'bg-red-100 text-red-800';
        case 'error': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getStatusLabel(status) {
    switch (status?.toLowerCase()) {
        case 'sent': return 'Sent';
        case 'converted': return 'Converted';
        case 'new': return 'New';
        case 'queued': return 'Queued';
        case 'processing': return 'Processing';
        case 'call_again': return 'Call Again';
        case 'no_answer': return 'No Answer';
        case 'not_interested': return 'Not Interested';
        case 'wrong_number': return 'Wrong Number';
        case 'wrong_info': return 'Wrong Info';
        case 'error': return 'Error';
        default: return status || 'Unknown';
    }
}

// Update lead status function
async function updateLeadStatus(leadId, newStatus) {
    try {
        const response = await fetch(`/api/leads/${leadId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            loadLeads(); // Refresh the leads table
            showNotification(`Lead ${leadId} status updated to ${getStatusLabel(newStatus)}`, 'success');
        } else {
            showNotification('Failed to update lead status', 'error');
        }
    } catch (error) {
        console.error('Error updating lead status:', error);
        showNotification('Error updating lead status', 'error');
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    // Simple notification - could be enhanced with a proper notification system
    const color = type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue';
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 bg-${color}-100 border border-${color}-400 text-${color}-700 px-4 py-3 rounded z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}

function refreshLeads() {
    loadLeads();
}

function viewLead(id) {
    fetch(`/api/leads/${id}`)
        .then(response => response.json())
        .then(lead => {
            // Create detailed modal
            const modalContent = `
                <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" id="lead-modal">
                    <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div class="mt-3">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-medium text-gray-900">Lead Details - ${lead.first_name} ${lead.last_name}</h3>
                                <button class="text-gray-400 hover:text-gray-600" onclick="document.getElementById('lead-modal').remove()">
                                    <i class="fas fa-times text-xl"></i>
                                </button>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <h4 class="font-medium text-gray-900 mb-3">📋 Personal Information</h4>
                                    <div class="space-y-2">
                                        <p><strong>Name:</strong> ${lead.first_name} ${lead.last_name}</p>
                                        <p><strong>Email:</strong> ${lead.email}</p>
                                        <p><strong>Phone:</strong> ${lead.phonecc} ${lead.phone}</p>
                                        <p><strong>Country:</strong> ${lead.country}</p>
                                    </div>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <h4 class="font-medium text-gray-900 mb-3">🔧 System Information</h4>
                                    <div class="space-y-2">
                                        <p><strong>Lead ID:</strong> ${lead.id}</p>
                                        <p><strong>User ID:</strong> ${lead.user_id || 'N/A'}</p>
                                        <p><strong>User IP:</strong> ${lead.user_ip || 'N/A'}</p>
                                        <p><strong>Status:</strong> <span class="px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}">${getStatusLabel(lead.status)}</span></p>
                                    </div>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <h4 class="font-medium text-gray-900 mb-3">📊 Tracking Information</h4>
                                    <div class="space-y-2">
                                        <p><strong>AFF ID:</strong> ${lead.aff_id || 'N/A'}</p>
                                        <p><strong>Offer ID:</strong> ${lead.offer_id || 'N/A'}</p>
                                        <p><strong>AFF Sub:</strong> ${lead.aff_sub || 'N/A'}</p>
                                        <p><strong>AFF Sub2:</strong> ${lead.aff_sub2 || 'N/A'}</p>
                                        <p><strong>AFF Sub4:</strong> ${lead.aff_sub4 || 'N/A'}</p>
                                        <p><strong>AFF Sub5:</strong> ${lead.aff_sub5 || 'N/A'}</p>
                                    </div>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <h4 class="font-medium text-gray-900 mb-3">🏢 Brand Information</h4>
                                    <div class="space-y-2">
                                        <p><strong>Brand:</strong> ${lead.brand_name || lead.brand_id || 'Unknown'}</p>
                                        <p><strong>Brand ID:</strong> ${lead.brand_id || 'N/A'}</p>
                                        <p><strong>Tracker URL:</strong> ${lead.tracker_url || 'N/A'}</p>
                                    </div>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <h4 class="font-medium text-gray-900 mb-3">📅 Important Dates</h4>
                                    <div class="space-y-2">
                                        <p><strong>Date Registered:</strong> ${lead.created_at ? new Date(lead.created_at).toLocaleString() : 'N/A'}</p>
                                        <p><strong>Date Converted:</strong> ${lead.converted_at ? new Date(lead.converted_at).toLocaleString() : 'Not converted'}</p>
                                        <p><strong>Date Sent:</strong> ${lead.sent_at ? new Date(lead.sent_at).toLocaleString() : 'Not sent'}</p>
                                    </div>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <h4 class="font-medium text-gray-900 mb-3">⚠️ Processing Info</h4>
                                    <div class="space-y-2">
                                        <p><strong>Attempts:</strong> ${lead.attempts || 0}</p>
                                        <p><strong>Last Error:</strong> ${lead.last_error || 'None'}</p>
                                        <p><strong>Referer:</strong> ${lead.referer || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-6 flex justify-end space-x-2">
                                <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onclick="updateLeadStatus(${lead.id}, 'converted')">
                                    Mark as Converted
                                </button>
                                <button class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" onclick="document.getElementById('lead-modal').remove()">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalContent);
        })
        .catch(error => {
            alert('Failed to load lead details: ' + error.message);
        });
}

// Test API submission
async function testApiSubmission(e) {
    e.preventDefault();
    
    const formData = {
        first_name: document.getElementById('test_first_name').value,
        last_name: document.getElementById('test_last_name').value,
        email: document.getElementById('test_email').value,
        phonecc: document.getElementById('test_phonecc').value,
        phone: document.getElementById('test_phone').value,
        country: document.getElementById('test_country').value,
        brand_id: document.getElementById('test_brand_id').value,
        brand_name: document.getElementById('test_brand_name').value,
        aff_id: document.getElementById('test_aff_id').value,
        offer_id: document.getElementById('test_offer_id').value
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
        
        const resultDiv = document.getElementById('testResult');
        const messageP = document.getElementById('testMessage');
        
        if (response.ok) {
            messageP.textContent = `Success! Lead submitted. ID: ${result.leadId}`;
            resultDiv.className = 'mt-4 p-3 rounded-md bg-green-100 text-green-800';
            resultDiv.classList.remove('hidden');
            
            // Clear form and restore defaults
            e.target.reset();
            document.getElementById('test_brand_id').value = '1000';
            document.getElementById('test_brand_name').value = 'Mock Trading Test';
            document.getElementById('test_aff_id').value = '28215';
            document.getElementById('test_offer_id').value = '1000';
            document.getElementById('test_phonecc').value = '+1';
            
            // Refresh dashboard
            setTimeout(() => {
                loadDashboard();
            }, 1000);
        } else {
            messageP.textContent = `Error: ${result.error || 'Submission failed'}`;
            resultDiv.className = 'mt-4 p-3 rounded-md bg-red-100 text-red-800';
            resultDiv.classList.remove('hidden');
        }
        
    } catch (error) {
        const resultDiv = document.getElementById('testResult');
        const messageP = document.getElementById('testMessage');
        messageP.textContent = `Network error: ${error.message}`;
        resultDiv.className = 'mt-4 p-3 rounded-md bg-red-100 text-red-800';
        resultDiv.classList.remove('hidden');
    } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Auto-hide result after 5 seconds
        setTimeout(() => {
            const resultDiv = document.getElementById('testResult');
            if (resultDiv) resultDiv.classList.add('hidden');
        }, 5000);
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

// ============================================
// API INTEGRATION MANAGEMENT FUNCTIONS
// ============================================

// Load integrations
function loadIntegrations() {
    fetch('/api/integrations')
        .then(response => response.json())
        .then(integrations => {
            const container = document.getElementById('integrations-list');
            
            if (integrations.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8">
                        <div class="max-w-md mx-auto">
                            <i class="fas fa-plug text-6xl text-gray-300 mb-4"></i>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">No API Integrations</h3>
                            <p class="text-gray-500 mb-6">Get started by adding your first brand integration to start receiving and processing leads automatically.</p>
                            <button onclick="showAddIntegrationModal()" class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium">
                                <i class="fas fa-plus mr-2"></i>Add Your First Integration
                            </button>
                        </div>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="grid gap-6">
                    ${integrations.map(integration => `
                        <div class="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div class="flex justify-between items-start mb-4">
                                <div class="flex-1">
                                    <div class="flex items-center gap-3 mb-2">
                                        <h4 class="text-lg font-semibold text-gray-900">${escapeHtml(integration.name)}</h4>
                                        <span class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${integration.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                            <i class="fas fa-circle text-xs mr-1"></i>
                                            ${integration.active ? 'Active' : 'Inactive'}
                                        </span>
                                        <span class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            ID: ${integration.id}
                                        </span>
                                    </div>
                                    <p class="text-sm text-gray-600 mb-3">
                                        <i class="fas fa-link mr-1"></i>
                                        <span class="font-mono text-xs">${escapeHtml(integration.tracker_url)}</span>
                                    </p>
                                </div>
                                <div class="flex space-x-2 ml-4">
                                    <button onclick="testIntegration('${integration.id}')" 
                                            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center">
                                        <i class="fas fa-flask mr-1"></i>Test
                                    </button>
                                    <button onclick="viewIntegrationDetails('${integration.id}')" 
                                            class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center">
                                        <i class="fas fa-eye mr-1"></i>View
                                    </button>
                                    <button onclick="toggleIntegration('${integration.id}', ${integration.active})" 
                                            class="bg-${integration.active ? 'orange' : 'green'}-600 hover:bg-${integration.active ? 'orange' : 'green'}-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center">
                                        <i class="fas fa-${integration.active ? 'pause' : 'play'} mr-1"></i>${integration.active ? 'Disable' : 'Enable'}
                                    </button>
                                    <button onclick="deleteIntegration('${integration.id}', this)" 
                                            class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center">
                                        <i class="fas fa-trash mr-1"></i>Remove
                                    </button>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                                <div class="bg-gray-50 p-3 rounded">
                                    <span class="font-medium text-gray-700 block mb-1">Affiliate ID</span>
                                    <span class="text-gray-900 font-mono">${escapeHtml(integration.aff_id)}</span>
                                </div>
                                <div class="bg-gray-50 p-3 rounded">
                                    <span class="font-medium text-gray-700 block mb-1">Offer ID</span>
                                    <span class="text-gray-900 font-mono">${escapeHtml(integration.offer_id)}</span>
                                </div>
                                <div class="bg-gray-50 p-3 rounded">
                                    <span class="font-medium text-gray-700 block mb-1">Method</span>
                                    <span class="text-gray-900 font-semibold">${integration.method}</span>
                                </div>
                                <div class="bg-gray-50 p-3 rounded">
                                    <span class="font-medium text-gray-700 block mb-1">Authentication</span>
                                    <span class="text-gray-900">${integration.has_token ? '🔒 JWT Token' : '🔓 None'}</span>
                                </div>
                            </div>
                            
                            <div class="border-t pt-3">
                                <span class="font-medium text-gray-700 text-sm">Required Fields:</span>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    ${integration.required_fields.map(field => `
                                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">${escapeHtml(field)}</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        })
        .catch(error => {
            console.error('Error loading integrations:', error);
            document.getElementById('integrations-list').innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-4"></i>
                    <p class="text-red-600 font-medium">Error loading integrations</p>
                    <p class="text-gray-500 text-sm mt-2">${error.message}</p>
                    <button onclick="loadIntegrations()" class="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                        <i class="fas fa-sync mr-2"></i>Retry
                    </button>
                </div>
            `;
        });
}

// Test integration
function testIntegration(integrationId) {
    const button = event.target.closest('button');
    const originalContent = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Testing...';

    fetch(`/api/integrations/${integrationId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(result => {
            button.disabled = false;
            button.innerHTML = originalContent;
            showTestResults(result);
        })
        .catch(error => {
            button.disabled = false;
            button.innerHTML = originalContent;
            console.error('Test error:', error);
            showNotification('Test failed: ' + error.message, 'error');
        });
}

// Show test results modal
function showTestResults(result) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeModal()">
            <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold text-gray-900">
                        <i class="fas fa-flask mr-2"></i>Test Results - ${escapeHtml(result.brand_name)}
                    </h3>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="mb-6">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            <i class="fas fa-${result.success ? 'check-circle' : 'exclamation-circle'} mr-2"></i>
                            ${result.success ? 'SUCCESS' : 'FAILED'}
                        </span>
                        ${result.status_code ? `<span class="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">Status: ${result.status_code}</span>` : ''}
                        <span class="text-xs text-gray-500">${new Date(result.timestamp).toLocaleString()}</span>
                    </div>
                </div>
                
                ${result.error ? `
                    <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 class="font-medium text-red-800 mb-2">
                            <i class="fas fa-exclamation-triangle mr-1"></i>Error Details:
                        </h4>
                        <p class="text-red-700 font-mono text-sm">${escapeHtml(result.error)}</p>
                    </div>
                ` : ''}
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-medium text-gray-700 mb-3">
                            <i class="fas fa-upload mr-1"></i>Test Data Sent:
                        </h4>
                        <pre class="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border"><code>${JSON.stringify(result.test_data, null, 2)}</code></pre>
                    </div>
                    
                    ${result.response_data ? `
                        <div>
                            <h4 class="font-medium text-gray-700 mb-3">
                                <i class="fas fa-download mr-1"></i>API Response:
                            </h4>
                            <pre class="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border"><code>${JSON.stringify(result.response_data, null, 2)}</code></pre>
                        </div>
                    ` : ''}
                </div>
                
                <div class="flex justify-end mt-6 pt-4 border-t">
                    <button onclick="closeModal()" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium">
                        <i class="fas fa-times mr-2"></i>Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Add integration modal
function showAddIntegrationModal() {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeModal()">
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold text-gray-900">
                        <i class="fas fa-plus mr-2"></i>Add New API Integration
                    </h3>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form id="add-integration-form" onsubmit="submitNewIntegration(event)">
                    <div class="grid grid-cols-1 gap-6">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-tag mr-1"></i>Brand Name
                                </label>
                                <input type="text" name="name" required 
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                       placeholder="e.g., Dekikoy VIP Trading Platform">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-link mr-1"></i>Tracker URL
                                </label>
                                <input type="url" name="tracker_url" required 
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                       placeholder="https://vip.dekikoy.com/tracker">
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-user-friends mr-1"></i>Affiliate ID
                                </label>
                                <input type="text" name="aff_id" required 
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                       placeholder="28215">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-bullseye mr-1"></i>Offer ID
                                </label>
                                <input type="text" name="offer_id" required 
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                       placeholder="1737">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-key mr-1"></i>JWT Token (Optional)
                            </label>
                            <textarea name="token" 
                                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                      rows="3" 
                                      placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOi..."></textarea>
                            <p class="text-xs text-gray-500 mt-1">Paste your JWT authentication token if required by the API</p>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-cog mr-1"></i>HTTP Method
                                </label>
                                <select name="method" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="POST">POST (Recommended)</option>
                                    <option value="GET">GET</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-toggle-on mr-1"></i>Status
                                </label>
                                <select name="active" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 mt-8 pt-6 border-t">
                        <button type="button" onclick="closeModal()" 
                                class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium">
                            <i class="fas fa-times mr-2"></i>Cancel
                        </button>
                        <button type="submit" 
                                class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
                            <i class="fas fa-plus mr-2"></i>Add Integration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Submit new integration
function submitNewIntegration(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (key === 'active') {
            data[key] = value === 'true';
        } else {
            data[key] = value.trim();
        }
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Adding...';
    
    fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
            
            if (result.success) {
                closeModal();
                showIntegrationConfig(result);
                loadIntegrations(); // Refresh the list
            } else {
                showNotification('Error: ' + result.error, 'error');
            }
        })
        .catch(error => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
            console.error('Error adding integration:', error);
            showNotification('Failed to add integration: ' + error.message, 'error');
        });
}

// Show integration configuration modal
function showIntegrationConfig(result) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeModal()">
            <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold text-green-600">
                        <i class="fas fa-check-circle mr-2"></i>Integration Configuration Generated!
                    </h3>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h4 class="font-medium text-green-800 mb-2">✅ Configuration Ready</h4>
                    <p class="text-green-700 text-sm">Your API integration configuration has been generated. Follow the steps below to activate it.</p>
                </div>
                
                <div class="space-y-6">
                    <div>
                        <h4 class="font-medium text-gray-700 mb-3">📋 Integration Configuration:</h4>
                        <pre class="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border font-mono"><code>${JSON.stringify(result.brand, null, 2)}</code></pre>
                        <button onclick="copyToClipboard(this, '${JSON.stringify(result.brand).replace(/'/g, "\\'")}'); showNotification('Configuration copied to clipboard!', 'success')" 
                                class="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                            <i class="fas fa-copy mr-1"></i>Copy Configuration
                        </button>
                    </div>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 class="font-medium text-blue-800 mb-3">🚀 Activation Steps:</h4>
                        <ol class="list-decimal list-inside space-y-2 text-blue-700 text-sm">
                            <li>Copy the configuration above</li>
                            <li>Open your <code class="bg-blue-100 px-1 rounded">brands-config.js</code> file</li>
                            <li>Add the configuration to the brands array</li>
                            <li>Deploy your application</li>
                            <li>The integration will be active and ready to receive leads!</li>
                        </ol>
                    </div>
                </div>
                
                <div class="flex justify-end mt-8 pt-6 border-t">
                    <button onclick="closeModal()" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium">
                        <i class="fas fa-check mr-2"></i>Got It
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// View integration details
function viewIntegrationDetails(integrationId) {
    // This would show detailed configuration for an existing integration
    showNotification('Integration details view - Coming soon!', 'info');
}

// Toggle integration active status
function toggleIntegration(integrationId, currentStatus) {
    const action = currentStatus ? 'disable' : 'enable';
    
    if (!confirm(`Are you sure you want to ${action} this integration?`)) {
        return;
    }

    const button = event.target.closest('button');
    const originalContent = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Processing...';

    fetch(`/api/integrations/${integrationId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(result => {
            button.disabled = false;
            button.innerHTML = originalContent;
            
            if (result.success) {
                showToggleResults(result);
                loadIntegrations(); // Refresh the list
            } else {
                showNotification('Error: ' + result.error, 'error');
            }
        })
        .catch(error => {
            button.disabled = false;
            button.innerHTML = originalContent;
            console.error('Toggle error:', error);
            showNotification('Failed to toggle integration: ' + error.message, 'error');
        });
}

// Delete integration
function deleteIntegration(integrationId, buttonElement) {
    if (!confirm('Are you sure you want to remove this integration?\n\nThis will generate instructions to remove it from your configuration.')) {
        return;
    }

    const button = buttonElement;
    if (!button) {
        console.error('Button element is null or undefined');
        return;
    }
    
    const originalContent = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Removing...';

    fetch(`/api/integrations/${integrationId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(result => {
            button.disabled = false;
            button.innerHTML = originalContent;
            
            if (result.success) {
                showDeleteResults(result);
                loadIntegrations(); // Refresh the list
                loadBrands(); // Also refresh brands list
            } else {
                showNotification('Error: ' + result.error, 'error');
            }
        })
        .catch(error => {
            console.error('Delete error:', error);
            button.disabled = false;
            button.innerHTML = originalContent;
            showNotification('Failed to delete integration: ' + error.message, 'error');
        });
}

// Show toggle results modal
function showToggleResults(result) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeModal()">
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold text-orange-600">
                        <i class="fas fa-toggle-${result.new_status ? 'on' : 'off'} mr-2"></i>Integration ${result.new_status ? 'Activation' : 'Deactivation'}
                    </h3>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <h4 class="font-medium text-orange-800 mb-2">
                        🔧 Configuration Update Required
                    </h4>
                    <p class="text-orange-700 text-sm">
                        ${result.message}
                    </p>
                </div>
                
                <div class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-medium text-gray-700 mb-2">Brand Details:</h4>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="font-medium">Brand ID:</span> ${result.brand_id}
                            </div>
                            <div>
                                <span class="font-medium">Brand Name:</span> ${escapeHtml(result.brand_name)}
                            </div>
                            <div>
                                <span class="font-medium">Current Status:</span> 
                                <span class="px-2 py-1 rounded text-xs ${result.current_status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                    ${result.current_status ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div>
                                <span class="font-medium">New Status:</span> 
                                <span class="px-2 py-1 rounded text-xs ${result.new_status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                    ${result.new_status ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 class="font-medium text-blue-800 mb-3">📋 Required Steps:</h4>
                        <ol class="list-decimal list-inside space-y-2 text-blue-700 text-sm">
                            <li>${result.instructions.step1}</li>
                            <li>${result.instructions.step2}</li>
                            <li>${result.instructions.step3}</li>
                        </ol>
                    </div>
                </div>
                
                <div class="flex justify-end mt-6 pt-4 border-t">
                    <button onclick="closeModal()" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium">
                        <i class="fas fa-check mr-2"></i>Understood
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Show delete results modal
function showDeleteResults(result) {
    const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeModal()">
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold text-green-600">
                        <i class="fas fa-check-circle mr-2"></i>Brand Deactivated
                    </h3>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h4 class="font-medium text-green-800 mb-2">
                        ✅ Brand Deactivated Successfully
                    </h4>
                    <p class="text-green-700 text-sm">
                        ${result.message}
                    </p>
                    ${result.note ? `<p class="text-green-600 text-xs mt-2">${result.note}</p>` : ''}
                </div>
                
                <div class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-medium text-gray-700 mb-2">Brand Details:</h4>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="font-medium">Brand ID:</span> ${result.brand_id}
                            </div>
                            <div>
                                <span class="font-medium">Brand Name:</span> ${escapeHtml(result.brand_name)}
                            </div>
                            <div>
                                <span class="font-medium">Existing Leads:</span> ${result.existing_leads}
                            </div>
                            <div>
                                <span class="font-medium">Status:</span> 
                                <span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Deactivated</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 class="font-medium text-blue-800 mb-3">🎯 What Happened:</h4>
                        <ul class="list-disc list-inside space-y-1 text-blue-700 text-sm">
                            <li>Brand has been deactivated immediately</li>
                            <li>No new leads will be accepted for this brand</li>
                            <li>Existing leads are preserved in the database</li>
                            <li>You can reactivate the brand anytime using the toggle button</li>
                        </ul>
                    </div>
                </div>
                
                <div class="flex justify-end mt-6 pt-4 border-t">
                    <button onclick="closeModal()" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium">
                        <i class="fas fa-check mr-2"></i>Got It
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black');
    if (modal) {
        modal.remove();
    }
}

// Copy to clipboard utility
function copyToClipboard(button, text) {
    navigator.clipboard.writeText(text).then(() => {
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
        setTimeout(() => {
            button.innerHTML = originalContent;
        }, 2000);
    });
}

// HTML escape utility
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification
function showNotification(message, type = 'info') {
    const types = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${types[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm`;
    notification.innerHTML = `
        <div class="flex items-center">
            <span class="flex-1">${escapeHtml(message)}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// API Status color and label functions
function getApiStatusColor(apiStatus) {
    switch (apiStatus) {
        case 'sent': return 'bg-green-100 text-green-800';
        case 'failed': return 'bg-red-100 text-red-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getApiStatusLabel(apiStatus) {
    switch (apiStatus) {
        case 'sent': return '✅ Sent';
        case 'failed': return '❌ Failed';
        case 'pending': return '⏳ Pending';
        default: return '❓ Unknown';
    }
}

// Brand management functions
function deleteBrand(brandId, buttonElement) {
    if (confirm(`Are you sure you want to delete the brand "${brandId}"?`)) {
        deleteIntegration(brandId, buttonElement);
    }
}

function toggleBrand(brandId) {
    toggleIntegration(brandId);
}
