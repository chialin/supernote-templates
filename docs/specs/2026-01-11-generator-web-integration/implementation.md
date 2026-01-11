# 實作計畫

## PRD 參考

**PRD 文件路徑：** `docs/specs/2026-01-11-generator-web-integration/prd.md`
**相關研究文件：** `docs/research/2026-01-11-generator-web-integration.md`

## 任務概要

- [x] 安裝並設定 shadcn/ui
- [x] 移除 src 目錄層級
- [x] 為現有模板加入 meta 標籤
- [ ] 修改 generator 建構流程以產生 templates.json
- [ ] 建立 web 與 generator 的整合機制
- [ ] 實作模板列表首頁
- [ ] 實作模板詳情頁與下載功能
- [ ] 使用 shadcn 重構 LanguageSwitcher
- [ ] 執行驗收測試
- [ ] 更新專案文件

## 任務細節

### 安裝並設定 shadcn/ui

**實作要點**
- **請使用者手動執行** `cd packages/web && npx shadcn@latest init`（有互動式選項需要選擇）
- 建議選項：
  - Style: `New York`（較適合內容型網站）
  - Base color: 依使用者偏好
  - CSS variables: `Yes`（與現有 Tailwind v4 整合）
- 初始化完成後，安裝後續任務需要的元件：`npx shadcn@latest add button card dropdown-menu`
- 確認 `components.json` 正確配置，元件路徑設為 `@/components/ui`
- 驗證 shadcn 元件可正常 import 並渲染

**相關檔案**
- `packages/web/components.json` - shadcn 配置檔（新增）
- `packages/web/src/components/ui/` - shadcn 元件目錄（新增）
- `packages/web/app/[locale]/globals.css` - 可能需要調整 CSS 變數
- `packages/web/package.json` - 新增相依套件

**完成檢查**
- 執行 `npm run build` 確認建構成功無錯誤
- 在任一頁面 import Button 元件，確認可正常顯示

**實作備註**
照預期開發。shadcn/ui 已初始化（style: new-york, base color: gray, CSS variables: yes），並安裝 button、card、dropdown-menu 元件。建構驗證通過。

---

### 移除 src 目錄層級

**實作要點**
- 將 `packages/web/src/` 下的所有內容（components、lib、i18n）移動到 `packages/web/` 根目錄
- 更新 `tsconfig.json` 的 paths 設定，將 `@/*` 從 `./src/*` 改為 `./*`
- 更新 `components.json` 的 aliases 設定，確保 shadcn 新增元件時放到正確位置
- 更新所有 import 路徑（如有需要）
- 驗證建構成功且所有功能正常

**相關檔案**
- `packages/web/tsconfig.json` - 更新 paths 設定
- `packages/web/components.json` - 更新 aliases 設定
- `packages/web/src/*` - 移動到 `packages/web/`
- 所有使用 `@/` import 的檔案

**完成檢查**
- 執行 `npm run build` 確認建構成功
- 執行 `npx shadcn@latest add badge` 測試元件是否安裝到正確位置（`packages/web/components/ui/badge.tsx`）
- 測試後移除 badge 元件

**實作備註**
[技術障礙] `next.config.ts` 和 `i18n/request.ts` 中有寫死的 `src/` 路徑，需要一併更新。修正後建構成功，shadcn 元件也能正確安裝到新位置。

---

### 為現有模板加入 meta 標籤

**實作要點**
- 為 4 個現有模板加入 meta 標籤：`daily-routine.html`、`lined-notebook.html`、`priority-todo.html`、`ruby-lined-notebook.html`
- 每個模板需包含：`template:name:{locale}`、`template:description:{locale}`（en、zh-TW、ja 三種語言）
- 暫時不使用 `template:category`（PRD 非目標）
- 確保 meta 標籤放在 `<head>` 區塊內，位於 `<link>` 標籤之後
- 翻譯內容應準確反映模板的功能和用途

**相關檔案**
- `packages/generator/templates/daily-routine.html` - 每日計畫模板
- `packages/generator/templates/lined-notebook.html` - 橫線筆記本模板
- `packages/generator/templates/priority-todo.html` - 優先待辦模板
- `packages/generator/templates/ruby-lined-notebook.html` - 注音橫線筆記本模板

