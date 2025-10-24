# Supernote Templates 多裝置支援架構研究

**研究日期**: 2025-10-24
**研究目標**: 評估專案如何重構以支援 Nomad 和 Manta 兩種 Supernote 裝置,並規劃可擴展的多模板生成架構

---

## 執行摘要

本研究針對 Supernote templates 生成專案進行深入分析,目標是建立支援多裝置、多模板的可擴展架構。經過技術調研和社群最佳實踐分析,我們發現當前專案存在硬編碼尺寸、缺乏配置管理、無法批次處理等問題。

研究結果顯示,透過建立配置驅動的架構、抽離共用樣式系統、實作模板引擎,可以有效解決這些問題。關鍵發現包括:

- **裝置規格已確認**: Nomad (1404×1872, 300 DPI) 和 Manta (1920×2560, 300 DPI) 具有相同 DPI 但不同尺寸,需要獨立的尺寸配置和字體縮放策略
- **架構模式選擇**: 配置驅動 + 模板引擎方案最適合未來擴展,可支援 5 種以上模板類型且維護成本低
- **HTML 方案優勢**: 相較於其他工具,HTML + Puppeteer 提供最佳的版本控制、程式化生成能力和設計靈活性

建議採用分階段實施:首先建立配置系統和目錄結構,接著抽離共用樣式,最後實作批次生成流程。

---

## 背景與脈絡

### 專案現況

本專案旨在為 Supernote 電子紙裝置生成各種 PNG 格式的模板。目前專案處於初期階段,僅完成一個針對 Nomad 型號的 daily-tasks 模板。專案採用 HTML + CSS 設計模板,透過 Puppeteer 將 HTML 轉換為 PNG 圖片,這個技術選擇在靈活性和可維護性方面具有明顯優勢。

然而,隨著需求擴展到支援第二款裝置(Manta)以及規劃未來開發約 5 種不同類型的模板,當前架構開始顯現擴展性問題。主要表現為裝置尺寸和樣式參數散落在不同檔案中,缺乏統一的配置管理,這將導致維護多個模板時的高重複工作量。

### 問題的重要性

Supernote 是專業的電子紙筆記裝置,其模板品質直接影響使用者的書寫體驗。不同型號的螢幕尺寸差異顯著(Nomad 7.8 吋 vs Manta 10.7 吋),若未妥善處理尺寸適配,將導致模板在不同裝置上的可讀性問題。

此外,社群調研顯示 Supernote 使用者對客製化模板需求旺盛,一個設計良好的生成系統不僅能提高開發效率,更能確保所有模板在不同裝置上維持一致的視覺品質和使用體驗。如果現在不建立適當的架構基礎,未來維護 10 個模板(5 種類型 × 2 種裝置)將變得極度困難。

---

## 研究問題與發現過程

### 初始問題陳述

使用者最初提出的問題聚焦於如何支援兩種 Supernote 裝置尺寸,並指出當前 Nomad 的尺寸參數(1404×1872)硬編碼在 `convert-to-png.js` 和 `daily-tasks.html` 中。使用者預期未來會有多個不同類型的模板需要生成,並認為字體大小等樣式參數也應該統一管理。

### 問題演進過程

透過與使用者的互動,我們釐清了以下關鍵資訊:

1. **裝置規格確認**: 第二款裝置為 A5 X2 Manta,尺寸為 1920×2560 像素,但使用者不確定官方推薦值
2. **規模預期**: 預計開發約 5 種模板類型(週計畫、月曆、筆記本、待辦清單等)
3. **共用需求**: 字體大小和邊界需要統一,但具體還有哪些共用樣式參數需要進一步研究
4. **輸出需求**: 需要批次生成所有模板,並按裝置型號分目錄存放
5. **技術選擇**: 傾向使用 HTML 方案,但希望了解是否有更好的替代方案

### 最終研究範疇

基於上述資訊,本研究聚焦於四個核心問題:

1. **裝置規格驗證**: 確認兩款裝置的官方推薦尺寸和 DPI 設定
2. **社群最佳實踐**: 調研 Supernote 社群的模板設計規範(字體、邊界、間距等)
3. **技術方案評估**: 比較 HTML vs 其他生成工具的優劣勢
4. **架構設計建議**: 提出可擴展的專案結構和重構方針

---

## 技術分析:深入理解問題

### 4.1 裝置規格與社群標準

#### 官方裝置規格確認

經過網路搜尋和官方資料驗證,兩款 Supernote 裝置的規格如下:

**Supernote A6 X2 Nomad**
- 螢幕尺寸: 7.8 英寸
- 解析度: 1404 × 1872 像素
- DPI: 300
- 螢幕類型: E Ink Carta HD(玻璃屏)
- 實體尺寸: 191.9 × 139.2 × 6.8 mm

