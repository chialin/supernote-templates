# Priority-Todo 模板：Other Tasks 區域動態填滿解決方案研究

## 執行摘要

本研究針對 priority-todo 模板在不同裝置尺寸下的 Other Tasks 區域填滿問題進行深入分析。目前模板是針對 Nomad (1404×1872) 設計，使用固定 16 行的 Other Tasks，在 Manta (1920×2560) 較大螢幕上會留下大量空白。

經過全面調查與技術評估，我們識別出五種可行的解決方案：

- **CSS Flexbox 方案**：利用 `flex-grow` 自動填滿剩餘空間（最推薦）
- **CSS Grid 方案**：使用 Grid 自動生成符合空間的行數
- **JavaScript 動態生成**：根據可用空間計算並動態插入行元素
- **CSS Container Queries 方案**：基於容器高度調整佈局
- **混合方案**：保留一行 HTML + JavaScript 動態複製

每個方案都有其優缺點，但考量到專案的靜態 PNG 生成特性、維護簡易度和瀏覽器相容性，**CSS Flexbox 方案**是最理想的選擇。

## 背景與脈絡

### 專案特性

這是一個基於 HTML/CSS 的 Supernote 電子紙裝置模板生成器。專案的核心流程是：撰寫一次 HTML/CSS 模板，透過 Puppeteer 自動將其轉換為針對不同裝置尺寸的 PNG 檔案。

目前支援兩種裝置：
- **Nomad (A6 X2)**：1404×1872 像素
- **Manta (A5 X2)**：1920×2560 像素

兩者皆為 300 DPI，因此字體大小、安全區域等共用相同的 CSS 變數，僅裝置寬高透過 media query 覆寫。

### 問題描述

priority-todo 模板包含兩個區塊：
1. **Priority Tasks**：3 個大型待辦項目（每行高度 140px）
2. **Other Tasks**：16 個次要待辦項目（每行高度 70px）

這個設計在 Nomad 上剛好填滿整個螢幕，但在 Manta 的較大螢幕上，Other Tasks 結束後會留下約 688px 的空白區域（Manta 高度 2560px vs Nomad 高度 1872px）。

### 設計目標

使用者希望 Other Tasks 區域能夠自動填滿剩餘空間，但**保持每行高度不變**（70px），因為這是次要工作區，行高已經適中。這意味著我們需要在較大裝置上自動增加 Other Tasks 的行數。

## 研究問題與發現過程

### 初始需求分析

使用者提出了兩個初步想法：
1. **JavaScript 方案**：保留一行 HTML，用 JavaScript 偵測空間並動態生成所需的行數
2. **CSS 方案**：研究是否有純 CSS 方法達到相同效果

### 研究範圍擴展

在研究過程中，我們擴展了探索範圍，發現還有其他三種可行方案：
3. **CSS Flexbox 方案**：利用 flex-grow 特性填滿空間
4. **CSS Grid 方案**：使用 Grid 的自動佈局功能
5. **CSS Container Queries**：基於容器尺寸的現代 CSS 特性

因此，本研究最終涵蓋了五種解決方案的深入比較與評估。

## 技術分析：深入理解問題

### 程式碼庫現況探索

#### 當前架構

[templates/priority-todo.html](../templates/priority-todo.html) 使用 Flexbox 佈局：

```css
.container {
    display: flex;
    flex-direction: column;
    height: 100%;  /* 填滿裝置高度 */
}

.todos {
    display: flex;
    flex-direction: column;
    flex: 1;  /* 填滿剩餘空間 */
}

.todo-item {
    flex-shrink: 0;  /* 禁止收縮 */
    height: 140px;   /* Priority Tasks */
}

.todo-item.secondary {
    height: 70px;    /* Other Tasks */
}
```

HTML 中手動定義了 16 個 `.todo-item.secondary` 元素（第 194-257 行）。

#### 轉換流程

[scripts/convert-to-png.js](../scripts/convert-to-png.js) 使用 Puppeteer：
1. 設定 viewport 為裝置尺寸
2. 載入 HTML (`waitUntil: 'networkidle0'`)
3. 直接截圖為 PNG

#### 裝置配置

