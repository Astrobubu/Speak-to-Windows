const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  try {
    console.log('Generating icons from logo.png...');

    // Generate proper .png icon for app use
    await sharp('logo.png')
      .resize(64, 64)
      .png()
      .toFile('icon.png');
    
    console.log('✓ Generated icon.png (64x64) for app UI');

    // Generate PNG files for build directory
    const buildDir = 'build';
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir);
    }

    // Generate multiple sizes for proper icon files
    const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];
    
    for (const size of sizes) {
      await sharp('logo.png')
        .resize(size, size)
        .png()
        .toFile(path.join(buildDir, `icon-${size}x${size}.png`));
    }

    // Copy the original icon files that were working
    console.log('\nNOTE: For proper .ico and .icns files, please use:');
    console.log('1. Online converter like https://convertio.co/png-ico/ for .ico');
    console.log('2. Online converter like https://convertio.co/png-icns/ for .icns');
    console.log('\nOr use the create-icon.html tool in the browser for better results.');
    
    console.log('\n✓ Generated PNG files in build/ directory');
    console.log('PNG files generated for sizes:', sizes.join(', '));

  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();