**Supernote A5 X2 Manta**
- 螢幕尺寸: 10.7 英寸
- 解析度: 1920 × 2560 像素
- DPI: 300
- 螢幕類型: E Ink Carta 1300(柔性塑膠屏)
- 實體尺寸: 251.3 × 182.6 × 6.0 mm

**關鍵發現**:
- 使用者提供的尺寸資訊完全正確
- 兩款裝置的 DPI 均為 300,意味著在相同物理尺寸下,顯示的像素密度一致
- Manta 的解析度約為 Nomad 的 1.37 倍(寬)和 1.37 倍(高),尺寸比例接近,但並非完全等比

#### Supernote 官方模板規範

根據 Supernote 官方支援文件和社群調研:

**檔案規格要求**:
- 格式: PNG(也支援 JPG, JPEG, WEBP,但 PNG 最佳)
- 解析度: Nomad 為 1404×1872,Manta 為 1920×2560
- DPI: 300(確保尺寸精確)
- 檔名限制: 不可包含特殊字元或空格
- 安裝位置: `MyStyle` 目錄

**尺寸適配行為**:
從 Chauvet 2.10.25 版本開始,Supernote 移除了圖片模板的尺寸限制,但官方仍建議使用標準解析度:
- 若圖片小於建議尺寸,會保持原始大小並居中顯示,無法覆蓋整個螢幕
- 若圖片大於建議尺寸,會按比例縮小,可能無法完全覆蓋螢幕
- 最佳寬高比為 3:4(Nomad 為 1404:1872 = 0.75,Manta 為 1920:2560 = 0.75)

#### 社群設計最佳實踐

透過分析社群資源和設計指南,發現以下關鍵設計考量:

**邊界與間距建議**:
- **最小邊界考量**: 由於 Supernote 裝置本身有邊框(bezel),實際上已經提供了視覺上的邊距效果,因此模板內部不需要像傳統印刷品那樣設置大邊距
- **工具列相關**:
  - 工具列位置: 預設在頂部(TOP),但使用者可調整到左側或隱藏
  - 社群模板通常提供「Top Toolbar」和「Side Toolbar」兩種版本
  - **注意**: 網路資源未提供工具列佔用的具體像素數值
- **當前專案的邊距設定**:
  - **Nomad**: 左側 150px,底部 150px(來自現有 daily-tasks.html,基於使用者實機測試)
  - **Manta**: **無實際數據**,建議使用等比例縮放作為初始值(200-205px),但必須實機驗證後調整
  - ⚠️ **重要**: 這些數值缺乏官方或社群的驗證數據支持,強烈建議在兩種裝置上實測

**字體大小與可讀性**:
- **一般排版標準**: 正文建議 16px(網頁)或 10-12pt(印刷)
- **電子紙特殊性**: E Ink 螢幕對比度較低,白點比 LCD 螢幕暗得多,字體在裝置上看起來與電腦螢幕完全不同
- **測試建議**: 社群強烈建議使用「實時模型」(live mockup)測試,將模板疊加在裝置截圖上,使用「相乘」混合模式模擬墨水效果
- **當前專案字體**: daily-tasks.html 使用 44px(大標題)、24px(中標題和正文)、10px(小字),這在 Nomad 上是合理的

**尺寸縮放策略**:
由於 Manta 的解析度是 Nomad 的 1.37 倍,但螢幕物理尺寸更大(10.7" vs 7.8"),理論上同樣的內容在兩個裝置上的「物理大小」應該不同。計算如下:

- Nomad: 1404px ÷ 300dpi = 4.68 英寸寬度,1872px ÷ 300dpi = 6.24 英寸高度
- Manta: 1920px ÷ 300dpi = 6.4 英寸寬度,2560px ÷ 300dpi = 8.53 英寸高度
- 物理尺寸比例: Manta 寬度是 Nomad 的 1.37 倍,高度也是 1.37 倍

**關鍵設計策略**: 如果目標是在兩個裝置上保持「視覺上相似」的體驗,字體大小應該按解析度比例縮放(×1.37),但如果希望「相同物理大小」,則保持 pt 值不變(因為 DPI 相同)。根據社群實踐,通常採用**等比例縮放**策略,保持版面比例一致。

### 4.2 程式碼庫現況分析

#### 當前架構問題

檢視現有程式碼,發現以下硬編碼和重複問題:

**convert-to-png.js 問題點**:
```javascript
// 硬編碼的尺寸參數出現 4 次
await page.setViewport({
    width: 1404,    // 硬編碼 #1
    height: 1872,   // 硬編碼 #2
    deviceScaleFactor: 1,
});

await page.screenshot({
    path: outputPath,
    width: 1404,    // 硬編碼 #3
    height: 1872,   // 硬編碼 #4
    clip: {
        x: 0,
        y: 0,
        width: 1404,    // 硬編碼 #5
        height: 1872,   // 硬編碼 #6
    },
});
```

