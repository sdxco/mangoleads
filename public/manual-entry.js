// Manual lead entry form logic for MangoLeads CRM
document.addEventListener('DOMContentLoaded', () => {
  const countrySelect = document.getElementById('countrySelect');
  const brandSelect = document.getElementById('brandSelect');
  const responseMessage = document.getElementById('responseMessage');

  // Populate a small list of common country codes
  const countries = [
    'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK',
    'CH', 'AT', 'BE', 'IE', 'PT'
  ];
  countries.forEach(code => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = code;
    countrySelect.appendChild(option);
  });

  // Load active brands from the CRM
  fetch('/brands')
    .then(resp => resp.json())
    .then(brands => {
      brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.id;
        option.textContent = `${brand.name} (${brand.id})`;
        brandSelect.appendChild(option);
      });
    })
    .catch(err => {
      console.error('Failed to load brands:', err);
    });

  // Handle form submission
  document.getElementById('manualLeadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    // Reset message
    responseMessage.className = 'mt-4 text-center hidden';
    responseMessage.textContent = '';

    const formData = new FormData(e.target);
    // Build payload for CRM
    const payload = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      phonecc: formData.get('phonecc'),
      phone: formData.get('phone'),
      country: formData.get('country'),
      brand_id: formData.get('brand_id'),
      aff_id: formData.get('aff_id') || undefined,
      offer_id: formData.get('offer_id') || undefined,
      referer: window.location.href
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok) {
        responseMessage.textContent = `Lead submitted successfully! Lead ID: ${result.leadId}`;
        responseMessage.className = 'mt-4 text-center text-green-600 font-semibold';
        // Reset the form after success
        e.target.reset();
      } else {
        responseMessage.textContent = `Error: ${result.error || 'Failed to submit lead'}`;
        responseMessage.className = 'mt-4 text-center text-red-600 font-semibold';
      }
    } catch (error) {
      console.error('Submission error:', error);
      responseMessage.textContent = 'Network error. Please try again.';
      responseMessage.className = 'mt-4 text-center text-red-600 font-semibold';
    }
  });
});
