const fs = require('fs');
const path = require('path');
const { convertHtmlToPng, deviceConfigs } = require('./convert-to-png');

async function generateAll() {
    console.log('Starting batch generation...\n');

    // Automatically scan templates directory
    const templatesDir = path.join(process.cwd(), 'templates');

    if (!fs.existsSync(templatesDir)) {
        console.error(`Templates directory does not exist: ${templatesDir}`);
        process.exit(1);
    }

    // Read all .html files from templates directory
    const allFiles = fs.readdirSync(templatesDir);
    const templateFiles = allFiles.filter(file => file.endsWith('.html'));

    if (templateFiles.length === 0) {
        console.error('No .html files found in templates directory');
        process.exit(1);
    }

    console.log(`Found ${templateFiles.length} template(s):`);
    templateFiles.forEach(file => console.log(`  - ${file}`));
    console.log('');

    // Define supported devices
    const devices = Object.keys(deviceConfigs);

    console.log(`Generating for ${devices.length} device(s): ${devices.join(', ')}\n`);

    // Generate all combinations
    let successCount = 0;
    let failCount = 0;

    for (const templateFile of templateFiles) {
        for (const deviceId of devices) {
            const htmlPath = path.join(templatesDir, templateFile);

            try {
                console.log(`Generating: ${templateFile} for ${deviceId}...`);
                await convertHtmlToPng(htmlPath, deviceId);
                successCount++;
            } catch (error) {
                console.error(`Failed to generate ${templateFile} for ${deviceId}:`, error.message);
                failCount++;
            }

            console.log('');
        }
    }

    // Summary
    console.log('='.repeat(50));
    console.log('Generation Summary:');
    console.log(`  Total: ${successCount + failCount}`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failed: ${failCount}`);
    console.log('='.repeat(50));

    if (failCount > 0) {
        process.exit(1);
    }
}

// Run generation
generateAll().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
