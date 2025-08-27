# AkwaabaHomes Agent Dashboard API Testing Guide

## Overview
This guide covers testing the newly created API endpoints for the Agent Dashboard functionality.

## Test Data Created
We've created the following test data in the database:

### Properties
- **Total Properties**: 19 (increased from 16)
- **New Properties Added**: 3 additional properties for agents
- **Property Types**: Houses and apartments
- **Listing Types**: Both sale and rent

### Contact Submissions
- **Total Submissions**: 11 (increased from 7)
- **New Submissions**: 4 test contact form submissions
- **Contact Methods**: Email, phone, and WhatsApp preferences

### Inquiries
- **Total Inquiries**: 12 (increased from 8)
- **New Inquiries**: 4 test inquiries for agent properties
- **Inquiry Types**: Viewing requests, offers, and general questions

## API Endpoints to Test

### 1. Contact Form API (Public)
- **Endpoint**: `/api/contact`
- **Method**: POST
- **Test Data**: Use the contact form on `/contact` page
- **Expected Result**: New contact submission added to database

### 2. Agent Properties API (Authenticated)
- **Endpoint**: `/api/agent/properties`
- **Methods**: GET, POST
- **Authentication**: Required (agent user)
- **Test Data**: Use the agent dashboard property management

### 3. Individual Property API (Authenticated)
- **Endpoint**: `/api/agent/properties/[id]`
- **Methods**: PUT, DELETE
- **Authentication**: Required (agent user + property ownership)
- **Test Data**: Update/delete properties from agent dashboard

### 4. Agent Clients API (Authenticated)
- **Endpoint**: `/api/agent/clients`
- **Method**: GET
- **Authentication**: Required (agent user)
- **Test Data**: View clients from agent dashboard

## How to Test

### Step 1: Test Public Endpoints
1. **Contact Form**: Navigate to `/contact` page
2. **Fill out the form** with test data
3. **Submit** and verify success message
4. **Check database** for new submission

### Step 2: Test Authenticated Endpoints
1. **Sign in as an agent user**:
   - Email: Use one of the existing agent accounts
   - Password: Check the test data or create new agent
2. **Navigate to agent dashboard** (`/agent/dashboard`)
3. **Test each button/link**:
   - Properties Management
   - Add New Property
   - Client Management
   - Contact Support

### Step 3: Verify Data Flow
1. **Create a new property** via the form
2. **Check the properties list** shows the new property
3. **Edit the property** and verify changes
4. **Delete a property** and confirm removal
5. **View clients** and verify inquiry data

## Test Script
We've created a `test-apis.js` file that can test the public endpoints:

```bash
# Run the test script
node test-apis.js
```

**Note**: The test script only tests public endpoints. For authenticated endpoints, you need to test through the frontend.

## Expected Results

### Frontend Testing
- ✅ All navigation links work correctly
- ✅ Forms submit successfully
- ✅ Data displays correctly
- ✅ CRUD operations work as expected
- ✅ Error handling works properly

### Backend Testing
- ✅ API endpoints respond correctly
- ✅ Data validation works (Zod schemas)
- ✅ Authentication middleware works
- ✅ Database operations succeed
- ✅ Error responses are proper

## Troubleshooting

### Common Issues
1. **Authentication Errors**: Ensure you're signed in as an agent
2. **CORS Issues**: Check if the development server is running
3. **Database Errors**: Verify Supabase connection
4. **Validation Errors**: Check input data matches Zod schemas

### Debug Steps
1. **Check browser console** for JavaScript errors
2. **Check network tab** for API request/response details
3. **Check server logs** for backend errors
4. **Verify database** for data consistency

## Next Steps After Testing
1. **Fix any issues** found during testing
2. **Optimize performance** if needed
3. **Add more test coverage** for edge cases
4. **Document any new patterns** discovered
5. **Update the memory bank** with findings

## Test Users Available
The following agent users are available for testing:
- Test Agent (has 1 property)
- Test Agent 2 (has 0 properties)
- Test Agent Three (has 1 property)
- New Test Agent (has 0 properties)
- David Kwame (has 1 property)
- Elizabeth Boateng (has 1 property)

## Database Tables Used
- `properties`: Property listings
- `users`: User accounts and profiles
- `inquiries`: Property inquiries from buyers
- `contact_submissions`: Contact form submissions
- `property_images`: Property image URLs

---

*This guide should be updated as new features are added or issues are discovered during testing.*
