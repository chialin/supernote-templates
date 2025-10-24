# language: zh-TW
功能: Supernote 多裝置模板生成系統
  作為 Supernote 模板開發者
  我想要支援 Nomad 和 Manta 兩種裝置
  以便使用者在不同裝置上都能使用品質一致的模板

  背景:
    假設 專案已安裝所有依賴套件
    並且 已建立完整的目錄結構（styles/, templates/, scripts/, dist/）

  場景: 共用樣式系統建立成功
    假設 存在檔案 "styles/devices.css"
    當 讀取該檔案內容
    那麼 應該包含共用字體大小定義（--font-size-lg: 44px, --font-size-md: 24px, --font-size-sm: 10px）
    並且 應該包含共用安全區域定義（--safe-area-bottom: 150px, --safe-area-left: 150px）
    並且 應該包含 Nomad 預設尺寸定義（--device-width: 1404px, --device-height: 1872px）
    並且 應該包含 Manta Media Query（@media (min-width: 1920px) and (min-height: 2560px)）
    並且 Manta Media Query 中只應包含尺寸定義（--device-width: 1920px, --device-height: 2560px）
    並且 Manta Media Query 中不應重複定義字體大小和安全區域（使用共用變數）

  場景: 模板使用共用樣式系統
    假設 存在檔案 "templates/daily-tasks.html"
    當 讀取該檔案內容
    那麼 應該引入樣式表 "../styles/devices.css"
    並且 body 元素應使用 "var(--device-width)" 和 "var(--device-height)"
    並且 應使用 CSS 變數定義字體大小（var(--font-size-lg), var(--font-size-md), var(--font-size-sm)）
    並且 應使用 CSS 變數定義 padding（var(--safe-area-top), var(--safe-area-right), var(--safe-area-bottom), var(--safe-area-left)）

  場景: 轉換腳本支援多裝置參數
    假設 存在檔案 "scripts/convert-to-png.js"
    當 讀取該檔案內容
    那麼 應該定義 deviceConfigs 物件包含 nomad 和 manta 配置
    並且 nomad 配置應為 { width: 1404, height: 1872 }
    並且 manta 配置應為 { width: 1920, height: 2560 }
    並且 convertHtmlToPng 函數應接受 htmlPath 和 deviceId 兩個參數
    並且 應根據 deviceId 動態設定 viewport 和 screenshot 尺寸

  場景: 批次生成腳本正確配置
    假設 存在檔案 "scripts/generate-all.js"
    當 讀取該檔案內容
    那麼 應該使用 fs.readdirSync() 或類似方法自動掃描 templates/ 目錄
    並且 應該過濾出所有 .html 檔案
    並且 應該定義 devices 陣列包含 ['nomad', 'manta']
    並且 應該使用雙層迴圈遍歷所有模板檔案和裝置組合
    並且 不應包含硬編碼的 templates 陣列

  場景: package.json 包含正確的 npm scripts
    假設 存在檔案 "package.json"
    當 讀取該檔案內容並解析為 JSON
    那麼 scripts 欄位應包含 "generate" 指令
    並且 scripts 欄位應包含 "generate:nomad" 指令
    並且 scripts 欄位應包含 "generate:manta" 指令

  場景: 生成 Nomad 裝置模板
    假設 專案已完成所有重構
    當 執行指令 "node scripts/convert-to-png.js templates/daily-tasks.html nomad"
    那麼 應該成功執行不報錯
    並且 應該生成檔案 "dist/nomad/daily-tasks.png"
    並且 該檔案應為有效的 PNG 圖片
    並且 圖片尺寸應為 1404×1872 像素

  場景: 生成 Manta 裝置模板
    假設 專案已完成所有重構
    當 執行指令 "node scripts/convert-to-png.js templates/daily-tasks.html manta"
    那麼 應該成功執行不報錯
    並且 應該生成檔案 "dist/manta/daily-tasks.png"
    並且 該檔案應為有效的 PNG 圖片
    並且 圖片尺寸應為 1920×2560 像素

  場景: 批次生成所有模板和裝置組合
    假設 專案已完成所有重構
    並且 templates/ 目錄下有多個 HTML 檔案
    當 執行指令 "npm run generate"
    那麼 應該成功執行不報錯
    並且 應該自動掃描 templates/ 目錄下所有 .html 檔案
    並且 應該為每個 HTML 檔案生成 Nomad 和 Manta 兩個版本
    並且 應該生成檔案 "dist/nomad/daily-tasks.png"
    並且 應該生成檔案 "dist/manta/daily-tasks.png"
    並且 所有生成的檔案都應為有效的 PNG 圖片

  場景: 新增模板自動被掃描
    假設 專案已完成所有重構
    並且 templates/ 目錄下已有 "daily-tasks.html"
    當 在 templates/ 目錄新增檔案 "weekly-plan.html"
    並且 執行指令 "npm run generate"
    那麼 應該自動掃描並生成 "dist/nomad/weekly-plan.png"
    並且 應該自動掃描並生成 "dist/manta/weekly-plan.png"
    並且 無需修改 generate-all.js 程式碼

  場景: 瀏覽器中測試 Media Query 切換
    假設 在瀏覽器中開啟 "templates/daily-tasks.html"
    當 設定瀏覽器視窗大小為 1404×1872
    那麼 body 尺寸應為 1404×1872 像素
    並且 字體大小應為 44px/24px/10px（所有裝置相同）
    當 設定瀏覽器視窗大小為 1920×2560
    那麼 body 尺寸應為 1920×2560 像素
    並且 字體大小應仍為 44px/24px/10px（保持相同物理尺寸）

  場景: README 文件完整性
    假設 存在檔案 "README.md"
    當 讀取該檔案內容
    那麼 應該說明專案結構
    並且 應該說明如何開發新模板
    並且 應該說明如何調整裝置參數
    並且 應該列出可用的 npm scripts

  場景: .gitignore 正確配置
    假設 存在檔案 ".gitignore"
    當 讀取該檔案內容
    那麼 應該包含 "dist/" 目錄
    並且 應該包含 "node_modules/" 目錄

  場景: 目錄結構完整性
    假設 專案已完成所有重構
    那麼 應該存在目錄 "styles/"
    並且 應該存在目錄 "templates/"
    並且 應該存在目錄 "scripts/"
    並且 應該存在目錄 "dist/nomad/"
    並且 應該存在目錄 "dist/manta/"