**daily-tasks.html 問題點**:
```css
/* 硬編碼的裝置尺寸 */
body {
    width: 1404px;   /* 硬編碼 #1 */
    height: 1872px;  /* 硬編碼 #2 */
}

/* 硬編碼的字體大小 */
:root {
    --font-size-lg: 44px;  /* 硬編碼 #3 */
    --font-size-md: 24px;  /* 硬編碼 #4 */
    --font-size-sm: 10px;  /* 硬編碼 #5 */
}

/* 硬編碼的邊距 */
.container {
    padding: 15px 15px 150px 150px;  /* 硬編碼 #6 */
}
```

**問題影響**:
1. **無法批次處理**: 需要為每個裝置手動修改這些值並重新執行
2. **維護困難**: 新增模板時需要複製整個 HTML 檔案,然後手動調整所有參數
3. **容易出錯**: 多處硬編碼增加了遺漏修改的風險
4. **缺乏一致性**: 沒有中央配置,無法保證所有模板使用相同的標準

#### 缺失的功能模組

當前專案缺少以下關鍵功能:

1. **配置管理系統**: 無統一的裝置規格和樣式參數配置
2. **共用樣式庫**: 字體、顏色、間距等樣式散落在各模板中
3. **批次生成腳本**: 無法一次生成所有模板的所有裝置版本
4. **命名規範**: 輸出檔案無標準化命名規則
5. **目錄結構**: 缺乏組織化的原始碼和輸出目錄規劃

### 4.3 技術方案比較

#### HTML + Puppeteer (當前方案)

**優勢**:
- **設計靈活性高**: 可使用完整的 HTML/CSS 能力,支援 Flexbox、Grid 等現代佈局
- **版本控制友好**: 純文字檔案,易於 Git 追蹤和 diff
- **程式化生成**: 可透過 JavaScript 動態生成內容,支援模板引擎
- **開發工具完善**: 可使用瀏覽器開發者工具即時預覽和調試
- **社群資源豐富**: HTML/CSS 學習資源最多,容易找到解決方案
- **輸出品質高**: Puppeteer 可精確控制渲染品質,支援 300 DPI 輸出

**劣勢**:
- **啟動成本**: 需要安裝 Chromium(約 150-200MB)
- **轉換速度**: 相較於直接圖片處理工具較慢(但對於批次生成 10 個模板,差異可忽略)
- **記憶體佔用**: Puppeteer 運行時記憶體佔用較高

#### Playwright (替代方案 1)

**差異分析**:
- **跨瀏覽器支援**: Playwright 支援 Chromium、Firefox、WebKit,但本專案只需要 Chromium
- **多語言支援**: Playwright 支援 Python、Java、.NET,但本專案使用 JavaScript
- **效能**: 對於純 Chromium 任務,Puppeteer 略快於 Playwright
- **社群規模**: Puppeteer 更成熟,社群資源更多

**結論**: 對本專案而言,Playwright 的優勢用不上,維持 Puppeteer 即可。

#### 客戶端 HTML-to-Image 函式庫(替代方案 2)

如 html2canvas、dom-to-image:

**優勢**:
- 輕量級,無需安裝瀏覽器
- 可在瀏覽器中執行

**劣勢**:
- **渲染品質較差**: 無法完美還原 CSS,複雜佈局常有問題
- **缺乏精確控制**: 難以保證 300 DPI 輸出
- **跨平台一致性差**: 不同瀏覽器結果可能不同

**結論**: 不適合需要高品質輸出的專業模板生成。

#### 圖形設計軟體 + 腳本(替代方案 3)

如 Affinity Publisher、Adobe InDesign + 腳本自動化:

**優勢**:
- **專業設計工具**: 提供精確的排版控制
- **WYSIWYG**: 所見即所得的設計體驗

**劣勢**:
- **版本控制困難**: 二進位檔案無法有效 diff
- **自動化複雜**: 腳本 API 學習曲線陡峭,功能有限
- **授權成本**: 商業軟體需要購買授權
- **跨平台問題**: 團隊成員需要安裝相同軟體

**結論**: 適合手動設計單個複雜模板,不適合程式化批次生成。

#### RenderForm API(替代方案 4)

第三方 HTML-to-Image API 服務:

**優勢**:
- 無需本地安裝,呼叫 API 即可
- 渲染品質高

**劣勢**:
- **需要網路連線**: 無法離線工作
- **費用成本**: 大量使用需付費
- **隱私考量**: 模板內容上傳到第三方伺服器
- **依賴外部服務**: 服務中斷影響開發流程

**結論**: 對於開源或個人專案,不建議引入外部依賴和成本。

#### 最終建議

