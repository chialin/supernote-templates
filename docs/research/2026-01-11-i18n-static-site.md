# Next.js 靜態網站多語言解決方案研究

## 執行摘要

本研究針對 Supernote Templates 網站（`packages/web`）的多語言支援需求進行分析。專案使用 Next.js 16 並設定為純靜態輸出（`output: "export"`），需要支援英文、繁體中文和日文三種語言，內容量屬於少量靜態文字。

經過調查，我們發現 Next.js 的內建 i18n 路由功能與靜態輸出模式不相容，因此需要採用替代方案。針對專案的特性，有三種主要方案可供選擇，各有其適用場景與權衡。

## 背景與脈絡

### 專案現況

目前 `packages/web` 是一個剛建立的 Next.js 16 專案，配置如下：

- **輸出模式**：純靜態輸出（`output: "export"`）
- **框架**：Next.js 16.1.1 + React 19 + Tailwind CSS 4
- **路由**：App Router
- **頁面結構**：單一首頁，未來將擴展為樣板下載頁面

網站的主要用途是提供 Supernote 裝置樣板的預覽與下載，支援 Nomad 和 Manta 兩種裝置。由於是靜態網站，不需要後端伺服器，可部署在任何靜態網站託管服務上。

### 核心限制

Next.js 的內建國際化路由（`i18n` 配置）需要伺服器端處理，因此當使用 `output: "export"` 時會出現錯誤：

> "Specified 'i18n' cannot be used with 'output: export'"

這意味著我們無法使用 Next.js 原生的 i18n 功能，必須採用基於 `[locale]` 動態路由段的替代方案。

## 預設語言處理策略評估

在深入解決方案之前，需要先決定根路徑（`/`）的處理方式，這會影響整體 URL 結構。

### 策略 A：英文為預設，根路徑顯示英文（無 `/en` 前綴）

**URL 結構範例**：
- `/` → 英文首頁
- `/templates` → 英文樣板頁
- `/zh-TW/templates` → 繁體中文樣板頁
- `/ja/templates` → 日文樣板頁

**優點**：
- 英文使用者獲得最簡潔的 URL
- 對於以英文為主要受眾的網站較為直觀
- 減少英文頁面的 URL 長度

**缺點**：
- 靜態輸出模式下**無法實現**此策略，因為沒有伺服器端 middleware 來處理路由
- 如果要實現，需要在根目錄和 `[locale]` 目錄都維護頁面，造成程式碼重複
- SEO 上可能造成英文內容有兩個 URL（`/` 和 `/en`），需要設定 canonical URL

### 策略 B：所有語言都有前綴，根路徑重導向

**URL 結構範例**：
- `/` → 重導向到 `/en`
- `/en/templates` → 英文樣板頁
- `/zh-TW/templates` → 繁體中文樣板頁
- `/ja/templates` → 日文樣板頁

**優點**：
- 所有語言的 URL 結構一致，易於理解和維護
- 符合靜態輸出的限制，實作簡單
- SEO 友善，每個語言版本有明確獨立的 URL
- 搜尋引擎可以輕易索引各語言版本
- URL 可直接分享，接收者能看到正確的語言版本

**缺點**：
- 英文 URL 多一層 `/en` 前綴
- 使用者首次訪問 `/` 會有一次重導向

### 策略 C：根據瀏覽器語言自動偵測後重導向

**URL 結構範例**：
- `/` → 根據 `Accept-Language` 重導向到對應語言
- `/en/templates` → 英文樣板頁
- `/zh-TW/templates` → 繁體中文樣板頁
- `/ja/templates` → 日文樣板頁

**優點**：
- 使用者首次訪問時獲得最佳體驗（理論上）

**缺點**：
- 靜態輸出模式下**無法在伺服器端實現**，需要依賴 client-side JavaScript
- 對 SEO 不利，爬蟲可能無法正確索引
- 實作複雜度高
- 可能造成使用者困惑（預期語言與實際不符）

### 建議

**推薦採用策略 B**：所有語言都有前綴，根路徑重導向到預設語言（`/en`）。

