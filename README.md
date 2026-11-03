# 2026 宇宙科技公司員工旅遊

活動報名網站原始碼與 Google Apps Script 試算表整合程式。

## Google 試算表與報名服務

1. 在 Apps Script 專案新增 `Code.gs`，貼上本專案同名檔案內容。
2. 開啟 `doGet` 一次，授權試算表及雲端硬碟存取；這會建立 `2026_公司旅遊` 試算表及標題列。
3. 建立新的網頁應用程式部署，執行身分選「我」，存取權選「所有人」，完成 Google 授權。
4. 將部署網址填入 `app.js` 的 `SCRIPT_URL`，重新推送網站變更。

電話欄會以文字格式儲存，避免前導零或其他格式被試算表自動轉換。

## GitHub Pages

GitHub Pages 網址：https://jfm1208.github.io/2026_company_trip/