**保持使用 HTML + Puppeteer 方案**,原因如下:
1. 已投入開發,轉換成本高
2. 技術選擇適合本專案需求(程式化生成、版本控制、高品質輸出)
3. 社群實踐也大多使用此方案(參考 GitLab 上的社群專案)
4. 劣勢(檔案大小、速度)對本專案影響極小

### 4.4 社群專案分析

透過調研 Supernote 社群專案,發現以下實踐模式:

**組織方式**:
- 大多數社群專案將不同裝置的模板分開存放
- 採用標籤系統(tags)進行分類管理
- 檔名必須無空格和特殊字元(裝置要求)

**設計工作流程**:
1. 在 Supernote 上手繪草稿
2. 匯出為 PNG 作為設計參考
3. 使用設計軟體或 HTML 重新繪製
4. 建立 mockup 測試(將模板疊加在裝置截圖上)
5. 實機測試並調整

**缺失的環節**:
社群中較少看到**程式化批次生成**的專案,大多數是手動設計個別模板。這正是本專案可以突出的優勢 - 透過配置驅動的自動化生成系統,大幅提升效率。

---

## 解決方案探索與評估

基於上述分析,我們探索了三種架構重構方案,以下詳細比較各方案的優劣勢。

### 方案 A: 配置驅動架構 + 模板引擎

這是最靈活且可擴展的方案,採用集中式配置管理搭配 HTML 模板引擎。

**核心架構**:

建立一個 JSON 配置檔定義所有裝置規格和共用樣式:

```json
{
  "devices": {
    "nomad": {
      "name": "Nomad (A6 X2)",
      "width": 1404,
      "height": 1872,
      "dpi": 300,
      "safeArea": {
        "top": 0,
        "right": 15,
        "bottom": 150,
        "left": 150
      }
    },
    "manta": {
      "name": "Manta (A5 X2)",
      "width": 1920,
      "height": 2560,
      "dpi": 300,
      "safeArea": {
        "top": 0,
        "right": 20,
        "bottom": 200,
        "left": 200
      }
    }
  },
  "styles": {
    "nomad": {
      "fontSizes": {
        "large": "44px",
        "medium": "24px",
        "small": "10px"
      },
      "lineHeights": {
        "tight": 1.2,
        "normal": 1.5
      }
    },
    "manta": {
      "fontSizes": {
        "large": "60px",
        "medium": "33px",
        "small": "14px"
      },
      "lineHeights": {
        "tight": 1.2,
        "normal": 1.5
      }
    }
  },
  "templates": [
    {
      "id": "daily-tasks",
      "name": "Daily Tasks",
      "source": "templates/daily-tasks/template.html"
    }
  ]
}
```

使用模板引擎(如 Handlebars 或 EJS)處理 HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        :root {
            --font-size-lg: {{styles.fontSizes.large}};
            --font-size-md: {{styles.fontSizes.medium}};
            --font-size-sm: {{styles.fontSizes.small}};
        }
        body {
            width: {{device.width}}px;
            height: {{device.height}}px;
        }
        .container {
            padding: {{device.safeArea.top}}px {{device.safeArea.right}}px
                     {{device.safeArea.bottom}}px {{device.safeArea.left}}px;
        }
    </style>
</head>
<body>
    <!-- 模板內容 -->
</body>
</html>
```

建立統一的生成腳本:

```javascript
async function generateTemplate(templateId, deviceId) {
    const config = loadConfig();
    const template = config.templates.find(t => t.id === templateId);
    const device = config.devices[deviceId];
    const styles = config.styles[deviceId];

    const html = renderTemplate(template.source, { device, styles });
    const outputPath = `dist/${deviceId}/${templateId}.png`;

    await convertToPNG(html, device.width, device.height, outputPath);
}

// 批次生成所有組合
async function generateAll() {
    for (const template of config.templates) {
        for (const deviceId of Object.keys(config.devices)) {
            await generateTemplate(template.id, deviceId);
        }
    }
}
```

**優勢評估**:
- **擴展性**: 新增裝置或模板只需修改配置檔,無需改動程式碼
- **一致性**: 所有參數集中管理,確保統一標準
- **維護性**: 修改樣式標準只需更新一處,自動應用到所有模板
- **自動化**: 支援完整的批次生成流程
- **彈性**: 可為不同模板設定不同的樣式覆寫

**劣勢評估**:
- **實作複雜度**: 中等 - 需要整合模板引擎和重構現有程式碼
- **學習曲線**: 團隊需要理解模板引擎語法
- **除錯難度**: 模板錯誤可能較難定位

**實作工作量**: 約 2-3 天(包含重構現有模板)

### 方案 B: CSS Media Query

簡潔方案,使用 CSS Media Query 處理不同裝置的樣式差異。

**核心架構**:

建立共用樣式檔案,使用 Media Query:

```css
/* styles/devices.css */
/* Nomad 預設樣式 */
:root {
    --device-width: 1404px;
    --device-height: 1872px;
    --font-size-lg: 44px;
    --font-size-md: 24px;
    --font-size-sm: 10px;
    --safe-area-top: 15px;
    --safe-area-right: 15px;
    --safe-area-bottom: 150px;
    --safe-area-left: 150px;
}

