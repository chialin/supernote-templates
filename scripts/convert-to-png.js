const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Device configurations
const deviceConfigs = {
    nomad: { width: 1404, height: 1872 },
    manta: { width: 1920, height: 2560 }
};

async function convertHtmlToPng(htmlPath, deviceId) {
    // Validate device ID
    if (!deviceConfigs[deviceId]) {
        console.error(`Invalid device ID: ${deviceId}`);
        console.error(`Available devices: ${Object.keys(deviceConfigs).join(', ')}`);
        process.exit(1);
    }

    const config = deviceConfigs[deviceId];

    // Resolve HTML path
    const resolvedHtmlPath = path.isAbsolute(htmlPath)
        ? htmlPath
        : path.join(process.cwd(), htmlPath);

    // Verify HTML file exists
    if (!fs.existsSync(resolvedHtmlPath)) {
        console.error(`HTML file does not exist: ${resolvedHtmlPath}`);
        process.exit(1);
    }

    // Generate output path
    const templateName = path.basename(resolvedHtmlPath, '.html');
    const outputDir = path.join(process.cwd(), 'dist', deviceId);
    const outputPath = path.join(outputDir, `${templateName}.png`);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set viewport size based on device configuration
        await page.setViewport({
            width: config.width,
            height: config.height,
            deviceScaleFactor: 1,
        });

        // Load HTML file
        const fileUrl = `file://${resolvedHtmlPath}`;
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });

        // Wait for dynamic JavaScript rendering to complete (if page uses it)
        // Check if page has a render-complete flag
        try {
            await page.waitForFunction(() => {
                return document.body.getAttribute('data-render-complete') === 'true';
            }, { timeout: 5000 });
            console.log('  Dynamic rendering completed');
        } catch (error) {
            // If timeout, page doesn't use dynamic rendering - that's fine
            console.log('  No dynamic rendering detected (or timeout)');
        }

        // Take screenshot with device-specific dimensions
        await page.screenshot({
            path: outputPath,
            width: config.width,
            height: config.height,
            clip: {
                x: 0,
                y: 0,
                width: config.width,
                height: config.height,
            },
        });

        console.log(`✓ PNG generated successfully: ${outputPath}`);
        console.log(`  Device: ${deviceId} (${config.width} x ${config.height} px)`);
    } catch (error) {
        console.error('Conversion failed:', error);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: node convert-to-png.js <htmlPath> <deviceId>');
        console.error('Example: node convert-to-png.js templates/daily-tasks.html nomad');
        console.error(`Available devices: ${Object.keys(deviceConfigs).join(', ')}`);
        process.exit(1);
    }

    const [htmlPath, deviceId] = args;
    convertHtmlToPng(htmlPath, deviceId);
}

// Export for use in other scripts
module.exports = { convertHtmlToPng, deviceConfigs };
