# language: zh-TW
功能: 模板瀏覽與下載
  作為 Supernote 使用者
  我想要在網站上瀏覽和下載模板
  以便將模板傳輸到我的 Supernote 裝置使用

  背景:
    假設 網站已成功建構並運行
    並且 generator 已產生所有模板的 PNG 檔案

  # ===== 建構流程驗證 =====

  場景: 建構流程自動化
    假設 我在專案根目錄
    當 執行 "npm run build" 指令
    那麼 指令應成功完成無錯誤
    並且 "packages/web/public/templates/nomad/" 目錄應存在
    並且 "packages/web/public/templates/manta/" 目錄應存在
    並且 "packages/web/public/templates/templates.json" 檔案應存在
    並且 templates.json 應包含所有模板的元資料

  # ===== 模板列表頁 =====

  場景: 瀏覽模板列表
    假設 使用 playwright mcp 開啟網站首頁 "/en/"
    當 頁面載入完成
    那麼 應該看到模板網格顯示所有可用模板
    並且 每個模板卡片應顯示預覽圖
    並且 每個模板卡片應顯示模板名稱
    並且 每個模板卡片應顯示模板描述

  場景: 模板列表響應式顯示
    假設 使用 playwright mcp 開啟網站首頁 "/en/"
    當 調整瀏覽器視窗為桌面寬度 (1280px)
    那麼 模板網格應顯示為 3 欄或更多
    當 調整瀏覽器視窗為平板寬度 (768px)
    那麼 模板網格應顯示為 2 欄
    當 調整瀏覽器視窗為手機寬度 (375px)
    那麼 模板網格應顯示為 1 欄

  場景: 模板卡片互動效果
    假設 使用 playwright mcp 開啟網站首頁 "/en/"
    當 將滑鼠移動到任一模板卡片上
    那麼 卡片應顯示 hover 效果
    當 點擊該模板卡片
    那麼 應導向該模板的詳情頁面

  # ===== 模板詳情頁 =====

  場景: 查看模板詳情
    假設 使用 playwright mcp 開啟模板詳情頁 "/en/templates/daily-routine/"
    當 頁面載入完成
    那麼 應該看到較大的模板預覽圖
    並且 應該看到模板名稱 "Daily Routine"
    並且 應該看到模板的完整描述
    並且 應該看到支援的裝置列表 (Nomad, Manta)

  場景: 下載 Nomad 版本模板
    假設 使用 playwright mcp 開啟模板詳情頁 "/en/templates/daily-routine/"
    當 點擊 "Nomad" 下載按鈕
    那麼 瀏覽器應開始下載檔案
    並且 下載的檔案名稱應為 "daily-routine-nomad.png"

  場景: 下載 Manta 版本模板
    假設 使用 playwright mcp 開啟模板詳情頁 "/en/templates/daily-routine/"
    當 點擊 "Manta" 下載按鈕
    那麼 瀏覽器應開始下載檔案
    並且 下載的檔案名稱應為 "daily-routine-manta.png"

  場景: 從詳情頁返回列表
    假設 使用 playwright mcp 開啟模板詳情頁 "/en/templates/daily-routine/"
    當 點擊 "返回列表" 連結
    那麼 應導向首頁模板列表

  # ===== 多語言支援 =====

  場景: 繁體中文介面顯示
    假設 使用 playwright mcp 開啟網站 "/zh-TW/"
    當 頁面載入完成
    那麼 模板名稱應顯示中文 (例如 "每日計畫")
    並且 模板描述應顯示中文內容
    當 點擊任一模板進入詳情頁
    那麼 詳情頁的內容也應顯示中文

  場景: 日文介面顯示
    假設 使用 playwright mcp 開啟網站 "/ja/"
    當 頁面載入完成
    那麼 模板名稱應顯示日文 (例如 "デイリールーティン")
    並且 模板描述應顯示日文內容

  場景: 語言切換功能
    假設 使用 playwright mcp 開啟網站 "/en/"
    當 點擊語言切換器
    並且 選擇 "繁體中文"
    那麼 網址應變更為 "/zh-TW/"
    並且 頁面內容應切換為中文顯示

  # ===== 邊緣案例 =====

  場景: 存取不存在的模板
    假設 使用 playwright mcp 開啟不存在的模板頁面 "/en/templates/non-existent/"
    當 頁面載入完成
    那麼 應顯示 404 錯誤頁面或導向首頁

  # ===== 語言切換器 =====

  場景: 語言切換器使用 shadcn 下拉選單
    假設 使用 playwright mcp 開啟網站首頁 "/en/"
    當 查看語言切換器
    那麼 應該看到下拉選單形式的語言切換器
    當 點擊語言切換器
    那麼 應展開顯示所有可選語言選項 (English, 繁體中文, 日本語)
    當 選擇其中一個語言
    那麼 選單應收合並切換到該語言