/* Manta 樣式 */
@media (min-width: 1920px) and (min-height: 2560px) {
    :root {
        --device-width: 1920px;
        --device-height: 2560px;
        --font-size-lg: 60px;
        --font-size-md: 33px;
        --font-size-sm: 14px;
        --safe-area-top: 20px;
        --safe-area-right: 20px;
        --safe-area-bottom: 205px;
        --safe-area-left: 205px;
    }
}
```

模板 HTML 使用:

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="../styles/devices.css">
    <style>
        body {
            width: var(--device-width);
            height: var(--device-height);
        }
        .container {
            padding: var(--safe-area-top) var(--safe-area-right)
                     var(--safe-area-bottom) var(--safe-area-left);
        }
        h1 {
            font-size: var(--font-size-lg);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>DAILY TASKS</h1>
        <!-- 模板內容直接寫在 HTML 中 -->
    </div>
</body>
</html>
```

生成腳本設定 Puppeteer viewport:

```javascript
/* scripts/convert-to-png.js */
const deviceConfigs = {
    nomad: { width: 1404, height: 1872 },
    manta: { width: 1920, height: 2560 }
};

async function convertHtmlToPng(htmlPath, deviceId) {
    const config = deviceConfigs[deviceId];
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // 設定 viewport,觸發對應的 media query
    await page.setViewport({
        width: config.width,
        height: config.height,
        deviceScaleFactor: 1,
    });

    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    await page.screenshot({
        path: `dist/${deviceId}/${path.basename(htmlPath, '.html')}.png`,
        width: config.width,
        height: config.height,
        clip: { x: 0, y: 0, width: config.width, height: config.height }
    });

    await browser.close();
}

// 批次生成
async function generateAll() {
    const templates = ['daily-tasks', 'weekly-plan', /* ... */];
    const devices = ['nomad', 'manta'];

    for (const template of templates) {
        for (const device of devices) {
            await convertHtmlToPng(`templates/${template}.html`, device);
        }
    }
}
```

**優勢評估**:
- **實作簡單**: 基於原生 CSS 技術,無需學習新工具
- **單一 HTML 檔案**: 每個模板只需一個 HTML,自動適配所有裝置
- **即時預覽**: 可在瀏覽器中調整視窗大小預覽不同裝置效果
- **配置集中**: 裝置規格集中在 `devices.css`
- **除錯友好**: 可使用 Chrome DevTools 即時調試
- **易於維護**: 新增裝置只需修改一個共用檔案
- **純靜態**: 無需 JavaScript,內容直接在 HTML 中撰寫

**劣勢評估**:
- **內容需手動複製**: 如果不同裝置需要不同內容數量(如不同行數),需要在 HTML 中寫好所有內容,並用 CSS 控制顯示/隱藏
- **計算邏輯手動**: 無法自動計算縮放比例(如 Manta = Nomad × 1.37),數值需手動填寫

**實作工作量**: 約 0.5 天

**適用場景**:
- 2-3 種裝置
- 3-5 種模板
- 模板內容主要是樣式差異,較少結構性差異
- 希望保持架構簡單,之後有需要再擴展

### 方案 C: 腳本參數化 + 手動模板

最簡單但最受限的方案,保持 HTML 獨立,透過腳本參數傳遞尺寸資訊。

**核心架構**:

修改轉換腳本接受參數:

```javascript
async function convertHtmlToPng(htmlPath, device, outputDir) {
    const config = deviceConfigs[device];

    await page.setViewport({
        width: config.width,
        height: config.height,
        deviceScaleFactor: 1,
    });

    await page.screenshot({
        path: path.join(outputDir, `${path.basename(htmlPath, '.html')}-${device}.png`),
        width: config.width,
        height: config.height,
    });
}
```

每個模板仍然是獨立的 HTML,但內部樣式改為百分比或相對單位:

```css
body {
    width: 100vw;
    height: 100vh;
}
.container {
    padding: 0.8% 1% 8% 10.7%;  /* 根據 Nomad 基準計算的百分比 */
}
```

**優勢評估**:
- **改動最小**: 幾乎不需要重構現有模板
- **學習成本低**: 不引入新技術和工具
- **快速實施**: 半天即可完成

**劣勢評估**:
- **維護困難**: 每個模板仍是獨立的,共用樣式需要手動同步
- **容易出錯**: 百分比計算容易出錯,不同模板可能不一致
- **不可持續**: 隨著模板數量增加,維護成本急劇上升
- **無法保證一致性**: 缺乏中央配置,難以確保所有模板遵循相同標準