**完成檢查**
- 使用文字編輯器開啟每個 HTML 檔案，確認包含 9 個 meta 標籤（3 語言 × 3 欄位：name、description，但目前只用 name 和 description）

**實作備註**
照預期開發

---

### 修改 generator 建構流程以產生 templates.json

**實作要點**
- 在 generator 套件安裝 `cheerio` 依賴，用於解析 HTML
- 修改 `generate-all.js`，在產生 PNG 後提取 meta 標籤並輸出 `dist/templates.json`
- 實作 `extractMetadata(htmlPath)` 函式，使用 cheerio 解析 HTML 並提取 meta 資訊
- templates.json 結構應包含：`version`、`templates` 陣列（每個模板含 `id`、`devices`、`i18n`）
- 確保 `devices` 陣列正確列出支援的裝置（nomad、manta）
- **必要屬性驗證**：若 HTML 缺少任何必要的 meta 標籤（`template:name:{locale}`、`template:description:{locale}`），應拋出錯誤並中止建構流程，明確顯示缺少哪些屬性

**相關檔案**
- `packages/generator/scripts/generate-all.js` - 主要修改檔案
- `packages/generator/package.json` - 新增 cheerio 依賴
- `packages/generator/dist/templates.json` - 建構輸出（gitignored）

**完成檢查**
- 執行 `cd packages/generator && npm run build`
- 檢查 `dist/templates.json` 存在且包含正確的模板資料結構
- 故意移除某個模板的 meta 標籤，確認建構會失敗並顯示明確錯誤訊息

**實作備註**
<!-- 執行過程中填寫重要的技術決策、障礙和需要傳遞的上下文 -->

---

### 建立 web 與 generator 的整合機制

**實作要點**
- 在 web 的 `package.json` 加入 `"@supernote-templates/generator": "*"` 作為 devDependency
- 建立 `packages/web/scripts/copy-templates.js` 跨平台複製腳本
- 複製腳本應將 `node_modules/@supernote-templates/generator/dist/*` 複製到 `public/templates/`
- 使用 Node.js 內建的 `fs` 模組，確保 Windows 和 Unix 相容
- 修改 web 的 `package.json`，加入 `"prebuild": "node scripts/copy-templates.js"`
- 在 generator 的 `package.json` 加入 `"files": ["dist"]` 確保 dist 被發布
- 將 `public/templates/` 加入 `.gitignore`

**相關檔案**
- `packages/web/scripts/copy-templates.js` - 新增複製腳本
- `packages/web/package.json` - 加入依賴和 prebuild 腳本
- `packages/generator/package.json` - 加入 files 欄位
- `packages/web/.gitignore` - 加入 public/templates/

**完成檢查**
- 從根目錄執行 `npm run build`
- 確認 `packages/web/public/templates/` 目錄存在且包含 `nomad/`、`manta/`、`templates.json`

**實作備註**
<!-- 執行過程中填寫重要的技術決策、障礙和需要傳遞的上下文 -->

---

### 實作模板列表首頁

**實作要點**
- 建立 `packages/web/src/lib/templates.ts` 模板資料存取層，提供 `getTemplates()` 和 `getTemplateById()` 函式
- 定義 TypeScript 類型：`Template`、`TemplateI18n`、`TemplatesData`
- 修改首頁 `app/[locale]/page.tsx`，改為顯示模板網格
- 使用 shadcn Card 元件建立模板卡片，顯示：預覽圖（使用 Nomad 版本）、名稱、描述
- 實作響應式網格：桌面 3 欄、平板 2 欄、手機 1 欄
- 卡片應有 hover 效果，點擊導向詳情頁 `/[locale]/templates/[id]`
- 實作空狀態：當沒有模板時顯示友善提示訊息
- 圖片使用 `loading="lazy"` 實現懶載入
- 新增 i18n 翻譯鍵：`templates.title`、`templates.empty`、`templates.viewDetails`

**相關檔案**
- `packages/web/src/lib/templates.ts` - 新增模板資料存取層
- `packages/web/app/[locale]/page.tsx` - 修改首頁
- `packages/web/src/components/TemplateCard.tsx` - 新增模板卡片元件
- `packages/web/messages/en.json` - 新增翻譯
- `packages/web/messages/zh-TW.json` - 新增翻譯
- `packages/web/messages/ja.json` - 新增翻譯

