# README 改善分析研究報告

## 執行摘要

本研究針對 Supernote Templates 專案的 README 文件進行全面分析,目標是確保文件能清楚傳達專案的核心價值:「透過 HTML 技術產生適合 Supernote 電子紙設備的多尺寸樣板」。

經過深入分析後,發現當前 README 存在以下關鍵問題:

1. **首段未能立即傳達使用者價值** - 開頭直接進入技術實作細節,缺乏對「為什麼要用這個專案」的說明
2. **受眾混淆** - 整份文件以開發者視角撰寫,未區分「樣板使用者」和「專案貢獻者」兩種不同讀者
3. **缺乏使用情境說明** - 未解釋為何選擇 HTML 作為樣板製作技術,以及這個選擇帶來的實際好處

本報告建議採用「漏斗式結構」重新組織 README,從使用者價值開始,逐步深入到技術實作,最後才是開發者貢獻指南。

## 背景與脈絡

Supernote Templates 是一個為 Supernote 電子紙設備(Nomad A6 X2 和 Manta A5 X2)產生 PNG 樣板的專案。專案的獨特之處在於採用 HTML/CSS 作為樣板設計語言,透過 Puppeteer 自動轉換成不同尺寸的 PNG 檔案。

這個技術選擇解決了傳統繪圖軟體在樣板製作上的幾個痛點:
- 版本控制困難(二進位檔案難以追蹤差異)
- 多尺寸維護成本高(需手動調整每個尺寸)
- 客製化門檻高(需要專業繪圖技能)

然而,當前的 README 文件並未有效傳達這些價值。專案擁有者反映,使用者「沒辦法一看到專案就知道在幹嘛」,這顯示文件在資訊架構和內容組織上需要改善。

## 研究問題與發現過程

### 初始問題

使用者提出的核心問題是:「README 有沒有改善的空間,想要確保現在的 README 有正確表達這件事情」(指透過 HTML 製作多尺寸電子紙樣板)。

### 釐清問題

透過與使用者的對話,釐清了以下關鍵需求:

1. **目標受眾**: 主要是樣板使用者,次要是開發者貢獻者
2. **核心問題**: 使用者無法快速理解專案用途
3. **內容結構偏好**: 前半部給使用者,後半部給貢獻者
4. **技術說明需求**: 需要解釋為何選擇 HTML,但保持簡潔
5. **HTML 優勢**: 易於版本控制、可用套件匯出 PNG、比繪圖軟體更容易追蹤和修改

### 問題演進

基於這些回應,研究問題從「README 是否正確表達功能」演進為「如何重新組織 README 結構,讓不同受眾都能快速找到所需資訊」。

## 技術分析:深入理解問題

### 現有 README 結構分析

當前 README 採用以下結構:

```
1. 專案標題 + 簡介 (3行技術描述)
2. Features (技術特性列表)
3. Project Structure (檔案結構)
4. Installation (安裝步驟)
5. Usage (使用指令)
6. Developing New Templates (開發新樣板)
7. Adjusting Device Parameters (調整參數)
8. Adding New Devices (新增裝置)
9. Device Specifications (裝置規格)
10. Notes (技術備註)
11. Output Files (輸出檔案說明)
```

#### 問題根源追蹤

這個結構存在以下根本性問題:

**問題一:價值主張不明確**
- 開頭 3 行直接描述技術實作:「Multi-device...supports...Nomad and Manta」、「designed using HTML/CSS」、「converted to PNG using Puppeteer」
- 缺乏回答「為什麼我需要這個?」的內容
- 使用者需要讀完整個 Features 區塊才能隱約理解專案用途

**問題二:受眾混淆**
- 第一個實質章節就是「Project Structure」(開發者視角)
- 「Usage」章節直接跳入 npm 指令,未說明使用情境
- 缺乏「這是什麼/誰適合用/能解決什麼問題」的引導

**問題三:技術說明前置**
- 「Developing New Templates」出現在文件前半部,佔用大量篇幅
- 進階主題(Adding New Devices)與基礎使用說明混雜
- 重要的「為何選擇 HTML」理由被埋藏在 Notes 區塊

