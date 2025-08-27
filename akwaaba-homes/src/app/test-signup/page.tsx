import React from 'react';

export default function TestSignupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Test Agent Signup Form</h1>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Test Instructions</h2>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• This is a test form for testing agent signup functionality</li>
            <li>• Fill in the form with test data and submit</li>
            <li>• Check the browser console for API responses</li>
            <li>• Use the "Fill Sample Data" button to populate with test data</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <form id="signupForm" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <input
                  type="text"
                  id="businessType"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  id="licenseNumber"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  id="experienceYears"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Professional Bio * (min 10 characters)
              </label>
              <textarea
                id="bio"
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="agreeToTerms"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                I agree to the terms and conditions *
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                id="fillSampleBtn"
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Fill Sample Data
              </button>
              
              <button
                type="submit"
                id="submitBtn"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Submit Application
              </button>
            </div>
          </form>

          <div id="result" className="mt-6"></div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            console.log('Test signup form loaded');
            
            const form = document.getElementById('signupForm');
            const submitBtn = document.getElementById('submitBtn');
            const result = document.getElementById('result');
            const fillSampleBtn = document.getElementById('fillSampleBtn');
            
            // Simple password strength check
            function checkPasswordStrength(password) {
              let score = 0;
              if (password.length >= 8) score += 1;
              if (password.length >= 12) score += 1;
              if (/[A-Z]/.test(password)) score += 1;
              if (/[a-z]/.test(password)) score += 1;
              if (/\\d/.test(password)) score += 1;
              if (/[!@#$%^&*()_+\\-=\\[\\]{};':"\\\\|,.<>\\/?]/.test(password)) score += 1;
              return score >= 3;
            }
            
            // Form validation
            function validateForm() {
              const errors = [];
              const formData = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                companyName: document.getElementById('companyName').value.trim(),
                businessType: document.getElementById('businessType').value.trim(),
                licenseNumber: document.getElementById('licenseNumber').value.trim(),
                experienceYears: document.getElementById('experienceYears').value.trim(),
                bio: document.getElementById('bio').value.trim(),
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value,
                agreeToTerms: document.getElementById('agreeToTerms').checked
              };
              
              console.log('Form data:', formData);
              
              if (!formData.firstName) errors.push('First name is required');
              if (!formData.lastName) errors.push('Last name is required');
              if (!formData.email) errors.push('Email is required');
              if (!formData.phone) errors.push('Phone number is required');
              if (!formData.companyName) errors.push('Company name is required');
              if (!formData.businessType) errors.push('Business type is required');
              if (!formData.licenseNumber) errors.push('License number is required');
              if (!formData.experienceYears) errors.push('Years of experience is required');
              if (!formData.bio) errors.push('Professional bio is required');
              if (formData.bio.length < 10) errors.push('Professional bio must be at least 10 characters');
              if (!formData.password) errors.push('Password is required');
              if (!formData.confirmPassword) errors.push('Password confirmation is required');
              if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
              if (!formData.agreeToTerms) errors.push('You must agree to the terms and conditions');
              
              // Check password strength
              if (formData.password && !checkPasswordStrength(formData.password)) {
                errors.push('Password does not meet strength requirements');
              }
              
              return { errors, formData };
            }
            
            // Handle form submission
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              console.log('Form submitted');
              
              const { errors, formData } = validateForm();
              
              if (errors.length > 0) {
                result.innerHTML = \`<div class="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">Validation errors: \${errors.join(', ')}</div>\`;
                return;
              }
              
              console.log('Form validation passed, submitting to API...');
              
              // Transform data for API
              const apiPayload = {
                email: formData.email,
                password: formData.password,
                user_metadata: {
                  first_name: formData.firstName,
                  last_name: formData.lastName,
                  phone: formData.phone,
                  company_name: formData.companyName,
                  business_type: formData.businessType,
                  license_number: formData.licenseNumber,
                  experience_years: parseInt(formData.experienceYears),
                  bio: formData.bio,
                  user_type: 'agent',
                  verification_status: 'pending'
                }
              };
              
              console.log('API payload:', apiPayload);
              
              try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
                
                const response = await fetch('/api/auth/signup', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(apiPayload),
                });
                
                const data = await response.json();
                console.log('API response:', response.status, data);
                
                if (response.ok) {
                  result.innerHTML = \`<div class="p-4 bg-green-50 border border-green-200 rounded-md text-green-700">✅ Signup successful! User ID: \${data.user.id}</div>\`;
                } else {
                  result.innerHTML = \`<div class="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">❌ Signup failed: \${data.error}</div>\`;
                }
              } catch (error) {
                console.error('Error:', error);
                result.innerHTML = \`<div class="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">❌ Error: \${error.message}</div>\`;
              } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Application';
              }
            });
            
            // Fill sample data
            fillSampleBtn.addEventListener('click', () => {
              document.getElementById('firstName').value = 'Test';
              document.getElementById('lastName').value = 'Agent';
              document.getElementById('email').value = \`testagent\${Date.now()}@gmail.com\`;
              document.getElementById('phone').value = '1234567890';
              document.getElementById('companyName').value = 'Test Company';
              document.getElementById('businessType').value = 'Real Estate';
              document.getElementById('licenseNumber').value = \`TEST\${Date.now()}\`;
              document.getElementById('experienceYears').value = '5';
              document.getElementById('bio').value = 'This is a test bio for testing purposes with more than 10 characters';
              document.getElementById('password').value = 'TestPassword123!';
              document.getElementById('confirmPassword').value = 'TestPassword123!';
              document.getElementById('agreeToTerms').checked = true;
            });
            
            console.log('Test signup form ready');
          `
        }}
      />
    </div>
  );
}
