// Landing Page Script - Submits leads to MangoLeads CRM
// Configuration
const CONFIG = {
    // Production CRM URL
    CRM_URL: 'http://autotradeiq-crm.space', // Your production CRM server
    BRAND_ID: 'trading-platform-demo', // Will be configured in CRM - update per brand
    BRAND_NAME: 'TradePro', // Will be configured in CRM - update per brand
    AFF_ID: '28215', // Update this per affiliate - each affiliate gets their own
    OFFER_ID: '1000' // This landing page's specific offer ID
};

// IP to Country detection function
async function detectCountryByIP() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.country_code) {
            const countrySelect = document.getElementById('country');
            const phoneInput = document.getElementById('phonecc');
            
            // Set country if the option exists
            const countryOption = countrySelect.querySelector(`option[value="${data.country_code}"]`);
            if (countryOption) {
                countrySelect.value = data.country_code;
                
                // Auto-set phone country code
                const phoneCodeMap = {
                    'US': '+1', 'CA': '+1', 'GB': '+44', 'DE': '+49', 'FR': '+33',
                    'IT': '+39', 'ES': '+34', 'NL': '+31', 'SE': '+46', 'NO': '+47',
                    'DK': '+45', 'CH': '+41', 'AT': '+43', 'BE': '+32', 'IE': '+353', 'PT': '+351'
                };
                
                if (phoneCodeMap[data.country_code]) {
                    phoneInput.value = phoneCodeMap[data.country_code];
                }
            }
        }
    } catch (error) {
        console.log('Could not auto-detect country:', error);
        // Fallback to default (US)
        const phoneInput = document.getElementById('phonecc');
        phoneInput.value = '+1';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('leadForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');
    const countrySelect = document.getElementById('country');
    const phoneInput = document.getElementById('phonecc');
    const phoneNumberInput = document.getElementById('phone');

    // Auto-detect country by IP and set defaults
    detectCountryByIP();

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>Processing...';
        
        try {
            // Get form data
            const formData = new FormData(form);
            const leadData = {
                first_name: formData.get('firstName'),
                last_name: formData.get('lastName'),
                email: formData.get('email'),
                phonecc: formData.get('phonecc'),
                phone: formData.get('phone'),
                country: formData.get('country'),
                brand_id: CONFIG.BRAND_ID,
                brand_name: CONFIG.BRAND_NAME,
                aff_id: CONFIG.AFF_ID,
                offer_id: CONFIG.OFFER_ID,
                user_ip: '', // Will be filled by server
                aff_sub: getUrlParameter('aff_sub') || '', // Get from URL parameters
                referer: document.referrer || window.location.href
            };

            console.log('Submitting lead:', leadData);

            // Submit to CRM
            const response = await fetch(`${CONFIG.CRM_URL}/api/leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leadData)
            });

            const result = await response.json();

            if (response.ok) {
                // Success
                showMessage('Success! Welcome aboard! You will be contacted shortly.', 'success');
                form.reset();
                
                // Reset to auto-detected values after form reset
                setTimeout(() => {
                    detectCountryByIP();
                }, 100);
                
                // Optional: Redirect to thank you page
                // window.location.href = 'thank-you.html';
                
                // Optional: Track conversion
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'conversion', {
                        'send_to': 'AW-XXXXXXXXX/XXXXXXXXX', // Your Google Ads conversion tracking
                        'value': 1.0,
                        'currency': 'USD'
                    });
                }
                
            } else {
                // Error from server
                console.error('Server error:', result);
                showMessage(result.error || 'Something went wrong. Please try again.', 'error');
            }
            
        } catch (error) {
            console.error('Submission error:', error);
            showMessage('Network error. Please check your connection and try again.', 'error');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Start Trading Now';
        }
    });

    // Show message function
    function showMessage(text, type) {
        messageDiv.innerHTML = text;
        messageDiv.className = `mt-4 text-center p-3 rounded-lg ${
            type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
        }`;
        messageDiv.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }

    // Get URL parameter function
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Auto-update phone country code when country changes
    countrySelect.addEventListener('change', function() {
        const countryCode = this.value;
        const phoneCodeMap = {
            'US': '+1', 'CA': '+1', 'GB': '+44', 'DE': '+49', 'FR': '+33',
            'IT': '+39', 'ES': '+34', 'NL': '+31', 'SE': '+46', 'NO': '+47',
            'DK': '+45', 'CH': '+41', 'AT': '+43', 'BE': '+32', 'IE': '+353', 'PT': '+351'
        };
        
        if (phoneCodeMap[countryCode]) {
            phoneInput.value = phoneCodeMap[countryCode];
        }
    });

    // Phone number formatting
    phoneNumberInput.addEventListener('input', function() {
        // Remove non-digits
        let value = this.value.replace(/\D/g, '');
        
        // Format based on country code
        const countryCode = phoneInput.value;
        if ((countryCode === '+1' || countryCode === '1') && value.length >= 10) {
            // US/CA format: (123) 456-7890
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        
        this.value = value;
    });

    // Add tracking for form interactions
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // Track field interaction
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_interaction', {
                    'event_category': 'Lead Form',
                    'event_label': this.name || this.id
                });
            }
        });
    });
});

// Track page view
if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
        'page_title': 'Landing Page',
        'page_location': window.location.href
    });
}
