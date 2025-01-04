const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create a 1242x2436 canvas (iPhone X dimensions)
const canvas = createCanvas(1242, 2436);
const ctx = canvas.getContext('2d');

// Fill background
ctx.fillStyle = '#0d1117';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Add text
ctx.fillStyle = 'white';
ctx.font = 'bold 72px Arial';
ctx.textAlign = 'center';
ctx.fillText('FitCheck', canvas.width / 2, canvas.height / 2);

// Save the image
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, '../assets/splash.png'), buffer); 