**實作工作量**: 約 0.5-1 天

**風險評估**: 技術債務高,不建議長期使用

### 方案比較總結

| 評估維度 | 方案 A (配置驅動 + 模板引擎) | 方案 B (CSS Media Query) | 方案 C (腳本參數化) |
|---------|-----------------|------------------|-------------------|
| **實作複雜度** | 中 | 低 | 低 |
| **維護成本** | 低 | 低 | 高 |
| **擴展性** | 優秀 | 良好 | 較差 |
| **一致性保證** | 優秀 | 良好 | 較差 |
| **批次生成** | 完整支援 | 完整支援 | 需手動處理 |
| **新增模板成本** | 低 | 低 | 高 |
| **新增裝置成本** | 低 | 低 | 中 |
| **學習曲線** | 中(需學習模板引擎) | 低(原生 CSS) | 低 |
| **瀏覽器預覽** | 需編譯 | 即時預覽 | 需處理 |
| **處理結構差異** | 優秀(模板語法) | 手動(CSS 控制) | 較差 |
| **配置集中度** | 優秀(單一配置檔) | 優秀(單一 CSS 檔) | 較差 |
| **未來擴展潛力** | 優秀(支援複雜邏輯) | 良好(可加入 JS) | 有限 |
| **適合規模** | 5+ 模板,3+ 裝置 | 3-5 模板,2-3 裝置 | 1-2 模板,實驗階段 |

---

## 建議與決策指引

### 推薦方案: 方案 B - CSS Media Query

基於專案的當前規模(預計 5 種模板 × 2 種裝置 = 10 個輸出檔案)和保持簡單的原則,**建議採用方案 B**。

**推薦理由**:

1. **實作成本低**: 約 0.5 天即可完成基礎架構,相較方案 A 的 2-3 天更快速
2. **技術門檻低**: 僅使用原生 CSS Media Query,團隊無需學習模板引擎或額外的 JavaScript 工具
3. **開發體驗佳**: 可在瀏覽器中即時預覽和調試,開發效率高
4. **符合當前規模**: 2 種裝置、5 種模板的規模完全適用,維護成本低
5. **架構簡單**: 只需一個 CSS 檔案管理所有裝置樣式,易於理解和維護
6. **易於擴展**: 未來如果需要動態內容生成,可以再加入 JavaScript helper,或遷移到方案 A

**遷移路徑**:
- **短期擴展**: 如果發現某些模板需要動態生成內容(如不同裝置顯示不同行數),可以選擇性地為該模板加入 JavaScript
- **長期擴展**: 如果未來專案規模擴大(3+ 種裝置、8+ 種模板),或結構性差異變得複雜,可以考慮遷移到方案 A

**方案 A 適用情境**:
- 確定會支援 3 種以上裝置
- 預計開發 8 種以上模板
- 有複雜的條件邏輯需求(如某些模板只在特定裝置上提供)
- 需要頻繁調整縮放比例或全域參數

**方案 C 不建議**: 即使是快速驗證階段,方案 C 的技術債務也過高,維護成本會快速累積。

### 實施指引

採用**分階段實施**策略,降低風險並確保每個階段都能產出可用成果:

#### 第一階段:共用樣式系統建立(預估 0.25 天)

**目標**: 建立 CSS Media Query 基礎設施。

**具體任務**:
1. 建立目錄結構:
   ```
   styles/
     devices.css         # CSS Media Query 樣式
   templates/
     daily-tasks.html    # 模板檔案
   scripts/
     convert-to-png.js   # 轉換腳本
   dist/
     nomad/
     manta/
   ```

2. 建立 `styles/devices.css`:
   - 定義 Nomad 預設樣式(基於現有 daily-tasks.html 的數值)
   - 定義 Manta 的 Media Query 樣式(等比例計算,需實測調整)
   - 使用 CSS 變數統一管理字體、間距、安全區域

3. 重構 `scripts/convert-to-png.js`:
   - 接受裝置參數(nomad/manta)
   - 根據裝置設定 Puppeteer viewport
   - 支援批次生成多個模板

**驗收標準**:
- 可在瀏覽器中開啟任意 HTML,調整視窗大小即時看到不同裝置樣式
- 執行 `node scripts/convert-to-png.js templates/daily-tasks.html nomad` 可成功生成 PNG

#### 第二階段:重構現有模板(預估 0.25 天)

**目標**: 將 daily-tasks.html 改造為使用共用樣式系統。

**具體任務**:
1. 修改 `daily-tasks.html`:
   - 引入 `styles/devices.css`
   - 將硬編碼的字體大小、邊距改為使用 CSS 變數
   - 保持原有的視覺效果和佈局邏輯

2. 在瀏覽器中測試:
   - 1404×1872 視窗下檢查 Nomad 樣式
   - 1920×2560 視窗下檢查 Manta 樣式