[styles/devices.css](../styles/devices.css) 定義共用變數和裝置特定尺寸：
- 字體大小：44px (large), 24px (medium), 10px (small)
- 安全區域：上 30px, 右 30px, 下 150px, 左 150px
- 裝置尺寸透過 media query 覆寫

### 問題根源追蹤

#### 根本原因

1. **固定行數設計**：HTML 中硬編碼了 16 行 Other Tasks
2. **針對單一裝置最佳化**：16 行是根據 Nomad 螢幕計算出的最佳數量
3. **空間計算差異**：Manta 高度多了 688px，約可容納 9-10 行額外的 Other Tasks

#### 空間計算驗證

讓我們驗證實際的剩餘空間：

```
Nomad 高度：1872px
Manta 高度：2560px
高度差異：688px

固定元素高度：
- Header 區域：約 90px
- 安全區域（上下）：30px + 150px = 180px
- Priority Tasks Section Header：約 40px
- Priority Tasks（3行 × 140px）：420px
- Other Tasks Section Header：約 40px

Other Tasks 可用空間：
Nomad：1872 - 180 - 90 - 40 - 420 - 40 = 1102px
  → 1102 ÷ 70 = 15.7 行（16 行剛好）

Manta：2560 - 180 - 90 - 40 - 420 - 40 = 1790px
  → 1790 ÷ 70 = 25.6 行（可容納 25 行）
```

因此 Manta 理論上可以多容納約 9 行 Other Tasks。

#### 技術限制

1. **靜態 PNG 輸出**：Puppeteer 截圖時，DOM 必須已經完全渲染
2. **無使用者互動**：截圖是一次性操作，無法依賴執行時的動態調整
3. **瀏覽器環境限制**：Puppeteer 使用 Chromium，需確保 CSS 特性相容

### 業界智慧與最佳實踐

#### CSS Flexbox 填滿空間

根據 Stack Overflow 和 MDN 文件，Flexbox 的標準做法是使用 `flex-grow: 1` 讓元素填滿剩餘空間。但這通常用於**單一元素**填滿空間，而非**生成多個固定高度的項目**填滿空間。

關鍵概念：
- `flex: 1` = `flex-grow: 1; flex-shrink: 1; flex-basis: 0`
- 子元素會依照 flex-grow 比例分配剩餘空間
- 若要防止收縮，需設定 `flex-shrink: 0`

#### CSS Grid Auto-Fill

CSS Grid 提供 `repeat(auto-fill, minmax(min, max))` 語法，可自動填滿空間：

```css
grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
```

**重要發現**：`auto-fill` 主要用於**橫向（欄位）**佈局，對於**縱向（列）**佈局支援較為有限。CSS Grid 的 `grid-template-rows` 不支援 `auto-fill`，只能透過 `grid-auto-rows` 定義自動生成的列高度。

#### JavaScript 動態生成

Puppeteer 的 `page.waitForFunction()` 可在截圖前執行 JavaScript 並等待特定條件：

```javascript
await page.waitForFunction(() => {
    return document.querySelector('.rendering-complete-flag');
});
```

這確保了動態生成的元素能在截圖前完全渲染。

#### CSS Container Queries（2025 最新技術）

Container Queries 是 2025 年已廣泛支援的新特性（93.6% 瀏覽器支援），允許根據**父容器尺寸**而非 viewport 調整樣式：

```css
.container {
    container-type: size;  /* 啟用容器查詢 */
}

@container (min-height: 2000px) {
    /* 針對較高容器的樣式 */
}
```

**重要限制**：`container-type: size` 會導致容器高度塌陷，需要明確設定高度。對於我們的場景（容器已經是 `height: 100%`），這不是問題。

## 解決方案探索與評估

### 方案一：CSS Flexbox 動態填滿（推薦）

#### 核心理念

利用 Flexbox 的 `flex-grow` 特性，在 HTML 中保留足夠多的 Other Tasks 行（例如 30 行），然後讓 `.todos` 容器使用 `flex: 1` 填滿剩餘空間，每行固定高度 70px。額外的行會自然地超出容器並被隱藏（透過 `overflow: hidden`）。

等等，這個方法有問題——多餘的行會超出畫面。

#### 修正方案