這是靜態輸出模式下最穩健、最易維護的方案。雖然英文 URL 會多一層 `/en`，但好處是：
1. 程式碼結構清晰，所有頁面都在 `[locale]` 目錄下
2. 無需重複程式碼
3. SEO 表現最佳
4. 未來擴展其他語言時結構不需改變

## 技術解決方案評估

### 方案一：next-intl 函式庫（推薦）

[next-intl](https://next-intl.dev/) 是目前 Next.js App Router 生態系統中最成熟的 i18n 解決方案，被 Next.js 官方文件推薦。

**實作方式**：

```
packages/web/
├── messages/
│   ├── en.json
│   ├── zh-TW.json
│   └── ja.json
├── src/
│   ├── i18n/
│   │   ├── routing.ts      # 路由配置
│   │   └── request.ts      # 請求配置
│   └── app/
│       ├── page.tsx        # 根路徑重導向
│       └── [locale]/
│           ├── layout.tsx
│           └── page.tsx
└── next.config.ts
```

**關鍵配置**：

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'zh-TW', 'ja'],
  defaultLocale: 'en'
});
```

```typescript
// app/[locale]/layout.tsx
import { setRequestLocale } from 'next-intl/server';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh-TW' }, { locale: 'ja' }];
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // ...
}
```

**靜態輸出注意事項**：
- 必須在每個 layout 和 page 中呼叫 `setRequestLocale(locale)` 來啟用靜態渲染
- 不能使用 middleware（靜態輸出不支援）
- 需要使用 `generateStaticParams` 預先生成所有語言版本

**優點**：
- 功能完整：支援 ICU 訊息格式、複數處理、日期/數字格式化
- TypeScript 支援良好，有自動完成和編譯時檢查
- 支援 Server Components 和 Client Components
- Bundle size 優化，按路由載入翻譯
- 社群活躍，文件完善

**缺點**：
- 靜態輸出需要額外配置（`setRequestLocale`）
- 新增依賴套件
- 學習曲線略高於簡單方案

**評估**：
- 實作複雜度：中
- 維護成本：低
- 適合場景：需要長期維護、可能擴展功能的專案

### 方案二：手動實作 JSON 翻譯系統

不使用外部函式庫，自行建立輕量級的翻譯系統。

**實作方式**：

```
packages/web/
├── messages/
│   ├── en.json
│   ├── zh-TW.json
│   └── ja.json
├── lib/
│   ├── i18n.ts            # 翻譯工具函式
│   └── locales.ts         # 語言配置
└── app/
    ├── page.tsx           # 根路徑重導向
    └── [locale]/
        ├── layout.tsx
        └── page.tsx
