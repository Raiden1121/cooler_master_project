
# 📄 AIDesignPage API Document

## 📚 API 總覽

| 功能                           | Method | Path                        | 說明                                   |
|--------------------------------|--------|-----------------------------|--------------------------------------|
| 上傳圖片至後端                  | POST   | `/upload`                   | 上傳圖片（Base64編碼），回傳檔案 ID  |
| 生成圖片                        | POST   | `/generate`                 | 傳送 prompt 與附加圖片 ID，產生新圖片 |
| 重新生成圖片（使用 bestPrompt） | POST   | `/generate`                 | 用上次生成的最佳提示重生一張圖片     |
| 測試 Lambda 連線（非主要流程）   | POST   | `/predict`                  | 測試用 API                           |

---

## 📤 1. 上傳檔案 API

- **URL**
  ```
  POST https://jetcaa3x74.execute-api.us-west-2.amazonaws.com/prod/upload
  ```

- **Request Body**
  ```json
  {
    "filename": "example.jpg",
    "image_base64": "Base64編碼的圖片資料"
  }
  ```

- **Response**
  ```json
  {
    "fileId": "上傳後S3儲存的檔案ID"
  }
  ```

- **說明**
  - 將圖片轉成 Base64 字串後上傳。
  - 回傳的 `fileId` 用來後續生成圖片時附加圖片。

---

## 🎨 2. 生成圖片 API

- **URL**
  ```
  POST https://jetcaa3x74.execute-api.us-west-2.amazonaws.com/prod/generate
  ```

- **Request Body**
  ```json
  {
    "prompt": "設計一款未來主義風格的機殼",
    "images": ["fileId1", "fileId2"]
  }
  ```

- **Response**
  ```json
  {
    "imageUrl": "生成出來的新圖片網址",
    "bestPrompt": "AI優化後的最佳提示"
  }
  ```

- **說明**
  - 傳入 `prompt`（必要）及附加圖片 `images`（選填）。
  - 回傳新生成的圖片網址及 AI 優化後的最佳提示語。

---

## ♻️ 3. 重新生成圖片 API

> 使用上次後端回傳的 `bestPrompt` 直接重生一張新的圖片。

- **URL**
  ```
  POST https://jetcaa3x74.execute-api.us-west-2.amazonaws.com/prod/generate
  ```

- **Request Body**
  ```json
  {
    "prompt": "上次後端提供的 bestPrompt",
    "images": ["fileId1", "fileId2"]
  }
  ```

- **Response**
  與生成圖片回傳格式相同。

- **說明**
  - 前端不再要求使用者重新輸入文字。
  - 直接使用上一次回傳的 `bestPrompt` 來產生新的圖片。

---

## 🛠 4. 測試 Lambda 連線 API（非主要功能）

- **URL**
  ```
  POST https://jetcaa3x74.execute-api.us-west-2.amazonaws.com/prod/predict
  ```

- **Request Body**
  ```json
  {
    "input": "測試資料"
  }
  ```

- **Response**
  ```json
  {
    "result": "Lambda回傳的結果"
  }
  ```

- **說明**
  - 用來測試 Lambda 服務是否正常運作。
  - 不影響主要的圖片生成流程。

---

## 🖼️ 圖片 URL 路徑規則

- 上傳圖片成功後，圖片會被放到：
  ```
  https://s3.us-west-2.amazonaws.com/generate.imagenfile/uploads/{fileId}.jpg
  ```

---

## 🚀 系統流程簡述

1. **使用者輸入 prompt** ➡️ 按下「Generate」。
2. **前端呼叫 `/generate`** ➡️ 拿到 `imageUrl` & `bestPrompt`。
3. **畫面更新，顯示生成圖片**。
4. **使用者若要重新生成** ➡️ 按下「Rotate」(用 `bestPrompt` 重新呼叫 `/generate`)。
5. **使用者可上傳圖片** ➡️ 呼叫 `/upload`，再選取要一起送出的圖片。
6. **所有歷史生成圖片僅存在於前端**（刷新頁面會消失）。
