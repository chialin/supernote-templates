# 實作計畫

## PRD 參考

**PRD 文件路徑：** `docs/specs/2025-10-31-basic-lined-notebook/prd.md`

> **重要提醒：** 實作過程中請經常參考上述文件以了解：
>
> - 功能的商業目標和使用者價值
> - 完整的使用者故事和使用場景
> - 非功能性需求（性能、安全性等）
> - 系統架構和技術決策的背景脈絡

## 相關檔案

- `templates/lined-notebook.html` - 新建立的橫線筆記本樣板（本次實作的主要檔案）
- `styles/devices.css` - 裝置 CSS 變數和安全區域設定（現有檔案，需要引用）
- `scripts/auto-fill-rows.js` - 動態行生成工具（現有檔案，需要使用）
- `scripts/convert-to-png.js` - HTML 轉 PNG 轉換工具（現有檔案，會自動使用）
- `scripts/generate-all.js` - 批次生成工具（現有檔案，會自動掃描新樣板）
- `dist/nomad/lined-notebook.png` - Nomad 裝置輸出檔案（生成後產生）
- `dist/manta/lined-notebook.png` - Manta 裝置輸出檔案（生成後產生）
- `acceptance.feature` - Gherkin 格式的驗收測試場景

## 任務

- [x] 1. 建立 HTML 樣板檔案結構
  - 1.1 在 `templates/` 目錄下建立 `lined-notebook.html` 檔案
  - 1.2 設定基本的 HTML5 文件結構（DOCTYPE、html、head、body）
  - 1.3 引入裝置樣式表：`<link rel="stylesheet" href="../styles/devices.css">`
  - 1.4 設定文件 title 為 "Lined Notebook"
  - 1.5 設定 meta charset 為 UTF-8 和適當的 viewport

- [x] 2. 實作基礎 CSS 樣式
  - 2.1 使用 CSS reset（margin: 0, padding: 0, box-sizing: border-box）確保跨瀏覽器一致性
  - 2.2 設定 body 樣式：白色背景、無 padding/margin、寬度和高度使用 CSS 變數 `var(--device-width)` 和 `var(--device-height)`
  - 2.3 建立主容器 `.container`：寬高 100%、白色背景、使用 Flexbox 佈局（flex-direction: column）
  - 2.4 應用安全區域 padding：`padding: var(--safe-area-top) var(--safe-area-right) var(--safe-area-bottom) var(--safe-area-left)`
  - 2.5 設定 `.container` 為 `flex: 1` 和 `min-height: 0` 以確保正確的高度計算

- [x] 3. 實作橫線樣式
  - 3.1 建立 `.line` 類別，設定為黑色實線（border-bottom: 1px solid #000）
  - 3.2 設定行高為 94px（`height: 94px`）以符合 Nomad 18 行的需求
  - 3.3 確保橫線 `flex-shrink: 0` 以防止被壓縮
  - 3.4 測試 1px 和 2px 兩種粗細，在註解中記錄測試結果，最終選擇在 e-ink 上效果較好的粗細

- [x] 4. 整合動態行生成機制
  - 4.1 在 HTML body 中建立主容器 div，設定 id 為 `lines-container`
  - 4.2 在容器內建立樣板橫線 div，設定 class 為 `line`，id 為 `line-template`
  - 4.3 引入 auto-fill-rows.js：`<script src="../scripts/auto-fill-rows.js"></script>`
  - 4.4 建立初始化腳本，呼叫 `setupAutoFillRows({ containerId: 'lines-container', templateId: 'line-template', rowHeight: 94, debug: true })`
  - 4.5 確保腳本在 DOM 載入完成後執行

- [ ] 5. 測試多裝置生成
  - 5.1 執行 `npm run generate:nomad` 測試 Nomad 裝置生成
  - 5.2 執行 `npm run generate:manta` 測試 Manta 裝置生成
  - 5.3 檢查生成的 PNG 檔案是否在 `dist/nomad/` 和 `dist/manta/` 目錄下
  - 5.4 驗證檔案尺寸是否正確（Nomad: 1404×1872px, Manta: 1920×2560px）
  - 5.5 視覺檢查橫線是否清晰、間距是否均勻、是否填滿安全區域

- [ ] 6. 優化和調整
  - 6.1 根據生成結果，檢查橫線是否太靠近邊緣，必要時微調安全區域或容器 padding
  - 6.2 確認 Manta 裝置上的行數是否合理（預期約 24-25 行）
  - 6.3 如果需要，調整橫線粗細（1px vs 2px）以達到最佳視覺效果
  - 6.4 移除 debug 模式（將 `debug: true` 改為 `debug: false` 或移除該參數）
  - 6.5 執行 `npm run generate` 產生最終的兩個裝置版本

