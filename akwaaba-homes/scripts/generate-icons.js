#!/usr/bin/env node

/**
 * Icon Generation Script for AkwaabaHomes PWA
 * Generates all required app icons from a base SVG
 */

const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Base SVG icon with Ghana theme
const baseIconSVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background with Ghana flag colors -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00A86B;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#C21807;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="house" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F0F0F0;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#bg)" stroke="#FFFFFF" stroke-width="8"/>
  
  <!-- House icon -->
  <g transform="translate(256, 256)">
    <!-- House base -->
    <rect x="-80" y="-20" width="160" height="100" fill="url(#house)" rx="8"/>
    
    <!-- Roof -->
    <polygon points="-100,-40 0,-80 100,-40 80,-20 -80,-20" fill="#C21807" stroke="#FFFFFF" stroke-width="2"/>
    
    <!-- Door -->
    <rect x="-20" y="20" width="40" height="60" fill="#00A86B" rx="4"/>
    <circle cx="-5" cy="50" r="3" fill="#FFD700"/>
    
    <!-- Windows -->
    <rect x="-60" y="10" width="25" height="25" fill="#FFD700" rx="3"/>
    <rect x="35" y="10" width="25" height="25" fill="#FFD700" rx="3"/>
    
    <!-- Window frames -->
    <line x1="-47.5" y1="10" x2="-47.5" y2="35" stroke="#C21807" stroke-width="1"/>
    <line x1="-60" y1="22.5" x2="-35" y2="22.5" stroke="#C21807" stroke-width="1"/>
    <line x1="47.5" y1="10" x2="47.5" y2="35" stroke="#C21807" stroke-width="1"/>
    <line x1="35" y1="22.5" x2="60" y2="22.5" stroke="#C21807" stroke-width="1"/>
    
    <!-- Chimney -->
    <rect x="50" y="-60" width="15" height="25" fill="#C21807"/>
    
    <!-- Ghana star -->
    <g transform="translate(0, -100)">
      <polygon points="0,-15 4,-5 14,-5 6,2 9,12 0,7 -9,12 -6,2 -14,-5 -4,-5" fill="#FFD700"/>
    </g>
  </g>
  
  <!-- Text -->
  <text x="256" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF">Akwaaba</text>
  <text x="256" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#FFFFFF">Homes</text>
</svg>
`;

// Icon sizes required for PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// Shortcut icons
const shortcutIcons = [
  { name: 'search-shortcut.png', icon: '🔍' },
  { name: 'featured-shortcut.png', icon: '⭐' },
  { name: 'diaspora-shortcut.png', icon: '🌍' }
];

// Action icons for notifications
const actionIcons = [
  { name: 'view-action.png', icon: '👁️' },
  { name: 'dismiss-action.png', icon: '❌' }
];

// Badge icon
const badgeIcon = { name: 'badge-72x72.png', icon: '🏠' };

console.log('🏠 Generating AkwaabaHomes PWA Icons...\n');

// Save base SVG
const svgPath = path.join(iconsDir, 'base-icon.svg');
fs.writeFileSync(svgPath, baseIconSVG);
console.log('✅ Base SVG icon created');

// Generate PNG icons (this would require a library like sharp or canvas)
// For now, we'll create placeholder files and instructions
iconSizes.forEach(({ size, name }) => {
  const filePath = path.join(iconsDir, name);
  
  // Create a simple HTML file that can be used to generate PNGs
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; }
    svg { width: ${size}px; height: ${size}px; }
  </style>
</head>
<body>
  ${baseIconSVG}
</body>
</html>
  `;
  
  const htmlPath = path.join(iconsDir, `${name.replace('.png', '.html')}`);
  fs.writeFileSync(htmlPath, htmlContent);
  
  console.log(`📱 Created ${name} template (${size}x${size})`);
});

// Create shortcut icons
shortcutIcons.forEach(({ name, icon }) => {
  const shortcutSVG = `
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <circle cx="48" cy="48" r="40" fill="#00A86B"/>
  <text x="48" y="60" text-anchor="middle" font-size="40">${icon}</text>
</svg>
  `;
  
  const filePath = path.join(iconsDir, name);
  fs.writeFileSync(filePath.replace('.png', '.svg'), shortcutSVG);
  console.log(`🔗 Created ${name} shortcut icon`);
});

// Create action icons
actionIcons.forEach(({ name, icon }) => {
  const actionSVG = `
<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" fill="#C21807"/>
  <text x="12" y="16" text-anchor="middle" font-size="12" fill="white">${icon}</text>
</svg>
  `;
  
  const filePath = path.join(iconsDir, name);
  fs.writeFileSync(filePath.replace('.png', '.svg'), actionSVG);
  console.log(`⚡ Created ${name} action icon`);
});

// Create badge icon
const badgeSVG = `
<svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
  <circle cx="36" cy="36" r="30" fill="#C21807"/>
  <text x="36" y="45" text-anchor="middle" font-size="30">🏠</text>
</svg>
`;

fs.writeFileSync(path.join(iconsDir, 'badge-72x72.svg'), badgeSVG);
console.log('🏆 Created badge icon');

console.log('\n📋 Next Steps:');
console.log('1. Convert SVG files to PNG using an online converter or tool like Inkscape');
console.log('2. Use the HTML files to generate PNG icons at the correct sizes');
console.log('3. Place all PNG files in the /public/icons/ directory');
console.log('\n🎨 Icon Generation Complete!');

// Create a simple conversion script
const conversionScript = `
#!/bin/bash
# Convert SVG icons to PNG using Inkscape (if available)

echo "Converting SVG icons to PNG..."

# Check if Inkscape is available
if command -v inkscape &> /dev/null; then
    echo "Using Inkscape for conversion..."
    
    # Convert main icons
    for size in 72 96 128 144 152 192 384 512; do
        inkscape --export-type=png --export-filename=icon-\${size}x\${size}.png --export-width=\${size} --export-height=\${size} base-icon.svg
    done
    
    # Convert shortcut icons
    inkscape --export-type=png --export-filename=search-shortcut.png --export-width=96 --export-height=96 search-shortcut.svg
    inkscape --export-type=png --export-filename=featured-shortcut.png --export-width=96 --export-height=96 featured-shortcut.svg
    inkscape --export-type=png --export-filename=diaspora-shortcut.png --export-width=96 --export-height=96 diaspora-shortcut.svg
    
    # Convert action icons
    inkscape --export-type=png --export-filename=view-action.png --export-width=24 --export-height=24 view-action.svg
    inkscape --export-type=png --export-filename=dismiss-action.png --export-width=24 --export-height=24 dismiss-action.svg
    
    # Convert badge
    inkscape --export-type=png --export-filename=badge-72x72.png --export-width=72 --export-height=72 badge-72x72.svg
    
    echo "✅ All icons converted successfully!"
else
    echo "❌ Inkscape not found. Please install Inkscape or use an online converter."
    echo "Visit: https://convertio.co/svg-png/ or similar online tool"
fi
`;

fs.writeFileSync(path.join(iconsDir, 'convert-icons.sh'), conversionScript);
console.log('📜 Created conversion script: convert-icons.sh');
