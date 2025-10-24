# HTML to PNG Converter

這個 script 會將 `daily-tasks.html` 轉換成 1404 × 1872 px 的 PNG 圖片。

## 安裝

1. 確保你已安裝 Node.js (v14 或以上)
2. 在此目錄執行：
   ```bash
   npm install
   ```

## 使用方法

執行以下命令來生成 PNG：

```bash
npm run convert
```

或直接運行：

```bash
node convert-to-png.js
```

生成的 PNG 檔案會存在同一目錄，名為 `daily-tasks.png`

## 輸出

- 檔名: `daily-tasks.png`
- 尺寸: 1404 × 1872 px
- 格式: PNG (含透明度)