**完成檢查**
- 執行 `npm run build` 確認建構成功
- 執行 `npm run dev` 並開啟 http://localhost:3000/en，確認模板網格正確顯示

**實作備註**
<!-- 執行過程中填寫重要的技術決策、障礙和需要傳遞的上下文 -->

---

### 實作模板詳情頁與下載功能

**實作要點**
- 建立動態路由頁面 `app/[locale]/templates/[id]/page.tsx`
- 使用 `generateStaticParams()` 為所有模板 × 語言組合產生靜態頁面
- 詳情頁顯示：大預覽圖（Nomad 版本）、模板名稱、完整描述、支援裝置列表
- 使用 shadcn Button 元件建立下載按鈕，分別提供 Nomad 和 Manta 版本下載
- 下載檔案命名格式：`{模板名稱}-{裝置名稱}.png`（例如 `daily-routine-nomad.png`）
- 實作下載功能：使用 `<a>` 標籤配合 `download` 屬性
- 提供返回列表的導航連結
- 處理無效模板 ID：顯示 404 頁面或導向首頁
- 新增 i18n 翻譯鍵：`templates.download`、`templates.downloadFor`、`templates.backToList`、`templates.devices.nomad`、`templates.devices.manta`

**相關檔案**
- `packages/web/app/[locale]/templates/[id]/page.tsx` - 新增詳情頁
- `packages/web/src/lib/templates.ts` - 可能需要擴充函式
- `packages/web/messages/en.json` - 新增翻譯
- `packages/web/messages/zh-TW.json` - 新增翻譯
- `packages/web/messages/ja.json` - 新增翻譯

**完成檢查**
- 執行 `npm run build` 確認所有模板頁面都能正確產生
- 開啟詳情頁，點擊下載按鈕確認檔案可下載且檔名正確

**實作備註**
<!-- 執行過程中填寫重要的技術決策、障礙和需要傳遞的上下文 -->

---

### 使用 shadcn 重構 LanguageSwitcher

**實作要點**
- 使用 shadcn 的 `DropdownMenu` 元件重構現有的 LanguageSwitcher
- 下拉選單顯示當前語言，點擊展開顯示所有可選語言
- 保留現有的 i18n 整合邏輯（useLocale、useRouter、usePathname）
- 確保樣式與整體網站一致（深色模式支援）
- 移除舊的按鈕樣式，改用 shadcn 元件樣式
- 確保無障礙性：鍵盤導航、ARIA 標籤

**相關檔案**
- `packages/web/src/components/LanguageSwitcher.tsx` - 重構現有元件
- `packages/web/src/components/ui/dropdown-menu.tsx` - shadcn 元件（如尚未安裝需先安裝）

**完成檢查**
- 開啟網站，確認語言切換器正確顯示為下拉選單
- 測試語言切換功能正常運作

**實作備註**
<!-- 執行過程中填寫重要的技術決策、障礙和需要傳遞的上下文 -->

---

### 執行驗收測試

**實作要點**
- 使用 AI 讀取 `acceptance.feature` 檔案
- 透過 Playwright MCP 或手動操作執行每個場景
- 驗證所有場景通過並記錄結果
- 如發現問題，記錄詳細的錯誤資訊和重現步驟
- 產生 `acceptance-report.md` 記錄測試結果

**相關檔案**
- `docs/specs/2026-01-11-generator-web-integration/acceptance.feature` - Gherkin 驗收測試場景
- `docs/specs/2026-01-11-generator-web-integration/acceptance-report.md` - 驗收測試報告（執行時生成）

**實作備註**
<!-- 執行過程中填寫 -->

---

### 更新專案文件

**實作要點**
- 更新 README.md：
  - 新增「Template Metadata」章節說明 meta 標籤格式
  - 更新「Creating New Templates」章節加入 meta 標籤步驟
  - 新增 web 套件的功能說明
- 更新 CLAUDE.md：
  - 更新「Creating New Templates」章節加入 meta 標籤格式
  - 新增 web 與 generator 整合說明
  - 更新檔案結構說明
- 更新 `.github/copilot-instructions.md`：同步模板建立指引
- 確保所有程式碼範例都是最新且可執行的

**相關檔案**
- `README.md` - 專案主要說明文件
- `CLAUDE.md` - AI 助手的專案指引文件
- `.github/copilot-instructions.md` - Copilot 指引文件