- [ ] 7. 執行驗收測試
  - 7.1 使用 AI 讀取 acceptance.feature 檔案
  - 7.2 透過指令或檔案檢查執行每個場景
  - 7.3 驗證所有場景通過並記錄結果
  - 7.4 如有失敗場景，修正問題後重新執行驗收測試

## 實作參考資訊

### 來自 PRD 的實作細節
> **文件路徑：** 參考上方 PRD 參考章節

#### 裝置規格和計算
- **Nomad 裝置**：
  - 總尺寸：1404×1872px
  - 安全區域：上 30px、右 30px、下 150px、左 150px
  - 可用高度：1872 - 30 - 150 = 1692px
  - 18 行配置：1692px ÷ 18 = 94px 每行

- **Manta 裝置**：
  - 總尺寸：1920×2560px
  - 安全區域：與 Nomad 相同（上 30px、右 30px、下 150px、左 150px）
  - 可用高度：2560 - 30 - 150 = 2380px
  - 預期行數：2380px ÷ 94px ≈ 25.3 行（實際約 25 行）

- **共同特性**：
  - 兩裝置皆為 300 DPI
  - 相同的行高（94px）在兩裝置上具有相同的物理尺寸
  - 使用 CSS 變數系統自動適配裝置尺寸

#### CSS 變數系統
從 `styles/devices.css` 中定義的變數：
```css
/* 共用變數（所有裝置相同） */
--safe-area-top: 30px;
--safe-area-right: 30px;
--safe-area-bottom: 150px;
--safe-area-left: 150px;

/* 裝置特定變數 */
--device-width: 1404px;  /* Nomad 預設 */
--device-height: 1872px;  /* Nomad 預設 */

/* Manta 透過 media query 覆寫 */
@media (min-width: 1920px) and (min-height: 2560px) {
    --device-width: 1920px;
    --device-height: 2560px;
}
```

#### 動態行生成機制
參考 `scripts/auto-fill-rows.js` 的運作方式：
1. 計算容器的總高度（clientHeight）
2. 計算現有內容的高度（offsetHeight）
3. 計算可用空間：`availableHeight = containerHeight - existingHeight + rowHeight`
4. 計算需要的行數：`neededRows = Math.floor(availableHeight / rowHeight)`
5. 複製樣板元素並移除 ID 屬性
6. 將複製的元素附加到容器中
7. 設定 `data-render-complete='true'` 標記以通知 Puppeteer

#### 樣板最佳實踐
基於 `templates/priority-todo.html` 的參考：
1. 使用 `display: flex` 和 `flex-direction: column` 建立垂直佈局
2. 容器設定 `flex: 1` 以填滿剩餘空間
3. 容器設定 `min-height: 0` 以確保 Flexbox 正確計算高度
4. 行元素設定 `flex-shrink: 0` 以防止被壓縮
5. 使用 `requestAnimationFrame` 確保佈局完成後再計算

### 關鍵技術決策

#### 1. 使用動態生成而非靜態 HTML
**決策**：使用 `auto-fill-rows.js` 動態生成橫線，而非在 HTML 中靜態寫入 18 條線
**理由**：
- 自動適配不同裝置尺寸（Manta 需要約 25 行，Nomad 需要 18 行）
- 無需為每個裝置維護不同的 HTML 版本
- 確保橫線填滿可用空間，不留空白

#### 2. 統一的行高（94px）
**決策**：在兩個裝置上使用相同的 94px 行高
**理由**：
- 兩裝置的 DPI 相同（300 DPI），因此相同像素數 = 相同物理尺寸
- 確保書寫體驗在不同裝置上一致
- 簡化實作和維護

#### 3. 橫線粗細的選擇（1px vs 2px）
**決策**：預設使用 1px，但需要在實際 e-ink 裝置上測試
**理由**：
- 1px 在一般螢幕上較細緻，不會過於搶眼
- 2px 在 e-ink 螢幕上可能更清晰可見
- 需要實際測試後決定最終值

#### 4. 極簡設計原則
**決策**：不包含任何頁首、頁碼或裝飾元素
**理由**：
- 最大化書寫空間
- 提供最大的使用靈活性
- 作為其他樣板的簡單參考範例

#### 5. 使用 Flexbox 佈局
**決策**：使用 Flexbox 而非絕對定位或 Grid
**理由**：
- 與專案現有樣板（priority-todo.html）保持一致
- 容易計算剩餘空間
- 與 `auto-fill-rows.js` 良好配合