更好的做法是：**保持足夠的行數在 HTML 中，讓它們自然填滿空間**，不需要隱藏。由於 `.todos` 已經設定 `flex: 1`，它會自動佔據所有可用空間。我們只需要：

1. 在 HTML 中增加 Other Tasks 到足夠數量（例如 30 行，超過 Manta 所需）
2. 使用裝置特定的 CSS 來控制實際顯示的行數

#### 實作方式

**方案 1A：使用 CSS 選擇器隱藏多餘行**

```css
/* 預設（Nomad）：顯示前 16 行 */
.todo-item.secondary:nth-child(n+17) {
    display: none;
}

/* Manta：顯示前 25 行 */
@media (min-width: 1920px) and (min-height: 2560px) {
    .todo-item.secondary:nth-child(n+17) {
        display: flex;  /* 覆寫隱藏 */
    }
    .todo-item.secondary:nth-child(n+26) {
        display: none;  /* 隱藏第 26 行之後 */
    }
}
```

HTML 中準備 30 行，透過 CSS 控制不同裝置顯示的數量。

**方案 1B：使用固定容器高度**

另一個更簡潔的方法是讓 Other Tasks 區域有固定的「可見高度」，多餘的行自然不會被渲染：

```css
.other-tasks-container {
    height: calc(100% - [固定元素總高度]);
    overflow: hidden;  /* 隱藏溢出內容 */
}
```

但這需要精確計算固定元素高度，較不靈活。

#### 評估

**優點：**
- ✅ 純 CSS 解決方案，無需 JavaScript
- ✅ 實作簡單，只需增加 HTML 行數和少量 CSS
- ✅ 維護容易，新增裝置只需新增 media query
- ✅ 瀏覽器相容性完美（Flexbox 是成熟技術）
- ✅ Puppeteer 無需額外等待，DOM 在載入時即完成

**缺點：**
- ⚠️ HTML 中會有「隱藏」的元素（但在截圖中看不到）
- ⚠️ 需要為每個裝置手動計算最佳行數
- ⚠️ 新增裝置時需更新 CSS

**實作複雜度：** ⭐⭐ 低
**維護影響：** ⭐⭐ 低
**風險等級：** ⭐ 極低（技術成熟）

---

### 方案二：CSS Grid Auto-Placement

#### 核心理念

使用 CSS Grid 的自動佈局功能，將 Other Tasks 容器改為 Grid，並定義固定的行高。Grid 會自動將子元素排列到新行。

#### 實作方式

```css
.other-tasks-container {
    display: grid;
    grid-auto-rows: 70px;  /* 固定行高 */
    grid-template-columns: 1fr;  /* 單欄 */
    gap: 0;
}
```

HTML 中準備足夠多的 `.todo-item.secondary`（例如 30 行），Grid 會自動排列它們，超出容器的部分會被隱藏。

#### 限制

CSS Grid 的 `grid-template-rows` **不支援** `repeat(auto-fill, 70px)` 語法。`auto-fill` 只能用於 `grid-template-columns`（橫向佈局）。

對於縱向佈局，Grid 只能透過 `grid-auto-rows` 定義自動生成的行高，但**無法自動計算需要多少行來填滿空間**。

#### 評估

**優點：**
- ✅ 純 CSS 解決方案
- ✅ Grid 語意更清晰（列表式內容）

**缺點：**
- ❌ **無法自動計算填滿空間所需的行數**（關鍵限制）
- ⚠️ 仍需手動控制每個裝置的行數（與 Flexbox 方案相同）
- ⚠️ Grid 的學習曲線較高

**實作複雜度：** ⭐⭐⭐ 中
**維護影響：** ⭐⭐⭐ 中
**風險等級：** ⭐⭐ 低

**結論：** Grid 方案在此場景下沒有優於 Flexbox 的地方，反而更複雜。**不推薦**。

---

### 方案三：JavaScript 動態生成行數

#### 核心理念

這是使用者提出的原始方案之一。HTML 中只保留一行 Other Tasks 作為模板，用 JavaScript 計算可用空間並動態複製生成足夠的行數。

#### 實作方式

**步驟 1：在 HTML 中加入 JavaScript**

