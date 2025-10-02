#!/usr/bin/env node

/**
 * Create PNG icons using Canvas API
 * This script generates all required PWA icons
 */

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Icon sizes required for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Check if canvas is available
let Canvas;
try {
  Canvas = require('canvas');
} catch (error) {
  console.log('Canvas not available. Creating placeholder icons...');
  createPlaceholderIcons();
  process.exit(0);
}

function createIcon(size) {
  const canvas = Canvas.createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background circle with Ghana flag colors
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#00A86B'); // Green
  gradient.addColorStop(0.5, '#FFD700'); // Gold
  gradient.addColorStop(1, '#C21807'); // Red
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 8, 0, 2 * Math.PI);
  ctx.fill();
  
  // White border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // House icon
  const houseSize = size * 0.4;
  const houseX = size/2;
  const houseY = size/2;
  
  // House base
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(houseX - houseSize/2, houseY - houseSize/4, houseSize, houseSize/2);
  
  // Roof
  ctx.fillStyle = '#C21807';
  ctx.beginPath();
  ctx.moveTo(houseX - houseSize/2, houseY - houseSize/4);
  ctx.lineTo(houseX, houseY - houseSize/2);
  ctx.lineTo(houseX + houseSize/2, houseY - houseSize/4);
  ctx.lineTo(houseX + houseSize/2 - 10, houseY - houseSize/4);
  ctx.lineTo(houseX - houseSize/2 + 10, houseY - houseSize/4);
  ctx.closePath();
  ctx.fill();
  
  // Door
  ctx.fillStyle = '#00A86B';
  ctx.fillRect(houseX - 10, houseY - 5, 20, 30);
  
  // Windows
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(houseX - 25, houseY - 15, 15, 15);
  ctx.fillRect(houseX + 10, houseY - 15, 15, 15);
  
  // Ghana star
  const starSize = size * 0.08;
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.translate(houseX, houseY - houseSize/2 - 10);
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5;
    const x = Math.cos(angle) * starSize;
    const y = Math.sin(angle) * starSize;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.translate(-houseX, -(houseY - houseSize/2 - 10));
  
  return canvas.toBuffer('image/png');
}

function createPlaceholderIcons() {
  console.log('Creating placeholder icon files...');
  
  iconSizes.forEach(size => {
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(iconsDir, filename);
    
    // Create a simple placeholder file
    const placeholder = Buffer.from('PNG_PLACEHOLDER');
    fs.writeFileSync(filepath, placeholder);
    console.log(`Created placeholder: ${filename}`);
  });
  
  // Create other required icons
  const otherIcons = [
    'search-shortcut.png',
    'featured-shortcut.png', 
    'diaspora-shortcut.png',
    'view-action.png',
    'dismiss-action.png',
    'badge-72x72.png'
  ];
  
  otherIcons.forEach(filename => {
    const filepath = path.join(iconsDir, filename);
    const placeholder = Buffer.from('PNG_PLACEHOLDER');
    fs.writeFileSync(filepath, placeholder);
    console.log(`Created placeholder: ${filename}`);
  });
  
  console.log('\n📋 To complete icon generation:');
  console.log('1. Install canvas: npm install canvas');
  console.log('2. Run: node scripts/create-png-icons.js');
  console.log('3. Or use an online SVG to PNG converter');
}

function createPNGIcons() {
  console.log('Creating PNG icons with Canvas...');
  
  iconSizes.forEach(size => {
    try {
      const iconBuffer = createIcon(size);
      const filename = `icon-${size}x${size}.png`;
      const filepath = path.join(iconsDir, filename);
      
      fs.writeFileSync(filepath, iconBuffer);
      console.log(`✅ Created ${filename} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to create icon-${size}x${size}.png:`, error.message);
    }
  });
  
  console.log('\n🎨 PNG icon generation complete!');
}

// Run the appropriate function
if (Canvas) {
  createPNGIcons();
} else {
  createPlaceholderIcons();
}
