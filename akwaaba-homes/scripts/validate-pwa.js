#!/usr/bin/env node

/**
 * PWA Validation Script for AkwaabaHomes
 * Validates PWA compliance and generates a report
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating AkwaabaHomes PWA...\n');

const validationResults = {
  timestamp: new Date().toISOString(),
  score: 0,
  totalChecks: 0,
  passedChecks: 0,
  failedChecks: 0,
  details: []
};

function addCheck(name, passed, message, critical = false) {
  validationResults.totalChecks++;
  if (passed) {
    validationResults.passedChecks++;
    console.log(`✅ ${name}: ${message}`);
  } else {
    validationResults.failedChecks++;
    console.log(`❌ ${name}: ${message}`);
  }
  
  validationResults.details.push({
    name,
    passed,
    message,
    critical
  });
}

// 1. Check manifest.json
console.log('📋 Checking manifest.json...');
try {
  const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  addCheck('Manifest exists', true, 'manifest.json found');
  addCheck('Manifest name', !!manifest.name, manifest.name ? 'App name defined' : 'App name missing', true);
  addCheck('Manifest short_name', !!manifest.short_name, manifest.short_name ? 'Short name defined' : 'Short name missing', true);
  addCheck('Manifest start_url', !!manifest.start_url, manifest.start_url ? 'Start URL defined' : 'Start URL missing', true);
  addCheck('Manifest display', manifest.display === 'standalone', 'Display mode set to standalone', true);
  addCheck('Manifest theme_color', !!manifest.theme_color, manifest.theme_color ? 'Theme color defined' : 'Theme color missing', true);
  addCheck('Manifest background_color', !!manifest.background_color, manifest.background_color ? 'Background color defined' : 'Background color missing', true);
  addCheck('Manifest icons', manifest.icons && manifest.icons.length > 0, `Found ${manifest.icons?.length || 0} icons`, true);
  
  // Check for required icon sizes
  const requiredSizes = [192, 512];
  const iconSizes = manifest.icons?.map(icon => parseInt(icon.sizes?.split('x')[0])).filter(Boolean) || [];
  const hasRequiredSizes = requiredSizes.every(size => iconSizes.includes(size));
  addCheck('Required icon sizes', hasRequiredSizes, `Has 192x192 and 512x512 icons: ${hasRequiredSizes}`, true);
  
} catch (error) {
  addCheck('Manifest exists', false, `Error reading manifest.json: ${error.message}`, true);
}

// 2. Check service worker
console.log('\n🔧 Checking service worker...');
const swPath = path.join(__dirname, '..', 'public', 'sw.js');
addCheck('Service worker exists', fs.existsSync(swPath), 'sw.js found', true);

if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  addCheck('Service worker has install event', swContent.includes('install'), 'Install event handler found');
  addCheck('Service worker has activate event', swContent.includes('activate'), 'Activate event handler found');
  addCheck('Service worker has fetch event', swContent.includes('fetch'), 'Fetch event handler found');
  addCheck('Service worker has cache strategy', swContent.includes('cache'), 'Caching strategy implemented');
}

// 3. Check offline page
console.log('\n📱 Checking offline support...');
const offlinePath = path.join(__dirname, '..', 'public', 'offline.html');
addCheck('Offline page exists', fs.existsSync(offlinePath), 'offline.html found', true);

// 4. Check icons
console.log('\n🎨 Checking app icons...');
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
addCheck('Icons directory exists', fs.existsSync(iconsDir), 'Icons directory found', true);

if (fs.existsSync(iconsDir)) {
  const iconFiles = fs.readdirSync(iconsDir);
  const requiredIcons = [
    'icon-72x72.png',
    'icon-96x96.png',
    'icon-128x128.png',
    'icon-144x144.png',
    'icon-152x152.png',
    'icon-192x192.png',
    'icon-384x384.png',
    'icon-512x512.png'
  ];
  
  requiredIcons.forEach(icon => {
    addCheck(`Icon ${icon}`, iconFiles.includes(icon), iconFiles.includes(icon) ? 'Found' : 'Missing', true);
  });
}

// 5. Check PWA meta tags in layout
console.log('\n🏷️ Checking PWA meta tags...');
try {
  const layoutPath = path.join(__dirname, '..', 'src', 'app', 'layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  addCheck('Manifest link', layoutContent.includes('rel="manifest"'), 'Manifest link found', true);
  addCheck('Theme color meta', layoutContent.includes('theme-color'), 'Theme color meta tag found', true);
  addCheck('Apple touch icon', layoutContent.includes('apple-touch-icon'), 'Apple touch icon link found', true);
  addCheck('Viewport meta', layoutContent.includes('viewport'), 'Viewport meta tag found', true);
  addCheck('Mobile web app capable', layoutContent.includes('mobile-web-app-capable'), 'Mobile web app capable meta found', true);
  
} catch (error) {
  addCheck('Layout file exists', false, `Error reading layout.tsx: ${error.message}`, true);
}

// 6. Check PWA components
console.log('\n🧩 Checking PWA components...');
const pwaComponents = [
  'src/components/pwa/ServiceWorkerRegistration.tsx',
  'src/components/pwa/PWAInstallPrompt.tsx',
  'src/components/pwa/SplashScreen.tsx',
  'src/components/pwa/PushNotifications.tsx'
];

pwaComponents.forEach(component => {
  const componentPath = path.join(__dirname, '..', component);
  addCheck(`Component ${component.split('/').pop()}`, fs.existsSync(componentPath), fs.existsSync(componentPath) ? 'Found' : 'Missing');
});

// 7. Check TWA configuration
console.log('\n📱 Checking TWA configuration...');
const twaConfigPath = path.join(__dirname, '..', 'twa-config.json');
addCheck('TWA config exists', fs.existsSync(twaConfigPath), 'twa-config.json found');

if (fs.existsSync(twaConfigPath)) {
  try {
    const twaConfig = JSON.parse(fs.readFileSync(twaConfigPath, 'utf8'));
    addCheck('TWA package ID', !!twaConfig.packageId, 'Package ID defined');
    addCheck('TWA host', !!twaConfig.host, 'Host defined');
    addCheck('TWA theme color', !!twaConfig.themeColor, 'Theme color defined');
  } catch (error) {
    addCheck('TWA config valid', false, `Error parsing twa-config.json: ${error.message}`);
  }
}

// 8. Check browser config
console.log('\n🌐 Checking browser configuration...');
const browserConfigPath = path.join(__dirname, '..', 'public', 'browserconfig.xml');
addCheck('Browser config exists', fs.existsSync(browserConfigPath), 'browserconfig.xml found');

// Calculate score
validationResults.score = Math.round((validationResults.passedChecks / validationResults.totalChecks) * 100);

console.log('\n📊 Validation Results:');
console.log(`Score: ${validationResults.score}%`);
console.log(`Passed: ${validationResults.passedChecks}/${validationResults.totalChecks}`);
console.log(`Failed: ${validationResults.failedChecks}/${validationResults.totalChecks}`);

// Check for critical failures
const criticalFailures = validationResults.details.filter(check => !check.passed && check.critical);
if (criticalFailures.length > 0) {
  console.log('\n❌ Critical Issues Found:');
  criticalFailures.forEach(check => {
    console.log(`- ${check.name}: ${check.message}`);
  });
  console.log('\nPlease fix these issues before deploying the PWA.');
} else {
  console.log('\n✅ No critical issues found!');
}

// PWA compliance recommendations
console.log('\n💡 PWA Compliance Recommendations:');
if (validationResults.score >= 90) {
  console.log('🎉 Excellent! Your PWA is highly compliant.');
} else if (validationResults.score >= 70) {
  console.log('👍 Good! Your PWA is mostly compliant with minor improvements needed.');
} else if (validationResults.score >= 50) {
  console.log('⚠️ Fair. Your PWA needs several improvements for full compliance.');
} else {
  console.log('❌ Poor. Your PWA needs significant work to be compliant.');
}

console.log('\n📋 Next Steps:');
console.log('1. Fix any critical issues identified above');
console.log('2. Test PWA functionality on mobile devices');
console.log('3. Run Lighthouse audit for detailed PWA score');
console.log('4. Deploy to production and test installation');

// Save validation report
const reportPath = path.join(__dirname, '..', 'pwa-validation-report.json');
fs.writeFileSync(reportPath, JSON.stringify(validationResults, null, 2));
console.log(`\n📄 Detailed report saved: pwa-validation-report.json`);

// Exit with error code if critical failures
if (criticalFailures.length > 0) {
  process.exit(1);
}




