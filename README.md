# IR Report

介入放射科結構化英文報告工具。

## 使用

以靜態 HTTP 伺服器開啟 `dist/`：

```sh
python -m http.server 8765 --directory dist
```

瀏覽 http://localhost:8765 。本工具僅在頁面記憶體處理個案報告。

## 驗證

使用 Node.js 執行專案中的 `verify*.cjs`。

原始碼同步自既有 IR Report Sites 專案；不包含連線憑證或個案資料。
