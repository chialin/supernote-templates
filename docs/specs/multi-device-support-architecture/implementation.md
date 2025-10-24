# 實作計畫

## 研究文件參考

**研究文件路徑：** `docs/research/2025-10-24-multi-device-support-architecture.md`

> **重要提醒：** 實作過程中請經常參考上述文件以了解：
>
> - 裝置規格和技術標準（Nomad 和 Manta 的解析度、DPI、安全區域）
> - 架構方案比較和選擇理由
> - 社群最佳實踐和設計考量
> - 完整的技術分析和風險評估
> - 分階段實施策略和驗收標準

## 相關檔案

- `styles/devices.css` - CSS Media Query 定義不同裝置的樣式變數
- `templates/daily-tasks.html` - 重構後的 daily-tasks 模板，使用共用樣式系統
- `scripts/convert-to-png.js` - 重構後的轉換腳本，支援多裝置和批次生成
- `scripts/generate-all.js` - 批次生成所有模板的腳本
- `dist/nomad/` - Nomad 裝置的輸出目錄
- `dist/manta/` - Manta 裝置的輸出目錄
- `package.json` - 新增 npm scripts 用於生成和預覽
- `.gitignore` - 忽略輸出檔案和 node_modules
- `README.md` - 專案文件，說明如何開發新模板
- `acceptance.feature` - Gherkin 格式的驗收測試場景

## 任務

- [ ] 1. 建立目錄結構和共用樣式系統
  - 1.1 建立 `styles/` 目錄
  - 1.2 建立 `templates/` 目錄
  - 1.3 建立 `scripts/` 目錄
  - 1.4 建立 `dist/nomad/` 和 `dist/manta/` 目錄
  - 1.5 建立 `styles/devices.css`，定義 Nomad 和 Manta 的 CSS 變數
  - 1.6 定義共用 CSS 變數（不在 Media Query 內）：字體大小（--font-size-lg: 44px、--font-size-md: 24px、--font-size-sm: 10px）、安全區域（--safe-area-top: 15px、--safe-area-right: 15px、--safe-area-bottom: 150px、--safe-area-left: 150px）
  - 1.7 Nomad 預設樣式：寬度 --device-width: 1404px、高度 --device-height: 1872px
  - 1.8 Manta Media Query 樣式：只定義寬度 --device-width: 1920px、高度 --device-height: 2560px（字體和安全區域使用共用變數，不需重複定義）

- [ ] 2. 重構現有模板使用共用樣式
  - 2.1 將 `daily-tasks.html` 移動到 `templates/` 目錄
  - 2.2 在 `templates/daily-tasks.html` 中引入 `../styles/devices.css`
  - 2.3 將硬編碼的 body 尺寸改為使用 `var(--device-width)` 和 `var(--device-height)`
  - 2.4 將硬編碼的字體大小改為使用 `var(--font-size-lg)`、`var(--font-size-md)`、`var(--font-size-sm)`
  - 2.5 將硬編碼的 padding 改為使用 `var(--safe-area-top)`、`var(--safe-area-right)`、`var(--safe-area-bottom)`、`var(--safe-area-left)`
  - 2.6 在瀏覽器中測試：調整視窗到 1404×1872（Nomad）和 1920×2560（Manta）確認樣式正確切換

- [ ] 3. 重構轉換腳本支援多裝置
  - 3.1 將 `convert-to-png.js` 移動到 `scripts/` 目錄
  - 3.2 定義 deviceConfigs 物件，包含 nomad 和 manta 的寬高配置
  - 3.3 修改 convertHtmlToPng 函數接受兩個參數：htmlPath 和 deviceId
  - 3.4 根據 deviceId 從 deviceConfigs 取得對應的寬高設定
  - 3.5 使用動態的寬高設定 Puppeteer viewport 和 screenshot
  - 3.6 輸出路徑改為 `dist/${deviceId}/${模板名稱}.png`
  - 3.7 測試：執行 `node scripts/convert-to-png.js templates/daily-tasks.html nomad` 和 `manta` 確認兩個版本都能正確生成

- [ ] 4. 建立批次生成腳本和工作流程
  - 4.1 建立 `scripts/generate-all.js`
  - 4.2 定義 templates 陣列（目前只有 'daily-tasks'，未來可擴展）
  - 4.3 定義 devices 陣列（['nomad', 'manta']）
  - 4.4 使用雙層迴圈遍歷所有模板和裝置組合
  - 4.5 呼叫 convertHtmlToPng 生成每個組合的 PNG
  - 4.6 在 package.json 新增 npm scripts：
    - `"generate": "node scripts/generate-all.js"` - 生成所有模板的所有裝置版本
    - `"generate:nomad": "node scripts/convert-to-png.js templates/daily-tasks.html nomad"` - 僅生成 Nomad 版本
    - `"generate:manta": "node scripts/convert-to-png.js templates/daily-tasks.html manta"` - 僅生成 Manta 版本
  - 4.7 更新 `.gitignore` 忽略 `dist/` 目錄
  - 4.8 測試：執行 `npm run generate` 確認所有版本都正確生成

- [ ] 5. 撰寫專案文件
  - 5.1 更新 README.md 說明專案結構
  - 5.2 說明如何開發新模板：複製現有模板 → 引入 devices.css → 使用 CSS 變數 → 執行 generate
  - 5.3 說明如何調整裝置參數：修改 styles/devices.css 中的變數值
  - 5.4 說明如何新增裝置：在 devices.css 新增 Media Query、在 convert-to-png.js 新增 deviceConfig、在 generate-all.js 新增到 devices 陣列
  - 5.5 列出可用的 npm scripts 和其用途
  - 5.6 說明目錄結構和檔案用途