3. 使用 Puppeteer 生成兩種裝置版本

**驗收標準**:
- Nomad 版本與原始 daily-tasks.png 視覺效果一致
- Manta 版本成功生成,字體和間距等比例放大
- HTML 檔案數量從 1 個(原本)保持為 1 個(無需重複)

#### 第三階段:批次生成與工作流程(預估 0.5 天)

**目標**: 完善批次生成腳本和開發工作流程。

**具體任務**:
1. 建立 `scripts/generate-all.js`:
   ```javascript
   const templates = ['daily-tasks', /* 未來的模板 */];
   const devices = ['nomad', 'manta'];

   for (const template of templates) {
       for (const device of devices) {
           await convertHtmlToPng(`templates/${template}.html`, device);
       }
   }
   ```

2. 新增 npm scripts:
   - `npm run generate` - 生成所有模板的所有裝置版本
   - `npm run generate:nomad` - 僅生成 Nomad 版本(開發時快速測試)
   - `npm run preview` - 啟動本地伺服器預覽模板

3. 建立 `.gitignore`:
   - 忽略 `dist/` 目錄
   - 忽略 `node_modules/`

4. 撰寫 README:
   - 專案結構說明
   - 如何開發新模板
   - 如何調整裝置參數

**驗收標準**:
- 執行 `npm run generate` 成功生成所有版本
- 新成員可根據 README 理解專案結構

#### 第四階段:實機測試與參數調整(需等待 Manta 測試資源)

**目標**: 驗證 Manta 的參數是否合適,並根據實測調整。

**具體任務**:
1. 在 Nomad 實機測試 daily-tasks 模板(應該與原版一致)
2. 尋找 Manta 測試資源(實機或社群使用者協助)
3. 在 Manta 上測試生成的模板:
   - 檢查字體大小是否可讀
   - 檢查安全區域是否足夠(內容是否被工具列遮擋)
   - 檢查整體版面是否協調
4. 根據反饋調整 `styles/devices.css`
5. 重新生成並驗證

**驗收標準**:
- 兩種裝置上的模板都有良好的可讀性和視覺效果
- 安全區域設定合理,無內容遮擋問題

#### 第五階段:新模板開發(持續進行)

**目標**: 基於新架構開發其他 4 種模板。

**流程**:
1. 複製 `templates/daily-tasks.html` 為新模板檔案
2. 引入共用的 `devices.css`
3. 實作新模板的特定佈局和樣式
4. 在瀏覽器中預覽並調整
5. 執行 `npm run generate` 生成所有裝置版本

**預期效率**: 使用新架構後,開發每個新模板的時間約 3-4 小時(不含設計時間),因為樣式適配和批次生成已自動化。

### 風險監控與應對

**風險 1: Manta 安全區域數值不正確**
- **機率**: 高(無實際數據支持,僅基於數學推算)
- **影響**: 中-高(可能導致內容被工具列遮擋或留白過多)
- **應對**:
  - **短期**: 先使用等比例縮放值(205px)作為保守估計
  - **實機測試**: 在第二階段完成後,若可借到 Manta 裝置,立即測試並調整
  - **替代方案**: 尋找 Manta 使用者協助測試,或在 Supernote 社群詢問實際數值
  - **快速調整**: 得益於配置驅動架構,調整 `config/devices.json` 即可重新生成

**風險 2: 字體大小在 Manta 上不合適**
- **機率**: 中(同樣基於等比例假設)
- **影響**: 中(影響可讀性和視覺效果)
- **應對**: 在實機測試時同步驗證字體大小,調整 `config/styles.json` 中 Manta 的字體縮放比例,可能需要微調為 1.3 或 1.4 倍而非 1.37 倍

**風險 3: 某些複雜佈局在兩種尺寸下效果差異大**
- **機率**: 中
- **影響**: 中-高(可能需要為不同裝置設計不同佈局)
- **應對**:
  - **方案 1**: 使用 CSS Media Query 搭配不同的佈局規則(如 `display: none` 隱藏某些元素)
  - **方案 2**: 如果需要不同的內容結構,可選擇性地為該模板加入 JavaScript 動態生成
  - **方案 3**: 如果差異過大,考慮拆分為兩個獨立模板,但仍共用 `devices.css`
  - **升級路徑**: 如果多個模板都遇到此問題,可能需要遷移到方案 A(模板引擎)以更好地處理條件邏輯

---

## 下一步行動計畫

### 立即行動(本週內)

**1. 建立專案規劃文件** (30 分鐘)
- 確認是否接受本研究的建議方案(方案 B)
- 排定實施時程
- 確定資源分配

**2. 環境準備** (30 分鐘)
- 備份現有的 `daily-tasks.html` 和 `convert-to-png.js`
- 建立新的目錄結構(`styles/`, `templates/`, `scripts/`, `dist/`)
- 設定 `.gitignore`

