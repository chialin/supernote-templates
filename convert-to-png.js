const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function convertHtmlToPng() {
    const htmlPath = path.join(__dirname, 'daily-tasks.html');
    const outputPath = path.join(__dirname, 'daily-tasks.png');

    // 驗證 HTML 檔案存在
    if (!fs.existsSync(htmlPath)) {
        console.error(`HTML 檔案不存在: ${htmlPath}`);
        process.exit(1);
    }

    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        // 設置視口大小為目標尺寸
        await page.setViewport({
            width: 1404,
            height: 1872,
            deviceScaleFactor: 1,
        });

        // 載入 HTML 檔案
        const fileUrl = `file://${htmlPath}`;
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });

        // 截圖，尺寸為 1404 x 1872
        await page.screenshot({
            path: outputPath,
            width: 1404,
            height: 1872,
            clip: {
                x: 0,
                y: 0,
                width: 1404,
                height: 1872,
            },
        });

        console.log(`✓ PNG 已成功生成: ${outputPath}`);
        console.log(`  尺寸: 1404 x 1872 px`);
    } catch (error) {
        console.error('轉換失敗:', error);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

convertHtmlToPng();
