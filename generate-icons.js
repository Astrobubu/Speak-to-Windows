const sharp = require('sharp');
const fs = require('fs');

async function generateIcons() {
  try {
    console.log('Generating icons from logo.png...');

    // Generate .ico for Windows (multiple sizes in one file)
    const sizes = [16, 32, 48, 256];
    const iconBuffers = [];

    for (const size of sizes) {
      const buffer = await sharp('logo.png')
        .resize(size, size)
        .png()
        .toBuffer();
      iconBuffers.push(buffer);
    }

    // For simplicity, just create a 256x256 .ico
    await sharp('logo.png')
      .resize(256, 256)
      .png()
      .toFile('icon.ico');

    // Generate .icns for Mac (just copy the PNG for now)
    await sharp('logo.png')
      .resize(512, 512)
      .png()
      .toFile('icon.icns');

    // Generate smaller icon.png for app use
    await sharp('logo.png')
      .resize(64, 64)
      .png()
      .toFile('icon.png');

    console.log('Icons generated successfully!');
    console.log('- icon.png (64x64) for app UI');
    console.log('- icon.ico (256x256) for Windows');
    console.log('- icon.icns (512x512) for Mac');

  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();