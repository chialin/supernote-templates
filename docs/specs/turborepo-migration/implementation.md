# 實作計畫

## 研究文件參考

**研究文件路徑：** `docs/research/2026-01-11-turborepo-monorepo-migration.md`

## 任務概要

- [x] 建立 Turborepo 基礎架構
- [x] 遷移 generator 到 packages 目錄
- [ ] 建立 Next.js 網站骨架
- [ ] 配置 Turborepo 任務管道
- [ ] 執行驗收測試
- [ ] 更新專案文件

## 任務細節

### 建立 Turborepo 基礎架構

**實作要點**
- 在根目錄建立 `turbo.json` 配置檔
- 更新根目錄 `package.json`：新增 `workspaces: ["packages/*"]`、更新 scripts、新增 turbo 為 devDependency
- 建立 `packages/` 目錄結構
- 將 `.turbo` 加入 `.gitignore`

**相關檔案**
- `turbo.json` - 新建立的 Turborepo 配置
- `package.json` - 更新為 workspace 根目錄配置
- `.gitignore` - 新增 `.turbo` 忽略規則

**完成檢查**
- 確認 `turbo.json` 存在且 JSON 格式正確
- 確認 `package.json` 包含 `workspaces` 欄位

**實作備註**
照預期開發

---

### 遷移 generator 到 packages 目錄

**實作要點**
- 建立 `packages/generator/` 目錄
- 移動現有程式碼：`templates/`、`styles/`、`scripts/` 到 `packages/generator/`
- 在 `packages/generator/` 建立獨立的 `package.json`（名稱：`@supernote-templates/generator`）
- 更新 `scripts/generate-all.js` 和 `scripts/convert-to-png.js` 中的路徑引用（`process.cwd()` 改為相對於 generator 目錄）
- 確保 `dist/` 輸出目錄正確指向 `packages/generator/dist/`

**相關檔案**
- `packages/generator/package.json` - 新建立的 package 配置
- `packages/generator/scripts/generate-all.js` - 更新路徑引用
- `packages/generator/scripts/convert-to-png.js` - 更新路徑引用
- `packages/generator/templates/` - 移動的樣板檔案
- `packages/generator/styles/` - 移動的樣式檔案

**完成檢查**
- 在 `packages/generator/` 目錄執行 `npm run generate`，確認 PNG 產生成功
- 確認產生的 PNG 位於 `packages/generator/dist/` 目錄

**實作備註**
照預期開發

---

### 建立 Next.js 網站骨架

**實作要點**
- 在 `packages/` 目錄下使用 create-next-app 建立專案：
  ```bash
  cd packages
  npx create-next-app@latest web --typescript --eslint --tailwind --app --no-src-dir --no-import-alias --use-npm
  ```
- 修改 `packages/web/package.json`：將 `name` 改為 `@supernote-templates/web`
- 修改 `packages/web/next.config.ts`，新增靜態匯出配置：
  - `output: 'export'`
  - `images: { unoptimized: true }`
  - `trailingSlash: true`
- 簡化首頁內容（`app/page.tsx`）：移除預設樣板，改為簡單的標題和說明文字
- 將 `.next` 加入根目錄 `.gitignore`（如果尚未存在）

**相關檔案**
- `packages/web/package.json` - 更新 name 欄位
- `packages/web/next.config.ts` - 新增靜態匯出配置
- `packages/web/app/page.tsx` - 簡化首頁內容

**完成檢查**
- 在 `packages/web/` 目錄執行 `npm run build`，確認建置成功
- 確認 `packages/web/out/` 目錄產生靜態 HTML 檔案

**實作備註**
<!-- 執行過程中填寫重要的技術決策、障礙和需要傳遞的上下文 -->

---

### 配置 Turborepo 任務管道

**實作要點**
- 在根目錄執行 `npm install` 安裝所有 workspace 依賴
- 配置 `turbo.json` 的 tasks：
  - `generate`：outputs 為 `["dist/**"]`
  - `build`：dependsOn 為 `["^build"]`，outputs 為 `[".next/**", "!.next/cache/**", "out/**"]`
  - `dev`：persistent 為 true，cache 為 false
- 測試 `npm run generate` 從根目錄執行 generator
- 測試 `npm run build` 從根目錄執行所有 build 任務

**相關檔案**
- `turbo.json` - 更新任務管道配置
- `package.json` - 確認根目錄 scripts 正確

**完成檢查**
- 從根目錄執行 `npm run generate`，確認 `packages/generator/dist/` 產生 PNG
- 從根目錄執行 `npm run build`，確認 `packages/web/out/` 產生靜態檔案

**實作備註**
<!-- 執行過程中填寫重要的技術決策、障礙和需要傳遞的上下文 -->

---

### 執行驗收測試

**實作要點**
- 讀取 `acceptance.feature` 檔案
- 逐一執行每個場景的驗證步驟
- 記錄測試結果

**相關檔案**
- `docs/specs/turborepo-migration/acceptance.feature` - Gherkin 格式驗收測試

**實作備註**
<!-- 執行過程中填寫 -->

---

### 更新專案文件

**實作要點**
- 更新 `README.md`：說明新的 monorepo 結構、更新安裝和使用指令
- 更新 `CLAUDE.md`：更新專案結構說明、新增 packages 目錄說明
- 清理根目錄多餘的檔案（如果有的話）

**相關檔案**
- `README.md` - 專案主要說明文件
- `CLAUDE.md` - AI 助手的專案指引文件

**實作備註**
<!-- 執行過程中填寫 -->

---

## 實作參考資訊

### 來自研究文件的技術洞察

> **文件路徑：** `docs/research/2026-01-11-turborepo-monorepo-migration.md`

**Turborepo 工作原理：**
- Turborepo 是「薄層包裝」，不會強制修改現有程式碼
- `apps/` 和 `packages/` 只是慣例命名，技術上沒有差別
- 使用 npm workspaces 的 `workspaces` 欄位來定義 package 位置

**Next.js 靜態匯出限制：**
- 不支援 API Routes、SSR、ISR
- 圖片需要設定 `unoptimized: true`
- 適合部署到 GitHub Pages

### 關鍵配置範例

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

**turbo.json：**
```json
{
  "$schema": "https://turborepo.com/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
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

**packages/web/next.config.js：**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true
}

module.exports = nextConfig
```

### 關鍵技術決策

1. **統一使用 packages 目錄**：不區分 apps 和 packages，所有專案放在 `packages/` 下
2. **保持 generator 獨立運作**：遷移後 generator 仍可獨立執行，不依賴 web
3. **Next.js 靜態匯出**：使用 `output: 'export'` 產生純靜態網站，適合 GitHub Pages 部署
