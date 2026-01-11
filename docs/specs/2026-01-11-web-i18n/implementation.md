# 實作計畫

## PRD 參考

**PRD 文件路徑：** 無（直接基於研究報告實作）
**相關研究文件：** `docs/research/2026-01-11-i18n-static-site.md`

## 任務概要

- [x] 安裝 next-intl 並建立基礎配置
- [x] 建立翻譯檔案結構與內容
- [x] 重構 App Router 為 [locale] 動態路由
- [x] 實作語言切換元件
- [ ] 驗證靜態輸出與多語言頁面生成
- [ ] 執行驗收測試
- [ ] 更新專案文件

## 任務細節

### 安裝 next-intl 並建立基礎配置

**實作要點**
- 在 `packages/web` 目錄安裝 `next-intl` 套件
- 建立 `src/i18n/routing.ts`，定義支援的語言（`en`, `zh-TW`, `ja`）和預設語言（`en`）
- 建立 `src/i18n/request.ts`，設定請求配置以支援靜態渲染
- 建立 `src/i18n/navigation.ts`，匯出 `Link`, `useRouter`, `usePathname` 等導航工具
- 修改 `next.config.ts`，加入 `createNextIntlPlugin` 插件

**相關檔案**
- `packages/web/package.json` - 新增 next-intl 依賴
- `packages/web/src/i18n/routing.ts` - 新建：路由配置
- `packages/web/src/i18n/request.ts` - 新建：請求配置
- `packages/web/src/i18n/navigation.ts` - 新建：導航工具
- `packages/web/next.config.ts` - 修改：加入插件

**完成檢查**
- 執行 `npm install` 確認套件安裝成功
- 執行 `npm run build` 確認無 TypeScript 錯誤

**實作備註**
照預期開發。額外建立了 messages 目錄和佔位翻譯檔案（en.json, zh-TW.json, ja.json），以便 TypeScript 能正確檢查 request.ts 中的動態 import。

---

### 建立翻譯檔案結構與內容

**實作要點**
- 建立 `messages/` 目錄存放翻譯檔案
- 建立 `messages/en.json`：英文翻譯（主要語言）
- 建立 `messages/zh-TW.json`：繁體中文翻譯
- 建立 `messages/ja.json`：日文翻譯
- 翻譯內容包含：網站標題、描述、按鈕文字、裝置名稱等 UI 文字
- 使用巢狀結構組織翻譯鍵值（如 `home.title`, `home.description`）

**相關檔案**
- `packages/web/messages/en.json` - 新建：英文翻譯
- `packages/web/messages/zh-TW.json` - 新建：繁體中文翻譯
- `packages/web/messages/ja.json` - 新建：日文翻譯

**完成檢查**
- 確認三個語言檔案的鍵值結構一致
- 使用 `JSON.parse()` 驗證 JSON 格式正確

**實作備註**
照預期開發。更新三個語言檔案，加入完整的翻譯內容和語言切換器所需的 `language` 翻譯鍵。

---

### 重構 App Router 為 [locale] 動態路由

**實作要點**
- 將現有的 `app/` 結構移動到 `app/[locale]/` 下
- 建立新的 `app/page.tsx` 作為根路徑，重導向到 `/en`
- 修改 `app/[locale]/layout.tsx`：
  - 加入 `generateStaticParams()` 函式生成所有語言版本
  - 加入 `setRequestLocale()` 呼叫以啟用靜態渲染
  - 使用 `NextIntlClientProvider` 包裹 children
  - 動態設定 `<html lang={locale}>`
- 修改 `app/[locale]/page.tsx`：
  - 加入 `setRequestLocale()` 呼叫
  - 使用 `useTranslations()` 取得翻譯文字
- 確保 `globals.css` 正確引入

**相關檔案**
- `packages/web/app/page.tsx` - 新建：根路徑重導向
- `packages/web/app/[locale]/layout.tsx` - 修改：加入 i18n 支援
- `packages/web/app/[locale]/page.tsx` - 修改：使用翻譯 API
- `packages/web/app/[locale]/globals.css` - 移動：樣式檔案

**完成檢查**
- 執行 `npm run dev`，訪問 `http://localhost:3000` 確認重導向到 `/en`
- 訪問 `/en`、`/zh-TW`、`/ja` 確認各語言頁面正常顯示

**實作備註**
[技術決策] tsconfig.json 的 `paths` 別名從 `./*` 改為 `./src/*`，使 `@/i18n/...` 路徑能正確解析到 `src/i18n/` 目錄。此變更影響所有使用 `@/` 別名的 import。

---

### 實作語言切換元件

**實作要點**
- 建立 `components/LanguageSwitcher.tsx` 元件
- 使用 `usePathname()` 和 `useRouter()` 從 next-intl 導航工具
- 顯示三個語言選項：English、繁體中文、日本語
- 當前語言應有視覺區分（如不同樣式或禁用狀態）
- 切換語言時保持在同一頁面
- 將語言切換器加入 layout 的適當位置（如頁面右上角）

