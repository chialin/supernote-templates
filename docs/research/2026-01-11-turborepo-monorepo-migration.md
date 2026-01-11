# Turborepo Monorepo 遷移與靜態網站架構研究

## 執行摘要

本研究針對將現有的 supernote-templates 專案轉換為 Turborepo monorepo 架構進行深入分析，目標是在保留現有 PNG 產生器功能的同時，新增一個展示樣板的靜態網站。經過調查後，我們發現這是一個非常適合漸進式遷移的情境：現有專案結構簡潔，Turborepo 的設計理念正是「薄層包裝」，不會對現有程式碼造成干擾。

關鍵發現：
- Turborepo 可以漸進式導入，不需要一次性重構整個專案
- Next.js 透過 `output: 'export'` 配置可完美支援純靜態網站輸出
- 現有的 PNG 產生器可以作為獨立 package 保留，甚至可以與網站建置流程整合

## 背景與脈絡

supernote-templates 是一個為 Supernote 電子墨水設備設計的 HTML 樣板產生器，使用 Puppeteer 將 HTML 樣板轉換為 PNG 圖片。目前的專案是單一 package 結構，包含：

- **templates/**：HTML 樣板檔案（目前有 4 個樣板）
- **styles/**：共用 CSS 變數和裝置媒體查詢
- **scripts/**：PNG 轉換腳本

用戶希望擴展專案範圍，新增一個展示這些樣板的靜態網站，讓使用者可以瀏覽樣板預覽並下載對應的 PNG 檔案。這個需求自然地導向 monorepo 架構，因為我們需要管理兩個相關但獨立的應用程式。

## 研究問題與發現過程

### 初始需求分析

用戶的核心需求可以拆解為：
1. 將專案轉換為 Turborepo monorepo
2. 保留現有的 PNG 產生器功能
3. 新增一個 Next.js 靜態網站用於展示樣板

### 技術選型考量

**為什麼選擇 Turborepo？**

Turborepo 是 Vercel 開發的高效能 JavaScript/TypeScript monorepo 建置系統，它的設計理念是「薄層包裝」——不會強制你修改現有程式碼，只是作為任務執行器來協調多個 package 的建置流程。這對於現有專案的遷移特別友好。

**為什麼選擇 Next.js 靜態匯出？**

Next.js 透過 `output: 'export'` 配置可以產生純靜態 HTML/CSS/JS 檔案，非常適合：
- 部署到 GitHub Pages 或任何靜態檔案託管服務
- 不需要伺服器端運算
- SEO 友好（預渲染 HTML）

## 技術分析：深入理解架構

### 4.1 現有專案結構

```
supernote-templates/
├── templates/           # HTML 樣板 (4 個檔案)
├── styles/
│   └── devices.css      # 共用 CSS 變數
├── scripts/
│   ├── convert-to-png.js    # 單檔轉換
│   ├── generate-all.js      # 批次產生
│   └── auto-fill-rows.js    # 輔助腳本
├── dist/                # 產生的 PNG (gitignored)
├── package.json         # 單一依賴：puppeteer
└── ...
```

專案結構非常簡潔，只有一個生產依賴（puppeteer），這使得遷移風險很低。

### 4.2 目標 Monorepo 結構

採用簡化的單一 `packages/` 目錄結構（`apps/` 和 `packages/` 在技術上沒有差別，純粹是慣例）：

```
supernote-templates/
├── packages/
│   ├── generator/              # PNG 產生器（現有程式碼）
│   │   ├── templates/
│   │   ├── styles/
│   │   ├── scripts/
│   │   └── package.json
│   └── web/                    # Next.js 靜態網站
│       ├── app/                # App Router 頁面
│       ├── public/             # 靜態資源（PNG 預覽圖）
│       ├── next.config.js
│       └── package.json
├── turbo.json                  # Turborepo 任務配置
├── package.json                # 根目錄 workspace 配置
└── ...
```

### 4.3 Turborepo 配置分析

**根目錄 package.json：**

```json
{
  "name": "supernote-templates",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "generate": "turbo run generate"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "npm@10.0.0"
}
```

**turbo.json：**

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build", "generate"],
      "outputs": [".next/**", "!.next/cache/**", "out/**"]
    },
    "generate": {
      "outputs": ["dist/**"]
    },
    "dev": {
      "persistent": true,
      "cache": false
    }
  }
}
```

這個配置的關鍵點：
- `build` 任務依賴 `generate`，確保網站建置前 PNG 已經產生
- `outputs` 定義快取目標，讓 Turborepo 可以跳過未變更的任務
- `generate` 任務對應 PNG 產生器

### 4.4 Next.js 靜態匯出配置

**next.config.js：**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true  // 靜態匯出不支援伺服器端圖片優化
  },
  trailingSlash: true  // 適合 GitHub Pages
}

module.exports = nextConfig
```

**支援的功能：**
- 動態路由（透過 generateStaticParams）
- CSS Modules、Tailwind CSS
- 客戶端資料獲取
- 預載入和程式碼分割

**不支援的功能（靜態匯出限制）：**
- API Routes
- 伺服器端渲染 (SSR)
- 增量靜態再生 (ISR)
- 伺服器端圖片優化

這些限制對於我們的用例不是問題，因為我們的網站只需要展示靜態內容。

## 解決方案探索與評估

### 採用方案：統一 packages 結構

將所有專案放在 `packages/` 目錄下，不區分 `apps/` 和 `packages/`。

**核心理念：** `apps/` 和 `packages/` 在 Turborepo 中只是慣例命名，沒有技術差異。使用單一目錄結構更簡潔。

**評估：**
- **實作複雜度：** 低 - 結構簡單明確
- **維護影響：** 正面 - 所有專案位置一目了然
- **風險等級：** 低 - 不涉及核心邏輯修改

## 建議與決策指引

### 建議的實施步驟

**階段一：建立 Monorepo 基礎架構**

1. 在根目錄建立 `turbo.json` 配置
2. 更新根目錄 `package.json` 為 workspace 根目錄
3. 建立 `packages/` 目錄
4. 將現有程式碼移動到 `packages/generator/`

**階段二：建立 Next.js 網站骨架**

1. 在 `packages/web/` 建立最基礎的 Next.js 專案
2. 配置 `output: 'export'` 進行靜態匯出
3. 建立簡單的首頁確認建置流程正常

**階段三：整合與測試**

1. 設定 Turborepo 任務依賴
2. 確認 `npm run generate` 和 `npm run build` 正常運作
3. 測試靜態匯出結果

### 關鍵配置檔案

以下是實施所需的關鍵配置：

**根目錄 package.json：**
```json
{
  "name": "supernote-templates",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "generate": "turbo run generate"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

**packages/generator/package.json：**
```json
{
  "name": "@supernote-templates/generator",
  "version": "1.0.0",
  "scripts": {
    "generate": "node scripts/generate-all.js"
  },
  "dependencies": {
    "puppeteer": "^24.26.1"
  }
}
```

**packages/web/package.json：**
```json
{
  "name": "@supernote-templates/web",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

## 下一步行動計畫

### 立即行動

1. **確認 Node.js 版本：** Turborepo 和 Next.js 需要 Node.js 18+
2. **備份：** 確保 git 狀態乾淨，可以隨時回滾

### 中期目標

實施完成後，網站內容開發可以包括：
- 樣板預覽圖片展示
- 設備選擇和下載功能
- 樣板詳細說明

### PRD 需求

建議撰寫一份 PRD 來詳細規劃網站的功能需求，包括：
- 樣板展示頁面設計
- 下載流程設計
- 未來可能的功能擴展（如：自訂樣板參數）

## 參考資料

### 技術文件

- [Turborepo 官方文件 - 專案結構](https://turborepo.com/docs/crafting-your-repository/structuring-a-repository)
- [Turborepo 官方文件 - 添加到現有專案](https://turborepo.com/repo/docs/getting-started/add-to-existing-repository)
- [Next.js 靜態匯出指南](https://nextjs.org/docs/pages/guides/static-exports)

### 實作範例

- [Vercel Monorepo 模板](https://vercel.com/templates/next.js/monorepo-turborepo)
- [egghead.io Turborepo 遷移課程](https://egghead.io/courses/migrate-a-monorepo-from-npm-workspaces-to-turborepo-79d6b32d)

### 延伸閱讀

- [Turborepo 完整指南 - DEV Community](https://dev.to/araldhafeeri/complete-guide-to-turborepo-from-zero-to-production-3ehb)
- [Next.js 圖片優化與靜態匯出](https://github.com/Niels-IO/next-image-export-optimizer)
