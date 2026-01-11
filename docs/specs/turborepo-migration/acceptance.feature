# language: zh-TW
功能: Turborepo Monorepo 遷移
  作為 開發者
  我想要 將專案轉換為 Turborepo monorepo 架構
  以便 同時管理 PNG 產生器和展示網站

  背景:
    假設 專案已完成 Turborepo 遷移
    並且 所有依賴已安裝完成

  場景: 根目錄執行 build 指令建置所有專案
    假設 我在專案根目錄
    當 執行 "npm run build" 指令
    那麼 指令應該成功執行（exit code 0）
    並且 "packages/generator/dist/nomad/" 目錄應該包含 PNG 檔案
    並且 "packages/generator/dist/manta/" 目錄應該包含 PNG 檔案
    並且 "packages/web/out/" 目錄應該存在
    並且 "packages/web/out/index.html" 檔案應該存在

  場景: generator 可獨立執行
    假設 我在 "packages/generator" 目錄
    當 執行 "npm run build" 指令
    那麼 指令應該成功執行（exit code 0）
    並且 "dist/" 目錄應該包含產生的 PNG 檔案

  場景: web 可獨立建置
    假設 我在 "packages/web" 目錄
    當 執行 "npm run build" 指令
    那麼 指令應該成功執行（exit code 0）
    並且 "out/" 目錄應該包含靜態 HTML 檔案

  場景: Turborepo 快取正常運作
    假設 我在專案根目錄
    並且 已經執行過一次 "npm run build"
    當 再次執行 "npm run build" 指令
    那麼 應該看到 "FULL TURBO" 或快取命中的訊息
    並且 執行時間應該明顯縮短