**實作備註**
<!-- 執行過程中填寫 -->

---

## 實作參考資訊

### 來自研究文件的技術洞察
> **文件路徑：** `docs/research/2026-01-11-generator-web-integration.md`

**檔案整合方案（方案一）**
- 在 web 的 `package.json` 加入 `"@supernote-templates/generator": "*"` 依賴
- 使用 prebuild 腳本將 `node_modules/@supernote-templates/generator/dist` 複製到 `public/templates`
- Turborepo 的 `^build` 設定會自動確保 generator 先建構

**元資料提取程式碼範例**
```javascript
const cheerio = require('cheerio');

function extractMetadata(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const $ = cheerio.load(html);

  const metadata = {
    id: path.basename(htmlPath, '.html'),
    category: $('meta[name="template:category"]').attr('content'),
    i18n: {}
  };

  ['en', 'zh-TW', 'ja'].forEach(locale => {
    metadata.i18n[locale] = {
      name: $(`meta[name="template:name:${locale}"]`).attr('content'),
      description: $(`meta[name="template:description:${locale}"]`).attr('content')
    };
  });

  return metadata;
}
```

**templates.json 輸出結構**
```json
{
  "version": 1,
  "templates": [
    {
      "id": "daily-routine",
      "devices": ["nomad", "manta"],
      "i18n": {
        "en": { "name": "Daily Routine", "description": "..." },
        "zh-TW": { "name": "每日計畫", "description": "..." },
        "ja": { "name": "デイリールーティン", "description": "..." }
      }
    }
  ]
}
```

**HTML meta 標籤格式**
```html
<head>
  <link rel="stylesheet" href="../styles/devices.css">

  <!-- 模板元資料 -->
  <meta name="template:name:en" content="Daily Routine">
  <meta name="template:description:en" content="A structured daily planner...">
  <meta name="template:name:zh-TW" content="每日計畫">
  <meta name="template:description:zh-TW" content="結構化的每日時間規劃表...">
  <meta name="template:name:ja" content="デイリールーティン">
  <meta name="template:description:ja" content="朝のルーティン...">
</head>
```

### 來自 PRD 的實作細節
> **文件路徑：** 參考上方 PRD 參考章節

**設計決策**
1. 預覽圖選擇：統一使用 Nomad 版本（1404×1872），解析度較小，縮放顯示時內容更清晰
2. 檔案命名：`{模板名稱}-{裝置名稱}.png`，例如 `daily-routine-nomad.png`
3. 空狀態：顯示友善提示訊息

**響應式網格規格**
- 桌面：3-4 欄
- 平板：2 欄
- 手機：1 欄

**下載流程**
- 詳情頁提供裝置版本選擇（Nomad / Manta）
- 點擊對應按鈕直接下載

### 關鍵技術決策

| 決策項目 | 選擇 | 理由 |
|---------|------|------|
| UI 元件庫 | shadcn/ui | 使用者指定，與 Tailwind v4 相容 |
| 檔案整合方式 | npm workspace 依賴 + prebuild | 符合 Turborepo 最佳實踐，保持套件獨立性 |
| 元資料管理 | HTML head meta 標籤 | Single Source of Truth，減少維護成本 |
| 預覽圖來源 | Nomad 版本 | 解析度較小，縮放後更清晰 |
| 跨平台相容 | Node.js fs 模組 | 避免 shell 指令的平台差異 |

### 現有架構重點

**Web 套件**
- Next.js 16.1.1 + React 19 + Tailwind CSS v4
- next-intl 4.7.0 處理 i18n（3 語言：en、zh-TW、ja）
- 靜態匯出模式（`output: "export"`）
- 路徑別名：`@/*` → `./src/*`

**Generator 套件**
- Puppeteer 24.26.1 處理 HTML → PNG 轉換
- `generate-all.js` 自動掃描 `templates/*.html`
- 輸出結構：`dist/nomad/`、`dist/manta/`
- deviceConfigs：`{ nomad: { width: 1404, height: 1872 }, manta: { width: 1920, height: 2560 } }`

**現有模板**
- `daily-routine.html` - 每日任務追蹤
- `lined-notebook.html` - 橫線筆記本
- `priority-todo.html` - 優先待辦事項
- `ruby-lined-notebook.html` - 注音橫線筆記本