**問題四:視覺層級不清**
- 所有章節使用相同層級標題(##)
- 無法快速區分「使用」和「開發」內容
- 缺乏視覺引導幫助不同讀者快速導航

#### 對比業界最佳實踐

根據外部研究,優秀的 README 應遵循以下原則:

1. **開頭 30 秒原則** - README 像書籍封面,應在 30 秒內讓讀者理解專案價值
2. **受眾分段** - 明確區分 end users 和 contributors 的內容
3. **漏斗式結構** - 從「為什麼」到「是什麼」到「怎麼用」到「怎麼改」
4. **視覺化引導** - 使用截圖、示意圖、badges 提升可讀性

當前 README 在這些面向都有改善空間。

### 類似專案參考案例

研究電子紙樣板生態系,發現幾個關鍵洞察:

**商業平台模式**(如 OnPlanners、eInkTemplates):
- 強調「即開即用」的價值主張
- 首頁立即展示範例樣板截圖
- 用簡單語言說明使用流程(選擇 → 下載 → 上傳)

**開源專案模式**(如 reMarkable templates):
- 明確說明裝置相容性和檔案格式要求
- 提供視覺化的安裝步驟
- 區分「使用現成樣板」和「建立新樣板」兩種路徑

本專案可借鑑商業平台的使用者導向表達方式,同時保持開源專案的技術深度。

## 解決方案探索與評估

基於分析結果,提出三種 README 重構方案:

### 方案一:漸進式改善(保持現有結構,調整內容)

**核心理念**: 在不大幅變動結構的前提下,優化各章節內容和順序。

**具體作法**:
- 改寫開頭段落,加入使用者價值說明
- 在 Features 前新增「Why HTML?」說明區塊
- 調整章節順序,將進階開發內容後移
- 為不同受眾添加導航提示

**評估**:
- ✅ 實作簡單,改動範圍小
- ✅ 保持既有讀者的閱讀習慣
- ❌ 受眾混淆問題無法根本解決
- ❌ 結構性問題依然存在

**適用情境**: 時間有限,需要快速改善的情況。

### 方案二:雙文件分離(README + CONTRIBUTING)

**核心理念**: 將 README 定位為使用者文件,建立獨立的 CONTRIBUTING.md 給開發者。

**具體作法**:
- README 聚焦於「什麼是這個專案」、「如何使用樣板」
- 移除所有開發導向內容(Project Structure、Adding New Devices 等)
- 建立 CONTRIBUTING.md 包含所有技術實作細節
- 在 README 結尾提供明確的「貢獻指南」連結

**評估**:
- ✅ 受眾區隔清晰,符合開源專案標準
- ✅ README 變得簡潔,使用者易於理解
- ✅ 開發者有完整的技術文件參考
- ⚠️ 需維護兩份文件
- ⚠️ 某些內容(如 CSS 變數)兩種受眾都需要,可能重複

**適用情境**: 專案成熟度高,有明確的貢獻者社群。

### 方案三:分段式單文件(推薦方案)

**核心理念**: 在單一 README 中明確劃分「使用者區」和「開發者區」,透過視覺層級引導不同讀者。

**具體作法**:

**第一部分:快速理解(給所有讀者)**
- 一句話說明專案用途
- 視覺化範例(樣板截圖)
- 為何選擇 HTML(3-4 點簡短說明)
- 支援的裝置和規格

**第二部分:開始使用(給樣板使用者)**
- 安裝步驟
- 產生樣板的基本指令
- 如何將 PNG 匯入 Supernote
- 簡單的客製化說明(修改 CSS 變數)

**第三部分:開發新樣板(給進階使用者和貢獻者)**
- 專案結構說明
- 完整的樣板開發流程
- CSS 變數系統詳解
- 多裝置支援機制

**第四部分:進階主題(給專案貢獻者)**
- 調整裝置參數
- 新增新裝置
- 技術架構細節

**評估**:
- ✅ 單一文件維護成本低
- ✅ 清楚的視覺分段(使用 `---` 分隔線和不同層級標題)
- ✅ 讀者可自行選擇閱讀深度
- ✅ 保持資訊完整性
- ⚠️ 文件較長,需要良好的導航設計

**適用情境**: 受眾多元,需要在易用性和完整性間取得平衡的專案(符合本專案現況)。

## 建議與決策指引

基於分析結果,**強烈建議採用方案三:分段式單文件結構**。

### 推薦理由

1. **符合專案現狀**: 專案受眾確實包含「使用者」和「貢獻者」兩群,且比例為 7:3,不需要完全分離文件
2. **維護成本最優**: 單一文件降低維護負擔,適合個人或小團隊專案
3. **資訊架構清晰**: 透過分段和視覺層級,兩種讀者都能快速找到所需資訊
4. **保留技術深度**: 不犧牲現有的技術文件品質,僅重新組織位置

### 實施要點

#### 立即行動:重寫開頭部分(前 3-5 段)

目前的開頭:
```markdown
Multi-device Supernote template generator that supports both
Nomad (A6 X2) and Manta (A5 X2) devices. Templates are designed
using HTML/CSS and converted to PNG format using Puppeteer.
```

建議改為:

```markdown
# Supernote Templates

> 用 HTML 設計一次,自動產生適合 Nomad 和 Manta 兩種尺寸的 Supernote 樣板

為 Supernote 電子紙裝置製作客製化筆記樣板的開源工具。只需撰寫簡單的 HTML/CSS,
即可自動產生符合 Nomad (A6 X2) 和 Manta (A5 X2) 螢幕尺寸的 PNG 檔案。

## 為什麼選擇 HTML?

相較於傳統繪圖軟體,使用 HTML 製作樣板有以下優勢:

- **版本控制友善** - 純文字格式,Git 可清楚追蹤每次修改
- **自動化產生** - 一次設計,透過 Puppeteer 自動匯出多種尺寸
- **易於修改** - 調整 CSS 變數即可批次更新所有樣板
- **無需專業工具** - 任何文字編輯器和瀏覽器即可開發和預覽

## 範例樣板

[這裡可以放 1-2 個樣板的截圖]

## 支援裝置

- **Nomad (A6 X2)**: 1404×1872 px, 300 DPI
- **Manta (A5 X2)**: 1920×2560 px, 300 DPI
```

#### 中期規劃:重組文件結構

建議的新結構:

```markdown
# Supernote Templates
[價值主張 + 為何選擇 HTML + 範例截圖]

## 快速開始
[安裝 → 產生樣板 → 匯入裝置]

## 客製化現有樣板
[修改 CSS 變數的簡易指南]

---

## 開發新樣板
[給想要從零建立樣板的使用者]
- 專案結構
- 建立新 HTML 檔案
- 使用 CSS 變數系統
- 產生與測試

## 進階主題
[給專案貢獻者]
- 調整裝置參數
- 新增新裝置支援
- 技術架構說明

## 參考資料
- Device Specifications
- CSS Variables Reference
- Troubleshooting
```

#### 風險監控:避免過度技術化

改寫過程中需注意:
- ❌ 避免:「This project uses a CSS Media Query-based approach...」
- ✅ 改為:「只需調整幾個 CSS 變數,即可改變樣板的顏色、字體大小等設定」
- 技術細節後移至「進階主題」,不在前段出現

### 品質檢核標準

改寫完成後,用以下問題自我檢視:

1. **30 秒測試**: 新讀者能在 30 秒內理解專案用途嗎?
2. **受眾導航**: 使用者和開發者都能快速找到相關章節嗎?
3. **價值傳達**: 「為何選擇 HTML」的優勢有清楚說明嗎?
4. **行動導向**: 讀者知道下一步該做什麼嗎?(安裝 → 使用 → 開發 → 貢獻)

## 下一步行動計畫

### 立即行動(建議在 1 小時內完成)

1. **重寫開頭 3 段**
   - 用一句話總結專案價值
   - 新增「為什麼選擇 HTML?」區塊(4 點列表)
   - 補充支援裝置資訊

2. **新增視覺分隔**
   - 在「Usage」和「Developing New Templates」之間加入 `---` 分隔線
   - 在分隔線上方加入導航提示:「以下內容適合想要建立或修改樣板的開發者」

### 中期目標(可在後續迭代完成)

1. **重組章節順序**
   - 將「Project Structure」移到「開發者區」
   - 將「Device Specifications」移到「參考資料」區塊
   - 合併重複的技術說明

2. **新增使用者導向內容**
   - 撰寫「快速開始」章節,包含完整的使用流程
   - 補充「如何將 PNG 匯入 Supernote」的說明
   - 新增簡易的客製化指南(不涉及程式碼)

3. **改善視覺呈現**
   - 新增樣板截圖展示
   - 為關鍵指令添加註解說明
   - 使用表格整理裝置規格

### 不需要撰寫 PRD

本改善任務屬於文件優化,不涉及程式碼變更,建議直接進行實作。改寫過程可以採用「小步快跑」的方式:
1. 先完成「立即行動」項目,確認方向正確
2. 收集使用者回饋
3. 再進行「中期目標」的全面重構

### 額外調研

如果未來計劃擴大使用者群,可考慮以下調研方向:
- 調查 Supernote 使用者社群的樣板需求(哪些樣板最受歡迎)
- 研究競品(如 reMarkable templates)的文件策略
- 收集新手使用者的實際操作痛點

## 參考資料

### README 最佳實踐

- **GitHub Best README Template** - https://github.com/othneildrew/Best-README-Template
  - 提供完整的 README 模板範例

- **README Best Practices (Tilburg Science Hub)** - 涵蓋專案描述、簡潔性、視覺呈現等原則

- **The Good Docs Project - README Template** - 包含結構化的 README 撰寫指南

### 開發者文件結構

- **Developer Documentation Guide (Archbee)** - 說明如何定義文件受眾和組織內容

- **5 Components of Useful Documentation (Doctave)** - 強調區分使用者和貢獻者文件的重要性

### 電子紙樣板生態

- **eInkTemplates.com** - 商業樣板平台,展示使用者導向的產品說明方式

- **OnPlanners** - 數位規劃器產生工具,可參考其「選擇 → 下載 → 使用」的流程設計

- **reMarkable Templates** - 開源電子紙樣板專案,提供安裝和客製化指南參考

## 附錄:具體改寫範例

### 現有版本 vs 建議版本對比

**現有 Features 章節:**
```markdown
## Features

- **Multi-device support**: Automatically generates templates for Nomad (1404×1872) and Manta (1920×2560)
- **Shared style system**: CSS Media Query-based approach for consistent styling across devices
- **Automatic scanning**: Batch generation automatically detects all templates in the `templates/` directory
- **Easy to extend**: Add new devices or templates with minimal configuration
```

**建議改寫(使用者視角):**
```markdown
## 主要功能

- 🎨 **一次設計,雙裝置通用** - 自動產生 Nomad 和 Manta 兩種尺寸
- ⚙️ **簡單客製化** - 修改幾個 CSS 變數即可調整樣式
- 🔄 **批次產生** - 自動掃描所有樣板並一次產生所有檔案
- 📏 **易於擴充** - 未來新增其他裝置支援也很容易
```

### 新增「快速開始」章節範例

```markdown
## 快速開始

### 1. 安裝

確保已安裝 Node.js (v14 或更高版本),然後執行:

```bash
npm install
```

### 2. 產生樣板

執行以下指令,專案會自動掃描 `templates/` 目錄中的所有樣板,
並產生對應的 PNG 檔案:

```bash
npm run generate
```

產生的檔案位於:
- `dist/nomad/` - Nomad 裝置用的樣板
- `dist/manta/` - Manta 裝置用的樣板

### 3. 匯入 Supernote

將 `dist/` 資料夾中的 PNG 檔案複製到您的 Supernote 裝置:

1. 連接 Supernote 到電腦
2. 開啟 Supernote 儲存空間
3. 將 PNG 檔案複製到 `MyStyles/` 資料夾
4. 在 Supernote 上選擇新樣板開始使用

### 4. 簡單客製化(可選)

想要調整樣板的字體大小或邊界?編輯 `styles/devices.css` 中的變數:

```css
:root {
    --font-size-lg: 44px;      /* 大標題字體 */
    --font-size-md: 32px;      /* 一般文字 */
    --safe-area-bottom: 150px; /* 底部安全邊界 */
}
```

修改後重新執行 `npm run generate` 即可。
```

這個「快速開始」章節使用簡單的語言,不預設讀者有程式背景,並提供完整的使用流程。
