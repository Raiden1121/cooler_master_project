import React, { useState } from "react";

export default function AIDesignPage() {
  const systemPrompt = '請根據以下使用者輸入生成最佳提示：';
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState([]);
  const [imageURL, setImageURL] = useState("");
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);

  const handleFileUpload = (e) => {
    const uploaded = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...uploaded]);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setMessages((prev) => [...prev, prompt]);
    setPrompt("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setImageURL(data.image_url);
      setHistory((prev) => [data.image_url, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen grid grid-cols-[3fr_2fr_1fr] gap-6 bg-white p-6 text-gray-800 overflow-hidden">

      {/* 左側：生成歷史+主圖片 */}
      <div className="flex flex-col border-2 border-orange-500 bg-gray-50 rounded-2xl p-4 overflow-hidden">
        {/* 歷史縮圖列 */}
        <div className="flex gap-2 mb-4 p-2 bg-orange-100 rounded">
          {history.length > 0 ? (
            history.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`歷史${idx + 1}`}
                className="w-8 h-8 object-cover rounded cursor-pointer"
                onClick={() => setImageURL(url)}
              />
            ))
          ) : (
            <span className="text-sm text-orange-500">尚無歷史檔案</span>
          )}
        </div>

        {/* 主圖片展示 */}
        {imageURL ? (
          <img
            src={imageURL}
            alt="AI 生成設計圖"
            className="rounded-xl max-h-[60vh] mx-auto mb-4 object-contain"
          />
        ) : (
          <div className="flex-1 border-2 border-dashed border-orange-400 rounded-xl flex items-center justify-center text-orange-500 text-2xl">
            Design Picture
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="flex justify-around mt-4">
          <button className="w-14 h-14 flex items-center justify-center bg-orange-500 text-white rounded-lg text-2xl">
            ←
          </button>
          <button
            className="w-14 h-14 flex items-center justify-center bg-orange-500 text-white rounded-lg text-2xl"
            onClick={handleGenerate}
          >
            ↻
          </button>
          <button
            className="w-14 h-14 flex items-center justify-center bg-orange-500 text-white rounded-lg text-2xl"
            onClick={() => setImageURL("")}
          >
            ↓
          </button>
        </div>
      </div>

      {/* 中間：Best Prompt */}
      <div className="flex flex-col border-2 border-blue-500 bg-gray-50 rounded-2xl p-4 overflow-hidden">
        <div className="p-3 bg-blue-500 text-white rounded-lg">
          <strong>Best Prompt:</strong>
          <p className="mt-2 whitespace-pre-wrap">{systemPrompt}</p>
        </div>

        {/* 歷史訊息 */}
        <div className="flex-1 bg-white rounded-xl p-4 mt-4 overflow-y-auto space-y-2">
          {messages.map((msg, idx) => (
            <div key={idx} className="text-blue-500 break-words">{`User: ${msg}`}</div>
          ))}
        </div>

        {/* 輸入 prompt */}
        <div className="flex items-center gap-2 mt-4">
          <textarea
            placeholder="輸入你的 prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none resize-none"
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={handleGenerate}
          >
            → Generate
          </button>
        </div>
      </div>

      {/* 右側：上傳圖片與預覽 */}
      <div className="flex flex-col border-2 border-purple-500 bg-gray-50 rounded-2xl p-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-6">
          {files.length > 0 ? (
            files.map((file, idx) => {
              const previewURL = URL.createObjectURL(file);
              return (
                <div key={idx} className="flex items-center gap-4 w-full">
                  <input
                    type="checkbox"
                    id={`file-${idx}`}
                    className="form-checkbox"
                  />
                  <div className="flex flex-col items-center w-full">
                    <img
                      src={previewURL}
                      alt={file.name}
                      className="w-full max-w-[200px] aspect-square object-cover rounded"
                    />
                    <label
                      htmlFor={`file-${idx}`}
                      className="text-sm mt-0.5 break-words text-center"
                    >
                      {file.name}
                    </label>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">尚未上傳任何檔案</p>
          )}
        </div>

        {/* 上傳按鈕 */}
        <label className="w-full flex justify-center items-center py-2 mt-2 bg-purple-500 text-white rounded-lg cursor-pointer">
          上傳檔案
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

    </div>
  );
}
