#!/usr/bin/env node

/**
 * Create simple PNG icons using base64 encoded data
 */

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Simple 1x1 PNG with Ghana colors (base64 encoded)
const createSimplePNG = (size, color) => {
  // This is a minimal PNG with the specified color
  const canvas = Buffer.alloc(size * size * 4);
  for (let i = 0; i < canvas.length; i += 4) {
    if (color === 'green') {
      canvas[i] = 0;     // R
      canvas[i + 1] = 168; // G  
      canvas[i + 2] = 107; // B
      canvas[i + 3] = 255; // A
    } else if (color === 'gold') {
      canvas[i] = 255;     // R
      canvas[i + 1] = 215; // G
      canvas[i + 2] = 0;   // B
      canvas[i + 3] = 255; // A
    } else if (color === 'red') {
      canvas[i] = 194;     // R
      canvas[i + 1] = 24;  // G
      canvas[i + 2] = 7;   // B
      canvas[i + 3] = 255; // A
    }
  }
  return canvas;
};

// Create a simple colored square PNG
const createColoredSquare = (size, color) => {
  // Create a simple PNG header and data
  const width = size;
  const height = size;
  
  // PNG signature
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  
  const ihdrCrc = crc32(ihdr);
  const ihdrChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 13]), // length
    Buffer.from('IHDR'),
    ihdr,
    Buffer.from([
      (ihdrCrc >> 24) & 0xFF,
      (ihdrCrc >> 16) & 0xFF,
      (ihdrCrc >> 8) & 0xFF,
      ihdrCrc & 0xFF
    ])
  ]);
  
  // IDAT chunk (image data)
  const rowSize = width * 3 + 1;
  const imageData = Buffer.alloc(height * rowSize);
  
  for (let y = 0; y < height; y++) {
    imageData[y * rowSize] = 0; // filter type
    for (let x = 0; x < width; x++) {
      const pixelOffset = y * rowSize + 1 + x * 3;
      if (color === 'green') {
        imageData[pixelOffset] = 0;     // R
        imageData[pixelOffset + 1] = 168; // G
        imageData[pixelOffset + 2] = 107; // B
      } else if (color === 'gold') {
        imageData[pixelOffset] = 255;     // R
        imageData[pixelOffset + 1] = 215; // G
        imageData[pixelOffset + 2] = 0;   // B
      } else if (color === 'red') {
        imageData[pixelOffset] = 194;     // R
        imageData[pixelOffset + 1] = 24;  // G
        imageData[pixelOffset + 2] = 7;   // B
      }
    }
  }
  
  // Compress the image data (simple deflate)
  const compressed = deflate(imageData);
  const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), compressed]));
  const idatChunk = Buffer.concat([
    Buffer.from([
      (compressed.length >> 24) & 0xFF,
      (compressed.length >> 16) & 0xFF,
      (compressed.length >> 8) & 0xFF,
      compressed.length & 0xFF
    ]),
    Buffer.from('IDAT'),
    compressed,
    Buffer.from([
      (idatCrc >> 24) & 0xFF,
      (idatCrc >> 16) & 0xFF,
      (idatCrc >> 8) & 0xFF,
      idatCrc & 0xFF
    ])
  ]);
  
  // IEND chunk
  const iendCrc = crc32(Buffer.from('IEND'));
  const iendChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 0]), // length
    Buffer.from('IEND'),
    Buffer.from([
      (iendCrc >> 24) & 0xFF,
      (iendCrc >> 16) & 0xFF,
      (iendCrc >> 8) & 0xFF,
      iendCrc & 0xFF
    ])
  ]);
  
  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
};

// Simple CRC32 implementation
function crc32(data) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Simple deflate implementation (just return the data as-is for now)
function deflate(data) {
  return data;
}

// Create icons
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Creating simple PNG icons...');

iconSizes.forEach(size => {
  try {
    // Create a green square for the main icon
    const iconData = createColoredSquare(size, 'green');
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(iconsDir, filename);
    
    fs.writeFileSync(filepath, iconData);
    console.log(`✅ Created ${filename} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ Failed to create icon-${size}x${size}.png:`, error.message);
  }
});

// Create other required icons
const otherIcons = [
  { name: 'search-shortcut.png', color: 'gold' },
  { name: 'featured-shortcut.png', color: 'red' },
  { name: 'diaspora-shortcut.png', color: 'green' },
  { name: 'view-action.png', color: 'green' },
  { name: 'dismiss-action.png', color: 'red' },
  { name: 'badge-72x72.png', color: 'gold' }
];

otherIcons.forEach(({ name, color }) => {
  try {
    const size = name.includes('action') ? 24 : (name.includes('badge') ? 72 : 96);
    const iconData = createColoredSquare(size, color);
    const filepath = path.join(iconsDir, name);
    
    fs.writeFileSync(filepath, iconData);
    console.log(`✅ Created ${name} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ Failed to create ${name}:`, error.message);
  }
});

console.log('\n🎨 Simple PNG icon generation complete!');
console.log('Note: These are basic colored squares. For production, use proper icon design tools.');