```html
<script>
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.todos');
    const template = document.querySelector('.todo-item.secondary');
    const rowHeight = 70;  // 每行高度

    // 計算可用高度
    const containerHeight = container.clientHeight;
    const existingContent = Array.from(container.children)
        .reduce((sum, el) => sum + el.offsetHeight, 0);
    const availableHeight = containerHeight - existingContent;

    // 計算需要的行數
    const neededRows = Math.floor(availableHeight / rowHeight);

    // 動態生成行
    for (let i = 0; i < neededRows; i++) {
        const clone = template.cloneNode(true);
        container.appendChild(clone);
    }

    // 設定完成標記（供 Puppeteer 等待）
    document.body.setAttribute('data-render-complete', 'true');
});
</script>
```

**步驟 2：修改 Puppeteer 腳本**

在 [scripts/convert-to-png.js](../scripts/convert-to-png.js) 中加入等待邏輯：

```javascript
// 載入頁面後
await page.goto(fileUrl, { waitUntil: 'networkidle0' });

// 等待動態渲染完成
await page.waitForFunction(() => {
    return document.body.getAttribute('data-render-complete') === 'true';
}, { timeout: 5000 });

// 截圖
await page.screenshot({ ... });
```

#### 評估

**優點：**
- ✅ **真正的動態計算**，自動適應任何裝置尺寸
- ✅ HTML 最簡潔（只需一行模板）
- ✅ 新增裝置無需修改任何程式碼
- ✅ 理論上最靈活

**缺點：**
- ❌ 引入 JavaScript 依賴（專案原本是純 CSS）
- ❌ 需要修改 Puppeteer 腳本（增加等待邏輯）
- ⚠️ 增加除錯複雜度（需確保 JS 在截圖前執行完成）
- ⚠️ 若 JS 執行失敗，會導致截圖只有一行 Other Tasks
- ⚠️ 效能略差（需要 DOM 操作和重新渲染）

**實作複雜度：** ⭐⭐⭐⭐ 較高（需同時修改 HTML 和 Puppeteer）
**維護影響：** ⭐⭐⭐ 中（引入新的維護點）
**風險等級：** ⭐⭐⭐ 中（JS 執行失敗風險）

**結論：** 雖然最靈活，但違反了專案的「簡單」哲學（純 CSS/HTML）。除非未來需要支援**大量不同尺寸的裝置**，否則不建議使用此方案。

---

### 方案四：CSS Container Queries

#### 核心理念

使用 2025 年已成熟的 Container Queries 技術，根據 `.todos` 容器的實際高度調整 Other Tasks 的顯示數量。

#### 實作方式

```css
.todos {
    container-type: size;
    container-name: todos-container;
}

/* 預設：顯示 16 行（Nomad） */
.todo-item.secondary:nth-child(n+17) {
    display: none;
}

/* 當容器高度 > 1500px 時顯示更多行（Manta） */
@container todos-container (min-height: 1500px) {
    .todo-item.secondary:nth-child(n+17) {
        display: flex;
    }
    .todo-item.secondary:nth-child(n+26) {
        display: none;
    }
}
```

#### 優勢與限制

**理論優勢：**
- 基於**實際容器大小**而非裝置 viewport
- 更語意化（關注的是內容區域，而非裝置）

**實際限制：**
- ⚠️ `container-type: size` 會導致容器高度塌陷，需要明確設定 `height`
- ⚠️ 在我們的場景中，`.todos` 已經是 `flex: 1`，高度由父容器決定，不會塌陷
- ⚠️ 但仍需要計算「容器高度臨界值」（與 media query 計算裝置高度類似）

**瀏覽器相容性：**
- ✅ 2025 年支援率 93.6%（包括 Chrome/Edge/Safari/Firefox）
- ✅ Puppeteer 使用的 Chromium 完全支援

#### 評估

**優點：**
- ✅ 純 CSS 解決方案
- ✅ 語意更清晰（基於容器而非裝置）
- ✅ 理論上更靈活（若內容佈局變化，自動適應）

**缺點：**
- ⚠️ 較新技術，團隊可能不熟悉
- ⚠️ 在此場景下優勢不明顯（容器高度 = 裝置高度）
- ⚠️ 除錯較困難（Container Queries 的 DevTools 支援較弱）