**3. 第一階段實施** (0.25 天)
- 按照上述「第一階段」任務清單執行
- 建立 `styles/devices.css`
- 重構 `convert-to-png.js` 支援多裝置
- 完成後進行驗收測試

### 中期目標(未來 2 週)

**1. 完成架構重構** (0.5 天)
- 完成第二階段:重構現有模板使用共用樣式系統
- 完成第三階段:建立批次生成腳本和工作流程
- 撰寫開發文件(README)

**2. 尋找 Manta 測試資源** (持續進行)
- **優先方案**: 嘗試借用或購買 Manta 裝置進行實機測試
- **替代方案**: 在 Supernote 社群尋求協助:
  - [Reddit r/Supernote](https://www.reddit.com/r/Supernote/)
  - [Supernote Facebook 群組](https://www.facebook.com/groups/supernote/)
  - [Supernote Discord 社群](https://discord.gg/supernote)(如有)
- **測試需求**: 請 Manta 使用者測試生成的模板,提供截圖和反饋
- **關鍵問題**: 字體大小可讀性、安全區域是否足夠、整體版面是否協調

**3. 實機測試與調整** (0.5 天,需等待 Manta 測試資源)
- ✅ 在 Nomad 實機上驗證現有設定(應該正常)
- ⚠️ 在 Manta 實機或透過社群使用者測試 daily-tasks 模板
- 根據實際效果調整字體大小和間距配置
- 建立 mockup 測試流程

**4. 開發第二個模板** (1-2 天)
- 選擇一個較簡單的模板類型(如週計畫)作為第二個模板
- 驗證新架構的易用性和效率
- 根據經驗優化模板開發流程

### 長期規劃(未來 1-2 個月)

**1. 完成所有計畫中的模板** (1-2 週)
- 開發剩餘 3 種模板
- 確保所有模板在兩種裝置上都經過測試

**2. 文件與開源準備** (3-5 天)
- 撰寫完整的 README 和貢獻指南
- 新增 LICENSE 檔案
- 準備專案展示頁面(可使用 GitHub Pages)

**3. 社群分享與反饋** (持續)
- 在 Supernote 社群(Reddit、Facebook 群組)分享專案
- 收集使用者反饋並改進
- 考慮支援社群貢獻的新模板

### 成功指標

設定以下指標衡量重構成功與否:

**效率指標**:
- 新增一個模板的時間 < 4 小時(不含設計時間)
- 為新裝置適配所有模板的時間 < 1 小時(只需修改 `devices.css`)
- 批次生成所有模板(5 個 × 2 裝置)的時間 < 5 分鐘

**品質指標**:
- 所有模板在兩種裝置上的字體大小和間距比例一致
- 實機測試無明顯可讀性問題

**開發體驗指標**:
- 可在瀏覽器中即時預覽不同裝置效果(調整視窗大小)
- 新成員可在 1 小時內理解架構並開始開發
- 修改全域樣式標準(如調整字體大小)只需更新 `devices.css` 一個檔案

**可維護性指標**:
- 每個模板只需維護一個 HTML 檔案
- 裝置規格集中在 `devices.css` 一個共用檔案
- 程式碼庫無重複的裝置適配邏輯


## 研究總結

本研究完成了對 Supernote Templates 專案多裝置支援架構的全面分析,主要發現和建議如下:

**核心結論**:
1. ✅ 使用者提供的裝置規格(Nomad 1404×1872,Manta 1920×2560)經官方驗證正確,兩款裝置 DPI 均為 300
2. ✅ HTML + Puppeteer 技術方案適合本專案,無需更換技術棧
3. ⚠️ 當前架構存在嚴重的硬編碼問題,不適合擴展到多裝置和多模板
4. ✅ CSS Media Query(方案 B)適合當前專案規模,簡單且易於維護

**關鍵建議**:
- **採用方案 B**,初期投入約 0.5 天建立基礎架構
- **分階段實施**,確保每個階段都能產出可用成果,降低風險
- **實機測試驗證**,在完成重構後尋找 Manta 測試資源,驗證字體大小和安全區域

**預期效益**:
- 新增模板時間約 3-4 小時(不含設計時間)
- 支援新裝置僅需 1 小時(修改一個共用檔案 + 批次重新生成)
- 每個模板只需一個 HTML 檔案,維護成本低
- 可在瀏覽器中即時預覽不同裝置效果,開發體驗佳

**下一步**:
立即開始第一階段實施,建立 `devices.css` 共用樣式系統,預計 0.25 天完成。完成後即可開始重構現有模板並驗證效果。

此研究報告為專案的架構重構提供了清晰的方向和可執行的實施計畫,包含完整的程式碼範例,可直接參考實作。