```

**核心程式碼**：

```typescript
// lib/locales.ts
export const locales = ['en', 'zh-TW', 'ja'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';

// lib/i18n.ts
import en from '../messages/en.json';
import zhTW from '../messages/zh-TW.json';
import ja from '../messages/ja.json';

const messages = { en, 'zh-TW': zhTW, ja };

export function getTranslations(locale: Locale) {
  return messages[locale] || messages[defaultLocale];
}

export function t(translations: Record<string, string>, key: string) {
  return translations[key] || key;
}
```

**優點**：
- 零依賴，完全掌控實作細節
- 最小的 bundle size
- 簡單直接，容易理解

**缺點**：
- 需要自行實作所有功能（複數、插值等）
- 沒有類型安全（除非自行實作）
- 維護成本較高
- 缺乏社群支援

**評估**：
- 實作複雜度：低（基本功能）/ 高（完整功能）
- 維護成本：高
- 適合場景：極簡需求、不想引入外部依賴

### 方案三：next-export-i18n 函式庫

[next-export-i18n](https://github.com/martinkr/next-export-i18n) 專門為靜態輸出設計的 i18n 方案。

**特點**：
- 專為 `output: "export"` 設計
- 純 client-side 運作
- 使用 query parameter（`?lang=en`）或 localStorage 儲存語言選擇

**缺點**：
- 只支援 Client Components（需要 `"use client"`）
- URL 結構使用 query parameter，不如路徑前綴 SEO 友善
- 不支援 Server Components
- 更新較不頻繁

**評估**：
- 實作複雜度：低
- 維護成本：中
- 適合場景：不在意 SEO、純 client-side 應用

## 方案比較總結

| 面向 | next-intl | 手動實作 | next-export-i18n |
|------|-----------|----------|------------------|
| 靜態輸出支援 | ✅ 需配置 | ✅ 原生 | ✅ 專門設計 |
| Server Components | ✅ | ✅ | ❌ |
| URL 路徑前綴 | ✅ | ✅ | ❌ (query param) |
| TypeScript 支援 | ✅ 優秀 | ⚠️ 需自行實作 | ⚠️ 基本 |
| SEO 友善度 | ✅ 高 | ✅ 高 | ⚠️ 低 |
| 複數/日期格式化 | ✅ 內建 | ❌ 需自行實作 | ❌ |
| Bundle Size | 中等 | 最小 | 小 |
| 學習曲線 | 中等 | 低 | 低 |
| 社群支援 | ✅ 活躍 | ❌ | ⚠️ 有限 |

## 建議與決策指引

### 推薦方案：next-intl

基於以下考量，建議採用 **next-intl** 作為 i18n 解決方案：

1. **專案特性匹配**：雖然目前內容量少，但 next-intl 的結構清晰，不會因為功能豐富而增加太多複雜度。

2. **長期維護性**：作為官方推薦的方案，next-intl 有穩定的維護和更新，不需要擔心相容性問題。

3. **SEO 考量**：路徑前綴方式（`/en`, `/zh-TW`, `/ja`）對 SEO 最友善，每個語言版本都有獨立的 URL。

4. **擴展性**：如果未來需要增加更多語言或複雜的翻譯功能（如複數處理），next-intl 已經內建支援。

5. **開發體驗**：TypeScript 自動完成和編譯時檢查能有效減少翻譯鍵值錯誤。

### 替代方案：手動實作

如果希望保持專案的極簡性，不想引入外部依賴，可以考慮手動實作。這對於只有 50-100 個翻譯項目的小型專案是可行的。

### 不建議：next-export-i18n

雖然它專為靜態輸出設計，但 query parameter 的 URL 結構不符合你選擇的路徑前綴偏好，且 SEO 表現較差。

## 下一步行動計畫

實施分為兩個主要階段：

**第一階段：基礎架構建立**
- 安裝 next-intl 套件
- 建立 i18n 配置檔案結構
- 設定 `[locale]` 動態路由
- 建立翻譯 JSON 檔案（先完成英文版）
- 修改 `next.config.ts` 加入 next-intl 插件

**第二階段：內容翻譯與測試**
- 完成繁體中文和日文翻譯
- 加入語言切換元件
- 測試靜態輸出是否正常生成所有語言版本
- 驗證 SEO 相關設定（hreflang 標籤等）

### 關於 PRD

由於這是一個明確的技術實作任務，且解決方案已經清楚，可以選擇：
- **直接進行實作**：如果你對 next-intl 方案沒有疑慮
- **撰寫 PRD**：如果想要更詳細地規劃 UI/UX 細節（如語言切換器的位置和樣式）

## 參考資料

### 技術文件
- [Next.js Internationalization Guide](https://nextjs.org/docs/app/guides/internationalization)
- [next-intl Getting Started](https://next-intl.dev/docs/getting-started/app-router)
- [next-intl Routing Setup](https://next-intl.dev/docs/routing/setup)

### 實作範例
- [Next.js Static i18n Demo (GitHub)](https://github.com/RockyStrongo/next-i18n-static)
- [Tutorial: Internationalize Your Next.js Static Site](https://dev.to/rockystrongo/tutorial-internationalize-your-nextjs-static-site-with-app-router-34hp)

### 延伸閱讀
- [next-intl vs next-i18next 比較](https://intlayer.org/blog/next-i18next-vs-next-intl-vs-intlayer)
- [Next.js i18n with Static Export (Locize)](https://www.locize.com/blog/next-i18n-static/)
- [GitHub Discussion: i18n prefix for default locale](https://github.com/vercel/next.js/discussions/18419)
