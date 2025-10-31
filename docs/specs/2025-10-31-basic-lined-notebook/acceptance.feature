# language: zh-TW
功能: 基礎橫線筆記本樣板
  作為 Supernote 使用者
  我想要一個簡單的橫線筆記本樣板
  以便我可以像使用傳統筆記本一樣自由書寫各種筆記

  背景:
    假設 專案目錄結構完整且 templates 資料夾存在
    並且 styles/devices.css 檔案存在並包含正確的裝置變數
    並且 scripts/auto-fill-rows.js 檔案存在

  場景: FR-1 - 橫線顯示
    假設 templates/lined-notebook.html 檔案已建立
    並且 HTML 檔案中包含橫線的 CSS 樣式
    當 開啟 HTML 檔案檢查 CSS 定義
    那麼 應該有 .line 類別定義
    並且 橫線應設定為黑色實線（border-bottom: 1px 或 2px solid #000）
    並且 行高應設定為 94px

  場景: FR-2 - Nomad 裝置行數標準
    假設 templates/lined-notebook.html 檔案已建立
    當 執行 npm run generate:nomad 生成 Nomad 版本
    那麼 應該成功生成 dist/nomad/lined-notebook.png 檔案
    並且 使用圖像處理工具或目視檢查，橫線數量應該約為 18 條
    並且 每條線的間距應該均勻一致

  場景: FR-3 - 多裝置支援
    假設 templates/lined-notebook.html 檔案已建立
    當 執行 npm run generate:nomad 生成 Nomad 版本
    並且 執行 npm run generate:manta 生成 Manta 版本
    那麼 應該成功生成 dist/nomad/lined-notebook.png 檔案
    並且 應該成功生成 dist/manta/lined-notebook.png 檔案
    並且 Nomad PNG 檔案尺寸應為 1404×1872 像素
    並且 Manta PNG 檔案尺寸應為 1920×2560 像素

  場景: FR-4 - 安全區域遵守
    假設 templates/lined-notebook.html 檔案已建立
    並且 HTML 中的容器使用了安全區域 padding
    當 檢查 CSS 樣式中的 padding 設定
    那麼 容器的 padding 應該使用 CSS 變數：
      """
      padding: var(--safe-area-top) var(--safe-area-right) var(--safe-area-bottom) var(--safe-area-left);
      """
    並且 上方安全區域應為 30px
    並且 右方安全區域應為 30px
    並且 下方安全區域應為 150px
    並且 左方安全區域應為 150px

  場景: FR-5 - 全頁填充
    假設 templates/lined-notebook.html 檔案已建立
    當 執行 npm run generate 生成所有裝置版本
    那麼 目視檢查生成的 PNG 檔案
    並且 橫線應該填滿整個安全區域的可用高度
    並且 最下方的橫線不應該被工具列遮擋
    並且 應該沒有明顯的空白區域（超過一行的高度）

  場景: FR-6 - 視覺一致性
    假設 dist/nomad/lined-notebook.png 和 dist/manta/lined-notebook.png 已生成
    當 使用圖像檢視器開啟兩個 PNG 檔案
    那麼 橫線的粗細在兩個裝置上應該看起來一致
    並且 橫線的顏色應該都是黑色
    並且 由於兩裝置 DPI 相同（300 DPI），物理尺寸應該相同

  場景: AC-1 - 視覺正確性
    假設 templates/lined-notebook.html 檔案已建立並生成 PNG
    當 檢查 dist/nomad/lined-notebook.png
    那麼 應該顯示約 18 條清晰的黑色橫線
    並且 橫線間距應該均勻一致
    當 檢查 dist/manta/lined-notebook.png
    那麼 應該顯示約 25 條清晰的黑色橫線
    並且 橫線間距應該均勻一致

  場景: AC-2 - 空間利用
    假設 生成的 PNG 檔案存在
    當 目視檢查 dist/nomad/lined-notebook.png 和 dist/manta/lined-notebook.png
    那麼 第一條線不應該太靠近上邊緣（應有約 30px 安全區域）
    並且 最後一條線不應該被底部工具列遮擋（應有約 150px 安全區域）
    並且 橫線應該填滿安全區域內的可用空間

  場景: AC-3 - 多裝置一致性
    假設 執行 npm run generate 命令
    當 批次生成完成
    那麼 dist/nomad/lined-notebook.png 應該存在
    並且 dist/manta/lined-notebook.png 應該存在
    並且 兩個檔案的視覺效果應該保持一致（考量 DPI）
    並且 不應該有任何生成錯誤

  場景: AC-4 - 可用性驗證
    假設 生成的 PNG 檔案已開啟
    當 目視檢查橫線的視覺效果
    那麼 橫線應該清晰可見，適合書寫
    並且 橫線不應該過於粗重或搶眼
    並且 整體視覺應該乾淨簡潔

  場景: AC-5 - 技術實作驗證
    假設 templates/lined-notebook.html 檔案已建立
    當 執行 npm run generate 命令
    那麼 應該成功生成 dist/nomad/lined-notebook.png
    並且 應該成功生成 dist/manta/lined-notebook.png
    並且 檔案大小應該在合理範圍內（< 1MB）
    並且 HTML 檔案應該引用 ../styles/devices.css
    並且 HTML 檔案應該使用 ../scripts/auto-fill-rows.js
    並且 程式碼應該符合專案現有的架構模式

  場景: 動態行生成機制驗證
    假設 templates/lined-notebook.html 包含動態行生成腳本
    當 檢查 HTML 原始碼
    那麼 應該有 setupAutoFillRows 函式呼叫
    並且 containerId 應該設定為容器的 id
    並且 templateId 應該設定為樣板橫線的 id
    並且 rowHeight 應該設定為 94
    當 在瀏覽器中開啟 HTML 檔案
    那麼 應該看到動態生成的多條橫線
    並且 橫線應該填滿可見區域

  場景: 批次生成工具自動偵測
    假設 templates/lined-notebook.html 檔案已建立
    當 執行 npm run generate 命令
    那麼 generate-all.js 應該自動掃描並發現 lined-notebook.html
    並且 應該為 Nomad 和 Manta 兩個裝置各生成一個 PNG 檔案
    並且 生成摘要應該顯示成功生成 2 個檔案
