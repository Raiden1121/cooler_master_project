import React, { useState } from "react"; // 引入 React 核心與狀態管理 Hook
import { Button } from "../components/ui/button"; // 自訂按鈕元件
import { Card, CardContent } from "../components/ui/card"; // 自訂卡片元件
import { Textarea } from "../components/ui/textarea"; // 多行文字輸入元件
import { Upload } from "lucide-react"; // 上傳檔案圖示

// AIDesignPage：主頁面元件，提供 AI 設計功能
export default function AIDesignPage() {
  // prompt: 使用者輸入的設計靈感或描述
  const [prompt, setPrompt] = useState("");
  // imageURL: 後端返回的生成圖片位址
  const [imageURL, setImageURL] = useState("");
  // aiResponse: AI 回應文字（例如生成中、結果或反饋狀態）
  const [aiResponse, setAIResponse] = useState("");

  // 處理生成圖片按鈕事件：呼叫 /api/generate 並更新狀態
  const handleGenerate = async () => {
    setAIResponse("Generating your design..."); // 顯示「生成中」訊息
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setImageURL(data.image_url); // 設定後端回傳的圖片 URL
    setAIResponse("Here is your AI-generated design."); // 顯示結果訊息
  };

  // 處理使用者對生成圖片的回饋（接受或拒絕），並清空圖片預覽
  const handleFeedback = async (accepted) => {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, image_url: imageURL, accepted }),
    });
    setAIResponse(accepted ? "Design saved." : "Design rejected.");
    setImageURL(""); // 清空圖片，返回預設文字
  };

  // 處理上傳草圖事件：將上傳標記追加到 prompt 中，用於後端風格引導
  const handleFileUpload = (e) => {
    setPrompt((prev) => prev + " [Sketch uploaded]");
  };

  // JSX 結構：使用 Tailwind CSS 建立雙欄布局
  return (
    <div className="grid grid-cols-2 gap-6 p-6 min-h-screen bg-neutral-50">
      {/* 左欄：顯示 AI 生成的設計圖片及回饋按鈕 */}
      <div className="flex flex-col items-center justify-center border-2 border-orange-300 p-4 rounded-2xl bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-orange-500 mb-4">Design Picture</h2>
        {imageURL ? (
          <>  {/* 如果有圖片 URL，就顯示圖片與❑✔按鈕 */}
            <img src={imageURL} alt="Generated" className="rounded-xl mb-4 max-h-96" />
            <div className="flex gap-4">
              <Button onClick={() => handleFeedback(true)} className="bg-green-500">✔</Button>
              <Button onClick={() => handleFeedback(false)} className="bg-red-500">✘</Button>
            </div>
          </>
        ) : (
          <p className="text-gray-400">AI 生成圖片將顯示在這裡</p>
        )}
      </div>

      {/* 右欄：輸入 prompt、生成按鈕、上傳草圖及 AI 回應 */}
      <div className="flex flex-col gap-4 border-2 border-blue-400 p-4 rounded-2xl bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-blue-600">Cooler Master AI Design</h2>
        <Textarea
          placeholder="Enter your idea or prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)} // 更新 prompt
          className="min-h-[120px]"
        />
        <div className="flex items-center gap-4">
          <Button onClick={handleGenerate} className="bg-blue-600 text-white">
            Generate
          </Button>
          {/* 上傳草圖按鈕：隱藏 input，只顯示圖示與文字 */}
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <Upload className="w-4 h-4" /> Upload Sketch
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
        <Card>
          <CardContent className="text-sm p-4 text-gray-600">
            <strong>AI:</strong> {aiResponse || "等待生成結果..."}  {/* 顯示 AI 回應 */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}