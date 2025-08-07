const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#4A90E2';
  ctx.fillRect(0, 0, size, size);
  
  // Circle border
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.4, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.25}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ABC', size/2, size/2);
  
  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join('client/public', filename), buffer);
  console.log(`Created ${filename} (${size}x${size})`);
}

// Create icons
createIcon(192, 'icon-192.png');
createIcon(512, 'icon-512.png');

console.log('Icons created successfully!');