**相關檔案**
- `packages/web/components/LanguageSwitcher.tsx` - 新建：語言切換元件
- `packages/web/app/[locale]/layout.tsx` - 修改：加入語言切換器

**完成檢查**
- 執行 `npm run dev`，點擊語言切換器確認可正確切換語言
- 確認切換後 URL 路徑正確變更（如 `/en` → `/zh-TW`）

**實作備註**
照預期開發。元件放置於 `src/components/LanguageSwitcher.tsx`，使用 `"use client"` 指令確保客戶端渲染。

---

### 驗證靜態輸出與多語言頁面生成

**實作要點**
- 執行 `npm run build` 進行靜態建置
- 檢查 `out/` 目錄確認生成了所有語言版本的頁面：
  - `out/en/index.html`
  - `out/zh-TW/index.html`
  - `out/ja/index.html`
  - `out/index.html`（重導向頁面）
- 確認每個語言版本的 HTML 包含正確的翻譯內容
- 確認 `<html lang="...">` 屬性正確設定
- 本地測試靜態檔案可正常運作

**相關檔案**
- `packages/web/out/` - 檢查：靜態輸出目錄
- `packages/web/out/en/index.html` - 檢查：英文版頁面
- `packages/web/out/zh-TW/index.html` - 檢查：繁體中文版頁面
- `packages/web/out/ja/index.html` - 檢查：日文版頁面

**完成檢查**
- 執行 `npm run build` 確認建置成功無錯誤
- 檢查 `out/` 目錄確認 `/en`、`/zh-TW`、`/ja` 子目錄存在
- 使用 `npx serve out` 或類似工具測試靜態網站可正常瀏覽

**實作備註**
<!-- 執行過程中填寫重要的技術決策、障礙和需要傳遞的上下文 -->

---

### 執行驗收測試

**實作要點**
- 使用 AI 讀取 acceptance.feature 檔案
- 透過指令或瀏覽器操作執行每個場景
- 驗證所有場景通過並記錄結果
- 如發現問題，記錄詳細的錯誤資訊和重現步驟

**相關檔案**
- `docs/specs/2026-01-11-web-i18n/acceptance.feature` - Gherkin 格式的驗收測試場景
- `docs/specs/2026-01-11-web-i18n/acceptance-report.md` - 詳細的驗收測試執行報告（執行時生成）

**實作備註**
<!-- 執行過程中填寫 -->

---

### 更新專案文件

**實作要點**
- 審查 README.md，更新 packages/web 的說明，加入多語言支援的說明
- 審查 CLAUDE.md，更新專案架構說明，加入 i18n 相關的開發指引
- 確保所有程式碼範例和指令都是最新且可執行的
- **注意**：不需要更新 docs/research 和 docs/specs 目錄中的歷史文件

**相關檔案**
- `README.md` - 專案主要說明文件
- `CLAUDE.md` - AI 助手的專案指引文件

**實作備註**
<!-- 執行過程中填寫 -->

---

## 實作參考資訊

### 來自研究文件的技術洞察
> **文件路徑：** `docs/research/2026-01-11-i18n-static-site.md`

**URL 結構策略（策略 B）**：
- 所有語言都使用路徑前綴：`/en`, `/zh-TW`, `/ja`
- 根路徑 `/` 重導向到預設語言 `/en`
- 這是靜態輸出模式下最穩健的方案，SEO 表現最佳

**next-intl 靜態輸出關鍵配置**：
- 不能使用 middleware（靜態輸出不支援）
- 必須在每個 layout 和 page 中呼叫 `setRequestLocale(locale)` 啟用靜態渲染
- 必須使用 `generateStaticParams()` 預先生成所有語言版本

**檔案結構**：
```
packages/web/
├── messages/
│   ├── en.json
│   ├── zh-TW.json
│   └── ja.json
├── src/
│   ├── i18n/
│   │   ├── routing.ts
│   │   ├── request.ts
│   │   └── navigation.ts
│   └── app/
│       ├── page.tsx          # 根路徑重導向
│       └── [locale]/
│           ├── layout.tsx
│           └── page.tsx
└── next.config.ts
```

### 來自 PRD 的實作細節

無 PRD 文件，直接基於研究報告實作。

### 關鍵技術決策

1. **選用 next-intl**：官方推薦方案，TypeScript 支援佳，支援 Server Components

2. **靜態渲染啟用方式**：使用 `setRequestLocale()` API，這是 next-intl 為靜態輸出提供的臨時解決方案

3. **根路徑處理**：使用 Next.js 的 `redirect()` 函式在根路徑重導向到 `/en`

4. **翻譯檔案組織**：使用 JSON 格式，巢狀結構按功能模組組織（如 `home.title`）

5. **語言切換器**：使用 next-intl 提供的 `useRouter()` 和 `usePathname()` 實現客戶端路由切換

**重要注意事項**：
- Next.js 16 中 middleware 檔案已更名為 `proxy.ts`，但靜態輸出不需要此檔案
- `createNextIntlPlugin` 需要在 `next.config.ts` 中正確配置
- 日文 locale 使用 `ja` 而非 `jp`（遵循 ISO 639-1 標準）
