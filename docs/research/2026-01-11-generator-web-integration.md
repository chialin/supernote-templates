# Generator 與 Web 整合研究報告

## 執行摘要

本研究針對如何將 `@supernote-templates/generator` 產生的 PNG 模板整合到 `@supernote-templates/web` 網站進行深入分析。經過調查專案現況、Turborepo 最佳實踐，以及 Cloudflare Pages 部署環境的特性，我們發現了一個清晰可行的整合方案。

關鍵發現：
- **靜態檔案整合是最佳選擇**：透過 Turborepo 的 `dependsOn` 機制，在 web 建構前自動複製 generator 的輸出檔案
- **HTML head 內嵌元資料是最佳管理方式**：將模板資訊寫在 HTML 的 meta 標籤中，建構時自動提取產生 JSON，實現 Single Source of Truth
- **原圖直接顯示搭配 Cloudflare Polish**：利用 Cloudflare 的自動圖片優化功能，無需額外產生縮圖

## 背景與脈絡

這個專案是一個 Turborepo monorepo，包含兩個主要套件：`generator` 負責將 HTML 模板轉換為 PNG 圖片，`web` 則是一個使用 Next.js 16 建構的靜態網站，目前已部署在 Cloudflare Pages（網址：https://supernote.yurenju.info/）。

目前 generator 已經可以成功產生模板的 PNG 檔案，輸出結構如下：

```
packages/generator/dist/
├── nomad/
│   ├── daily-routine.png
│   ├── lined-notebook.png
│   ├── priority-todo.png
│   └── ruby-lined-notebook.png
└── manta/
    ├── daily-routine.png
    ├── lined-notebook.png
    ├── priority-todo.png
    └── ruby-lined-notebook.png
```

web 套件則是一個基礎的 Next.js 網站，已經具備 i18n 支援（英文、繁體中文、日文），使用 `next-intl` 套件，並配置為靜態匯出模式（`output: "export"`）。現在的挑戰是如何優雅地將這兩個套件的輸出整合在一起。

## 研究問題定義

根據使用者需求和釐清後的條件，我們需要解決以下核心問題：

1. **檔案傳遞**：如何在 Turborepo 架構下，讓 generator 的 PNG 輸出成為 web 可用的靜態資源？
2. **元資料管理**：如何有效管理每個模板的名稱、描述、分類等資訊，並支援多語言？
3. **效能考量**：在不產生縮圖的情況下，如何確保大型 PNG 檔案（50-70KB）的載入效能？
4. **建構流程**：如何確保建構順序正確，避免 web 建構時缺少 PNG 檔案？

## 技術分析

### 程式碼庫現況