**實作複雜度：** ⭐⭐⭐ 中
**維護影響：** ⭐⭐⭐ 中
**風險等級：** ⭐⭐ 低（技術已成熟）

**結論：** 技術上可行，但在此專案中**沒有明顯優於 media query** 的地方。若團隊不熟悉 Container Queries，建議優先使用 Flexbox + media query 方案。

---

### 方案五：混合方案（保留一行 + JavaScript 複製）

#### 核心理念

這是使用者提出的第一個方案的精確實作。HTML 中只保留**一行** Other Tasks，用 JavaScript 偵測空間並複製生成所需行數。

#### 與方案三的差異

- **方案三**：計算可用空間，精確生成所需行數
- **方案五**：保留一行作為「種子」，持續複製直到填滿空間

#### 實作方式

```html
<div class="todos">
    <div class="section-header">OTHER TASKS</div>
    <div class="todo-item secondary" id="other-task-template">
        <div class="checkbox"></div>
        <div class="todo-line"></div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.todos');
    const template = document.getElementById('other-task-template');
    const rowHeight = 70;

    // 持續複製直到填滿空間
    while (container.scrollHeight <= container.clientHeight) {
        const clone = template.cloneNode(true);
        clone.removeAttribute('id');  // 避免重複 ID
        container.appendChild(clone);
    }

    // 移除最後一個（超出的行）
    const lastItem = container.querySelector('.todo-item.secondary:last-child');
    if (lastItem && container.scrollHeight > container.clientHeight) {
        lastItem.remove();
    }

    document.body.setAttribute('data-render-complete', 'true');
});
</script>
```

#### 評估

**優點：**
- ✅ 真正動態，自動適應任何裝置
- ✅ HTML 最精簡（只有一行種子）
- ✅ 新增裝置零修改

**缺點：**
- ❌ 引入 JavaScript 複雜度
- ❌ 需要修改 Puppeteer（與方案三相同）
- ❌ while 迴圈可能影響效能（持續 DOM 操作）
- ⚠️ 除錯較困難（需觀察 scrollHeight 變化）

**實作複雜度：** ⭐⭐⭐⭐ 較高
**維護影響：** ⭐⭐⭐ 中
**風險等級：** ⭐⭐⭐ 中

**結論：** 與方案三類似，雖然最靈活但增加了複雜度。不建議作為首選。

---

## 方案比較總表

| 方案 | 實作複雜度 | 維護成本 | 風險 | 靈活性 | 推薦度 |
|------|-----------|---------|------|--------|--------|
| 方案一：Flexbox + CSS 選擇器 | ⭐⭐ 低 | ⭐⭐ 低 | ⭐ 極低 | ⭐⭐⭐ 中 | ⭐⭐⭐⭐⭐ |
| 方案二：CSS Grid | ⭐⭐⭐ 中 | ⭐⭐⭐ 中 | ⭐⭐ 低 | ⭐⭐ 低 | ⭐⭐ |
| 方案三：JS 動態生成 | ⭐⭐⭐⭐ 高 | ⭐⭐⭐ 中 | ⭐⭐⭐ 中 | ⭐⭐⭐⭐⭐ 極高 | ⭐⭐⭐ |
| 方案四：Container Queries | ⭐⭐⭐ 中 | ⭐⭐⭐ 中 | ⭐⭐ 低 | ⭐⭐⭐⭐ 高 | ⭐⭐⭐ |
| 方案五：一行 + JS 複製 | ⭐⭐⭐⭐ 高 | ⭐⭐⭐ 中 | ⭐⭐⭐ 中 | ⭐⭐⭐⭐⭐ 極高 | ⭐⭐ |

---

## 建議與決策指引

### 推薦方案：Flexbox + CSS 選擇器（方案一）

基於以下考量，強烈建議採用**方案一**：

#### 主要考量因素

1. **專案哲學契合**：專案核心是「簡單的 HTML/CSS 模板」，方案一完全符合這個理念，無需引入 JavaScript

2. **裝置數量有限**：目前只有 Nomad 和 Manta 兩個裝置，未來也不太可能暴增到需要「完全動態」的程度

3. **維護成本最低**：新增裝置只需：
   - 在 HTML 增加足夠的行數（一次性操作）
   - 在 CSS 增加一個 media query（5-10 行程式碼）

