# IR Report

介入放射科結構化英文報告工具。同步自 Sites 第 20 版，來源 commit：`7db01ed973ef57651c224f6b151fbe27c67cea3a`。

## 使用

以靜態 HTTP 伺服器開啟 `dist/`：

```sh
python -m http.server 8765 --directory dist
```

瀏覽 http://localhost:8765 。本工具僅在頁面記憶體處理個案報告。

## 驗證

使用 Node.js 執行專案中的 `verify*.cjs`。本次同步檢查結果為 13 支通過、4 支未通過：`verify-defaults.cjs`、`verify-picks.cjs`、`verify-revision.cjs`、`verify.cjs`。保留上線版本的原始程式與測試，未於上傳時修改功能。

包含原始碼、靜態資源、片語選項 Excel、Sites hosting 設定與驗證腳本；不含連線憑證或個案資料。
