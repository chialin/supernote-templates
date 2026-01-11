const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { convertHtmlToPng, deviceConfigs } = require('./convert-to-png');

// Supported locales for i18n metadata
const SUPPORTED_LOCALES = ['en', 'zh-TW', 'ja'];

/**
 * Extract metadata from HTML template using cheerio
 * @param {string} htmlPath - Path to the HTML template file
 * @returns {object} - Extracted metadata object
 * @throws {Error} - If required meta tags are missing
 */
function extractMetadata(htmlPath) {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const $ = cheerio.load(html);
    const templateId = path.basename(htmlPath, '.html');

    const metadata = {
        id: templateId,
        i18n: {}
    };

    const missingTags = [];

    // Extract localized metadata for each supported locale
    SUPPORTED_LOCALES.forEach(locale => {
        const name = $(`meta[name="template:name:${locale}"]`).attr('content');
        const description = $(`meta[name="template:description:${locale}"]`).attr('content');

        // Track missing required tags
        if (!name) {
            missingTags.push(`template:name:${locale}`);
        }
        if (!description) {
            missingTags.push(`template:description:${locale}`);
        }

        metadata.i18n[locale] = {
            name: name || '',
            description: description || ''
        };
    });

    // Throw error if any required meta tags are missing
    if (missingTags.length > 0) {
        throw new Error(
            `Template "${templateId}" is missing required meta tags:\n` +
            missingTags.map(tag => `  - ${tag}`).join('\n')
        );
    }

    return metadata;
}

/**
 * Generate templates.json from all template metadata
 * @param {string[]} templateFiles - List of template HTML filenames
 * @param {string} templatesDir - Path to templates directory
 * @param {string[]} devices - List of supported device IDs
 * @returns {object} - templates.json data structure
 */
function generateTemplatesJson(templateFiles, templatesDir, devices) {
    const templates = [];

    for (const templateFile of templateFiles) {
        const htmlPath = path.join(templatesDir, templateFile);
        const metadata = extractMetadata(htmlPath);

        templates.push({
            id: metadata.id,
            devices: devices,
            i18n: metadata.i18n
        });
    }

    return {
        version: 1,
        templates: templates
    };
}

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

    // First, validate all templates have required metadata
    console.log('Validating template metadata...');
    try {
        const templatesJsonData = generateTemplatesJson(templateFiles, templatesDir, devices);
        console.log('All templates have valid metadata.\n');

        // Write templates.json to dist directory
        const distDir = path.join(process.cwd(), 'dist');
        if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir, { recursive: true });
        }
        const templatesJsonPath = path.join(distDir, 'templates.json');
        fs.writeFileSync(templatesJsonPath, JSON.stringify(templatesJsonData, null, 2), 'utf-8');
        console.log(`Generated: ${templatesJsonPath}\n`);
    } catch (error) {
        console.error('Metadata validation failed:');
        console.error(error.message);
        process.exit(1);
    }

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
