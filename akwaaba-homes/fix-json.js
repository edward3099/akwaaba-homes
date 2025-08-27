const { jsonrepair } = require('jsonrepair');
const fs = require('fs');
const path = require('path');

// Path to the corrupted tasks.json file
const tasksFile = path.join(__dirname, '.taskmaster', 'tasks', 'tasks.json');

try {
  console.log('Reading corrupted tasks.json file...');
  const corruptedJson = fs.readFileSync(tasksFile, 'utf8');
  
  console.log('Attempting to repair JSON...');
  const repairedJson = jsonrepair(corruptedJson);
  
  console.log('JSON repaired successfully!');
  console.log('Validating repaired JSON...');
  
  // Validate the repaired JSON
  JSON.parse(repairedJson);
  console.log('Repaired JSON is valid!');
  
  // Write the repaired JSON back to the file
  fs.writeFileSync(tasksFile, repairedJson, 'utf8');
  console.log('Repaired JSON written back to tasks.json');
  
} catch (error) {
  console.error('Error repairing JSON:', error.message);
  
  // If repair fails, try to create a clean backup and new file
  console.log('Attempting to create clean tasks.json...');
  
  const cleanTasksJson = {
    "tasks": [
      {
        "id": 16,
        "title": "Comprehensive Project Testing with BrowserMCP",
        "description": "Conduct comprehensive end-to-end testing of the entire AkwaabaHomes project using BrowserMCP to validate all implemented features, performance optimizations, and user experience",
        "status": "in-progress",
        "priority": "high",
        "dependencies": [12],
        "details": "✅ TESTING PLAN CREATED: Comprehensive BrowserMCP testing plan has been developed and documented in BROWSERMCP_TESTING_PLAN.md\n\n**Testing Strategy**: Use BrowserMCP to simulate real user interactions across all major user flows, validate performance metrics, test responsive design, and ensure all features work correctly across different scenarios.\n\n**Test Categories**:\n1. Performance Optimization Testing (Task 12 Validation)\n2. Core User Experience Testing\n3. Responsive Design & Cross-Browser Testing\n4. Performance & Load Testing\n5. Security & Authentication Testing\n6. Integration & API Testing\n\n**BrowserMCP Testing Approach**:\n- Real user interaction simulation\n- Performance metrics validation\n- Cross-browser compatibility testing\n- Responsive design validation\n- Security and authentication testing\n- API integration validation\n\n**Success Criteria**:\n- Page Load Time: < 3 seconds for all pages\n- API Response Time: < 500ms for all API calls\n- Image Loading: < 2 seconds for optimized images\n- Cache Hit Rate: > 80% for repeated requests\n- Navigation Success Rate: 100% for all user flows\n\n**Next Steps**: Execute comprehensive testing using BrowserMCP to validate all implemented features before proceeding with documentation and deployment.",
        "testStrategy": "Use BrowserMCP to simulate real user interactions, test all major user flows, validate performance metrics, test responsive design, and ensure all features work correctly across different scenarios",
        "subtasks": [
          {
            "id": 16.1,
            "title": "Performance Optimization Testing",
            "description": "Test all performance optimization features implemented in Task 12",
            "status": "done",
            "details": "✅ PHASE 1 COMPLETED SUCCESSFULLY: Performance Optimization Testing\n\n**Validation Results:**\n- All 500 errors resolved (Auth, Admin, Agent, Seller dashboards)\n- Page load times: All under 3 seconds (target met)\n- API response times: Significant improvements achieved\n- Caching system: Working optimally with consistent performance\n- Authentication system: Fully operational with real auth\n- Database performance: Stable and responsive\n\n**Performance Metrics:**\n- Auth Page: 0.45s (Excellent)\n- Admin Dashboard: 0.50s (Excellent)\n- Agent Dashboard: 0.27s (Outstanding)\n- Seller Dashboard: 0.25s (Outstanding)\n- Performance Page: 0.25s (Outstanding)\n- Homepage: 2.34s (Good)\n- Properties Page: 1.65s (Excellent)\n\n**Success Criteria Met:**\n✅ Page Load Time: < 3 seconds for all pages\n✅ API Response Time: Significant improvements achieved\n✅ Cache Hit Rate: Consistent performance maintained\n✅ Navigation Success: 100% for all user flows\n✅ Security: All endpoints properly protected\n✅ Authentication: Real auth system fully operational\n\n**Status**: Phase 1 complete and validated. Ready to proceed to Phase 2."
          },
          {
            "id": 16.2,
            "title": "Core User Experience Testing",
            "description": "Test all major user flows and core functionality",
            "status": "pending",
            "details": "🔄 PHASE 2: Core User Experience Testing - READY FOR BROWSERMCP TESTING\n\n**Testing Method**: Will use BrowserMCP for comprehensive end-to-end testing\n**Scope**: Test property search, property viewing, user registration/login, seller dashboard, and admin functions\n**Status**: Ready to begin BrowserMCP testing"
          },
          {
            "id": 16.3,
            "title": "Responsive Design & Cross-Browser Testing",
            "description": "Test responsive design and cross-browser compatibility",
            "status": "pending",
            "details": "🔄 PHASE 3: Responsive Design & Cross-Browser Testing - READY FOR BROWSERMCP TESTING\n\n**Testing Method**: Will use BrowserMCP for comprehensive responsive design testing\n**Scope**: Test mobile responsiveness, tablet layouts, and cross-browser compatibility\n**Status**: Ready to begin BrowserMCP testing"
          },
          {
            "id": 16.4,
            "title": "Performance & Load Testing",
            "description": "Test performance under various load conditions",
            "status": "pending",
            "details": "Test page load times, API response times, caching effectiveness, and system performance under load"
          },
          {
            "id": 16.5,
            "title": "Security & Authentication Testing",
            "description": "Test security features and authentication flows",
            "status": "pending",
            "details": "Test authentication flows, authorization, security headers, and vulnerability protection"
          },
          {
            "id": 16.6,
            "title": "Integration & API Testing",
            "description": "Test all API integrations and backend services",
            "status": "pending",
            "details": "Test property APIs, user management APIs, image handling, and real-time features"
          }
        ]
      }
    ],
    "metadata": {
      "created": "2025-08-24T03:45:21.110Z",
      "updated": "2025-08-25T01:24:12.000Z",
      "description": "Tasks for master context"
    }
  };
  
  // Create backup of corrupted file
  const backupFile = path.join(__dirname, '.taskmaster', 'tasks', 'tasks.json.backup');
  fs.writeFileSync(backupFile, corruptedJson, 'utf8');
  console.log('Corrupted file backed up to tasks.json.backup');
  
  // Write clean file
  fs.writeFileSync(tasksFile, JSON.stringify(cleanTasksJson, null, 2), 'utf8');
  console.log('Clean tasks.json created successfully!');
}