專案的 Turborepo 配置（[turbo.json](../../turbo.json)）已經定義了基本的建構順序：

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**", "out/**"]
    }
  }
}
```

這個 `^build` 配置表示每個套件的 build 任務會先等待其依賴套件完成建構。目前 web 和 generator 之間沒有建立依賴關係，所以它們的建構順序是不確定的。

Next.js 的配置（[next.config.ts](../../packages/web/next.config.ts)）已經設定為靜態匯出模式，並禁用了圖片優化（因為靜態匯出不支援伺服器端圖片處理）：

```typescript
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};
```

### 業界最佳實踐

根據 [Turborepo 官方文件](https://turborepo.com/docs/crafting-your-repository/structuring-a-repository)，monorepo 中套件之間的檔案共享有幾種方式：

1. **透過 npm 依賴**：將 generator 作為 web 的依賴，在 build 階段存取其輸出
2. **透過腳本複製**：使用 prebuild 腳本將檔案從一個套件複製到另一個
3. **透過共享輸出目錄**：兩個套件輸出到同一個目錄

根據 [Next.js 靜態資源文件](https://nextjs.org/docs/pages/building-your-application/optimizing/static-assets)，`public` 資料夾是放置靜態檔案的標準位置。而 [belgattitude/nextjs-monorepo-example](https://github.com/belgattitude/nextjs-monorepo-example) 這個範例專案展示了如何在 monorepo 中共享資源。

對於 Cloudflare Pages 部署，[Cloudflare Polish](https://developers.cloudflare.com/images/polish/) 提供了自動圖片優化功能，可以在不修改原始碼的情況下壓縮圖片，這對於直接顯示原圖的策略來說是很好的補充。

## 解決方案探索與評估

### 方案一：透過 npm workspace 依賴 + prebuild 腳本

這個方案的核心理念是利用 Turborepo 原生的依賴管理機制。透過將 generator 加入 web 的 devDependencies，Turborepo 會自動確保 generator 先建構。然後使用 prebuild 腳本將 PNG 檔案複製到 web 的 public 資料夾。

實作方式：
1. 在 web 的 `package.json` 加入 `"@supernote-templates/generator": "*"` 依賴
2. 新增 prebuild 腳本將 `node_modules/@supernote-templates/generator/dist` 複製到 `public/templates`
3. 更新 turbo.json 的 inputs 確保快取正確失效

優點：
- 符合 Turborepo 的設計理念
- 建構順序自動保證
- 快取機制可正確運作

缺點：
- 複製邏輯需要處理跨平台相容性（Windows vs Unix）
- 需要確保 generator 的 package.json 正確 export dist 資料夾

### 方案二：透過根目錄建構腳本統一處理

這個方案在根目錄的 package.json 新增一個統一的建構腳本，明確定義執行順序。

實作方式：
1. 根目錄新增 `"build:all": "npm run build -w @supernote-templates/generator && npm run copy-templates && npm run build -w @supernote-templates/web"` 腳本
2. 新增 `copy-templates` 腳本負責檔案複製

優點：
- 流程清晰明確
- 容易除錯

缺點：
- 繞過了 Turborepo 的智慧快取機制
- 每次都需要完整重建，失去增量建構的優勢

### 方案三：共享輸出目錄

讓 generator 直接輸出到 web 的 public 資料夾。

實作方式：
修改 generator 的輸出路徑為 `../web/public/templates`

優點：
- 最簡單直接
- 無需複製步驟

缺點：
- 違反了套件邊界原則
- generator 與 web 產生強耦合
- 難以獨立測試或使用 generator

### 推薦方案：方案一

經過評估，方案一是最符合 Turborepo 最佳實踐且最具維護性的選擇。它保持了套件的獨立性，同時利用了工具鏈的原生功能來管理依賴和建構順序。

## 元資料管理設計

### 方案評估：獨立 JSON 配置檔 vs HTML head 內嵌

在評估元資料管理方式時，我們比較了兩種方案：

**方案 A：獨立 JSON 配置檔**
- 優點：所有模板資訊集中一處，方便批次編輯；可定義模板之間的關係
- 缺點：需要維護兩個地方（HTML + JSON）；新增模板時容易忘記更新；id 需與檔名同步

**方案 B：HTML head 內嵌 meta 標籤**
- 優點：Single Source of Truth；新增模板只需建立 HTML；符合現有自動掃描機制
- 缺點：需解析 HTML 提取資訊；無法定義跨模板資訊

### 推薦方案：HTML head 內嵌 meta 標籤

考量到專案特性（generator 已有自動掃描機制、模板數量有限、減少人為錯誤），我們選擇將元資料直接寫在 HTML 模板的 `<head>` 區塊中。

#### HTML 模板元資料格式

每個 HTML 模板需要在 `<head>` 區塊加入以下 meta 標籤：

```html
<!-- packages/generator/templates/daily-routine.html -->
<head>
  <!-- 必要的樣式引入 -->
  <link rel="stylesheet" href="../styles/devices.css">

  <!-- 模板元資料 -->
  <meta name="template:category" content="productivity">

  <!-- 英文（必填） -->
  <meta name="template:name:en" content="Daily Routine">
  <meta name="template:description:en" content="A structured daily planner with time blocks for morning routine, work sessions, and evening wind-down.">

  <!-- 繁體中文 -->
  <meta name="template:name:zh-TW" content="每日計畫">
  <meta name="template:description:zh-TW" content="結構化的每日時間規劃表，包含晨間例行、工作時段和晚間放鬆區塊。">

  <!-- 日文 -->
  <meta name="template:name:ja" content="デイリールーティン">
  <meta name="template:description:ja" content="朝のルーティン、仕事セッション、夜のリラックスタイムを含む構造化されたデイリープランナー。">
</head>
```

#### Meta 標籤規格

| 標籤名稱 | 必填 | 說明 |
|---------|------|------|
| `template:category` | 是 | 模板分類，用於篩選。建議值：`productivity`、`note-taking`、`planning`、`creative` |
| `template:name:{locale}` | 是 | 模板顯示名稱，需提供所有支援語言版本（en、zh-TW、ja） |
| `template:description:{locale}` | 是 | 模板描述，需提供所有支援語言版本 |

#### 建構時自動提取

`generate-all.js` 會在產生 PNG 的同時，使用 cheerio 解析 HTML 並提取 meta 資訊，最終輸出 `dist/templates.json`：

```javascript
// generate-all.js 新增的提取邏輯
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

輸出的 `dist/templates.json` 結構：

```json
{
  "version": 1,
  "templates": [
    {
      "id": "daily-routine",
      "category": "productivity",
      "devices": ["nomad", "manta"],
      "i18n": {
        "en": {
          "name": "Daily Routine",
          "description": "A structured daily planner with time blocks..."
        },
        "zh-TW": {
          "name": "每日計畫",
          "description": "結構化的每日時間規劃表..."
        },
        "ja": {
          "name": "デイリールーティン",
          "description": "朝のルーティン..."
        }
      }
    }
  ]
}
```

這種設計的優點：
- **Single Source of Truth**：模板內容和元資料放在一起，不會不同步
- **符合現有流程**：generator 已經會掃描所有 HTML，這只是額外提取資訊
- **新增模板更簡單**：只需建立 HTML 檔案，不用更新其他檔案
- **類型安全**：輸出的 JSON 可以輕易產生 TypeScript 類型定義

### 文件更新需求

實作完成後，需要更新以下文件以說明模板元資料的填寫方式：

1. **README.md**：在「Creating New Templates」章節加入 meta 標籤說明
2. **CLAUDE.md**：更新「Creating New Templates」章節，加入必要的 meta 標籤格式
3. **.github/copilot-instructions.md**：同步更新模板建立指引

這些文件更新應該包含：
- Meta 標籤的完整格式範例
- 各欄位的說明和建議值
- 多語言翻譯的注意事項

## 建議的實作架構

### 檔案結構變更

```
packages/
├── generator/
│   ├── templates/           # 現有 HTML 模板（加入 meta 標籤）
│   │   ├── daily-routine.html
│   │   ├── lined-notebook.html
│   │   ├── priority-todo.html
│   │   └── ruby-lined-notebook.html
│   ├── scripts/
│   │   └── generate-all.js  # 修改：新增元資料提取邏輯
│   └── dist/                # 建構輸出
│       ├── nomad/
│       ├── manta/
│       └── templates.json   # 新增：自動產生的元資料
│
└── web/
    ├── public/
    │   └── templates/       # 新增：建構時從 generator 複製
    │       ├── nomad/
    │       ├── manta/
    │       └── templates.json
    ├── scripts/
    │   └── copy-templates.js  # 新增：跨平台複製腳本
    └── src/
        └── lib/
            └── templates.ts   # 新增：模板資料存取層
```

### 建構流程

```
npm run build
    │
    ├── 1. @supernote-templates/generator build
    │       └── generate-all.js
    │           ├── 產生 PNG 到 dist/nomad/ 和 dist/manta/
    │           └── 提取 HTML meta 標籤，產生 dist/templates.json
    │
    └── 2. @supernote-templates/web build
            ├── prebuild: copy-templates.js
            │   └── 複製 generator/dist/* 到 public/templates/
            └── next build (靜態匯出)
```

### package.json 變更

**packages/web/package.json:**
```json
{
  "scripts": {
    "prebuild": "node scripts/copy-templates.js",
    "build": "next build",
    "dev": "next dev"
  },
  "devDependencies": {
    "@supernote-templates/generator": "*"
  }
}
```

## 效能與部署考量

### 圖片載入效能

目前的 PNG 檔案大小約為 12KB-70KB，這在現代網路環境下是可接受的。搭配以下策略可以確保良好的使用者體驗：

1. **Cloudflare 自動優化**：啟用 Cloudflare Polish 功能，自動壓縮圖片
2. **懶載入**：使用 `loading="lazy"` 屬性，只在圖片進入視窗時才載入
3. **合適的 CSS 縮放**：雖然顯示原圖，但透過 CSS 控制顯示尺寸，確保版面美觀
4. **預載關鍵圖片**：對於首屏的第一張模板圖片，可以使用 `<link rel="preload">`

### Cloudflare Pages 配置

Cloudflare Pages 提供的自動功能：
- **Polish（圖片壓縮）**：Pro 方案以上支援，可減少約 20-40% 的圖片大小
- **快取**：靜態資源自動快取，減少重複載入
- **Brotli 壓縮**：對所有文字類資源自動啟用

建議的 `_headers` 檔案配置：
```
/templates/*
  Cache-Control: public, max-age=31536000, immutable
```

## 下一步行動計畫

實施需要分階段進行。第一階段重點是建立基礎架構讓 PNG 檔案可以在 web 中存取，第二階段則是實作完整的瀏覽和下載介面。

### 立即行動（Phase 1 - 基礎整合）

1. **為現有模板加入 meta 標籤**：更新所有 HTML 模板，加入 `template:category`、`template:name:{locale}`、`template:description:{locale}` 等 meta 標籤
2. **修改 generate-all.js**：新增元資料提取邏輯，安裝 cheerio 依賴，輸出 `dist/templates.json`
3. **新增複製腳本**：在 web 建立跨平台的 `copy-templates.js`
4. **更新依賴關係**：在 web 的 package.json 加入 generator 依賴
5. **驗證建構流程**：確保 `npm run build` 可以正確產生包含 PNG 和 templates.json 的靜態網站
6. **更新專案文件**：更新 README.md、CLAUDE.md、copilot-instructions.md，說明模板 meta 標籤的填寫方式

### 中期目標（Phase 2 - 使用者介面）

1. **實作模板列表頁**：顯示所有可用模板的網格視圖
2. **實作模板詳情頁**：展示模板預覽、支援的裝置、下載連結
3. **加入裝置篩選器**：讓使用者選擇 Nomad 或 Manta
4. **實作下載功能**：提供直接下載或選擇裝置版本下載

### PRD 建議

建議撰寫一份 PRD 來定義 Phase 2 的使用者介面需求，包含：
- 首頁改版：從目前的簡單介紹頁變成模板瀏覽頁
- 模板卡片設計：預覽圖、標題、描述、下載按鈕
- 響應式設計規格
- 下載流程（單一裝置 vs 選擇裝置）

Phase 1 的基礎整合工作相對單純，可以直接進行實作。

## 參考資料

### 技術文件
- [Turborepo - Structuring a repository](https://turborepo.com/docs/crafting-your-repository/structuring-a-repository)
- [Next.js - Static Exports](https://nextjs.org/docs/app/guides/static-exports)
- [Next.js - Static Assets](https://nextjs.org/docs/pages/building-your-application/optimizing/static-assets)
- [Cloudflare Polish](https://developers.cloudflare.com/images/polish/)

### 實作範例
- [belgattitude/nextjs-monorepo-example](https://github.com/belgattitude/nextjs-monorepo-example) - 展示 monorepo 中資源共享的完整範例
- [Vercel Monorepo Starter](https://vercel.com/templates/next.js/monorepo-turborepo) - 官方 Turborepo + Next.js 範本

### 延伸閱讀
- [Turborepo - Managing dependencies](https://turborepo.com/docs/crafting-your-repository/managing-dependencies)
- [Cloudflare - Optimizing images on the web](https://blog.cloudflare.com/optimizing-images/)
