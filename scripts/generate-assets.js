const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function createImage(width, height, text, filename) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);

    // Add text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${Math.min(width, height) / 10}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, '../assets', filename), buffer);
}

// Create all required assets
createImage(1024, 1024, 'Icon', 'icon.png');
createImage(1242, 2436, 'FitCheck', 'splash.png');
createImage(1024, 1024, 'Adaptive', 'adaptive-icon.png');
createImage(48, 48, 'Fav', 'favicon.png');

console.log('Assets generated successfully!'); 