4. **零風險**：Flexbox 是成熟技術，Puppeteer 無需修改，不會有執行失敗的風險

5. **效能最佳**：DOM 在載入時即完成，無需等待 JavaScript 執行

#### 實作建議

**步驟 1：修改 HTML**

在 [templates/priority-todo.html](../templates/priority-todo.html) 中，將 Other Tasks 行數從 16 行增加到 30 行（足夠覆蓋未來可能的更大裝置）。

**步驟 2：加入 CSS 控制**

在 `<style>` 區塊加入：

```css
/* 預設（Nomad）：只顯示前 16 行 */
.section-header ~ .todo-item.secondary:nth-child(n+17) {
    display: none;
}

/* Manta：顯示前 25 行 */
@media (min-width: 1920px) and (min-height: 2560px) {
    .section-header ~ .todo-item.secondary:nth-child(n+17) {
        display: flex;  /* 覆寫隱藏 */
    }
    .section-header ~ .todo-item.secondary:nth-child(n+26) {
        display: none;  /* 隱藏第 26 行之後 */
    }
}
```

**注意事項：**
- 使用 `.section-header ~ .todo-item.secondary` 選擇器，確保只針對 OTHER TASKS 區域的項目
- 第 17 行開始是因為：1 個 section-header + 16 個 todo-item = 第 17 個開始隱藏
- Manta 的行數（25）是根據空間計算得出，可依實際測試微調

**步驟 3：生成並測試**

```bash
npm run generate
```

檢查 `dist/nomad/priority-todo.png` 和 `dist/manta/priority-todo.png` 確認效果。

### 替代方案：JavaScript 動態生成（未來需求變化時考慮）

若未來出現以下情況，可考慮切換到**方案三**（JavaScript 動態生成）：

- 需要支援 5 個以上的不同裝置尺寸
- 裝置尺寸變化頻繁，手動維護 CSS 成本過高
- 需要更精細的空間利用（例如，根據其他內容動態調整）

但在那之前，保持簡單最重要。

---

## 下一步行動計畫

### 立即行動

1. **實作方案一**：
   - 修改 [templates/priority-todo.html](../templates/priority-todo.html)
   - 增加 Other Tasks 到 30 行
   - 加入 CSS 選擇器控制顯示數量

2. **測試驗證**：
   - 執行 `npm run generate`
   - 檢查兩個裝置的輸出 PNG
   - 確認 Nomad 仍是 16 行，Manta 增加到約 25 行

3. **微調行數**：
   - 根據實際截圖效果，調整 Manta 的顯示行數
   - 確保最後一行不會被截斷

### 中期規劃

- **建立裝置行數計算文件**：記錄如何計算每個裝置的最佳 Other Tasks 行數，方便未來新增裝置時參考

### 不建議的行動

- ❌ 不需要撰寫 PRD（這是簡單的 CSS 調整）
- ❌ 不需要重構整個佈局系統
- ❌ 暫時不需要引入 JavaScript

---

## 參考資料

### CSS 技術文件

- [MDN - CSS Flexible Box Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout)
- [MDN - :nth-child() selector](https://developer.mozilla.org/en-US/docs/Web/CSS/:nth-child)
- [CSS-Tricks - A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

### CSS Grid 參考

- [MDN - CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)
- [CSS-Tricks - Auto-Sizing Columns: auto-fill vs auto-fit](https://css-tricks.com/auto-sizing-columns-css-grid-auto-fill-vs-auto-fit/)

### Container Queries

- [MDN - CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [Can I Use - CSS Container Queries](https://caniuse.com/css-container-queries)

### Puppeteer 參考

- [Puppeteer API - page.waitForFunction()](https://pptr.dev/api/puppeteer.page.waitforfunction)
- [Puppeteer Guide - Waiting for Elements](https://scrapeops.io/puppeteer-web-scraping-playbook/nodejs-puppeteer-waiting-page-element-load/)

### 專案內部文件

- [CLAUDE.md](../CLAUDE.md) - 專案架構說明
- [README.md](../README.md) - 使用者文件
- [.github/copilot-instructions.md](../.github/copilot-instructions.md) - 開發指引