- [ ] 6. 驗證和測試
  - 6.1 在瀏覽器中開啟 templates/daily-tasks.html，調整視窗大小驗證 Media Query 正確切換
  - 6.2 執行 `npm run generate` 生成所有版本
  - 6.3 比對 Nomad 版本與原始 daily-tasks.png 確認視覺效果一致
  - 6.4 檢查 Manta 版本的字體和間距與 Nomad 保持相同（因 DPI 相同，物理尺寸應相同）
  - 6.5 確認輸出檔案命名正確：`dist/nomad/daily-tasks.png` 和 `dist/manta/daily-tasks.png`
  - 6.6 驗證專案結構清晰，新成員可在 1 小時內理解並開始開發

- [ ] 7. 執行驗收測試
  - 7.1 使用 AI 讀取 acceptance.feature 檔案
  - 7.2 透過指令或 MCP 瀏覽器操作執行每個場景
  - 7.3 驗證所有場景通過並記錄結果

## 實作參考資訊

### 來自研究文件的技術洞察
> **文件路徑：** `docs/research/2025-10-24-multi-device-support-architecture.md`

**裝置規格（第 4.1 節）：**
- Nomad (A6 X2): 1404×1872 px, 300 DPI, 7.8 吋
- Manta (A5 X2): 1920×2560 px, 300 DPI, 10.7 吋
- **關鍵洞察**：兩款裝置 DPI 相同（都是 300），因此相同的像素數 = 相同的物理大小

**安全區域考量（第 4.1 節）：**
- Nomad 當前設定：左 150px、底 150px（基於實機測試）
- Manta 設定：使用相同值 150px（因 DPI 相同，工具列物理大小應相同，可能需實機微調）
- 工具列可能遮擋部分內容，需預留安全區域

**字體大小策略：**
- **保持相同像素值**：因 DPI 相同，字體應使用相同的 px 值（44px、24px、10px）
- 這樣在兩個裝置上會有相同的物理尺寸（實際大小一樣）
- Manta 因螢幕更大，可以顯示更多內容，但每個字的大小不變

**CSS Media Query 實作（方案 B - 修正版）：**
```css
/* 共用變數（所有裝置相同，因為 DPI 相同） */
:root {
    --font-size-lg: 44px;
    --font-size-md: 24px;
    --font-size-sm: 10px;
    --safe-area-top: 15px;
    --safe-area-right: 15px;
    --safe-area-bottom: 150px;
    --safe-area-left: 150px;
}

/* Nomad 預設樣式（只定義裝置尺寸） */
:root {
    --device-width: 1404px;
    --device-height: 1872px;
}

/* Manta 樣式（只定義裝置尺寸） */
@media (min-width: 1920px) and (min-height: 2560px) {
    :root {
        --device-width: 1920px;
        --device-height: 2560px;
    }
}
```

**Puppeteer 配置：**
```javascript
const deviceConfigs = {
    nomad: { width: 1404, height: 1872 },
    manta: { width: 1920, height: 2560 }
};

async function convertHtmlToPng(htmlPath, deviceId) {
    const config = deviceConfigs[deviceId];
    await page.setViewport({
        width: config.width,
        height: config.height,
        deviceScaleFactor: 1,
    });
    // ... 截圖邏輯
}
```

### 關鍵技術決策

**為何選擇方案 B（CSS Media Query）：**
1. **實作成本低**：約 0.5 天完成，無需學習額外工具
2. **架構簡單**：只需一個 CSS 檔案管理所有裝置樣式
3. **即時預覽**：可在瀏覽器中調整視窗大小即時看到效果
4. **易於擴展**：未來需要可再加入 JavaScript 或遷移到方案 A

**重要技術修正：DPI 相同導致的設計調整**
1. **字體大小應保持相同**：Nomad 和 Manta 的 DPI 都是 300，這意味著相同的像素數 = 相同的物理大小。因此字體不應該等比例放大，而應該保持相同的 px 值（44px、24px、10px），這樣在兩個裝置上會有相同的物理尺寸。
2. **安全區域應保持相同**：同樣的邏輯，工具列的物理大小不會改變，所以安全區域也應該使用相同的像素值。
3. **只有畫布尺寸不同**：Media Query 只需要調整 --device-width 和 --device-height，字體和安全區域作為共用變數即可。
4. **與研究文件的差異**：研究文件中建議等比例縮放（1.37 倍）是基於「保持版面比例一致」的假設，但實際上因為 DPI 相同，保持相同物理尺寸更合理。

**技術限制和注意事項：**
1. **安全區域需實機驗證**：目前的安全區域設定（150px）基於 Nomad 實測，Manta 上可能需要調整（雖然理論上應該相同）
2. **內容需手動處理**：如需不同裝置顯示不同行數，需在 HTML 中寫好所有內容並用 CSS 控制顯示/隱藏
3. **未來擴展路徑**：如果專案規模擴大（3+ 裝置、8+ 模板），可考慮遷移到方案 A（配置驅動 + 模板引擎）

**成功指標（第 6.5 節）：**
- 新增模板時間 < 4 小時
- 新增裝置適配時間 < 1 小時
- 批次生成時間 < 5 分鐘
- 每個模板只需一個 HTML 檔案
- 裝置規格集中在一個 CSS 檔案
